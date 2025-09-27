import {
  createServer as createViteServer,
  isRunnableDevEnvironment,
} from "vite";

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "custom",
});

Deno.serve(async (req) => {
  try {
    const template = await vite.transformIndexHtml(
      req.url,
      `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <body><!--ssr-outlet--></body>
        </html>
      `,
    );
    const ssrEnv = vite.environments.ssr;
    if (!isRunnableDevEnvironment(ssrEnv)) {
      throw new Error('The "ssr" environment is not a runnable environment.');
    }
    const { render } = await ssrEnv.runner.import(
      "./src/entry.server.ts",
    );
    const appHtml = await render(req.url);
    const html = template.replace(`<!--ssr-outlet-->`, appHtml);
    return new Response(html, { headers: { "content-type": "text/html" } });
  } catch (e) {
    vite.ssrFixStacktrace(e as Error);
    return Response.error();
  }
});

import fs from "node:fs";
import path from "node:path";

import {
  createServer as createViteServer,
  isRunnableDevEnvironment,
} from "vite";

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "custom",
});

Deno.serve(async (req) => {
  const url = req.url;

  try {
    let template = fs.readFileSync(
      path.resolve(import.meta.dirname ?? "", "index.html"),
      "utf-8",
    );
    template = await vite.transformIndexHtml(url, template);
    const ssrEnv = vite.environments.ssr;

    // Type guard to ensure the environment has a module runner.
    if (!isRunnableDevEnvironment(ssrEnv)) {
      throw new Error('The "ssr" environment is not a runnable environment.');
    }

    const { render } = await ssrEnv.runner.import(
      "./src/entry.server.ts",
    );
    const appHtml = await render(url);
    const html = template.replace(`<!--ssr-outlet-->`, appHtml);
    return new Response(html, { headers: { "content-type": "text/html" } });
  } catch (e) {
    vite.ssrFixStacktrace(e as Error);
    return Response.error();
  }
});

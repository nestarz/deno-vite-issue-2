import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import connect from "connect";
import {
  createServer as createViteServer,
  isRunnableDevEnvironment,
} from "vite";

const app = connect();

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "custom",
});

app.use(vite.middlewares);

app.use(async (req, res, next) => {
  const url = req.originalUrl;

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
    res.end(html);
  } catch (e) {
    vite.ssrFixStacktrace(e as Error);
    next(e);
  }
});

http.createServer(app).listen(3004, () => {
  console.log("Server running at http://localhost:3004");
});

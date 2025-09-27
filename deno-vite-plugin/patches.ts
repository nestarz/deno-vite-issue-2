import type { Plugin } from "vite";
import * as babel from "npm:@babel/core";
import { cjsPlugin } from "./patches/commonjs.ts";
import { JS_REG, JSX_REG } from "./mod.ts";

// @ts-ignore Workaround for https://github.com/denoland/deno/issues/30850
const { default: babelReact } = await import("npm:@babel/preset-react");

export function patches(): Plugin {
  let isDev = false;

  return {
    name: "fresh:patches",
    sharedDuringBuild: true,
    config(_, env) {
      isDev = env.command === "serve";
    },
    applyToEnvironment() {
      return true;
    },
    transform: {
      filter: {
        id: JS_REG,
      },
      handler(code, id, options) {
        const presets = [];
        if (!options?.ssr && JSX_REG.test(id)) {
          presets.push([babelReact, {
            runtime: "automatic",
            importSource: "react",
            development: isDev,
          }]);
        }

        const env = isDev ? "development" : "production";

        const plugins: babel.PluginItem[] = [
          cjsPlugin,
        ];

        const res = babel.transformSync(code, {
          filename: id,
          babelrc: false,
          compact: true,
          plugins,
          presets,
        });

        if (res?.code) {
          return {
            code: res.code,
            map: res.map,
          };
        }
      },
    },
  };
}

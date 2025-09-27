import { defineConfig } from "vite";
import { deno } from "./deno-vite-plugin/mod.ts";

export default defineConfig({
  plugins: [
    deno(),
  ],
});

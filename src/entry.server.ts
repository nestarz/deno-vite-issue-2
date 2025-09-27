import { idFromA } from "./component-a.ts";
import { idFromB } from "./component-b.ts";

export function render(url: string) {
  const areSame = idFromA === idFromB;

  console.log(`[entry.server.ts] ID from bare specifier:  ${idFromA}`);
  console.log(`[entry.server.ts] ID from npm: specifier:  ${idFromB}`);
  console.log(`[entry.server.ts] Are instances the same? ${areSame}`);

  return `
    <h1>CJS Double Load MRE</h1>
    <p>URL: ${url}</p>
    <div id="app">
      <p>ID from 'my-cjs-module': <code>${idFromA}</code></p>
      <p>ID from 'npm:my-cjs-module@^1.0.0': <code>${idFromB}</code></p>
      <hr />
      <p>Are they the same instance? <strong>${areSame}</strong></p>
      ${
    !areSame ? `<p style="color: red;">The module was loaded twice!</p>` : ""
  }
    </div>
  `;
}

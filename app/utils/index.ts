const SOURCE = {
  'skypack': 'cdn.skypack.dev',
  'jspm': 'jspm.dev'
}

const PKG = "jspm.dev";

import { currentImportPackage } from "../store";

import lf from "localforage";

export const db = lf.createInstance({
  name: "esbin",
});

export const importHelper = async (pkgName, source = PKG) => {
  const url = `https://${source}/${pkgName}`;
  currentImportPackage.set(pkgName);
  const pkg = await import(url);
  currentImportPackage.set(null);
  return pkg;
};

export function jspmPlugin({ types: t }) {
  return {
    visitor: {
      ImportDeclaration(path) {
        const value = path.node.source.value;
        if (
          [".", "/"].map((prefix) => !value.startsWith(prefix)).every(Boolean)
        ) {
          path.node.source = t.stringLiteral(`https://${SOURCE.skypack}/${value}`);
        }
      },
      CallExpression(path) {
        if (path.node.callee.type === "Import") {
          const value = path.node.arguments[0].value;
          if (
            [".", "/"].map((prefix) => !value.startsWith(prefix)).every(Boolean)
          ) {
            path.node.arguments[0] = t.stringLiteral(`https://${SOURCE.skypack}/${value}`);
          }
        }
      },
    },
  };
}

export async function transformCSS(source) {
  const postcss = (await importHelper("postcss")).default;
  const autoprefixer = (await importHelper("autoprefixer")).default;
   const begin = performance.now();
   const processor = postcss([autoprefixer]);
   const result = processor.process(source);
   const end = performance.now();
   return {
     transformTime: end - begin,
     css: result.css,
   };
}

export async function transformJS(source): Promise<{ transformTime: number, js: string }> {
  const babel = await importHelper("@babel/core");
  const presetReact = await importHelper("@babel/preset-react");

  const begin = performance.now();
  return new Promise ((res, rej) => {
    babel.transform(
      source,
      {
        plugins: [jspmPlugin],
        presets: [presetReact.default],
      },
      (err, result) => {
        if (err) {
          rej(err)
        } else {
          const end = performance.now();
          res({
            transformTime: end - begin,
            js: result.code,
          });
        }
      }
    );
  })
}

export const makeHTML = (css, js) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          ${css}
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script type="module">${js}</script>
      </body>
    </html>
  `;
};

export const defaultJSCode = `// import any npm packages here, it will import the ES Module version (thanks jspm.dev)
  
import React from 'react'
const root = document.querySelector('#root')
root.textContent = 'Loading...'
const App = () => <div>Hello ESbin</div>
async function init() {
  // You can dynamic import
  const { render } = await import('react-dom')
  render(<App />, root)
}
init()`;

export const defaultCSSCode = `body {
  color: teal;
  font-size: 24px;
  font-weight: bold;
}`
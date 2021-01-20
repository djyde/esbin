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
          path.node.source = t.stringLiteral(`https://${PKG}/${value}`);
        }
      },
      CallExpression(path) {
        if (path.node.callee.type === "Import") {
          const value = path.node.arguments[0].value;
          if (
            [".", "/"].map((prefix) => !value.startsWith(prefix)).every(Boolean)
          ) {
            path.node.arguments[0] = t.stringLiteral(`https://${PKG}/${value}`);
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

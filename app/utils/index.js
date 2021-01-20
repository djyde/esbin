const PKG = 'jspm.dev'
import { currentImportPackage } from '../store'

export const importHelper = async (pkgName) => {
  const url = `https://${PKG}/${pkgName}`;
  currentImportPackage.set(pkgName)
  const pkg = await import(url)
  currentImportPackage.set(null)
  return pkg
};

export function jspmPlugin({ types: t }) {
  return {
    visitor: {
      ImportDeclaration(path) {
        const value = path.node.source.value;
        if (
          [".", "/"]
            .map((prefix) => !value.startsWith(prefix))
            .every(Boolean)
        ) {
          path.node.source = t.stringLiteral(
            `https://${PKG}/${value}`
          );
        }
      },
      CallExpression(path) {
        if (path.node.callee.type === "Import") {
          const value = path.node.arguments[0].value
          if (
            [".", "/"]
              .map((prefix) => !value.startsWith(prefix))
              .every(Boolean)
          ) {
            path.node.arguments[0] = t.stringLiteral(
              `https://${PKG}/${value}`
            );
          }
        }
      },
    },
  };
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
        <div id="root" />
        <script type="module">${js}</script>
      </body>
    </html>
  `;
}

const PKG = 'jspm.dev'

export const importHelper = (pkgName) => {
  return `https://${PKG}/${pkgName}`;
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

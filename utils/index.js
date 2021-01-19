export const importHelper = (pkgName) => {
  return `//jspm.dev/${pkgName}`;
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
            `//jspm.dev/${value}`
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
              `//jspm.dev/${value}`
            );
          }
        }
      },
    },
  };
}

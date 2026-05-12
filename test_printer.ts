import ts from "typescript";

const source = `
export interface User {
  id: string; // The user ID
  name: string;
}

export function foo() {
  // Inner comment
  const x = {
    a: 1,
    b: 2
  }; /* trailing */
}
`;

const file = ts.createSourceFile("test.ts", source, ts.ScriptTarget.Latest, true);
const printer = ts.createPrinter({ removeComments: true });

console.log(printer.printNode(ts.EmitHint.Unspecified, file.statements[0], file));
console.log(printer.printNode(ts.EmitHint.Unspecified, file.statements[1], file));

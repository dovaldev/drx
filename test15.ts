import * as ts from "typescript";
const source = `export const useColumnSizingVars = <TData>({ table }: { table: Table<TData> }) => { }`;
const fileTs = ts.createSourceFile("test.ts", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
const fileTsx = ts.createSourceFile("test.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

function printNode(node: ts.Node, indent = "") {
  console.log(indent + ts.SyntaxKind[node.kind]);
  ts.forEachChild(node, child => printNode(child, indent + "  "));
}
console.log("--- TS ---");
printNode(fileTs);
console.log("--- TSX ---");
printNode(fileTsx);

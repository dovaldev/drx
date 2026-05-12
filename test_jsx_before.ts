import ts from "typescript";
const code = "const a = 1; return <div/>; const b = Array<T>; const c = <T>(x: T) => x; const d = a < b;";
const sf = ts.createSourceFile("test.tsx", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const printer = ts.createPrinter();
console.log(printer.printFile(sf));

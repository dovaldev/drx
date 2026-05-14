import ts from "typescript"
const source = "'use client';\nimport { useState } from 'react';"
const sf = ts.createSourceFile("test.ts", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
for (const stmt of sf.statements) {
  console.log(ts.SyntaxKind[stmt.kind])
  if (ts.isExpressionStatement(stmt)) {
    console.log("expr kind:", ts.SyntaxKind[stmt.expression.kind])
    if (ts.isStringLiteral(stmt.expression)) {
      console.log("isStringLiteral! text:", stmt.expression.text)
    }
  }
}

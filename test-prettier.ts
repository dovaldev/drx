import prettier from "prettier"
const source = `const x = 1;\n(async () => {})()`
prettier.format(source, { parser: "typescript", semi: false }).then(console.log)

import { compressTsx } from "./src/compress.js"
import { parseDrx } from "./src/parser.js"
import { generateProgram } from "./src/compiler.js"
import { defaultConfig } from "./src/config.js"
import fs from "fs"

const source = fs.readFileSync("page-original.tsx", "utf8")
const drx = compressTsx(source, defaultConfig, { file: "page.tsx" })
const ast = parseDrx(drx, defaultConfig)
console.log(generateProgram(ast, { ...defaultConfig, generatedHeader: true }, "src-drx/app/page.tsx.drx").slice(0, 100))

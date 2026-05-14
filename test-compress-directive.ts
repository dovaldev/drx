import { compressTsx } from "./src/compress.js"
import { defaultConfig } from "./src/config.js"
import fs from "fs"

const source = fs.readFileSync("../examples/saas-starter/app/(dashboard)/dashboard/general/page.tsx", "utf8")
console.log(compressTsx(source, defaultConfig, { file: "page.tsx" }))

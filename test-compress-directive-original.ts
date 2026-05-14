import { compressTsx } from "./src/compress.js"
import { defaultConfig } from "./src/config.js"
import fs from "fs"

const source = fs.readFileSync("avatar-original.tsx", "utf8")
console.log(compressTsx(source, defaultConfig, { file: "avatar.tsx" }))

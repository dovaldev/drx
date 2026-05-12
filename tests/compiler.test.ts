import { describe, expect, it } from "vitest"
import { compileDrx } from "../src/compiler.js"
import { defaultConfig } from "../src/config.js"
import { DrxError } from "../src/errors.js"

describe("compileDrx", () => {
  it("compiles state, jsx-lite classes, events and tag aliases", async () => {
    const output = await compileDrx(
      `"use client"

ed fn Counter()
  st count = 0

  ui
    <m .min-h-screen>
      <p>"Valor: " {count}</p>
      <btn .px-4 @click={() => setCount(count + 1)}>"Sumar"</btn>
    </m>
`,
      { ...defaultConfig, generatedHeader: false }
    )

    expect(output).toContain(`import { useState } from "react"`)
    expect(output).toContain(`const [count, setCount] = useState(0)`)
    expect(output).toContain(`<main className="min-h-screen">`)
    expect(output).toContain(`<button className="px-4" onClick={() => setCount(count + 1)}>`)
  })

  it("compiles import aliases and expression props", async () => {
    const output = await compileDrx(
      `i Link f nl
i {Search,FileText} f lc

ed fn Page()
  ui
    <Link href="/app">
      <Search .size-4 />
      "Ir"
    </Link>
`,
      { ...defaultConfig, generatedHeader: false }
    )

    expect(output).toContain(`import Link from "next/link"`)
    expect(output).toContain(`import { FileText, Search } from "lucide-react"`)
    expect(output).toContain(`<Search className="size-4" />`)
  })

  it("throws on unknown event aliases", async () => {
    await expect(
      compileDrx(
        `ed fn Page()
  ui
    <btn @clik=save>"Guardar"</btn>
`,
        defaultConfig
      )
    ).rejects.toBeInstanceOf(DrxError)
  })

  it("compiles named exported functions", async () => {
    const output = await compileDrx(
      `ex fn Button({children})
  ui
    <btn .px-4>{children}</btn>
`,
      { ...defaultConfig, generatedHeader: false }
    )

    expect(output).toContain(`export function Button({ children })`)
    expect(output).toContain(`<button className="px-4">{children}</button>`)
  })

  it("compiles multi-line function header", async () => {
    const output = await compileDrx(
      `ex fn CustomI18nProvider({
  locale,
  messages,
  children
})
  ui
    <div>{children}</div>
`,
      { ...defaultConfig, generatedHeader: false }
    )

    expect(output).toContain(`export function CustomI18nProvider({ locale, messages, children })`)
    expect(output).toContain(`<div>{children}</div>`)
  })

  it("compiles function header with parenthesis on new lines", async () => {
    const output = await compileDrx(
      `ex fn Button(
  props
)
  ui
    <button />
`,
      { ...defaultConfig, generatedHeader: false }
    )

    expect(output).toContain(`export function Button(props)`)
    expect(output).toContain(`<button />`)
  })
})

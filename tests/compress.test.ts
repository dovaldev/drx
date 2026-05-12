import { describe, expect, it } from "vitest"
import { compressTsx } from "../src/compress.js"
import { defaultConfig } from "../src/config.js"

describe("compressTsx", () => {
  it("compresses a simple React component into DRX", () => {
    const drx = compressTsx(
      `"use client"

import { useState } from "react"
import Link from "next/link"

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <main className="min-h-screen grid place-items-center">
      <p>Valor: {count}</p>
      <button className="px-4 py-2" onClick={() => setCount(count + 1)}>
        Sumar
      </button>
      <Link href="/app">Ir</Link>
    </main>
  )
}
`,
      defaultConfig
    )

    expect(drx).toContain(`"use client"`)
    expect(drx).toContain(`i {uS} f r`)
    expect(drx).toContain(`i Link f nl`)
    expect(drx).toContain(`ed fn Counter()`)
    expect(drx).toContain(`st count = 0`)
    expect(drx).toContain(`<m .min-h-screen .grid .place-items-center>`)
    expect(drx).toContain(`<btn .px-4 .py-2 @click={() => setCount(count + 1)}>`)
    expect(drx).toContain(`<Link href="/app">"Ir"</Link>`)
  })

  it("compresses mixed imports, named exported functions and arrow components", () => {
    const drx = compressTsx(
      `import React, { useEffect, useState } from "react"

export function Badge({ label }: { label: string }) {
  return <span className="rounded px-2">{label}</span>
}

const Card = ({ title }) => (
  <section className="p-6">
    <h2>{title}</h2>
  </section>
)
`,
      defaultConfig
    )

    expect(drx).toContain(`i React f r`)
    expect(drx).toContain(`i {uE,uS} f r`)
    expect(drx).toContain(`ex fn Badge({ label }: { label: string; })`)
    expect(drx).toContain(`<sp .rounded .px-2>{label}</sp>`)
    expect(drx).toContain(`fn Card({ title })`)
    expect(drx).toContain(`<s .p-6>`)
  })

  it("keeps side-effect and type imports as raw", () => {
    const drx = compressTsx(
      `import "nextra-theme-blog/style.css"
import type { AppProps } from "next/app"

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
`,
      defaultConfig
    )

    expect(drx).toContain(`raw\n\n  import "nextra-theme-blog/style.css";`)
    expect(drx).toContain(`raw\n\n  import type { AppProps } from "next/app";`)
    expect(drx).toContain(`ed fn App({ Component, pageProps }: AppProps)`)
    expect(drx).toContain(`<Component {...pageProps} />`)
  })
})

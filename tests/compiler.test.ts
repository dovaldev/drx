import { describe, expect, it } from "vitest";
import { compileDrx } from "../src/compiler.js";
import { defaultConfig } from "../src/config.js";
import { DrxError } from "../src/errors.js";

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
      { ...defaultConfig, generatedHeader: false },
    );

    expect(output).toContain(`import { useState } from "react"`);
    expect(output).toContain(`const [count, setCount] = useState(0)`);
    expect(output).toContain(`<main className="min-h-screen">`);
    expect(output).toContain(
      `<button className="px-4" onClick={() => setCount(count + 1)}>`,
    );
  });

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
      { ...defaultConfig, generatedHeader: false },
    );

    expect(output).toContain(`import Link from "next/link"`);
    expect(output).toContain(`import { FileText, Search } from "lucide-react"`);
    expect(output).toContain(`<Search className="size-4" />`);
  });

  it("throws on unknown event aliases", async () => {
    await expect(
      compileDrx(
        `ed fn Page()
  ui
    <btn @clik=save>"Guardar"</btn>
`,
        defaultConfig,
      ),
    ).rejects.toBeInstanceOf(DrxError);
  });

  it("compiles named exported functions", async () => {
    const output = await compileDrx(
      `ex fn Button({children})
  ui
    <btn .px-4>{children}</btn>
`,
      { ...defaultConfig, generatedHeader: false },
    );

    expect(output).toContain(`export function Button({ children })`);
    expect(output).toContain(`<button className="px-4">{children}</button>`);
  });

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
      { ...defaultConfig, generatedHeader: false },
    );

    expect(output).toContain(
      `export function CustomI18nProvider({ locale, messages, children })`,
    );
    expect(output).toContain(`<div>{children}</div>`);
  });

  it("compiles function header with parenthesis on new lines", async () => {
    const output = await compileDrx(
      `ex fn Button(
  props
)
  ui
    <button />
`,
      { ...defaultConfig, generatedHeader: false },
    );

    expect(output).toContain(`export function Button(props)`);
    expect(output).toContain(`<button />`);
  });

  it("auto-cleanses odd indentation (QoL buff)", async () => {
    const output = await compileDrx(
      `ed fn AutoCleanse()
   ui
      <div .test>
         "Texto"
      </div>
`,
      { ...defaultConfig, generatedHeader: false },
    );

    expect(output).toContain(`export default function AutoCleanse()`);
    expect(output).toContain(`<div className="test">`);
    expect(output).toContain(`Texto`);
  });

  it("compiles multi-line statements and objects with relative indentation", async () => {
    const output = await compileDrx(
      `ed fn MultiLine()
  c obj = {
    name: "DRX",
    version: "0.1.10"
  }
  st user = {
    id: 1,
    name: "Tryhard"
  }
  ui
    <div>{obj.name}</div>
`,
      { ...defaultConfig, generatedHeader: false },
    );

    expect(output).toContain(
      `const obj = {\n    name: "DRX",\n    version: "0.1.10",\n  }`,
    );
    expect(output).toContain(
      `const [user, setUser] = useState({\n    id: 1,\n    name: "Tryhard",\n  })`,
    );
  });

  it("compiles multi-line effect dependencies", async () => {
    const output = await compileDrx(
      `ed fn MultiLineEffect()
  ef [
    dep1,
    dep2
  ]
    console.log("Effect")
  ui
    <div />
`,
      { ...defaultConfig, generatedHeader: false },
    );

    expect(output).toContain(
      `useEffect(() => {\n    console.log("Effect")\n  }, [dep1, dep2])`,
    );
  });

  it("compiles multi-line imports", async () => {
    const output = await compileDrx(
      `i {
  Search,
  FileText
} f lc
i {
  Link
}
f nl

ed fn Page()
  ui
    <div />
`,
      { ...defaultConfig, generatedHeader: false },
    );

    expect(output).toContain(`import { FileText, Search } from "lucide-react"`);
    expect(output).toContain(`import { Link } from "next/link"`);
  });

  it("compiles function overloads without body", async () => {
    const output = await compileDrx(
      `ex fn QueryCell(opts: OptsA)
ex fn QueryCell(opts: OptsB)
  ui
    <div />
`,
      { ...defaultConfig, generatedHeader: false },
    );

    expect(output).toContain(
      `export function QueryCell(opts: OptsA)\n\nexport function QueryCell(opts: OptsB) {`,
    );
  });

  it("compiles raw backtick blocks correctly preserving exact indentation", async () => {
    const output = await compileDrx(
      `ed fn RawBackticks()
  raw \`\`\`
  const a = {
    b: 1
  }
  \`\`\`
  ui
    <div />
`,
      { ...defaultConfig, generatedHeader: false },
    );

    expect(output).toContain(`const a = {\n    b: 1,\n  }`);
  });

  it("handles regex literals without confusing bracket depths", async () => {
    const output = await compileDrx(
      `ed fn RegexTest()
  c regex = /^["']|["']$/g
  c nextLine = 42
  ui
    <div />
`,
      { ...defaultConfig, generatedHeader: false },
    );

    expect(output).toContain(
      `const regex = /^["']|["']$/g\n\n  const nextLine = 42`,
    );
  });
});

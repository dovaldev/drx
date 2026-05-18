import { describe, expect, it } from "vitest";
import { parseDrx } from "../src/parser.js";
import { defaultConfig } from "../src/config.js";
import { DrxError } from "../src/errors.js";

describe("parseDrx", () => {
  it("parses top-level directives", () => {
    const program = parseDrx(`"use client"\n"use strict"`, defaultConfig);
    expect(program.nodes).toHaveLength(2);
    expect(program.nodes[0]).toMatchObject({
      type: "directive",
      value: '"use client"',
    });
    expect(program.nodes[1]).toMatchObject({
      type: "directive",
      value: '"use strict"',
    });
  });

  it("parses simple and multi-line imports", () => {
    const source = `
i Link f nl
i {
  Search,
  FileText
} f lc
`.trim();
    const program = parseDrx(source, defaultConfig);
    expect(program.nodes).toHaveLength(2);
    expect(program.nodes[0]).toMatchObject({
      type: "import",
      imported: "Link",
      source: "nl",
    });
    expect(program.nodes[1]).toMatchObject({
      type: "import",
      imported: "{ Search, FileText }",
      source: "lc",
    });
  });

  it("parses functions with complex headers", () => {
    const source = `
ex async fn MyComponent<T>(props: T): JSX.Element
  ui
    <div />
`.trim();
    const program = parseDrx(source, defaultConfig);
    expect(program.nodes).toHaveLength(1);
    expect(program.nodes[0]).toMatchObject({
      type: "function",
      exportNamed: true,
      async: true,
      name: "MyComponent",
      typeParams: "<T>",
      params: "props: T",
      returnType: ": JSX.Element",
    });
  });

  it("parses function bodies with state and effects", () => {
    const source = `
fn Counter()
  st count = 0
  ef [count]
    console.log(count)
  ui
    <button @click={() => setCount(count + 1)}>{count}</button>
`.trim();
    const program = parseDrx(source, defaultConfig);
    const fn = program.nodes[0] as any;
    expect(fn.body).toHaveLength(3);
    expect(fn.body[0]).toMatchObject({
      type: "statement",
      code: "const [count, setCount] = useState(0);",
    });
    expect(fn.body[1]).toMatchObject({
      type: "effect",
      deps: "[count]",
      code: "console.log(count)",
    });
    expect(fn.body[2]).toMatchObject({ type: "ui" });
    expect(program.usesState).toBe(true);
    expect(program.usesEffect).toBe(true);
  });

  it("handles raw blocks and backticks", () => {
    const source = `
raw
  const x = 1
raw \`\`\`
  const y = 2
  const z = 3
\`\`\`
`.trim();
    const program = parseDrx(source, defaultConfig);
    expect(program.nodes).toHaveLength(2);
    expect(program.nodes[0]).toMatchObject({
      type: "raw",
      code: "const x = 1",
    });
    expect(program.nodes[1]).toMatchObject({
      type: "raw",
      code: "  const y = 2\n  const z = 3",
    });
  });

  it("throws error on tabs", () => {
    expect(() => parseDrx("\tfn Test()", defaultConfig)).toThrow(DrxError);
    expect(() => parseDrx("\tfn Test()", defaultConfig)).toThrow(
      /Tabs are not allowed/,
    );
  });

  it("throws error on invalid top-level indentation", () => {
    expect(() => parseDrx("  fn Test()", defaultConfig)).toThrow(DrxError);
    expect(() => parseDrx("  fn Test()", defaultConfig)).toThrow(
      /Top-level lines must not be indented/,
    );
  });

  it("handles auto-cleansing of odd indentation (QoL buff)", () => {
    // 3 spaces = 1 indent
    const source = `
fn Test()
   ui
      <div />
`.trim();
    const program = parseDrx(source, defaultConfig);
    const fn = program.nodes[0] as any;
    expect(fn.body).toHaveLength(1);
    expect(fn.body[0].type).toBe("ui");
  });
});

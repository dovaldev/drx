# DRX / DovReact

DRX is a compact syntax for writing React and Next.js with less repeated
boilerplate. It is designed to give AI coding tools a smaller, readable project
representation that can be expanded back into standard TSX.

Main flow:

```txt
src-drx/**/*.drx -> src/**/*.tsx
```

## Spanish Summary

DRX es una sintaxis comprimida para React y Next.js. La idea es que una IA pueda
leer y editar archivos más pequeños en `src-drx/`, y luego generar TSX estándar
en `src/`.

## Install

This package is currently private. Use it from this repository or publish it to
a private npm scope before installing it from npm.

From a private npm package:

```bash
pnpm add -D @your-scope/drx
```

Then run the CLI:

```bash
pnpm drx init
pnpm drx check
pnpm drx expand
pnpm drx compress
pnpm drx ai-context
```

## Development

From this repository:

```bash
pnpm install
pnpm dev -- init
pnpm dev -- check
pnpm dev -- expand
pnpm dev -- compress
pnpm dev -- ai-context
pnpm dev -- watch
```

Build the CLI:

```bash
pnpm build
```

Validate the compiler:

```bash
pnpm check
pnpm test
```

## Minimal Example

```drx
"use client"

ed fn Counter()
  st count = 0

  ui
    <m .min-h-screen .grid .place-items-center>
      <p>"Value: " {count}</p>
      <btn .rounded-xl .bg-blue-500 .px-4 .py-2 @click={() => setCount(count + 1)}>
        "Add"
      </btn>
    </m>
```

Generates:

```tsx
"use client"

import { useState } from "react"

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <main className="min-h-screen grid place-items-center">
      <p>Value: {count}</p>
      <button
        className="rounded-xl bg-blue-500 px-4 py-2"
        onClick={() => setCount(count + 1)}
      >
        Add
      </button>
    </main>
  )
}
```

## Current Support

- String directives such as `"use client"`.
- Short imports such as `i Link f nl` and `i {Search} f lc`.
- Functions: `ed fn Page()`, `fn Hero()`.
- Named exports: `ex fn Button()`.
- Variables: `c`, `l`, `aw`, `r`.
- State: `st count = 0` with automatic `useState` import.
- Effects: `ef [deps]` with automatic `useEffect` import.
- `ui` and `raw` blocks.
- JSX-lite with `.p-6` classes, props, event aliases such as `@click`, and tag
  aliases such as `<m>` and `<btn>`.
- TSX/JSX to DRX compression with `drx compress`.
- Compact AI context generation in `.drx/ai-context.md` with `drx ai-context`.
- Compression metrics in `.drx/compression-report.md`.

## AI Workflow

For an existing React or Next.js project:

```bash
pnpm drx compress
pnpm drx ai-context
```

Then ask the AI to read:

```txt
.drx/rules.md
.drx/ai-context.md
src-drx/**/*.drx
```

When the AI edits UI in DRX:

```bash
pnpm drx check
pnpm drx expand
```

Rule of thumb: DRX should compress repeated structure, not destroy meaning.
Readable names still matter.

## Compression Report

`drx compress` writes:

```txt
.drx/compression-report.md
```

The report includes estimated original context tokens, estimated DRX context
tokens, token savings, character reduction, per-file savings, and raw fallback
block count.

Token estimates use a simple `characters / 4` heuristic because exact token
counts depend on the model tokenizer.

## Recommended Reading

1. Read `docs/architecture.md`.
2. Read `docs/ai-workflow.md`.
3. Read `docs/compression.md`.
4. Read `docs/usage.md`.
5. Read `docs/example-blog.md`.
6. Read `src/parser.ts`: converts DRX lines into internal nodes.
7. Read `src/jsx.ts`: transforms JSX-lite into normal JSX.
8. Read `src/compiler.ts`: generates imports, functions, and final TSX.
9. Add a case in `tests/compiler.test.ts` or `tests/compress.test.ts`.
10. Run `pnpm test`.

## License

MIT

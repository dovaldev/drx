# DRX / DovReact

DRX is a compact representation layer for React and Next.js projects. It helps
AI coding tools read a smaller version of an existing project, understand its
structure, and then work either in DRX or in the original source code.

Main flow:

```txt
src/**/*.tsx -> src-drx/**/*.drx -> src/**/*.tsx
```

## 🤖 For AI Assistants (Cursor, Windsurf, Copilot, etc.)

If you are an AI assistant reading this repository, here is how you should use DRX:

1. **Read `llms.txt`**: This repository includes an `llms.txt` file at the root. Please read it for strict formatting rules and operational guidelines.
2. **Context First**: Always run `drx compress` and `drx ai-context` to generate the `.drx/ai-context.md` file. Use this file to understand the entire project at a fraction of the token cost.
3. **Verify Everything**: If you make edits to a `.drx` file, you **must** run `drx check` to validate your indentation and syntax before running `drx expand` or proposing the final solution to the user.

## Spanish Summary

DRX comprime proyectos React y Next.js a una representación más pequeña para
que una IA pueda entender mejor la estructura del proyecto. Después la IA puede
trabajar en DRX, en TSX original, o usar DRX solo como referencia compacta.

## Install

```bash
pnpm add -D @dovaldev/drx
```

Run the CLI:

```bash
pnpm drx --help
```

## Existing Project Workflow

Use this when you already have a React or Next.js project and want to create a
compact AI-readable copy.

1. Work on a copy or a branch of the project.
2. Install DRX:

```bash
pnpm add -D @dovaldev/drx
```

3. Initialize config if needed:

```bash
pnpm drx init
```

4. Compress runtime React/Next files into DRX:

```bash
pnpm drx compress
```

5. Generate AI context:

```bash
pnpm drx ai-context
```

This creates:

```txt
src-drx/
.drx/rules.md
.drx/ai-context.md
.drx/compression-report.md
```

Then tell the AI:

```txt
Read .drx/rules.md and .drx/ai-context.md first.
Use src-drx as the compact project representation.
If the change is easier in DRX, edit src-drx and run drx check + drx expand.
If the change is safer in the original code, edit the original TSX/JS/TS files.
Use raw blocks for unsupported syntax.
```

## Editing Modes

DRX does not force one workflow.

- Use DRX as source of truth for compact UI editing.
- Use original TSX/JS as source of truth for complex logic or unsupported syntax.
- Use DRX as a reference project to teach the AI patterns from one project and
  apply them in another project.

When editing DRX:

```bash
pnpm drx check
pnpm drx expand
```

When editing the original source directly:

```bash
pnpm drx compress
pnpm drx ai-context
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

## Commands

```bash
pnpm drx init
pnpm drx check
pnpm drx expand
pnpm drx compress
pnpm drx ai-context
pnpm drx watch
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

## Development

From this repository:

```bash
pnpm install
pnpm dev -- check
pnpm dev -- expand
pnpm dev -- compress
pnpm dev -- ai-context
pnpm dev -- watch
```

Build and test:

```bash
pnpm check
pnpm test
pnpm build
```

## License

MIT

# TSX To DRX Compression

`compress` converts React/Next files into DRX using the TypeScript compiler AST.

Command:

```bash
pnpm dev -- compress
```

After compression, DRX writes:

```txt
.drx/compression-report.md
```

The report shows estimated original context tokens, estimated DRX context tokens,
tokens saved, character reduction, per-file savings, and raw fallback block count.
Token estimates use a simple `characters / 4` heuristic because actual token
counts depend on the model tokenizer.

Currently supported:

- String directives such as `"use client"`.
- Default imports.
- Named imports.
- Mixed default + named imports, emitted as two DRX import lines.
- Function declarations.
- Named exported functions via `ex fn`.
- Arrow/function-expression components when they return JSX.
- `useState`.
- `useEffect` with block callback.
- JSX elements, fragments and self-closing tags.
- `className="..."` to `.class` tokens.
- Basic event aliases such as `onClick` to `@click`.
- Simple props and expression props.

Conservative fallback:

```drx
raw
  // original TS/TSX code
```

Use `raw` whenever conversion would be ambiguous or lossy.

## DRX Function Export Forms

```drx
ed fn Page()
```

Generates:

```tsx
export default function Page() {}
```

```drx
ex fn Button()
```

Generates:

```tsx
export function Button() {}
```

```drx
fn Card()
```

Generates:

```tsx
function Card() {}
```

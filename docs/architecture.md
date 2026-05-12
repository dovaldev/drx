# DRX Architecture

DRX is designed as an AI-facing representation for React and Next.js projects.

It has three layers:

```txt
src/         Runtime code: React, Next.js, Node, TSX
src-drx/     Compact editable DRX source
.drx/        AI context, rules, manifest, project memory
```

## Direction 1: DRX To TSX

Command:

```bash
pnpm dev -- expand
```

Flow:

```txt
src-drx/**/*.drx
  -> parseDrx
  -> DRX AST
  -> generateProgram
  -> src/**/*.tsx
```

Main files:

- `src/parser.ts`: line and indentation parser.
- `src/jsx.ts`: JSX-lite parser/transformer.
- `src/compiler.ts`: TSX generator.
- `src/commands.ts`: CLI command wiring.

This direction should be strict. If DRX is invalid, `check` should fail before generating runtime code.

## Direction 2: TSX To DRX

Command:

```bash
pnpm dev -- compress
```

Flow:

```txt
src/**/*.tsx
  -> TypeScript compiler AST
  -> conservative DRX writer
  -> src-drx/**/*.drx
```

Main file:

- `src/compress.ts`

This direction is intentionally conservative. Easy React/Next patterns become DRX. Hard syntax should stay in `raw` blocks so code meaning is not lost.

## AI Context

Command:

```bash
pnpm dev -- ai-context
```

Outputs:

- `.drx/rules.md`: compact rules the AI should read before editing.
- `.drx/ai-context.md`: project map for AI.
- `.drx/manifest.json`: machine-readable project summary.

This is the part that lets an AI understand a large project with fewer tokens. The AI should read `.drx/ai-context.md` and the relevant `.drx` files before implementing changes.


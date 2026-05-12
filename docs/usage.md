# Using DRX In A Project

DRX can be used in two ways:

1. New project: write DRX first, then generate TSX.
2. Existing project: compress TSX into DRX, then let AI read/edit DRX.

## Install

After publishing to npm:

```bash
pnpm add -D dovreact
```

Then run:

```bash
pnpm drx --help
```

During local development of this repo, use:

```bash
pnpm dev -- check
pnpm dev -- expand
pnpm dev -- compress
pnpm dev -- ai-context
```

## New Next.js App With `src/`

Recommended config:

```json
{
  "sourceDir": "src-drx",
  "outDir": "src",
  "framework": "next"
}
```

Flow:

```bash
pnpm drx init
pnpm drx check
pnpm drx expand
pnpm dev
```

Files:

```txt
src-drx/app/page.drx
src/app/page.tsx
```

## Existing Next.js Pages Router App

Some projects use `pages/` in the project root instead of `src/`.

Use:

```json
{
  "sourceDir": "src-drx",
  "outDir": ".",
  "framework": "next",
  "ignore": [
    "node_modules/**",
    ".next/**",
    "dist/**",
    ".drx/**",
    "src-drx/**"
  ]
}
```

Then run:

```bash
pnpm drx compress
pnpm drx ai-context
pnpm drx check
```

Generated files:

```txt
src-drx/pages/_app.drx
src-drx/pages/_document.drx
.drx/ai-context.md
.drx/manifest.json
.drx/rules.md
```

To regenerate TSX:

```bash
pnpm drx expand
```

## AI Prompt For Working In DRX

Use this prompt when asking an AI to edit a DRX project:

```txt
You are working in a DRX project.
Read .drx/rules.md and .drx/ai-context.md first.
Use src-drx as the compact source of truth for React/Next UI.
Do not edit generated TSX directly unless explicitly requested.
After editing DRX, run drx check and drx expand.
Use raw blocks for unsupported syntax.
Prefer readable names over ultra-short names.
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

## Example Workflow For A Large Project

```bash
pnpm add -D dovreact
pnpm drx init
```

Adjust `drx.config.json`.

Then:

```bash
pnpm drx compress
pnpm drx ai-context
```

Ask the AI to read:

```txt
.drx/rules.md
.drx/ai-context.md
src-drx/**/*.drx
```

After changes:

```bash
pnpm drx check
pnpm drx expand
pnpm test
pnpm build
```


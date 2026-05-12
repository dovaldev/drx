# DRX AI Workflow

## Existing Project

Use this when a large React/Next project already exists.

```bash
pnpm dev -- compress
pnpm dev -- ai-context
```

Then give the AI this rule:

```txt
Read .drx/rules.md and .drx/ai-context.md first.
Use src-drx as the compact project representation.
When editing React/Next UI, edit src-drx and run check + expand.
Use raw for unsupported syntax.
```

## New Project

Use this when DRX is the source of truth from the start.

```bash
pnpm dev -- init
```

Then create files in `src-drx/` and generate runtime TSX:

```bash
pnpm dev -- check
pnpm dev -- expand
```

## Reference Project

Use this when one project teaches the AI how to implement something in another project.

```txt
project-a/
  src-drx/
  .drx/ai-context.md

project-b/
  src/
```

The AI reads `project-a` in DRX form, then implements the equivalent solution in `project-b` as DRX, TSX, React, Next.js, or Node depending on the target.

## Rule Of Thumb

DRX should compress repetitive structure, not destroy meaning.

Good:

```drx
st selectedUser = null
```

Bad:

```drx
st s = null
```

Semantic names help the AI understand the project.


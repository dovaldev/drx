# Example: Next/Nextra Blog

Example project:

```txt
/Users/lilianacristinasilvacarvalho/Desktop/Languages/examples/blog
```

This project uses:

- Next.js Pages Router.
- Nextra.
- `.md` and `.mdx` content.
- `pages/_app.tsx`.
- `pages/_document.tsx`.
- Config files in the project root.

## Config

Because this project does not use `src/`, its `drx.config.json` uses:

```json
{
  "sourceDir": "src-drx",
  "outDir": ".",
  "framework": "next",
  "ignore": ["node_modules/**", ".next/**", "dist/**", ".drx/**", "src-drx/**"]
}
```

## Commands Used

From the blog directory:

```bash
node /Users/lilianacristinasilvacarvalho/Desktop/Languages/drx/dist/cli.js compress
node /Users/lilianacristinasilvacarvalho/Desktop/Languages/drx/dist/cli.js ai-context
node /Users/lilianacristinasilvacarvalho/Desktop/Languages/drx/dist/cli.js check
node /Users/lilianacristinasilvacarvalho/Desktop/Languages/drx/dist/cli.js expand
```

After npm publishing, these become:

```bash
pnpm drx compress
pnpm drx ai-context
pnpm drx check
pnpm drx expand
```

## Result

Generated DRX:

```txt
src-drx/pages/_app.drx
src-drx/pages/_document.drx
```

Generated AI context:

```txt
.drx/ai-context.md
.drx/manifest.json
.drx/rules.md
```

The AI context includes:

- Pages Router routes.
- `.md` and `.mdx` content files.
- Config files such as `next.config.js`, `theme.config.js`, and `package.json`.
- DRX symbols such as `App` and `Document`.

## Notes

`import type` and side-effect CSS imports are preserved through `raw` blocks. This is intentional because those imports carry semantics that should not be compressed unsafely.

# Publishing DRX To npm

This document explains how to publish the DRX CLI package to npm.

## 1. Choose Package Name

Current package name:

```json
{
  "name": "dovreact"
}
```

Before publishing, check name availability:

```bash
npm view dovreact
```

If npm returns `404`, the name is available. If it exists, choose another name, for example:

```txt
drx
dovreact
@your-scope/drx
@your-scope/dovreact
```

Scoped packages are usually safer:

```json
{
  "name": "@your-scope/drx"
}
```

## 2. Make Package Public

The current `package.json` is private during development:

```json
{
  "private": true
}
```

Before publishing, remove it or set:

```json
{
  "private": false
}
```

## 3. Verify Package Metadata

Recommended fields:

```json
{
  "name": "dovreact",
  "version": "0.1.0",
  "description": "DRX compiler for React and Next.js projects",
  "type": "module",
  "bin": {
    "drx": "dist/cli.js",
    "dovreact": "dist/cli.js"
  },
  "files": [
    "dist",
    "README.md",
    "docs"
  ],
  "keywords": [
    "react",
    "nextjs",
    "tsx",
    "compiler",
    "ai",
    "drx"
  ],
  "license": "MIT"
}
```

## 4. Build Before Publishing

Run:

```bash
pnpm check
pnpm test
pnpm build
```

The built CLI must exist:

```bash
ls dist/cli.js
```

## 5. Test The Package Locally

From this repo:

```bash
npm pack
```

This creates a `.tgz` file, for example:

```txt
dovreact-0.1.0.tgz
```

Install it in a test project:

```bash
pnpm add -D /absolute/path/to/dovreact-0.1.0.tgz
pnpm drx --help
```

Or run without installing:

```bash
node /absolute/path/to/drx/dist/cli.js --help
```

## 6. Login To npm

```bash
npm login
```

For scoped public packages:

```bash
npm publish --access public
```

For unscoped packages:

```bash
npm publish
```

## 7. Versioning

Patch release:

```bash
npm version patch
npm publish
```

Minor release:

```bash
npm version minor
npm publish
```

Major release:

```bash
npm version major
npm publish
```

## 8. Recommended Prepublish Script

Add this before publishing:

```json
{
  "scripts": {
    "prepublishOnly": "pnpm check && pnpm test && pnpm build"
  }
}
```

This prevents publishing broken builds.


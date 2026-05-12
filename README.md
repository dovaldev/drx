# DRX / DovReact

DRX es una sintaxis comprimida para escribir React y Next.js con menos ruido, pensada para que una IA pueda editar archivos más pequeños y luego generar TSX estándar.

Flujo principal:

```txt
src-drx/**/*.drx -> src/**/*.tsx
```

## Comandos

Instalado desde npm:

```bash
pnpm add -D dovreact
pnpm drx init
pnpm drx check
pnpm drx expand
pnpm drx compress
pnpm drx ai-context
```

Desde este repositorio en desarrollo:

```bash
pnpm dev -- init
pnpm dev -- check
pnpm dev -- expand
pnpm dev -- compress
pnpm dev -- ai-context
pnpm dev -- watch
```

Para compilar la CLI:

```bash
pnpm build
```

Para validar el código del compilador:

```bash
pnpm check
pnpm test
```

## Ejemplo mínimo

```drx
"use client"

ed fn Counter()
  st count = 0

  ui
    <m .min-h-screen .grid .place-items-center>
      <p>"Valor: " {count}</p>
      <btn .rounded-xl .bg-blue-500 .px-4 .py-2 @click={() => setCount(count + 1)}>
        "Sumar"
      </btn>
    </m>
```

Genera:

```tsx
"use client"

import { useState } from "react"

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <main className="min-h-screen grid place-items-center">
      <p>Valor: {count}</p>
      <button
        className="rounded-xl bg-blue-500 px-4 py-2"
        onClick={() => setCount(count + 1)}
      >
        Sumar
      </button>
    </main>
  )
}
```

## Qué soporta ahora

- Directivas como `"use client"`.
- Imports abreviados: `i Link f nl`, `i {Search} f lc`.
- Funciones: `ed fn Page()`, `fn Hero()`.
- Named exports: `ex fn Button()`.
- Variables: `c`, `l`, `aw`, `r`.
- Estado: `st count = 0` con auto-import de `useState`.
- Efectos: `ef [deps]` con auto-import de `useEffect`.
- Bloques `ui` y `raw`.
- JSX-lite con clases `.p-6`, props, eventos `@click`, aliases como `<m>` y `<btn>`.
- Primer conversor TSX/JSX -> DRX con `pnpm dev -- compress`.
- Contexto compacto para IA en `.drx/ai-context.md` con `pnpm dev -- ai-context`.

## Flujo para IA

Para un proyecto existente:

```bash
pnpm dev -- compress
pnpm dev -- ai-context
```

Después la IA debería leer:

```txt
.drx/rules.md
.drx/ai-context.md
src-drx/**/*.drx
```

Y cuando modifique UI en DRX:

```bash
pnpm dev -- check
pnpm dev -- expand
```

## Orden recomendado para seguir aprendiendo

1. Lee `docs/architecture.md`.
2. Lee `docs/ai-workflow.md`.
3. Lee `docs/compression.md`.
4. Lee `docs/usage.md`.
5. Lee `docs/npm-publishing.md`.
6. Lee `docs/example-blog.md`.
7. Lee `src/parser.ts`: convierte líneas DRX en nodos internos.
8. Lee `src/jsx.ts`: transforma JSX-lite a JSX normal.
9. Lee `src/compiler.ts`: genera imports, funciones y TSX final.
10. Añade un caso en `tests/compiler.test.ts` o `tests/compress.test.ts`.
11. Ejecuta `pnpm test`.

La conversión inversa `tsx -> drx` debería venir después de estabilizar bien `drx -> tsx`.

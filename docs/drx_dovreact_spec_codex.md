# DRX / DovReact — Especificación completa para crear el lenguaje

Versión: `0.1.10`

Nombre provisional: **DRX** / **DovReact**

Objetivo: crear una sintaxis comprimida, reversible y amigable para IA para programar aplicaciones **React** y **Next.js**, generando siempre código `.tsx` estándar.

---

# 1. Idea principal

DRX no es un framework nuevo.

DRX es una capa de escritura previa a React/Next.js.

```txt
.drx  →  .tsx  →  Next.js / React normal
```

La idea es que humanos e IA puedan escribir componentes con menos ruido y menos tokens, pero que el resultado final sea React real.

Ejemplo DRX:

```drx
"use client"

i {uS} f r

ed fn Counter()
  st count = 0

  ui
    <main .min-h-screen .grid .place-items-center .bg-zinc-950 .text-white>
      <section .rounded-2xl .bg-white/10 .p-8>
        <h1 .text-3xl .font-bold>"Contador"</h1>
        <p .mt-3>"Valor actual: " {count}</p>
        <btn .mt-5 .rounded-xl .bg-blue-500 .px-4 .py-2 @click={() => setCount(count + 1)}>
          "Sumar"
        </btn>
      </section>
    </main>
```

Salida TSX:

```tsx
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <main className="min-h-screen grid place-items-center bg-zinc-950 text-white">
      <section className="rounded-2xl bg-white/10 p-8">
        <h1 className="text-3xl font-bold">Contador</h1>
        <p className="mt-3">Valor actual: {count}</p>
        <button
          className="mt-5 rounded-xl bg-blue-500 px-4 py-2"
          onClick={() => setCount(count + 1)}
        >
          Sumar
        </button>
      </section>
    </main>
  );
}
```

---

# 2. Principios de diseño

## 2.1 DRX debe parecerse a JSX

DRX debe conservar símbolos importantes:

```txt
< >
</>
{}
()
=
=>
""
```

Esto hace que:

- sea más fácil para la IA entenderlo,
- sea más fácil para humanos editarlo,
- sea más fácil hacer `tsx -> drx` en el futuro,
- sea más fácil detectar dónde cambiar algo,
- haya menos ambigüedad.

DRX no debe convertirse en un lenguaje críptico de una sola letra para todo.

## 2.2 Comprimir lo repetitivo, no lo semántico

Bueno:

```drx
st count = 0
```

Malo como estilo recomendado:

```drx
st c = 0
```

DRX debe ahorrar tokens eliminando ruido de React, no destruyendo nombres útiles.

## 2.3 React completo debe seguir siendo posible

Si algo no está soportado por DRX, se usa `raw`.

```drx
raw
  export const dynamic = "force-dynamic"
  export const revalidate = 60
```

Esto garantiza compatibilidad con React, Next.js y librerías futuras.

## 2.4 La IA debe poder escribir DRX directamente

Para eso DRX necesita:

1. reglas claras,
2. ejemplos,
3. validador,
4. mensajes de error útiles,
5. sintaxis cercana a React.

## 2.5 Primero compilar DRX a TSX

La versión `0.1.0` debe centrarse en:

```txt
.drx -> .tsx
```

La conversión inversa:

```txt
.tsx -> .drx
```

queda para una fase posterior.

---

# 3. Nombre y extensión

Nombre de CLI recomendado:

```bash
drx
```

Extensión de archivo:

```txt
.drx
```

Alias posible:

```bash
dovreact
```

Paquete npm provisional:

```txt
dovreact
```

Binarios:

```json
{
  "bin": {
    "drx": "dist/cli.js",
    "dovreact": "dist/cli.js"
  }
}
```

---

# 4. Estructura de proyecto recomendada

Para evitar editar archivos generados directamente:

```txt
project/
  drx.config.json
  src-drx/
    app/
      page.drx
      layout.drx
    components/
      Button.drx
      Card.drx
  src/
    app/
      page.tsx
      layout.tsx
    components/
      Button.tsx
      Card.tsx
```

`src-drx` es la fuente real.

`src` es generado.

Next.js / React solo consume los archivos `.tsx` generados.

---

# 5. Comandos CLI

## 5.1 Comandos MVP

```bash
pnpm drx init
pnpm drx check
pnpm drx expand
pnpm drx watch
```

## 5.2 Comandos futuros

```bash
pnpm drx compress
pnpm drx roundtrip
pnpm drx pack
pnpm drx apply
pnpm drx fix
pnpm drx ai-context
```

---

# 6. `drx init`

Crea `drx.config.json`.

Ejemplo:

```json
{
  "sourceDir": "src-drx",
  "outDir": "src",
  "framework": "next",
  "mode": "jsx-lite",
  "generatedHeader": true,
  "formatWithPrettier": true,
  "autoImportHooks": true,
  "keepUnknownAsRaw": true,
  "aliases": {
    "r": "react",
    "nl": "next/link",
    "ni": "next/image",
    "lc": "lucide-react",
    "fm": "framer-motion",
    "rq": "@tanstack/react-query"
  },
  "namedAliases": {
    "uS": "useState",
    "uE": "useEffect",
    "uM": "useMemo",
    "uC": "useCallback",
    "uR": "useRef",
    "uCtx": "useContext"
  },
  "tagAliases": {
    "btn": "button"
  },
  "eventAliases": {
    "@click": "onClick",
    "@change": "onChange",
    "@submit": "onSubmit",
    "@input": "onInput",
    "@focus": "onFocus",
    "@blur": "onBlur",
    "@key": "onKeyDown"
  }
}
```

---

# 7. `drx expand`

Convierte todos los `.drx` de `sourceDir` en `.tsx` dentro de `outDir`.

Ejemplo:

```txt
src-drx/app/page.drx
```

Genera:

```txt
src/app/page.tsx
```

Debe conservar rutas relativas.

Si `generatedHeader` está activo, añadir:

```tsx
// Generated by DRX. Do not edit directly.
// Source: src-drx/app/page.drx
```

---

# 8. `drx check`

Valida sin generar archivos.

Debe detectar:

- tabs,
- indentación inválida,
- imports mal formados,
- funciones mal formadas,
- `st` sin valor inicial,
- `ui` vacío,
- JSX-lite mal cerrado,
- eventos desconocidos,
- props mal formadas,
- bloques `raw` mal indentados,
- líneas no reconocidas.

Ejemplo de error:

```txt
DRX_UNKNOWN_EVENT src-drx/app/page.drx:18
Unknown event alias "@clik".
Hint: Did you mean "@click"?
```

---

# 9. `drx watch`

Observa `sourceDir` y ejecuta `expand` cuando cambien archivos `.drx`.

Debe usar `chokidar`.

---

# 10. Sintaxis base DRX

DRX mezcla:

1. comandos abreviados para JS/React,
2. JSX-lite para UI,
3. bloques raw para código completo.

---

# 11. Directivas de archivo

Las directivas como `"use client"` se conservan.

Entrada:

```drx
"use client"

ed fn Page()
  ui
    <main>"Hola"</main>
```

Salida:

```tsx
"use client";

export default function Page() {
  return <main>Hola</main>;
}
```

También deben conservarse otras directivas string si aparecen al inicio.

---

# 12. Imports

## 12.1 Import default

DRX:

```drx
i Link f nl
```

TSX:

```tsx
import Link from "next/link";
```

`nl` se resuelve desde `aliases`.

## 12.2 Import named

DRX:

```drx
i {Search,FileText} f lc
```

TSX:

```tsx
import { Search, FileText } from "lucide-react";
```

## 12.3 Import named con aliases internos

DRX:

```drx
i {uS,uE} f r
```

TSX:

```tsx
import { useState, useEffect } from "react";
```

## 12.4 Import desde string completo

DRX:

```drx
i Button f "@/components/Button"
i { cn } f "@/lib/utils"
```

TSX:

```tsx
import Button from "@/components/Button";
import { cn } from "@/lib/utils";
```

## 12.5 Import mixto — opcional v0.2

DRX futuro:

```drx
i React,{uS} f r
```

TSX:

```tsx
import React, { useState } from "react";
```

No obligatorio en MVP.

---

# 13. Funciones

## 13.1 Export default function

DRX:

```drx
ed fn Page()
  ui
    <main>"Hola"</main>
```

TSX:

```tsx
export default function Page() {
  return <main>Hola</main>;
}
```

## 13.2 Function normal

DRX:

```drx
fn Hero()
  ui
    <section>"Hero"</section>
```

TSX:

```tsx
function Hero() {
  return <section>Hero</section>;
}
```

## 13.3 Async function

DRX:

```drx
ed async fn Page()
  c data = aw getData()

  ui
    <main>{data.title}</main>
```

TSX:

```tsx
export default async function Page() {
  const data = await getData();

  return <main>{data.title}</main>;
}
```

## 13.4 Parámetros

Los parámetros se mantienen casi literal.

DRX:

```drx
fn Card({title,text})
  ui
    <div>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
```

TSX:

```tsx
function Card({ title, text }) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}
```

## 13.5 Tipos TypeScript en parámetros

En MVP, si los tipos son simples, conservarlos.

DRX:

```drx
fn Card({title}: {title: string})
  ui
    <h2>{title}</h2>
```

TSX:

```tsx
function Card({ title }: { title: string }) {
  return <h2>{title}</h2>;
}
```

Para tipos complejos, usar `raw`.

---

# 14. Variables

## 14.1 Const

DRX:

```drx
c title = "Hola"
```

TSX:

```tsx
const title = "Hola";
```

## 14.2 Let

DRX:

```drx
l count = 0
```

TSX:

```tsx
let count = 0;
```

## 14.3 Await

DRX:

```drx
c data = aw getData()
```

TSX:

```tsx
const data = await getData();
```

## 14.4 Return manual

DRX:

```drx
r data
```

TSX:

```tsx
return data;
```

`r` es opcional para MVP, pero recomendado.

---

# 15. Estado: `st`

DRX:

```drx
st count = 0
```

TSX:

```tsx
const [count, setCount] = useState(0);
```

Regla de setter:

```txt
count    -> setCount
isOpen   -> setIsOpen
userName -> setUserName
```

Si se usa `st`, el compilador debe importar `useState` automáticamente si `autoImportHooks` está activo.

DRX:

```drx
"use client"

ed fn Counter()
  st count = 0

  ui
    <p>{count}</p>
```

TSX:

```tsx
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return <p>{count}</p>;
}
```

---

# 16. useEffect: `ef`

DRX:

```drx
ef []
  console.log("mounted")
```

TSX:

```tsx
useEffect(() => {
  console.log("mounted");
}, []);
```

Con dependencia:

```drx
ef [count]
  console.log(count)
```

TSX:

```tsx
useEffect(() => {
  console.log(count);
}, [count]);
```

Si se usa `ef`, auto-importar `useEffect`.

---

# 17. Otros hooks abreviados — v0.2

No obligatorios en MVP, pero dejar previstos:

```drx
mem value [deps]
  expensiveCalculation()
```

TSX:

```tsx
const value = useMemo(() => {
  return expensiveCalculation();
}, [deps]);
```

```drx
cb handleClick [count]
  setCount(count + 1)
```

TSX:

```tsx
const handleClick = useCallback(() => {
  setCount(count + 1);
}, [count]);
```

---

# 18. Bloque `ui`

`ui` inicia el bloque JSX que será devuelto con `return`.

DRX:

```drx
ed fn Page()
  ui
    <main .p-6>
      <h1>"Hola"</h1>
    </main>
```

TSX:

```tsx
export default function Page() {
  return (
    <main className="p-6">
      <h1>Hola</h1>
    </main>
  );
}
```

Reglas:

- `ui` solo puede aparecer dentro de una función.
- Debe contener al menos un nodo JSX.
- El generador debe envolver el contenido en `return (...)`.
- Si solo hay un nodo simple, Prettier puede decidir si lo deja en una línea.

---

# 19. JSX-lite

DRX usa JSX-lite, muy parecido a JSX.

## 19.1 Elemento básico

DRX:

```drx
<p>"Hola"</p>
```

TSX:

```tsx
<p>Hola</p>
```

## 19.2 Elemento con clases comprimidas

DRX:

```drx
<div .rounded-2xl .bg-white .p-6></div>
```

TSX:

```tsx
<div className="rounded-2xl bg-white p-6"></div>
```

## 19.3 Elemento con hijos por indentación

DRX:

```drx
<section .p-6>
  <h1>"Título"</h1>
  <p>"Texto"</p>
</section>
```

TSX:

```tsx
<section className="p-6">
  <h1>Título</h1>
  <p>Texto</p>
</section>
```

## 19.4 Elemento self-closing

DRX:

```drx
<Search .size-6 />
```

TSX:

```tsx
<Search className="size-6" />
```

## 19.5 Alias de tags HTML

DRX debe permitir alias cortos para tags HTML comunes. Esto reduce tokens sin eliminar la estructura JSX.

Alias recomendados para MVP:

```txt
m    -> main
s    -> section
d    -> div
p    -> p
sp   -> span
h1   -> h1
h2   -> h2
h3   -> h3
a    -> a
btn  -> button
img  -> img
ul   -> ul
ol   -> ol
li   -> li
nav  -> nav
hdr  -> header
ftr  -> footer
art  -> article
frm  -> form
lbl  -> label
inp  -> input
ta   -> textarea
sel  -> select
opt  -> option
```

Ejemplo DRX:

```drx
<m .min-h-screen .bg-zinc-950>
  <s .mx-auto .max-w-6xl .px-6 .py-24>
    <h1 .text-5xl .font-bold>"Hola"</h1>
    <p .mt-6 .text-zinc-300>"Texto"</p>
    <btn .mt-8 .rounded-xl .bg-blue-500>"Empezar"</btn>
  </s>
</m>
```

Salida TSX:

```tsx
<main className="min-h-screen bg-zinc-950">
  <section className="mx-auto max-w-6xl px-6 py-24">
    <h1 className="text-5xl font-bold">Hola</h1>
    <p className="mt-6 text-zinc-300">Texto</p>
    <button className="mt-8 rounded-xl bg-blue-500">Empezar</button>
  </section>
</main>
```

## 19.6 Regla importante sobre alias

Los alias solo deben aplicarse a tags en minúscula o alias conocidos.

Cualquier tag que empiece por mayúscula se trata como componente React y no se transforma.

Ejemplo:

```drx
<Card />
```

Sigue siendo:

```tsx
<Card />
```

## 19.7 Alias configurables

Los alias deben venir de `drx.config.json`:

```json
{
  "tagAliases": {
    "m": "main",
    "s": "section",
    "d": "div",
    "btn": "button",
    "hdr": "header",
    "ftr": "footer",
    "frm": "form",
    "inp": "input"
  }
}
```

El compilador debe permitir que el usuario sobrescriba o añada alias.

---

# 19.8 Alias de componentes comunes

Además de alias HTML, DRX puede permitir alias para componentes comunes o componentes del propio proyecto.

Ejemplos:

```txt
Ca   -> Card
L    -> List
LiC  -> ListCard
ImgC -> ImageCard
FtC  -> FeatureCard
Btn  -> Button
In   -> Input
Txt  -> Textarea
Md   -> Modal
Dlg  -> Dialog
Tb   -> Table
Row  -> TableRow
Col  -> TableCell
Av   -> Avatar
Bd   -> Badge
Al   -> Alert
Sk   -> Skeleton
```

Ejemplo DRX:

```drx
<Ca title="Busca" text="Encuentra oportunidades relevantes." />
<ImgC src="/hero.png" alt="Hero" />
<FtC icon=Search title="Resume" text="Entiende documentos largos." />
```

Salida TSX:

```tsx
<Card title="Busca" text="Encuentra oportunidades relevantes." />
<ImageCard src="/hero.png" alt="Hero" />
<FeatureCard icon={Search} title="Resume" text="Entiende documentos largos." />
```

## 19.9 Regla importante para alias de componentes

Los alias de componentes deben ser configurables y explícitos.

No se recomienda que el compilador invente alias automáticamente para cualquier componente, porque podría generar confusión.

Correcto:

```json
{
  "componentAliases": {
    "Ca": "Card",
    "FtC": "FeatureCard",
    "ImgC": "ImageCard",
    "Btn": "Button"
  }
}
```

No recomendado en MVP:

```txt
Cualquier componente que empiece por C se convierte automáticamente en Card.
```

Motivo: eso puede romper componentes reales llamados `Chart`, `Calendar`, `Command`, etc.

## 19.10 Alias por archivo o por proyecto

Los alias de componentes deben vivir en `drx.config.json`:

```json
{
  "componentAliases": {
    "Ca": "Card",
    "LC": "ListCard",
    "ImgC": "ImageCard",
    "FtC": "FeatureCard",
    "Btn": "Button",
    "In": "Input",
    "Md": "Modal"
  }
}
```

Cuando el generador encuentra:

```drx
<Ca />
```

Debe generar:

```tsx
<Card />
```

## 19.11 Alias y auto-imports de componentes — fase v0.2

En MVP, los alias solo cambian el nombre del tag.

Es decir:

```drx
<Ca />
```

se convierte en:

```tsx
<Card />
```

Pero el import debe estar definido por el usuario:

```drx
i Card f "@/components/Card"
```

En fase v0.2 se puede permitir auto-imports:

```json
{
  "componentAliases": {
    "Ca": {
      "name": "Card",
      "import": "@/components/Card"
    },
    "FtC": {
      "name": "FeatureCard",
      "import": "@/components/FeatureCard"
    }
  }
}
```

Entonces:

```drx
<Ca title="Hola" />
```

Podría generar automáticamente:

```tsx
import Card from "@/components/Card";

<Card title="Hola" />;
```

## 19.12 Nombres recomendados para alias

Convención recomendada:

```txt
HTML aliases en minúscula:
m, s, d, btn, inp, frm

Component aliases en Pascal abreviado:
Ca, FtC, ImgC, Btn, Md, Tbl
```

Esto permite distinguir fácilmente:

```drx
<btn>"Guardar"</btn>  -> <button>Guardar</button>
<Btn>"Guardar"</Btn>  -> <Button>Guardar</Button>
```

---

# 20. Clases Tailwind

Las clases se escriben como tokens que empiezan por `.` dentro de la etiqueta.

DRX:

```drx
<div .grid .gap-4 .md:grid-cols-3 .bg-white/10 .text-[32px]>
```

TSX:

```tsx
<div className="grid gap-4 md:grid-cols-3 bg-white/10 text-[32px]">
```

Debe soportar clases con:

```txt
:
/
[]
()
-
_
%
!
@
```

Ejemplos válidos:

```drx
<div .hover:bg-blue-500 .dark:bg-zinc-950 .grid-cols-[1fr_auto] .w-[calc(100%-1rem)]>
```

Si el elemento también trae `className`, se debe combinar.

DRX:

```drx
<div className="custom" .p-6 .rounded-xl>
```

TSX:

```tsx
<div className="custom p-6 rounded-xl">
```

---

# 21. Props

## 21.1 Prop string

DRX:

```drx
<Link href="/app">"Ir"</Link>
```

TSX:

```tsx
<Link href="/app">Ir</Link>
```

## 21.2 Prop expresión con llaves

DRX:

```drx
<Card user={user} />
```

TSX:

```tsx
<Card user={user} />
```

## 21.3 Prop expresión sin llaves

DRX:

```drx
<Card user=user />
```

TSX:

```tsx
<Card user={user} />
```

Regla:

- Si el valor está entre comillas, es string.
- Si el valor está entre `{}`, es expresión.
- Si el valor es número, boolean o null, es expresión.
- Si el valor no tiene comillas y no es string literal, se trata como expresión.

## 21.4 Props booleanas

DRX:

```drx
<input disabled />
```

TSX:

```tsx
<input disabled />
```

## 21.5 Props numéricas

DRX:

```drx
<Image width=1200 height=675 />
```

TSX:

```tsx
<Image width={1200} height={675} />
```

---

# 22. Eventos

Eventos se escriben con `@`.

## 22.1 Handler directo

DRX:

```drx
<btn @click={save}>"Guardar"</btn>
```

TSX:

```tsx
<button onClick={save}>Guardar</button>
```

## 22.2 Handler inline

DRX:

```drx
<btn @click={() => setCount(count + 1)}>"Sumar"</btn>
```

TSX:

```tsx
<button onClick={() => setCount(count + 1)}>Sumar</button>
```

## 22.3 Forma sin llaves

DRX:

```drx
<btn @click=save>"Guardar"</btn>
```

TSX:

```tsx
<button onClick={save}>Guardar</button>
```

## 22.4 Alias de eventos

```txt
@click  -> onClick
@change -> onChange
@submit -> onSubmit
@input  -> onInput
@focus  -> onFocus
@blur   -> onBlur
@key    -> onKeyDown
```

Evento desconocido debe dar error.

---

# 23. Texto y expresiones

## 23.1 Texto literal

DRX:

```drx
<h1>"Hola mundo"</h1>
```

TSX:

```tsx
<h1>Hola mundo</h1>
```

## 23.2 Expresión

DRX:

```drx
<h1>{title}</h1>
```

TSX:

```tsx
<h1>{title}</h1>
```

## 23.3 Mezcla de texto y expresión

DRX:

```drx
<p>"Valor: " {count}</p>
```

TSX:

```tsx
<p>Valor: {count}</p>
```

## 23.4 Texto sin comillas — opcional

Para evitar ambigüedad, en MVP se recomienda exigir comillas para texto literal.

Válido:

```drx
<p>"Hola"</p>
```

No recomendado para MVP:

```drx
<p>Hola</p>
```

Motivo: facilita el parser y evita confundir texto con identificadores.

---

# 24. Condicionales en UI

## 24.1 If simple

DRX:

```drx
if loading
  <Spinner />
```

TSX:

```tsx
{
  loading && <Spinner />;
}
```

## 24.2 If con bloque

DRX:

```drx
if user
  <div>
    <h2>{user.name}</h2>
  </div>
```

TSX:

```tsx
{
  user && (
    <div>
      <h2>{user.name}</h2>
    </div>
  );
}
```

## 24.3 Else — v0.2

DRX futuro:

```drx
if user
  <UserCard user=user />
else
  <LoginCard />
```

TSX:

```tsx
{
  user ? <UserCard user={user} /> : <LoginCard />;
}
```

No obligatorio en MVP.

---

# 25. Loops / map

## 25.1 For básico

DRX:

```drx
for users as user
  <UserCard key=user.id user=user />
```

TSX:

```tsx
{
  users.map((user) => <UserCard key={user.id} user={user} />);
}
```

## 25.2 For con índice

DRX:

```drx
for users as user,i
  <UserCard key=i user=user />
```

TSX:

```tsx
{
  users.map((user, i) => <UserCard key={i} user={user} />);
}
```

---

# 26. Bloque raw

`raw` conserva código JS/TS/TSX sin transformar.

## 26.1 Raw global

DRX:

```drx
raw
  export const dynamic = "force-dynamic"
  export const revalidate = 60
```

TSX:

```tsx
export const dynamic = "force-dynamic";
export const revalidate = 60;
```

## 26.2 Raw dentro de función

DRX:

```drx
async fn getData()
  raw
    const res = await fetch("https://api.example.com", {
      next: { revalidate: 60 }
    })
    return res.json()
```

TSX:

```tsx
async function getData() {
  const res = await fetch("https://api.example.com", {
    next: { revalidate: 60 },
  });
  return res.json();
}
```

## 26.3 Regla raw

El compilador debe quitar un nivel de indentación del contenido raw.

---

# 27. Comentarios

DRX:

```drx
// comentario
```

TSX:

```tsx
// comentario
```

Deben conservarse.

---

# 28. Ejemplo completo de página Next.js

Entrada `src-drx/app/page.drx`:

```drx
i Link f nl
i {Search,FileText,Sparkles} f lc

ed fn Page()
  ui
    <main .min-h-screen .bg-neutral-950 .text-white>
      <Hero />
      <Features />
      <CTA />
    </main>

fn Hero()
  ui
    <section .mx-auto .max-w-6xl .px-6 .py-24>
      <p .mb-4 .text-sm .font-semibold .text-blue-400>"LicitadovAI"</p>
      <h1 .max-w-3xl .text-5xl .font-bold .tracking-tight>
        "Analiza licitaciones públicas con IA"
      </h1>
      <p .mt-6 .max-w-2xl .text-lg .text-neutral-300>
        "Resume documentos, encuentra requisitos y decide mejor antes de presentarte."
      </p>
      <Link .mt-8 .inline-flex .rounded-xl .bg-blue-500 .px-6 .py-3 .font-semibold href="/app">
        "Probar gratis"
      </Link>
    </section>

fn Features()
  ui
    <section .mx-auto .grid .max-w-6xl .gap-6 .px-6 .pb-24 .md:grid-cols-3>
      <Feature icon=Search title="Busca" text="Encuentra oportunidades relevantes." />
      <Feature icon=FileText title="Resume" text="Convierte documentos largos en puntos claros." />
      <Feature icon=Sparkles title="Decide" text="Evalúa si merece la pena presentarte." />
    </section>

fn Feature({icon:Icon,title,text})
  ui
    <div .rounded-2xl .border .border-white/10 .bg-white/5 .p-6>
      <Icon .size-7 .text-blue-400 />
      <h2 .mt-5 .text-xl .font-bold>{title}</h2>
      <p .mt-2 .text-neutral-400>{text}</p>
    </div>

fn CTA()
  ui
    <section .mx-auto .max-w-6xl .px-6 .pb-24>
      <div .rounded-3xl .bg-white .p-10 .text-neutral-950>
        <h2 .text-3xl .font-bold>"Empieza con una licitación real"</h2>
        <p .mt-3 .text-neutral-600>"Pega el enlace o documento y obtén un primer resumen."</p>
        <Link .mt-6 .inline-flex .rounded-xl .bg-neutral-950 .px-6 .py-3 .font-semibold .text-white href="/app">
          "Abrir herramienta"
        </Link>
      </div>
    </section>
```

Salida esperada `src/app/page.tsx`:

```tsx
// Generated by DRX. Do not edit directly.
// Source: src-drx/app/page.drx

import Link from "next/link";
import { Search, FileText, Sparkles } from "lucide-react";

export default function Page() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Hero />
      <Features />
      <CTA />
    </main>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <p className="mb-4 text-sm font-semibold text-blue-400">LicitadovAI</p>
      <h1 className="max-w-3xl text-5xl font-bold tracking-tight">
        Analiza licitaciones públicas con IA
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-neutral-300">
        Resume documentos, encuentra requisitos y decide mejor antes de
        presentarte.
      </p>
      <Link
        className="mt-8 inline-flex rounded-xl bg-blue-500 px-6 py-3 font-semibold"
        href="/app"
      >
        Probar gratis
      </Link>
    </section>
  );
}

function Features() {
  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:grid-cols-3">
      <Feature
        icon={Search}
        title="Busca"
        text="Encuentra oportunidades relevantes."
      />
      <Feature
        icon={FileText}
        title="Resume"
        text="Convierte documentos largos en puntos claros."
      />
      <Feature
        icon={Sparkles}
        title="Decide"
        text="Evalúa si merece la pena presentarte."
      />
    </section>
  );
}

function Feature({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <Icon className="size-7 text-blue-400" />
      <h2 className="mt-5 text-xl font-bold">{title}</h2>
      <p className="mt-2 text-neutral-400">{text}</p>
    </div>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="rounded-3xl bg-white p-10 text-neutral-950">
        <h2 className="text-3xl font-bold">Empieza con una licitación real</h2>
        <p className="mt-3 text-neutral-600">
          Pega el enlace o documento y obtén un primer resumen.
        </p>
        <Link
          className="mt-6 inline-flex rounded-xl bg-neutral-950 px-6 py-3 font-semibold text-white"
          href="/app"
        >
          Abrir herramienta
        </Link>
      </div>
    </section>
  );
}
```

---

# 29. Arquitectura interna recomendada

Implementar en TypeScript para Node.js.

```txt
packages/drx/
  package.json
  tsconfig.json
  src/
    cli.ts
    config.ts
    index.ts
    parser/
      ast.ts
      lexer.ts
      parse.ts
      indentation.ts
      jsxLite.ts
    compiler/
      compile.ts
      generateTsx.ts
      generateImports.ts
      generateFunction.ts
      generateJsx.ts
      autoImports.ts
      format.ts
    commands/
      init.ts
      check.ts
      expand.ts
      watch.ts
    errors/
      DrxError.ts
    utils/
      fs.ts
      paths.ts
      strings.ts
  examples/
    counter.drx
    next-page.drx
  tests/
    parser.test.ts
    compiler.test.ts
    fixtures/
      counter/
        input.drx
        output.tsx
```

---

# 30. AST sugerido

```ts
export type DrxProgram = {
  type: "Program";
  body: DrxNode[];
};

export type DrxNode =
  | DirectiveNode
  | ImportNode
  | FunctionNode
  | ConstNode
  | LetNode
  | ReturnNode
  | StateNode
  | EffectNode
  | UiNode
  | RawNode
  | CommentNode
  | IfNode
  | ForNode
  | JsxElementNode
  | JsxTextNode
  | JsxExpressionNode;

export type DirectiveNode = {
  type: "Directive";
  value: string;
};

export type ImportNode = {
  type: "Import";
  defaultImport?: string;
  namedImports?: string[];
  source: string;
};

export type FunctionNode = {
  type: "Function";
  name: string;
  params: string;
  async: boolean;
  exportDefault: boolean;
  body: DrxNode[];
};

export type ConstNode = {
  type: "Const";
  left: string;
  value: string;
};

export type LetNode = {
  type: "Let";
  left: string;
  value: string;
};

export type ReturnNode = {
  type: "Return";
  value: string;
};

export type StateNode = {
  type: "State";
  name: string;
  initialValue: string;
};

export type EffectNode = {
  type: "Effect";
  deps: string;
  body: DrxNode[];
};

export type UiNode = {
  type: "Ui";
  children: JsxChildNode[];
};

export type JsxChildNode =
  | JsxElementNode
  | JsxTextNode
  | JsxExpressionNode
  | IfNode
  | ForNode
  | RawNode
  | CommentNode;

export type JsxElementNode = {
  type: "JsxElement";
  tag: string;
  classes: string[];
  props: JsxProp[];
  events: JsxEvent[];
  selfClosing: boolean;
  children: JsxChildNode[];
};

export type JsxProp = {
  name: string;
  value?: string;
  kind: "string" | "expression" | "boolean" | "number";
};

export type JsxEvent = {
  alias: string;
  name: string;
  value: string;
  kind: "expression";
};

export type JsxTextNode = {
  type: "JsxText";
  value: string;
};

export type JsxExpressionNode = {
  type: "JsxExpression";
  value: string;
};

export type RawNode = {
  type: "Raw";
  code: string;
};
```

---

# 31. Parser

## 31.1 Reglas de indentación

- Usar 2 espacios por nivel.
- Tabs prohibidos en MVP.
- Una línea más indentada pertenece al bloque anterior.
- El parser debe mantener número de línea para errores.

## 31.2 Líneas que abren bloque

Abren bloque:

```txt
fn
async fn
ed fn
ed async fn
ui
raw
ef
if
for
<elemento no self-closing>
```

## 31.3 Parsing recomendado

Fase 1:

1. Leer líneas.
2. Calcular indentación.
3. Crear árbol por indentación.
4. Clasificar cada línea.
5. Convertir a AST.

Fase 2:

Parsear JSX-lite dentro de `ui`.

---

# 32. Parsing JSX-lite

El parser JSX-lite debe reconocer:

```drx
<tag .class prop="value" prop=value @click={expr}>
```

Partes:

```txt
tag: tag
classes: [.class]
props: prop="value" / prop=value / prop={value}
events: @click={expr}
selfClosing: termina en />
children: por indentación o inline
```

## 32.1 Tags con cierre inline

Debe soportar:

```drx
<p>"Hola"</p>
```

## 32.2 Tags con hijos indentados

Debe soportar:

```drx
<div .p-6>
  <h1>"Hola"</h1>
</div>
```

## 32.3 Self closing

```drx
<Icon .size-6 />
```

## 32.4 Validación de cierre

Si aparece:

```drx
<div>
  <p>"Hola"</span>
</div>
```

Debe fallar.

---

# 33. Generador TSX

El generador debe:

1. Resolver aliases de imports.
2. Combinar imports de React si hay auto-imports.
3. Generar funciones.
4. Generar constantes.
5. Generar hooks.
6. Generar `return (...)` para `ui`.
7. Generar JSX estándar.
8. Convertir `.class` a `className`.
9. Convertir `@click` a `onClick`.
10. Convertir `<btn>` a `<button>`.
11. Aplicar Prettier si está activo.

---

# 34. Auto imports

Si el AST contiene `StateNode`, importar `useState`.

Si contiene `EffectNode`, importar `useEffect`.

Si el usuario ya declaró imports desde React, combinarlos.

DRX:

```drx
i {uE} f r

ed fn App()
  st count = 0
  ef [count]
    console.log(count)
```

TSX:

```tsx
import { useEffect, useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log(count);
  }, [count]);
}
```

---

# 35. Errores

Crear `DrxError`:

```ts
export class DrxError extends Error {
  code: string;
  file?: string;
  line?: number;
  column?: number;
  hint?: string;
}
```

Errores recomendados:

```txt
DRX_TAB_INDENT
DRX_INVALID_INDENT
DRX_INVALID_IMPORT
DRX_INVALID_FUNCTION
DRX_INVALID_STATE
DRX_INVALID_EFFECT
DRX_EMPTY_UI
DRX_UNKNOWN_EVENT
DRX_INVALID_JSX
DRX_UNCLOSED_TAG
DRX_MISMATCHED_TAG
DRX_INVALID_PROP
DRX_UNKNOWN_LINE
```

---

# 36. Testing

Usar Vitest.

Tests por fixtures:

```txt
tests/fixtures/counter/input.drx
tests/fixtures/counter/output.tsx
```

Casos mínimos:

1. directiva `"use client"`,
2. import default,
3. import named,
4. import aliases,
5. export default function,
6. function normal,
7. async function,
8. const,
9. let,
10. await,
11. state,
12. effect,
13. ui básico,
14. JSX-lite con clases,
15. props string,
16. props expresión,
17. props booleanas,
18. eventos,
19. tag alias `btn`,
20. raw global,
21. raw en función,
22. if,
23. for,
24. comentarios,
25. errores de evento desconocido,
26. errores de tag mal cerrado.

---

# 37. Package.json recomendado

```json
{
  "name": "dovreact",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "drx": "dist/cli.js",
    "dovreact": "dist/cli.js"
  },
  "scripts": {
    "build": "tsup src/cli.ts --format esm --dts --clean",
    "dev": "tsx src/cli.ts",
    "test": "vitest",
    "lint": "eslint ."
  },
  "dependencies": {
    "chokidar": "latest",
    "commander": "latest",
    "fast-glob": "latest",
    "fs-extra": "latest",
    "prettier": "latest"
  },
  "devDependencies": {
    "@types/node": "latest",
    "tsup": "latest",
    "tsx": "latest",
    "typescript": "latest",
    "vitest": "latest"
  }
}
```

---

# 38. Orden de implementación para Codex

## Paso 1

Crear proyecto TypeScript con CLI usando `commander`.

## Paso 2

Implementar `drx init`.

## Paso 3

Implementar carga de config.

## Paso 4

Implementar parser por líneas e indentación.

## Paso 5

Implementar AST básico.

## Paso 6

Implementar parser JSX-lite.

## Paso 7

Implementar generador TSX.

## Paso 8

Implementar auto-imports.

## Paso 9

Implementar `drx expand`.

## Paso 10

Implementar `drx check`.

## Paso 11

Añadir Prettier.

## Paso 12

Añadir tests con fixtures.

## Paso 13

Implementar `drx watch`.

---

# 39. Criterios de aceptación MVP

El MVP se considera válido si:

1. `pnpm drx init` crea config.
2. `pnpm drx check` valida archivos `.drx`.
3. `pnpm drx expand` genera `.tsx`.
4. Soporta imports.
5. Soporta funciones.
6. Soporta `st`.
7. Soporta `ui`.
8. Soporta JSX-lite con `<p></p>`, `{}`, `()`, props y clases.
9. Soporta eventos con `@click`.
10. Soporta `raw`.
11. La salida compila en Next.js.
12. Hay tests básicos.

---

# 40. Prompt oficial para IA

Este prompt sirve para que una IA programe directamente en DRX.

```txt
You are an expert DRX developer.

DRX is a compressed JSX-compatible syntax for React and Next.js.
You must output valid .drx files only.
Do not output TSX unless it is inside a raw block.
Use raw for unsupported React, Next.js or TypeScript syntax.

Core rules:
- i X f pkg = import X from pkg
- i {A,B} f pkg = import { A, B } from pkg
- r = react
- nl = next/link
- ni = next/image
- lc = lucide-react
- ed fn Name() = export default function Name()
- ed async fn Name() = export default async function Name()
- fn Name() = function Name()
- async fn Name() = async function Name()
- c name = value = const name = value
- l name = value = let name = value
- aw = await
- r value = return value
- st name = value = const [name, setName] = useState(value)
- ef [deps] = useEffect(() => {}, [deps])
- ui starts the JSX return block
- JSX-lite keeps <tag></tag>, {}, (), => and quoted strings
- .class inside a tag becomes className
- @click = onClick
- @change = onChange
- @submit = onSubmit
- <btn> becomes <button>
- raw preserves full JS/TS/TSX exactly

Prefer readable DRX over ultra-short DRX.
Keep variable and component names semantic.
Use quoted text inside JSX: <p>"Hello"</p>.
Use raw when the syntax is not clearly supported by DRX.
```

---

# 41. Ejemplo de petición a IA

Usuario:

```txt
Crea una landing Next.js en DRX para una herramienta de licitaciones con IA.
Usa Tailwind, lucide-react, hero, features y CTA.
Devuelve solo archivos .drx.
```

IA debe responder:

```drx
file src-drx/app/page.drx

i Link f nl
i {Search,FileText,Sparkles} f lc

ed fn Page()
  ui
    <main .min-h-screen .bg-zinc-950 .text-white>
      <section .mx-auto .max-w-6xl .px-6 .py-24>
        <h1 .text-5xl .font-bold>"Analiza licitaciones con IA"</h1>
        <p .mt-6 .text-zinc-300>"Resume documentos y encuentra oportunidades."</p>
        <Link .mt-8 .inline-flex .rounded-xl .bg-blue-500 .px-6 .py-3 href="/app">
          "Probar gratis"
        </Link>
      </section>
      <section .mx-auto .grid .max-w-6xl .gap-6 .px-6 .pb-24 .md:grid-cols-3>
        <Feature icon=Search title="Busca" text="Encuentra oportunidades relevantes." />
        <Feature icon=FileText title="Resume" text="Entiende documentos complejos." />
        <Feature icon=Sparkles title="Decide" text="Evalúa si merece la pena." />
      </section>
    </main>

fn Feature({icon:Icon,title,text})
  ui
    <div .rounded-2xl .border .border-white/10 .bg-white/5 .p-6>
      <Icon .size-7 .text-blue-400 />
      <h2 .mt-5 .text-xl .font-bold>{title}</h2>
      <p .mt-2 .text-zinc-400>{text}</p>
    </div>
```

---

# 42. Consistencia con IA: memoria, MCP y fuente oficial de verdad

Para que una IA programe en DRX de forma consistente, no hay que depender únicamente de que el modelo “recuerde” el lenguaje.

La arquitectura recomendada es crear una fuente oficial de verdad que la IA pueda consultar y validar.

DRX debe tener estas piezas:

```txt
DRX_SPEC.md          -> reglas oficiales del lenguaje
examples/*.drx       -> ejemplos buenos
schema/grammar       -> gramática o reglas parseables
pnpm drx check       -> validador
pnpm drx expand      -> compilador a TSX
MCP opcional         -> herramientas para que la IA valide/compile directamente
```

## 42.1 Cómo hacer que la IA “sepa” DRX

Hay varias formas, de menor a mayor integración:

### Nivel 1 — Prompt fijo

Pasar el prompt oficial DRX al inicio de cada conversación.

Ventaja: simple.

Desventaja: consume tokens y puede olvidarse si la conversación es larga.

### Nivel 2 — Instrucciones del proyecto

En Codex, Cursor, Claude Projects o un GPT personalizado, incluir:

```txt
You are coding in DRX.
Read DRX_SPEC.md before modifying files.
Always output valid .drx.
Run drx check after changes.
Run drx expand to generate TSX.
```

Ventaja: mucho más consistente.

### Nivel 3 — Archivo de contexto automático

Crear un comando:

```bash
pnpm drx ai-context
```

Este comando genera un resumen compacto para IA:

```txt
DRX AI CONTEXT
- Core syntax
- Project aliases
- Existing components
- Existing routes
- Examples
```

La IA puede recibir este bloque antes de programar.

### Nivel 4 — MCP server

Crear un MCP server para DRX.

El MCP expondría herramientas como:

```txt
drx_get_spec
  Devuelve la especificación compacta actual.

drx_check
  Valida uno o varios archivos .drx.

drx_expand
  Compila .drx a .tsx.

drx_create_app
  Genera un proyecto React/Next inicial.

drx_list_examples
  Lista ejemplos oficiales.

drx_get_example
  Devuelve un ejemplo concreto.
```

Así la IA no depende solo del prompt: puede consultar y ejecutar herramientas.

Flujo ideal con MCP:

```txt
Usuario: crea una app Next en DRX
IA llama drx_get_spec
IA escribe archivos .drx
IA llama drx_check
Si falla, corrige
IA llama drx_expand
Usuario ejecuta pnpm dev
```

## 42.2 Regla de consistencia para IA

Toda IA que programe DRX debe seguir esta regla:

```txt
1. Escribir .drx.
2. Validar con drx check.
3. Corregir hasta que check pase.
4. Expandir con drx expand.
5. No editar .tsx generado directamente, salvo que el usuario lo pida.
```

## 42.3 DRX como lenguaje “con memoria”

En la práctica, la memoria no debe estar en el modelo, sino en el repositorio:

```txt
.drx/rules.md
.drx/examples/
.drx/ai-context.md
.drx/grammar.json
.drx/config.json
```

La IA debe leer esos archivos antes de trabajar.

Ejemplo de estructura:

```txt
project/
  .drx/
    rules.md
    ai-context.md
    examples/
      counter.drx
      landing.drx
      form.drx
    grammar.json
  drx.config.json
  src-drx/
  src/
```

## 42.4 Prompt de sistema recomendado para Codex

```txt
You are working in a DRX project.
DRX is a compressed JSX-lite syntax that compiles to React/Next TSX.
Before editing, read .drx/rules.md and drx.config.json.
Edit source files in src-drx only.
Do not edit generated src TSX files directly unless explicitly requested.
After changes, run pnpm drx check.
If check passes, run pnpm drx expand.
If check fails, fix the DRX source and retry.
Use raw blocks for unsupported React, Next.js or TypeScript syntax.
Prefer readable DRX over ultra-short DRX.
```

---

# 43. Crear proyectos: `pnpm create drx-app`

DRX debe poder crear proyectos nuevos de React o Next.js.

Comando recomendado:

```bash
pnpm create drx-app
```

O también:

```bash
pnpm create drx-app my-app
pnpm create drx-app my-app --template next-ts
pnpm create drx-app my-app --template react-ts
```

## 43.1 Plantillas iniciales

Plantillas mínimas:

```txt
next-ts       Next.js + TypeScript + App Router + Tailwind + DRX
next-js       Next.js + JavaScript + App Router + Tailwind + DRX
react-ts      Vite + React + TypeScript + Tailwind + DRX
react-js      Vite + React + JavaScript + Tailwind + DRX
```

Plantillas futuras:

```txt
next-dashboard-ts
next-saas-ts
react-spa-ts
laravel-react-ts
```

## 43.2 Flujo interactivo

Si el usuario ejecuta:

```bash
pnpm create drx-app
```

Preguntar:

```txt
Project name: my-drx-app
Framework: Next.js / React Vite
Language: TypeScript / JavaScript
Tailwind: yes / no
Use src directory: yes / no
Install dependencies: pnpm / npm / yarn / skip
```

## 43.3 Flujo directo

Ejemplos:

```bash
pnpm create drx-app licitadov --template next-ts
pnpm create drx-app counter --template react-ts
pnpm create drx-app demo --template next-js --no-install
```

## 43.4 Resultado para Next.js TSX

```txt
my-app/
  package.json
  next.config.ts
  tsconfig.json
  tailwind.config.ts
  postcss.config.mjs
  drx.config.json
  .drx/
    rules.md
    ai-context.md
    examples/
      counter.drx
      landing.drx
  src-drx/
    app/
      layout.drx
      page.drx
    components/
      Button.drx
      Card.drx
  src/
    app/
      layout.tsx
      page.tsx
    components/
      Button.tsx
      Card.tsx
```

## 43.5 Resultado para React Vite TSX

```txt
my-app/
  package.json
  index.html
  vite.config.ts
  tsconfig.json
  tailwind.config.ts
  postcss.config.js
  drx.config.json
  .drx/
    rules.md
    ai-context.md
    examples/
      counter.drx
      landing.drx
  src-drx/
    main.drx
    App.drx
    components/
      Button.drx
  src/
    main.tsx
    App.tsx
    components/
      Button.tsx
```

## 43.6 Scripts package.json generados

Para Next.js:

```json
{
  "scripts": {
    "dev": "drx expand && next dev",
    "build": "drx expand && next build",
    "start": "next start",
    "drx:check": "drx check",
    "drx:expand": "drx expand",
    "drx:watch": "drx watch"
  }
}
```

Para Vite React:

```json
{
  "scripts": {
    "dev": "drx expand && vite",
    "build": "drx expand && vite build",
    "preview": "vite preview",
    "drx:check": "drx check",
    "drx:expand": "drx expand",
    "drx:watch": "drx watch"
  }
}
```

## 43.7 `create-drx-app` package

Crear un paquete separado:

```txt
packages/create-drx-app/
  package.json
  src/
    cli.ts
    templates.ts
    copyTemplate.ts
    install.ts
  templates/
    next-ts/
    next-js/
    react-ts/
    react-js/
```

Package name recomendado:

```txt
create-drx-app
```

Para que funcione:

```bash
pnpm create drx-app
```

El nombre del paquete npm debe ser `create-drx-app`.

## 43.8 Monorepo recomendado

```txt
drx/
  package.json
  pnpm-workspace.yaml
  packages/
    drx/
      src/
      package.json
    create-drx-app/
      src/
      templates/
      package.json
    drx-mcp/
      src/
      package.json
```

---

# 44. Soporte JSX / TSX / JS / TS

DRX debe permitir generar diferentes extensiones según plantilla y configuración.

Config:

```json
{
  "language": "typescript",
  "jsxRuntime": "react-jsx",
  "outputExtension": ".tsx"
}
```

Opciones:

```txt
language: typescript -> .tsx
language: javascript -> .jsx
```

Para archivos no JSX en el futuro:

```txt
.drx.ts -> .ts
.drx.js -> .js
```

Pero MVP:

```txt
.drx -> .tsx o .jsx según config
```

## 44.1 Next.js TypeScript

```json
{
  "framework": "next",
  "language": "typescript",
  "outDir": "src",
  "outputExtension": ".tsx"
}
```

## 44.2 Next.js JavaScript

```json
{
  "framework": "next",
  "language": "javascript",
  "outDir": "src",
  "outputExtension": ".jsx"
}
```

## 44.3 React Vite TypeScript

```json
{
  "framework": "react-vite",
  "language": "typescript",
  "outDir": "src",
  "outputExtension": ".tsx"
}
```

## 44.4 React Vite JavaScript

```json
{
  "framework": "react-vite",
  "language": "javascript",
  "outDir": "src",
  "outputExtension": ".jsx"
}
```

---

# 45. MCP server DRX — fase recomendada

Crear paquete:

```txt
packages/drx-mcp/
```

Objetivo: permitir que asistentes IA consulten, validen y compilen DRX sin depender solo de memoria.

Herramientas MCP recomendadas:

## 45.1 `drx_get_spec`

Devuelve la especificación compacta de DRX.

## 45.2 `drx_get_project_context`

Lee:

```txt
drx.config.json
.drx/ai-context.md
src-drx/**/*.drx
```

Devuelve un resumen del proyecto.

## 45.3 `drx_check`

Input:

```json
{
  "files": [
    {
      "path": "src-drx/app/page.drx",
      "content": "..."
    }
  ]
}
```

Output:

```json
{
  "ok": true,
  "errors": []
}
```

O:

```json
{
  "ok": false,
  "errors": [
    {
      "file": "src-drx/app/page.drx",
      "line": 12,
      "code": "DRX_UNKNOWN_EVENT",
      "message": "Unknown event alias @clik",
      "hint": "Did you mean @click?"
    }
  ]
}
```

## 45.4 `drx_expand`

Compila DRX a TSX y devuelve el resultado.

## 45.5 `drx_create_app_plan`

Devuelve los archivos que habría que crear para una plantilla.

Input:

```json
{
  "name": "my-app",
  "template": "next-ts"
}
```

Output:

```json
{
  "files": [
    {
      "path": "package.json",
      "content": "..."
    },
    {
      "path": "src-drx/app/page.drx",
      "content": "..."
    }
  ]
}
```

---

# 46. Futuro del proyecto

Después del MVP:

1. `tsx -> drx` con Babel/SWC/TypeScript AST.
2. `drx roundtrip` para verificar equivalencia.
3. VS Code extension con syntax highlighting.
4. LSP con errores en tiempo real.
5. `drx pack` para comprimir contexto de proyecto para IA.
6. `drx apply` para aplicar patches generados por IA.
7. `drx fix` para autocorrecciones.
8. Soporte para metadata de Next.js.
9. Soporte para server actions.
10. Soporte para route handlers.
11. Modo ultra-short opcional.
12. Modo readable opcional.
13. MCP server oficial.
14. `create-drx-app`.

---

# 47. Resumen ejecutivo para Codex

Construir una CLI llamada `drx` en TypeScript.

La CLI debe compilar archivos `.drx` a `.tsx`.

DRX debe ser una sintaxis JSX-lite comprimida para React/Next.js:

```drx
i {uS} f r

ed fn Counter()
  st count = 0

  ui
    <main .p-6>
      <h1>"Contador"</h1>
      <btn @click={() => setCount(count + 1)}>"Sumar"</btn>
    </main>
```

Debe generar:

```tsx
import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <main className="p-6">
      <h1>Contador</h1>
      <button onClick={() => setCount(count + 1)}>Sumar</button>
    </main>
  );
}
```

Prioridad absoluta:

1. `.drx -> .tsx`,
2. parser por indentación,
3. JSX-lite,
4. `st`,
5. `ui`,
6. imports abreviados,
7. clases comprimidas,
8. eventos comprimidos,
9. `raw`,
10. tests.

No crear framework. No ejecutar Next. No sustituir React.

Solo generar TSX estándar compatible.

---

Sí, también. Pero para componentes conviene que sean alias explícitos en configuración, no automáticos, para evitar líos.

Por ejemplo:

<Ca title="Busca" text="Encuentra oportunidades relevantes." />
<ImgC src="/hero.png" alt="Hero" />
<FtC icon=Search title="Resume" text="Entiende documentos largos." />

Compila a:

<Card title="Busca" text="Encuentra oportunidades relevantes." />
<ImageCard src="/hero.png" alt="Hero" />
<FeatureCard icon={Search} title="Resume" text="Entiende documentos largos." />

He añadido esto a la documentación.

La configuración podría quedar así:

{
"componentAliases": {
"Ca": "Card",
"LC": "ListCard",
"ImgC": "ImageCard",
"FtC": "FeatureCard",
"Btn": "Button",
"In": "Input",
"Md": "Modal"
}
}

Y una regla importante:

<btn>"Guardar"</btn>

sería HTML:

<button>Guardar</button>

Pero:

<Btn>"Guardar"</Btn>

sería componente:

<Button>Guardar</Button>

Usaría esta convención:

HTML aliases en minúscula:
m, s, d, btn, inp, frm

Component aliases en Pascal abreviado:
Ca, FtC, ImgC, Btn, Md, Tbl

No haría que Ca sea Card automáticamente si no está en drx.config.json, porque puede romper nombres reales como Calendar, Canvas, Carousel, etc.

Para el MVP, el alias solo cambia el nombre:

<Ca />

a:

<Card />

Y el import lo pones tú:

i Card f "@/components/Card"

Más adelante sí se podría hacer auto-import:

{
"componentAliases": {
"Ca": {
"name": "Card",
"import": "@/components/Card"
}
}
}

Entonces usando:

<Ca title="Hola" />

ya podría generar también:

import Card from "@/components/Card"

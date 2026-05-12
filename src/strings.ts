export function setterName(name: string) {
  return `set${name.charAt(0).toUpperCase()}${name.slice(1)}`
}

export function replaceAw(value: string) {
  return value.replace(/\baw\b/g, "await")
}

export function normalizeParams(params: string) {
  return params
    .replace(/\{\s*/g, "{ ")
    .replace(/\s*\}/g, " }")
    .replace(/,\s*/g, ", ")
    .replace(/:\s*/g, ": ")
    .replace(/\s+/g, " ")
    .replace(/\{\s+\}/g, "{}")
    .trim()
}

export function splitTopLevel(input: string) {
  const tokens: string[] = []
  let current = ""
  let quote: string | null = null
  let braceDepth = 0
  let parenDepth = 0
  let bracketDepth = 0

  for (const char of input) {
    if (quote) {
      current += char
      if (char === quote) quote = null
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      current += char
      continue
    }
    if (char === "{") braceDepth++
    if (char === "}") braceDepth--
    if (char === "(") parenDepth++
    if (char === ")") parenDepth--
    if (char === "[") bracketDepth++
    if (char === "]") bracketDepth--
    if (/\s/.test(char) && braceDepth === 0 && parenDepth === 0 && bracketDepth === 0) {
      if (current) tokens.push(current)
      current = ""
      continue
    }
    current += char
  }
  if (current) tokens.push(current)
  return tokens
}

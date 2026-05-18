import { DrxConfig } from "./config.js";
import { DrxError } from "./errors.js";
import { splitTopLevel } from "./strings.js";

type TagMatch = {
  full: string;
  closing: boolean;
  tag: string;
  attrs: string;
  selfClosing: boolean;
};

export function transformJsxLite(
  lines: string[],
  config: DrxConfig,
  file?: string,
) {
  const output: string[] = [];

  for (const item of lines) {
    const lineNo = Number(item.slice(0, item.indexOf(":")));
    const source = item.slice(item.indexOf(":") + 1);
    const transformed = transformLine(source, config, file, lineNo);
    output.push(transformed);
  }

  return output.join("\n");
}

function transformLine(
  line: string,
  config: DrxConfig,
  file: string | undefined,
  lineNo: number,
) {
  if (/^\s*if\s+/.test(line))
    return line.replace(/^(\s*)if\s+(.+)$/, "$1{$2 && (");
  if (/^\s*for\s+/.test(line)) {
    return line.replace(
      /^(\s*)for\s+(.+)\s+as\s+([A-Za-z_$][\w$]*)(?:\s*,\s*([A-Za-z_$][\w$]*))?\s*$/,
      (_, indent, list, item, index) => {
        const args = index ? `${item}, ${index}` : item;
        return `${indent}{${list}.map((${args}) => (`;
      },
    );
  }

  const matches = scanTags(line);
  let result = "";
  let cursor = 0;
  for (const match of matches) {
    const transformed = transformTag(match, config, file, lineNo);
    const start = line.indexOf(match.full, cursor);
    result += line.slice(cursor, start) + transformed;
    cursor = start + match.full.length;
  }
  result += line.slice(cursor);

  return result;
}

function scanTags(line: string): TagMatch[] {
  const matches: TagMatch[] = [];
  let i = 0;
  let braceDepth = 0;
  let quote: string | null = null;

  while (i < line.length) {
    const char = line[i];
    if (quote) {
      if (char === quote) quote = null;
      i++;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      i++;
      continue;
    }
    if (char === "{") {
      braceDepth++;
      i++;
      continue;
    }
    if (char === "}") {
      if (braceDepth > 0) braceDepth--;
      i++;
      continue;
    }

    if (char === "<" && /[A-Za-z/]/.test(line[i + 1] ?? "")) {
      const start = i;
      let tagQuote: string | null = null;
      let tagBraceDepth = 0;
      let tagBracketDepth = 0;
      i++;
      while (i < line.length) {
        const tChar = line[i];
        if (tagQuote) {
          if (tChar === tagQuote) tagQuote = null;
          i++;
          continue;
        }
        if (tChar === '"' || tChar === "'") {
          tagQuote = tChar;
          i++;
          continue;
        }
        if (tChar === "{") tagBraceDepth++;
        if (tChar === "}") {
          if (tagBraceDepth > 0) tagBraceDepth--;
        }
        if (tChar === "[") tagBracketDepth++;
        if (tChar === "]") {
          if (tagBracketDepth > 0) tagBracketDepth--;
        }
        if (tChar === ">" && tagBraceDepth === 0 && tagBracketDepth === 0)
          break;
        i++;
      }
      if (line[i] !== ">") {
        // Tag didn't close properly, just break
        break;
      }
      const full = line.slice(start, i + 1);
      const parsed = full.match(/^<\/?\s*([A-Za-z][\w.]*)\b([\s\S]*?)\/?\s*>$/);
      if (parsed) {
        matches.push({
          full,
          closing: full.startsWith("</"),
          tag: parsed[1],
          attrs: parsed[2] ?? "",
          selfClosing: /\/\s*>$/.test(full),
        });
      }
      i++;
      continue;
    }

    i++;
  }
  return matches;
}

function transformTag(
  match: TagMatch,
  config: DrxConfig,
  file: string | undefined,
  line: number,
) {
  const tag = resolveTag(match.tag, config);
  if (match.closing) {
    return `</${tag}>`;
  }

  const attrs = transformAttrs(
    match.attrs.replace(/\/\s*$/, "").trim(),
    config,
    file,
    line,
  );
  const close = match.selfClosing ? " />" : ">";
  return `<${tag}${attrs ? ` ${attrs}` : ""}${close}`;
}

function resolveTag(tag: string, config: DrxConfig) {
  if (/^[A-Z]/.test(tag)) return config.componentAliases[tag] ?? tag;
  return config.tagAliases[tag] ?? tag;
}

function transformAttrs(
  source: string,
  config: DrxConfig,
  file: string | undefined,
  line: number,
) {
  if (!source) return "";
  const tokens = splitTopLevel(source);
  const classes: string[] = [];
  const attrs: string[] = [];
  let classNameIndex = -1;

  for (const token of tokens) {
    if (token.startsWith(".")) {
      classes.push(token.slice(1));
      continue;
    }
    if (token.startsWith("@")) {
      const [alias, rawValue] = splitAttr(token);
      const eventName = config.eventAliases[alias];
      if (!eventName) {
        throw new DrxError({
          code: "DRX_UNKNOWN_EVENT",
          message: `Unknown event alias "${alias}".`,
          file,
          line,
          hint: alias === "@clik" ? 'Did you mean "@click"?' : undefined,
        });
      }
      attrs.push(`${eventName}={${stripBraces(rawValue ?? "")}}`);
      continue;
    }
    const [name, rawValue] = splitAttr(token);
    if (rawValue === undefined) {
      attrs.push(name);
      continue;
    }
    const value = formatPropValue(rawValue);
    if (name === "className") classNameIndex = attrs.length;
    attrs.push(`${name}=${value}`);
  }

  if (classes.length) {
    if (classNameIndex >= 0) {
      attrs[classNameIndex] = attrs[classNameIndex].replace(
        /className="([^"]*)"/,
        (_, value) => `className="${value} ${classes.join(" ")}"`,
      );
    } else {
      attrs.unshift(`className="${classes.join(" ")}"`);
    }
  }

  return attrs.join(" ");
}

function splitAttr(token: string): [string, string?] {
  if (token.startsWith("{") && token.endsWith("}")) return [token];
  const index = token.indexOf("=");
  if (index === -1) return [token];
  return [token.slice(0, index), token.slice(index + 1)];
}

function stripBraces(value: string) {
  if (value.startsWith("{") && value.endsWith("}")) return value.slice(1, -1);
  return value;
}

function formatPropValue(value: string) {
  if (value.startsWith('"') && value.endsWith('"')) {
    if (value.includes('\\"')) return `{${value}}`;
    return value;
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    if (value.includes("\\'")) return `{${value}}`;
    return value;
  }
  if (value.startsWith("{") && value.endsWith("}")) return value;
  return `{${value}}`;
}

function unquoteTextOutsideTags(line: string) {
  let result = "";
  let i = 0;
  let braceDepth = 0;
  let bracketDepth = 0;
  let inTag = false;
  let quote: string | null = null;

  while (i < line.length) {
    const char = line[i];
    if (quote) {
      result += char;
      if (char === quote) quote = null;
      i++;
      continue;
    }
    if (char === '"' || char === "'") {
      if (!inTag && braceDepth === 0) {
        if (char === '"') {
          i++;
          continue;
        }
      }
      quote = char;
      result += char;
      i++;
      continue;
    }
    if (char === "{") {
      braceDepth++;
      result += char;
      i++;
      continue;
    }
    if (char === "}") {
      if (braceDepth > 0) braceDepth--;
      result += char;
      i++;
      continue;
    }
    if (char === "[") {
      bracketDepth++;
      result += char;
      i++;
      continue;
    }
    if (char === "]") {
      if (bracketDepth > 0) bracketDepth--;
      result += char;
      i++;
      continue;
    }
    if (char === "<" && braceDepth === 0) {
      inTag = true;
      result += char;
      i++;
      continue;
    }
    if (char === ">" && inTag && bracketDepth === 0) {
      inTag = false;
      result += char;
      i++;
      continue;
    }
    result += char;
    i++;
  }
  return result;
}

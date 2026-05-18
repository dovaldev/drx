import { FunctionBodyNode, Node, Program } from "./ast.js";
import { DrxConfig } from "./config.js";
import { DrxError } from "./errors.js";
import { transformJsxLite } from "./jsx.js";
import { replaceAw, setterName } from "./strings.js";

type Line = {
  no: number;
  indent: number;
  text: string;
  rawText: string;
};

export function parseDrx(
  source: string,
  config: DrxConfig,
  file?: string,
): Program {
  const lines = toLines(source, file);
  const nodes: Node[] = [];
  let usesState = false;
  let usesEffect = false;
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (line.indent !== 0) {
      throw new DrxError({
        code: "DRX_INVALID_INDENT",
        message: "Top-level lines must not be indented.",
        file,
        line: line.no,
      });
    }

    const parsed = parseTopLevel(lines, index, config, file);
    index = parsed.next;
    if (parsed.usesState) usesState = true;
    if (parsed.usesEffect) usesEffect = true;
    nodes.push(parsed.node);
  }

  return { nodes, usesState, usesEffect };
}

function toLines(source: string, file?: string): Line[] {
  return source
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((raw, i) => {
      if (/^\s*\t/.test(raw)) {
        throw new DrxError({
          code: "DRX_TAB_INDENT",
          message: "Tabs are not allowed for indentation. Use spaces instead.",
          file,
          line: i + 1,
        });
      }
      const spaces = raw.match(/^ */)?.[0].length ?? 0;

      // Buff de QoL: Auto-limpieza de la hitbox.
      // En lugar de tirar un insta-ban por espacios impares, redondeamos hacia abajo.
      // 3 espacios = 1 indent, 5 espacios = 2 indents.
      const indent = Math.floor(spaces / 2);

      return { no: i + 1, indent, text: raw.trim(), rawText: raw };
    })
    .filter((line) => line.text.length > 0);
}

function parseTopLevel(
  lines: Line[],
  index: number,
  config: DrxConfig,
  file?: string,
) {
  const line = lines[index];

  if (/^"[^"]+"$/.test(line.text)) {
    return {
      node: { type: "directive", value: line.text } as Node,
      next: index + 1,
    };
  }
  if (line.text.startsWith("//")) {
    return {
      node: { type: "comment", code: line.text, line: line.no } as Node,
      next: index + 1,
    };
  }
  if (line.text.startsWith("i ")) {
    let importText = line.text;
    let importIndex = index;

    // Check if it's a multi-line import (unclosed brace)
    if (/^i\s+\{/.test(importText) && !importText.includes("}")) {
      while (importIndex + 1 < lines.length) {
        importIndex++;
        importText += " " + lines[importIndex].text;
        if (lines[importIndex].text.includes("}")) {
          break;
        }
      }
      // Continue grabbing until 'f' source is found if it was pushed to next line
      while (importIndex + 1 < lines.length && !/\s+f\s+/.test(importText)) {
        importIndex++;
        importText += " " + lines[importIndex].text;
      }
    }

    const match = importText.match(/^i\s+(.+)\s+f\s+(.+)$/);
    if (!match) {
      throw new DrxError({
        code: "DRX_INVALID_IMPORT",
        message: `Invalid import. Expected: i Name f source or i {A,B} f source.\nGot: ${importText}`,
        file,
        line: line.no,
      });
    }
    return {
      node: {
        type: "import",
        imported: match[1].trim(),
        source: match[2].trim(),
        line: line.no,
      } as Node,
      next: importIndex + 1,
    };
  }
  if (line.text === "raw" || line.text === "raw ```") {
    if (line.text === "raw ```") {
      const block = collectRawBackticks(lines, index);
      return {
        node: { type: "raw", code: block.text, line: line.no } as Node,
        next: block.next,
      };
    }
    const block = collectBlock(lines, index, 1);
    return {
      node: { type: "raw", code: block.text, line: line.no } as Node,
      next: block.next,
    };
  }

  let fnText = line.text;
  let fnIndex = index;
  if (
    /^(?:(?:ed|ex)\s+)?(?:async\s+)?fn\s+[A-Za-z_$][\w$]*(?:<.*>)?\(/.test(
      fnText,
    ) &&
    !fnText.match(/\)\s*(?::\s*.+)?$/)
  ) {
    while (fnIndex + 1 < lines.length) {
      fnIndex++;
      fnText += " " + lines[fnIndex].text;
      if (lines[fnIndex].text.match(/\)\s*(?::\s*.+)?$/)) {
        break;
      }
    }
  }

  const fn = parseFunctionHeader(fnText);
  if (fn) {
    const block = collectFunctionBody(lines, fnIndex, config, file);
    return {
      node: {
        type: "function",
        ...fn,
        body: block.body,
        line: line.no,
      } as Node,
      next: block.next,
      usesState: block.usesState,
      usesEffect: block.usesEffect,
    };
  }

  if (config.keepUnknownAsRaw) {
    return {
      node: { type: "raw", code: line.text, line: line.no } as Node,
      next: index + 1,
    };
  }

  throw new DrxError({
    code: "DRX_UNKNOWN_LINE",
    message: `Unknown DRX line: ${line.text}`,
    file,
    line: line.no,
  });
}

function parseFunctionHeader(text: string) {
  const match = text.match(
    /^(?:(ed|ex)\s+)?(async\s+)?fn\s+([A-Za-z_$][\w$]*)(<.*>)?\((.*)\)(:\s*.+)?$/,
  );
  if (!match) return null;
  return {
    exportDefault: match[1] === "ed",
    exportNamed: match[1] === "ex",
    async: Boolean(match[2]),
    name: match[3],
    typeParams: match[4] || "",
    params: match[5],
    returnType: match[6] || "",
  };
}

function collectFunctionBody(
  lines: Line[],
  start: number,
  config: DrxConfig,
  file?: string,
) {
  const body: FunctionBodyNode[] = [];
  let usesState = false;
  let usesEffect = false;
  let index = start + 1;
  const baseIndent = lines[start].indent + 1;

  while (index < lines.length && lines[index].indent >= baseIndent) {
    const line = lines[index];

    if (line.text.startsWith("//")) {
      body.push({ type: "comment", code: line.text, line: line.no });
      index++;
      continue;
    }
    if (line.text === "ui") {
      const block = collectBlock(lines, index, baseIndent + 1);
      if (!block.text.trim()) {
        throw new DrxError({
          code: "DRX_EMPTY_UI",
          message: "ui block cannot be empty.",
          file,
          line: line.no,
        });
      }
      body.push({
        type: "ui",
        jsx: transformJsxLite(block.numberedLines, config, file),
        line: line.no,
      });
      index = block.next;
      continue;
    }
    if (line.text === "raw" || line.text === "raw ```") {
      if (line.text === "raw ```") {
        const block = collectRawBackticks(lines, index);
        body.push({ type: "raw", code: block.text, line: line.no });
        index = block.next;
        continue;
      }
      const block = collectBlock(lines, index, baseIndent + 1);
      body.push({ type: "raw", code: block.text, line: line.no });
      index = block.next;
      continue;
    }

    if (line.text.startsWith("ef ")) {
      let efText = line.text;
      let efIndex = index;
      if (/^ef\s+\[/.test(efText) && !efText.endsWith("]")) {
        while (efIndex + 1 < lines.length) {
          efIndex++;
          efText +=
            "\n" +
            "  ".repeat(Math.max(0, lines[efIndex].indent - line.indent)) +
            lines[efIndex].text;
          if (lines[efIndex].text.endsWith("]")) {
            break;
          }
        }
      }
      const match = efText.match(/^ef\s+(\[[\s\S]*\])$/);
      if (!match)
        throw new DrxError({
          code: "DRX_INVALID_EFFECT",
          message: "Invalid effect. Expected: ef [deps].",
          file,
          line: line.no,
        });

      const block = collectBlock(lines, efIndex, baseIndent + 1);
      usesEffect = true;
      body.push({
        type: "effect",
        deps: match[1],
        code: block.text,
        line: line.no,
      });
      index = block.next;
      continue;
    }

    const stmt = collectStatement(lines, index);
    const stmtText = stmt.text;
    index = stmt.next;

    if (stmtText.startsWith("st ")) {
      const match = stmtText.match(/^st\s+([A-Za-z_$][\w$]*)\s*=\s*([\s\S]+)$/);
      if (!match)
        throw new DrxError({
          code: "DRX_INVALID_STATE",
          message: "Invalid state. Expected: st name = initialValue.",
          file,
          line: line.no,
        });
      usesState = true;
      const cleanValue = replaceAw(match[2]);
      body.push({
        type: "statement",
        code: `const [${match[1]}, ${setterName(match[1])}] = useState(${cleanValue})${cleanValue.includes("\n") ? "" : ";"}`,
        line: line.no,
      });
      continue;
    }

    body.push({
      type: "statement",
      code: transformStatement(stmtText),
      line: line.no,
    });
  }

  return { body, next: index, usesState, usesEffect };
}

function transformStatement(text: string) {
  if (text.startsWith("c "))
    return text.replace(/^c\s+(.+?)\s*=\s*([\s\S]+)$/, (_, left, value) => {
      // If it spans multiple lines, keep it as is, otherwise add semicolon
      const cleanValue = replaceAw(value);
      return `const ${left} = ${cleanValue}${cleanValue.includes("\n") ? "" : ";"}`;
    });
  if (text.startsWith("l "))
    return text.replace(/^l\s+(.+?)\s*=\s*([\s\S]+)$/, (_, left, value) => {
      const cleanValue = replaceAw(value);
      return `let ${left} = ${cleanValue}${cleanValue.includes("\n") ? "" : ";"}`;
    });
  if (text.startsWith("r ")) {
    const cleanValue = replaceAw(text.slice(2).trim());
    return `return ${cleanValue}${cleanValue.includes("\n") ? "" : ";"}`;
  }
  return replaceAw(text);
}

function collectBlock(lines: Line[], start: number, childIndent: number) {
  const body: string[] = [];
  const numberedLines: string[] = [];
  let index = start + 1;
  while (index < lines.length && lines[index].indent >= childIndent) {
    const line = lines[index];
    const trimLevels = Math.min(line.indent, childIndent);
    const prefix = "  ".repeat(line.indent - trimLevels);
    body.push(`${prefix}${line.text}`);
    numberedLines.push(`${line.no}:${prefix}${line.text}`);
    index++;
  }
  return { text: body.join("\n"), numberedLines, next: index };
}

function collectStatement(lines: Line[], start: number) {
  let index = start + 1;
  const baseIndent = lines[start].indent;
  const parts = [lines[start].text];

  let braceDepth = 0;
  let parenDepth = 0;
  let bracketDepth = 0;

  function updateDepths(text: string) {
    // Strip strings and regexes to safely count brackets
    const cleanText = text
      .replace(/\\./g, "") // remove escaped chars
      .replace(/"[^"]*"/g, "") // remove double quote strings
      .replace(/'[^']*'/g, "") // remove single quote strings
      .replace(/`[^`]*`/g, ""); // remove template strings (single line)

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      if (char === "{") braceDepth++;
      if (char === "}") braceDepth--;
      if (char === "(") parenDepth++;
      if (char === ")") parenDepth--;
      if (char === "[") bracketDepth++;
      if (char === "]") bracketDepth--;
    }
  }

  updateDepths(lines[start].text);

  while (index < lines.length) {
    const isContinuation = lines[index].indent > baseIndent;
    const isUnclosed = braceDepth > 0 || parenDepth > 0 || bracketDepth > 0;

    if (!isContinuation && !isUnclosed) {
      break;
    }

    const extraIndent = Math.max(0, lines[index].indent - baseIndent);
    const prefix = "  ".repeat(extraIndent);
    parts.push(prefix + lines[index].text);

    updateDepths(lines[index].text);
    index++;
  }

  return { text: parts.join("\n"), next: index };
}

function collectRawBackticks(lines: Line[], start: number) {
  let index = start + 1;
  const body: string[] = [];
  const baseSpaces = lines[start].rawText.match(/^ */)?.[0].length ?? 0;

  while (index < lines.length) {
    const line = lines[index];
    if (line.text === "\`\`\`") {
      index++;
      break;
    }
    const prefixToRemove = " ".repeat(baseSpaces);
    let adjustedLine = line.rawText;
    if (adjustedLine.startsWith(prefixToRemove)) {
      adjustedLine = adjustedLine.slice(prefixToRemove.length);
    }
    body.push(adjustedLine);
    index++;
  }
  return { text: body.join("\n"), next: index };
}

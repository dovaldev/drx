import fs from "node:fs/promises";
import path from "node:path";

export type DrxConfig = {
  sourceDir: string;
  outDir: string;
  framework: "next" | "react";
  mode: "jsx-lite";
  generatedHeader: boolean;
  formatWithPrettier: boolean;
  autoImportHooks: boolean;
  keepUnknownAsRaw: boolean;
  aliases: Record<string, string>;
  namedAliases: Record<string, string>;
  tagAliases: Record<string, string>;
  componentAliases: Record<string, string>;
  eventAliases: Record<string, string>;
  ignore: string[];
};

export const defaultConfig: DrxConfig = {
  sourceDir: "src-drx",
  outDir: ".",
  framework: "next",
  mode: "jsx-lite",
  generatedHeader: true,
  formatWithPrettier: true,
  autoImportHooks: true,
  keepUnknownAsRaw: false,
  aliases: {
    r: "react",
    nl: "next/link",
    ni: "next/image",
    lc: "lucide-react",
    fm: "framer-motion",
    rq: "@tanstack/react-query",
  },
  namedAliases: {
    uS: "useState",
    uE: "useEffect",
    uM: "useMemo",
    uC: "useCallback",
    uR: "useRef",
    uCtx: "useContext",
  },
  tagAliases: {
    m: "main",
    s: "section",
    d: "div",
    sp: "span",
    btn: "button",
    hdr: "header",
    ftr: "footer",
    art: "article",
    frm: "form",
    lbl: "label",
    inp: "input",
    ta: "textarea",
    sel: "select",
    opt: "option",
  },
  componentAliases: {},
  eventAliases: {
    "@click": "onClick",
    "@change": "onChange",
    "@submit": "onSubmit",
    "@input": "onInput",
    "@focus": "onFocus",
    "@blur": "onBlur",
    "@key": "onKeyDown",
  },
  ignore: [
    "**/node_modules/**",
    "**/.next/**",
    "**/dist/**",
    "**/.drx/**",
    "**/src-drx/**",
  ],
};

export async function loadConfig(cwd = process.cwd()): Promise<DrxConfig> {
  const configPath = path.join(cwd, "drx.config.json");
  if (!(await pathExists(configPath))) return defaultConfig;
  const userConfig = JSON.parse(await fs.readFile(configPath, "utf8"));
  return {
    ...defaultConfig,
    ...userConfig,
    aliases: { ...defaultConfig.aliases, ...userConfig.aliases },
    namedAliases: { ...defaultConfig.namedAliases, ...userConfig.namedAliases },
    tagAliases: { ...defaultConfig.tagAliases, ...userConfig.tagAliases },
    componentAliases: {
      ...defaultConfig.componentAliases,
      ...userConfig.componentAliases,
    },
    eventAliases: { ...defaultConfig.eventAliases, ...userConfig.eventAliases },
    ignore: userConfig.ignore ?? defaultConfig.ignore,
  };
}

export async function writeDefaultConfig(cwd = process.cwd()) {
  const configPath = path.join(cwd, "drx.config.json");
  await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
  return configPath;
}

async function pathExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

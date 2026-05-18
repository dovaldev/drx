import { describe, expect, it } from "vitest";
import {
  setterName,
  replaceAw,
  normalizeParams,
  splitTopLevel,
} from "../src/strings.js";

describe("strings utilities", () => {
  it("generates correct setter names", () => {
    expect(setterName("count")).toBe("setCount");
    expect(setterName("user")).toBe("setUser");
  });

  it("replaces aw with await", () => {
    expect(replaceAw("aw fetchData()")).toBe("await fetchData()");
    expect(replaceAw("const x = aw y")).toBe("const x = await y");
  });

  it("normalizes function parameters", () => {
    expect(normalizeParams("{a,b}")).toBe("{ a, b }");
    expect(normalizeParams("props:{id:string}")).toBe("props: { id: string }");
  });

  it("splits top-level tokens correctly", () => {
    const input = '.p-4 @click={() => console.log("hi")} data={{a: 1}}';
    const tokens = splitTopLevel(input);
    expect(tokens).toEqual([
      ".p-4",
      '@click={() => console.log("hi")}',
      "data={{a: 1}}",
    ]);
  });
});

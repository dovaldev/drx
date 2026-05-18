import { describe, expect, it } from "vitest";
import { transformJsxLite } from "../src/jsx.js";
import { defaultConfig } from "../src/config.js";
import { DrxError } from "../src/errors.js";

describe("transformJsxLite", () => {
  it("transforms tag aliases", () => {
    const input = ["1:<m>", "2:  <d />", "3:</m>"];
    const output = transformJsxLite(input, defaultConfig);
    expect(output).toContain("<main>");
    expect(output).toContain("<div />");
    expect(output).toContain("</main>");
  });

  it("transforms dot classes into className", () => {
    const input = ["1:<d .p-4 .bg-red-500 />"];
    const output = transformJsxLite(input, defaultConfig);
    expect(output).toContain('<div className="p-4 bg-red-500" />');
  });

  it("merges dot classes with existing className", () => {
    const input = ['1:<d className="flex" .p-4 />'];
    const output = transformJsxLite(input, defaultConfig);
    expect(output).toContain('<div className="flex p-4" />');
  });

  it("transforms event aliases", () => {
    const input = ["1:<btn @click={handleClick} />"];
    const output = transformJsxLite(input, defaultConfig);
    expect(output).toContain("<button onClick={handleClick} />");
  });

  it("transforms if and for control flow", () => {
    const input = [
      "1:if show",
      "2:  <p>Visible</p>",
      "3:for items as item",
      "4:  <p>{item}</p>",
    ];
    const output = transformJsxLite(input, defaultConfig);
    expect(output).toContain("{show && (");
    expect(output).toContain("{items.map((item) => (");
  });

  it("handles complex attributes and nested braces", () => {
    const input = [
      '1:<Card data={{ a: 1 }} @click={() => console.log("hi")} />',
    ];
    const output = transformJsxLite(input, defaultConfig);
    expect(output).toContain("data={{ a: 1 }}");
    expect(output).toContain('onClick={() => console.log("hi")}');
  });

  it("throws error on unknown event aliases", () => {
    const input = ["1:<btn @clik=save />"];
    expect(() => transformJsxLite(input, defaultConfig)).toThrow(DrxError);
    expect(() => transformJsxLite(input, defaultConfig)).toThrow(
      /Unknown event alias "@clik"/,
    );
  });
});

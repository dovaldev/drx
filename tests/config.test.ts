import { describe, expect, it, vi } from "vitest";
import { loadConfig, defaultConfig } from "../src/config.js";
import fs from "node:fs/promises";
import path from "node:path";

vi.mock("node:fs/promises");

describe("loadConfig", () => {
  it("returns default config if file does not exist", async () => {
    vi.mocked(fs.access).mockRejectedValue(new Error("File not found"));
    const config = await loadConfig();
    expect(config).toEqual(defaultConfig);
  });

  it("merges user config with default config", async () => {
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue(
      JSON.stringify({
        framework: "react",
        aliases: {
          custom: "custom-package",
        },
      }),
    );

    const config = await loadConfig();
    expect(config.framework).toBe("react");
    expect(config.aliases.custom).toBe("custom-package");
    expect(config.aliases.r).toBe("react"); // default alias preserved
  });
});

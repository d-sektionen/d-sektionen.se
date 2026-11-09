import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("content checkout", () => {
  it("includes the legacy redirect data needed for builds", () => {
    const redirects = JSON.parse(
      readFileSync("src/content/legacy-redirects.json", "utf8"),
    );
    expect(Object.keys(redirects).length).toBeGreaterThan(0);
  });
});

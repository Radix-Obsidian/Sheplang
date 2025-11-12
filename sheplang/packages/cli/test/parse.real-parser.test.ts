import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { writeFileSync, unlinkSync } from "node:fs";
import { describe, test, expect } from "vitest";

const CLI = resolve(__dirname, "../dist/index.js");

describe("parse command", () => {
  test("parse uses real language and errors on invalid syntax", () => {
    const bad = resolve(__dirname, "bad.shep");
    writeFileSync(bad, "!!! not valid shep !!!", "utf8");
    let threw = false;
    try {
      execFileSync("node", [CLI, "parse", bad], { stdio: "pipe" });
    } catch {
      threw = true;
    } finally {
      try { unlinkSync(bad); } catch {}
    }
    expect(threw).toBe(true);
  });
});

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export function writeTextFileSync(path: string, content: string) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

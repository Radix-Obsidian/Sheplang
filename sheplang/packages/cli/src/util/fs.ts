import { mkdirSync as nodeMkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export { nodeMkdirSync as mkdirSync };

export function writeTextFileSync(path: string, content: string) {
  nodeMkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

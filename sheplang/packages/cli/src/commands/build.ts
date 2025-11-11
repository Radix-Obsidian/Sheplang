import { readFileSync } from "node:fs";
import { resolve, basename } from "node:path";
import { transpileShepToBoba } from "@adapters/sheplang-to-boba";
import { writeTextFileSync } from "../util/fs.js";

export async function cmdBuild(args: string[], flags: Record<string, any>) {
  const file = args[0];
  if (!file) throw new Error("build: missing <file>");
  const outDir = resolve(String(flags.out ?? "dist"));
  const src = readFileSync(file, "utf8");
  const { code } = transpileShepToBoba(src);
  const outFile = resolve(outDir, basename(file).replace(/\.shep$/i, ".boba"));
  writeTextFileSync(outFile, code);
  console.log(outFile);
}

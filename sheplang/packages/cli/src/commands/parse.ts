import { transpileShepToBoba } from "@adapters/sheplang-to-boba";
import { readFileSync } from "node:fs";

export async function cmdParse(args: string[]) {
  const file = args[0];
  if (!file) throw new Error("parse: missing <file>");
  const src = readFileSync(file, "utf8");
  const { canonicalAst } = transpileShepToBoba(src);
  console.log(JSON.stringify(canonicalAst, null, 2));
}

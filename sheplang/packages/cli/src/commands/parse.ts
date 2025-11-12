import { parseShep } from "@sheplang/language";
import { readFileSync } from "node:fs";

export async function cmdParse(args: string[]) {
  const file = args[0];
  if (!file) throw new Error("parse: missing <file>");
  const src = readFileSync(file, "utf8");
  const result = await parseShep(src);
  console.log(JSON.stringify(result.appModel, null, 2));
}

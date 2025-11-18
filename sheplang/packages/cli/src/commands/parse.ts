import { parseShep } from "@radix-obsidian/sheplang-language";
import { readFileSync } from "node:fs";

export async function cmdParse(args: string[]) {
  const file = args[0];
  if (!file) throw new Error("parse: missing <file>");
  const src = readFileSync(file, "utf8");
  const result = await parseShep(src, file);
  
  // Check for parse errors
  if (!result.success || result.diagnostics.some(d => d.severity === 'error')) {
    console.error('Parse errors:');
    for (const diagnostic of result.diagnostics) {
      if (diagnostic.severity === 'error') {
        console.error(`  ${diagnostic.message} at line ${diagnostic.start.line}`);
      }
    }
    process.exit(1);
  }
  
  console.log(JSON.stringify(result.appModel, null, 2));
}

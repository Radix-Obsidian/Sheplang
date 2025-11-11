import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import { transpileShepToBoba } from "@adapters/sheplang-to-boba";

export async function cmdStats() {
  const exDir = resolve(process.cwd(), "examples");
  let files: string[] = [];
  try {
    files = readdirSync(exDir).filter(f => f.endsWith(".shep")).map(f => join(exDir, f));
  } catch {}
  let totalChars = 0;
  for (const f of files) totalChars += readFileSync(f, "utf8").length;
  const sample = files[0];
  let emitted = 0;
  if (sample) {
    const { code } = transpileShepToBoba(readFileSync(sample, "utf8"));
    emitted = code.length;
  }
  const repoSize = dirSize(resolve(process.cwd()));
  console.log(JSON.stringify({
    examples: files.length,
    exampleChars: totalChars,
    emittedSampleBytes: emitted,
    repoSizeBytes: repoSize
  }, null, 2));
}

function dirSize(dir: string): number {
  let sum = 0;
  try {
    for (const e of readdirSync(dir)) {
      const p = join(dir, e);
      // Skip node_modules
      if (e === "node_modules" || e === ".git") continue;
      
      const s = statSync(p, { throwIfNoEntry: false });
      if (!s) continue;
      if (s.isDirectory()) sum += dirSize(p);
      else sum += s.size;
    }
  } catch (err) {
    // Ignore errors (e.g. permission denied)
  }
  return sum;
}

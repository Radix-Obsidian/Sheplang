import { readFileSync } from "node:fs";
import { transpileShepToBoba } from "@radix-obsidian/sheplang-to-boba";

export async function cmdExplain(args: string[]) {
  const file = args[0];
  if (!file) throw new Error("explain: missing <file>");
  const src = readFileSync(file, "utf8");
  const { canonicalAst, output: code } = await transpileShepToBoba(src);

  const components = (canonicalAst.body ?? []).filter((n: any) => n.type === "ComponentDecl").map((n: any) => n.name);
  const routes = (canonicalAst.body ?? []).filter((n: any) => n.type === "RouteDecl").map((n: any) => `${n.path} -> ${n.target}`);
  const states = (canonicalAst.body ?? []).filter((n: any) => n.type === "StateDecl").map((n: any) => n.name);

  console.log(`Explain — ${file}
Components: ${components.join(", ") || "(none)"}
Routes:     ${routes.join(", ") || "(none)"}
State:      ${states.join(", ") || "(none)"}

Emitted BobaScript (canonical):
--------------------------------
${code || "(no output)"}`);
}

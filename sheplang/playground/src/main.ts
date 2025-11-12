import { parseShep } from "@sheplang/language";
import { transpileShepToBoba } from "@adapters/sheplang-to-boba";

const input = document.querySelector<HTMLTextAreaElement>("#src")!;
const ast = document.querySelector<HTMLPreElement>("#ast")!;
const boba = document.querySelector<HTMLPreElement>("#boba")!;
const h1 = document.querySelector<HTMLHeadingElement>("#title")!;

async function render() {
  try {
    const src = input.value;
    // Ensure the real parser throws on invalid syntax
    await parseShep(src);
    const { code, canonicalAst } = await transpileShepToBoba(src as any);
    boba.textContent = code;
    ast.textContent = JSON.stringify(canonicalAst, null, 2);
    h1.textContent = findTitle(canonicalAst) ?? findAppName(canonicalAst) ?? "Preview";
  } catch (e: any) {
    boba.textContent = `ERROR: ${e?.message ?? String(e)}`;
  }
}

input.addEventListener("input", () => { void render(); });
void render();

function findTitle(ast: any): string | null {
  const q = [...(ast?.body ?? [])];
  while (q.length) {
    const n = q.shift();
    if (n?.type === "Text" && typeof n.value === "string") return n.value;
    if (Array.isArray(n?.children)) q.push(...n.children);
    if (Array.isArray(n?.body)) q.push(...n.body);
  }
  return null;
}

function findAppName(ast: any): string | null {
  const n = (ast?.body ?? []).find((x: any) => x?.type === "ComponentDecl");
  return n?.name ?? null;
}

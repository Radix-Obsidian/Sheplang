import { transpileShepToBoba } from "@adapters/sheplang-to-boba";
import { EXAMPLES } from "./examples.js";

const input = document.querySelector<HTMLTextAreaElement>("#src")!;
const ast = document.querySelector<HTMLPreElement>("#ast")!;
const boba = document.querySelector<HTMLPreElement>("#boba")!;
const h1 = document.querySelector<HTMLHeadingElement>("#title")!;
const picker = document.querySelector<HTMLSelectElement>("#picker")!;
const btnBoba = document.querySelector<HTMLButtonElement>("#copy-boba")!;
const btnAst = document.querySelector<HTMLButtonElement>("#copy-ast")!;
const toast = document.querySelector<HTMLSpanElement>("#copy-toast")!;

function render() {
  try {
    const src = input.value;
    const { code, canonicalAst } = transpileShepToBoba(src);
    boba.textContent = code;
    ast.textContent = JSON.stringify(canonicalAst, null, 2);
    h1.textContent = findTitle(canonicalAst) ?? findAppName(canonicalAst) ?? "Preview";
  } catch (e: any) {
    boba.textContent = `ERROR: ${e?.message ?? String(e)}`;
  }
}

input.addEventListener("input", () => render());

// Init picker + default example
for (const ex of EXAMPLES) {
  const opt = document.createElement("option");
  opt.value = ex.name;
  opt.textContent = ex.name;
  picker.appendChild(opt);
}
picker.addEventListener("change", () => {
  const ex = EXAMPLES.find((e) => e.name === picker.value)!;
  input.value = ex.source.trim() + "\n";
  render();
});
picker.value = EXAMPLES[0].name;
input.value = EXAMPLES[0].source.trim() + "\n";
render();

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

// Clipboard helpers
async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    flash("Copied!");
  } catch {
    flash("Copy failed");
  }
}

function flash(msg: string) {
  toast.textContent = msg;
  setTimeout(() => (toast.textContent = ""), 1200);
}

btnBoba.addEventListener("click", () => copy(boba.textContent ?? ""));
btnAst.addEventListener("click",  () => copy(ast.textContent ?? ""));

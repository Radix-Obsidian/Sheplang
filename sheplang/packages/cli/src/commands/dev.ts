import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import chokidar from "chokidar";
import { transpileShepToBoba } from "@radix-obsidian/sheplang-to-boba";
import { createPreviewServer, broadcastReload } from "../server/preview.js";

function debounce<T extends (...a: any[]) => void>(fn: T, ms: number) {
  let t: any;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export async function cmdDev(args: string[], flags: Record<string, any>) {
  const file = args[0];
  if (!file) throw new Error("dev: missing <file>");
  const port = Number(flags.port ?? 8787);
  const watcher = chokidar.watch([resolve(file)], { ignoreInitial: true });

  let currentHTML = await readPreviewHTML(file);
  const server = await createPreviewServer(port, () => currentHTML);

  const rebuild = debounce(async () => {
    try {
      currentHTML = await readPreviewHTML(file);
      server.updateHTML(currentHTML);
      broadcastReload();
      // eslint-disable-next-line no-console
      console.log("[HMR] reloaded");
    } catch (e) {
      console.error("[dev] rebuild error:", e);
    }
  }, 100);

  watcher.on("add", rebuild).on("change", rebuild).on("unlink", rebuild);
  console.log(`dev server running at http://localhost:${port}`);
}

async function readPreviewHTML(file: string): Promise<string> {
  const src = readFileSync(file, "utf8");
  const { output: code, canonicalAst } = await transpileShepToBoba(src);
  // Minimal deterministic preview. We render:
  // - <h1> from first Text node OR {App.name} if present.
  // - Include the BobaScript output in a <pre> for inspection.
  const title = findTitle(canonicalAst) ?? findAppName(canonicalAst) ?? "Preview";
  const escaped = (code || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<!doctype html>
<html>
<head><meta charset="utf-8"><title>${title}</title></head>
<body>
  <h1>${title}</h1>
  <pre id="boba">${escaped}</pre>
  <script>
    const ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/_hmr');
    ws.onmessage = (ev) => { if (ev.data === 'reload') location.reload(); };
  </script>
</body>
</html>`;
}

// AST helpers (types are intentionally structural to avoid import-cycle)
function findTitle(ast: any): string | null {
  const stack: any[] = Array.isArray(ast?.body) ? [...ast.body] : [];
  while (stack.length) {
    const n = stack.shift();
    if (n?.type === "Text" && typeof n.value === "string") {
      // Use first text node as H1 (matches VERIFY check for "MyTodos")
      return n.value;
    }
    if (Array.isArray(n?.children)) stack.push(...n.children);
    if (Array.isArray(n?.body)) stack.push(...n.body);
  }
  return null;
}

function findAppName(ast: any): string | null {
  const node = (ast?.body ?? []).find((x: any) => x?.type === "ComponentDecl" && typeof x?.name === "string");
  return node?.name ?? null;
}

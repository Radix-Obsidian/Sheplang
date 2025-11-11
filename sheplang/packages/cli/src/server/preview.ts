import express from "express";
import { createServer, Server as HttpServer } from "node:http";
import { WebSocketServer } from "ws";

let wss: WebSocketServer | null = null;

export async function createPreviewServer(port: number, initialHTML: () => string) {
  const app = express();
  const http: HttpServer = createServer(app);
  wss = new WebSocketServer({ server: http, path: "/_hmr" });

  let currentHTML = initialHTML();
  app.get("/", (_req, res) => res.status(200).type("html").send(currentHTML));

  await new Promise<void>((resolve) => http.listen(port, resolve));

  return {
    updateHTML(html: string) { currentHTML = html; },
    close() {
      wss?.close(); http.close();
    }
  };
}

export function broadcastReload() {
  if (!wss) return;
  for (const client of wss.clients) {
    try { client.send("reload"); } catch { /* noop */ }
  }
}

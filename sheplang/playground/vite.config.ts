import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: { outDir: "dist" },
  resolve: {
    alias: {
      "@sheplang/language": path.resolve(__dirname, "../packages/language/dist/src/index.js"),
      "@adapters/sheplang-to-boba": path.resolve(__dirname, "../../adapters/sheplang-to-boba/dist/index.js"),
    },
  },
  optimizeDeps: {
    include: ["monaco-editor"],
  },
});

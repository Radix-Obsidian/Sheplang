import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { comlink } from 'vite-plugin-comlink'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    comlink(), // Add Comlink BEFORE React
    react()
  ],
  worker: {
    plugins: () => [comlink()]
  },
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist'
  },
  resolve: {
    alias: {
      '@sheplang/shepthon': path.resolve(__dirname, '../sheplang/packages/shepthon/src/index.ts')
    }
  }
})

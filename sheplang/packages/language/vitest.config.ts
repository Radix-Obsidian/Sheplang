import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts']
  },
  resolve: {
    conditions: ['node'],
    extensions: ['.ts', '.js', '.mjs', '.json']
  },
  esbuild: {
    // Handle .js imports resolving to .ts files (ESM TypeScript pattern)
    tsconfigRaw: {
      compilerOptions: {
        module: 'ESNext',
        moduleResolution: 'bundler'
      }
    }
  }
});

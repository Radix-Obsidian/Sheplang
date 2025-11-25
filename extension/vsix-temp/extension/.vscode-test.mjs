import { defineConfig } from '@vscode/test-cli';

export default defineConfig([
  {
    label: 'battleTests',
    files: 'out/test/**/*.test.js',
    version: 'stable',
    workspaceFolder: './test-workspace',
    mocha: {
      ui: 'bdd',
      timeout: 20000
    }
  }
]);

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseAndMap } from '@goldensheepai/sheplang-language';
import { transpile } from '../src/transpiler';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..', '..', '..');

function read(p: string) {
  return readFileSync(resolve(repoRoot, p), 'utf8');
}

describe('codegen snapshots', () => {
  it('todo.shep → valid TS files', async () => {
    const src = read('examples/todo.shep');
    const { diagnostics, appModel } = await parseAndMap(src, 'file://todo.shep');
    expect(diagnostics.length).toBe(0);
    const gen = transpile(appModel!);

    // snapshot each file content
    for (const f of gen.files) {
      expect(`// FILE: ${f.path}\n${f.content}`).toMatchSnapshot();
    }

    // Basic validation: files exist and have content
    expect(gen.files.length).toBeGreaterThan(0);
    expect(gen.files.find(f => f.path === 'tsconfig.json')).toBeDefined();
    expect(gen.files.find(f => f.path.startsWith('models/'))).toBeDefined();
    expect(gen.files.find(f => f.path.startsWith('views/'))).toBeDefined();
    expect(gen.files.find(f => f.path.startsWith('actions/'))).toBeDefined();
    expect(gen.files.find(f => f.path === 'index.ts')).toBeDefined();
    
    // TODO: Add proper compilation check by writing to temp dir and running tsc
  });
});

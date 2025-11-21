import { describe, it, expect } from 'vitest';
import { parseAndMap } from '../src/index';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
// from packages/language/test → repo root = ../../..
const repoRoot = resolve(__dirname, '..', '..', '..');
const read = (p: string) => readFileSync(resolve(repoRoot, p), 'utf8');

describe('parser → AppModel', () => {
  it('parses examples/todo.shep and maps to expected AppModel', async () => {
    const src = read('examples/todo.shep');
    const res = await parseAndMap(src, 'file://todo.shep');
    expect(res.diagnostics.length).toBe(0);
    // Get correct path to fixtures within the language package
    const expected = JSON.parse(readFileSync(resolve(__dirname, 'fixtures/appmodel.todo.json'), 'utf8'));
    expect(res.appModel).toEqual(expected);
  });

  it('parses a simple flow declaration', async () => {
    const src = `app TestApp

flow CreateUser:
  from: UserForm
  trigger: "User clicks Create"
  steps:
    - "Validate input"
    - "Create user record"`;

    const res = await parseAndMap(src, 'file://flow.shep');
    expect(res.diagnostics.length).toBe(0);
    expect(res.appModel.flows).toBeDefined();
    expect(res.appModel.flows).toHaveLength(1);
    const flow = res.appModel.flows![0];
    expect(flow.name).toBe('CreateUser');
    expect(flow.from).toBe('UserForm');
    expect(flow.trigger).toBe('User clicks Create');
    expect(flow.steps).toHaveLength(2);
    expect(flow.steps[0].description).toBe('Validate input');
  });
});

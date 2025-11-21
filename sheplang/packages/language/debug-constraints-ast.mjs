import { parseShep } from './dist/index.js';
import fs from 'node:fs';

async function main() {
  const src = fs.readFileSync('debug-constraints.shep', 'utf8');
  const r = await parseShep(src, 'debug-constraints.shep');
  console.log('success:', r.success);
  if (!r.success) {
    console.log('diagnostics:', r.diagnostics.map(d => d.message));
    return;
  }
  const userDecl = r.ast.app.decls[0];
  const summary = userDecl.fields.map(f => ({
    name: f.name,
    constraints: f.constraints.map(c => ({
      kind: c.kind,
      max: c.max,
      hasValue: !!c.value,
      valueLiteral: c.value && typeof c.value === 'object' ? c.value.value : c.value
    }))
  }));
  console.log(JSON.stringify(summary, null, 2));
}

main().catch(console.error);

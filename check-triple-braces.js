import { generateApp } from './sheplang/packages/compiler/dist/index.js';
import fs from 'fs';

const source = fs.readFileSync('examples/phase2-complete-test.shep', 'utf-8');
const result = await generateApp(source);
const api = result.output.files['api/routes/state-transitions.ts'];

const hasTriple = api.includes('{{{');
console.log('Has triple braces:', hasTriple);

if (hasTriple) {
  const lines = api.split('\n');
  lines.forEach((line, i) => {
    if (line.includes('{{{')) {
      console.log(`Line ${i+1}: ${line}`);
    }
  });
} else {
  console.log('✅ No triple braces found - code is clean!');
}

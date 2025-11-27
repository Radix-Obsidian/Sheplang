/**
 * Debug Test 7 - Multiple models
 */

import { generateApp } from './sheplang/packages/compiler/dist/index.js';

(async function() {

const code = `
app MultiApp {
  data Task {
    fields: {
      title: text
    }
  }
  
  data Note {
    fields: {
      content: text
    }
  }
  
  data Comment {
    fields: {
      text: text
    }
  }
  
  view Dashboard { list Task }
}`;

console.log('Testing multiple models...\n');

const result = await generateApp(code);

console.log('Success:', result.success);
console.log('Has output:', !!result.output);
if (result.diagnostics && result.diagnostics.length > 0) {
  console.log('Diagnostics:', JSON.stringify(result.diagnostics, null, 2));
}

if (result.output) {
  const hookFiles = Object.keys(result.output.files).filter(f => f.startsWith('hooks/use'));
  console.log('\nHook files generated:');
  hookFiles.forEach(f => console.log(`  - ${f}`));
} else {
  console.log('\nNo output generated');
}

})();

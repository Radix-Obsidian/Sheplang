/**
 * Debug Phase 7 failing tests
 */

import { generateApp } from './sheplang/packages/compiler/dist/index.js';

// Test case that's failing
const code = `
app SocialApp {
  data Message {
    fields: {
      content: text
    }
  }
  view MessageFeed { list Message }
}`;

console.log('Testing code:');
console.log(code);
console.log('\n' + '='.repeat(60) + '\n');

const result = await generateApp(code);

console.log('Result success:', result.success);
console.log('Result output:', result.output ? 'exists' : 'NULL');
console.log('Result error:', result.error);
console.log('Full result object:');
console.log(JSON.stringify(result, null, 2));

if (result.output) {
  console.log('\nGenerated files:');
  const fileKeys = Object.keys(result.output.files);
  console.log('Total files:', fileKeys.length);
  fileKeys.forEach(key => {
    console.log(`  - ${key}`);
  });
  
  if (result.output.files['screens/MessageFeed.tsx']) {
    console.log('\nMessageFeed.tsx preview:');
    const content = result.output.files['screens/MessageFeed.tsx'];
    console.log(content.substring(0, 500));
  }
}

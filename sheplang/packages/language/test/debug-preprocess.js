import { preprocessWithMap } from '../dist/preprocessor.js';

const testCode = `
app TestApp

action testIf(x):
  if x > 10:
    show BigView
  else:
    show SmallView

view BigView:
  button "OK" -> testIf
`;

console.log('Original:');
console.log(testCode);
console.log('\nPreprocessed:');
const result = preprocessWithMap(testCode);
console.log(result.text);

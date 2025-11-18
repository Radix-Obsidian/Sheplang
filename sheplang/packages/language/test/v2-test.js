import { parseShep } from '../dist/index.js';
import { readFileSync } from 'fs';

async function testV2() {
  console.log('Testing ShepLang v2.0 Enterprise Features...\n');
  
  // Simple if/else test
  const simpleIf = `
app TestApp

action testIf(x):
  if x > 10:
    show BigView
  else:
    show SmallView

view BigView:
  button "OK" -> testIf

view SmallView:
  button "OK" -> testIf
  `;
  
  console.log('Test 1: Simple if/else');
  try {
    const result1 = await parseShep(simpleIf);
    console.log('✅ Parsed successfully');
    console.log('Actions:', result1.appModel.actions[0].ops[0].kind);
  } catch (e) {
    console.log('❌ Failed:', e.message);
  }
  
  // For loop test
  const forLoop = `
app TestApp

data Item:
  fields:
    name: text

action processItems():
  for i from 0 to 10:
    add Item with name="item"
  show Dashboard

view Dashboard:
  list Item
  `;
  
  console.log('\nTest 2: For loop');
  try {
    const result2 = await parseShep(forLoop);
    console.log('✅ Parsed successfully');
    console.log('For loop type:', result2.appModel.actions[0].ops[0].type);
  } catch (e) {
    console.log('❌ Failed:', e.message);
  }
  
  // Update/Delete test
  const updateDelete = `
app TestApp

data User:
  fields:
    name: text
    active: yes/no

action updateUser(userId, newName):
  update User where id=userId set name=newName
  show Dashboard

action deleteUser(userId):
  delete User where id=userId
  show Dashboard

view Dashboard:
  list User
  `;
  
  console.log('\nTest 3: Update/Delete statements');
  try {
    const result3 = await parseShep(updateDelete);
    console.log('✅ Parsed successfully');
    console.log('Operations:', result3.appModel.actions.map(a => a.ops[0].kind));
  } catch (e) {
    console.log('❌ Failed:', e.message);
  }
  
  // Expression test
  const expressions = `
app TestApp

action calculate(x, y):
  result = x + y * 2
  if result > 100 and x < 50:
    show BigResult
  else if result < 0 or y == 0:
    show SmallResult
  else:
    show NormalResult

view BigResult:
  button "OK" -> calculate

view SmallResult:
  button "OK" -> calculate

view NormalResult:
  button "OK" -> calculate
  `;
  
  console.log('\nTest 4: Complex expressions');
  try {
    const result4 = await parseShep(expressions);
    console.log('✅ Parsed successfully');
    const assign = result4.appModel.actions[0].ops[0];
    console.log('Assignment:', assign.kind, '- target:', assign.target);
  } catch (e) {
    console.log('❌ Failed:', e.message);
  }
  
  console.log('\n✨ ShepLang v2.0 Test Complete!');
}

testV2().catch(console.error);

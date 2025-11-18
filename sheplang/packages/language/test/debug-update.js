import { parseShep } from '../dist/index.js';

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

console.log('Testing UPDATE/DELETE...\n');

try {
  const result = await parseShep(updateDelete);
  
  if (result.success) {
    console.log('✅ Parse succeeded');
    console.log('App model:', JSON.stringify(result.appModel, null, 2));
  } else {
    console.log('❌ Parse failed');
    console.log('Diagnostics:', result.diagnostics);
  }
} catch (e) {
  console.log('❌ Exception:', e.message);
  console.log('Stack:', e.stack);
}

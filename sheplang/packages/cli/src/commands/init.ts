import { writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const TODO_TEMPLATE = `app MyTodos

data Todo:
  fields:
    title: text
    done: yes/no
  rules:
    - "user can update own items"

view Dashboard:
  list Todo
  button "Add Task" -> CreateTodo

action CreateTodo(title):
  add Todo with title, done=false
  show Dashboard
`;

export async function cmdInit(args: string[]) {
  const template = args[0] ?? 'todo';

  if (template !== 'todo') {
    throw new Error(`init: unknown template "${template}". Supported templates: todo`);
  }

  const outFile = resolve(process.cwd(), 'todo.shep');

  if (existsSync(outFile)) {
    throw new Error(`init: ${outFile} already exists`);
  }

  writeFileSync(outFile, TODO_TEMPLATE, 'utf8');

  console.log(`Created ${outFile}`);
  console.log('');
  console.log('Next steps:');
  console.log('  sheplang build todo.shep --target boba');
  console.log('  sheplang dev todo.shep');
}

import { writeFileSync, mkdirSync } from 'fs';
import { generateApp } from './sheplang/packages/compiler/dist/index.js';
import { readFileSync } from 'fs';

async function generateRealApp() {
  console.log('🚀 Generating full-stack app from todo.shep...\n');
  
  const shepSource = readFileSync('./sheplang/examples/todo.shep', 'utf-8');
  const result = await generateApp(shepSource, 'todo.shep');
  
  if (!result.success) {
    console.log('❌ Compilation failed:');
    console.log(result.diagnostics);
    return;
  }
  
  // Create output directory
  mkdirSync('./generated-todo-app', { recursive: true });
  
  // Write all files
  Object.entries(result.output.files).forEach(([path, content]) => {
    const fullPath = './generated-todo-app/' + path;
    
    // Create directory if needed
    const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
    if (dir && dir !== './generated-todo-app') {
      mkdirSync(dir, { recursive: true });
    }
    
    writeFileSync(fullPath, content);
  });
  
  console.log('✅ App generated in ./generated-todo-app/');
  console.log('📁 Files created:');
  Object.keys(result.output.files).forEach(path => console.log(`  - ${path}`));
  
  console.log('\n🎯 Next steps:');
  console.log('1. cd generated-todo-app');
  console.log('2. pnpm install');
  console.log('3. pnpm run dev');
  console.log('4. Open http://localhost:3001');
  
  console.log('\n💡 The app will use your Neon database!');
  console.log('   - API at http://localhost:3001/api/todos');
  console.log('   - Uses @goldensheepai/sheplang-database');
  console.log('   - Full CRUD operations');
}

generateRealApp();

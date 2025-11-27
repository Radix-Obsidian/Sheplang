// Test Phase II parsing
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the language service
import { parseShep } from './sheplang/packages/language/dist/index.js';

async function testPhase2Parsing() {
  console.log('🧪 Testing Phase II Parsing...');
  
  try {
    // Read the test file
    const testFile = path.join(__dirname, 'examples', 'contextual-keywords-test.shep');
    const content = fs.readFileSync(testFile, 'utf-8');
    
    console.log('📄 Test file content:');
    console.log(content);
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Parse the file
    console.log('🔍 Parsing...');
    const result = await parseShep(content, 'phase2-test.shep');
    
    if (!result.success) {
      console.log('❌ Parsing Errors:');
      result.diagnostics.forEach(diagnostic => {
        console.log(`  - ${diagnostic.message} at line ${diagnostic.start.line}`);
      });
      return false;
    }
    
    console.log('✅ Parsing successful!');
    console.log('📊 Parsed structure:');
    
    const ast = result.ast;
    if (ast && ast.app) {
      const app = ast.app;
      console.log(`App: ${app.name}`);
      console.log(`Declarations: ${app.decls.length}`);
      
      app.decls.forEach(decl => {
        console.log(`  - ${decl.$type}: ${decl.name}`);
        
        if (decl.$type === 'DataDecl' && decl.status) {
          console.log(`    Status: ${decl.status.states.length} states, ${decl.status.transitions.length} transitions`);
        }
        
        if (decl.$type === 'WorkflowDecl') {
          console.log(`    Workflow: ${decl.events.length} events`);
        }
        
        if (decl.$type === 'JobDecl') {
          console.log(`    Job: ${decl.schedule ? 'scheduled' : 'triggered'}`);
        }
      });
    }
    
    console.log('\n🎉 Phase II grammar parsing SUCCESS!');
    return true;
    
  } catch (error) {
    console.error('💥 Error during parsing:', error);
    return false;
  }
}

// Run the test
testPhase2Parsing()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });

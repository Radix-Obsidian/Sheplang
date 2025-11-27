// Test Phase II compilation
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateApp } from './sheplang/packages/compiler/dist/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testPhase2Compilation() {
  console.log('🧪 Testing Phase II Compilation...\n');
  
  try {
    // Read the test file
    const testFile = path.join(__dirname, 'examples', 'phase2-complete-test.shep');
    const source = fs.readFileSync(testFile, 'utf-8');
    
    console.log('📄 Source ShepLang code:');
    console.log(source);
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Compile the application
    console.log('🔨 Compiling application...');
    const result = await generateApp(source, 'phase2-complete-test.shep');
    
    if (!result.success) {
      console.log('❌ Compilation failed!');
      console.log('Diagnostics:');
      result.diagnostics.forEach(d => {
        console.log(`  - [${d.severity}] ${d.message} at line ${d.start.line}`);
      });
      return;
    }
    
    console.log('✅ Compilation successful!\n');
    
    // Check for Phase 2 files
    const files = result.output.files;
    const fileList = Object.keys(files);
    
    console.log(`📦 Generated ${fileList.length} files:\n`);
    
    // Check for Phase 2 specific files
    const phase2Files = {
      'State Machine Schema': 'api/prisma/state-machine-schema.prisma',
      'State Transition API': 'api/routes/state-transitions.ts',
      'State Management UI': 'components/state-management.tsx',
      'Job Scheduler': 'api/services/job-scheduler.ts',
      'Job Management API': 'api/routes/jobs.ts',
      'Job Schema': 'api/prisma/job-schema.prisma'
    };
    
    console.log('🎯 Phase 2 Features:');
    for (const [name, filePath] of Object.entries(phase2Files)) {
      if (files[filePath]) {
        console.log(`  ✅ ${name}: ${filePath}`);
        console.log(`     (${files[filePath].split('\n').length} lines)`);
      } else {
        console.log(`  ❌ ${name}: ${filePath} - NOT GENERATED`);
      }
    }
    
    console.log('\n📋 All Generated Files:');
    fileList.forEach(file => {
      const lineCount = files[file].split('\n').length;
      console.log(`  - ${file} (${lineCount} lines)`);
    });
    
    // Show snippet of state machine code
    if (files['api/routes/state-transitions.ts']) {
      console.log('\n📝 State Transition API (snippet):');
      const lines = files['api/routes/state-transitions.ts'].split('\n');
      console.log(lines.slice(0, 20).join('\n'));
      console.log('  ...');
    }
    
    // Show snippet of job scheduler code
    if (files['api/services/job-scheduler.ts']) {
      console.log('\n📝 Job Scheduler (snippet):');
      const lines = files['api/services/job-scheduler.ts'].split('\n');
      console.log(lines.slice(0, 20).join('\n'));
      console.log('  ...');
    }
    
    console.log('\n🎉 Phase II compilation test COMPLETE!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testPhase2Compilation();

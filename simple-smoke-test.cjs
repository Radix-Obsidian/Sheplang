const fs = require('fs');
const path = require('path');

console.log('🧪 ShepLang Simple Smoke Test');
console.log('================================');

let testsPassed = 0;
let testsTotal = 0;

function test(name, fn) {
  testsTotal++;
  try {
    const result = fn();
    if (result) {
      console.log(`✅ ${name}`);
      testsPassed++;
    } else {
      console.log(`❌ ${name}`);
    }
  } catch (err) {
    console.log(`❌ ${name}: ${err.message}`);
  }
}

// Test 1: Core files exist
test('Core files exist', () => {
  const coreFiles = [
    'sheplang/packages/language/src/index.ts',
    'extension/src/extension.ts',
    'extension/src/commands/projectWizard.ts',
    'extension/package.json'
  ];
  
  for (const file of coreFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing: ${file}`);
    }
  }
  return true;
});

// Test 2: Package.json files valid
test('Package.json files valid', () => {
  const packages = ['package.json', 'extension/package.json'];
  
  for (const pkg of packages) {
    if (fs.existsSync(pkg)) {
      const content = fs.readFileSync(pkg, 'utf8');
      JSON.parse(content);
    }
  }
  return true;
});

// Test 3: Extension commands registered
test('Extension commands registered', () => {
  const packageJson = JSON.parse(fs.readFileSync('extension/package.json', 'utf8'));
  const commands = packageJson.contributes?.commands || [];
  
  const requiredCommands = [
    'sheplang.startProjectWizard',
    'sheplang.quickCreateProject'
  ];
  
  for (const cmd of requiredCommands) {
    if (!commands.some(c => c.command === cmd)) {
      throw new Error(`Missing command: ${cmd}`);
    }
  }
  return true;
});

// Test 4: README updated
test('README updated', () => {
  const readme = fs.readFileSync('README.md', 'utf8');
  
  if (!readme.includes('version-1.1.9')) {
    throw new Error('README not updated to v1.1.9');
  }
  
  if (!readme.includes('Project Wizard')) {
    throw new Error('README missing Project Wizard section');
  }
  
  return true;
});

// Test 5: Wizard types exist
test('Wizard types exist', () => {
  const typesFile = 'extension/src/wizard/types.ts';
  if (!fs.existsSync(typesFile)) {
    throw new Error('Missing wizard types file');
  }
  
  const content = fs.readFileSync(typesFile, 'utf8');
  const requiredTypes = ['ProjectQuestionnaire', 'GenerationProgress'];
  
  for (const type of requiredTypes) {
    if (!content.includes(type)) {
      throw new Error(`Missing type: ${type}`);
    }
  }
  
  return true;
});

// Results
console.log('\n📊 Results');
console.log(`Passed: ${testsPassed}/${testsTotal}`);
console.log(`Rate: ${Math.round((testsPassed / testsTotal) * 100)}%`);

if (testsPassed === testsTotal) {
  console.log('\n🎉 All smoke tests passed!');
  console.log('Ready for manual testing in VS Code.');
} else {
  console.log('\n⚠️  Some tests failed. Fix issues before proceeding.');
}

process.exit(testsPassed === testsTotal ? 0 : 1);

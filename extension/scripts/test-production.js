#!/usr/bin/env node

/**
 * Production Readiness Test Script
 * Verifies all critical files and dependencies are present
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing ShepLang Extension Production Readiness...\n');

let passed = 0;
let failed = 0;

function test(name, condition, details = '') {
  if (condition) {
    console.log(`✅ PASS: ${name}`);
    passed++;
  } else {
    console.log(`❌ FAIL: ${name}`);
    if (details) console.log(`   → ${details}`);
    failed++;
  }
}

// Test 1: Compiled extension exists
const extensionJs = fs.existsSync(path.join(__dirname, '../out/extension.js'));
test('Extension compiled (out/extension.js)', extensionJs, 
  'Run: npm run compile');

// Test 2: Grammar files exist
const shepLangGrammar = fs.existsSync(path.join(__dirname, '../syntaxes/sheplang.tmLanguage.json'));
const shepThonGrammar = fs.existsSync(path.join(__dirname, '../syntaxes/shepthon.tmLanguage.json'));
test('Grammar files exist', shepLangGrammar && shepThonGrammar,
  'Missing: syntaxes/*.tmLanguage.json');

// Test 3: Language configuration exists
const langConfig = fs.existsSync(path.join(__dirname, '../language-configuration.json'));
test('Language configuration exists', langConfig,
  'Missing: language-configuration.json');

// Test 4: Language package installed
const langPackage = fs.existsSync(path.join(__dirname, '../node_modules/@goldensheepai/sheplang-language'));
test('Language package installed', langPackage,
  'Run: npm install');

// Test 5: Language package compiled
const langDist = fs.existsSync(path.join(__dirname, '../node_modules/@goldensheepai/sheplang-language/dist'));
test('Language package compiled', langDist,
  'Run: cd ../sheplang/packages/language && npm run build');

// Test 6: Language package index exists
const langIndex = fs.existsSync(path.join(__dirname, '../node_modules/@goldensheepai/sheplang-language/dist/index.js'));
test('Language package index compiled', langIndex,
  'Rebuild language package');

// Test 7: vscode-languageclient installed
const langClient = fs.existsSync(path.join(__dirname, '../node_modules/vscode-languageclient'));
test('Language client installed', langClient,
  'Run: npm install vscode-languageclient');

// Test 8: Commands directory compiled
const commandsDir = fs.existsSync(path.join(__dirname, '../out/commands'));
test('Commands directory exists', commandsDir,
  'Run: npm run compile');

// Test 9: Package.json valid
let packageValid = false;
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  packageValid = pkg.name && pkg.version && pkg.engines && pkg.activationEvents;
} catch (e) {
  // Invalid
}
test('Package.json valid', packageValid,
  'Fix package.json structure');

// Test 10: .vscodeignore doesn't exclude critical files
let vscodeignoreOk = true;
try {
  const vscodeignore = fs.readFileSync(path.join(__dirname, '../.vscodeignore'), 'utf8');
  // Check that we're NOT excluding the entire @goldensheepai package
  if (vscodeignore.includes('node_modules/@goldensheepai/**')) {
    vscodeignoreOk = false;
  }
} catch (e) {
  vscodeignoreOk = false;
}
test('.vscodeignore correct', vscodeignoreOk,
  'Remove: node_modules/@goldensheepai/** from .vscodeignore');

// Test 11: No .env file (should not be in production)
const noEnv = !fs.existsSync(path.join(__dirname, '../.env')) || 
  fs.readFileSync(path.join(__dirname, '../.vscodeignore'), 'utf8').includes('.env');
test('.env excluded from package', noEnv,
  'Add .env to .vscodeignore');

// Test 12: README.md exists
const readme = fs.existsSync(path.join(__dirname, '../README.md'));
test('README.md exists', readme,
  'Create README.md');

console.log('\n' + '='.repeat(50));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
  console.log('🎉 ALL TESTS PASSED! Ready for packaging.');
  console.log('\nNext steps:');
  console.log('  1. npm run package');
  console.log('  2. Test VSIX: code --install-extension sheplang-vscode-X.X.X.vsix');
  console.log('  3. If VSIX works, publish: npm run publish\n');
  process.exit(0);
} else {
  console.log('⚠️  TESTS FAILED! Fix issues before packaging.\n');
  process.exit(1);
}

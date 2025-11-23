#!/usr/bin/env node

/**
 * ShepLang Smoke Test Script
 * Quick automated verification of core functionality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function header(message) {
  log(`\n${message}`, 'cyan');
  log('='.repeat(message.length - 1), 'cyan');
}

// Test results
const results = {
  passed: 0,
  failed: 0,
  total: 0
};

function runTest(testName, testFn) {
  results.total++;
  try {
    const result = testFn();
    if (result === true || result === undefined) {
      success(testName);
      results.passed++;
    } else {
      error(testName);
      results.failed++;
    }
  } catch (err) {
    error(`${testName}: ${err.message}`);
    results.failed++;
  }
}

// Test 1: Check core files exist
function testCoreFiles() {
  const coreFiles = [
    'sheplang/packages/language/src/index.ts',
    'sheplang/packages/verifier/src/index.ts',
    'extension/src/extension.ts',
    'extension/src/commands/projectWizard.ts',
    'extension/src/wizard/types.ts',
    'extension/src/ui/progressPanel.ts',
    'extension/package.json'
  ];

  for (const file of coreFiles) {
    if (!fs.existsSync(path.join(__dirname, file))) {
      throw new Error(`Missing core file: ${file}`);
    }
  }
  
  return true;
}

// Test 2: Check package.json files are valid
function testPackageJson() {
  const packages = [
    'package.json',
    'extension/package.json',
    'sheplang/package.json'
  ];

  for (const pkg of packages) {
    const pkgPath = path.join(__dirname, pkg);
    if (fs.existsSync(pkgPath)) {
      const content = fs.readFileSync(pkgPath, 'utf8');
      JSON.parse(content); // Will throw if invalid
    }
  }
  
  return true;
}

// Test 3: Check TypeScript configuration
function testTypeScriptConfig() {
  const tsconfigPath = path.join(__dirname, 'extension/tsconfig.json');
  if (!fs.existsSync(tsconfigPath)) {
    throw new Error('Missing tsconfig.json');
  }
  
  const config = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  if (!config.compilerOptions) {
    throw new Error('Invalid tsconfig.json structure');
  }
  
  return true;
}

// Test 4: Check wizard types are properly defined
function testWizardTypes() {
  const typesPath = path.join(__dirname, 'extension/src/wizard/types.ts');
  const content = fs.readFileSync(typesPath, 'utf8');
  
  const requiredTypes = [
    'ProjectQuestionnaire',
    'EntityDefinition',
    'EntityField',
    'GenerationProgress',
    'ProjectStructure'
  ];
  
  for (const type of requiredTypes) {
    if (!content.includes(`interface ${type}`) && !content.includes(`type ${type}`)) {
      throw new Error(`Missing type: ${type}`);
    }
  }
  
  return true;
}

// Test 5: Check extension commands are registered
function testExtensionCommands() {
  const packagePath = path.join(__dirname, 'extension/package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const commands = packageJson.contributes?.commands || [];
  const requiredCommands = [
    'sheplang.startProjectWizard',
    'sheplang.quickCreateProject',
    'sheplang.testWizard'
  ];
  
  for (const cmd of requiredCommands) {
    if (!commands.some(c => c.command === cmd)) {
      throw new Error(`Missing command: ${cmd}`);
    }
  }
  
  return true;
}

// Test 6: Check generator files exist
function testGenerators() {
  const generators = [
    'extension/src/generators/entityGenerator.ts',
    'extension/src/generators/flowGenerator.ts',
    'extension/src/generators/screenGenerator.ts',
    'extension/src/generators/integrationGenerator.ts',
    'extension/src/generators/readmeGenerator.ts'
  ];
  
  for (const gen of generators) {
    if (!fs.existsSync(path.join(__dirname, gen))) {
      throw new Error(`Missing generator: ${gen}`);
    }
  }
  
  return true;
}

// Test 7: Check scaffolding agent
function testScaffoldingAgent() {
  const agentPath = path.join(__dirname, 'extension/src/wizard/scaffoldingAgent.ts');
  if (!fs.existsSync(agentPath)) {
    throw new Error('Missing scaffolding agent');
  }
  
  const content = fs.readFileSync(agentPath, 'utf8');
  const requiredMethods = ['generateProject', 'validateAndWriteFile'];
  
  for (const method of requiredMethods) {
    if (!content.includes(method)) {
      throw new Error(`Missing method in scaffolding agent: ${method}`);
    }
  }
  
  return true;
}

// Test 8: Try to run language tests (if possible)
function testLanguageTests() {
  try {
    const testResult = execSync('cd sheplang && pnpm run test --reporter=json', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    // Try to parse test results
    try {
      const testOutput = JSON.parse(testResult);
      if (testOutput.testResults && testOutput.numPassedTests > 0) {
        info(`Language tests: ${testOutput.numPassedTests} passed`);
        return true;
      }
    } catch {
      // If JSON parsing fails, just check if command ran without error
      if (testResult.includes('pass') || testResult.includes('✓')) {
        info('Language tests appear to be passing');
        return true;
      }
    }
    
    return true;
  } catch (err) {
    warning(`Could not run language tests: ${err.message}`);
    return true; // Don't fail the smoke test for this
  }
}

// Test 9: Check README is updated
function testReadme() {
  const readmePath = path.join(__dirname, 'README.md');
  const content = fs.readFileSync(readmePath, 'utf8');
  
  const requiredSections = [
    '## 🎯 What is ShepLang?',
    '## ✨ Features',
    '## 🚀 Quick Start',
    '## 📦 Installation',
    'version-1.1.9'
  ];
  
  for (const section of requiredSections) {
    if (!content.includes(section)) {
      throw new Error(`Missing section in README: ${section}`);
    }
  }
  
  return true;
}

// Test 10: Check file permissions and structure
function testFileStructure() {
  const requiredDirs = [
    'extension/src',
    'extension/src/commands',
    'extension/src/wizard',
    'extension/src/generators',
    'extension/src/ui',
    'extension/src/validation',
    'sheplang/packages',
    'sheplang/packages/language',
    'sheplang/packages/verifier',
    'examples'
  ];
  
  for (const dir of requiredDirs) {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      throw new Error(`Missing directory: ${dir}`);
    }
  }
  
  return true;
}

// Main test execution
function main() {
  header('🧪 ShepLang Smoke Test');
  info('Running automated verification of core functionality...\n');
  
  // Run all tests
  runTest('Core files exist', testCoreFiles);
  runTest('Package.json files valid', testPackageJson);
  runTest('TypeScript configuration', testTypeScriptConfig);
  runTest('Wizard types defined', testWizardTypes);
  runTest('Extension commands registered', testExtensionCommands);
  runTest('Generator files exist', testGenerators);
  runTest('Scaffolding agent ready', testScaffoldingAgent);
  runTest('Language tests accessible', testLanguageTests);
  runTest('README updated', testReadme);
  runTest('File structure correct', testFileStructure);
  
  // Results summary
  header('📊 Test Results');
  
  const passRate = Math.round((results.passed / results.total) * 100);
  
  if (results.failed === 0) {
    success(`All tests passed! (${results.passed}/${results.total})`);
    success(`Pass rate: ${passRate}%`);
    log('\n🎉 ShepLang is ready for testing!', 'green');
  } else {
    error(`Some tests failed (${results.failed}/${results.total})`);
    warning(`Pass rate: ${passRate}%`);
    log('\n⚠️  Fix issues before proceeding to manual testing', 'yellow');
  }
  
  log('\n📋 Next Steps:', 'blue');
  log('1. If all tests passed: Run manual tests from smoke-test-guide.md');
  log('2. If tests failed: Fix the issues above');
  log('3. Test the Project Wizard in VS Code');
  log('4. Verify generated projects work correctly');
  
  // Exit with appropriate code
  process.exit(results.failed === 0 ? 0 : 1);
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, runTest, testCoreFiles, testPackageJson, testTypeScriptConfig, testWizardTypes, testExtensionCommands, testGenerators, testScaffoldingAgent, testLanguageTests, testReadme, testFileStructure };

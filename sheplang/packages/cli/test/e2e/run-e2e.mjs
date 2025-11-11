#!/usr/bin/env node

/**
 * E2E test runner for ShepLang
 * 
 * Tests the full pipeline from ShepLang source -> TypeScript -> Output
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

// Convert __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');

// Test configuration
const TEST_SHEP_DIR = path.join(ROOT, 'test', 'fixtures');
const OUT_DIR = path.join(ROOT, '.shep', 'out');
const CLI_PATH = path.join(ROOT, 'sheplang', 'packages', 'cli', 'dist', 'index.js');

// Test cases
const TEST_CASES = [
  {
    name: 'Simple todo app',
    shepFile: path.join(ROOT, 'sheplang', 'examples', 'todo.shep'),
    expectations: [
      { type: 'file', path: path.join(OUT_DIR, 'MyTodos', 'entry.ts'), shouldExist: true },
      { type: 'content', path: path.join(OUT_DIR, 'MyTodos', 'entry.ts'), contains: 'export interface Todo' },
      { type: 'content', path: path.join(OUT_DIR, 'MyTodos', 'entry.ts'), contains: 'export async function CreateTodo' },
    ],
  },
];

/**
 * Run a shell command and return stdout/stderr
 */
async function exec(cmd, args, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { 
      cwd, 
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });
    
    let stdout = '';
    let stderr = '';
    
    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    proc.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
    
    proc.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Run a test case
 */
async function runTest(testCase) {
  console.log(`\n${colors.bold}Running test: ${colors.cyan}${testCase.name}${colors.reset}`);
  
  try {
    // Run the build command
    console.log(`${colors.gray}> Building ${path.relative(ROOT, testCase.shepFile)}${colors.reset}`);
    
    const buildResult = await exec('node', [CLI_PATH, 'build', testCase.shepFile], ROOT);
    
    if (buildResult.code !== 0) {
      console.error(`${colors.red}✘ Build failed with exit code ${buildResult.code}${colors.reset}`);
      console.error(buildResult.stderr || buildResult.stdout);
      return false;
    }
    
    // Check expectations
    let allPassed = true;
    
    for (const expectation of testCase.expectations) {
      switch (expectation.type) {
        case 'file': {
          const exists = await fileExists(expectation.path);
          
          if (exists === expectation.shouldExist) {
            console.log(`${colors.green}✓ File ${expectation.shouldExist ? 'exists' : 'does not exist'}: ${colors.reset}${path.relative(ROOT, expectation.path)}`);
          } else {
            console.error(`${colors.red}✘ File ${expectation.shouldExist ? 'should exist' : 'should not exist'}: ${colors.reset}${path.relative(ROOT, expectation.path)}`);
            allPassed = false;
          }
          break;
        }
        
        case 'content': {
          const exists = await fileExists(expectation.path);
          
          if (!exists) {
            console.error(`${colors.red}✘ Cannot check content, file does not exist: ${colors.reset}${path.relative(ROOT, expectation.path)}`);
            allPassed = false;
            break;
          }
          
          const content = await fs.readFile(expectation.path, 'utf8');
          const hasContent = content.includes(expectation.contains);
          
          if (hasContent) {
            console.log(`${colors.green}✓ Content found: ${colors.reset}'${expectation.contains.substring(0, 30)}...'`);
          } else {
            console.error(`${colors.red}✘ Content not found: ${colors.reset}'${expectation.contains.substring(0, 30)}...'`);
            allPassed = false;
          }
          break;
        }
      }
    }
    
    if (allPassed) {
      console.log(`${colors.green}${colors.bold}✓ All expectations passed${colors.reset}`);
    } else {
      console.error(`${colors.red}${colors.bold}✘ Some expectations failed${colors.reset}`);
    }
    
    return allPassed;
  } catch (error) {
    console.error(`${colors.red}${colors.bold}✘ Test failed with error: ${colors.reset}${error.message}`);
    return false;
  }
}

/**
 * Check if a file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Main function to run all tests
 */
async function main() {
  console.log(`${colors.bold}${colors.magenta}ShepLang E2E Test Runner${colors.reset}\n`);
  console.log(`${colors.gray}Root directory: ${ROOT}${colors.reset}`);
  
  let allPassed = true;
  const results = [];
  
  for (const testCase of TEST_CASES) {
    const passed = await runTest(testCase);
    allPassed = allPassed && passed;
    results.push({ name: testCase.name, passed });
  }
  
  // Print summary
  console.log(`\n${colors.bold}${colors.magenta}Test Summary:${colors.reset}`);
  
  for (const result of results) {
    const status = result.passed 
      ? `${colors.green}✓ PASS${colors.reset}` 
      : `${colors.red}✘ FAIL${colors.reset}`;
    console.log(`${status} ${result.name}`);
  }
  
  const passCount = results.filter(r => r.passed).length;
  const failCount = results.length - passCount;
  
  console.log(`\n${colors.bold}Results: ${colors.green}${passCount} passed${colors.reset}, ${failCount > 0 ? colors.red : colors.green}${failCount} failed${colors.reset} (${results.length} total)${colors.reset}\n`);
  
  process.exit(allPassed ? 0 : 1);
}

// Run the tests
main().catch(error => {
  console.error(`${colors.red}${colors.bold}✘ Test runner failed: ${colors.reset}${error.message}`);
  console.error(error.stack);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Snapshot test runner for ShepLang
 * 
 * Verifies that the transpiler output matches expected snapshots
 */
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

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
const SNAPSHOTS_DIR = path.join(__dirname, 'baselines');
const CLI_PATH = path.join(ROOT, 'sheplang', 'packages', 'cli', 'dist', 'index.js');
const UPDATE_SNAPSHOTS = process.argv.includes('--update');

// Test cases
const TEST_CASES = [
  {
    name: 'Todo app transpiler output',
    shepFile: path.join(ROOT, 'sheplang', 'examples', 'todo.shep'),
    snapshotName: 'todo-app-transpiled.ts.snap',
    outputPath: appName => path.join(ROOT, '.shep', 'out', appName, 'entry.ts'),
    appName: 'MyTodos',
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
 * Create a file hash
 */
function createHash(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Normalize line endings
 */
function normalizeLineEndings(content) {
  return content.replace(/\\r\\n/g, '\\n');
}

/**
 * Run a snapshot test
 */
async function runSnapshotTest(testCase) {
  console.log(`\n${colors.bold}Running snapshot test: ${colors.cyan}${testCase.name}${colors.reset}`);
  
  try {
    // Build the file first
    console.log(`${colors.gray}> Building ${path.relative(ROOT, testCase.shepFile)}${colors.reset}`);
    
    const buildResult = await exec('node', [CLI_PATH, 'build', testCase.shepFile], ROOT);
    
    if (buildResult.code !== 0) {
      console.error(`${colors.red}✘ Build failed with exit code ${buildResult.code}${colors.reset}`);
      console.error(buildResult.stderr || buildResult.stdout);
      return false;
    }
    
    // Read the output file
    const outputFile = testCase.outputPath(testCase.appName);
    if (!await fileExists(outputFile)) {
      console.error(`${colors.red}✘ Output file does not exist: ${colors.reset}${path.relative(ROOT, outputFile)}`);
      return false;
    }
    
    const outputContent = await fs.readFile(outputFile, 'utf8');
    const normalizedOutput = normalizeLineEndings(outputContent);
    const snapshotPath = path.join(SNAPSHOTS_DIR, testCase.snapshotName);
    
    // Update snapshot if requested
    if (UPDATE_SNAPSHOTS) {
      await fs.mkdir(SNAPSHOTS_DIR, { recursive: true });
      await fs.writeFile(snapshotPath, normalizedOutput, 'utf8');
      console.log(`${colors.yellow}↻ Updated snapshot: ${colors.reset}${path.relative(ROOT, snapshotPath)}`);
      return true;
    }
    
    // Compare with snapshot
    const snapshotExists = await fileExists(snapshotPath);
    
    if (!snapshotExists) {
      console.error(`${colors.red}✘ Snapshot does not exist: ${colors.reset}${path.relative(ROOT, snapshotPath)}`);
      console.log(`${colors.yellow}Run with --update to create it${colors.reset}`);
      return false;
    }
    
    const snapshotContent = await fs.readFile(snapshotPath, 'utf8');
    const normalizedSnapshot = normalizeLineEndings(snapshotContent);
    
    if (normalizedOutput === normalizedSnapshot) {
      console.log(`${colors.green}✓ Output matches snapshot${colors.reset}`);
      return true;
    } else {
      console.error(`${colors.red}✘ Output does not match snapshot${colors.reset}`);
      
      // Calculate hashes for comparison
      const outputHash = createHash(normalizedOutput);
      const snapshotHash = createHash(normalizedSnapshot);
      console.error(`  Output hash: ${outputHash}`);
      console.error(`  Snapshot hash: ${snapshotHash}`);
      
      // Create a diff file for inspection
      const diffDir = path.join(ROOT, '.shep', 'diffs');
      await fs.mkdir(diffDir, { recursive: true });
      const diffPath = path.join(diffDir, `${testCase.snapshotName}.diff`);
      await fs.writeFile(diffPath, `-- Output --\n${normalizedOutput}\n\n-- Snapshot --\n${normalizedSnapshot}`, 'utf8');
      
      console.log(`${colors.yellow}Diff written to: ${colors.reset}${path.relative(ROOT, diffPath)}`);
      console.log(`${colors.yellow}Run with --update to update the snapshot${colors.reset}`);
      
      return false;
    }
  } catch (error) {
    console.error(`${colors.red}${colors.bold}✘ Test failed with error: ${colors.reset}${error.message}`);
    return false;
  }
}

/**
 * Main function to run all tests
 */
async function main() {
  console.log(`${colors.bold}${colors.magenta}ShepLang Snapshot Test Runner${colors.reset}`);
  console.log(`${colors.gray}Mode: ${UPDATE_SNAPSHOTS ? 'Update snapshots' : 'Verify snapshots'}${colors.reset}`);
  
  let allPassed = true;
  const results = [];
  
  for (const testCase of TEST_CASES) {
    const passed = await runSnapshotTest(testCase);
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

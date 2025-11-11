#!/usr/bin/env node

/**
 * ShepLang E2E Pipeline Runner
 * 
 * This script coordinates the full end-to-end test pipeline:
 * 1. Unit tests
 * 2. Integration tests
 * 3. E2E tests
 * 4. Snapshot tests
 * 5. Performance benchmarks
 * 
 * It collects results and generates reports that can be used in CI.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

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

// Root project directory
const ROOT = path.resolve(__dirname, '..', '..', '..', '..', '..');

// Test configuration
const CI_MODE = process.env.CI === 'true';
const COLLECT_COVERAGE = !process.argv.includes('--no-coverage');
const VERBOSE = process.argv.includes('--verbose');
const REPORT_DIR = path.join(ROOT, '.shep', 'reports', 'e2e');

/**
 * Test stage definition
 */
const TEST_STAGES = [
  {
    name: 'Unit Tests',
    command: 'pnpm',
    args: ['test'],
    cwd: ROOT,
    required: true,
  },
  {
    name: 'Build',
    command: 'pnpm',
    args: ['-r', 'build'],
    cwd: ROOT,
    required: true,
  },
  {
    name: 'E2E Tests',
    command: 'node',
    args: [path.join(__dirname, 'run-e2e.mjs')],
    cwd: ROOT,
    required: true,
  },
  {
    name: 'Snapshot Tests',
    command: 'node',
    args: [path.join(__dirname, '..', 'snapshots', 'snapshot-test.mjs')],
    cwd: ROOT,
    required: false,
  },
  {
    name: 'DX Metrics',
    command: 'node',
    args: [
      path.join(ROOT, 'sheplang', 'packages', 'cli', 'dist', 'index.js'),
      'stats',
      '--json',
    ],
    cwd: ROOT,
    required: false,
    outputFile: path.join(REPORT_DIR, 'dx-metrics.json'),
  },
];

/**
 * Run a command and return result
 */
async function runCommand(command, args, cwd) {
  return new Promise((resolve) => {
    console.log(`${colors.gray}> ${command} ${args.join(' ')}${colors.reset}`);
    
    const startTime = Date.now();
    const proc = spawn(command, args, { 
      cwd, 
      stdio: VERBOSE ? 'inherit' : 'pipe',
      shell: true,
    });
    
    let stdout = '';
    let stderr = '';
    
    if (!VERBOSE) {
      proc.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      
      proc.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
    }
    
    proc.on('close', (code) => {
      const duration = Date.now() - startTime;
      
      resolve({ 
        code,
        success: code === 0,
        duration,
        stdout,
        stderr,
      });
    });
  });
}

/**
 * Run a test stage
 */
async function runStage(stage, index) {
  console.log(`\n${colors.bold}[${index + 1}/${TEST_STAGES.length}] ${colors.cyan}${stage.name}${colors.reset}`);
  
  const result = await runCommand(stage.command, stage.args, stage.cwd);
  
  if (result.success) {
    console.log(`${colors.green}✓ ${stage.name} completed successfully${colors.reset} (${result.duration}ms)`);
  } else {
    console.error(`${colors.red}✘ ${stage.name} failed with exit code ${result.code}${colors.reset} (${result.duration}ms)`);
    
    if (!VERBOSE && (result.stdout || result.stderr)) {
      console.error(`${colors.yellow}Output:${colors.reset}`);
      if (result.stdout) console.error(result.stdout);
      if (result.stderr) console.error(colors.red + result.stderr + colors.reset);
    }
  }
  
  // Save output to file if specified
  if (stage.outputFile && (result.stdout || result.stderr)) {
    const dir = path.dirname(stage.outputFile);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(stage.outputFile, result.stdout || result.stderr);
  }
  
  return { ...stage, result };
}

/**
 * Generate a report from the test results
 */
async function generateReport(results) {
  const reportPath = path.join(REPORT_DIR, 'e2e-report.json');
  
  const report = {
    timestamp: new Date().toISOString(),
    ci: CI_MODE,
    summary: {
      total: results.length,
      passed: results.filter(r => r.result.success).length,
      failed: results.filter(r => !r.result.success).length,
      duration: results.reduce((sum, r) => sum + r.result.duration, 0),
    },
    stages: results.map(r => ({
      name: r.name,
      success: r.result.success,
      required: r.required,
      duration: r.result.duration,
      exitCode: r.result.code,
    })),
  };
  
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  return reportPath;
}

/**
 * Main function
 */
async function main() {
  console.log(`${colors.bold}${colors.magenta}ShepLang E2E Pipeline Runner${colors.reset}`);
  console.log(`${colors.gray}Mode: ${CI_MODE ? 'CI' : 'Local'}${colors.reset}`);
  
  const results = [];
  let allRequired = true;
  
  // Run each stage
  for (let i = 0; i < TEST_STAGES.length; i++) {
    const stage = TEST_STAGES[i];
    const result = await runStage(stage, i);
    results.push(result);
    
    // Check if a required stage failed
    if (stage.required && !result.result.success) {
      allRequired = false;
      if (CI_MODE) break; // In CI mode, stop on first required failure
    }
  }
  
  // Generate report
  const reportPath = await generateReport(results);
  
  // Print summary
  const passed = results.filter(r => r.result.success).length;
  const failed = results.filter(r => !r.result.success).length;
  const requiredFailed = results.filter(r => r.required && !r.result.success).length;
  const totalDuration = results.reduce((sum, r) => sum + r.result.duration, 0);
  
  console.log(`\n${colors.bold}${colors.magenta}Test Summary:${colors.reset}`);
  console.log(`${colors.bold}Stages:${colors.reset} ${passed} passed, ${failed} failed (${results.length} total)`);
  console.log(`${colors.bold}Required stages:${colors.reset} ${requiredFailed > 0 ? colors.red + requiredFailed + ' failed' : colors.green + 'all passed'}`);
  console.log(`${colors.bold}Total duration:${colors.reset} ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`${colors.bold}Report:${colors.reset} ${reportPath}`);
  
  // Exit with appropriate code
  process.exit(allRequired ? 0 : 1);
}

// Run the pipeline
main().catch(error => {
  console.error(`${colors.red}${colors.bold}✘ Pipeline failed with error:${colors.reset}`);
  console.error(error);
  process.exit(1);
});

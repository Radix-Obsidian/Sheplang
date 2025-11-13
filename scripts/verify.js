#!/usr/bin/env node

/**
 * Cross-platform verification script for ShepLang/BobaScript monorepo
 * Replaces verify.ps1 for CI/CD and Docker environments
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${title}`, 'bold');
  log('='.repeat(60), 'cyan');
}

function runCommand(command, description) {
  try {
    log(`\n▶ ${description}...`, 'yellow');
    const output = execSync(command, {
      cwd: rootDir,
      encoding: 'utf-8',
      stdio: 'inherit'
    });
    log(`✓ ${description} passed`, 'green');
    return true;
  } catch (error) {
    log(`✗ ${description} failed`, 'red');
    return false;
  }
}

function checkFile(filePath, description) {
  const fullPath = join(rootDir, filePath);
  const exists = existsSync(fullPath);
  
  if (exists) {
    log(`✓ ${description}: ${filePath}`, 'green');
  } else {
    log(`✗ ${description}: ${filePath} (missing)`, 'red');
  }
  
  return exists;
}

async function main() {
  section('ShepLang/BobaScript Verification');
  
  let allPassed = true;
  const results = [];

  // Step 1: Check critical files
  section('1. Checking Critical Files');
  const criticalFiles = [
    ['package.json', 'Root package.json'],
    ['pnpm-workspace.yaml', 'Workspace config'],
    ['sheplang/packages/language/package.json', 'Language package'],
    ['sheplang/packages/runtime/package.json', 'Runtime package'],
    ['sheplang/packages/cli/package.json', 'CLI package'],
    ['adapters/sheplang-to-boba/package.json', 'Adapter package'],
    ['sheplang/shepkit/package.json', 'ShepKit package']
  ];

  for (const [path, desc] of criticalFiles) {
    const passed = checkFile(path, desc);
    if (!passed) allPassed = false;
  }

  // Step 2: Install dependencies
  section('2. Installing Dependencies');
  const installPassed = runCommand('pnpm install --frozen-lockfile', 'Install dependencies');
  results.push(['Install', installPassed]);
  if (!installPassed) allPassed = false;

  // Step 3: Build all packages
  section('3. Building All Packages');
  const buildPassed = runCommand('pnpm run build', 'Build all packages');
  results.push(['Build', buildPassed]);
  if (!buildPassed) allPassed = false;

  // Step 4: Type checking
  section('4. Type Checking');
  const typecheckPassed = runCommand('pnpm run typecheck', 'Type check all packages');
  results.push(['Type Check', typecheckPassed]);
  if (!typecheckPassed) allPassed = false;

  // Step 5: Linting
  section('5. Linting');
  const lintPassed = runCommand('pnpm run lint', 'Lint all packages');
  results.push(['Lint', lintPassed]);
  if (!lintPassed) allPassed = false;

  // Step 6: Run tests
  section('6. Running Tests');
  const testPassed = runCommand('pnpm test', 'Run all tests');
  results.push(['Tests', testPassed]);
  if (!testPassed) allPassed = false;

  // Final summary
  section('Verification Summary');
  
  results.forEach(([step, passed]) => {
    const status = passed ? '✓' : '✗';
    const color = passed ? 'green' : 'red';
    log(`${status} ${step}`, color);
  });

  log('');
  if (allPassed) {
    log('━'.repeat(60), 'green');
    log('  ALL CHECKS PASSED ✓', 'green');
    log('━'.repeat(60), 'green');
    process.exit(0);
  } else {
    log('━'.repeat(60), 'red');
    log('  SOME CHECKS FAILED ✗', 'red');
    log('━'.repeat(60), 'red');
    process.exit(1);
  }
}

main().catch(error => {
  log(`\n✗ Verification failed with error: ${error.message}`, 'red');
  process.exit(1);
});

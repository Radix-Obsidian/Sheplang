#!/usr/bin/env node

/**
 * ShepLang Environment Checker
 * 
 * This script verifies that the development environment is properly set up
 * and provides helpful instructions for fixing any issues.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ANSI colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Root project directory
const ROOT = path.resolve(__dirname, '..');

// Minimum required versions
const MIN_VERSIONS = {
  node: '16.0.0',
  pnpm: '7.0.0',
};

// Track check status
const status = {
  pass: 0,
  warn: 0,
  fail: 0,
  total: 0,
};

/**
 * Run a command and return its output
 */
function runCommand(command, ignoreErrors = false) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (e) {
    if (ignoreErrors) return null;
    throw e;
  }
}

/**
 * Compare semver versions
 */
function compareVersions(a, b) {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aVal = aParts[i] || 0;
    const bVal = bParts[i] || 0;
    if (aVal > bVal) return 1;
    if (aVal < bVal) return -1;
  }
  
  return 0;
}

/**
 * Check if a command is available
 */
function checkCommand(name, command, minVersion = null) {
  status.total++;
  process.stdout.write(`Checking ${name}... `);
  
  try {
    const output = runCommand(command);
    const rawVersion = output.split('\n')[0].trim();
    // Remove 'v' prefix if present (e.g., 'v22.19.0' -> '22.19.0')
    const version = rawVersion.replace(/^v/, '');
    
    if (minVersion && compareVersions(version, minVersion) < 0) {
      console.log(`${colors.yellow}⚠️  Outdated${colors.reset} (${version}, min: ${minVersion})`);
      status.warn++;
      return { success: true, version, needsUpdate: true };
    }
    
    console.log(`${colors.green}✓ ${version}${colors.reset}`);
    status.pass++;
    return { success: true, version, needsUpdate: false };
  } catch (e) {
    console.log(`${colors.red}✗ Not found${colors.reset}`);
    status.fail++;
    return { success: false, error: e.message };
  }
}

/**
 * Check if files exist
 */
function checkFiles(name, filePaths) {
  status.total++;
  process.stdout.write(`Checking ${name}... `);
  
  const missing = [];
  
  for (const filePath of filePaths) {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
    if (!fs.existsSync(fullPath)) {
      missing.push(filePath);
    }
  }
  
  if (missing.length > 0) {
    console.log(`${colors.red}✗ Missing files${colors.reset}: ${missing.join(', ')}`);
    status.fail++;
    return { success: false, missing };
  }
  
  console.log(`${colors.green}✓ Found${colors.reset}`);
  status.pass++;
  return { success: true };
}

/**
 * Generate install command based on platform
 */
function getInstallCommand(tool) {
  const platform = os.platform();
  
  switch (tool) {
    case 'pnpm':
      switch (platform) {
        case 'win32':
          return [
            'npm install -g pnpm',
            'iwr https://get.pnpm.io/install.ps1 -useb | iex'
          ];
        case 'darwin':
          return [
            'npm install -g pnpm',
            'curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm',
            'brew install pnpm'
          ];
        default:
          return [
            'npm install -g pnpm',
            'curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm'
          ];
      }
    default:
      return [`npm install -g ${tool}`];
  }
}

/**
 * Main function to run all checks
 */
async function main() {
  console.log(`${colors.bold}${colors.magenta}ShepLang Environment Checker${colors.reset}\n`);
  
  // Check Node.js
  const nodeCheck = checkCommand('Node.js', 'node --version', MIN_VERSIONS.node);
  
  // Check pnpm
  const pnpmCheck = checkCommand('pnpm', 'pnpm --version', MIN_VERSIONS.pnpm);
  
  // Check required files
  const filesCheck = checkFiles('project files', [
    'sheplang/package.json',
    'sheplang/pnpm-workspace.yaml',
  ]);
  
  // Check package dependencies
  let dependenciesCheck = { success: true };
  
  if (filesCheck.success) {
    status.total++;
    process.stdout.write('Checking dependencies... ');
    
    const nodeModulesPath = path.join(ROOT, 'sheplang', 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      console.log(`${colors.yellow}⚠️  Not installed${colors.reset}`);
      status.warn++;
      dependenciesCheck = { success: false, reason: 'not_installed' };
    } else {
      console.log(`${colors.green}✓ Installed${colors.reset}`);
      status.pass++;
    }
  }
  
  // Print summary
  console.log(`\n${colors.bold}Summary:${colors.reset}`);
  console.log(`${colors.green}✓ ${status.pass}/${status.total} checks passed${colors.reset}`);
  if (status.warn > 0) {
    console.log(`${colors.yellow}⚠️  ${status.warn} warnings${colors.reset}`);
  }
  if (status.fail > 0) {
    console.log(`${colors.red}✗ ${status.fail} checks failed${colors.reset}`);
  }
  
  // Provide help for failed checks
  if (!pnpmCheck.success) {
    console.log(`\n${colors.yellow}To install pnpm, try:${colors.reset}`);
    getInstallCommand('pnpm').forEach(cmd => {
      console.log(`  ${cmd}`);
    });
  } else if (pnpmCheck.needsUpdate) {
    console.log(`\n${colors.yellow}To update pnpm, run:${colors.reset}`);
    console.log(`  pnpm add -g pnpm@latest`);
  }
  
  if (!dependenciesCheck.success && dependenciesCheck.reason === 'not_installed') {
    console.log(`\n${colors.yellow}To install dependencies, run:${colors.reset}`);
    console.log(`  cd ${path.join(ROOT, 'sheplang')} && pnpm install`);
  }
  
  // Provide next steps
  if (status.fail > 0 || status.warn > 0) {
    console.log(`\n${colors.yellow}After fixing these issues, run this script again.${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`\n${colors.green}${colors.bold}✓ Environment is ready for ShepLang development!${colors.reset}`);
    console.log(`\nNext steps:`);
    console.log(`  1. ${colors.cyan}cd ${path.join(ROOT, 'sheplang')}${colors.reset}`);
    console.log(`  2. ${colors.cyan}pnpm build${colors.reset}`);
    console.log(`  3. ${colors.cyan}pnpm dev examples/todo.shep${colors.reset}`);
  }
}

// Run the checker
main().catch(error => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
});

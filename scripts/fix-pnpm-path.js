#!/usr/bin/env node

/**
 * Fix pnpm PATH issues on Windows
 * 
 * This script helps resolve the common issue where pnpm is installed
 * but not available in the terminal PATH.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ANSI colors
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

/**
 * Check if pnpm is available in PATH
 */
function isPnpmInPath() {
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Find pnpm installation paths
 */
function findPnpmPaths() {
  const possiblePaths = [];
  const homeDir = os.homedir();
  
  // Common pnpm installation locations on Windows
  const locations = [
    path.join(homeDir, 'AppData', 'Local', 'pnpm'),
    path.join(homeDir, 'AppData', 'Roaming', 'npm'),
    path.join(homeDir, '.local', 'share', 'pnpm'),
    'C:\\Program Files\\nodejs',
    'C:\\Program Files (x86)\\nodejs',
  ];
  
  for (const location of locations) {
    const pnpmExe = path.join(location, 'pnpm.exe');
    const pnpmCmd = path.join(location, 'pnpm.cmd');
    const pnpmBat = path.join(location, 'pnpm.bat');
    
    if (fs.existsSync(pnpmExe)) possiblePaths.push(location);
    else if (fs.existsSync(pnpmCmd)) possiblePaths.push(location);
    else if (fs.existsSync(pnpmBat)) possiblePaths.push(location);
  }
  
  return possiblePaths;
}

/**
 * Add path to current session
 */
function addToCurrentSession(pnpmPath) {
  process.env.PATH = `${pnpmPath};${process.env.PATH}`;
  console.log(`${colors.green}✓ Added ${pnpmPath} to current session PATH${colors.reset}`);
}

/**
 * Test pnpm with full path
 */
function testPnpmWithPath(pnpmPath) {
  try {
    const pnpmExe = path.join(pnpmPath, 'pnpm.exe');
    const pnpmCmd = path.join(pnpmPath, 'pnpm.cmd');
    
    let command = pnpmExe;
    if (!fs.existsSync(pnpmExe) && fs.existsSync(pnpmCmd)) {
      command = pnpmCmd;
    }
    
    const version = execSync(`"${command}" --version`, { encoding: 'utf8' }).trim();
    console.log(`${colors.green}✓ Found working pnpm ${version} at ${pnpmPath}${colors.reset}`);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Main function
 */
function main() {
  console.log(`${colors.bold}${colors.magenta}pnpm PATH Fix Utility${colors.reset}\n`);
  
  // Check if pnpm is already in PATH
  if (isPnpmInPath()) {
    console.log(`${colors.green}✓ pnpm is already available in PATH${colors.reset}`);
    try {
      const version = execSync('pnpm --version', { encoding: 'utf8' }).trim();
      console.log(`${colors.green}✓ pnpm version: ${version}${colors.reset}`);
      return;
    } catch (e) {
      console.log(`${colors.yellow}⚠️ pnpm found but version check failed${colors.reset}`);
    }
  }
  
  console.log(`${colors.yellow}⚠️ pnpm not found in PATH, searching for installation...${colors.reset}`);
  
  // Find pnpm installations
  const pnpmPaths = findPnpmPaths();
  
  if (pnpmPaths.length === 0) {
    console.log(`${colors.red}✗ No pnpm installation found${colors.reset}`);
    console.log(`\n${colors.yellow}To install pnpm, run:${colors.reset}`);
    console.log(`  ${colors.cyan}npm install -g pnpm${colors.reset}`);
    console.log(`  ${colors.cyan}# OR${colors.reset}`);
    console.log(`  ${colors.cyan}powershell -Command "iwr https://get.pnpm.io/install.ps1 -useb | iex"${colors.reset}`);
    process.exit(1);
  }
  
  console.log(`${colors.green}Found ${pnpmPaths.length} potential pnpm installation(s):${colors.reset}`);
  
  // Test each path and use the first working one
  let workingPath = null;
  for (const pnpmPath of pnpmPaths) {
    console.log(`Testing ${pnpmPath}...`);
    if (testPnpmWithPath(pnpmPath)) {
      workingPath = pnpmPath;
      break;
    } else {
      console.log(`${colors.red}✗ Not working: ${pnpmPath}${colors.reset}`);
    }
  }
  
  if (!workingPath) {
    console.log(`${colors.red}✗ No working pnpm installation found${colors.reset}`);
    process.exit(1);
  }
  
  // Add to current session
  addToCurrentSession(workingPath);
  
  // Test that it works now
  if (isPnpmInPath()) {
    console.log(`${colors.green}${colors.bold}✓ pnpm is now available!${colors.reset}`);
    
    // Show instructions for permanent fix
    console.log(`\n${colors.yellow}To make this permanent, add the following to your system PATH:${colors.reset}`);
    console.log(`  ${colors.cyan}${workingPath}${colors.reset}`);
    console.log(`\n${colors.yellow}Or restart your terminal after running:${colors.reset}`);
    console.log(`  ${colors.cyan}node scripts/setup-pnpm.js${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Failed to make pnpm available${colors.reset}`);
    process.exit(1);
  }
}

// Run the fix
main();

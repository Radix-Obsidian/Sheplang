#!/usr/bin/env node

/**
 * ShepLang pnpm Setup Script
 * 
 * Installs pnpm, configures it properly, and installs dependencies.
 * This script provides a seamless setup experience regardless of platform.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

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
const PROJECT_DIR = path.join(ROOT, 'sheplang');

// Platform-specific commands
const isWindows = os.platform() === 'win32';
const isMac = os.platform() === 'darwin';

/**
 * Execute a command with real-time output
 */
function execCommand(command, options = {}) {
  console.log(`${colors.cyan}> ${command}${colors.reset}`);
  
  try {
    execSync(command, { 
      stdio: 'inherit',
      ...options
    });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Check if a command exists
 */
function commandExists(command) {
  try {
    const cmd = isWindows ? 
      `where.exe ${command} >nul 2>&1` : 
      `command -v ${command} >/dev/null 2>&1`;
      
    execSync(cmd, { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Create a readline interface for user input
 */
function createPrompt() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Ask a yes/no question
 */
async function askYesNo(question, defaultYes = true) {
  const prompt = createPrompt();
  const defaultText = defaultYes ? 'Y/n' : 'y/N';
  
  return new Promise(resolve => {
    prompt.question(`${question} [${defaultText}] `, answer => {
      prompt.close();
      
      const normalized = answer.trim().toLowerCase();
      if (normalized === '' || normalized === 'y' || normalized === 'yes') {
        resolve(true);
      } else if (normalized === 'n' || normalized === 'no') {
        resolve(false);
      } else {
        resolve(defaultYes);
      }
    });
  });
}

/**
 * Install pnpm using the recommended method for each platform
 */
async function installPnpm() {
  console.log(`${colors.bold}Installing pnpm...${colors.reset}`);
  
  if (commandExists('pnpm')) {
    console.log(`${colors.green}✓ pnpm is already installed${colors.reset}`);
    return true;
  }
  
  // Try platform-specific installation methods
  let success = false;
  
  if (isWindows) {
    // Windows: Try PowerShell installer first, then npm
    console.log(`${colors.yellow}Installing pnpm using PowerShell...${colors.reset}`);
    success = execCommand('powershell -Command "iwr https://get.pnpm.io/install.ps1 -useb | iex"');
    
    if (!success) {
      console.log(`${colors.yellow}Trying alternative method using npm...${colors.reset}`);
      success = execCommand('npm install -g pnpm');
    }
  } else if (isMac) {
    // macOS: Try Homebrew first, then npm
    if (commandExists('brew')) {
      console.log(`${colors.yellow}Installing pnpm using Homebrew...${colors.reset}`);
      success = execCommand('brew install pnpm');
    }
    
    if (!success) {
      console.log(`${colors.yellow}Trying alternative method using npm...${colors.reset}`);
      success = execCommand('npm install -g pnpm');
    }
  } else {
    // Linux and others: Try curl installer first, then npm
    console.log(`${colors.yellow}Installing pnpm using installer script...${colors.reset}`);
    success = execCommand('curl -fsSL https://get.pnpm.io/install.sh | sh -');
    
    if (!success) {
      console.log(`${colors.yellow}Trying alternative method using npm...${colors.reset}`);
      success = execCommand('npm install -g pnpm');
    }
  }
  
  if (success) {
    console.log(`${colors.green}✓ pnpm installed successfully${colors.reset}`);
    
    // Try to fix PATH issues immediately
    if (isWindows) {
      console.log(`${colors.yellow}Fixing pnpm PATH for Windows...${colors.reset}`);
      try {
        require('./fix-pnpm-path.js');
      } catch (e) {
        console.log(`${colors.yellow}NOTE: You may need to restart your terminal to use pnpm${colors.reset}`);
        console.log(`${colors.yellow}Or run: node scripts/fix-pnpm-path.js${colors.reset}`);
      }
    }
    
    return true;
  } else {
    console.error(`${colors.red}✗ Failed to install pnpm${colors.reset}`);
    console.log(`${colors.yellow}Please install pnpm manually: https://pnpm.io/installation${colors.reset}`);
    return false;
  }
}

/**
 * Configure pnpm settings for better performance
 */
function configurePnpm() {
  console.log(`${colors.bold}Configuring pnpm...${colors.reset}`);
  
  // Set recommended pnpm settings
  const settings = [
    // Use hoisted node_modules structure for better compatibility
    ['node-linker', 'hoisted'],
    // Allow working with packages without peer dependencies specified
    ['strict-peer-dependencies', 'false'],
    // Auto-install missing peer dependencies
    ['auto-install-peers', 'true'],
    // Resolve packages from workspace when possible
    ['prefer-workspace-packages', 'true'],
  ];
  
  let success = true;
  for (const [key, value] of settings) {
    console.log(`Setting ${key}=${value}...`);
    success = execCommand(`pnpm config set ${key} ${value}`) && success;
  }
  
  if (success) {
    console.log(`${colors.green}✓ pnpm configured successfully${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️ Some pnpm configurations may have failed${colors.reset}`);
  }
  
  return success;
}

/**
 * Install project dependencies using pnpm
 */
async function installDependencies() {
  console.log(`${colors.bold}Installing dependencies...${colors.reset}`);
  
  if (!fs.existsSync(path.join(PROJECT_DIR, 'package.json'))) {
    console.error(`${colors.red}✗ package.json not found in ${PROJECT_DIR}${colors.reset}`);
    return false;
  }
  
  if (!fs.existsSync(path.join(PROJECT_DIR, 'pnpm-workspace.yaml'))) {
    console.warn(`${colors.yellow}⚠️ pnpm-workspace.yaml not found in ${PROJECT_DIR}${colors.reset}`);
  }
  
  // Run the installation
  const success = execCommand('pnpm install', { cwd: PROJECT_DIR });
  
  if (success) {
    console.log(`${colors.green}✓ Dependencies installed successfully${colors.reset}`);
    return true;
  } else {
    console.error(`${colors.red}✗ Failed to install dependencies${colors.reset}`);
    return false;
  }
}

/**
 * Build the project
 */
async function buildProject() {
  console.log(`${colors.bold}Building project...${colors.reset}`);
  
  const shouldBuild = await askYesNo('Do you want to build the project now?');
  if (!shouldBuild) {
    console.log(`${colors.yellow}Skipping build step${colors.reset}`);
    return true;
  }
  
  const success = execCommand('pnpm -r build', { cwd: PROJECT_DIR });
  
  if (success) {
    console.log(`${colors.green}✓ Project built successfully${colors.reset}`);
    return true;
  } else {
    console.error(`${colors.red}✗ Failed to build project${colors.reset}`);
    return false;
  }
}

/**
 * Main function to run the setup process
 */
async function main() {
  console.log(`${colors.bold}${colors.magenta}ShepLang pnpm Setup${colors.reset}\n`);
  
  // Step 1: Install pnpm
  if (!await installPnpm()) {
    process.exit(1);
  }
  
  // Step 2: Configure pnpm
  if (!configurePnpm()) {
    const shouldContinue = await askYesNo('Continue despite configuration issues?');
    if (!shouldContinue) {
      process.exit(1);
    }
  }
  
  // Step 3: Install dependencies
  if (!await installDependencies()) {
    process.exit(1);
  }
  
  // Step 4: Build the project (optional)
  await buildProject();
  
  // Success message
  console.log(`\n${colors.green}${colors.bold}✓ ShepLang setup completed successfully!${colors.reset}`);
  console.log(`\nNext steps:`);
  console.log(`  1. ${colors.cyan}cd ${PROJECT_DIR}${colors.reset}`);
  console.log(`  2. ${colors.cyan}pnpm dev examples/todo.shep${colors.reset}`);
  console.log(`\nTo verify your environment any time, run:`);
  console.log(`  ${colors.cyan}node ${path.join(__dirname, 'check-env.js')}${colors.reset}`);
}

// Run the setup
main().catch(error => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
});

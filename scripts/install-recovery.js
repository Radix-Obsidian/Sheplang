#!/usr/bin/env node

/**
 * ShepLang Install Recovery Script
 * 
 * This script helps recover from failed pnpm installs by:
 * 1. Cleaning node_modules and caches
 * 2. Trying different install strategies
 * 3. Providing helpful diagnostics
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
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

// Root project directory
const ROOT = path.resolve(__dirname, '..');
const PROJECT_DIR = path.join(ROOT, 'sheplang');

// Recovery levels
const RECOVERY_LEVELS = [
  {
    name: 'Basic',
    description: 'Clears caches and retries install',
    actions: [
      { cmd: 'pnpm store prune', desc: 'Pruning pnpm store' },
      { cmd: 'pnpm install --force', desc: 'Force reinstalling dependencies' },
    ],
  },
  {
    name: 'Intermediate',
    description: 'Removes node_modules and lockfile, then reinstalls',
    actions: [
      { cmd: 'rm -rf node_modules', desc: 'Removing node_modules' },
      { cmd: 'rm -rf pnpm-lock.yaml', desc: 'Removing lockfile' },
      { cmd: 'pnpm store prune', desc: 'Pruning pnpm store' },
      { cmd: 'pnpm install', desc: 'Reinstalling dependencies' },
    ],
  },
  {
    name: 'Thorough',
    description: 'Cleans everything and reinstalls with a fresh cache',
    actions: [
      { cmd: 'rm -rf node_modules', desc: 'Removing node_modules' },
      { cmd: 'rm -rf pnpm-lock.yaml', desc: 'Removing lockfile' },
      { cmd: 'pnpm store prune', desc: 'Pruning pnpm store' },
      { cmd: 'rm -rf .pnpm-store', desc: 'Removing .pnpm-store' },
      { cmd: 'pnpm install --prefer-offline=false', desc: 'Reinstalling dependencies (fresh download)' },
    ],
  },
];

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
 * Create a readline interface for user input
 */
function createPrompt() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Ask a question and get a response
 */
async function askQuestion(question, defaultAnswer = '') {
  const prompt = createPrompt();
  const defaultText = defaultAnswer ? ` [${defaultAnswer}]` : '';
  
  return new Promise(resolve => {
    prompt.question(`${question}${defaultText}: `, answer => {
      prompt.close();
      resolve(answer.trim() || defaultAnswer);
    });
  });
}

/**
 * Show a menu and get a selection
 */
async function showMenu(options, question) {
  console.log('');
  options.forEach((option, index) => {
    console.log(`${colors.cyan}${index + 1})${colors.reset} ${option}`);
  });
  console.log('');
  
  const response = await askQuestion(question);
  const selection = parseInt(response, 10);
  
  if (isNaN(selection) || selection < 1 || selection > options.length) {
    console.log(`${colors.red}Invalid selection${colors.reset}`);
    return null;
  }
  
  return selection - 1;
}

/**
 * Collect system information for diagnostics
 */
function collectSystemInfo() {
  const info = {
    os: os.platform() + ' ' + os.release(),
    nodeVersion: process.version,
    cpus: os.cpus().length,
    memory: Math.round(os.totalmem() / (1024 * 1024 * 1024)) + ' GB',
    freeMemory: Math.round(os.freemem() / (1024 * 1024 * 1024)) + ' GB',
  };
  
  try {
    info.pnpmVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim();
  } catch (e) {
    info.pnpmVersion = 'Not installed or not in PATH';
  }
  
  return info;
}

/**
 * Check for common issues
 */
function checkCommonIssues() {
  const issues = [];
  
  // Check for long paths on Windows
  if (os.platform() === 'win32') {
    if (PROJECT_DIR.length > 100) {
      issues.push({
        name: 'Long path detected',
        description: 'Windows may have issues with paths > 260 characters',
        fix: 'Consider moving the project to a shorter path',
      });
    }
  }
  
  // Check for free disk space
  try {
    const diskInfo = execSync('df -h .', { encoding: 'utf8' }).trim();
    const diskUsage = diskInfo.split('\n')[1].split(/\s+/);
    const usagePercent = parseInt(diskUsage[4].replace('%', ''), 10);
    
    if (usagePercent > 90) {
      issues.push({
        name: 'Low disk space',
        description: `Disk is ${usagePercent}% full`,
        fix: 'Free up disk space before continuing',
      });
    }
  } catch (e) {
    // df command might not be available on Windows
  }
  
  // Check if node_modules has incorrect permissions
  try {
    const nodeModulesPath = path.join(PROJECT_DIR, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      try {
        // Try to write a test file to check permissions
        const testPath = path.join(nodeModulesPath, '.permission-test');
        fs.writeFileSync(testPath, 'test');
        fs.unlinkSync(testPath);
      } catch (e) {
        issues.push({
          name: 'Permission issue',
          description: 'node_modules directory has incorrect permissions',
          fix: os.platform() === 'win32'
            ? 'Run with administrator privileges or fix permissions'
            : 'Run: chmod -R u+w node_modules',
        });
      }
    }
  } catch (e) {
    // Ignore permission errors here as we're just checking
  }
  
  return issues;
}

/**
 * Run the recovery process
 */
async function runRecovery() {
  console.log(`${colors.bold}${colors.magenta}ShepLang pnpm Install Recovery${colors.reset}\n`);
  
  // Collect system information
  console.log(`${colors.bold}System Information:${colors.reset}`);
  const systemInfo = collectSystemInfo();
  
  Object.entries(systemInfo).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
  
  // Check for common issues
  const issues = checkCommonIssues();
  if (issues.length > 0) {
    console.log(`\n${colors.bold}${colors.yellow}Potential Issues Detected:${colors.reset}`);
    
    issues.forEach(issue => {
      console.log(`\n  ${colors.bold}${issue.name}${colors.reset}`);
      console.log(`  ${issue.description}`);
      console.log(`  ${colors.green}Fix:${colors.reset} ${issue.fix}`);
    });
    
    console.log('');
    const continueAnyway = await askQuestion('Continue with recovery anyway? (y/n)', 'n');
    
    if (continueAnyway.toLowerCase() !== 'y' && continueAnyway.toLowerCase() !== 'yes') {
      console.log(`${colors.yellow}Recovery aborted${colors.reset}`);
      return;
    }
  }
  
  // Show recovery options
  console.log(`\n${colors.bold}Recovery Options:${colors.reset}`);
  
  const options = RECOVERY_LEVELS.map(level => 
    `${colors.bold}${level.name}${colors.reset} - ${level.description}`
  );
  
  const selection = await showMenu(options, 'Choose a recovery level');
  if (selection === null) return;
  
  const selectedLevel = RECOVERY_LEVELS[selection];
  console.log(`\n${colors.bold}Running ${selectedLevel.name} recovery...${colors.reset}`);
  
  // Execute recovery actions
  let success = true;
  
  for (const action of selectedLevel.actions) {
    console.log(`\n${colors.yellow}${action.desc}...${colors.reset}`);
    const cmd = action.cmd.replace(/^rm -rf/, isWindowsRmCommand());
    
    if (!execCommand(cmd, { cwd: PROJECT_DIR })) {
      success = false;
      console.log(`${colors.red}✗ Action failed${colors.reset}`);
      
      const continueNext = await askQuestion('Continue with next step? (y/n)', 'y');
      if (continueNext.toLowerCase() !== 'y' && continueNext.toLowerCase() !== 'yes') {
        break;
      }
    }
  }
  
  // Report results
  if (success) {
    console.log(`\n${colors.green}${colors.bold}✓ Recovery completed successfully!${colors.reset}`);
    console.log(`\nNext steps:`);
    console.log(`  1. ${colors.cyan}cd ${PROJECT_DIR}${colors.reset}`);
    console.log(`  2. ${colors.cyan}pnpm build${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}${colors.bold}⚠️ Recovery had some issues${colors.reset}`);
    console.log(`\nTry these steps manually:`);
    console.log(`  1. ${colors.cyan}cd ${PROJECT_DIR}${colors.reset}`);
    console.log(`  2. ${colors.cyan}pnpm store prune${colors.reset}`);
    console.log(`  3. ${colors.cyan}rm -rf node_modules pnpm-lock.yaml${colors.reset}`);
    console.log(`  4. ${colors.cyan}pnpm install${colors.reset}`);
    
    if (process.env.CI) {
      console.log(`\n${colors.red}Recovery failed in CI environment${colors.reset}`);
      process.exit(1);
    }
  }
}

/**
 * Get the Windows equivalent of rm -rf
 */
function isWindowsRmCommand() {
  return os.platform() === 'win32' ? 'if exist' : 'rm -rf';
}

// Run the recovery
runRecovery().catch(error => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
});

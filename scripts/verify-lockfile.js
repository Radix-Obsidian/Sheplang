#!/usr/bin/env node

/**
 * ShepLang Lockfile Verification
 * 
 * Verifies that the lockfile is in sync with package.json files
 * to prevent inconsistent installs.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  bold: '\x1b[1m',
};

// Root project directory
const ROOT = path.resolve(__dirname, '..');
const PROJECT_DIR = path.join(ROOT, 'sheplang');

// Files to check
const PACKAGE_JSON = path.join(PROJECT_DIR, 'package.json');
const LOCKFILE = path.join(PROJECT_DIR, 'pnpm-lock.yaml');
const WORKSPACE_FILE = path.join(PROJECT_DIR, 'pnpm-workspace.yaml');

/**
 * Find all package.json files in the workspace
 */
function findPackageJsonFiles() {
  // Read workspace configuration
  if (!fs.existsSync(WORKSPACE_FILE)) {
    return [PACKAGE_JSON]; // Only the root package.json
  }
  
  const workspaceContent = fs.readFileSync(WORKSPACE_FILE, 'utf8');
  const packagePatterns = workspaceContent
    .split('\n')
    .filter(line => line.trim().startsWith('- '))
    .map(line => line.replace(/^-\s*["']?([^"']*)["']?$/, '$1').trim());
  
  // Find package.json files according to workspace patterns
  const packageJsonFiles = [PACKAGE_JSON]; // Start with root package.json
  
  for (const pattern of packagePatterns) {
    const basePath = pattern.replace(/\/\*$/, ''); // Remove trailing /* if present
    const packagesDir = path.join(PROJECT_DIR, basePath);
    
    if (!fs.existsSync(packagesDir)) continue;
    
    if (pattern.endsWith('/*')) {
      // Pattern like "packages/*"
      try {
        const entries = fs.readdirSync(packagesDir);
        for (const entry of entries) {
          const packageJsonPath = path.join(packagesDir, entry, 'package.json');
          if (fs.existsSync(packageJsonPath)) {
            packageJsonFiles.push(packageJsonPath);
          }
        }
      } catch (e) {
        console.error(`Failed to read directory: ${packagesDir}`);
      }
    } else {
      // Direct path to a package
      const packageJsonPath = path.join(packagesDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        packageJsonFiles.push(packageJsonPath);
      }
    }
  }
  
  return packageJsonFiles;
}

/**
 * Calculate a hash of file contents
 */
function calculateFileHash(filePath) {
  if (!fs.existsSync(filePath)) return null;
  
  const content = fs.readFileSync(filePath, 'utf8');
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Check if the lockfile matches the package.json files
 */
function verifyLockfile() {
  if (!fs.existsSync(LOCKFILE)) {
    console.error(`${colors.red}${colors.bold}✗ Lockfile not found:${colors.reset} ${LOCKFILE}`);
    return false;
  }
  
  // Get all package.json files
  const packageJsonFiles = findPackageJsonFiles();
  console.log(`Found ${packageJsonFiles.length} package.json files in the workspace`);
  
  // Calculate hash of the lockfile
  const lockfileHash = calculateFileHash(LOCKFILE);
  
  // Calculate combined hash of all package.json files
  const packageJsonHashes = packageJsonFiles.map(file => {
    const hash = calculateFileHash(file);
    return {
      path: file,
      hash,
      mtime: fs.statSync(file).mtime
    };
  });
  
  // Check if any package.json was modified after the lockfile
  const lockfileStats = fs.statSync(LOCKFILE);
  const outOfSyncFiles = packageJsonHashes.filter(info => 
    info.mtime > lockfileStats.mtime
  );
  
  if (outOfSyncFiles.length > 0) {
    console.warn(`${colors.yellow}${colors.bold}⚠️ Some package.json files were modified after the lockfile:${colors.reset}`);
    outOfSyncFiles.forEach(info => {
      console.warn(`  ${path.relative(ROOT, info.path)}`);
    });
    
    if (process.env.CI || process.env.LOCKFILE_STRICT === 'true') {
      console.error(`${colors.red}${colors.bold}✗ Lockfile is out of sync with package.json files${colors.reset}`);
      console.log(`Run ${colors.green}pnpm install${colors.reset} to update the lockfile`);
      return false;
    } else {
      console.warn(`${colors.yellow}Consider running ${colors.bold}pnpm install${colors.reset} ${colors.yellow}to update the lockfile${colors.reset}`);
      return true; // Allow to proceed but warn
    }
  }
  
  console.log(`${colors.green}${colors.bold}✓ Lockfile is in sync with package.json files${colors.reset}`);
  return true;
}

// Run the verification
try {
  if (!verifyLockfile() && (process.env.CI || process.env.LOCKFILE_STRICT === 'true')) {
    process.exit(1);
  }
} catch (error) {
  console.error(`${colors.red}Error during lockfile verification: ${error.message}${colors.reset}`);
  process.exit(1);
}

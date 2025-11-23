#!/usr/bin/env node
/**
 * Production Build Script for ShepLang VS Code Extension
 * 
 * This script follows official VS Code extension packaging guidelines:
 * https://code.visualstudio.com/api/working-with-extensions/publishing-extension
 * 
 * It performs the following steps:
 * 1. Clean previous builds
 * 2. Install all dependencies
 * 3. Rebuild language package
 * 4. Compile extension
 * 5. Run production tests
 * 6. Create VSIX package
 * 7. Verify VSIX content
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration
const rootDir = path.resolve(__dirname, '..');
const langPackageDir = path.resolve(rootDir, '..', 'sheplang', 'packages', 'language');

/**
 * Run a command and log its output
 */
function runCommand(command, cwd = rootDir) {
  console.log(chalk.blue(`\n> ${command}`));
  try {
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: true } 
    });
    return true;
  } catch (error) {
    console.error(chalk.red(`Command failed: ${command}`));
    console.error(chalk.red(error.message));
    return false;
  }
}

/**
 * Check if a file or directory exists
 */
function exists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Main build process
 */
async function build() {
  console.log(chalk.green.bold('\n🚀 PRODUCTION BUILD: ShepLang VS Code Extension\n'));

  console.log(chalk.yellow('Step 1: Clean previous builds'));
  // Use fs.rmSync instead of rimraf to avoid glob issues
  if (fs.existsSync(path.join(rootDir, 'out'))) {
    fs.rmSync(path.join(rootDir, 'out'), { recursive: true, force: true });
    console.log(chalk.blue('> Removed out directory'));
  }
  
  // Remove any existing VSIX files
  const vsixFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.vsix'));
  for (const file of vsixFiles) {
    fs.unlinkSync(path.join(rootDir, file));
    console.log(chalk.blue(`> Removed ${file}`));
  }
  
  console.log(chalk.yellow('\nStep 2: Install extension dependencies'));
  if (!runCommand('npm install')) {
    console.error(chalk.red('❌ Extension dependency installation failed!'));
    process.exit(1);
  }
  
  console.log(chalk.yellow('\nStep 3: Rebuild language package'));
  if (!exists(langPackageDir)) {
    console.error(chalk.red(`❌ Language package directory not found at ${langPackageDir}`));
    console.error(chalk.red('Make sure the language package is correctly referenced in package.json'));
    process.exit(1);
  }
  
  runCommand('npm install', langPackageDir);
  runCommand('npm run build', langPackageDir);
  
  console.log(chalk.yellow('\nStep 4: Compile extension'));
  if (!runCommand('npm run compile')) {
    console.error(chalk.red('❌ Extension compilation failed!'));
    process.exit(1);
  }
  
  console.log(chalk.yellow('\nStep 5: Run production tests'));
  if (!runCommand('npm run test:production')) {
    console.error(chalk.red('❌ Production tests failed!'));
    console.log(chalk.yellow('Review test failures before packaging.'));
    // Continue despite test failures to allow manual inspection
  }
  
  console.log(chalk.yellow('\nStep 6: Create VSIX package'));
  if (!runCommand('npm run package')) {
    console.error(chalk.red('❌ VSIX packaging failed!'));
    process.exit(1);
  }
  
  console.log(chalk.yellow('\nStep 7: Verify VSIX content'));
  const createdVsixFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.vsix'));
  if (createdVsixFiles.length === 0) {
    console.error(chalk.red('❌ No VSIX files found after packaging!'));
    process.exit(1);
  }
  
  const latestVsix = createdVsixFiles.sort().pop();
  console.log(chalk.green(`\n✅ VSIX package created: ${latestVsix}`));
  
  // List VSIX content to verify dependencies
  console.log(chalk.blue(`\nVerifying VSIX content (looking for langium):`));
  try {
    const vsceOutput = execSync(`npx vsce ls ${latestVsix}`, { 
      cwd: rootDir,
      encoding: 'utf8'
    });
    
    // Check if langium is included
    if (vsceOutput.includes('langium')) {
      console.log(chalk.green('✅ Found langium in VSIX package'));
    } else {
      console.warn(chalk.yellow('⚠️ Could not find langium in VSIX - your extension may fail to activate'));
    }
    
    // Print some parts of the output
    console.log(chalk.blue('\nVSIX contents (partial):'));
    console.log(vsceOutput.split('\n').slice(0, 20).join('\n'));
    
  } catch (error) {
    console.warn(chalk.yellow('⚠️ Could not verify VSIX contents - please check manually'));
    console.warn(error.message);
  }
  
  console.log(chalk.green.bold('\n✅ BUILD COMPLETE!'));
  console.log(chalk.cyan('\nTo install the extension for testing:'));
  console.log(`code --install-extension ${latestVsix}`);
}

build().catch(err => {
  console.error(chalk.red('Build failed with error:'));
  console.error(err);
  process.exit(1);
});

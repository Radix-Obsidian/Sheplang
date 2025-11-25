#!/usr/bin/env node

/**
 * VS Code Extension Battle Test Script
 * Following official VS Code testing documentation
 * Tests all core functionality before publishing
 */

const { runTests } = require('@vscode/test-electron');
const path = require('path');

async function runBattleTests() {
  console.log('🚀 Starting ShepLang VS Code Extension Battle Tests...\n');

  try {
    // Download VS Code, unzip it and run the integration test
    const exitCode = await runTests({
      extensionDevelopmentPath: path.resolve(__dirname, '..'),
      extensionTestsPath: path.resolve(__dirname, './suite/battle-test.js'),
      launchArgs: ['--disable-extensions'], // Disable other extensions for clean testing
    });

    if (exitCode === 0) {
      console.log('\n✅ ALL BATTLE TESTS PASSED!');
      console.log('🎯 Extension is ready for publishing to VS Code Marketplace');
    } else {
      console.log('\n❌ BATTLE TESTS FAILED!');
      console.log('🔧 Fix issues before publishing');
      process.exit(exitCode);
    }
  } catch (err) {
    console.error('\n💥 Battle test failed to run:', err);
    process.exit(1);
  }
}

runBattleTests();

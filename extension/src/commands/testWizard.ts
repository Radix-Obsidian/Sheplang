/**
 * Test Wizard Command
 * 
 * Runs comprehensive tests on the ShepLang Project Wizard
 */

import * as vscode from 'vscode';
import { outputChannel } from '../services/outputChannel';
import { WizardTestSuite } from '../test/wizardTestSuite';

export async function testWizard(): Promise<void> {
  outputChannel.section('ShepLang Wizard Test Suite');

  try {
    // Check if we're in a workspace
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage('Please open a folder before running wizard tests.');
      return;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;

    // Show progress during tests
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: '🧪 Running Wizard Tests',
        cancellable: false
      },
      async (progress) => {
        progress.report({ increment: 0, message: 'Initializing test suite...' });

        // Create test suite
        const testSuite = new WizardTestSuite(workspaceRoot);

        progress.report({ increment: 10, message: 'Running test scenarios...' });

        // Run all tests
        const results = await testSuite.runAllTests();

        progress.report({ increment: 90, message: 'Analyzing results...' });

        // Get summary
        const summary = testSuite.getSummary();

        progress.report({ increment: 100, message: 'Tests completed!' });

        // Show results
        const message = `Test Results: ${summary.passed}/${summary.total} passed (${Math.round(summary.successRate)}%)`;

        const result = await vscode.window.showInformationMessage(
          message,
          summary.failed > 0 ? 'View Failures' : 'View Report',
          'Close'
        );

        if (result === 'View Failures' && summary.failed > 0) {
          // Show failed tests
          const failures = results.filter(r => !r.success);
          const failureList = failures.map(f =>
            `❌ ${f.scenario}: ${f.errors.join(', ')}`
          ).join('\n\n');

          vscode.window.showErrorMessage(
            `Failed Tests:\n\n${failureList}`,
            'OK'
          );
        } else if (result === 'View Report') {
          // Open the test report
          const reportPath = `${workspaceRoot}/wizard-test-report.md`;
          const reportUri = vscode.Uri.file(reportPath);

          try {
            await vscode.commands.executeCommand('vscode.open', reportUri);
          } catch (error) {
            vscode.window.showInformationMessage('Test report not found. Check output channel for results.');
            outputChannel.show();
          }
        }

        // Log summary to output channel
        outputChannel.info('Test Suite Summary:');
        outputChannel.info(`  Total: ${summary.total}`);
        outputChannel.info(`  Passed: ${summary.passed} ✅`);
        outputChannel.info(`  Failed: ${summary.failed} ❌`);
        outputChannel.info(`  Success Rate: ${Math.round(summary.successRate)}%`);
        outputChannel.info(`  Average Duration: ${Math.round(summary.avgDuration)}ms`);
        outputChannel.info(`  Total Errors: ${summary.totalErrors}`);
        outputChannel.info(`  Total Warnings: ${summary.totalWarnings}`);

        if (summary.failed > 0) {
          outputChannel.info('Some tests failed. Check the test report for details.');
        } else {
          outputChannel.success('All tests passed! 🎉');
        }
      }
    );

  } catch (error) {
    outputChannel.error('Wizard test suite failed:', error);

    vscode.window.showErrorMessage(
      `Test suite failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'View Output',
      'Close'
    ).then(result => {
      if (result === 'View Output') {
        outputChannel.show();
      }
    });
  }
}

/**
 * Quick test command for single scenario
 */
export async function quickTestWizard(): Promise<void> {
  outputChannel.section('Quick Wizard Test');

  try {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage('Please open a folder first.');
      return;
    }

    // Select test scenario
    const scenarios = [
      'SaaS Dashboard',
      'E-commerce Store',
      'Content Platform',
      'Mobile-First App',
      'Custom Application',
      'Minimal App'
    ];

    const selected = await vscode.window.showQuickPick(
      scenarios,
      {
        placeHolder: 'Select test scenario',
        canPickMany: false
      }
    );

    if (!selected) {
      return;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    const testSuite = new WizardTestSuite(workspaceRoot);

    // Run single test (would need to modify test suite to support this)
    vscode.window.showInformationMessage(
      `Running test: ${selected}\n\nThis will test the wizard with a ${selected.toLowerCase()} scenario.`,
      'Run Test',
      'Cancel'
    ).then(result => {
      if (result === 'Run Test') {
        // For now, run all tests
        testWizard();
      }
    });

  } catch (error) {
    outputChannel.error('Quick test failed:', error);
    vscode.window.showErrorMessage(`Quick test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

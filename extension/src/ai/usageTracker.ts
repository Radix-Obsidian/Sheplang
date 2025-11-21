/**
 * Usage Tracker - Import limit management
 * 
 * Tracks AI-powered imports per user:
 * - Free users: 1 import per month
 * - Power users (with own API key): unlimited
 * 
 * Stored in VS Code globalState (persists across sessions)
 */

import * as vscode from 'vscode';

interface UsageData {
  importsThisMonth: number;
  lastImportDate: string; // ISO date
  monthReset: string; // ISO date of current month start
}

const USAGE_KEY = 'sheplang.ai.usage';

/**
 * Get current month start date (for reset tracking)
 */
function getCurrentMonthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

/**
 * Get usage data for current user
 */
function getUsageData(context: vscode.ExtensionContext): UsageData {
  const stored = context.globalState.get<UsageData>(USAGE_KEY);
  const currentMonth = getCurrentMonthStart();
  
  // If no data or new month, reset
  if (!stored || stored.monthReset !== currentMonth) {
    return {
      importsThisMonth: 0,
      lastImportDate: '',
      monthReset: currentMonth
    };
  }
  
  return stored;
}

/**
 * Save usage data
 */
async function saveUsageData(
  context: vscode.ExtensionContext,
  data: UsageData
): Promise<void> {
  await context.globalState.update(USAGE_KEY, data);
}

/**
 * Check if user has own API key (power user = unlimited)
 */
function hasOwnApiKey(): boolean {
  const config = vscode.workspace.getConfiguration('sheplang');
  const userKey = config.get<string>('anthropicApiKey');
  return !!(userKey && userKey.trim().length > 0);
}

/**
 * Check if user can import (within limits)
 */
export function canImport(context: vscode.ExtensionContext): boolean {
  // Debug mode: bypass limits if environment variable is set
  const config = vscode.workspace.getConfiguration('sheplang');
  const debugBypass = config.get<boolean>('debugBypassLimits', false);
  if (debugBypass) {
    return true;
  }
  
  // Power users with own API key: unlimited
  if (hasOwnApiKey()) {
    return true;
  }
  
  // Free users: check monthly limit (5 per month for alpha)
  const usage = getUsageData(context);
  return usage.importsThisMonth < 5;
}

/**
 * Get remaining imports this month
 */
export function getRemainingImports(context: vscode.ExtensionContext): number {
  if (hasOwnApiKey()) {
    return Infinity; // Unlimited for power users
  }
  
  const usage = getUsageData(context);
  return Math.max(0, 5 - usage.importsThisMonth);
}

/**
 * Record an import (increment counter)
 */
export async function recordImport(context: vscode.ExtensionContext): Promise<void> {
  // Don't track if user has own API key
  if (hasOwnApiKey()) {
    return;
  }
  
  const usage = getUsageData(context);
  usage.importsThisMonth += 1;
  usage.lastImportDate = new Date().toISOString();
  
  await saveUsageData(context, usage);
}

/**
 * Show usage limit reached message with feedback prompt
 */
export async function showLimitReachedMessage(): Promise<void> {
  const message = `You've reached your free import limit (5 per month).

This is an alpha limitation. What would be fair limits for free/paid users?

Your feedback shapes our pricing!`;
  
  const selection = await vscode.window.showWarningMessage(
    message,
    'Share Feedback',
    'Add My Own API Key'
  );
  
  if (selection === 'Share Feedback') {
    // Open feedback form
    vscode.env.openExternal(
      vscode.Uri.parse('https://github.com/Golden-Sheep-AI/sheplang/discussions/new?category=feedback&title=Import%20Limits%20Feedback')
    );
  } else if (selection === 'Add My Own API Key') {
    // Open settings
    vscode.commands.executeCommand('workbench.action.openSettings', 'sheplang.anthropicApiKey');
  }
}

/**
 * Show usage stats (for debugging/transparency)
 */
export function showUsageStats(context: vscode.ExtensionContext): void {
  const usage = getUsageData(context);
  const remaining = getRemainingImports(context);
  
  if (hasOwnApiKey()) {
    vscode.window.showInformationMessage(
      '✓ Using your own API key - unlimited imports!'
    );
  } else {
    const monthStart = new Date(usage.monthReset).toLocaleDateString();
    vscode.window.showInformationMessage(
      `AI Import Usage:\n\n` +
      `This month (since ${monthStart}):\n` +
      `- Used: ${usage.importsThisMonth}\n` +
      `- Remaining: ${remaining}\n\n` +
      `Resets on the 1st of each month.`
    );
  }
}

/**
 * Reset usage counter (for testing only)
 */
export async function resetUsageForTesting(context: vscode.ExtensionContext): Promise<void> {
  await context.globalState.update(USAGE_KEY, undefined);
  vscode.window.showInformationMessage('✓ Usage counter reset. You can now test imports again.');
}

/**
 * Semantic Wizard - Reusable across all importers
 * 
 * Helps users provide context after importing structured code:
 * - App type (E-commerce, SaaS, etc.)
 * - Entity names
 * - Action purposes
 * - Field types
 * 
 * Used by: Next.js importer, Webflow importer, future importers
 */

import * as vscode from 'vscode';

export interface WizardInput {
  appType?: string;
  entities?: string[];
  customInstructions?: string;
}

export interface ImportSummary {
  appName: string;
  detectedEntities: string[];
  detectedScreens: number;
  detectedWidgets?: number;
}

/**
 * Show semantic wizard to gather user context
 */
export async function showSemanticWizard(
  importedData: ImportSummary
): Promise<WizardInput | undefined> {
  
  // Summary of what was imported
  const foundText = importedData.detectedWidgets !== undefined
    ? `- ${importedData.detectedScreens} screens\n- ${importedData.detectedEntities.length} entities\n- ${importedData.detectedWidgets} widgets detected`
    : `- ${importedData.detectedScreens} screens\n- ${importedData.detectedEntities.length} entities`;
  
  const summary = `
✓ Imported "${importedData.appName}"!

Found:
${foundText}

Now let's refine the semantics...
  `.trim();
  
  vscode.window.showInformationMessage(summary);
  
  // Ask app type
  const appType = await vscode.window.showQuickPick(
    [
      'E-commerce',
      'SaaS Platform',
      'Social Network',
      'Content/Blog',
      'Dashboard/Analytics',
      'Marketplace',
      'Food Delivery',
      'Banking/Finance',
      'Healthcare',
      'Education',
      'Other'
    ],
    { 
      placeHolder: 'What type of app is this?',
      ignoreFocusOut: true 
    }
  );
  
  if (!appType) return undefined;
  
  // Ask for entity names
  const entityNames = await vscode.window.showInputBox({
    prompt: 'What entities does your app have? (comma-separated)',
    placeHolder: 'e.g., User, Product, Order, Review',
    value: importedData.detectedEntities.join(', '),
    ignoreFocusOut: true
  });
  
  if (!entityNames) return undefined;
  
  // Optional: custom instructions
  const customInstructions = await vscode.window.showInputBox({
    prompt: 'Any special instructions for code generation? (optional)',
    placeHolder: 'e.g., "Use Stripe for payments", "Add user roles", "Multi-tenant"',
    ignoreFocusOut: true
  });
  
  return {
    appType,
    entities: entityNames.split(',').map(e => e.trim()).filter(e => e.length > 0),
    customInstructions
  };
}

/**
 * Show feedback prompt after successful import
 */
export async function showFeedbackPrompt(): Promise<void> {
  const feedback = await vscode.window.showInformationMessage(
    'Help us improve! Share feedback about this import.',
    'Send Feedback',
    'Not Now'
  );
  
  if (feedback === 'Send Feedback') {
    // TODO: Replace with actual feedback form URL
    vscode.env.openExternal(vscode.Uri.parse('https://github.com/Golden-Sheep-AI/sheplang/discussions'));
  }
}

/**
 * Show success message with next steps
 */
export async function showSuccessMessage(filesGenerated: number): Promise<void> {
  const message = filesGenerated === 1
    ? '✓ ShepLang file generated! Review and customize as needed.'
    : `✓ ${filesGenerated} ShepLang files generated! Review and customize as needed.`;
  
  vscode.window.showInformationMessage(message);
}

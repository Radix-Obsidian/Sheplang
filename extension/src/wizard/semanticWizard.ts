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
import { interpretEntityInput, showEntityFeedback, interpretInstructions, showInstructionFeedback } from '../ai/wizardInterpreter';
import { canImport, recordImport, showLimitReachedMessage, getRemainingImports } from '../ai/usageTracker';

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
  context: vscode.ExtensionContext,
  importedData: ImportSummary
): Promise<WizardInput | undefined> {
  
  // Check usage limits first
  if (!canImport(context)) {
    await showLimitReachedMessage();
    return undefined;
  }
  
  // Show remaining imports if on free tier
  const remaining = getRemainingImports(context);
  if (remaining !== Infinity && remaining <= 1) {
    vscode.window.showInformationMessage(
      `ℹ️ You have ${remaining} AI-powered import${remaining === 1 ? '' : 's'} remaining this month (free tier)`,
      { modal: false }
    );
  }
  
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
  
  // Ask about the main things/concepts in the app (optional)
  const entityInput = await vscode.window.showInputBox({
    prompt: 'What are the main things or concepts in your app? (optional - press Enter to skip)',
    placeHolder: 'e.g., users and messages, or products and orders, or just press Enter if not applicable',
    value: importedData.detectedEntities.join(', '),
    ignoreFocusOut: true
  });

  let entities: string[] | undefined = undefined;
  if (entityInput && entityInput.trim().length > 0) {
    // Try AI interpretation first
    const aiInterpretation = await interpretEntityInput(
      context,
      entityInput,
      `App: ${importedData.appName}, Detected: ${importedData.detectedEntities.join(', ')}`
    );
    
    if (aiInterpretation) {
      // AI successfully interpreted
      entities = aiInterpretation.entities || undefined;
      showEntityFeedback(aiInterpretation);
    } else {
      // Fallback to heuristics if AI unavailable
      const input = entityInput.trim().toLowerCase();
      const skipPhrases = ['none', 'not applicable', 'n/a', 'skip', 'nothing', 'no', "doesn't", "component"];
      const isNonApplicable = skipPhrases.some(phrase => input.includes(phrase));
      
      if (isNonApplicable) {
        vscode.window.showInformationMessage('✓ Got it - skipping data models', { modal: false });
      } else {
        entities = entityInput
          .split(',')
          .map(e => e.trim())
          .filter(e => e.length > 0 && e.length < 50);
        
        if (entities.length > 0) {
          const entityList = entities.map(e => `• ${e}`).join('\n');
          vscode.window.showInformationMessage(`✓ Got it! Main concepts:\n${entityList}`, { modal: false });
        }
      }
    }
  }
  
  // Optional: custom instructions
  const customInstructions = await vscode.window.showInputBox({
    prompt: 'Any special instructions for code generation? (optional - press Enter to skip)',
    placeHolder: 'e.g., "Use Stripe for payments", "Add user roles", "Multi-tenant"',
    ignoreFocusOut: true
  });
  
  // Interpret custom instructions with AI
  let finalInstructions: string | undefined = customInstructions;
  if (customInstructions && customInstructions.trim().length > 0) {
    const aiInterpretation = await interpretInstructions(context, customInstructions);
    
    if (aiInterpretation) {
      finalInstructions = aiInterpretation.instructions || undefined;
      if (aiInterpretation.hasInstructions) {
        showInstructionFeedback(aiInterpretation);
      }
    } else {
      // Fallback feedback without AI
      vscode.window.showInformationMessage(
        `✓ Got it! I'll add this note: "${customInstructions}"`,
        { modal: false }
      );
    }
  }
  
  // Record this import (for usage tracking)
  await recordImport(context);
  
  return {
    appType,
    entities,
    customInstructions: finalInstructions
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

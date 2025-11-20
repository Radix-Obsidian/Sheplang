"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.showSemanticWizard = showSemanticWizard;
exports.showFeedbackPrompt = showFeedbackPrompt;
exports.showSuccessMessage = showSuccessMessage;
const vscode = __importStar(require("vscode"));
/**
 * Show semantic wizard to gather user context
 */
async function showSemanticWizard(importedData) {
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
    const appType = await vscode.window.showQuickPick([
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
    ], {
        placeHolder: 'What type of app is this?',
        ignoreFocusOut: true
    });
    if (!appType)
        return undefined;
    // Ask for entity names
    const entityNames = await vscode.window.showInputBox({
        prompt: 'What entities does your app have? (comma-separated)',
        placeHolder: 'e.g., User, Product, Order, Review',
        value: importedData.detectedEntities.join(', '),
        ignoreFocusOut: true
    });
    if (!entityNames)
        return undefined;
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
async function showFeedbackPrompt() {
    const feedback = await vscode.window.showInformationMessage('Help us improve! Share feedback about this import.', 'Send Feedback', 'Not Now');
    if (feedback === 'Send Feedback') {
        // TODO: Replace with actual feedback form URL
        vscode.env.openExternal(vscode.Uri.parse('https://github.com/Golden-Sheep-AI/sheplang/discussions'));
    }
}
/**
 * Show success message with next steps
 */
async function showSuccessMessage(filesGenerated) {
    const message = filesGenerated === 1
        ? '✓ ShepLang file generated! Review and customize as needed.'
        : `✓ ${filesGenerated} ShepLang files generated! Review and customize as needed.`;
    vscode.window.showInformationMessage(message);
}
//# sourceMappingURL=semanticWizard.js.map
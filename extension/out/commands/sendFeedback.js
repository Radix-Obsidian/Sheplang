"use strict";
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
exports.sendFeedbackCommand = sendFeedbackCommand;
const vscode = __importStar(require("vscode"));
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const outputChannel_1 = require("../services/outputChannel");
/**
 * Categories for user feedback
 */
var FeedbackCategory;
(function (FeedbackCategory) {
    FeedbackCategory["BUG"] = "Bug report";
    FeedbackCategory["FEATURE"] = "Feature request";
    FeedbackCategory["IMPROVEMENT"] = "Improvement suggestion";
    FeedbackCategory["OTHER"] = "Other";
})(FeedbackCategory || (FeedbackCategory = {}));
/**
 * Command to send user feedback through GitHub issues or other channels
 */
async function sendFeedbackCommand(context) {
    // 1. Select feedback type
    const category = await vscode.window.showQuickPick(Object.values(FeedbackCategory), {
        placeHolder: 'What kind of feedback would you like to provide?',
        title: 'ShepLang Feedback'
    });
    if (!category) {
        return; // User cancelled
    }
    // 2. Get feedback description
    const description = await vscode.window.showInputBox({
        prompt: 'Please describe your feedback in detail',
        placeHolder: category === FeedbackCategory.BUG
            ? 'Steps to reproduce, expected vs. actual behavior...'
            : 'Your thoughts and suggestions...',
        title: `ShepLang Feedback - ${category}`,
        // VS Code API doesn't support multiline in InputBox yet, but keeping comment for future support
        ignoreFocusOut: true
    });
    if (!description) {
        return; // User cancelled
    }
    // 3. Optional email
    const emailOptional = await vscode.window.showInputBox({
        prompt: 'Email address (optional, only if you want to be contacted)',
        placeHolder: 'email@example.com',
        title: 'ShepLang Feedback - Contact (Optional)',
        ignoreFocusOut: true
    });
    // 4. Collect diagnostic information
    const packageJson = context.extension.packageJSON;
    const diagnostics = {
        version: packageJson.version,
        os: `${os.platform()} ${os.release()}`,
        vscodeVersion: vscode.version,
        date: new Date().toISOString(),
        logs: collectRelevantLogs()
    };
    // 5. Ask if they want to include diagnostic information
    const includeDiagnostics = await vscode.window.showQuickPick(['Yes, include diagnostic information', 'No, submit without diagnostics'], {
        placeHolder: 'Would you like to include diagnostic information?',
        title: 'ShepLang Feedback - Diagnostics'
    });
    if (!includeDiagnostics) {
        return; // User cancelled
    }
    // 6. Show preview and confirm
    const feedback = {
        category: category,
        description,
        email: emailOptional || undefined,
        diagnostics: includeDiagnostics.startsWith('Yes') ? diagnostics : {
            version: packageJson.version,
            os: `${os.platform()}`,
            vscodeVersion: vscode.version,
            date: new Date().toISOString()
        }
    };
    // Preview feedback in an untitled document
    const previewDocument = await vscode.workspace.openTextDocument({
        content: formatFeedbackForPreview(feedback),
        language: 'markdown'
    });
    await vscode.window.showTextDocument(previewDocument);
    // 7. Confirm submission
    const confirm = await vscode.window.showInformationMessage('Please review your feedback and confirm submission', 'Submit feedback', 'Edit feedback', 'Cancel');
    if (confirm === 'Submit feedback') {
        await submitFeedback(feedback);
        vscode.window.showInformationMessage('Thank you for your feedback!');
    }
    else if (confirm === 'Edit feedback') {
        // Restart the process
        await sendFeedbackCommand(context);
    }
    // Cancel or other = do nothing
}
/**
 * Submit feedback through available channels
 */
async function submitFeedback(feedback) {
    // Store feedback locally for now
    const feedbacksDir = path.join(os.tmpdir(), 'sheplang-feedback');
    if (!fs.existsSync(feedbacksDir)) {
        fs.mkdirSync(feedbacksDir, { recursive: true });
    }
    const filename = `feedback-${new Date().toISOString().replace(/:/g, '-')}.json`;
    const filepath = path.join(feedbacksDir, filename);
    // Save feedback to file
    fs.writeFileSync(filepath, JSON.stringify(feedback, null, 2));
    outputChannel_1.outputChannel.info(`Feedback saved to ${filepath}`);
    // TODO: In production, submit to a feedback endpoint
    // For now we'll create a GitHub issue URL
    const issueTitle = encodeURIComponent(`[${feedback.category}] ${feedback.description.slice(0, 50)}${feedback.description.length > 50 ? '...' : ''}`);
    const issueBody = encodeURIComponent(formatFeedbackForGitHub(feedback));
    const issueUrl = `https://github.com/Radix-Obsidian/Sheplang/issues/new?title=${issueTitle}&body=${issueBody}&labels=user-feedback`;
    // Open in browser
    vscode.env.openExternal(vscode.Uri.parse(issueUrl));
}
/**
 * Format feedback for preview
 */
function formatFeedbackForPreview(feedback) {
    return `# ShepLang Feedback

## Category
${feedback.category}

## Description
${feedback.description}

${feedback.email ? `## Contact\n${feedback.email}\n\n` : ''}
## Diagnostic Information
- ShepLang version: ${feedback.diagnostics.version}
- OS: ${feedback.diagnostics.os}
- VS Code: ${feedback.diagnostics.vscodeVersion}
- Date: ${new Date(feedback.diagnostics.date).toLocaleString()}

${feedback.diagnostics.logs ? '## Logs\n```\n' + feedback.diagnostics.logs + '\n```' : ''}
`;
}
/**
 * Format feedback for GitHub issues
 */
function formatFeedbackForGitHub(feedback) {
    return `## Description
${feedback.description}

${feedback.email ? `## Contact\n${feedback.email}\n\n` : ''}
## Diagnostic Information
- ShepLang version: ${feedback.diagnostics.version}
- OS: ${feedback.diagnostics.os}
- VS Code: ${feedback.diagnostics.vscodeVersion}
- Date: ${new Date(feedback.diagnostics.date).toLocaleString()}

${feedback.diagnostics.logs ? '## Logs\n```\n' + feedback.diagnostics.logs + '\n```' : ''}

<!-- This issue was created via the ShepLang VS Code extension feedback tool -->
`;
}
/**
 * Collect relevant logs for diagnostics
 */
function collectRelevantLogs() {
    // For now, just return a placeholder message
    return 'To view detailed logs, check the ShepLang output channel in VS Code.';
}
//# sourceMappingURL=sendFeedback.js.map
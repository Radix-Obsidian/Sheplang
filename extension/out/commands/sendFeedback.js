"use strict";
/**
 * Send Feedback Command
 *
 * Non-intrusive way for alpha users to provide feedback about the extension.
 * Opens a simple form in default browser.
 *
 * Official VS Code Extension API:
 * - Commands: https://code.visualstudio.com/api/references/vscode-api#commands
 * - External URLs: https://code.visualstudio.com/api/references/vscode-api#env.openExternal
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
exports.sendFeedback = sendFeedback;
exports.maybePromptFeedback = maybePromptFeedback;
const vscode = __importStar(require("vscode"));
/**
 * Send feedback command handler
 *
 * Opens feedback form in user's default browser.
 */
async function sendFeedback() {
    const feedbackUrl = 'https://forms.gle/YOUR_GOOGLE_FORM_ID'; // TODO: Replace with actual form
    const proceed = await vscode.window.showInformationMessage('Thanks for helping us improve ShepLang! 🐑\n\nYour feedback will open in your browser.', { modal: false }, 'Open Feedback Form', 'Cancel');
    if (proceed === 'Open Feedback Form') {
        // Open feedback form in browser
        await vscode.env.openExternal(vscode.Uri.parse(feedbackUrl));
    }
}
/**
 * Show feedback prompt after successful operations
 *
 * Non-intrusive - only shows occasionally, not every time.
 */
async function maybePromptFeedback(context) {
    const FEEDBACK_PROMPT_KEY = 'sheplang.lastFeedbackPrompt';
    const FEEDBACK_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // 1 week
    const lastPrompt = context.globalState.get(FEEDBACK_PROMPT_KEY, 0);
    const now = Date.now();
    // Only prompt once per week
    if (now - lastPrompt < FEEDBACK_INTERVAL_MS) {
        return;
    }
    // Update last prompt time
    await context.globalState.update(FEEDBACK_PROMPT_KEY, now);
    // Show non-modal notification
    const action = await vscode.window.showInformationMessage('💬 How is your ShepLang experience? We\'d love your feedback!', 'Send Feedback', 'Later');
    if (action === 'Send Feedback') {
        await sendFeedback();
    }
}
//# sourceMappingURL=sendFeedback.js.map
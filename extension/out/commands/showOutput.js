"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showOutputCommand = showOutputCommand;
const outputChannel_1 = require("../services/outputChannel");
/**
 * Command to show the ShepLang output channel
 * Keyboard shortcut: Ctrl+Shift+L (Cmd+Shift+L on Mac)
 */
async function showOutputCommand() {
    outputChannel_1.outputChannel.show();
}
//# sourceMappingURL=showOutput.js.map
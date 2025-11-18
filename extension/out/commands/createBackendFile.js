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
exports.createBackendFileCommand = createBackendFileCommand;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const outputChannel_1 = require("../services/outputChannel");
const errorRecovery_1 = require("../services/errorRecovery");
/**
 * Command to create a .shepthon backend file
 * Automatically creates a matching backend file for the current .shep file
 */
async function createBackendFileCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        await errorRecovery_1.errorRecovery.handleError(new Error('No active editor found'), 'Create Backend File', [{ message: 'Open a .shep file first, then try again.' }]);
        return;
    }
    const shepFile = editor.document.uri.fsPath;
    const shepFileName = path.basename(shepFile, '.shep');
    const shepthonFile = path.join(path.dirname(shepFile), `${shepFileName}.shepthon`);
    // Check if .shepthon file already exists
    if (fs.existsSync(shepthonFile)) {
        const overwrite = await vscode.window.showWarningMessage(`Backend file ${shepFileName}.shepthon already exists. Overwrite?`, 'Overwrite', 'Cancel');
        if (overwrite !== 'Overwrite') {
            return;
        }
    }
    // Create template backend content
    const template = getBackendTemplate(shepFileName);
    try {
        fs.writeFileSync(shepthonFile, template, 'utf-8');
        outputChannel_1.outputChannel.success(`Created backend file: ${shepFileName}.shepthon`);
        // Open the new file
        const doc = await vscode.workspace.openTextDocument(shepthonFile);
        await vscode.window.showTextDocument(doc);
        errorRecovery_1.errorRecovery.showSuccess(`Backend file created: ${shepFileName}.shepthon`);
    }
    catch (error) {
        await errorRecovery_1.errorRecovery.handleError(error, 'Failed to create backend file');
    }
}
/**
 * Get template content for a new .shepthon file
 */
function getBackendTemplate(appName) {
    const capitalizedName = appName.charAt(0).toUpperCase() + appName.slice(1);
    return `app ${capitalizedName} {

  // Define your data model
  model Item {
    id: id
    name: text
    done: yes/no = no
  }

  // GET endpoint - List all items
  endpoint GET "/items" -> [Item] {
    return db.Item.findAll()
  }

  // POST endpoint - Create new item
  endpoint POST "/items" (name: text) -> Item {
    let item = db.Item.create({ name })
    return item
  }

  // PUT endpoint - Update item
  endpoint PUT "/items/:id" (name: text, done: yes/no) -> Item {
    let item = db.Item.update(:id, { name, done })
    return item
  }

  // DELETE endpoint - Delete item
  endpoint DELETE "/items/:id" {
    db.Item.delete(:id)
    return { success: true }
  }

  // Optional: Background job
  // job "cleanup" every 1 hour {
  //   let old = db.Item.find({ done: true })
  //   for item in old {
  //     db.Item.delete(item.id)
  //   }
  // }
}
`;
}
//# sourceMappingURL=createBackendFile.js.map
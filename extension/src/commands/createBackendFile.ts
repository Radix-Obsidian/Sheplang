import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { outputChannel } from '../services/outputChannel';
import { errorRecovery } from '../services/errorRecovery';

/**
 * Command to create a .shepthon backend file
 * Automatically creates a matching backend file for the current .shep file
 */
export async function createBackendFileCommand(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  
  if (!editor) {
    await errorRecovery.handleError(
      new Error('No active editor found'),
      'Create Backend File',
      [{ message: 'Open a .shep file first, then try again.' }]
    );
    return;
  }

  const shepFile = editor.document.uri.fsPath;
  const shepFileName = path.basename(shepFile, '.shep');
  const shepthonFile = path.join(path.dirname(shepFile), `${shepFileName}.shepthon`);

  // Check if .shepthon file already exists
  if (fs.existsSync(shepthonFile)) {
    const overwrite = await vscode.window.showWarningMessage(
      `Backend file ${shepFileName}.shepthon already exists. Overwrite?`,
      'Overwrite',
      'Cancel'
    );
    
    if (overwrite !== 'Overwrite') {
      return;
    }
  }

  // Create template backend content
  const template = getBackendTemplate(shepFileName);
  
  try {
    fs.writeFileSync(shepthonFile, template, 'utf-8');
    outputChannel.success(`Created backend file: ${shepFileName}.shepthon`);
    
    // Open the new file
    const doc = await vscode.workspace.openTextDocument(shepthonFile);
    await vscode.window.showTextDocument(doc);
    
    errorRecovery.showSuccess(`Backend file created: ${shepFileName}.shepthon`);
  } catch (error) {
    await errorRecovery.handleError(
      error,
      'Failed to create backend file'
    );
  }
}

/**
 * Get template content for a new .shepthon file
 */
function getBackendTemplate(appName: string): string {
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

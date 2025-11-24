const assert = require('assert');
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

suite('ShepLang Extension Battle Tests', function () {
  this.timeout(20000);

  test('Extension loads successfully', async function () {
    const extension = vscode.extensions.getExtension('GoldenSheepAI.sheplang-vscode');
    assert.ok(extension, 'Extension should be available');
    assert.ok(extension.isActive, 'Extension should be active');
  });

  test('Language is registered correctly', async function () {
    const languages = await vscode.languages.getLanguages();
    assert.ok(languages.includes('sheplang'), 'ShepLang language should be registered');
    assert.ok(languages.includes('shepthon'), 'ShepThon language should be registered');
  });

  test('Can open .shep file with syntax highlighting', async function () {
    const testFilePath = path.resolve(__dirname, '../../test-workspace/syntax-test.shep');
    const document = await vscode.workspace.openTextDocument(testFilePath);
    await vscode.window.showTextDocument(document);
    
    assert.strictEqual(document.languageId, 'sheplang', 'File should be recognized as ShepLang');
    
    // Test that syntax highlighting tokens are present
    const tokens = await vscode.commands.executeCommand('vscode.executeCodeLensProvider', document.uri);
    assert.ok(tokens !== undefined, 'Syntax highlighting should be active');
  });

  test('Real-time diagnostics work for invalid syntax', async function () {
    // Create invalid ShepLang code
    const invalidCode = 'app \ndata Message:\n  fields:\n    text: text\nview Dashboard:\n  text "Test"';
    const untitledDoc = await vscode.workspace.openTextDocument({ 
      content: invalidCode, 
      language: 'sheplang' 
    });
    
    await vscode.window.showTextDocument(untitledDoc);
    
    // Wait for diagnostics to appear
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const diagnostics = vscode.languages.getDiagnostics(untitledDoc.uri);
    const sheplangDiagnostics = diagnostics.filter(d => d.source === 'sheplang');
    
    assert.ok(sheplangDiagnostics.length > 0, 'Should show diagnostics for invalid syntax');
    console.log(`Found ${sheplangDiagnostics.length} diagnostic(s):`, 
      sheplangDiagnostics.map(d => ({ message: d.message, severity: d.severity })));
  });

  test('Code completion provides snippets', async function () {
    const testDoc = await vscode.workspace.openTextDocument({ 
      content: '', 
      language: 'sheplang' 
    });
    await vscode.window.showTextDocument(testDoc);
    
    // Test app snippet
    const appPosition = new vscode.Position(0, 0);
    const appCompletion = await vscode.commands.executeCommand(
      'vscode.executeCompletionItemProvider',
      testDoc.uri,
      appPosition
    );
    
    assert.ok(appCompletion.items.length > 0, 'Should provide completion items');
    
    const appSnippet = appCompletion.items.find(item => item.label === 'app');
    assert.ok(appSnippet, 'Should provide app snippet');
    console.log('App snippet found:', appSnippet.label);
  });

  test('Compilation command works', async function () {
    const testFilePath = path.resolve(__dirname, '../../test-workspace/syntax-test.shep');
    const document = await vscode.workspace.openTextDocument(testFilePath);
    await vscode.window.showTextDocument(document);
    
    // Execute compilation command
    const result = await vscode.commands.executeCommand('sheplang.compile');
    
    assert.ok(result !== undefined, 'Compilation command should execute');
    console.log('Compilation result:', result);
  });

  test('Language server provides hover information', async function () {
    const testDoc = await vscode.workspace.openTextDocument({ 
      content: 'app TestApp\n', 
      language: 'sheplang' 
    });
    await vscode.window.showTextDocument(testDoc);
    
    // Test hover over 'app' keyword
    const position = new vscode.Position(0, 1);
    const hoverInfo = await vscode.commands.executeCommand(
      'vscode.executeHoverProvider',
      testDoc.uri,
      position
    );
    
    assert.ok(hoverInfo.length > 0, 'Should provide hover information');
    const hoverContent = hoverInfo[0].contents.map(c => c.value).join('');
    console.log('Hover content for "app":', hoverContent);
  });

  test('Can create and save new .shep file', async function () {
    const newContent = `app NewTestApp

data TestModel:
  fields:
    name: text
    value: number

view TestView:
  text "Test view"
  button "Test Button" -> TestAction

action TestAction():
  add TestModel with name = "test", value = 42
  show TestView`;

    const newDoc = await vscode.workspace.openTextDocument({ 
      content: newContent, 
      language: 'sheplang' 
    });
    await vscode.window.showTextDocument(newDoc);
    
    // Save the document
    const savePath = path.resolve(__dirname, '../../test-workspace/new-test.shep');
    await newDoc.saveAs(savePath);
    
    // Verify file was saved
    assert.ok(fs.existsSync(savePath), 'File should be saved successfully');
    
    // Verify content is correct
    const savedContent = fs.readFileSync(savePath, 'utf8');
    assert.strictEqual(savedContent.trim(), newContent.trim(), 'Saved content should match');
    
    console.log('Successfully created and saved new .shep file');
  });

  test('Extension handles complex ShepLang code', async function () {
    const complexCode = `app ComplexApp

data User:
  fields:
    name: text
    email: text
    active: yes/no

data Task:
  fields:
    title: text
    status: text
    assignee: User

view Dashboard:
  text "Task Management Dashboard"
  button "Add User" -> AddUser
  button "Add Task" -> AddTask
  list User
  list Task

action AddUser():
  add User with name = "John Doe", email = "john@example.com", active = true
  show Dashboard

action AddTask():
  add Task with title = "New Task", status = "pending", assignee = User
  show Dashboard`;

    const complexDoc = await vscode.workspace.openTextDocument({ 
      content: complexCode, 
      language: 'sheplang' 
    });
    await vscode.window.showTextDocument(complexDoc);
    
    // Wait for parsing and diagnostics
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const diagnostics = vscode.languages.getDiagnostics(complexDoc.uri);
    const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
    
    assert.strictEqual(errors.length, 0, 'Complex valid code should not have errors');
    console.log('Complex code parsed successfully with', diagnostics.length, 'diagnostics');
  });
});

# Deep Wiki & Codemap Features Implementation Plan

**Date:** November 23, 2025  
**Status:** 📋 **PLANNING PHASE**  
**Inspired by:** Windsurf's Deep Wiki & Codemap functionality  
**Based on:** Official VS Code Extension API Documentation

---

## 🎯 **Executive Summary**

This plan outlines the implementation of two powerful ShepLang IDE features:
1. **Codemap** - Hierarchical symbol navigation (VS Code Outline integration)
2. **Deep Wiki** - Auto-generated documentation system (Custom webview)

Both features leverage VS Code's native APIs for seamless integration.

---

## 🗺️ **Phase 1: Codemap Implementation**

### **Feature Overview**
**Codemap** provides hierarchical navigation of ShepLang structure:
```
MyApp
├── data
│   ├── User
│   └── Task
├── views
│   ├── Dashboard
│   └── Settings
└── actions
    ├── CreateUser
    └── CompleteTask
```

### **Technical Implementation**

#### **1. DocumentSymbolProvider API**
**Based on:** VS Code Official Documentation - DocumentSymbolProvider

```typescript
// src/codemap/sheplangSymbolProvider.ts
import * as vscode from 'vscode';
import { parseShep } from '@goldensheepai/sheplang-language';

export class ShepLangSymbolProvider implements vscode.DocumentSymbolProvider {
    provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.DocumentSymbol[] {
        
        const symbols: vscode.DocumentSymbol[] = [];
        
        try {
            // Parse ShepLang document
            const ast = parseShep(document.getText());
            
            // Create root symbol for app
            const appSymbol = new vscode.DocumentSymbol(
                ast.appName,
                'ShepLang Application',
                vscode.SymbolKind.Module,
                new vscode.Range(0, 0, document.lineCount - 1, 0),
                new vscode.Range(0, 0, 0, 10)
            );
            
            // Add data models
            const dataContainer = new vscode.DocumentSymbol(
                'data',
                'Data Models',
                vscode.SymbolKind.Namespace,
                new vscode.Range(0, 0, document.lineCount - 1, 0),
                new vscode.Range(0, 0, 0, 0)
            );
            
            ast.dataModels.forEach(model => {
                const modelSymbol = new vscode.DocumentSymbol(
                    model.name,
                    `Data model with ${model.fields.length} fields`,
                    vscode.SymbolKind.Struct,
                    new vscode.Range(model.line, 0, model.endLine, 0),
                    new vscode.Range(model.line, 5, model.line, 5 + model.name.length)
                );
                
                // Add fields as children
                model.fields.forEach(field => {
                    const fieldSymbol = new vscode.DocumentSymbol(
                        field.name,
                        `${field.name}: ${field.type}`,
                        vscode.SymbolKind.Property,
                        new vscode.Range(field.line, 0, field.line, 0),
                        new vscode.Range(field.line, 4, field.line, 4 + field.name.length)
                    );
                    modelSymbol.children.push(fieldSymbol);
                });
                
                dataContainer.children.push(modelSymbol);
            });
            
            // Add views
            const viewContainer = new vscode.DocumentSymbol(
                'views',
                'UI Views',
                vscode.SymbolKind.Namespace,
                new vscode.Range(0, 0, document.lineCount - 1, 0),
                new vscode.Range(0, 0, 0, 0)
            );
            
            ast.views.forEach(view => {
                const viewSymbol = new vscode.DocumentSymbol(
                    view.name,
                    `UI view with ${view.elements.length} elements`,
                    vscode.SymbolKind.Class,
                    new vscode.Range(view.line, 0, view.endLine, 0),
                    new vscode.Range(view.line, 5, view.line, 5 + view.name.length)
                );
                
                viewContainer.children.push(viewSymbol);
            });
            
            // Add actions
            const actionContainer = new vscode.DocumentSymbol(
                'actions',
                'Actions',
                vscode.SymbolKind.Namespace,
                new vscode.Range(0, 0, document.lineCount - 1, 0),
                new vscode.Range(0, 0, 0, 0)
            );
            
            ast.actions.forEach(action => {
                const actionSymbol = new vscode.DocumentSymbol(
                    action.name,
                    `Action with ${action.params.length} parameters`,
                    vscode.SymbolKind.Function,
                    new vscode.Range(action.line, 0, action.endLine, 0),
                    new vscode.Range(action.line, 7, action.line, 7 + action.name.length)
                );
                
                actionContainer.children.push(actionSymbol);
            });
            
            // Assemble hierarchy
            appSymbol.children.push(dataContainer, viewContainer, actionContainer);
            symbols.push(appSymbol);
            
        } catch (error) {
            console.error('Error parsing ShepLang for symbols:', error);
        }
        
        return symbols;
    }
}
```

#### **2. Registration in Extension**
```typescript
// src/extension.ts
import { ShepLangSymbolProvider } from './codemap/sheplangSymbolProvider';

export function activate(context: vscode.ExtensionContext) {
    // Register symbol provider for Codemap
    const symbolProvider = new ShepLangSymbolProvider();
    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(
            { language: 'sheplang' },
            symbolProvider
        )
    );
}
```

### **User Experience**
- ✅ **VS Code Outline View**: Native integration (Ctrl+Shift+O)
- ✅ **Breadcrumbs**: Navigation at top of editor
- ✅ **Go to Symbol**: Quick navigation (Cmd+Shift+O)
- ✅ **Hierarchical Tree**: Collapsible sections for data/views/actions

---

## 📚 **Phase 2: Deep Wiki Implementation**

### **Feature Overview**
**Deep Wiki** generates comprehensive documentation from ShepLang code:
- **API Documentation**: Auto-generated docs for data models, views, actions
- **Interactive Examples**: Live preview of UI components
- **Code References**: Cross-references between elements
- **Export Options**: Markdown, HTML, PDF

### **Technical Implementation**

#### **1. Webview Panel Architecture**
```typescript
// src/deepwiki/deepWikiProvider.ts
import * as vscode from 'vscode';
import { parseShep } from '@goldensheepai/sheplang-language';

export class DeepWikiProvider {
    private panel: vscode.WebviewPanel | undefined;
    
    public show() {
        if (this.panel) {
            this.panel.reveal();
            return;
        }
        
        this.panel = vscode.window.createWebviewPanel(
            'sheplangDeepWiki',
            'ShepLang Deep Wiki',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );
        
        this.panel.webview.html = this.getHtml();
        
        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });
    }
    
    private getHtml(): string {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor || activeEditor.document.languageId !== 'sheplang') {
            return this.getEmptyState();
        }
        
        const document = activeEditor.document;
        const ast = parseShep(document.getText());
        
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ShepLang Deep Wiki</title>
            <style>
                body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; }
                .header { background: linear-gradient(135deg, #ff6600 0%, #ff8533 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
                .section { margin: 20px 0; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
                .section-header { background: #f5f5f5; padding: 15px; font-weight: bold; }
                .section-content { padding: 15px; }
                .model-item, .view-item, .action-item { margin: 10px 0; padding: 10px; border-left: 4px solid #ff6600; background: #f9f9f9; }
                .field-list { margin: 10px 0; }
                .field-item { margin: 5px 0; font-family: monospace; }
                .code-block { background: #f0f0f0; padding: 10px; border-radius: 4px; font-family: monospace; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📚 ${ast.appName} - Deep Wiki</h1>
                <p>Auto-generated documentation for your ShepLang application</p>
            </div>
            
            <div class="section">
                <div class="section-header">📊 Data Models (${ast.dataModels.length})</div>
                <div class="section-content">
                    ${ast.dataModels.map(model => `
                        <div class="model-item">
                            <h3>data ${model.name}</h3>
                            <div class="field-list">
                                <strong>Fields:</strong>
                                ${model.fields.map(field => `
                                    <div class="field-item">• ${field.name}: ${field.type}</div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">🎨 UI Views (${ast.views.length})</div>
                <div class="section-content">
                    ${ast.views.map(view => `
                        <div class="view-item">
                            <h3>view ${view.name}</h3>
                            <div class="code-block">
                                ${view.content}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="section">
                <div class="section-header">⚡ Actions (${ast.actions.length})</div>
                <div class="section-content">
                    ${ast.actions.map(action => `
                        <div class="action-item">
                            <h3>action ${action.name}(${action.params.join(', ')})</h3>
                            <div class="code-block">
                                ${action.content}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <script>
                // Add interactivity for expanding/collapsing sections
            </script>
        </body>
        </html>`;
    }
}
```

#### **2. Command Registration**
```typescript
// src/extension.ts
import { DeepWikiProvider } from './deepwiki/deepWikiProvider';

const deepWikiProvider = new DeepWikiProvider();

// Register commands
context.subscriptions.push(
    vscode.commands.registerCommand('sheplang.openDeepWiki', () => {
        deepWikiProvider.show();
    })
);
```

#### **3. Package.json Commands**
```json
"contributes": {
    "commands": [
        {
            "command": "sheplang.openDeepWiki",
            "title": "Open Deep Wiki",
            "category": "ShepLang"
        }
    ],
    "menus": {
        "editor/context": [
            {
                "command": "sheplang.openDeepWiki",
                "when": "resourceLangId == sheplang",
                "group": "navigation"
            }
        ]
    }
}
```

### **Advanced Features**

#### **1. Live Preview Integration**
```typescript
// Add live preview of views in Deep Wiki
private generateViewPreview(view: ShepLangView): string {
    return `
    <div class="preview-section">
        <h4>🔴 Live Preview</h4>
        <iframe src="data:text/html,${encodeURIComponent(generatePreviewHtml(view))}" 
                style="width: 100%; height: 200px; border: 1px solid #ddd; border-radius: 4px;">
        </iframe>
    </div>`;
}
```

#### **2. Export Functionality**
```typescript
// Export to Markdown
private exportToMarkdown(ast: ShepLangAST): string {
    let markdown = `# ${ast.appName}\n\n`;
    
    // Data models section
    markdown += `## Data Models\n\n`;
    ast.dataModels.forEach(model => {
        markdown += `### ${model.name}\n\n`;
        markdown += `| Field | Type |\n|------|------|\n`;
        model.fields.forEach(field => {
            markdown += `| ${field.name} | ${field.type} |\n`;
        });
        markdown += '\n';
    });
    
    return markdown;
}
```

---

## 🚀 **Phase 3: Implementation Timeline**

### **Week 1: Codemap Foundation**
- **Day 1-2**: Implement DocumentSymbolProvider
- **Day 3-4**: Test with various ShepLang files
- **Day 5**: Refine symbol hierarchy and icons

### **Week 2: Deep Wiki Core**
- **Day 1-2**: Create webview panel and basic HTML generation
- **Day 3-4**: Add documentation parsing and formatting
- **Day 5**: Test with complex ShepLang applications

### **Week 3: Advanced Features**
- **Day 1-2**: Add live preview integration
- **Day 3-4**: Implement export functionality
- **Day 5**: Polish UI and add interactivity

### **Week 4: Integration & Testing**
- **Day 1-2**: Integration testing with extension
- **Day 3-4**: Performance optimization
- **Day 5**: Documentation and release preparation

---

## 🎯 **Success Criteria**

### **Codemap**
- ✅ ShepLang structure appears in VS Code Outline view
- ✅ Hierarchical navigation works (app → data/views/actions → items)
- ✅ Breadcrumbs show current symbol context
- ✅ Go to Symbol command finds all ShepLang symbols

### **Deep Wiki**
- ✅ Opens documentation panel for current .shep file
- ✅ Generates comprehensive documentation for all elements
- ✅ Live preview shows UI components
- ✅ Export to Markdown/HTML works
- ✅ Responsive and professional UI design

---

## 📚 **Research References**

- **VS Code DocumentSymbolProvider API**: https://code.visualstudio.com/api/references/vscode-api
- **VS Code Webview Guide**: https://code.visualstudio.com/api/extension-guides/webview
- **Language Server Protocol**: https://microsoft.github.io/language-server-protocol/
- **VS Code UI Guidelines**: https://code.visualstudio.com/api/ux-guidelines/overview

---

## 🔄 **Integration with Existing Features**

### **Language Server Integration**
- Leverage existing ShepLang parser from `@goldensheepai/sheplang-language`
- Reuse AST generation from compilation pipeline
- Integrate with existing diagnostics system

### **Extension Architecture**
- Follow existing extension patterns (commands, providers)
- Use established styling and branding (YC orange theme)
- Integrate with existing compilation and preview features

---

**Next Steps:** Begin Phase 1 implementation with DocumentSymbolProvider for Codemap functionality.

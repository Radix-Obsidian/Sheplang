/**
 * Import Wizard Panel for Slice 6
 * 
 * VS Code WebView panel that displays analysis results
 * and allows users to rename/disable items before code generation.
 */

import * as vscode from 'vscode';
import {
  ImportAnalysis,
  DetectedItem,
  WizardChoices,
  WizardMessage,
  getConfidenceClass,
  formatConfidence
} from '../types/ImportWizard';

/**
 * Show the import wizard panel and wait for user choices
 */
export async function showImportWizardPanel(
  context: vscode.ExtensionContext,
  analysis: ImportAnalysis
): Promise<WizardChoices | undefined> {
  // Create webview panel
  const panel = vscode.window.createWebviewPanel(
    'importWizard',
    `📦 Import Analysis - ${analysis.projectName}`,
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  );

  // Set HTML content
  panel.webview.html = getWizardPanelHtml(analysis);

  // Handle messages from webview
  return new Promise<WizardChoices | undefined>((resolve) => {
    let resolved = false;

    panel.webview.onDidReceiveMessage((message: WizardMessage) => {
      if (resolved) return;

      switch (message.command) {
        case 'generate':
          resolved = true;
          resolve(message.choices);
          panel.dispose();
          break;

        case 'cancel':
          resolved = true;
          resolve(undefined);
          panel.dispose();
          break;
      }
    });

    panel.onDidDispose(() => {
      if (!resolved) {
        resolved = true;
        resolve(undefined);
      }
    });
  });
}

/**
 * Generate the wizard panel HTML
 */
function getWizardPanelHtml(analysis: ImportAnalysis): string {
  const summary = {
    entities: analysis.entities.length,
    views: analysis.views.length,
    actions: analysis.actions.length,
    routes: analysis.routes.length
  };
  const total = summary.entities + summary.views + summary.actions + summary.routes;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Import Analysis</title>
  <style>
    ${getWizardStyles()}
  </style>
</head>
<body>
  <div class="wizard-container">
    <!-- Header -->
    <div class="wizard-header">
      <div class="header-content">
        <h1>📦 ${escapeHtml(analysis.projectName)}</h1>
        <p class="subtitle">Review detected items before generating ShepLang code</p>
      </div>
      <div class="confidence-badge ${getConfidenceClass(analysis.confidence)}">
        Overall: ${formatConfidence(analysis.confidence)}
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="stats-row">
      <div class="stat-item">
        <span class="stat-icon">📊</span>
        <span class="stat-value">${summary.entities}</span>
        <span class="stat-label">Entities</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">🖼️</span>
        <span class="stat-value">${summary.views}</span>
        <span class="stat-label">Views</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">⚡</span>
        <span class="stat-value">${summary.actions}</span>
        <span class="stat-label">Actions</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">🔌</span>
        <span class="stat-value">${summary.routes}</span>
        <span class="stat-label">Routes</span>
      </div>
    </div>

    <!-- Warnings -->
    ${analysis.warnings.length > 0 ? `
    <div class="warnings-section">
      <h3>⚠️ Warnings</h3>
      <ul>
        ${analysis.warnings.map(w => `<li>${escapeHtml(w)}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    <!-- Content Sections -->
    <div class="sections-container">
      ${generateSection('Entities', '📊', 'entity', analysis.entities)}
      ${generateSection('Views', '🖼️', 'view', analysis.views)}
      ${generateSection('Actions', '⚡', 'action', analysis.actions)}
      ${generateSection('API Routes', '🔌', 'route', analysis.routes)}
    </div>

    <!-- Options -->
    <div class="options-section">
      <h3>Generation Options</h3>
      <label class="checkbox-option">
        <input type="checkbox" id="generateBackend" checked>
        <span>Generate ShepThon backend</span>
      </label>
    </div>

    <!-- Footer -->
    <div class="wizard-footer">
      <button class="btn btn-secondary" onclick="cancel()">Cancel</button>
      <button class="btn btn-primary" onclick="generate()">
        Generate ShepLang →
      </button>
    </div>
  </div>

  <script>
    ${getWizardScripts(analysis)}
  </script>
</body>
</html>`;
}

/**
 * Generate a section for a type of items
 */
function generateSection(
  title: string,
  icon: string,
  type: string,
  items: DetectedItem[]
): string {
  if (items.length === 0) {
    return `
      <div class="section collapsed" data-type="${type}">
        <div class="section-header">
          <span class="section-icon">${icon}</span>
          <h2>${title}</h2>
          <span class="section-count">(0)</span>
        </div>
        <div class="section-empty">No ${title.toLowerCase()} detected</div>
      </div>
    `;
  }

  return `
    <div class="section" data-type="${type}">
      <div class="section-header" onclick="toggleSection(this)">
        <span class="section-icon">${icon}</span>
        <h2>${title}</h2>
        <span class="section-count">(${items.length})</span>
        <span class="section-toggle">▼</span>
      </div>
      <div class="section-content">
        ${items.map(item => generateItemCard(item)).join('')}
      </div>
    </div>
  `;
}

/**
 * Generate a card for a single item
 */
function generateItemCard(item: DetectedItem): string {
  const confidenceClass = getConfidenceClass(item.confidence);
  const details = getItemDetailsHtml(item);

  return `
    <div class="item-card" data-id="${item.id}">
      <div class="item-header">
        <label class="item-checkbox">
          <input type="checkbox" ${item.enabled ? 'checked' : ''} 
                 onchange="toggleItem('${item.id}', this.checked)">
        </label>
        <div class="item-name-container">
          <input type="text" class="item-name-input" 
                 value="${escapeHtml(item.displayName)}"
                 data-original="${escapeHtml(item.originalName)}"
                 onchange="renameItem('${item.id}', this.value)">
          ${item.originalName !== item.displayName ? 
            `<span class="original-name">(was: ${escapeHtml(item.originalName)})</span>` : ''}
        </div>
        <span class="confidence-badge ${confidenceClass}">
          ${formatConfidence(item.confidence)}
        </span>
      </div>
      <div class="item-details">
        ${details}
        <div class="item-source">
          <span class="source-label">Source:</span>
          <span class="source-value">${escapeHtml(item.source)}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Generate details HTML based on item type
 */
function getItemDetailsHtml(item: DetectedItem): string {
  const details = item.details;

  switch (details.kind) {
    case 'entity':
      return `
        <div class="detail-row">
          <span class="detail-label">Fields:</span>
          <span class="detail-value">${details.fields.map(f => 
            `${f.name}: ${f.type}${f.required ? '' : '?'}`
          ).join(', ')}</span>
        </div>
        ${details.relations && details.relations.length > 0 ? `
        <div class="detail-row">
          <span class="detail-label">Relations:</span>
          <span class="detail-value">${details.relations.map(r => 
            `${r.name} → ${r.target}`
          ).join(', ')}</span>
        </div>
        ` : ''}
      `;

    case 'view':
      return `
        <div class="detail-row">
          <span class="detail-label">Type:</span>
          <span class="detail-value">${details.viewType}</span>
        </div>
        ${details.route ? `
        <div class="detail-row">
          <span class="detail-label">Route:</span>
          <span class="detail-value">${escapeHtml(details.route)}</span>
        </div>
        ` : ''}
        <div class="detail-row">
          <span class="detail-label">Widgets:</span>
          <span class="detail-value">${details.widgets.join(', ') || 'none'}</span>
        </div>
      `;

    case 'action':
      return `
        <div class="detail-row">
          <span class="detail-label">Trigger:</span>
          <span class="detail-value">${details.trigger}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Operations:</span>
          <span class="detail-value">${details.operations.join(', ')}</span>
        </div>
        ${details.apiEndpoint ? `
        <div class="detail-row">
          <span class="detail-label">API:</span>
          <span class="detail-value">${details.method} ${escapeHtml(details.apiEndpoint)}</span>
        </div>
        ` : ''}
      `;

    case 'route':
      return `
        <div class="detail-row">
          <span class="detail-label">Method:</span>
          <span class="detail-value method-badge method-${details.method.toLowerCase()}">${details.method}</span>
        </div>
        ${details.prismaOperation ? `
        <div class="detail-row">
          <span class="detail-label">Operation:</span>
          <span class="detail-value">${details.prismaModel}.${details.prismaOperation}()</span>
        </div>
        ` : ''}
        ${details.bodyFields.length > 0 ? `
        <div class="detail-row">
          <span class="detail-label">Body:</span>
          <span class="detail-value">${details.bodyFields.join(', ')}</span>
        </div>
        ` : ''}
      `;

    default:
      return '';
  }
}

/**
 * Get wizard panel styles
 */
function getWizardStyles(): string {
  return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: var(--vscode-font-family);
      background: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      padding: 0;
      line-height: 1.5;
    }

    .wizard-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      padding-bottom: 100px;
    }

    /* Header */
    .wizard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding: 20px;
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 8px;
    }

    .wizard-header h1 {
      font-size: 24px;
      margin-bottom: 4px;
    }

    .subtitle {
      color: var(--vscode-descriptionForeground);
      font-size: 14px;
    }

    /* Confidence badges */
    .confidence-badge {
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 13px;
      font-weight: 600;
    }

    .confidence-badge.high {
      background: rgba(0, 200, 0, 0.15);
      color: #00c800;
    }

    .confidence-badge.medium {
      background: rgba(255, 165, 0, 0.15);
      color: #ffa500;
    }

    .confidence-badge.low {
      background: rgba(150, 150, 150, 0.15);
      color: #999;
    }

    /* Stats row */
    .stats-row {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
    }

    .stat-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      border-radius: 8px;
    }

    .stat-icon { font-size: 24px; margin-bottom: 8px; }
    .stat-value { font-size: 28px; font-weight: 700; }
    .stat-label { font-size: 12px; color: var(--vscode-descriptionForeground); }

    /* Warnings */
    .warnings-section {
      background: rgba(255, 165, 0, 0.1);
      border: 1px solid rgba(255, 165, 0, 0.3);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
    }

    .warnings-section h3 { margin-bottom: 8px; font-size: 14px; }
    .warnings-section ul { margin-left: 20px; font-size: 13px; }

    /* Sections */
    .sections-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 20px;
    }

    .section {
      border: 1px solid var(--vscode-panel-border);
      border-radius: 8px;
      overflow: hidden;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: var(--vscode-editor-background);
      cursor: pointer;
      user-select: none;
    }

    .section-header:hover {
      background: var(--vscode-list-hoverBackground);
    }

    .section-icon { font-size: 20px; }
    .section-header h2 { font-size: 16px; flex: 1; }
    .section-count { color: var(--vscode-descriptionForeground); font-size: 14px; }
    .section-toggle { color: var(--vscode-descriptionForeground); transition: transform 0.2s; }

    .section.collapsed .section-toggle { transform: rotate(-90deg); }
    .section.collapsed .section-content { display: none; }

    .section-content {
      padding: 8px;
      background: var(--vscode-input-background);
    }

    .section-empty {
      padding: 16px;
      text-align: center;
      color: var(--vscode-descriptionForeground);
      font-style: italic;
    }

    /* Item cards */
    .item-card {
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-input-border);
      border-radius: 6px;
      margin-bottom: 8px;
      overflow: hidden;
    }

    .item-card:last-child { margin-bottom: 0; }

    .item-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
    }

    .item-checkbox input {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .item-name-container {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .item-name-input {
      background: transparent;
      border: 1px solid transparent;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 14px;
      font-weight: 600;
      color: var(--vscode-editor-foreground);
      width: auto;
      min-width: 150px;
    }

    .item-name-input:hover {
      border-color: var(--vscode-input-border);
    }

    .item-name-input:focus {
      outline: none;
      border-color: var(--vscode-focusBorder);
      background: var(--vscode-input-background);
    }

    .original-name {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      font-style: italic;
    }

    .item-details {
      padding: 8px 16px 12px 48px;
      border-top: 1px solid var(--vscode-input-border);
      background: var(--vscode-input-background);
    }

    .detail-row {
      display: flex;
      gap: 8px;
      margin-bottom: 4px;
      font-size: 13px;
    }

    .detail-label {
      color: var(--vscode-descriptionForeground);
      min-width: 80px;
    }

    .detail-value {
      color: var(--vscode-editor-foreground);
    }

    .item-source {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px dashed var(--vscode-input-border);
      font-size: 12px;
    }

    .source-label { color: var(--vscode-descriptionForeground); }
    .source-value { color: var(--vscode-textLink-foreground); }

    /* Method badges */
    .method-badge {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }

    .method-get { background: rgba(0, 150, 255, 0.2); color: #0096ff; }
    .method-post { background: rgba(0, 200, 0, 0.2); color: #00c800; }
    .method-put { background: rgba(255, 165, 0, 0.2); color: #ffa500; }
    .method-patch { background: rgba(255, 200, 0, 0.2); color: #ffc800; }
    .method-delete { background: rgba(255, 0, 0, 0.2); color: #ff4444; }

    /* Options */
    .options-section {
      padding: 16px;
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .options-section h3 {
      margin-bottom: 12px;
      font-size: 14px;
    }

    .checkbox-option {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .checkbox-option input {
      width: 16px;
      height: 16px;
    }

    /* Footer */
    .wizard-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      background: var(--vscode-editor-background);
      border-top: 2px solid var(--vscode-button-background);
    }

    .btn {
      padding: 10px 24px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    .btn-primary:hover {
      background: var(--vscode-button-hoverBackground);
    }

    .btn-secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }

    .btn-secondary:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }

    /* Disabled items */
    .item-card.disabled {
      opacity: 0.5;
    }

    .item-card.disabled .item-name-input {
      text-decoration: line-through;
    }
  `;
}

/**
 * Get wizard panel scripts
 */
function getWizardScripts(analysis: ImportAnalysis): string {
  return `
    const vscode = acquireVsCodeApi();
    
    // Track item states
    const itemStates = new Map();
    ${JSON.stringify(getAllItems(analysis))}.forEach(item => {
      itemStates.set(item.id, {
        enabled: item.enabled,
        displayName: item.displayName,
        originalName: item.originalName
      });
    });

    function toggleSection(header) {
      const section = header.parentElement;
      section.classList.toggle('collapsed');
    }

    function toggleItem(id, enabled) {
      const state = itemStates.get(id);
      if (state) {
        state.enabled = enabled;
        const card = document.querySelector('[data-id="' + id + '"]');
        if (card) {
          card.classList.toggle('disabled', !enabled);
        }
      }
    }

    function renameItem(id, newName) {
      const state = itemStates.get(id);
      if (state) {
        state.displayName = newName;
        // Update original name indicator if changed
        const card = document.querySelector('[data-id="' + id + '"]');
        if (card) {
          const originalSpan = card.querySelector('.original-name');
          if (newName !== state.originalName) {
            if (!originalSpan) {
              const container = card.querySelector('.item-name-container');
              const span = document.createElement('span');
              span.className = 'original-name';
              span.textContent = '(was: ' + state.originalName + ')';
              container.appendChild(span);
            }
          } else if (originalSpan) {
            originalSpan.remove();
          }
        }
      }
    }

    function generate() {
      const choices = {
        items: {},
        generateBackend: document.getElementById('generateBackend').checked
      };

      itemStates.forEach((state, id) => {
        choices.items[id] = {
          enabled: state.enabled,
          renamedTo: state.displayName !== state.originalName ? state.displayName : undefined
        };
      });

      vscode.postMessage({ command: 'generate', choices: choices });
    }

    function cancel() {
      vscode.postMessage({ command: 'cancel' });
    }
  `;
}

/**
 * Get all items from analysis for script initialization
 */
function getAllItems(analysis: ImportAnalysis): { id: string; enabled: boolean; displayName: string; originalName: string }[] {
  const allItems = [
    ...analysis.entities,
    ...analysis.views,
    ...analysis.actions,
    ...analysis.routes
  ];

  return allItems.map(item => ({
    id: item.id,
    enabled: item.enabled,
    displayName: item.displayName,
    originalName: item.originalName
  }));
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

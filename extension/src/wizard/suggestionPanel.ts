/**
 * Suggestion Panel for Project Wizard
 * 
 * Displays AI-generated suggestions to users during wizard flow
 */

import type { ProjectSuggestion } from '../ai/suggestionService';

/**
 * Generate HTML for suggestion panel
 */
export function generateSuggestionPanelHtml(suggestions: ProjectSuggestion[]): string {
  if (suggestions.length === 0) {
    return '';
  }
  
  return `
    <div class="suggestion-panel">
      <div class="suggestion-header">
        <span class="suggestion-icon">💡</span>
        <h3>AI Suggestions</h3>
        <p class="suggestion-subtitle">Based on your project type, we recommend:</p>
      </div>
      
      <div class="suggestion-list">
        ${suggestions.map((suggestion, index) => generateSuggestionCardHtml(suggestion, index)).join('')}
      </div>
    </div>
  `;
}

/**
 * Generate HTML for individual suggestion card
 */
function generateSuggestionCardHtml(suggestion: ProjectSuggestion, index: number): string {
  const iconMap = {
    entity: '📊',
    feature: '⚡',
    integration: '🔌',
    design: '🎨',
    flow: '🔄'
  };
  
  const confidencePercent = Math.round(suggestion.confidence * 100);
  const confidenceClass = suggestion.confidence >= 0.8 ? 'high' : suggestion.confidence >= 0.6 ? 'medium' : 'low';
  
  return `
    <div class="suggestion-card" data-suggestion-index="${index}">
      <div class="suggestion-card-header">
        <span class="suggestion-type-icon">${iconMap[suggestion.type] || '💡'}</span>
        <div class="suggestion-card-title-section">
          <h4 class="suggestion-card-title">${escapeHtml(suggestion.title)}</h4>
          <span class="suggestion-type-badge">${suggestion.type}</span>
        </div>
        <span class="suggestion-confidence ${confidenceClass}" title="AI Confidence: ${confidencePercent}%">
          ${confidencePercent}%
        </span>
      </div>
      
      <p class="suggestion-description">${escapeHtml(suggestion.description)}</p>
      
      ${suggestion.reasoning ? `
        <div class="suggestion-reasoning">
          <span class="reasoning-label">Why?</span>
          <span class="reasoning-text">${escapeHtml(suggestion.reasoning)}</span>
        </div>
      ` : ''}
      
      <div class="suggestion-actions">
        <button class="suggestion-btn suggestion-btn-apply" data-action="apply" data-index="${index}">
          ✓ Apply Suggestion
        </button>
        <button class="suggestion-btn suggestion-btn-dismiss" data-action="dismiss" data-index="${index}">
          Dismiss
        </button>
      </div>
    </div>
  `;
}

/**
 * Generate CSS for suggestion panel
 */
export function getSuggestionPanelStyles(): string {
  return `
    /* Suggestion Panel */
    .suggestion-panel {
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .suggestion-header {
      display: flex;
      flex-direction: column;
      margin-bottom: 20px;
    }
    
    .suggestion-icon {
      font-size: 32px;
      margin-bottom: 8px;
    }
    
    .suggestion-header h3 {
      margin: 0 0 4px 0;
      color: var(--vscode-foreground);
      font-size: 18px;
      font-weight: 600;
    }
    
    .suggestion-subtitle {
      margin: 0;
      color: var(--vscode-descriptionForeground);
      font-size: 14px;
    }
    
    /* Suggestion List */
    .suggestion-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    /* Suggestion Card */
    .suggestion-card {
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-input-border);
      border-radius: 6px;
      padding: 16px;
      transition: all 0.2s ease;
    }
    
    .suggestion-card:hover {
      border-color: var(--vscode-button-background);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .suggestion-card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .suggestion-type-icon {
      font-size: 24px;
      flex-shrink: 0;
    }
    
    .suggestion-card-title-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .suggestion-card-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--vscode-foreground);
    }
    
    .suggestion-type-badge {
      display: inline-block;
      padding: 2px 8px;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      width: fit-content;
    }
    
    .suggestion-confidence {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      flex-shrink: 0;
    }
    
    .suggestion-confidence.high {
      background: rgba(0, 200, 0, 0.15);
      color: #00c800;
    }
    
    .suggestion-confidence.medium {
      background: rgba(255, 165, 0, 0.15);
      color: #ffa500;
    }
    
    .suggestion-confidence.low {
      background: rgba(150, 150, 150, 0.15);
      color: #999;
    }
    
    .suggestion-description {
      margin: 0 0 12px 0;
      color: var(--vscode-foreground);
      font-size: 14px;
      line-height: 1.5;
    }
    
    .suggestion-reasoning {
      display: flex;
      gap: 8px;
      padding: 10px;
      background: var(--vscode-textBlockQuote-background);
      border-left: 3px solid var(--vscode-textBlockQuote-border);
      border-radius: 4px;
      margin-bottom: 12px;
    }
    
    .reasoning-label {
      font-weight: 600;
      color: var(--vscode-textPreformat-foreground);
      font-size: 13px;
      flex-shrink: 0;
    }
    
    .reasoning-text {
      color: var(--vscode-descriptionForeground);
      font-size: 13px;
      line-height: 1.4;
    }
    
    /* Suggestion Actions */
    .suggestion-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }
    
    .suggestion-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      flex: 1;
    }
    
    .suggestion-btn-apply {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }
    
    .suggestion-btn-apply:hover {
      background: var(--vscode-button-hoverBackground);
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .suggestion-btn-dismiss {
      background: transparent;
      color: var(--vscode-button-secondaryForeground);
      border: 1px solid var(--vscode-button-border);
    }
    
    .suggestion-btn-dismiss:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }
    
    .suggestion-card.applied {
      opacity: 0.6;
      pointer-events: none;
      border-color: var(--vscode-charts-green);
    }
    
    .suggestion-card.applied::after {
      content: "✓ Applied";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--vscode-charts-green);
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 14px;
    }
    
    .suggestion-card.dismissed {
      opacity: 0;
      height: 0;
      padding: 0;
      margin: 0;
      overflow: hidden;
      transition: all 0.3s ease;
    }
  `;
}

/**
 * Generate JavaScript for suggestion panel interactions
 */
export function getSuggestionPanelScripts(): string {
  return `
    // Handle suggestion actions
    document.addEventListener('click', function(e) {
      const target = e.target;
      
      if (target.classList.contains('suggestion-btn')) {
        e.preventDefault();
        const action = target.dataset.action;
        const index = parseInt(target.dataset.index);
        const card = target.closest('.suggestion-card');
        
        if (action === 'apply') {
          // Send apply message to extension
          vscode.postMessage({
            command: 'applySuggestion',
            index: index
          });
          
          // Visual feedback
          card.classList.add('applied');
          setTimeout(() => {
            card.style.display = 'none';
          }, 1500);
          
        } else if (action === 'dismiss') {
          // Visual feedback
          card.classList.add('dismissed');
          
          // Send dismiss message to extension
          vscode.postMessage({
            command: 'dismissSuggestion',
            index: index
          });
        }
      }
    });
  `;
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

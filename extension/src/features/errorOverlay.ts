/**
 * Error Overlay System
 * 
 * Battle-tested pattern from Vite error overlay
 * Shows beautiful, actionable errors in browser preview
 */

import * as vscode from 'vscode';

export interface ShepError {
  message: string;
  code: string;
  location?: {
    file: string;
    line: number;
    column: number;
  };
  suggestion?: string;
  fix?: {
    description: string;
    code: string;
  };
  learnMore?: string;
}

/**
 * Convert technical error to friendly error
 */
export function friendlyError(technicalError: any): ShepError {
  const errorMap: Record<string, ShepError> = {
    'parse_error': {
      message: 'Something looks off in your code',
      code: 'PARSE_ERROR',
      suggestion: 'Check your syntax - you might be missing a colon (:) or have unmatched quotes.',
      learnMore: 'https://sheplang.dev/docs/syntax'
    },
    'entity_not_found': {
      message: "I can't find that data type",
      code: 'ENTITY_NOT_FOUND',
      suggestion: 'Make sure you\'ve created this data type with the "data" keyword first.',
      fix: {
        description: 'Create the missing data type',
        code: 'data YourEntity:\n  fields:\n    name: text'
      }
    },
    'view_not_found': {
      message: "This screen doesn't exist yet",
      code: 'VIEW_NOT_FOUND',
      suggestion: 'Create the view before using it in an action.',
      fix: {
        description: 'Create a new view',
        code: 'view YourView:\n  list Entity\n  button "New" -> CreateAction'
      }
    },
    'action_missing_params': {
      message: 'This action needs more information',
      code: 'MISSING_PARAMS',
      suggestion: 'Actions that create or update data need to know what fields to use.',
      fix: {
        description: 'Add parameters to your action',
        code: 'action YourAction(name, email):\n  add Entity with name, email\n  show Dashboard'
      }
    },
    'backend_not_found': {
      message: 'No backend file connected',
      code: 'NO_BACKEND',
      suggestion: 'Create a .shepthon file with the same name as your .shep file to add backend functionality.',
      fix: {
        description: 'Generate backend file',
        code: '// Use Command Palette → "ShepLang: Create Backend File"'
      }
    },
    'invalid_field_type': {
      message: 'This field type isn\'t supported',
      code: 'INVALID_TYPE',
      suggestion: 'Use: text, number, yes/no, id, date, email, money, image, datetime, richtext, file, or ref[EntityName]',
      fix: {
        description: 'Supported field types',
        code: 'name: text\nage: number\nactive: yes/no\nbirthday: date\ncreated: datetime\nemail: email\nprice: money\nphoto: image\ncontent: richtext\nfile: file\nauthor: ref[User]'
      }
    }
  };

  // Try to match error pattern
  const errorKey = Object.keys(errorMap).find(key => 
    technicalError.message?.toLowerCase().includes(key.replace('_', ' '))
  );

  if (errorKey) {
    const friendlyErr = errorMap[errorKey];
    if (technicalError.location) {
      friendlyErr.location = technicalError.location;
    }
    return friendlyErr;
  }

  // Generic friendly error
  return {
    message: 'Something went wrong',
    code: 'GENERIC_ERROR',
    suggestion: 'Try checking your code for typos or missing keywords.',
    learnMore: 'https://sheplang.dev/docs/troubleshooting'
  };
}

/**
 * Get error overlay HTML (Vite-style)
 */
export function getErrorOverlayHTML(error: ShepError): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .error-container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 800px;
      width: 100%;
      overflow: hidden;
      animation: slideUp 0.4s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .error-header {
      background: linear-gradient(135deg, #f93943 0%, #ff6b6b 100%);
      color: white;
      padding: 32px;
      text-align: center;
    }

    .error-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .error-title {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .error-code {
      font-size: 14px;
      opacity: 0.9;
      font-family: 'Courier New', monospace;
    }

    .error-body {
      padding: 32px;
    }

    .error-message {
      font-size: 18px;
      color: #333;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .error-location {
      background: #f7fafc;
      border-left: 4px solid #667eea;
      padding: 16px;
      margin-bottom: 24px;
      border-radius: 4px;
    }

    .error-location-label {
      font-size: 12px;
      text-transform: uppercase;
      color: #718096;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .error-location-path {
      font-family: 'Courier New', monospace;
      font-size: 14px;
      color: #667eea;
      font-weight: 600;
    }

    .suggestion-box {
      background: #edf2f7;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
    }

    .suggestion-label {
      font-size: 14px;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .suggestion-text {
      font-size: 16px;
      color: #4a5568;
      line-height: 1.6;
    }

    .fix-box {
      background: #f0fdf4;
      border: 2px solid #10b981;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
    }

    .fix-label {
      font-size: 14px;
      font-weight: 600;
      color: #10b981;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .fix-description {
      font-size: 14px;
      color: #065f46;
      margin-bottom: 12px;
    }

    .fix-code {
      background: white;
      border: 1px solid #10b981;
      border-radius: 4px;
      padding: 16px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      color: #065f46;
      white-space: pre-wrap;
      line-height: 1.6;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5a67d8;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: #e2e8f0;
      color: #4a5568;
    }

    .btn-secondary:hover {
      background: #cbd5e0;
    }

    .learn-more {
      text-align: center;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
    }

    .learn-more a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }

    .learn-more a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="error-container">
    <div class="error-header">
      <div class="error-icon">⚠️</div>
      <div class="error-title">${error.message}</div>
      <div class="error-code">ERROR CODE: ${error.code}</div>
    </div>

    <div class="error-body">
      ${error.location ? `
        <div class="error-location">
          <div class="error-location-label">📍 Location</div>
          <div class="error-location-path">
            ${error.location.file}:${error.location.line}:${error.location.column}
          </div>
        </div>
      ` : ''}

      ${error.suggestion ? `
        <div class="suggestion-box">
          <div class="suggestion-label">
            💡 Suggestion
          </div>
          <div class="suggestion-text">${error.suggestion}</div>
        </div>
      ` : ''}

      ${error.fix ? `
        <div class="fix-box">
          <div class="fix-label">
            ✨ Quick Fix
          </div>
          <div class="fix-description">${error.fix.description}</div>
          <div class="fix-code">${error.fix.code}</div>
        </div>
      ` : ''}

      <div class="action-buttons">
        <button class="btn btn-primary" onclick="fixInEditor()">
          Open in Editor
        </button>
        <button class="btn btn-secondary" onclick="dismissError()">
          Dismiss
        </button>
      </div>

      ${error.learnMore ? `
        <div class="learn-more">
          <a href="${error.learnMore}" target="_blank">
            📚 Learn more about this error →
          </a>
        </div>
      ` : ''}
    </div>
  </div>

  <script>
    function fixInEditor() {
      // Send message to VS Code extension
      if (window.opener) {
        window.opener.postMessage({
          type: 'open-in-editor',
          location: ${JSON.stringify(error.location)}
        }, '*');
      }
    }

    function dismissError() {
      window.close();
    }
  </script>
</body>
</html>
`;
}

/**
 * Get error overlay script to inject into preview
 */
export function getErrorOverlayScript(): string {
  return `
<script>
(function() {
  // Listen for errors from WebSocket
  if (window.socket) {
    window.socket.on('shep-error', (data) => {
      showErrorOverlay(data.error);
    });
  }

  // Catch runtime errors
  window.addEventListener('error', (event) => {
    const error = {
      message: 'Something went wrong while running your app',
      code: 'RUNTIME_ERROR',
      suggestion: 'Check the browser console for more details.',
      location: {
        file: 'browser',
        line: event.lineno,
        column: event.colno
      }
    };
    showErrorOverlay(error);
  });

  function showErrorOverlay(error) {
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.id = 'shep-error-overlay';
    overlay.innerHTML = \`
      <div class="shep-error-backdrop">
        <div class="shep-error-panel">
          <div class="shep-error-header">
            <span class="shep-error-icon">⚠️</span>
            <h1 class="shep-error-title">\${error.message}</h1>
            <button class="shep-error-close" onclick="document.getElementById('shep-error-overlay').remove()">✕</button>
          </div>
          <div class="shep-error-body">
            <div class="shep-error-code">ERROR: \${error.code}</div>
            \${error.suggestion ? \`
              <div class="shep-error-suggestion">
                <strong>💡 Suggestion:</strong> \${error.suggestion}
              </div>
            \` : ''}
            \${error.fix ? \`
              <div class="shep-error-fix">
                <strong>✨ Quick Fix:</strong> \${error.fix.description}
                <pre>\${error.fix.code}</pre>
              </div>
            \` : ''}
          </div>
        </div>
      </div>
    \`;

    // Add styles
    const style = document.createElement('style');
    style.textContent = \`
      .shep-error-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.85);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .shep-error-panel {
        background: white;
        border-radius: 12px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow: auto;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        animation: slideUp 0.3s ease-out;
      }

      @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }

      .shep-error-header {
        background: linear-gradient(135deg, #f93943, #ff6b6b);
        color: white;
        padding: 24px;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .shep-error-icon {
        font-size: 32px;
      }

      .shep-error-title {
        flex: 1;
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }

      .shep-error-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        transition: background 0.2s;
      }

      .shep-error-close:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .shep-error-body {
        padding: 24px;
      }

      .shep-error-code {
        font-family: 'Courier New', monospace;
        font-size: 12px;
        color: #666;
        margin-bottom: 16px;
      }

      .shep-error-suggestion {
        background: #edf2f7;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 16px;
        font-size: 14px;
        line-height: 1.6;
      }

      .shep-error-fix {
        background: #f0fdf4;
        border: 2px solid #10b981;
        padding: 16px;
        border-radius: 8px;
        font-size: 14px;
      }

      .shep-error-fix pre {
        background: white;
        padding: 12px;
        border-radius: 4px;
        margin-top: 8px;
        overflow-x: auto;
        font-size: 13px;
      }
    \`;
    overlay.appendChild(style);

    // Remove existing overlay if present
    const existing = document.getElementById('shep-error-overlay');
    if (existing) existing.remove();

    // Add to page
    document.body.appendChild(overlay);
  }
})();
</script>
`;
}

import React, { useState } from 'react';
import './Header.css';

interface HeaderProps {
  onThemeToggle: () => void;
  errorCount: number;
  warningCount: number;
  parseTime: number;
}

const Header: React.FC<HeaderProps> = ({ onThemeToggle, errorCount, warningCount, parseTime }) => {
  const [showUpsell, setShowUpsell] = useState(false);
  
  return (
    <header className="header">
      <div className="header-left">
        <img src="/sheplang-icon.png" alt="ShepLang Logo" className="header-logo" />
        <h1 className="header-title">
          <span className="logo-lite">ShepLang Lite</span>
          <span className="tagline">The Frontend Powerhouse</span>
        </h1>
      </div>
      <div className="header-middle">
        {showUpsell && (
          <div className="extension-upsell">
            <div className="upsell-content">
              <h4>Ready for more power?</h4>
              <p>Try our VS Code extension for:</p>
              <ul>
                <li>🎨 <strong>Syntax Highlighting</strong> - Beautiful code with TextMate grammar</li>
                <li>📝 <strong>Intelligent Snippets</strong> - Instant code templates</li>
                <li>🔍 <strong>Real-Time Diagnostics</strong> - Instant error detection</li>
                <li>🚀 <strong>One-Click Compilation</strong> - ShepLang to TypeScript</li>
                <li>🛠️ <strong>Full Tooling</strong> - Autocomplete, Go to Definition, Hover info</li>
                <li>⚡ <strong>Backend APIs</strong> - Full-stack generation</li>
                <li>💾 <strong>Database Integration</strong> - Complete data layer</li>
              </ul>
              <div className="upsell-actions">
                <a 
                  href="https://marketplace.visualstudio.com/items?itemName=GoldenSheepAI.sheplang-vscode" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="button-primary"
                >
                  Get VS Code Extension
                </a>
                <button 
                  onClick={() => setShowUpsell(false)} 
                  className="button-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="header-right">
        <div className="diagnostics">
          {errorCount > 0 && (
            <span className="errors">
              {errorCount} {errorCount === 1 ? 'error' : 'errors'}
            </span>
          )}
          {warningCount > 0 && (
            <span className="warnings">
              {warningCount} {warningCount === 1 ? 'warning' : 'warnings'}
            </span>
          )}
          {parseTime > 0 && (
            <span className="parse-time">
              {parseTime.toFixed(2)}ms
            </span>
          )}
        </div>
        <button 
          className="vs-code-btn" 
          onClick={() => setShowUpsell(!showUpsell)}
          title="Try VS Code Extension"
        >
          Try VS Code
        </button>
        <button 
          className="theme-toggle-btn" 
          onClick={onThemeToggle}
          title="Toggle Theme"
        >
          Theme
        </button>
        <a 
          href="https://github.com/Radix-Obsidian/Sheplang" 
          target="_blank" 
          rel="noopener noreferrer"
          className="header-link"
        >
          GitHub
        </a>
      </div>
    </header>
  );
};

export default Header;

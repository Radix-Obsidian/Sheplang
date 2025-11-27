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
          <span className="logo-lite">ShepLang Playground</span>
          <span className="tagline">Write & Verify in Real-Time</span>
        </h1>
      </div>
      <div className="header-middle">
        {showUpsell && (
          <div className="extension-upsell">
            <div className="upsell-content">
              <h4>🛡️ ShepVerify for 11 Languages</h4>
              <p>Our VS Code extension verifies more than just ShepLang:</p>
              <ul>
                <li>🔷 <strong>TypeScript & JavaScript</strong> - Type safety, null checks</li>
                <li>⚛️ <strong>React (TSX/JSX)</strong> - Hook rules, prop types</li>
                <li>🐍 <strong>Python</strong> - Type hints, PEP8, None safety</li>
                <li>🌐 <strong>HTML</strong> - Accessibility, SEO</li>
                <li>🎨 <strong>CSS/SCSS/LESS</strong> - Best practices</li>
                <li>📦 <strong>JSON</strong> - Schema validation</li>
                <li>🐑 <strong>ShepLang</strong> - Full verification</li>
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

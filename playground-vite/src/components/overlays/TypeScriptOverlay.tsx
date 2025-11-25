import React from 'react';
import { X, Info, Shield, Zap, BookOpen } from 'lucide-react';
import './Overlay.css';

interface TypeScriptOverlayProps {
  isVisible: boolean;
  onClose: (permanent?: boolean) => void;
}

const TypeScriptOverlay: React.FC<TypeScriptOverlayProps> = ({ isVisible, onClose }) => {
  const handleDismiss = (permanent: boolean = false) => {
    onClose(permanent);
  };

  if (!isVisible) return null;

  return (
    <div className="overlay-backdrop" onClick={(e) => e.target === e.currentTarget && handleDismiss()}>
      <div className="overlay-content">
        {/* Header */}
        <div className="overlay-header">
          <div className="overlay-title">
            <Info className="title-icon" />
            <div>
              <h2>Why TypeScript in a ShepLang Playground?</h2>
              <p>ShepLang generates TypeScript - it's the type-safe foundation for your applications</p>
            </div>
          </div>
          <button 
            className="close-button" 
            onClick={() => handleDismiss(false)}
            aria-label="Close overlay"
          >
            <X size={20} />
          </button>
        </div>

        {/* Code Comparison */}
        <div className="comparison-section">
          <h3>Type Safety: Automatic vs Manual</h3>
          <div className="code-comparison">
            <div className="code-column sheplang-column">
              <div className="column-header">
                <h4>🎨 ShepLang</h4>
                <span className="line-count">6 lines</span>
              </div>
              <div className="code-block">
                <pre><code>{`data User {
  fields: {
    name: text
    email: email
    age: number
  }
}`}</code></pre>
              </div>
              <div className="column-footer">
                <span className="readability">✅ Types inferred automatically</span>
              </div>
            </div>

            <div className="vs-divider">VS</div>

            <div className="code-column typescript-column">
              <div className="column-header">
                <h4>📘 TypeScript</h4>
                <span className="line-count">20+ lines</span>
              </div>
              <div className="code-block">
                <pre><code>{`interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
}

type CreateUserRequest = Omit<User, 'id' | 'createdAt'>;
type UpdateUserRequest = Partial<CreateUserRequest>;

function validateUser(user: Partial<User>): User | null {
  if (!user.name || user.name.trim().length === 0) {
    return null;
  }
  if (!user.email || !isValidEmail(user.email)) {
    return null;
  }
  // 15+ lines of validation logic
}`}</code></pre>
              </div>
              <div className="column-footer">
                <span className="readability">🤓 Manual type definitions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Advantages */}
        <div className="advantages-section">
          <h3>ShepLang Type Safety Advantages</h3>
          <div className="advantages-grid">
            <div className="advantage-item winner">
              <Shield className="advantage-icon" />
              <div className="advantage-content">
                <h4>Automatic Type Inference</h4>
                <p>No manual type annotations required</p>
              </div>
            </div>
            <div className="advantage-item winner">
              <Shield className="advantage-icon" />
              <div className="advantage-content">
                <h4>Built-in Validation</h4>
                <p>Email, required fields, constraints included</p>
              </div>
            </div>
            <div className="advantage-item winner">
              <Shield className="advantage-icon" />
              <div className="advantage-content">
                <h4>Compile-time Safety</h4>
                <p>Catch errors before deployment</p>
              </div>
            </div>
          </div>
        </div>

        {/* The Foundation Analogy */}
        <div className="analogy-section">
          <div className="analogy-content">
            <h3>🏗️ Blueprint vs Building Code</h3>
            <p>
              <strong>ShepLang</strong> is your architectural blueprint - define data structures naturally.<br/>
              <strong>TypeScript</strong> is the building code - detailed type definitions for the compiler.
            </p>
            <p>ShepLang generates perfect TypeScript, so you get the safety without the complexity.</p>
          </div>
        </div>

        {/* Error Prevention Comparison */}
        <div className="error-prevention-section">
          <h3>🛡️ Error Prevention: ShepLang vs TypeScript</h3>
          <div className="error-comparison">
            <div className="error-column">
              <h4>Common TypeScript Errors</h4>
              <ul className="error-list">
                <li>❌ Type 'string' is not assignable to type 'number'</li>
                <li>❌ Property 'email' does not exist on type 'User'</li>
                <li>❌ Argument of type 'undefined' is not assignable</li>
                <li>❌ Cannot read property 'name' of undefined</li>
              </ul>
        </div>
            <div className="error-column">
              <h4>ShepLang Prevention</h4>
              <ul className="prevention-list">
                <li>✅ Email fields validated automatically</li>
                <li>✅ Required fields enforced at compile time</li>
                <li>✅ Type mismatches caught before runtime</li>
                <li>✅ Null safety built into the language</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="overlay-actions">
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="dont-show-typescript" 
              onChange={(e) => handleDismiss(e.target.checked)}
            />
            <label htmlFor="dont-show-typescript">Don't show this again</label>
          </div>
          <div className="action-buttons">
            <button 
              className="secondary-button" 
              onClick={() => handleDismiss(false)}
            >
              Got it
            </button>
            <button 
              className="primary-button"
              onClick={() => {
                // Open resources tab or link to documentation
                window.open('/resources/04-react-typescript-overlay.md', '_blank');
              }}
            >
              <BookOpen size={16} />
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypeScriptOverlay;

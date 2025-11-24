import React from 'react';
import './CongratulationsModal.css';

interface CongratulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CongratulationsModal: React.FC<CongratulationsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="congratulations-overlay">
      <div className="congratulations-modal">
        <div className="congratulations-icon">🚀</div>
        <h2>Impressive!</h2>
        <p>You just built a complete <strong>YC application</strong> in ShepLang!</p>
        <div className="congratulations-features">
          <div className="feature-item">
            <span className="feature-icon">📋</span>
            <span>Company, Product, Traction, Team</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <span>Real-time preview updates</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <span>Production-ready syntax</span>
          </div>
        </div>
        <p className="congratulations-next">
          Ready to build real applications? Get the <strong>VS Code extension</strong> for full-stack development!
        </p>
        <div className="congratulations-actions">
          <button onClick={onClose} className="button-primary">
            Keep Coding
          </button>
          <a 
            href="https://marketplace.visualstudio.com/items?itemName=GoldenSheepAI.sheplang-vscode"
            target="_blank"
            rel="noopener noreferrer"
            className="button-secondary"
          >
            Get VS Code Extension
          </a>
        </div>
      </div>
    </div>
  );
};

export default CongratulationsModal;

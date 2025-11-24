import React, { useState, useEffect, useRef } from 'react';
import { generatePreview } from '@/services/sheplangPreview';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/github-dark.css';
import './PreviewPanel.css';

// Register languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);

interface PreviewPanelProps {
  code: string;
  theme: 'light' | 'dark';
  onInteraction?: () => void;
}

enum PreviewTab {
  Preview = 'preview',
  ReactCode = 'reactCode',
  TypeScript = 'typescript'
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ code, onInteraction }) => {
  const [html, setHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PreviewTab>(PreviewTab.Preview);
  const [showShareOptions, setShowShareOptions] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
    
    // Debounce preview generation to avoid constant re-renders
    previewTimeoutRef.current = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);
        const previewHtml = await generatePreview(code);
        setHtml(previewHtml);
      } catch (error: unknown) {
        console.error('Preview generation error:', error);
        setError(
          error instanceof Error 
            ? error.message 
            : 'Failed to generate preview'
        );
      } finally {
        setIsLoading(false);
      }
    }, 150);
    
    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, [code]);

  // Listen for messages from iframe (user interactions)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'sheplang-interaction') {
        // User interacted with the preview!
        onInteraction?.();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onInteraction]);

  const handleCopyShareLink = () => {
    try {
      // Create a shareable link with compressed code
      const compressedCode = encodeURIComponent(btoa(code));
      const shareUrl = `${window.location.origin}?code=${compressedCode}`;
      navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
      setShowShareOptions(false);
    } catch (error) {
      console.error('Failed to create share link:', error);
      alert('Failed to create share link');
    }
  };

  // Sample generated code for the tabs
  const getGeneratedReactCode = () => {
    return `// Generated React Component
import React, { useState } from 'react';

interface MessageData {
  id: number;
  text: string;
}

export const Dashboard: React.FC = () => {
  const [messages, setMessages] = useState<MessageData[]>([]);
  
  const handleShowMessage = () => {
    const newMessage = { id: Date.now(), text: "Hello, World!" };
    setMessages([...messages, newMessage]);
  };
  
  return (
    <div className="dashboard">
      <h1>Hello, ShepLang!</h1>
      <button onClick={handleShowMessage}>Click Me</button>
      
      {messages.length > 0 && (
        <div className="messages">
          {messages.map(msg => (
            <div key={msg.id} className="message">
              {msg.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};`;
  };
  
  const getGeneratedTypeScript = () => {
    return `// Generated TypeScript Models
interface Message {
  id: number;
  text: string;
}

// Message Repository
export class MessageRepository {
  private messages: Message[] = [];
  
  addMessage(text: string): Message {
    const newMessage = { 
      id: Date.now(), 
      text 
    };
    this.messages.push(newMessage);
    return newMessage;
  }
  
  getMessages(): Message[] {
    return [...this.messages];
  }
}

// Action Handlers
export function showMessage(repository: MessageRepository): void {
  repository.addMessage("Hello, World!");
}`;
  };

  return (
    <div className="preview-panel">
      <div className="preview-header">
        <div className="preview-tabs">
          <button 
            className={`tab-button ${activeTab === PreviewTab.Preview ? 'active' : ''}`}
            onClick={() => setActiveTab(PreviewTab.Preview)}
          >
            Preview
          </button>
          <button 
            className={`tab-button ${activeTab === PreviewTab.ReactCode ? 'active' : ''}`}
            onClick={() => setActiveTab(PreviewTab.ReactCode)}
          >
            React
          </button>
          <button 
            className={`tab-button ${activeTab === PreviewTab.TypeScript ? 'active' : ''}`}
            onClick={() => setActiveTab(PreviewTab.TypeScript)}
          >
            TypeScript
          </button>
        </div>
        <div className="preview-actions">
          <button 
            className="share-button"
            onClick={() => setShowShareOptions(!showShareOptions)}
            title="Share"
          >
            Share
          </button>
          {showShareOptions && (
            <div className="share-dropdown">
              <button onClick={handleCopyShareLink}>Copy share link</button>
            </div>
          )}
        </div>
      </div>
      
      <div className="preview-content">
        {isLoading && (
          <div className="preview-loading">
            Generating preview...
          </div>
        )}
        
        {error && (
          <div className="preview-error">
            <h3>Error</h3>
            <pre>{error}</pre>
          </div>
        )}
        
        {!isLoading && !error && activeTab === PreviewTab.Preview && (
          <iframe 
            ref={iframeRef}
            title="ShepLang Preview"
            className="preview-iframe"
            sandbox="allow-scripts"
            srcDoc={html}
          />
        )}

        {activeTab === PreviewTab.ReactCode && (
          <div className="code-preview">
            <pre className="code-content hljs">
              <code dangerouslySetInnerHTML={{ 
                __html: hljs.highlight(getGeneratedReactCode(), { language: 'javascript' }).value 
              }} />
            </pre>
          </div>
        )}

        {activeTab === PreviewTab.TypeScript && (
          <div className="code-preview">
            <pre className="code-content hljs">
              <code dangerouslySetInnerHTML={{ 
                __html: hljs.highlight(getGeneratedTypeScript(), { language: 'typescript' }).value 
              }} />
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;

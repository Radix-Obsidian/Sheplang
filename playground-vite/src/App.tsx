import { useState, useEffect, useRef } from 'react';
import './App.css';
import Header from '@/components/Header/Header';
import CodeEditor from '@/components/CodeEditor/CodeEditor';
import ShepVerifyPanel from '@/components/ShepVerify/ShepVerifyPanel';
import type { ShepLangDiagnostic } from '@/types';
import SplitPane from '@/components/Layout/SplitPane';

// Default ShepLang code for first load
const DEFAULT_CODE = `app TaskFlowYC

data ApplicationSection:
  fields:
    category: text
    content: text

view YCApplication:
  text "TaskFlow - AI-Powered Project Management"
  text "Helping remote teams ship 10x faster with intelligent task automation"
  button "Add Company Info" -> AddCompanySection
  button "Add Product Details" -> AddProductSection
  button "Add Traction Metrics" -> AddTractionSection
  button "Add Team Background" -> AddTeamSection
  list ApplicationSection

action AddCompanySection():
  add ApplicationSection with category = "Company", content = "TaskFlow is AI-powered project management for remote teams. We automate task assignment and progress tracking so teams can focus on building great products instead of managing spreadsheets."
  show YCApplication

action AddProductSection():
  add ApplicationSection with category = "Product", content = "Our AI analyzes team performance and automatically assigns tasks to the right person. We integrate with Slack, GitHub, and Figma. Live demo: taskflow.io/demo - 50 beta users love it."
  show YCApplication

action AddTractionSection():
  add ApplicationSection with category = "Traction", content = "2 months ago: 0 users. Today: 50 beta users from 8 companies. $5,000 MRR from 4 paying customers. 300% month-over-month growth. Waitlist: 200+ teams."
  show YCApplication

action AddTeamSection():
  add ApplicationSection with category = "Team", content = "Sarah Chen: ex-Google Senior PM, led Google Docs collaboration features. Built tools used by 10M+ users. Mike Rodriguez: ex-Staff Engineer at Stripe, led infrastructure team. Previously founding engineer at startup acquired by Salesforce."
  show YCApplication`;

function App() {
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [diagnostics, setDiagnostics] = useState<ShepLangDiagnostic[]>([]);
  const [parseTime, setParseTime] = useState<number>(0);
  
  // Editor ref for error navigation
  const editorRef = useRef<any>(null);
  
  // Load code from URL param, localStorage, or use default
  useEffect(() => {
    // Check for code in URL parameters (for sharing)
    const urlParams = new URLSearchParams(window.location.search);
    const sharedCode = urlParams.get('code');
    
    if (sharedCode) {
      try {
        // Decode shared code from URL
        const decodedCode = atob(decodeURIComponent(sharedCode));
        setCode(decodedCode);
        // Also save to localStorage
        localStorage.setItem('sheplang-code', decodedCode);
      } catch (error) {
        console.error('Failed to parse shared code:', error);
        // Fall back to localStorage or default
        const savedCode = localStorage.getItem('sheplang-code');
        if (savedCode) {
          setCode(savedCode);
        }
      }
    } else {
      // No URL param, try localStorage
      const savedCode = localStorage.getItem('sheplang-code');
      if (savedCode) {
        setCode(savedCode);
      }
    }
    
    // Track page view for analytics
    try {
      // Analytics tracking disabled for production
      // trackEvent('page_view', { page: 'playground' });
    } catch (error) {
      // Silently fail if analytics not available
    }
  }, []);
  
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    localStorage.setItem('sheplang-playground-code', newCode);
  };
  
  const handleAnalysisComplete = (results: { diagnostics: ShepLangDiagnostic[], parseTime: number }) => {
    setDiagnostics(results.diagnostics || []);
    setParseTime(results.parseTime || 0);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Handle error click - navigate to line in editor
  const handleErrorClick = (line: number, column: number) => {
    // This will be handled by the CodeEditor component
    // For now, we can scroll/highlight using Monaco's API if available
    if (editorRef.current) {
      editorRef.current.revealLineInCenter(line);
      editorRef.current.setPosition({ lineNumber: line, column });
      editorRef.current.focus();
    }
  };

  return (
    <div className={`app ${theme}`}>
      <Header 
        onThemeToggle={toggleTheme}
        errorCount={diagnostics.filter(d => d.severity === 'error').length}
        warningCount={diagnostics.filter(d => d.severity === 'warning').length}
        parseTime={parseTime}
      />
      <SplitPane
        left={
          <CodeEditor 
            value={code}
            theme={theme}
            onChange={handleCodeChange}
            onAnalysisComplete={handleAnalysisComplete}
            editorRef={editorRef}
          />
        }
        right={
          <ShepVerifyPanel 
            code={code}
            diagnostics={diagnostics}
            parseTime={parseTime}
            theme={theme}
            onErrorClick={handleErrorClick}
          />
        }
      />
    </div>
  );
}

export default App

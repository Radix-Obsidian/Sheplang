import { useState, useEffect, useRef } from 'react';
import './App.css';
import Header from '@/components/Header/Header';
import CodeEditor from '@/components/CodeEditor/CodeEditor';
import ShepVerifyPanel from '@/components/ShepVerify/ShepVerifyPanel';
import type { ShepLangDiagnostic } from '@/types';
import SplitPane from '@/components/Layout/SplitPane';

// Demo code samples for each language
const DEMO_CODE_SAMPLES: Record<string, string> = {
  sheplang: `app TaskFlowYC

data ApplicationSection:
  fields:
    category: text
    content: text

view YCApplication:
  text "TaskFlow - AI-Powered Project Management"
  text "Helping remote teams ship 10x faster"
  button "Add Company Info" -> AddCompanySection
  button "Add Product Details" -> AddProductSection
  list ApplicationSection

action AddCompanySection():
  add ApplicationSection with category = "Company", content = "TaskFlow automates task assignment."
  show YCApplication`,
  
  typescript: `// Sample TypeScript code with issues ShepVerify would catch
import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

function fetchUser(id: number): Promise<User> {
  return fetch(\`/api/users/\${id}\`)
    .then(res => res.json() as any);  // ⚠️ ShepVerify: Avoid 'any'
}

const UserProfile = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    fetchUser(parseInt(userId)).then(setUser);
  }, []);  // ⚠️ ShepVerify: Missing dependency 'userId'
  
  return (
    <div>
      <h1>{user!.name}</h1>  {/* ⚠️ ShepVerify: Non-null assertion */}
      <p>{user?.email}</p>
    </div>
  );
};`,
  
  python: `# Sample Python code with issues ShepVerify would catch
import math, sys, os

def f(a):
    s=0
    for i in range(len(a)):
        if a[i] == None or a[i]=="":
            pass
        else:
            try:
                s = s + float(a[i])
                c=c+1
            except:
                print("bad", a[i])  # ⚠️ ShepVerify: Use logging
        if c==0:
            s = 0
        else:
            s = s/c
            return [c,s,s]

def main():
    x = [10,"20","",None,"oops",30,40]
    r = f(x)
    print("stats:", r[0], r[1], r[2], "done")  # ⚠️ ShepVerify: Use logging

main()`,
  
  react: `// Sample React TSX with issues ShepVerify would catch
import React, { useState, useEffect } from 'react';

interface OrderViewProps {
  onNavigate: (to: string) => void;
  onSubmit;  // ⚠️ ShepVerify: Missing type annotation
}

export default function OrderView({ onNavigate }: OrderViewProps) {
  const [items, setItems] = useState<any[]>([]);  // ⚠️ ShepVerify: Avoid 'any'
  const [newItemTitle, setNewItemTitle] = useState('');
  
  useEffect(() => {
    setItems(getAllOrders());
  }, []);  // ⚠️ ShepVerify: Missing dependency
  
  const handleAdd = () => {
    if (!newItemTitle.trim()) return;
    const newItem = addOrder({ title: newItemTitle } as any);  // ⚠️ any
    setItems([...items, newItem]);
    setNewItemTitle('');
  };
  
  const handleToggle = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, done: !item.done } : item
    ));
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">OrderView</h2>
      <input type="text" value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)} />
      <button onClick={handleAdd}>Add</button>
    </div>
  );
}`,
  
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- ⚠️ ShepVerify: Missing meta description for SEO -->
  <title>My App</title>
</head>
<body>
  <header>
    <nav>
      <a>Home</a>  <!-- ⚠️ ShepVerify: Missing href attribute -->
      <a href="/about">About</a>
    </nav>
  </header>
  
  <main>
    <h1>Welcome to My App</h1>
    
    <img src="/hero.jpg">  <!-- ⚠️ ShepVerify: Missing alt attribute -->
    
    <button></button>  <!-- ⚠️ ShepVerify: Empty button, no accessible text -->
    
    <form>
      <input type="text" placeholder="Enter name">
      <button type="submit">Submit</button>
    </form>
  </main>
  
  <footer>
    <p>&copy; 2025 My App</p>
  </footer>
</body>
</html>`,
  
  css: `/* Sample CSS with issues ShepVerify would catch */

* {
  /* ⚠️ ShepVerify: Universal selector impacts performance */
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.header {
  background: #1a1a2e;
  padding: 20px;
  color: white !important;  /* ⚠️ ShepVerify: Avoid !important */
}

.nav-link {
  color: #4EC9B0;
  text-decoration: none;
  padding: 10px 20px;
}

.nav-link:hover {
  background: rgba(78, 201, 176, 0.2);
}

.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.button {
  background: #4EC9B0 !important;  /* ⚠️ ShepVerify: Avoid !important */
  color: #1a1a2e;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}`
};

// Default ShepLang code for first load
const DEFAULT_CODE = DEMO_CODE_SAMPLES.sheplang;

const DEFAULT_CODE_OLD = `app TaskFlowYC

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
  const [displayCode, setDisplayCode] = useState<string>(DEFAULT_CODE);
  const [demoLanguage, setDemoLanguage] = useState<string>('sheplang');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [diagnostics, setDiagnostics] = useState<ShepLangDiagnostic[]>([]);
  const [parseTime, setParseTime] = useState<number>(0);
  
  // Editor ref for error navigation
  const editorRef = useRef<any>(null);
  
  // Handle demo language change
  const handleDemoLanguageChange = (lang: string) => {
    setDemoLanguage(lang);
    if (lang === 'sheplang') {
      // Return to actual ShepLang code
      setDisplayCode(code);
    } else {
      // Show demo code for selected language
      setDisplayCode(DEMO_CODE_SAMPLES[lang] || code);
    }
  };
  
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
    if (demoLanguage === 'sheplang') {
      setCode(newCode);
      setDisplayCode(newCode);
      localStorage.setItem('sheplang-playground-code', newCode);
    }
    // Don't save demo code changes
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
            value={displayCode}
            theme={theme}
            onChange={handleCodeChange}
            onAnalysisComplete={handleAnalysisComplete}
            editorRef={editorRef}
            readOnly={demoLanguage !== 'sheplang'}
            language={demoLanguage}
          />
        }
        right={
          <ShepVerifyPanel 
            code={code}
            diagnostics={diagnostics}
            parseTime={parseTime}
            theme={theme}
            onErrorClick={handleErrorClick}
            onDemoLanguageChange={handleDemoLanguageChange}
          />
        }
      />
    </div>
  );
}

export default App

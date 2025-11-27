import React, { useState, useEffect, useMemo } from 'react';
import type { ShepLangDiagnostic, VerificationScore } from '@/types';
import './ShepVerifyPanel.css';
import ResourcesTab from '@/components/resources/ResourcesTab';

interface ShepVerifyPanelProps {
  code: string;
  diagnostics: ShepLangDiagnostic[];
  parseTime: number;
  theme: 'light' | 'dark';
  onErrorClick?: (line: number, column: number) => void;
  onDemoLanguageChange?: (lang: string) => void;
}

enum VerifyTab {
  Verification = 'verification',
  Errors = 'errors',
  Resources = 'resources'
}

// Supported languages for demo mode
type DemoLanguage = 'sheplang' | 'typescript' | 'python' | 'react' | 'html' | 'css';

interface LanguageDemo {
  name: string;
  icon: string;
  scores: {
    overall: number;
    categories: { name: string; score: number }[];
  };
  sampleIssues: { type: 'error' | 'warning'; message: string; line: number }[];
}

const LANGUAGE_DEMOS: Record<DemoLanguage, LanguageDemo> = {
  sheplang: {
    name: 'ShepLang',
    icon: '🐑',
    scores: { overall: 0, categories: [] }, // Will be calculated from actual diagnostics
    sampleIssues: []
  },
  typescript: {
    name: 'TypeScript',
    icon: '🔷',
    scores: {
      overall: 78,
      categories: [
        { name: 'Type Safety', score: 65 },
        { name: 'Null Safety', score: 80 },
        { name: 'Code Quality', score: 90 },
        { name: 'React Patterns', score: 75 }
      ]
    },
    sampleIssues: [
      { type: 'error', message: 'Avoid using "any" type - use specific types', line: 12 },
      { type: 'error', message: 'Type assertion to "any" may hide type errors', line: 24 },
      { type: 'warning', message: 'Non-null assertion (!) bypasses null checks', line: 31 }
    ]
  },
  python: {
    name: 'Python',
    icon: '🐍',
    scores: {
      overall: 68,
      categories: [
        { name: 'Type Hints', score: 45 },
        { name: 'None Safety', score: 85 },
        { name: 'Code Quality', score: 70 },
        { name: 'Best Practices', score: 72 }
      ]
    },
    sampleIssues: [
      { type: 'warning', message: 'Function "process_data" missing return type annotation', line: 5 },
      { type: 'error', message: 'Bare "except:" catches all exceptions including KeyboardInterrupt', line: 15 },
      { type: 'warning', message: 'Consider using logging instead of print()', line: 22 }
    ]
  },
  react: {
    name: 'React TSX',
    icon: '⚛️',
    scores: {
      overall: 82,
      categories: [
        { name: 'Type Safety', score: 80 },
        { name: 'Null Safety', score: 75 },
        { name: 'Code Quality', score: 90 },
        { name: 'React Patterns', score: 85 }
      ]
    },
    sampleIssues: [
      { type: 'warning', message: 'useEffect missing dependency: "userId"', line: 18 },
      { type: 'error', message: 'Props interface missing type for "onSubmit"', line: 8 }
    ]
  },
  html: {
    name: 'HTML',
    icon: '🌐',
    scores: {
      overall: 85,
      categories: [
        { name: 'Accessibility', score: 75 },
        { name: 'SEO', score: 90 },
        { name: 'Semantics', score: 90 }
      ]
    },
    sampleIssues: [
      { type: 'error', message: 'Image missing alt attribute - required for accessibility', line: 24 },
      { type: 'warning', message: 'Page missing meta description - important for SEO', line: 1 }
    ]
  },
  css: {
    name: 'CSS',
    icon: '🎨',
    scores: {
      overall: 92,
      categories: [
        { name: 'Best Practices', score: 85 },
        { name: 'Performance', score: 95 },
        { name: 'Maintainability', score: 95 }
      ]
    },
    sampleIssues: [
      { type: 'warning', message: 'Avoid using !important - makes CSS harder to maintain', line: 45 }
    ]
  }
};

interface PhaseResult {
  name: string;
  status: 'passed' | 'warning' | 'failed';
  errors: ShepLangDiagnostic[];
  warnings: ShepLangDiagnostic[];
}

const ShepVerifyPanel: React.FC<ShepVerifyPanelProps> = ({ 
  code, 
  diagnostics, 
  parseTime,
  theme,
  onErrorClick,
  onDemoLanguageChange 
}) => {
  const [activeTab, setActiveTab] = useState<VerifyTab>(VerifyTab.Verification);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(['typeSafety', 'nullSafety']));
  const [demoLanguage, setDemoLanguage] = useState<DemoLanguage>('sheplang');
  
  // Handle language change and notify parent
  const handleLanguageChange = (lang: DemoLanguage) => {
    setDemoLanguage(lang);
    onDemoLanguageChange?.(lang);
  };

  // Calculate verification scores from diagnostics
  const verificationResult = useMemo(() => {
    const errors = diagnostics.filter(d => d.severity === 'error');
    const warnings = diagnostics.filter(d => d.severity === 'warning');
    
    // Categorize diagnostics into phases
    const phases: PhaseResult[] = [
      {
        name: 'Type Safety',
        status: errors.some(e => e.message.toLowerCase().includes('type') || e.message.toLowerCase().includes('field')) 
          ? 'failed' 
          : warnings.some(w => w.message.toLowerCase().includes('type')) 
            ? 'warning' 
            : 'passed',
        errors: errors.filter(e => e.message.toLowerCase().includes('type') || e.message.toLowerCase().includes('field') || e.message.toLowerCase().includes('unknown')),
        warnings: warnings.filter(w => w.message.toLowerCase().includes('type'))
      },
      {
        name: 'Null Safety',
        status: errors.some(e => e.message.toLowerCase().includes('null') || e.message.toLowerCase().includes('undefined') || e.message.toLowerCase().includes('required')) 
          ? 'failed' 
          : 'passed',
        errors: errors.filter(e => e.message.toLowerCase().includes('null') || e.message.toLowerCase().includes('undefined') || e.message.toLowerCase().includes('required')),
        warnings: []
      },
      {
        name: 'API Contracts',
        status: errors.some(e => e.message.toLowerCase().includes('action') || e.message.toLowerCase().includes('call') || e.message.toLowerCase().includes('load')) 
          ? 'failed' 
          : 'passed',
        errors: errors.filter(e => e.message.toLowerCase().includes('action') || e.message.toLowerCase().includes('call') || e.message.toLowerCase().includes('load')),
        warnings: []
      },
      {
        name: 'Exhaustiveness',
        status: errors.some(e => e.message.toLowerCase().includes('view') || e.message.toLowerCase().includes('show') || e.message.toLowerCase().includes('missing')) 
          ? 'failed' 
          : warnings.length > 0 
            ? 'warning' 
            : 'passed',
        errors: errors.filter(e => e.message.toLowerCase().includes('view') || e.message.toLowerCase().includes('show')),
        warnings: warnings.filter(w => !w.message.toLowerCase().includes('type'))
      }
    ];

    // Calculate scores
    const totalChecks = 4;
    const passedChecks = phases.filter(p => p.status === 'passed').length;
    const warningChecks = phases.filter(p => p.status === 'warning').length;
    
    // Overall score calculation
    let overallScore = Math.round(((passedChecks + (warningChecks * 0.5)) / totalChecks) * 100);
    
    // Penalize for errors
    if (errors.length > 0) {
      overallScore = Math.max(0, overallScore - (errors.length * 10));
    }

    const scores: VerificationScore = {
      overall: overallScore,
      typeSafety: phases[0].status === 'passed' ? 100 : phases[0].status === 'warning' ? 75 : Math.max(0, 100 - phases[0].errors.length * 25),
      nullSafety: phases[1].status === 'passed' ? 100 : Math.max(0, 100 - phases[1].errors.length * 25),
      apiContracts: phases[2].status === 'passed' ? 100 : Math.max(0, 100 - phases[2].errors.length * 25),
      exhaustiveness: phases[3].status === 'passed' ? 100 : phases[3].status === 'warning' ? 85 : Math.max(0, 100 - phases[3].errors.length * 25)
    };

    // Overall status
    const status = errors.length > 0 ? 'failed' : warnings.length > 0 ? 'warning' : 'passed';

    return { phases, scores, status, errorCount: errors.length, warningCount: warnings.length };
  }, [diagnostics]);

  const togglePhase = (phaseName: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseName)) {
      newExpanded.delete(phaseName);
    } else {
      newExpanded.add(phaseName);
    }
    setExpandedPhases(newExpanded);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#4EC9B0'; // Green
    if (score >= 60) return '#DCDCAA'; // Yellow
    return '#F14C4C'; // Red
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'passed': return '✓';
      case 'warning': return '⚠';
      case 'failed': return '✖';
      default: return '○';
    }
  };

  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'passed': return 'status-passed';
      case 'warning': return 'status-warning';
      case 'failed': return 'status-failed';
      default: return '';
    }
  };

  return (
    <div className={`shepverify-panel ${theme}`}>
      <div className="verify-header">
        <div className="verify-tabs">
          <button 
            className={`tab-button ${activeTab === VerifyTab.Verification ? 'active' : ''}`}
            onClick={() => setActiveTab(VerifyTab.Verification)}
          >
            🛡️ ShepVerify
          </button>
          <button 
            className={`tab-button ${activeTab === VerifyTab.Errors ? 'active' : ''}`}
            onClick={() => setActiveTab(VerifyTab.Errors)}
          >
            {verificationResult.errorCount > 0 && (
              <span className="error-badge">{verificationResult.errorCount}</span>
            )}
            Issues
          </button>
          <button 
            className={`tab-button ${activeTab === VerifyTab.Resources ? 'active' : ''}`}
            onClick={() => setActiveTab(VerifyTab.Resources)}
          >
            📚 Learn
          </button>
        </div>
        <div className="verify-meta">
          <span className="parse-time">{parseTime.toFixed(1)}ms</span>
        </div>
      </div>

      {/* Language Switcher */}
      <div className="language-switcher">
        <span className="switcher-label">Try:</span>
        {(Object.keys(LANGUAGE_DEMOS) as DemoLanguage[]).map((lang) => (
          <button
            key={lang}
            className={`lang-btn ${demoLanguage === lang ? 'active' : ''}`}
            onClick={() => handleLanguageChange(lang)}
            title={LANGUAGE_DEMOS[lang].name}
          >
            {LANGUAGE_DEMOS[lang].icon}
          </button>
        ))}
      </div>

      <div className="verify-content">
        {activeTab === VerifyTab.Verification && demoLanguage !== 'sheplang' && (
          <div className="verification-view demo-mode">
            {/* Demo Mode Banner */}
            <div className="demo-banner">
              <span className="demo-icon">{LANGUAGE_DEMOS[demoLanguage].icon}</span>
              <span className="demo-text">
                {LANGUAGE_DEMOS[demoLanguage].name} Demo
              </span>
              <span className="demo-hint">Sample verification preview</span>
            </div>

            {/* Demo Overall Score */}
            <div className="score-section">
              <div className="score-header">
                <span className="score-label">Score</span>
                <span 
                  className="score-value" 
                  style={{ color: getScoreColor(LANGUAGE_DEMOS[demoLanguage].scores.overall) }}
                >
                  {LANGUAGE_DEMOS[demoLanguage].scores.overall}%
                </span>
              </div>
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ 
                    width: `${LANGUAGE_DEMOS[demoLanguage].scores.overall}%`,
                    backgroundColor: getScoreColor(LANGUAGE_DEMOS[demoLanguage].scores.overall)
                  }}
                />
              </div>
            </div>

            {/* Demo Category Scores */}
            <div className="category-scores">
              {LANGUAGE_DEMOS[demoLanguage].scores.categories.map((cat) => (
                <div key={cat.name} className="category-score">
                  <span className="category-name">{cat.name}</span>
                  <span 
                    className="category-value"
                    style={{ color: getScoreColor(cat.score) }}
                  >
                    {cat.score}%
                  </span>
                </div>
              ))}
            </div>

            {/* Demo Issues */}
            <div className="phases-section">
              <h3 className="section-title">Sample Issues</h3>
              {LANGUAGE_DEMOS[demoLanguage].sampleIssues.map((issue, idx) => (
                <div key={idx} className={`demo-issue ${issue.type}`}>
                  <span className="issue-icon">{issue.type === 'error' ? '✖' : '⚠'}</span>
                  <span className="issue-message">{issue.message}</span>
                  <span className="issue-line">Line {issue.line}</span>
                </div>
              ))}
            </div>

            {/* VS Code CTA for Demo */}
            <div className="vscode-cta demo-cta">
              <h4>Want real {LANGUAGE_DEMOS[demoLanguage].name} verification?</h4>
              <p>Install the VS Code extension for live verification of your actual code.</p>
              <a 
                href="https://marketplace.visualstudio.com/items?itemName=GoldenSheepAI.sheplang-vscode"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-button"
              >
                🚀 Install for VS Code
              </a>
            </div>
          </div>
        )}

        {activeTab === VerifyTab.Verification && demoLanguage === 'sheplang' && (
          <div className="verification-view">
            {/* Overall Status Banner */}
            <div className={`status-banner ${getStatusClass(verificationResult.status)}`}>
              <div className="status-icon">{getStatusIcon(verificationResult.status)}</div>
              <div className="status-text">
                {verificationResult.status === 'passed' && 'Verified'}
                {verificationResult.status === 'warning' && `${verificationResult.warningCount} Warning${verificationResult.warningCount !== 1 ? 's' : ''}`}
                {verificationResult.status === 'failed' && `${verificationResult.errorCount} Error${verificationResult.errorCount !== 1 ? 's' : ''}`}
              </div>
              <div className="status-time">Just now</div>
            </div>

            {/* Overall Score */}
            <div className="score-section">
              <div className="score-header">
                <span className="score-label">Score</span>
                <span 
                  className="score-value" 
                  style={{ color: getScoreColor(verificationResult.scores.overall) }}
                >
                  {verificationResult.scores.overall}%
                </span>
              </div>
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ 
                    width: `${verificationResult.scores.overall}%`,
                    backgroundColor: getScoreColor(verificationResult.scores.overall)
                  }}
                />
              </div>
            </div>

            {/* Category Scores */}
            <div className="category-scores">
              <div className="category-score">
                <span className="category-name">Type Safety</span>
                <span 
                  className="category-value"
                  style={{ color: getScoreColor(verificationResult.scores.typeSafety) }}
                >
                  {verificationResult.scores.typeSafety}%
                </span>
              </div>
              <div className="category-score">
                <span className="category-name">Null Safety</span>
                <span 
                  className="category-value"
                  style={{ color: getScoreColor(verificationResult.scores.nullSafety) }}
                >
                  {verificationResult.scores.nullSafety}%
                </span>
              </div>
              <div className="category-score">
                <span className="category-name">API Contracts</span>
                <span 
                  className="category-value"
                  style={{ color: getScoreColor(verificationResult.scores.apiContracts) }}
                >
                  {verificationResult.scores.apiContracts}%
                </span>
              </div>
              <div className="category-score">
                <span className="category-name">Exhaustiveness</span>
                <span 
                  className="category-value"
                  style={{ color: getScoreColor(verificationResult.scores.exhaustiveness) }}
                >
                  {verificationResult.scores.exhaustiveness}%
                </span>
              </div>
            </div>

            {/* Phases */}
            <div className="phases-section">
              <h3 className="section-title">Phases</h3>
              {verificationResult.phases.map((phase, idx) => (
                <div key={phase.name} className="phase-item">
                  <div 
                    className="phase-header"
                    onClick={() => togglePhase(phase.name)}
                  >
                    <span className={`phase-status ${getStatusClass(phase.status)}`}>
                      {getStatusIcon(phase.status)}
                    </span>
                    <span className="phase-name">{phase.name}</span>
                    {(phase.errors.length > 0 || phase.warnings.length > 0) && (
                      <span className="phase-count">
                        {phase.errors.length + phase.warnings.length}
                      </span>
                    )}
                    <span className="phase-expand">
                      {expandedPhases.has(phase.name) ? '▼' : '▶'}
                    </span>
                  </div>
                  {expandedPhases.has(phase.name) && (
                    <div className="phase-details">
                      {phase.errors.length === 0 && phase.warnings.length === 0 ? (
                        <div className="phase-passed">All checks passed</div>
                      ) : (
                        <>
                          {phase.errors.map((error, i) => (
                            <div 
                              key={i} 
                              className="phase-error"
                              onClick={() => error.range && onErrorClick?.(error.range.startLineNumber, error.range.startColumn)}
                            >
                              <span className="error-icon">✖</span>
                              <span className="error-message">{error.message}</span>
                              {error.range && (
                                <span className="error-location">
                                  Line {error.range.startLineNumber}
                                </span>
                              )}
                            </div>
                          ))}
                          {phase.warnings.map((warning, i) => (
                            <div 
                              key={i} 
                              className="phase-warning"
                              onClick={() => warning.range && onErrorClick?.(warning.range.startLineNumber, warning.range.startColumn)}
                            >
                              <span className="warning-icon">⚠</span>
                              <span className="warning-message">{warning.message}</span>
                              {warning.range && (
                                <span className="warning-location">
                                  Line {warning.range.startLineNumber}
                                </span>
                              )}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* VS Code CTA */}
            <div className="vscode-cta">
              <h4>Want more power?</h4>
              <p>Try ShepVerify in VS Code for 11 languages including TypeScript, Python, React, and more.</p>
              <a 
                href="https://marketplace.visualstudio.com/items?itemName=GoldenSheepAI.sheplang-vscode"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-button"
              >
                Install VS Code Extension
              </a>
            </div>
          </div>
        )}

        {activeTab === VerifyTab.Errors && (
          <div className="errors-view">
            {diagnostics.length === 0 ? (
              <div className="no-errors">
                <div className="no-errors-icon">✓</div>
                <div className="no-errors-text">No issues found</div>
                <div className="no-errors-hint">Your ShepLang code is verified!</div>
              </div>
            ) : (
              <div className="errors-list">
                {diagnostics.map((diagnostic, idx) => (
                  <div 
                    key={idx}
                    className={`error-item ${diagnostic.severity}`}
                    onClick={() => diagnostic.range && onErrorClick?.(diagnostic.range.startLineNumber, diagnostic.range.startColumn)}
                  >
                    <div className="error-header">
                      <span className={`error-severity ${diagnostic.severity}`}>
                        {diagnostic.severity === 'error' ? '✖' : diagnostic.severity === 'warning' ? '⚠' : 'ℹ'}
                      </span>
                      <span className="error-message">{diagnostic.message}</span>
                    </div>
                    {diagnostic.range && (
                      <div className="error-location">
                        Line {diagnostic.range.startLineNumber}, Column {diagnostic.range.startColumn}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === VerifyTab.Resources && (
          <ResourcesTab />
        )}
      </div>
    </div>
  );
};

export default ShepVerifyPanel;

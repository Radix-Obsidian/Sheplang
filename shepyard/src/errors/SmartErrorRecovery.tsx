/**
 * Smart Error Recovery UI Components
 * 
 * Founder-friendly error messages with:
 * - Auto-fix suggestions
 * - Code examples
 * - Did-you-mean suggestions
 * - Confidence indicators
 * 
 * Phase: Error Handling Enhancement
 */

import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Lightbulb, Copy, ChevronDown, ChevronUp, Zap } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface ErrorSuggestion {
  severity: 'error' | 'warning' | 'info';
  message: string;
  line: number;
  column: number;
  endColumn?: number;
  didYouMean?: string[];
  autoFix?: AutoFix;
  examples?: CodeExample[];
  learnMore?: string;
  errorType: string;
  confidence: number;
}

export interface AutoFix {
  title: string;
  description: string;
  changes: TextEdit[];
}

export interface TextEdit {
  range: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
  newText: string;
}

export interface CodeExample {
  title: string;
  description: string;
  code: string;
}

// ============================================================================
// ERROR PANEL COMPONENT
// ============================================================================

interface ErrorPanelProps {
  suggestions: ErrorSuggestion[];
  onApplyFix?: (suggestion: ErrorSuggestion) => void;
  onJumpToLine?: (line: number) => void;
}

export function ErrorPanel({ suggestions, onApplyFix, onJumpToLine }: ErrorPanelProps) {
  if (suggestions.length === 0) {
    return (
      <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
        <div className="flex items-center gap-2 text-green-800">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">No errors - looking good!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-4 py-2 bg-red-50 border-l-4 border-red-500 rounded">
        <div className="flex items-center gap-2 text-red-800">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">
            {suggestions.length} {suggestions.length === 1 ? 'error' : 'errors'} found
          </span>
        </div>
      </div>

      {suggestions.map((suggestion, index) => (
        <ErrorSuggestionCard
          key={index}
          suggestion={suggestion}
          onApplyFix={onApplyFix}
          onJumpToLine={onJumpToLine}
        />
      ))}
    </div>
  );
}

// ============================================================================
// ERROR SUGGESTION CARD
// ============================================================================

interface ErrorSuggestionCardProps {
  suggestion: ErrorSuggestion;
  onApplyFix?: (suggestion: ErrorSuggestion) => void;
  onJumpToLine?: (line: number) => void;
}

function ErrorSuggestionCard({ suggestion, onApplyFix, onJumpToLine }: ErrorSuggestionCardProps) {
  const [showExamples, setShowExamples] = useState(false);
  const [copied, setCopied] = useState(false);

  const severityStyles = {
    error: 'border-red-500 bg-red-50',
    warning: 'border-yellow-500 bg-yellow-50',
    info: 'border-blue-500 bg-blue-50',
  };

  const severityTextStyles = {
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  };

  const handleCopyExample = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`border-l-4 rounded-lg p-4 ${severityStyles[suggestion.severity]}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className={`w-4 h-4 ${severityTextStyles[suggestion.severity]}`} />
            <span className={`text-sm font-medium ${severityTextStyles[suggestion.severity]}`}>
              Line {suggestion.line}, Column {suggestion.column}
            </span>
          </div>
          <p className={`text-base font-medium ${severityTextStyles[suggestion.severity]}`}>
            {suggestion.message}
          </p>
        </div>

        {/* Confidence indicator */}
        {suggestion.confidence > 0.7 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-white rounded text-xs text-gray-600">
            <Zap className="w-3 h-3" />
            {Math.round(suggestion.confidence * 100)}% sure
          </div>
        )}
      </div>

      {/* Did You Mean? */}
      {suggestion.didYouMean && suggestion.didYouMean.length > 0 && (
        <div className="mb-3">
          <p className={`text-sm mb-2 ${severityTextStyles[suggestion.severity]}`}>
            💡 Did you mean:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestion.didYouMean.map((word, idx) => (
              <button
                key={idx}
                onClick={() => onApplyFix?.(suggestion)}
                className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-mono transition-colors"
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Auto Fix Button */}
      {suggestion.autoFix && (
        <div className="mb-3">
          <button
            onClick={() => onApplyFix?.(suggestion)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Zap className="w-4 h-4" />
            <span className="font-medium">{suggestion.autoFix.title}</span>
          </button>
          <p className="text-xs text-gray-600 mt-1 ml-6">
            {suggestion.autoFix.description}
          </p>
        </div>
      )}

      {/* Examples */}
      {suggestion.examples && suggestion.examples.length > 0 && (
        <div className="border-t border-gray-200 pt-3 mt-3">
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            <Lightbulb className="w-4 h-4" />
            Show {showExamples ? 'less' : 'example'}
            {showExamples ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showExamples && (
            <div className="mt-3 space-y-3">
              {suggestion.examples.map((example, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{example.title}</h4>
                      <p className="text-xs text-gray-600">{example.description}</p>
                    </div>
                    <button
                      onClick={() => handleCopyExample(example.code)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Copy code"
                    >
                      {copied ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                    <code>{example.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Learn More */}
      {suggestion.learnMore && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <a
            href={suggestion.learnMore}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            📚 Learn more about this →
          </a>
        </div>
      )}

      {/* Jump to Line */}
      {onJumpToLine && (
        <button
          onClick={() => onJumpToLine(suggestion.line)}
          className="mt-3 text-xs text-gray-600 hover:text-gray-900 hover:underline"
        >
          Jump to line {suggestion.line} →
        </button>
      )}
    </div>
  );
}

// ============================================================================
// INLINE ERROR WIDGET (for Monaco Editor)
// ============================================================================

interface InlineErrorProps {
  suggestion: ErrorSuggestion;
  onApplyFix?: (suggestion: ErrorSuggestion) => void;
}

export function InlineErrorWidget({ suggestion, onApplyFix }: InlineErrorProps) {
  return (
    <div className="inline-flex items-center gap-2 px-2 py-1 bg-red-100 border border-red-300 rounded text-xs">
      <AlertCircle className="w-3 h-3 text-red-600" />
      <span className="text-red-800 font-medium">{suggestion.message}</span>
      
      {suggestion.didYouMean && suggestion.didYouMean[0] && (
        <>
          <span className="text-red-600">•</span>
          <button
            onClick={() => onApplyFix?.(suggestion)}
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
          >
            Use '{suggestion.didYouMean[0]}'?
          </button>
        </>
      )}
    </div>
  );
}

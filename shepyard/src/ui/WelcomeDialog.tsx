/**
 * Welcome Dialog Component
 * 
 * First-run experience for new users.
 * Shows templates and quick-start guides.
 */

import React from 'react';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate';
  timeEstimate: string;
  exampleId: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'todo',
    name: 'Simple Todo List',
    description: 'Build a task manager with add, update, and delete actions',
    icon: '📝',
    difficulty: 'beginner',
    timeEstimate: '2 minutes',
    exampleId: 'todo',
  },
  {
    id: 'dog-reminders',
    name: 'Dog Reminders',
    description: 'Full-stack app with ShepThon backend and ShepLang frontend',
    icon: '🐕',
    difficulty: 'intermediate',
    timeEstimate: '5 minutes',
    exampleId: 'dog-reminders-frontend',
  },
  {
    id: 'dog-care',
    name: 'Dog Care Tracker',
    description: 'Track feeding times and walks for your furry friend',
    icon: '🦴',
    difficulty: 'beginner',
    timeEstimate: '3 minutes',
    exampleId: 'dog-reminder',
  },
  {
    id: 'multi-screen',
    name: 'Multi-Screen App',
    description: 'Learn navigation between different views',
    icon: '🗂️',
    difficulty: 'intermediate',
    timeEstimate: '4 minutes',
    exampleId: 'multi-screen',
  },
];

interface WelcomeDialogProps {
  onSelectTemplate: (exampleId: string) => void;
  onClose: () => void;
}

export function WelcomeDialog({ onSelectTemplate, onClose }: WelcomeDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome to ShepYard! 🎉</h1>
              <p className="text-indigo-100 text-lg">
                Let's build your first app together
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl transition-colors"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-8 overflow-y-auto flex-1">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Choose a template to get started
            </h2>
            <p className="text-gray-600">
              Each template includes complete code and step-by-step explanations
            </p>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template.exampleId)}
                className="group text-left bg-gradient-to-br from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-purple-50 rounded-xl p-6 border-2 border-gray-200 hover:border-indigo-400 transition-all duration-200 transform hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{template.icon}</div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      template.difficulty === 'beginner'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {template.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">
                      ⏱️ {template.timeEstimate}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {template.description}
                </p>
                <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium">
                  <span>Get started</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </button>
            ))}
          </div>

          {/* Quick Tips */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span className="mr-2">💡</span>
              Quick Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="mr-2 mt-0.5">•</span>
                <span>
                  <strong>Type and learn:</strong> As you type keywords like "view" or "action", 
                  you'll see helpful explanations and examples
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-0.5">•</span>
                <span>
                  <strong>Make a mistake?</strong> Don't worry! We'll suggest fixes and 
                  show you the correct syntax
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-0.5">•</span>
                <span>
                  <strong>See it live:</strong> Your changes appear instantly in the preview panel
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-0.5">•</span>
                <span>
                  <strong>Hover over keywords:</strong> Get instant documentation and examples
                </span>
              </li>
            </ul>
          </div>

          {/* Start from Scratch Option */}
          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
            >
              or start with a blank canvas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

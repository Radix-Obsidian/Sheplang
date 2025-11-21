/**
 * Import Analyzer - AI-powered code understanding
 * 
 * Uses Claude to extract semantic meaning from components
 * Goes beyond AST parsing to understand business logic
 */

import * as vscode from 'vscode';
import { callClaude, extractJSON } from './claudeClient';

export interface ComponentAnalysis {
  purpose: string;
  entities: string[];
  actions: Array<{
    name: string;
    trigger: string;
    description: string;
  }>;
  stateTracked: string[];
}

/**
 * Analyze a React component for semantic meaning
 */
export async function analyzeComponent(
  context: vscode.ExtensionContext,
  filePath: string,
  code: string
): Promise<ComponentAnalysis | null> {
  // Truncate very large files to fit context
  const maxCodeLength = 100000; // ~25K tokens
  const truncatedCode = code.length > maxCodeLength 
    ? code.substring(0, maxCodeLength) + '\n\n// ... (truncated for analysis)'
    : code;
  
  const prompt = `
Analyze this React/TypeScript component and extract semantic meaning.

Component: ${filePath}

\`\`\`tsx
${truncatedCode}
\`\`\`

Extract:
1. **Business purpose** - In plain English, what does this component do? (1 sentence)
2. **Main entities** - What data concepts/models does it work with? (e.g., "User", "Product")
3. **Key actions** - What are the meaningful user interactions? (not generic "handleClick", but actual business actions)
4. **State tracked** - What application state does this manage? (e.g., "isOpen", "selectedItem")

Guidelines:
- If it's a UI component without data management, say so clearly
- Action names should be descriptive (e.g., "ToggleSidebar" not "HandleClick")
- Empty arrays are fine if none detected
- Be concise but accurate

Return ONLY valid JSON in this exact format:
{
  "purpose": "Brief description of what this component does",
  "entities": ["Entity1", "Entity2"] or [],
  "actions": [
    {
      "name": "ActionName",
      "trigger": "button click / form submit / etc",
      "description": "what this does in plain English"
    }
  ],
  "stateTracked": ["state1", "state2"] or []
}
`;

  const response = await callClaude(context, prompt, 4096);
  
  if (!response) {
    return null; // Fallback to AST-only parsing
  }
  
  try {
    const json = extractJSON(response);
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to parse component analysis:', error);
    return null;
  }
}

/**
 * Analyze multiple components and synthesize project-level understanding
 */
export async function analyzeProject(
  context: vscode.ExtensionContext,
  components: Array<{ path: string; code: string }>
): Promise<{
  projectPurpose: string;
  mainEntities: string[];
  suggestedViews: string[];
} | null> {
  // For large projects, analyze only key files (limit: 3 largest components)
  const sorted = components
    .sort((a, b) => b.code.length - a.code.length)
    .slice(0, 3);
  
  const componentSummaries = sorted.map(c => ({
    path: c.path,
    // Send only first 5K chars of each component for project-level analysis
    snippet: c.code.substring(0, 5000)
  }));
  
  const prompt = `
Analyze this React project and provide a high-level understanding.

Key components:
${componentSummaries.map((c, i) => `
Component ${i + 1}: ${c.path}
\`\`\`tsx
${c.snippet}
\`\`\`
`).join('\n')}

Synthesize:
1. **Project purpose** - What does this app/project do overall?
2. **Main entities** - What are the core data models across all components?
3. **Suggested views** - What are the main screens/pages? (e.g., "Dashboard", "UserProfile")

Return ONLY valid JSON:
{
  "projectPurpose": "Brief project description",
  "mainEntities": ["Entity1", "Entity2"],
  "suggestedViews": ["ViewName1", "ViewName2"]
}
`;

  const response = await callClaude(context, prompt, 2048);
  
  if (!response) {
    return null;
  }
  
  try {
    const json = extractJSON(response);
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to parse project analysis:', error);
    return null;
  }
}

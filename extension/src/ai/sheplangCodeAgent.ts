/**
 * ShepLang Code Generation Agent
 * 
 * Specialized AI agent for generating production-ready ShepLang code.
 * NOT just CRUD - generates auth, search, uploads, webhooks, etc.
 * 
 * This is an EMBEDDED agent (not Claude Code terminal agent).
 * Works in VS Code extension, portable for all users.
 */

import * as vscode from 'vscode';
import { callClaude } from './claudeClient';
import { SHEPLANG_TRAINING_EXAMPLES } from './training/sheplangExamples';

export interface ComponentSpec {
  name: string;
  purpose: string;
  type: 'view' | 'component' | 'hook' | 'config';
  dependencies?: string[];
}

export interface EntitySpec {
  name: string;
  fields: Array<{
    name: string;
    type: string;
    required?: boolean;
  }>;
}

export class ShepLangCodeAgent {
  private context: vscode.ExtensionContext;
  
  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }
  
  /**
   * Strip markdown code fences from AI-generated code
   * Claude returns code wrapped in ```sheplang ... ``` which breaks parsing
   */
  private stripMarkdownCodeFences(code: string): string {
    // Remove opening fence with language identifier
    code = code.replace(/^```sheplang\n/, '');
    code = code.replace(/^```shepthon\n/, '');
    code = code.replace(/^```\n/, '');
    
    // Remove closing fence
    code = code.replace(/\n```$/, '');
    
    // Clean up any stray backticks at start/end
    code = code.trim();
    if (code.startsWith('```')) {
      code = code.substring(3);
    }
    if (code.endsWith('```')) {
      code = code.substring(0, code.length - 3);
    }
    
    return code.trim();
  }
  
  /**
   * Generate a complete ShepLang component with real implementation
   */
  async generateComponent(spec: ComponentSpec): Promise<string> {
    const prompt = this.buildComponentPrompt(spec);
    
    try {
      const code = await callClaude(this.context, prompt, 2048);
      
      if (!code) {
        console.warn('[ShepLangCodeAgent] No response from Claude, using fallback');
        return this.getComponentFallback(spec);
      }
      
      // CRITICAL: Strip markdown code fences that Claude adds
      const cleanCode = this.stripMarkdownCodeFences(code);
      
      console.log(`[ShepLangCodeAgent] Generated component ${spec.name} (${cleanCode.length} chars)`);
      return cleanCode;
    } catch (error) {
      console.error('[ShepLangCodeAgent] Failed to generate component:', error);
      // Fallback to basic template
      return this.getComponentFallback(spec);
    }
  }
  
  /**
   * Generate production-ready ShepThon backend
   * NOT just CRUD - includes auth, search, filters, uploads
   */
  async generateBackend(entities: EntitySpec[], appName: string): Promise<string> {
    const prompt = this.buildBackendPrompt(entities, appName);
    
    try {
      const code = await callClaude(this.context, prompt, 4096);
      
      if (!code) {
        console.warn('[ShepLangCodeAgent] No response from Claude, using fallback');
        return this.getBackendFallback(entities);
      }
      
      // CRITICAL: Strip markdown code fences that Claude adds
      const cleanCode = this.stripMarkdownCodeFences(code);
      
      console.log(`[ShepLangCodeAgent] Generated backend for ${appName} (${cleanCode.length} chars)`);
      return cleanCode;
    } catch (error) {
      console.error('[ShepLangCodeAgent] Failed to generate backend:', error);
      // Fallback to basic template
      return this.getBackendFallback(entities);
    }
  }
  
  /**
   * Build component generation prompt with training examples
   */
  private buildComponentPrompt(spec: ComponentSpec): string {
    const examples = SHEPLANG_TRAINING_EXAMPLES.components.join('\n\n---\n\n');
    const patterns = SHEPLANG_TRAINING_EXAMPLES.patterns
      .filter(p => !p.includes('backend') && !p.includes('endpoint'))
      .join('\n- ');
    
    return `You are a ShepLang expert. Generate PURE ShepLang syntax only.

## CRITICAL: ShepLang Syntax Rules (MUST FOLLOW EXACTLY):

1. NO square brackets [] anywhere
2. NO question marks ? anywhere  
3. NO complex expressions in view
4. NO function calls like getSidebarStyle()
5. NO TypeScript/React syntax
6. ONLY simple ShepLang widgets

## Valid ShepLang widgets ONLY:
- text "content"
- button "label"
- input
- container
- row
- column
- list
- if/else

## FORBIDDEN (DO NOT USE):
- aside [...]: ❌ WRONG
- style: getSidebarStyle() ❌ WRONG
- class: "complex" + expression ❌ WRONG
- Any [] brackets ❌ WRONG
- Any ? operators ❌ WRONG

## CORRECT ShepLang Examples:

\`\`\`sheplang
app MyApp

component Sidebar:
  props:
    isOpen: yes/no = yes
  
  state:
    collapsed: yes/no = no
  
  view:
    container:
      text "Sidebar"
      if isOpen:
        text "Menu Item 1"
        text "Menu Item 2"
      button "Toggle" -> toggleSidebar
      
action toggleSidebar():
  set collapsed = not collapsed
\`\`\`

## Example Components:

${examples}

## Best Practices:
- ${patterns}

## Your Task:

Generate a complete ${spec.type === 'component' ? 'component' : 'view'} called "${spec.name}".

Purpose: ${spec.purpose}
${spec.dependencies ? `Dependencies: ${spec.dependencies.join(', ')}` : ''}

CRITICAL RULES (MUST FOLLOW):
1. ONLY use valid ShepLang widgets: text, button, input, container, row, column, list, if/else
2. NO square brackets [] ANYWHERE
3. NO question marks ? ANYWHERE  
4. NO function calls or complex expressions
5. NO TypeScript/React/HTML syntax
6. Keep views SIMPLE with basic widgets only
7. Add helpful comments for founders

FORBIDDEN SYNTAX (NEVER USE):
- aside [...]: ❌
- div [...]: ❌
- style: anything ❌
- class: complex expressions ❌
- Any [] brackets ❌
- Any ? operators ❌
- getSomeFunction() calls ❌

CRITICAL: Output ONLY RAW ShepLang code.
DO NOT wrap in markdown code fences (triple backticks with 'sheplang' or triple backticks).
Start directly with 'app' keyword.
USE ONLY SIMPLE SHEPLANG WIDGETS.
NO explanations, NO markdown formatting, PURE ShepLang syntax only.`;
  }
  
  /**
   * Build backend generation prompt with training examples
   * CRITICAL: NOT just CRUD!
   */
  private buildBackendPrompt(entities: EntitySpec[], appName: string): string {
    const examples = SHEPLANG_TRAINING_EXAMPLES.backends.join('\n\n---\n\n');
    const patterns = SHEPLANG_TRAINING_EXAMPLES.patterns
      .filter(p => p.includes('backend') || p.includes('endpoint') || p.includes('auth'))
      .join('\n- ');
    
    const entityList = entities.map(e => e.name).join(', ');
    const hasUser = entities.some(e => e.name.toLowerCase() === 'user');
    const hasFileFields = entities.some(e => 
      e.fields.some(f => f.type.toLowerCase().includes('file') || f.name.toLowerCase().includes('avatar') || f.name.toLowerCase().includes('image'))
    );
    
    return `You are a ShepThon backend expert. Generate production-ready API endpoints.

## ShepThon Syntax:

\`\`\`shepthon
model EntityName {
  field: Type
}

GET /path -> logic
POST /path -> logic
PUT /path/:id -> logic
DELETE /path/:id -> logic
\`\`\`

## Example Backends (STUDY THESE - NOT JUST CRUD!):

${examples}

## Best Practices:
- ${patterns}

## Your Task:

Generate complete backend for: ${entityList}

Entities:
${entities.map(e => `
${e.name}:
${e.fields.map(f => `  - ${f.name}: ${f.type}${f.required ? ' (required)' : ''}`).join('\n')}
`).join('\n')}

CRITICAL REQUIREMENTS (NOT JUST CRUD!):

${hasUser ? `
1. AUTHENTICATION (User entity detected):
   - POST /auth/signup (with validation, password hashing)
   - POST /auth/login (with password verification, token generation)
   - GET /auth/me (with token verification)
   - POST /auth/logout
` : ''}

2. FOR EACH ENTITY:
   - GET /:entity (with pagination, filters)
   - GET /:entity/search?q=:query (full-text search)
   - GET /:entity/:id (single item)
   - POST /:entity (with validation, auth check)
   - PUT /:entity/:id (with validation, auth check)
   - DELETE /:entity/:id (with auth check)

${hasFileFields ? `
3. FILE UPLOADS (File fields detected):
   - POST /upload/:field (with file validation)
   - GET /files/:id (get signed URL)
` : ''}

4. ERROR HANDLING:
   - Return error(code, message) for validation failures
   - Use proper HTTP codes: 400, 401, 403, 404, 409, 500

5. SECURITY:
   - Verify tokens for protected endpoints
   - Hash passwords (never plain text!)
   - Sanitize input
   - Role-based access control

CRITICAL RULES:
1. NO CRUD-ONLY - Include auth, search, filters
2. Add validation and error handling
3. Include security (token verification, hashing)
4. Add helpful comments for non-technical founders
5. Generate realistic business logic

CRITICAL: Output ONLY RAW ShepThon code.
DO NOT wrap in markdown code fences (triple backticks with 'shepthon' or triple backticks).
Start directly with 'model' or endpoint definitions.
NO explanations, NO markdown formatting, PURE ShepThon syntax only.`;
  }
  
  /**
   * Fallback template if AI generation fails
   */
  private getComponentFallback(spec: ComponentSpec): string {
    return `// ${spec.name}
// ${spec.purpose}

app YourApp

${spec.type === 'component' ? 'component' : 'view'} ${spec.name}:
  state:
    loading: yes/no = no
  
  view:
    container:
      text "${spec.name}"
      // TODO: Add your UI widgets here
      
action initialize():
  set loading = no
  // TODO: Add your initialization logic`;
  }
  
  /**
   * Fallback template for backend if AI generation fails
   */
  private getBackendFallback(entities: EntitySpec[]): string {
    let code = '';
    
    for (const entity of entities) {
      const tableName = entity.name.toLowerCase();
      
      code += `model ${entity.name} {\n`;
      for (const field of entity.fields) {
        code += `  ${field.name}: ${field.type}\n`;
      }
      code += `  createdAt: DateTime\n`;
      code += `  updatedAt: DateTime\n`;
      code += `}\n\n`;
      
      code += `// ${entity.name} endpoints\n`;
      code += `GET /${tableName} -> db.all("${tableName}")\n`;
      code += `GET /${tableName}/:id -> db.find("${tableName}", params.id)\n`;
      code += `POST /${tableName} -> db.add("${tableName}", body)\n`;
      code += `PUT /${tableName}/:id -> db.update("${tableName}", params.id, body)\n`;
      code += `DELETE /${tableName}/:id -> db.remove("${tableName}", params.id)\n\n`;
    }
    
    return code;
  }
}

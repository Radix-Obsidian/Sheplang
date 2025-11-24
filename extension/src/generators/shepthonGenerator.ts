/**
 * ShepThon Backend Generator
 * 
 * Uses Claude AI to generate a matching .shepthon backend file
 * based on the generated .shep frontend and import context.
 */

import * as vscode from 'vscode';
import { AppModel } from '../parsers/astAnalyzer';
import { callClaude } from '../ai/claudeClient';

export interface ShepThonFile {
  fileName: string;
  content: string;
}

/**
 * Generate .shepthon backend file using AI
 */
export async function generateShepThonBackend(
  context: vscode.ExtensionContext,
  appModel: AppModel,
  shepContent: string
): Promise<ShepThonFile | null> {
  try {
    const prompt = buildBackendPrompt(appModel, shepContent);
    
    const response = await callClaude(context, prompt, 4000);
    
    if (!response) {
      console.error('[ShepThon Generator] No response from Claude');
      return null;
    }
    
    // Extract code from response (remove markdown if present)
    const code = extractCode(response);
    
    return {
      fileName: `${appModel.appName}.shepthon`,
      content: code
    };
  } catch (error) {
    console.error('[ShepThon Generator] Error:', error);
    return null;
  }
}

/**
 * Build AI prompt for backend generation
 */
function buildBackendPrompt(appModel: AppModel, shepContent: string): string {
  const entityList = appModel.entities.map(e => {
    const fields = e.fields.map(f => `  - ${f.name}: ${f.type}`).join('\n');
    return `${e.name}:\n${fields}`;
  }).join('\n\n');
  
  const actionList = appModel.actions.map(a => {
    return `- ${a.name}(${a.parameters?.join(', ') || ''})`;
  }).join('\n');
  
  return `You are a backend code generator for ShepThon, a declarative backend DSL.

# Task
Generate a complete .shepthon backend file that provides API endpoints for this ShepLang frontend.

# Frontend (.shep file)
\`\`\`sheplang
${shepContent}
\`\`\`

# Detected Entities
${entityList || '(none - create basic CRUD for common entities)'}

# Detected Actions
${actionList || '(none - create standard CRUD operations)'}

# ShepThon Syntax Reference
\`\`\`shepthon
# Define data models
model User {
  id: String
  name: String
  email: String
  createdAt: DateTime
}

model Post {
  id: String
  title: String
  content: String
  authorId: String  # Foreign key
  published: Boolean
}

# Define API endpoints
GET /users -> db.all("users")
GET /users/:id -> db.find("users", params.id)
POST /users -> db.add("users", body)
PUT /users/:id -> db.update("users", params.id, body)
DELETE /users/:id -> db.remove("users", params.id)

GET /posts -> db.all("posts")
POST /posts -> db.add("posts", body)
\`\`\`

# Requirements
1. Create a \`model\` for each entity with appropriate field types
2. Add standard CRUD endpoints (GET, POST, PUT, DELETE) for each entity
3. Use proper field types: String, Int, Boolean, DateTime, Float
4. Include common fields: id (always String), createdAt, updatedAt where appropriate
5. Add foreign keys for relationships (e.g., userId, postId)
6. Keep it simple - this is a generated scaffold that users will refine

# Field Type Mapping
- ShepLang "text" -> ShepThon "String"
- ShepLang "number" -> ShepThon "Int"
- ShepLang "yes/no" -> ShepThon "Boolean"
- ShepLang "date" -> ShepThon "DateTime"

# Output Format
Return ONLY the .shepthon code, no explanations or markdown.
Start directly with model definitions.

# Example Output
\`\`\`
model Task {
  id: String
  title: String
  completed: Boolean
  createdAt: DateTime
}

GET /tasks -> db.all("tasks")
GET /tasks/:id -> db.find("tasks", params.id)
POST /tasks -> db.add("tasks", body)
PUT /tasks/:id -> db.update("tasks", params.id, body)
DELETE /tasks/:id -> db.remove("tasks", params.id)
\`\`\`

Now generate the complete .shepthon backend:`;
}

/**
 * Extract code from AI response (remove markdown fences if present)
 */
function extractCode(response: string): string {
  // Remove markdown code fences
  let code = response.trim();
  
  // Remove starting ```shepthon or ```
  code = code.replace(/^```(?:shepthon)?\n?/, '');
  
  // Remove ending ```
  code = code.replace(/\n?```$/, '');
  
  // Trim again
  code = code.trim();
  
  return code;
}

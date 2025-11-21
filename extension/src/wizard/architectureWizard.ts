/**
 * Architecture Wizard
 * 
 * Asks questions to understand the project and design the optimal architecture.
 * Inspired by Cursor Composer and Lovable's intelligent scaffolding.
 */

import * as vscode from 'vscode';
import { callClaude } from '../ai/claudeClient';
import { AppModel } from '../parsers/astAnalyzer';

export interface ArchitecturePlan {
  projectType: 'saas' | 'ecommerce' | 'social' | 'dashboard' | 'api' | 'portfolio' | 'custom';
  structure: 'feature-based' | 'layer-based' | 'domain-driven' | 'monorepo';
  folders: ArchitectureFolder[];
  conventions: {
    naming: string;
    fileOrganization: string;
    importStrategy: string;
  };
  reasoning: string;
}

export interface ArchitectureFolder {
  path: string;
  purpose: string;
  files: ArchitectureFile[];
  subfolders?: ArchitectureFolder[];
}

export interface ArchitectureFile {
  name: string;
  purpose: string;
  dependencies: string[];
}

/**
 * Show architecture wizard and get user input
 */
export async function showArchitectureWizard(
  context: vscode.ExtensionContext,
  appModel: AppModel
): Promise<ArchitecturePlan | null> {
  // Step 1: Ask about project type
  const projectType = await askProjectType(appModel);
  if (!projectType) return null;

  // Step 2: Ask about architecture preferences
  const preferences = await askArchitecturePreferences();
  if (!preferences) return null;

  // Step 3: Ask about scale and complexity
  const scale = await askProjectScale(appModel);
  if (!scale) return null;

  // Step 4: Generate architecture plan with AI
  const plan = await generateArchitecturePlan(
    context,
    appModel,
    projectType,
    preferences,
    scale
  );

  if (!plan) return null;

  // Step 5: Show preview and get confirmation
  const confirmed = await confirmArchitecture(plan);
  if (!confirmed) return null;

  return plan;
}

/**
 * Ask about project type
 */
async function askProjectType(appModel: AppModel): Promise<string | null> {
  const entityNames = appModel.entities.map(e => e.name.toLowerCase()).join(', ');
  
  // Auto-detect project type from entities
  let suggestedType = 'custom';
  
  if (entityNames.includes('user') && entityNames.includes('product')) {
    suggestedType = 'ecommerce';
  } else if (entityNames.includes('user') && entityNames.includes('post')) {
    suggestedType = 'social';
  } else if (entityNames.includes('metric') || entityNames.includes('report')) {
    suggestedType = 'dashboard';
  } else if (appModel.entities.length > 0 && appModel.views.length === 0) {
    suggestedType = 'api';
  } else if (entityNames.includes('subscription') || entityNames.includes('billing')) {
    suggestedType = 'saas';
  }

  const typeOptions = [
    {
      label: `$(rocket) SaaS Platform ${suggestedType === 'saas' ? '(Recommended)' : ''}`,
      value: 'saas',
      description: 'Multi-tenant app with auth, billing, admin'
    },
    {
      label: `$(package) E-commerce ${suggestedType === 'ecommerce' ? '(Recommended)' : ''}`,
      value: 'ecommerce',
      description: 'Products, cart, checkout, orders'
    },
    {
      label: `$(comment-discussion) Social Network ${suggestedType === 'social' ? '(Recommended)' : ''}`,
      value: 'social',
      description: 'Users, posts, comments, feeds'
    },
    {
      label: `$(graph) Dashboard ${suggestedType === 'dashboard' ? '(Recommended)' : ''}`,
      value: 'dashboard',
      description: 'Analytics, charts, reports'
    },
    {
      label: `$(server) API Service ${suggestedType === 'api' ? '(Recommended)' : ''}`,
      value: 'api',
      description: 'Backend only, no UI'
    },
    {
      label: '$(file-code) Portfolio/Landing Page',
      value: 'portfolio',
      description: 'Simple content site'
    },
    {
      label: '$(tools) Custom',
      value: 'custom',
      description: 'I\'ll describe it myself'
    }
  ];

  const selected = await vscode.window.showQuickPick(typeOptions, {
    placeHolder: 'What type of application is this?',
    ignoreFocusOut: true
  });

  if (!selected) return null;

  // If custom, ask for description
  if (selected.value === 'custom') {
    const description = await vscode.window.showInputBox({
      prompt: 'Describe your application in 1-2 sentences',
      placeHolder: 'e.g., A booking system for restaurants with table management',
      ignoreFocusOut: true
    });
    return description || 'custom';
  }

  return selected.value;
}

/**
 * Ask about architecture preferences
 */
async function askArchitecturePreferences(): Promise<{
  structure: string;
  grouping: string;
} | null> {
  const structureOptions = [
    {
      label: '$(folder) Feature-Based',
      value: 'feature-based',
      description: 'Group by feature (users/, products/, orders/)'
    },
    {
      label: '$(layers) Layer-Based',
      value: 'layer-based',
      description: 'Group by type (models/, views/, controllers/)'
    },
    {
      label: '$(organization) Domain-Driven',
      value: 'domain-driven',
      description: 'Group by business domain (customers/, inventory/, billing/)'
    },
    {
      label: '$(repo) Monorepo',
      value: 'monorepo',
      description: 'Separate packages (frontend/, backend/, shared/)'
    }
  ];

  const structure = await vscode.window.showQuickPick(structureOptions, {
    placeHolder: 'How should we organize your project?',
    ignoreFocusOut: true
  });

  if (!structure) return null;

  const groupingOptions = [
    {
      label: '$(symbol-file) One file per entity',
      value: 'per-entity',
      description: 'User.shep, Product.shep (easier to navigate)'
    },
    {
      label: '$(list-tree) Grouped by domain',
      value: 'grouped',
      description: 'auth/User.shep, store/Product.shep (more organized)'
    }
  ];

  const grouping = await vscode.window.showQuickPick(groupingOptions, {
    placeHolder: 'How should we organize files within folders?',
    ignoreFocusOut: true
  });

  if (!grouping) return null;

  return {
    structure: structure.value,
    grouping: grouping.value
  };
}

/**
 * Ask about project scale
 */
async function askProjectScale(appModel: AppModel): Promise<string | null> {
  const entityCount = appModel.entities.length;
  
  let suggestedScale = 'medium';
  if (entityCount <= 3) suggestedScale = 'small';
  if (entityCount >= 10) suggestedScale = 'large';

  const scaleOptions = [
    {
      label: `$(home) Small ${suggestedScale === 'small' ? '(Recommended)' : ''}`,
      value: 'small',
      description: 'MVP, prototype (1-5 entities, simple structure)'
    },
    {
      label: `$(briefcase) Medium ${suggestedScale === 'medium' ? '(Recommended)' : ''}`,
      value: 'medium',
      description: 'Production app (5-15 entities, organized structure)'
    },
    {
      label: `$(organization) Large ${suggestedScale === 'large' ? '(Recommended)' : ''}`,
      value: 'large',
      description: 'Enterprise (15+ entities, advanced architecture)'
    }
  ];

  const selected = await vscode.window.showQuickPick(scaleOptions, {
    placeHolder: 'What scale are you building for?',
    ignoreFocusOut: true
  });

  return selected?.value || null;
}

/**
 * Generate architecture plan using AI
 */
async function generateArchitecturePlan(
  context: vscode.ExtensionContext,
  appModel: AppModel,
  projectType: string,
  preferences: any,
  scale: string
): Promise<ArchitecturePlan | null> {
  const prompt = buildArchitecturePrompt(appModel, projectType, preferences, scale);
  
  const response = await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'AI is designing your project architecture...',
      cancellable: false
    },
    async () => {
      return await callClaude(context, prompt, 3000);
    }
  );

  if (!response) return null;

  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const plan = JSON.parse(jsonMatch[0]) as ArchitecturePlan;
    
    // CRITICAL: Sanitize file extensions
    // AI sometimes uses .tsx, .jsx, .ts, .js instead of .shep
    sanitizeFileExtensions(plan);
    
    return plan;
  } catch (error) {
    console.error('[Architecture Wizard] Failed to parse AI response:', error);
    return null;
  }
}

/**
 * Sanitize file extensions to ensure ShepLang/ShepThon formats
 */
function sanitizeFileExtensions(plan: ArchitecturePlan): void {
  for (const folder of plan.folders) {
    sanitizeFolderExtensions(folder);
  }
}

function sanitizeFolderExtensions(folder: ArchitectureFolder): void {
  // Ensure folder has files array
  if (!folder.files) {
    folder.files = [];
  }
  
  for (const file of folder.files) {
    const originalName = file.name;
    
    // Replace React/TypeScript extensions with ShepLang
    if (file.name.endsWith('.tsx') || 
        file.name.endsWith('.jsx') || 
        file.name.endsWith('.ts') || 
        file.name.endsWith('.js')) {
      file.name = file.name.replace(/\.(tsx|jsx|ts|js)$/, '.shep');
      console.log(`[ArchitectureWizard] Fixed extension: ${originalName} -> ${file.name}`);
    }
    
    // If it's an API/backend file, use .shepthon
    if (file.name.includes('api') || file.name.includes('backend') || file.name.includes('endpoint')) {
      if (!file.name.endsWith('.shepthon')) {
        file.name = file.name.replace(/\.shep$/, '.shepthon');
        console.log(`[ArchitectureWizard] Backend file: ${originalName} -> ${file.name}`);
      }
    }
  }
  
  // Recursively sanitize subfolders
  if (folder.subfolders) {
    for (const subfolder of folder.subfolders) {
      sanitizeFolderExtensions(subfolder);
    }
  }
}

/**
 * Build AI prompt for architecture planning
 */
function buildArchitecturePrompt(
  appModel: AppModel,
  projectType: string,
  preferences: any,
  scale: string
): string {
  return `You are an expert software architect. Design the optimal folder structure for this project.

# Project Details
**Name:** ${appModel.appName}
**Type:** ${projectType}
**Scale:** ${scale}
**Preferences:** ${preferences.structure}, ${preferences.grouping}

**Entities:** ${appModel.entities.map(e => e.name).join(', ')}
**Views:** ${appModel.views.map(v => v.name).join(', ')}
**Actions:** ${appModel.actions.length}

# Your Task
Design a professional, scalable folder structure that:
1. Follows ${preferences.structure} architecture pattern
2. Uses ${preferences.grouping} file organization
3. Scales well for a ${scale} project
4. Follows ${projectType} best practices

# Output Format
Return ONLY valid JSON:

\`\`\`json
{
  "projectType": "${projectType}",
  "structure": "${preferences.structure}",
  "folders": [
    {
      "path": "features/auth",
      "purpose": "Authentication and user management",
      "files": [
        {
          "name": "User.shep",
          "purpose": "User data model",
          "dependencies": []
        },
        {
          "name": "auth-api.shepthon",
          "purpose": "Login/signup endpoints",
          "dependencies": ["User.shep"]
        }
      ],
      "subfolders": []
    }
  ],
  "conventions": {
    "naming": "PascalCase for models, kebab-case for files",
    "fileOrganization": "Group by feature, colocate related files",
    "importStrategy": "Absolute imports from @/ alias"
  },
  "reasoning": "This structure groups authentication logic together, making it easy to find and modify user-related features."
}
\`\`\`

# Examples for ${projectType}

${getArchitectureExamples(projectType)}

Return ONLY the JSON, no explanations.`;
}

/**
 * Get example architectures for project type
 */
function getArchitectureExamples(projectType: string): string {
  const examples: Record<string, string> = {
    saas: `
**SaaS Example:**
- features/auth/ (login, signup, User model)
- features/billing/ (subscriptions, payments, Subscription model)
- features/admin/ (user management, analytics)
- shared/ (types, utils, config)
`,
    ecommerce: `
**E-commerce Example:**
- features/catalog/ (Product, Category models, product views)
- features/cart/ (Cart model, checkout flow)
- features/orders/ (Order model, order management)
- shared/ (payment utils, shipping config)
`,
    social: `
**Social Network Example:**
- features/users/ (User, Profile models, user views)
- features/posts/ (Post, Comment models, feed views)
- features/messaging/ (Message model, chat views)
- shared/ (notification utils, media handling)
`,
    dashboard: `
**Dashboard Example:**
- features/analytics/ (Metric model, chart views)
- features/reports/ (Report model, report generation)
- features/data-sources/ (connection configs, data fetching)
- shared/ (chart components, utils)
`,
    api: `
**API Service Example:**
- api/v1/users/ (user endpoints, models)
- api/v1/resources/ (resource endpoints, models)
- lib/ (middleware, validators, utils)
- config/ (environment, database)
`
  };

  return examples[projectType] || examples.saas;
}

/**
 * Show preview and get confirmation
 */
async function confirmArchitecture(plan: ArchitecturePlan): Promise<boolean> {
  const preview = generateArchitecturePreview(plan);
  
  const panel = vscode.window.createWebviewPanel(
    'architecturePreview',
    'Preview: Project Architecture',
    vscode.ViewColumn.Beside,
    { enableScripts: false }
  );

  panel.webview.html = getArchitecturePreviewHTML(preview, plan);

  // Wait for user confirmation
  const result = await vscode.window.showInformationMessage(
    `📐 Architecture Plan Ready! Review the preview and confirm.`,
    'Looks Good!',
    'Start Over'
  );

  panel.dispose();

  return result === 'Looks Good!';
}

/**
 * Generate text preview of architecture
 */
function generateArchitecturePreview(plan: ArchitecturePlan): string {
  let preview = `# ${plan.projectType} Architecture\n\n`;
  preview += `**Structure:** ${plan.structure}\n\n`;
  preview += `## Folder Structure\n\n`;
  
  for (const folder of plan.folders) {
    preview += `### ${folder.path}/\n`;
    preview += `*${folder.purpose}*\n\n`;
    for (const file of folder.files) {
      preview += `- ${file.name} - ${file.purpose}\n`;
    }
    preview += `\n`;
  }

  preview += `## Conventions\n\n`;
  preview += `- **Naming:** ${plan.conventions.naming}\n`;
  preview += `- **Organization:** ${plan.conventions.fileOrganization}\n`;
  preview += `- **Imports:** ${plan.conventions.importStrategy}\n\n`;
  
  preview += `## Reasoning\n\n${plan.reasoning}\n`;

  return preview;
}

/**
 * Get HTML for architecture preview
 */
function getArchitecturePreviewHTML(preview: string, plan: ArchitecturePlan): string {
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 20px;
      background: #1e1e1e;
      color: #d4d4d4;
    }
    h1 { color: #007acc; }
    h2 { color: #4ec9b0; border-bottom: 1px solid #3e3e42; padding-bottom: 8px; }
    h3 { color: #dcdcaa; }
    code { background: #2d2d30; padding: 2px 6px; border-radius: 3px; }
    pre { background: #2d2d30; padding: 16px; border-radius: 6px; overflow-x: auto; }
  </style>
</head>
<body>
  <pre>${preview}</pre>
</body>
</html>`;
}

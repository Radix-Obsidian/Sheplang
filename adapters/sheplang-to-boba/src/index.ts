// Use the real parser from the language package (no mocks)
import { parseShep } from "@radix-obsidian/sheplang-language";
import type { Diagnostic, CompilationResult } from "@radix-obsidian/sheplang-language";

/**
 * Result of transpiling ShepLang to BobaScript
 */
export interface BobaTranspileResult {
  output: string | null;
  diagnostics: Diagnostic[];
  success: boolean;
  canonicalAst?: any;
}

/**
 * Transpiles ShepLang source to BobaScript
 * @param source ShepLang source code
 * @returns Transpilation result with BobaScript code, diagnostics, and success flag
 */
export async function transpileShepToBoba(source: string): Promise<BobaTranspileResult> {
  try {
    // Parse ShepLang source
    const parseResult = await parseShep(source);
    
    // If there were parse errors, return them
    if (!parseResult.success) {
      return {
        output: null,
        diagnostics: parseResult.diagnostics,
        success: false
      };
    }
    
    try {
      // Generate canonical AST from app model
      const canonicalAst = normalizeAst(parseResult.appModel);
      
      // Generate BobaScript from canonical AST
      const bobaCode = generateBobaCode(canonicalAst);
      
      return {
        output: bobaCode,
        diagnostics: parseResult.diagnostics,
        success: true,
        canonicalAst
      };
    } catch (error: any) {
      // Handle errors in AST normalization or code generation
      const diagnostic: Diagnostic = {
        message: `BobaScript generation error: ${error.message}`,
        severity: 'error',
        start: { line: 1, column: 1, offset: 0 },
        code: 'BOBA_GENERATION_ERROR',
        source: 'sheplang-to-boba'
      };
      
      return {
        output: null,
        diagnostics: [...parseResult.diagnostics, diagnostic],
        success: false
      };
    }
  } catch (error: any) {
    // Handle unexpected errors (parseShep should handle its own errors, but just in case)
    const diagnostic: Diagnostic = {
      message: `Unexpected error: ${error.message}`,
      severity: 'error',
      start: { line: 1, column: 1, offset: 0 },
      code: 'UNEXPECTED_ERROR',
      source: 'sheplang-to-boba'
    };
    
    return {
      output: null,
      diagnostics: [diagnostic],
      success: false
    };
  }
}

/**
 * Normalize AST into canonical form for consistent code generation
 */
function normalizeAst(appModel: any): any {
  // Convert the appModel structure to a canonical AST
  const body: any[] = [
    // Add app name as first text node for verify check
    { type: "Text", value: appModel.name }
  ];
  
  // Add views as components
  if (appModel.views) {
    for (const view of appModel.views) {
      body.push({
        type: "ComponentDecl",
        name: view.name
      });
    }
  }
  
  // Add data models as state
  if (appModel.datas) {
    for (const data of appModel.datas) {
      body.push({
        type: "StateDecl",
        name: data.name
      });
    }
  }
  
  // Add actions as routes
  if (appModel.actions) {
    for (const action of appModel.actions) {
      body.push({
        type: "RouteDecl",
        path: `/${action.name}`,
        target: action.name
      });
    }
  }
  
  return {
    type: "App",
    name: appModel.name,
    body
  };
}

/**
 * Generate BobaScript code from canonical AST
 */
function generateBobaCode(canonicalAst: any): string {
  // Simple code generation - in production this would be more sophisticated
  const lines: string[] = [];
  
  lines.push('// Generated BobaScript');
  lines.push('// ------------------');
  
  // Extract app name if present
  const appName = canonicalAst.body
    .find((node: any) => node.type === "ComponentDecl")?.name || 'DefaultApp';
  
  lines.push(`export const App = {`);
  lines.push(`  name: "${appName}",`);
  
  // Process components
  const components = canonicalAst.body.filter((n: any) => n.type === "ComponentDecl");
  if (components.length > 0) {
    lines.push(`  components: {`);
    components.forEach((comp: any, i: number) => {
      const isLast = i === components.length - 1;
      lines.push(`    ${comp.name}: {`);
      lines.push(`      render: () => {`);
      lines.push(`        return { type: "div", props: { className: "${comp.name}" }, children: [`);
      lines.push(`          { type: "h1", props: {}, children: ["${comp.name}"] }`);
      lines.push(`        ]};`);
      lines.push(`      }`);
      lines.push(`    }${isLast ? '' : ','}`);
    });
    lines.push(`  },`);
  }
  
  // Process routes
  const routes = canonicalAst.body.filter((n: any) => n.type === "RouteDecl");
  if (routes.length > 0) {
    lines.push(`  routes: [`);
    routes.forEach((route: any, i: number) => {
      const isLast = i === routes.length - 1;
      lines.push(`    { path: "${route.path}", component: "${route.target}" }${isLast ? '' : ','}`);
    });
    lines.push(`  ],`);
  }
  
  // Process state
  const states = canonicalAst.body.filter((n: any) => n.type === "StateDecl");
  if (states.length > 0) {
    lines.push(`  state: {`);
    states.forEach((state: any, i: number) => {
      const isLast = i === states.length - 1;
      lines.push(`    ${state.name}: {`);
      
      // Fields definition
      if (state.fields && state.fields.length > 0) {
        lines.push(`      fields: {`);
        state.fields.forEach((field: any, j: number) => {
          const isFieldLast = j === state.fields.length - 1;
          lines.push(`        ${field.name}: { type: "${field.type}" }${isFieldLast ? '' : ','}`);
        });
        lines.push(`      },`);
      }
      
      // Rules if present
      if (state.rules && state.rules.length > 0) {
        lines.push(`      rules: [`);
        state.rules.forEach((rule: any, k: number) => {
          const isRuleLast = k === state.rules.length - 1;
          // Use rule text if available, otherwise use a placeholder
          const ruleText = typeof rule === 'string' ? rule : 'default rule';
          lines.push(`        "${ruleText}"${isRuleLast ? '' : ','}`);
        });
        lines.push(`      ]`);
      }
      
      lines.push(`    }${isLast ? '' : ','}`);
    });
    lines.push(`  }`);
  }
  
  lines.push(`};`);
  lines.push('');
  lines.push('export default App;');
  
  return lines.join('\n');
}

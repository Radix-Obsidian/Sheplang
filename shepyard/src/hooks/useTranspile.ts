/**
 * useTranspile Hook
 * 
 * Automatically transpiles ShepLang source when active example changes.
 * Integrates transpiler service with workspace store.
 * 
 * Phase 2: Live Preview Renderer
 */

import { useEffect } from 'react';
import { useWorkspaceStore } from '../workspace/useWorkspaceStore';
import { transpileShepLang } from '../services/transpilerService';
import { explainShepLangApp } from '../services/explainService';
import { SHEP_EXAMPLES } from '../examples/exampleList';
import { logService } from '../services/logService';

/**
 * Hook that auto-transpiles the active example
 * 
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   useTranspile(); // Automatically handles transpilation
 *   const { transpile } = useWorkspaceStore();
 *   // Use transpile.bobaApp for rendering
 * }
 * ```
 */
export function useTranspile() {
  const activeExampleId = useWorkspaceStore((state) => state.activeExampleId);
  const setTranspiling = useWorkspaceStore((state) => state.setTranspiling);
  const setTranspileResult = useWorkspaceStore((state) => state.setTranspileResult);
  const setTranspileError = useWorkspaceStore((state) => state.setTranspileError);

  useEffect(() => {
    if (!activeExampleId) {
      // No example selected, clear transpile state
      return;
    }

    // Find the selected example
    const example = SHEP_EXAMPLES.find((ex) => ex.id === activeExampleId);
    if (!example) {
      setTranspileError(`Example not found: ${activeExampleId}`);
      return;
    }

    // Transpile the example source
    const performTranspile = async () => {
      setTranspiling(true);
      logService.info('sheplang', `Transpiling ${example.name}...`);

      try {
        const result = await transpileShepLang(example.source);

        if (result.success && result.bobaCode && result.canonicalAst) {
          // Parse the BobaScript code to extract the App object
          // For now, we'll use the canonicalAst directly as the App structure
          // In a production system, you might want to evaluate the bobaCode safely
          
          // Create a mock App object from canonical AST
          const bobaApp = createBobaAppFromAst(result.canonicalAst);
          
          // Generate explain data (Phase 3)
          const explainData = explainShepLangApp(result.canonicalAst);
          
          setTranspileResult(result.bobaCode, bobaApp, explainData);
          logService.success('sheplang', `✓ Successfully transpiled ${example.name}`);
        } else {
          setTranspileError(result.error || 'Transpilation failed');
        }
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Unknown error during transpilation';
        setTranspileError(errorMessage);
      }
    };

    performTranspile();
  }, [activeExampleId, setTranspiling, setTranspileResult, setTranspileError]);
}

/**
 * Creates a BobaScript App object from canonical AST
 * This converts the AST structure into the runtime App format
 */
function createBobaAppFromAst(canonicalAst: any): any {
  const app: any = {
    name: canonicalAst.name || 'App',
    components: {},
    routes: [],
    state: {},
  };

  // Process AST body
  if (canonicalAst.body && Array.isArray(canonicalAst.body)) {
    for (const node of canonicalAst.body) {
      if (node.type === 'ComponentDecl') {
        // Add component with simple render function
        app.components[node.name] = {
          render: () => ({
            type: 'div',
            props: { className: `component-${node.name.toLowerCase()}` },
            children: [
              {
                type: 'h1',
                props: { className: 'text-2xl font-bold mb-4' },
                children: [node.name]
              },
              {
                type: 'p',
                props: { className: 'text-gray-600' },
                children: [`This is the ${node.name} view`]
              }
            ]
          })
        };
      } else if (node.type === 'RouteDecl') {
        // Add route
        app.routes.push({
          path: node.path,
          component: node.target,
          target: node.target
        });
      } else if (node.type === 'StateDecl') {
        // Add state definition
        app.state[node.name] = {
          fields: node.fields || {},
          rules: node.rules || []
        };
      }
    }
  }

  return app;
}

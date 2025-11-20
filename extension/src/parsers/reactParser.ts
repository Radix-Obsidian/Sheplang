/**
 * React/TypeScript Parser for Next.js Projects
 * 
 * Parses React/TypeScript files to extract:
 * - Components and their structure
 * - JSX elements (buttons, forms, lists)
 * - Props and state
 * - Event handlers
 * - API calls
 * 
 * Used by Next.js importer to convert projects to ShepLang.
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

export interface ReactComponent {
  name: string;
  filePath: string;
  type: 'page' | 'component';
  exports: 'default' | 'named';
  props: PropDefinition[];
  state: StateVariable[];
  elements: JSXElement[];
  handlers: EventHandler[];
  apiCalls: APICall[];
}

export interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
}

export interface StateVariable {
  name: string;
  type: string;
  initialValue?: string;
}

export interface JSXElement {
  kind: 'button' | 'form' | 'input' | 'list' | 'link' | 'other';
  text?: string;
  onClick?: string;
  onSubmit?: string;
  href?: string;
  mapVariable?: string; // For .map() calls
  mapEntityHint?: string; // Guessed entity name from variable
}

export interface EventHandler {
  name: string;
  async: boolean;
  calls: string[]; // Functions called within handler
}

export interface APICall {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  inHandler?: string; // Which handler makes this call
}

/**
 * Parse a React/TypeScript file and extract component information
 */
export function parseReactFile(filePath: string): ReactComponent | null {
  const content = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  const component: Partial<ReactComponent> = {
    name: path.basename(filePath, path.extname(filePath)),
    filePath,
    type: isPage(filePath) ? 'page' : 'component',
    exports: 'named',
    props: [],
    state: [],
    elements: [],
    handlers: [],
    apiCalls: []
  };

  // Visit all nodes in the AST
  visit(sourceFile, component);

  // Return null if no component found
  if (!component.name || component.elements!.length === 0) {
    return null;
  }

  return component as ReactComponent;
}

/**
 * Determine if a file is a Next.js page
 */
function isPage(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/');
  return (
    normalized.includes('/app/') && normalized.endsWith('/page.tsx') ||
    normalized.includes('/pages/') && !normalized.includes('/_')
  );
}

/**
 * Recursively visit AST nodes
 */
function visit(node: ts.Node, component: Partial<ReactComponent>) {
  // Check for default export
  if (ts.isFunctionDeclaration(node) || ts.isVariableStatement(node)) {
    checkForComponentExport(node, component);
  }

  // Check for function components
  if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node)) {
    extractComponentInfo(node, component);
  }

  // Check for JSX elements
  if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
    extractJSXElement(node, component);
  }

  // Check for state (useState, useQuery, etc.)
  if (ts.isCallExpression(node)) {
    extractStateAndAPICalls(node, component);
  }

  // Recurse into children
  ts.forEachChild(node, child => visit(child, component));
}

/**
 * Check if node is a component export
 */
function checkForComponentExport(node: ts.Node, component: Partial<ReactComponent>) {
  // Check for "export default" - need to cast to access modifiers
  const modifiers = (ts.isFunctionDeclaration(node) || ts.isVariableStatement(node))
    ? ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined
    : undefined;

  if (modifiers?.some((m: ts.Modifier) => m.kind === ts.SyntaxKind.ExportKeyword)) {
    if (modifiers?.some((m: ts.Modifier) => m.kind === ts.SyntaxKind.DefaultKeyword)) {
      component.exports = 'default';
      
      // Extract component name
      if (ts.isFunctionDeclaration(node) && node.name) {
        component.name = node.name.text;
      } else if (ts.isVariableStatement(node)) {
        const declaration = node.declarationList.declarations[0];
        if (ts.isIdentifier(declaration.name)) {
          component.name = declaration.name.text;
        }
      }
    }
  }
}

/**
 * Extract component information (props, handlers, etc.)
 */
function extractComponentInfo(node: ts.FunctionDeclaration | ts.ArrowFunction, component: Partial<ReactComponent>) {
  // Extract props
  if (node.parameters.length > 0) {
    const propsParam = node.parameters[0];
    if (propsParam.type && ts.isTypeLiteralNode(propsParam.type)) {
      propsParam.type.members.forEach(member => {
        if (ts.isPropertySignature(member) && ts.isIdentifier(member.name)) {
          component.props!.push({
            name: member.name.text,
            type: member.type ? member.type.getText() : 'any',
            required: !member.questionToken
          });
        }
      });
    }
  }

  // Extract handlers (functions defined in component body)
  if (node.body && ts.isBlock(node.body)) {
    node.body.statements.forEach(stmt => {
      if (ts.isVariableStatement(stmt)) {
        stmt.declarationList.declarations.forEach(decl => {
          if (ts.isIdentifier(decl.name) && decl.name.text.startsWith('handle')) {
            const handler: EventHandler = {
              name: decl.name.text,
              async: false,
              calls: []
            };
            
            // Check if async
            if (decl.initializer && ts.isArrowFunction(decl.initializer)) {
              const mods = ts.canHaveModifiers(decl.initializer) ? ts.getModifiers(decl.initializer) : undefined;
              handler.async = !!mods?.some(
                (m: ts.Modifier) => m.kind === ts.SyntaxKind.AsyncKeyword
              );
            }
            
            component.handlers!.push(handler);
          }
        });
      }
    });
  }
}

/**
 * Extract JSX elements (buttons, forms, lists, etc.)
 */
function extractJSXElement(node: ts.JsxElement | ts.JsxSelfClosingElement, component: Partial<ReactComponent>) {
  const tagName = getJSXTagName(node);
  if (!tagName) return;

  const element: Partial<JSXElement> = {
    kind: 'other'
  };

  // Determine element kind
  if (tagName === 'button' || tagName === 'Button') {
    element.kind = 'button';
    element.text = extractJSXText(node);
    element.onClick = extractJSXAttribute(node, 'onClick');
  } else if (tagName === 'form' || tagName === 'Form') {
    element.kind = 'form';
    element.onSubmit = extractJSXAttribute(node, 'onSubmit');
  } else if (tagName === 'input' || tagName === 'Input') {
    element.kind = 'input';
  } else if (tagName === 'a' || tagName === 'Link') {
    element.kind = 'link';
    element.text = extractJSXText(node);
    element.href = extractJSXAttribute(node, 'href') || extractJSXAttribute(node, 'to');
  }

  // Check for .map() calls (lists)
  const parent = node.parent;
  if (parent && ts.isJsxExpression(parent)) {
    const mapCall = findMapCall(parent);
    if (mapCall) {
      element.kind = 'list';
      element.mapVariable = mapCall.variable;
      element.mapEntityHint = guessEntityFromVariable(mapCall.variable);
    }
  }

  component.elements!.push(element as JSXElement);
}

/**
 * Extract state variables and API calls
 */
function extractStateAndAPICalls(node: ts.CallExpression, component: Partial<ReactComponent>) {
  const expression = node.expression;
  
  // Check for useState
  if (ts.isIdentifier(expression) && expression.text === 'useState') {
    const parent = node.parent;
    if (parent && ts.isVariableDeclaration(parent) && ts.isArrayBindingPattern(parent.name)) {
      const varName = parent.name.elements[0];
      if (varName && ts.isBindingElement(varName) && ts.isIdentifier(varName.name)) {
        component.state!.push({
          name: varName.name.text,
          type: 'unknown',
          initialValue: node.arguments[0]?.getText()
        });
      }
    }
  }

  // Check for fetch calls
  if (ts.isPropertyAccessExpression(expression) && expression.name.text === 'fetch') {
    const urlArg = node.arguments[0];
    if (urlArg && ts.isStringLiteral(urlArg)) {
      const optionsArg = node.arguments[1];
      let method: APICall['method'] = 'GET';
      
      if (optionsArg && ts.isObjectLiteralExpression(optionsArg)) {
        const methodProp = optionsArg.properties.find(
          p => ts.isPropertyAssignment(p) && 
               ts.isIdentifier(p.name) && 
               p.name.text === 'method'
        ) as ts.PropertyAssignment | undefined;
        
        if (methodProp && ts.isStringLiteral(methodProp.initializer)) {
          method = methodProp.initializer.text as APICall['method'];
        }
      }

      component.apiCalls!.push({
        method,
        path: urlArg.text
      });
    }
  }

  // Check for React Query/tRPC patterns (api.*.useQuery, api.*.useMutation)
  if (ts.isPropertyAccessExpression(expression)) {
    const text = expression.getText();
    if (text.includes('.useQuery') || text.includes('.useMutation')) {
      // Extract API endpoint from chain (e.g., api.restaurants.list.useQuery)
      const parts = text.split('.');
      if (parts.length >= 3) {
        const resource = parts[1];
        const operation = parts[2];
        const method = text.includes('.useMutation') ? 'POST' : 'GET';
        
        component.apiCalls!.push({
          method,
          path: `/api/${resource}/${operation}`
        });
      }
    }
  }
}

/**
 * Get JSX tag name
 */
function getJSXTagName(node: ts.JsxElement | ts.JsxSelfClosingElement): string | null {
  if (ts.isJsxElement(node)) {
    const openingElement = node.openingElement;
    if (ts.isIdentifier(openingElement.tagName)) {
      return openingElement.tagName.text;
    }
  } else if (ts.isJsxSelfClosingElement(node)) {
    if (ts.isIdentifier(node.tagName)) {
      return node.tagName.text;
    }
  }
  return null;
}

/**
 * Extract text content from JSX element
 */
function extractJSXText(node: ts.JsxElement | ts.JsxSelfClosingElement): string | undefined {
  if (ts.isJsxElement(node)) {
    const text = node.children
      .filter(child => ts.isJsxText(child))
      .map(child => (child as ts.JsxText).text.trim())
      .join(' ');
    return text || undefined;
  }
  return undefined;
}

/**
 * Extract JSX attribute value
 */
function extractJSXAttribute(node: ts.JsxElement | ts.JsxSelfClosingElement, attrName: string): string | undefined {
  const attributes = ts.isJsxElement(node)
    ? node.openingElement.attributes
    : node.attributes;

  const attr = attributes.properties.find(
    p => ts.isJsxAttribute(p) && 
         ts.isIdentifier(p.name) && 
         p.name.text === attrName
  ) as ts.JsxAttribute | undefined;

  if (attr && attr.initializer) {
    if (ts.isStringLiteral(attr.initializer)) {
      return attr.initializer.text;
    } else if (ts.isJsxExpression(attr.initializer)) {
      return attr.initializer.expression?.getText();
    }
  }

  return undefined;
}

/**
 * Find .map() call in expression
 */
function findMapCall(node: ts.Node): { variable: string } | null {
  if (ts.isCallExpression(node)) {
    const expression = node.expression;
    if (ts.isPropertyAccessExpression(expression) && 
        ts.isIdentifier(expression.name) && 
        expression.name.text === 'map') {
      const object = expression.expression;
      return { variable: object.getText() };
    }
  }

  // Recurse
  let result: { variable: string } | null = null;
  ts.forEachChild(node, child => {
    if (!result) {
      result = findMapCall(child);
    }
  });
  return result;
}

/**
 * Guess entity name from variable name
 * Examples: "restaurants" -> "Restaurant", "menuItems" -> "MenuItem"
 */
function guessEntityFromVariable(variable: string): string {
  // Remove common prefixes
  let cleaned = variable.replace(/^(data|items|list)\.?/, '');
  
  // Singularize (basic heuristic)
  if (cleaned.endsWith('s')) {
    cleaned = cleaned.slice(0, -1);
  }
  
  // PascalCase
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Parse all React files in a directory recursively
 */
export function parseReactProject(projectRoot: string): ReactComponent[] {
  const components: ReactComponent[] = [];
  
  function walkDir(dir: string) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, .next, etc.
        if (!['node_modules', '.next', 'dist', 'build', '.git'].includes(file)) {
          walkDir(filePath);
        }
      } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        try {
          const component = parseReactFile(filePath);
          if (component) {
            components.push(component);
          }
        } catch (error) {
          console.warn(`Failed to parse ${filePath}:`, error);
        }
      }
    }
  }
  
  walkDir(projectRoot);
  return components;
}

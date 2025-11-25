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

export interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
}

export interface StateVariable {
  name: string;
  type: string;
  initialValue: any;
}

export interface JSXElement {
  type: string;
  props: Record<string, any>;
  children: JSXElement[];
}

export interface EventHandler {
  name: string;
  event: string;
  function: string;
}

export interface APICall {
  url: string;
  method: string;
  body: any;
}

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

/**
 * Parse a React file to extract component information
 */
export function parseReactFile(filePath: string): ReactComponent | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  // Find the main component export
  const component = findComponentExport(sourceFile);
  if (!component) {
    return null;
  }

  // Extract component information
  const props = extractProps(component);
  const jsxElements = extractJSXElements(component);
  const handlers = extractEventHandlers(component);
  const state = extractStateVariables(component);
  const apiCalls = extractAPICalls(component);

  // Determine if it's a page or component (normalize paths for Windows/Unix)
  const normalizedPath = filePath.replace(/\\/g, '/');
  const isPage = (normalizedPath.includes('/pages/') || 
                 (normalizedPath.includes('/app/') && 
                  (normalizedPath.includes('page.tsx') || normalizedPath.includes('layout.tsx'))));

  return {
    name: component.name,
    filePath,
    type: isPage ? 'page' : 'component',
    exports: component.exportType,
    props,
    state,
    elements: jsxElements,
    handlers,
    apiCalls
  };
}

interface ComponentExport {
  name: string;
  exportType: 'default' | 'named';
  node: ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression;
}

/**
 * Find the main component export in the file
 */
function findComponentExport(sourceFile: ts.SourceFile): ComponentExport | null {
  let result: ComponentExport | null = null;
  let defaultExportNode: ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression | null = null;
  let namedExports: ComponentExport[] = [];

  ts.forEachChild(sourceFile, (node) => {
    // Default export: export default function Component()
    if (ts.isFunctionDeclaration(node) && 
        node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) &&
        node.modifiers?.some(m => m.kind === ts.SyntaxKind.DefaultKeyword)) {
      result = {
        name: node.name?.text || 'default',
        exportType: 'default',
        node
      };
      return;
    }

    // Named export: export function Component()
    if (ts.isFunctionDeclaration(node) && 
        node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) &&
        !node.modifiers?.some(m => m.kind === ts.SyntaxKind.DefaultKeyword)) {
      namedExports.push({
        name: node.name?.text || 'unnamed',
        exportType: 'named',
        node
      });
      return;
    }

    // Regular function declaration (no export modifier)
    if (ts.isFunctionDeclaration(node) && !node.modifiers) {
      // Save for potential default export later
      defaultExportNode = node;
      return;
    }

    // Variable declaration with export: const Component = () => {}
    if (ts.isVariableStatement(node) && 
        node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
      const declaration = node.declarationList.declarations[0];
      if (declaration.initializer && 
          (ts.isArrowFunction(declaration.initializer) || 
           ts.isFunctionExpression(declaration.initializer))) {
        namedExports.push({
          name: declaration.name.getText(sourceFile),
          exportType: 'named',
          node: declaration.initializer as ts.ArrowFunction | ts.FunctionExpression
        });
        return;
      }
    }

    // Variable declaration without export (for potential default export)
    if (ts.isVariableStatement(node) && !node.modifiers) {
      const declaration = node.declarationList.declarations[0];
      if (declaration.initializer && 
          (ts.isArrowFunction(declaration.initializer) || 
           ts.isFunctionExpression(declaration.initializer))) {
        defaultExportNode = declaration.initializer as ts.ArrowFunction | ts.FunctionExpression;
        return;
      }
    }

    // Default export assignment: export default Component
    if (ts.isExportAssignment(node) && node.isExportEquals === false) {
      if (ts.isFunctionDeclaration(node.expression) || 
          ts.isArrowFunction(node.expression) ||
          ts.isFunctionExpression(node.expression)) {
        result = {
          name: 'default',
          exportType: 'default',
          node: node.expression as ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression
        };
        return;
      }
      
      // Default export variable: export default App
      if (ts.isIdentifier(node.expression) && defaultExportNode) {
        result = {
          name: node.expression.text,
          exportType: 'default',
          node: defaultExportNode
        };
        return;
      }
    }
  });

  // Return result if found, otherwise return first named export
  return result || (namedExports.length > 0 ? namedExports[0] : null);
}

/**
 * Extract props from component function signature
 */
function extractProps(component: ComponentExport): PropDefinition[] {
  const props: PropDefinition[] = [];
  
  if (!component.node.parameters) {
    return props;
  }

  const propsParam = component.node.parameters[0];
  if (!propsParam) {
    return props;
  }

  // Handle object destructuring: { tasks }: { tasks: Task[] }
  if (propsParam.name && ts.isObjectBindingPattern(propsParam.name)) {
    propsParam.name.elements.forEach(element => {
      if (ts.isBindingElement(element) && element.name) {
        const propName = element.name.getText();
        props.push({
          name: propName,
          type: 'unknown', // Will resolve in future slices
          required: !element.questionToken
        });
      }
    });
    return props;
  }

  // Get the type annotation for regular parameters
  if (propsParam.type && ts.isTypeReferenceNode(propsParam.type)) {
    const typeName = propsParam.type.getText();
    
    props.push({
      name: propsParam.name.getText(),
      type: typeName,
      required: !propsParam.questionToken
    });
  } else if (propsParam.type) {
    // Inline type annotation
    props.push({
      name: propsParam.name.getText(),
      type: propsParam.type.getText(),
      required: !propsParam.questionToken
    });
  }

  return props;
}

/**
 * Extract JSX elements from component body
 */
function extractJSXElements(component: ComponentExport): JSXElement[] {
  const elements: JSXElement[] = [];
  
  if (!component.node.body) {
    return elements;
  }

  // Find JSX elements in the function body
  const visit = (node: ts.Node) => {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const jsxElement = parseJSXElement(node);
      if (isSemanticElement(jsxElement.type)) {
        elements.push(jsxElement);
      }
    }
    
    ts.forEachChild(node, visit);
  };

  visit(component.node.body);
  return elements;
}

/**
 * Parse a JSX element into our simplified structure
 */
function parseJSXElement(node: ts.JsxElement | ts.JsxSelfClosingElement): JSXElement {
  const tagName = ts.isJsxSelfClosingElement(node) 
    ? node.tagName.getText()
    : node.openingElement.tagName.getText();

  const props: Record<string, any> = {};
  const children: JSXElement[] = [];

  if (ts.isJsxElement(node)) {
    // Extract props from opening element
    node.openingElement.attributes.properties.forEach(prop => {
      if (ts.isJsxAttribute(prop)) {
        const name = prop.name.getText();
        const value = prop.initializer?.getText() || 'true';
        props[name] = value.replace(/['"]/g, ''); // Remove quotes
      }
    });

    // Process children
    node.children.forEach(child => {
      if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) {
        children.push(parseJSXElement(child));
      }
    });
  } else {
    // Self-closing element
    node.attributes.properties.forEach(prop => {
      if (ts.isJsxAttribute(prop)) {
        const name = prop.name.getText();
        const value = prop.initializer?.getText() || 'true';
        props[name] = value.replace(/['"]/g, '');
      }
    });
  }

  return {
    type: tagName,
    props,
    children
  };
}

/**
 * Check if this is a semantic element we care about for ShepLang conversion
 */
function isSemanticElement(tagName: string): boolean {
  const semanticElements = [
    'button', 'Button',
    'form', 'Form',
    'input', 'Input',
    'select', 'Select',
    'textarea', 'Textarea',
    'ul', 'ol', 'li', 'list', 'List',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'header', 'main', 'section', 'article', 'aside',
    'div' // Include basic layout for now
  ];
  
  return semanticElements.includes(tagName);
}

/**
 * Extract event handlers from component body
 */
function extractEventHandlers(component: ComponentExport): EventHandler[] {
  const handlers: EventHandler[] = [];
  
  if (!component.node.body) {
    return handlers;
  }

  const visit = (node: ts.Node) => {
    // Look for onClick, onSubmit, etc. in JSX attributes
    if (ts.isJsxAttribute(node)) {
      const name = node.name.getText();
      if (name.startsWith('on') && name.length > 2) {
        const event = name.substring(2).toLowerCase();
        const functionName = node.initializer?.getText() || '';
        handlers.push({
          name: name,
          event,
          function: functionName.replace(/[{}]/g, '').trim()
        });
      }
    }
    
    ts.forEachChild(node, visit);
  };

  visit(component.node.body);
  return handlers;
}

/**
 * Extract state variables (useState hooks)
 */
function extractStateVariables(component: ComponentExport): StateVariable[] {
  const state: StateVariable[] = [];
  
  if (!component.node.body) {
    return state;
  }

  const visit = (node: ts.Node) => {
    // Look for useState calls
    if (ts.isCallExpression(node) && 
        ts.isIdentifier(node.expression) &&
        node.expression.text === 'useState') {
      
      const variableDeclaration = node.parent?.parent;
      if (ts.isVariableDeclaration(variableDeclaration)) {
        const varName = variableDeclaration.name.getText();
        const typeArg = node.typeArguments?.[0]?.getText() || 'any';
        const initialValue = node.arguments?.[0]?.getText() || 'undefined';
        
        state.push({
          name: varName,
          type: typeArg,
          initialValue
        });
      }
    }
    
    ts.forEachChild(node, visit);
  };

  visit(component.node.body);
  return state;
}

/**
 * Extract API calls (fetch, axios, etc.)
 */
function extractAPICalls(component: ComponentExport): APICall[] {
  const apiCalls: APICall[] = [];
  
  if (!component.node.body) {
    return apiCalls;
  }

  const visit = (node: ts.Node) => {
    // Look for fetch calls
    if (ts.isCallExpression(node) && 
        ts.isIdentifier(node.expression) &&
        node.expression.text === 'fetch') {
      
      const url = node.arguments?.[0]?.getText() || '';
      const method = 'GET'; // Default, would need more complex analysis for other methods
      
      apiCalls.push({
        url: url.replace(/['"]/g, ''),
        method,
        body: null
      });
    }
    
    ts.forEachChild(node, visit);
  };

  visit(component.node.body);
  return apiCalls;
}

/**
 * Parse a React project to extract all components
 */
export function parseReactProject(projectRoot: string): ReactComponent[] {
  // This will be implemented in later slices
  // For now, return empty array
  return [];
}

/**
 * Find API calls in a React component
 */
export function findApiCalls(component: ReactComponent): APICall[] {
  return component.apiCalls || [];
}

/**
 * Find form submissions in a React component
 */
export function findFormSubmissions(component: ReactComponent): any[] {
  return [];
}

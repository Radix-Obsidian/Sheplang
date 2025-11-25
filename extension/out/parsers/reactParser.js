"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseReactFile = parseReactFile;
exports.parseReactProject = parseReactProject;
exports.findApiCalls = findApiCalls;
exports.findFormSubmissions = findFormSubmissions;
const ts = __importStar(require("typescript"));
const fs = __importStar(require("fs"));
/**
 * Parse a React file to extract component information
 */
function parseReactFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    const sourceCode = fs.readFileSync(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(filePath, sourceCode, ts.ScriptTarget.Latest, true);
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
    // Phase 5: Extract effects
    const effects = extractEffects(component);
    // Phase 6: Extract imports and child components
    const imports = extractComponentImports(sourceFile);
    const childComponents = extractChildComponents(jsxElements);
    // Phase 7: Extract styles
    const styles = extractStyles(jsxElements);
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
        apiCalls,
        effects,
        imports,
        childComponents,
        styles
    };
}
/**
 * Next.js server-side function names that are NOT React components
 * These should be skipped when looking for the main component
 */
const NEXTJS_SERVER_FUNCTIONS = new Set([
    'handler',
    'getServerSideProps',
    'getStaticProps',
    'getStaticPaths',
    'middleware',
    'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS' // App Router route handlers
]);
/**
 * Check if a name looks like a React component (PascalCase)
 */
function isComponentName(name) {
    return /^[A-Z][a-zA-Z0-9]*$/.test(name);
}
/**
 * Find the main component export in the file
 * FIXED: Prioritize PascalCase exports (actual React components)
 * FIXED: Skip Next.js server functions (handler, getServerSideProps, etc.)
 */
function findComponentExport(sourceFile) {
    let result = null;
    let defaultExportNode = null;
    let namedExports = [];
    let defaultExportName = null;
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
                    node: declaration.initializer
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
                defaultExportNode = declaration.initializer;
                return;
            }
        }
        // Default export assignment: export default Component
        // Note: isExportEquals is undefined for `export default X`, false for `export = X`
        if (ts.isExportAssignment(node) && !node.isExportEquals) {
            if (ts.isFunctionDeclaration(node.expression) ||
                ts.isArrowFunction(node.expression) ||
                ts.isFunctionExpression(node.expression)) {
                result = {
                    name: 'default',
                    exportType: 'default',
                    node: node.expression
                };
                return;
            }
            // Default export variable: export default App
            if (ts.isIdentifier(node.expression) && defaultExportNode) {
                defaultExportName = node.expression.text;
                result = {
                    name: node.expression.text,
                    exportType: 'default',
                    node: defaultExportNode
                };
                return;
            }
        }
    });
    // FIXED: Prioritize PascalCase React components over Next.js server functions
    // Cast result for type safety
    const foundResult = result;
    // 1. If result is a PascalCase component, use it
    if (foundResult && isComponentName(foundResult.name) && !NEXTJS_SERVER_FUNCTIONS.has(foundResult.name)) {
        return foundResult;
    }
    // 2. Look for a PascalCase named export (actual React component)
    const componentExport = namedExports.find(e => isComponentName(e.name) && !NEXTJS_SERVER_FUNCTIONS.has(e.name));
    if (componentExport) {
        return componentExport;
    }
    // 3. If result is a server function, try to get component name from file
    if (foundResult && NEXTJS_SERVER_FUNCTIONS.has(foundResult.name)) {
        // Get filename as component name
        const fileName = sourceFile.fileName;
        const baseName = fileName.split(/[/\\]/).pop()?.replace(/\.(tsx?|jsx?)$/, '') || 'Component';
        // Skip API route files entirely
        if (fileName.includes('/api/') || fileName.includes('\\api\\')) {
            return null; // API routes are not React components
        }
        // Use PascalCase version of filename
        const componentName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
        if (isComponentName(componentName)) {
            return {
                name: componentName,
                exportType: foundResult.exportType,
                node: foundResult.node
            };
        }
    }
    // 4. Fall back to result or first named export
    return foundResult || (namedExports.length > 0 ? namedExports[0] : null);
}
/**
 * Extract props from component function signature
 */
function extractProps(component) {
    const props = [];
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
                    required: true // Default to required for destructured props
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
    }
    else if (propsParam.type) {
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
function extractJSXElements(component) {
    const elements = [];
    if (!component.node.body) {
        return elements;
    }
    // Find JSX elements in the function body
    const visit = (node) => {
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
 * FIX: Now extracts text content from JSXText children
 */
function parseJSXElement(node) {
    const tagName = ts.isJsxSelfClosingElement(node)
        ? node.tagName.getText()
        : node.openingElement.tagName.getText();
    const props = {};
    const children = [];
    let textContent = '';
    if (ts.isJsxElement(node)) {
        // Extract props from opening element
        node.openingElement.attributes.properties.forEach(prop => {
            if (ts.isJsxAttribute(prop)) {
                const name = prop.name.getText();
                const value = prop.initializer?.getText() || 'true';
                props[name] = value.replace(/['"]/g, ''); // Remove quotes
            }
        });
        // Process children - FIX: Now handles JSXText
        node.children.forEach(child => {
            if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) {
                children.push(parseJSXElement(child));
            }
            else if (ts.isJsxText(child)) {
                // FIX: Extract text content from JSXText nodes
                const text = child.text.trim();
                if (text) {
                    textContent += (textContent ? ' ' : '') + text;
                }
            }
            else if (ts.isJsxExpression(child) && child.expression) {
                // Handle expressions like {title} or {user.name}
                const exprText = child.expression.getText();
                if (exprText && !exprText.includes('(')) { // Skip function calls
                    textContent += (textContent ? ' ' : '') + `{${exprText}}`;
                }
            }
        });
    }
    else {
        // Self-closing element
        node.attributes.properties.forEach(prop => {
            if (ts.isJsxAttribute(prop)) {
                const name = prop.name.getText();
                const value = prop.initializer?.getText() || 'true';
                props[name] = value.replace(/['"]/g, '');
            }
        });
    }
    const result = {
        type: tagName,
        props,
        children
    };
    // Only include textContent if it exists
    if (textContent) {
        result.textContent = textContent;
    }
    return result;
}
/**
 * Check if this is a semantic element we care about for ShepLang conversion
 */
function isSemanticElement(tagName) {
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
 * PHASE 1: Now extracts FULL function bodies for faithful translation
 */
function extractEventHandlers(component) {
    const handlers = [];
    if (!component.node.body) {
        return handlers;
    }
    // First, collect all function declarations in the component
    const functionDeclarations = collectFunctionDeclarations(component.node.body);
    const visit = (node) => {
        // Look for onClick, onSubmit, etc. in JSX attributes
        if (ts.isJsxAttribute(node)) {
            const name = node.name.getText();
            if (name.startsWith('on') && name.length > 2) {
                const event = name.substring(2).toLowerCase();
                const handler = extractHandlerDetails(node, functionDeclarations);
                handlers.push({
                    name: name,
                    event,
                    function: handler.functionRef,
                    isInline: handler.isInline,
                    functionBody: handler.body,
                    parameters: handler.parameters
                });
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(component.node.body);
    return handlers;
}
/**
 * Collect all function declarations in a component body
 * Maps function name -> { node, body text, parameters }
 */
function collectFunctionDeclarations(body) {
    const declarations = new Map();
    const visit = (node) => {
        // const handleSubmit = async (e) => { ... }
        if (ts.isVariableDeclaration(node) &&
            ts.isIdentifier(node.name) &&
            node.initializer &&
            (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) {
            const funcName = node.name.text;
            const func = node.initializer;
            const bodyText = extractFunctionBodyText(func);
            const params = extractParameterNames(func);
            declarations.set(funcName, { body: bodyText, params });
        }
        // function handleSubmit(e) { ... }
        if (ts.isFunctionDeclaration(node) && node.name) {
            const funcName = node.name.text;
            const bodyText = extractFunctionBodyText(node);
            const params = extractParameterNames(node);
            declarations.set(funcName, { body: bodyText, params });
        }
        ts.forEachChild(node, visit);
    };
    visit(body);
    return declarations;
}
/**
 * Extract handler details from a JSX attribute
 */
function extractHandlerDetails(attr, functionDeclarations) {
    const initializer = attr.initializer;
    if (!initializer) {
        return { functionRef: '', isInline: false };
    }
    // Handle {expression}
    if (ts.isJsxExpression(initializer) && initializer.expression) {
        const expr = initializer.expression;
        // Inline arrow function: onClick={() => { ... }}
        if (ts.isArrowFunction(expr) || ts.isFunctionExpression(expr)) {
            const bodyText = extractFunctionBodyText(expr);
            const params = extractParameterNames(expr);
            return {
                functionRef: '(inline)',
                isInline: true,
                body: bodyText,
                parameters: params
            };
        }
        // Function reference: onClick={handleSubmit}
        if (ts.isIdentifier(expr)) {
            const funcName = expr.text;
            const declaration = functionDeclarations.get(funcName);
            return {
                functionRef: funcName,
                isInline: false,
                body: declaration?.body,
                parameters: declaration?.params
            };
        }
        // Inline call: onClick={() => handleSubmit(id)}
        if (ts.isCallExpression(expr)) {
            // Get the full expression for now
            return {
                functionRef: expr.getText(),
                isInline: true,
                body: expr.getText(),
                parameters: []
            };
        }
        // Arrow wrapping a call: onClick={() => handleDelete(task.id)}
        // Already handled by arrow function case above
    }
    return { functionRef: initializer.getText().replace(/[{}]/g, '').trim(), isInline: false };
}
/**
 * Extract the body text of a function for faithful translation
 */
function extractFunctionBodyText(func) {
    if (!func.body)
        return '';
    // Arrow function with expression body: () => doSomething()
    if (ts.isArrowFunction(func) && !ts.isBlock(func.body)) {
        return func.body.getText();
    }
    // Block body: { ... }
    if (ts.isBlock(func.body)) {
        // Get the statements inside, removing outer braces
        const statements = func.body.statements;
        return statements.map(s => s.getText()).join('\n');
    }
    return func.body.getText();
}
/**
 * Extract parameter names from a function
 */
function extractParameterNames(func) {
    return func.parameters.map(p => {
        if (ts.isIdentifier(p.name)) {
            return p.name.text;
        }
        // Object destructuring
        if (ts.isObjectBindingPattern(p.name)) {
            return p.name.elements.map(e => {
                if (ts.isBindingElement(e) && ts.isIdentifier(e.name)) {
                    return e.name.text;
                }
                return '';
            }).filter(Boolean).join(', ');
        }
        return p.name.getText();
    });
}
/**
 * Extract state variables (useState hooks)
 */
function extractStateVariables(component) {
    const state = [];
    if (!component.node.body) {
        return state;
    }
    const visit = (node) => {
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
function extractAPICalls(component) {
    const apiCalls = [];
    if (!component.node.body) {
        return apiCalls;
    }
    const visit = (node) => {
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
function parseReactProject(projectRoot) {
    // This will be implemented in later slices
    // For now, return empty array
    return [];
}
/**
 * Find API calls in a React component
 */
function findApiCalls(component) {
    return component.apiCalls || [];
}
/**
 * Find form submissions in a React component
 */
function findFormSubmissions(component) {
    return [];
}
/**
 * Phase 5: Extract useEffect and other hooks
 */
function extractEffects(component) {
    const effects = [];
    if (!component.node.body) {
        return effects;
    }
    const visit = (node) => {
        // Look for useEffect, useLayoutEffect, useMemo, useCallback
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
            const hookName = node.expression.text;
            if (['useEffect', 'useLayoutEffect', 'useMemo', 'useCallback'].includes(hookName)) {
                const effect = {
                    dependencies: [],
                    body: '',
                    type: hookName === 'useEffect' ? 'effect'
                        : hookName === 'useLayoutEffect' ? 'layoutEffect'
                            : hookName === 'useMemo' ? 'memo' : 'callback'
                };
                // Extract callback body
                const callbackArg = node.arguments[0];
                if (callbackArg && (ts.isArrowFunction(callbackArg) || ts.isFunctionExpression(callbackArg))) {
                    if (callbackArg.body) {
                        if (ts.isBlock(callbackArg.body)) {
                            effect.body = callbackArg.body.statements.map(s => s.getText()).join('\n');
                            // Check for cleanup (return statement with function)
                            const returnStmt = callbackArg.body.statements.find(ts.isReturnStatement);
                            if (returnStmt?.expression &&
                                (ts.isArrowFunction(returnStmt.expression) || ts.isFunctionExpression(returnStmt.expression))) {
                                effect.cleanup = returnStmt.expression.getText();
                            }
                        }
                        else {
                            effect.body = callbackArg.body.getText();
                        }
                    }
                }
                // Extract dependencies array
                const depsArg = node.arguments[1];
                if (depsArg && ts.isArrayLiteralExpression(depsArg)) {
                    effect.dependencies = depsArg.elements.map(e => e.getText());
                }
                effects.push(effect);
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(component.node.body);
    return effects;
}
/**
 * Phase 6: Extract component imports
 */
function extractComponentImports(sourceFile) {
    const imports = [];
    ts.forEachChild(sourceFile, node => {
        if (ts.isImportDeclaration(node)) {
            const source = node.moduleSpecifier.getText().replace(/['"]/g, '');
            // Skip non-component imports (libraries, hooks, etc.)
            if (source.startsWith('.') || source.startsWith('@/')) {
                const importClause = node.importClause;
                if (importClause) {
                    // Default import
                    if (importClause.name) {
                        const name = importClause.name.text;
                        // Only include if it looks like a component (PascalCase)
                        if (/^[A-Z]/.test(name)) {
                            imports.push({
                                name,
                                source,
                                isDefault: true
                            });
                        }
                    }
                    // Named imports
                    if (importClause.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
                        for (const element of importClause.namedBindings.elements) {
                            const name = element.name.text;
                            // Only include if it looks like a component (PascalCase)
                            if (/^[A-Z]/.test(name)) {
                                imports.push({
                                    name,
                                    source,
                                    isDefault: false
                                });
                            }
                        }
                    }
                }
            }
        }
    });
    return imports;
}
/**
 * Phase 6: Extract child components from JSX elements
 */
function extractChildComponents(elements) {
    const components = new Set();
    const visit = (element) => {
        // PascalCase tags are components
        if (/^[A-Z]/.test(element.type)) {
            components.add(element.type);
        }
        // Recurse into children
        for (const child of element.children) {
            visit(child);
        }
    };
    for (const element of elements) {
        visit(element);
    }
    return Array.from(components);
}
/**
 * Phase 7: Extract styles from JSX elements
 */
function extractStyles(elements) {
    const styles = [];
    let counter = 0;
    const visit = (element) => {
        // Extract className and style from props
        const className = element.props.className;
        const inlineStyle = element.props.style;
        // Only add if there's actual styling
        if (className || inlineStyle) {
            const style = {
                elementName: `${element.type}_${counter++}`
            };
            if (className) {
                style.className = typeof className === 'string' ? className : String(className);
                // Extract individual Tailwind classes
                style.tailwindClasses = style.className.split(/\s+/).filter(Boolean);
            }
            if (inlineStyle) {
                style.inlineStyles = parseInlineStyleObject(inlineStyle);
            }
            styles.push(style);
        }
        // Recurse into children
        for (const child of element.children) {
            visit(child);
        }
    };
    for (const element of elements) {
        visit(element);
    }
    return styles;
}
/**
 * Parse inline style object or string
 */
function parseInlineStyleObject(style) {
    if (typeof style === 'string') {
        // Parse CSS string
        const result = {};
        // Remove quotes and braces that might be in the raw text
        const cleaned = style.replace(/[{}'"]/g, '');
        const parts = cleaned.split(/[,;]/).filter(Boolean);
        for (const part of parts) {
            const colonIndex = part.indexOf(':');
            if (colonIndex > 0) {
                const key = part.slice(0, colonIndex).trim();
                const value = part.slice(colonIndex + 1).trim();
                if (key && value) {
                    result[key] = value;
                }
            }
        }
        return result;
    }
    if (typeof style === 'object' && style !== null) {
        const result = {};
        for (const [key, value] of Object.entries(style)) {
            result[key] = String(value);
        }
        return result;
    }
    return {};
}
//# sourceMappingURL=reactParser.js.map
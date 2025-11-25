/**
 * View & Action Mapper for Slice 4
 * 
 * Converts React components to ShepLang views and actions:
 * - JSX elements → ShepLang widgets (button, form, list, etc.)
 * - Event handlers → ShepLang actions
 * - API calls → call/load operations
 * 
 * Phase 3: Now uses codeTranslator for FAITHFUL translation
 */

import {
  ShepLangView,
  ShepLangWidget,
  ShepLangAction,
  ActionOperation,
  ViewBinding,
  ViewActionMapping,
  ProjectMapping
} from '../types/ViewAction';
import { ReactComponent, JSXElement, EventHandler, APICall } from './reactParser';
import { Entity } from '../types/Entity';
import { translateFunctionBody, generateShepLangCode, SkippedItem } from './codeTranslator';

/**
 * Map a React component to ShepLang view and actions
 */
export function mapComponentToView(
  component: ReactComponent,
  entities: Entity[] = []
): ViewActionMapping {
  const entityNames = new Set(entities.map(e => e.name.toLowerCase()));
  
  // Create the view
  const view: ShepLangView = {
    name: component.name,
    kind: component.type,
    route: extractRoute(component.filePath),
    widgets: mapElements(component.elements, component.handlers, entityNames),
    bindings: extractBindings(component.state, entityNames),
    props: component.props.map(p => p.name)
  };

  // Create actions from handlers
  const actions = mapHandlersToActions(
    component.handlers,
    component.apiCalls,
    component.name,
    entityNames
  );

  return { view, actions };
}

/**
 * Map multiple components to a complete project mapping
 */
export function mapProjectToShepLang(
  components: ReactComponent[],
  entities: Entity[] = []
): ProjectMapping {
  const views: ShepLangView[] = [];
  const actions: ShepLangAction[] = [];
  const referencedEntities = new Set<string>();
  const warnings: string[] = [];

  for (const component of components) {
    try {
      const mapping = mapComponentToView(component, entities);
      views.push(mapping.view);
      actions.push(...mapping.actions);

      // Track referenced entities
      for (const binding of mapping.view.bindings) {
        referencedEntities.add(binding.entity);
      }
      for (const widget of mapping.view.widgets) {
        if (widget.entity) {
          referencedEntities.add(widget.entity);
        }
      }
    } catch (error) {
      warnings.push(`Failed to map ${component.name}: ${error}`);
    }
  }

  // Calculate confidence based on successful mappings
  const successRate = (components.length - warnings.length) / Math.max(components.length, 1);
  const hasEntities = entities.length > 0 ? 0.2 : 0;
  const confidence = Math.min(successRate * 0.8 + hasEntities, 1.0);

  return {
    views,
    actions,
    entities: Array.from(referencedEntities),
    confidence,
    warnings
  };
}

/**
 * Extract route from file path
 */
function extractRoute(filePath: string): string | undefined {
  const normalized = filePath.replace(/\\/g, '/');
  
  // Next.js App Router: app/dashboard/page.tsx → /dashboard
  const appMatch = normalized.match(/\/app\/(.*)\/page\.tsx?$/);
  if (appMatch) {
    const route = appMatch[1];
    return route === '' ? '/' : `/${route}`;
  }
  
  // Next.js root page: app/page.tsx → /
  if (normalized.includes('/app/page.tsx')) {
    return '/';
  }
  
  // Next.js Pages Router: pages/dashboard.tsx → /dashboard
  const pagesMatch = normalized.match(/\/pages\/(.*)\.tsx?$/);
  if (pagesMatch) {
    const route = pagesMatch[1];
    if (route === 'index') return '/';
    return `/${route}`;
  }

  return undefined;
}

/**
 * Map JSX elements to ShepLang widgets
 */
function mapElements(
  elements: JSXElement[],
  handlers: EventHandler[],
  entityNames: Set<string>
): ShepLangWidget[] {
  const widgets: ShepLangWidget[] = [];
  const handlerMap = new Map(handlers.map(h => [h.function, h]));

  for (const element of elements) {
    const widget = mapElement(element, handlerMap, entityNames);
    if (widget) {
      widgets.push(widget);
    }
  }

  return widgets;
}

/**
 * Map a single JSX element to a ShepLang widget
 */
function mapElement(
  element: JSXElement,
  handlerMap: Map<string, EventHandler>,
  entityNames: Set<string>
): ShepLangWidget | null {
  const type = element.type.toLowerCase();

  // Button elements
  if (type === 'button' || element.props.onClick) {
    return mapButton(element, handlerMap);
  }

  // Form elements
  if (type === 'form') {
    return mapForm(element, handlerMap, entityNames);
  }

  // List elements
  if (type === 'ul' || type === 'ol' || type === 'list') {
    return mapList(element, entityNames);
  }

  // Input elements
  if (type === 'input' || type === 'textarea' || type === 'select') {
    return mapInput(element);
  }

  // Heading/text elements
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'label'].includes(type)) {
    return mapText(element);
  }

  // Link elements
  if (type === 'a' || type === 'link') {
    return mapLink(element);
  }

  // Container elements with children
  if (['div', 'main', 'section', 'article', 'header', 'footer', 'aside'].includes(type)) {
    return mapContainer(element, handlerMap, entityNames);
  }

  return null;
}

/**
 * Map button element
 */
function mapButton(
  element: JSXElement,
  handlerMap: Map<string, EventHandler>
): ShepLangWidget {
  const label = extractButtonLabel(element);
  const handler = element.props.onClick;
  const actionName = handler ? inferActionName(handler, handlerMap) : undefined;

  return {
    type: 'button',
    label,
    action: actionName,
    className: element.props.className
  };
}

/**
 * Map form element
 */
function mapForm(
  element: JSXElement,
  handlerMap: Map<string, EventHandler>,
  entityNames: Set<string>
): ShepLangWidget {
  const handler = element.props.onSubmit;
  const actionName = handler ? inferActionName(handler, handlerMap) : undefined;
  
  // Try to infer entity from form context
  const entity = inferEntityFromContext(element, entityNames);
  
  // Extract field names from child inputs
  const fields = extractFormFields(element);

  return {
    type: 'form',
    action: actionName,
    entity,
    fields,
    className: element.props.className,
    children: mapChildElements(element.children, handlerMap, entityNames)
  };
}

/**
 * Map list element
 */
function mapList(
  element: JSXElement,
  entityNames: Set<string>
): ShepLangWidget {
  // Try to infer entity from list context
  const entity = inferEntityFromContext(element, entityNames);

  return {
    type: 'list',
    entity,
    className: element.props.className,
    children: mapChildElements(element.children, new Map(), entityNames)
  };
}

/**
 * Map input element
 */
function mapInput(element: JSXElement): ShepLangWidget {
  return {
    type: 'input',
    label: element.props.placeholder || element.props.name,
    fields: element.props.name ? [element.props.name] : undefined,
    className: element.props.className
  };
}

/**
 * Map text element
 */
function mapText(element: JSXElement): ShepLangWidget {
  // Try to extract text content (simplified)
  const label = element.props.children || element.type.toUpperCase();
  
  return {
    type: 'text',
    label: typeof label === 'string' ? label : undefined,
    className: element.props.className
  };
}

/**
 * Map link element
 */
function mapLink(element: JSXElement): ShepLangWidget {
  return {
    type: 'link',
    label: element.props.children || 'Link',
    href: element.props.href,
    className: element.props.className
  };
}

/**
 * Map container element
 */
function mapContainer(
  element: JSXElement,
  handlerMap: Map<string, EventHandler>,
  entityNames: Set<string>
): ShepLangWidget {
  return {
    type: 'container',
    className: element.props.className,
    children: mapChildElements(element.children, handlerMap, entityNames)
  };
}

/**
 * Map child elements recursively
 */
function mapChildElements(
  children: JSXElement[],
  handlerMap: Map<string, EventHandler>,
  entityNames: Set<string>
): ShepLangWidget[] {
  const widgets: ShepLangWidget[] = [];
  
  for (const child of children) {
    const widget = mapElement(child, handlerMap, entityNames);
    if (widget) {
      widgets.push(widget);
    }
  }
  
  return widgets;
}

/**
 * Extract button label from element
 */
function extractButtonLabel(element: JSXElement): string {
  // Check for explicit label prop
  if (element.props.children && typeof element.props.children === 'string') {
    return element.props.children;
  }
  
  // Check for aria-label
  if (element.props['aria-label']) {
    return element.props['aria-label'];
  }
  
  // Default based on context
  return 'Button';
}

/**
 * Infer action name from handler reference
 */
function inferActionName(
  handlerRef: string,
  handlerMap: Map<string, EventHandler>
): string {
  // Clean up the handler reference
  const cleanRef = handlerRef.replace(/[{}()]/g, '').trim();
  
  // Check if we have a matching handler
  const handler = handlerMap.get(cleanRef);
  if (handler) {
    return formatActionName(handler.function);
  }
  
  // Generate action name from reference
  return formatActionName(cleanRef);
}

/**
 * Format a handler name as a ShepLang action name
 */
function formatActionName(name: string): string {
  // CRITICAL: Extract function name from complex signatures
  // e.g., "(event) => void handleUserCreate(event as AddUserFormEvent, setError)" -> "handleUserCreate"
  // e.g., "handleUserCreate" -> "handleUserCreate"
  // e.g., "() => handleClick()" -> "handleClick"
  
  let actionName = name;
  
  // Try to extract function name from arrow function or complex signature
  // Pattern 1: Look for a named function call like "handleSomething("
  const funcCallMatch = name.match(/\b(handle\w+|on\w+|\w+Handler)\s*\(/i);
  if (funcCallMatch) {
    actionName = funcCallMatch[1];
  } else {
    // Pattern 2: Look for standalone identifier (not arrow function syntax)
    const identifierMatch = name.match(/^(\w+)$/);
    if (identifierMatch) {
      actionName = identifierMatch[1];
    } else {
      // Pattern 3: Extract any reasonable identifier from the mess
      const anyIdentifierMatch = name.match(/\b([a-zA-Z_][a-zA-Z0-9_]*(?:Handler|Action|Submit|Click|Create|Update|Delete|Save|Load|Fetch))\b/i);
      if (anyIdentifierMatch) {
        actionName = anyIdentifierMatch[1];
      } else {
        // Last resort: just get the first word-like thing
        const firstWordMatch = name.match(/\b([a-zA-Z_][a-zA-Z0-9_]{2,})\b/);
        actionName = firstWordMatch ? firstWordMatch[1] : 'Action';
      }
    }
  }
  
  // Remove common prefixes
  actionName = actionName
    .replace(/^handle/i, '')
    .replace(/^on/i, '');
  
  // Ensure PascalCase
  if (actionName.length > 0) {
    actionName = actionName.charAt(0).toUpperCase() + actionName.slice(1);
  }
  
  // Sanitize: only allow alphanumeric and underscore
  actionName = actionName.replace(/[^a-zA-Z0-9_]/g, '');
  
  return actionName || 'Action';
}

/**
 * Infer entity name from element context
 */
function inferEntityFromContext(
  element: JSXElement,
  entityNames: Set<string>
): string | undefined {
  // Check className for entity hints
  const className = element.props.className || '';
  for (const entity of entityNames) {
    if (className.toLowerCase().includes(entity)) {
      return capitalizeFirst(entity);
    }
  }
  
  // Check for data attributes
  if (element.props['data-entity']) {
    return element.props['data-entity'];
  }
  
  return undefined;
}

/**
 * Extract form field names from child inputs
 */
function extractFormFields(element: JSXElement): string[] {
  const fields: string[] = [];
  
  const visitChildren = (children: JSXElement[]) => {
    for (const child of children) {
      if (['input', 'textarea', 'select'].includes(child.type.toLowerCase())) {
        if (child.props.name) {
          fields.push(child.props.name);
        }
      }
      if (child.children) {
        visitChildren(child.children);
      }
    }
  };
  
  visitChildren(element.children);
  return fields;
}

/**
 * Extract state bindings
 */
function extractBindings(
  state: ReactComponent['state'],
  entityNames: Set<string>
): ViewBinding[] {
  const bindings: ViewBinding[] = [];
  
  for (const stateVar of state) {
    // Check if state type matches an entity
    const typeMatch = stateVar.type.match(/(\w+)\[\]/);
    if (typeMatch) {
      const entityName = typeMatch[1];
      if (entityNames.has(entityName.toLowerCase())) {
        bindings.push({
          variable: stateVar.name,
          entity: entityName,
          type: 'list'
        });
      }
    }
  }
  
  return bindings;
}

/**
 * Map event handlers to ShepLang actions
 */
function mapHandlersToActions(
  handlers: EventHandler[],
  apiCalls: APICall[],
  componentName: string,
  entityNames: Set<string>
): ShepLangAction[] {
  const actions: ShepLangAction[] = [];
  const processedHandlers = new Set<string>();

  for (const handler of handlers) {
    if (processedHandlers.has(handler.function)) continue;
    processedHandlers.add(handler.function);

    const action = mapHandlerToAction(handler, apiCalls, entityNames);
    if (action) {
      actions.push(action);
    }
  }

  return actions;
}

/**
 * Map a single handler to a ShepLang action
 * Phase 3: Now includes FAITHFUL translation of handler body
 */
function mapHandlerToAction(
  handler: EventHandler,
  apiCalls: APICall[],
  entityNames: Set<string>
): ShepLangAction | null {
  const operations: ActionOperation[] = [];

  // Find API calls associated with this handler (simplified matching)
  for (const apiCall of apiCalls) {
    const operation = mapApiCallToOperation(apiCall, entityNames);
    if (operation) {
      operations.push(operation);
    }
  }

  // If no operations found, create a placeholder
  if (operations.length === 0) {
    // Infer operation from handler name
    const inferredOp = inferOperationFromName(handler.function, entityNames);
    if (inferredOp) {
      operations.push(inferredOp);
    }
  }

  // Phase 3: FAITHFUL TRANSLATION using codeTranslator
  let translatedCode: string | undefined;
  let translationConfidence: number | undefined;
  
  if (handler.functionBody) {
    try {
      const translation = translateFunctionBody(handler.functionBody);
      if (translation.statements.length > 0 || translation.skipped.length > 0) {
        // Pass skipped items for transparency summary
        translatedCode = generateShepLangCode(translation.statements, 1, translation.skipped);
        translationConfidence = translation.confidence;
      }
    } catch (error) {
      // Fallback to operations-based generation if translation fails
      console.warn(`[ViewMapper] Translation failed for ${handler.function}:`, error);
    }
  }

  return {
    name: formatActionName(handler.function),
    trigger: mapEventToTrigger(handler.event),
    params: handler.parameters?.map(p => ({ name: p, type: 'any', required: true })) || [],
    operations,
    sourceHandler: handler.function,
    functionBody: handler.functionBody,
    translatedCode,
    translationConfidence
  };
}

/**
 * Map API call to ShepLang operation
 */
function mapApiCallToOperation(
  apiCall: APICall,
  entityNames: Set<string>
): ActionOperation | null {
  const method = apiCall.method.toUpperCase();
  
  // Determine operation kind based on HTTP method
  if (method === 'GET') {
    return {
      kind: 'load',
      endpoint: apiCall.url,
      method: 'GET',
      variable: inferVariableFromUrl(apiCall.url)
    };
  }
  
  if (method === 'POST') {
    return {
      kind: 'call',
      endpoint: apiCall.url,
      method: 'POST',
      entity: inferEntityFromUrl(apiCall.url, entityNames)
    };
  }
  
  if (method === 'PUT' || method === 'PATCH') {
    return {
      kind: 'call',
      endpoint: apiCall.url,
      method,
      entity: inferEntityFromUrl(apiCall.url, entityNames)
    };
  }
  
  if (method === 'DELETE') {
    return {
      kind: 'call',
      endpoint: apiCall.url,
      method: 'DELETE',
      entity: inferEntityFromUrl(apiCall.url, entityNames)
    };
  }
  
  return null;
}

/**
 * Infer operation from handler name
 */
function inferOperationFromName(
  handlerName: string,
  entityNames: Set<string>
): ActionOperation | null {
  const lowerName = handlerName.toLowerCase();
  
  // Add/Create operations
  if (lowerName.includes('add') || lowerName.includes('create') || lowerName.includes('new')) {
    const entity = inferEntityFromHandlerName(handlerName, entityNames);
    return { kind: 'add', entity };
  }
  
  // Update operations
  if (lowerName.includes('update') || lowerName.includes('edit') || lowerName.includes('save')) {
    const entity = inferEntityFromHandlerName(handlerName, entityNames);
    return { kind: 'update', entity };
  }
  
  // Delete/Remove operations
  if (lowerName.includes('delete') || lowerName.includes('remove')) {
    const entity = inferEntityFromHandlerName(handlerName, entityNames);
    return { kind: 'remove', entity };
  }
  
  // Navigation operations
  if (lowerName.includes('navigate') || lowerName.includes('goto') || lowerName.includes('redirect')) {
    return { kind: 'show' };
  }
  
  // Load/Fetch operations
  if (lowerName.includes('load') || lowerName.includes('fetch') || lowerName.includes('get')) {
    return { kind: 'load' };
  }
  
  return null;
}

/**
 * Infer entity name from handler name
 */
function inferEntityFromHandlerName(
  handlerName: string,
  entityNames: Set<string>
): string | undefined {
  const lowerName = handlerName.toLowerCase();
  
  for (const entity of entityNames) {
    if (lowerName.includes(entity)) {
      return capitalizeFirst(entity);
    }
  }
  
  return undefined;
}

/**
 * Infer entity from URL path
 */
function inferEntityFromUrl(
  url: string,
  entityNames: Set<string>
): string | undefined {
  const lowerUrl = url.toLowerCase();
  
  for (const entity of entityNames) {
    if (lowerUrl.includes(entity) || lowerUrl.includes(entity + 's')) {
      return capitalizeFirst(entity);
    }
  }
  
  return undefined;
}

/**
 * Infer variable name from URL
 */
function inferVariableFromUrl(url: string): string {
  // Extract last path segment as variable name
  const segments = url.replace(/['"]/g, '').split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] || 'data';
  return lastSegment.replace(/[^a-zA-Z]/g, '');
}

/**
 * Map event type to trigger
 */
function mapEventToTrigger(event: string): ShepLangAction['trigger'] {
  switch (event.toLowerCase()) {
    case 'click':
      return 'click';
    case 'submit':
      return 'submit';
    case 'change':
      return 'change';
    default:
      return 'custom';
  }
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate ShepLang code from views and actions
 */
export function generateShepLangViewCode(mapping: ProjectMapping): string {
  const lines: string[] = [];

  // Generate views
  for (const view of mapping.views) {
    lines.push(generateViewCode(view));
    lines.push('');
  }

  // Generate actions
  for (const action of mapping.actions) {
    lines.push(generateActionCode(action));
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate ShepLang code for a single view
 */
function generateViewCode(view: ShepLangView): string {
  const lines: string[] = [];
  
  lines.push(`view ${view.name}:`);
  
  // Add route for pages
  if (view.route) {
    lines.push(`  route: "${view.route}"`);
  }
  
  // Add widgets
  if (view.widgets.length > 0) {
    for (const widget of view.widgets) {
      const widgetLine = generateWidgetCode(widget, 2);
      if (widgetLine) {
        lines.push(widgetLine);
      }
    }
  }
  
  // Add bindings
  if (view.bindings.length > 0) {
    for (const binding of view.bindings) {
      lines.push(`  bind ${binding.variable} to ${binding.entity} (${binding.type})`);
    }
  }

  return lines.join('\n');
}

/**
 * Generate ShepLang code for a widget
 */
function generateWidgetCode(widget: ShepLangWidget, indent: number): string {
  const pad = '  '.repeat(indent);
  
  switch (widget.type) {
    case 'button':
      const action = widget.action ? ` -> ${widget.action}` : '';
      return `${pad}button "${widget.label || 'Button'}"${action}`;
    
    case 'form':
      const formAction = widget.action ? ` -> ${widget.action}` : '';
      const entity = widget.entity ? ` ${widget.entity}` : '';
      return `${pad}form${entity}${formAction}`;
    
    case 'list':
      const listEntity = widget.entity ? ` ${widget.entity}` : '';
      return `${pad}list${listEntity}`;
    
    case 'input':
      const fieldName = widget.fields?.[0] || 'field';
      return `${pad}input "${widget.label || fieldName}"`;
    
    case 'text':
      return widget.label ? `${pad}text "${widget.label}"` : '';
    
    case 'link':
      const href = widget.href || '#';
      return `${pad}link "${widget.label || 'Link'}" -> "${href}"`;
    
    case 'container':
      if (!widget.children || widget.children.length === 0) return '';
      const children = widget.children
        .map(c => generateWidgetCode(c, indent + 1))
        .filter(Boolean)
        .join('\n');
      return children;
    
    default:
      return '';
  }
}

/**
 * Generate ShepLang code for an action
 * Phase 3: Now uses FAITHFULLY TRANSLATED code when available
 */
function generateActionCode(action: ShepLangAction): string {
  const lines: string[] = [];
  
  // Action header with params
  const params = action.params.map(p => p.name).join(', ');
  lines.push(`action ${action.name}(${params}):`);
  
  // PHASE 3: If we have faithfully translated code, USE IT
  if (action.translatedCode) {
    // Add confidence comment if not perfect
    if (action.translationConfidence !== undefined && action.translationConfidence < 1) {
      lines.push(`  // Translation confidence: ${Math.round(action.translationConfidence * 100)}%`);
    }
    // Add the translated code (already indented by generateShepLangCode)
    lines.push(action.translatedCode);
    return lines.join('\n');
  }
  
  // Fallback: Operations-based generation (old method)
  for (const op of action.operations) {
    const opLine = generateOperationCode(op);
    if (opLine) {
      lines.push(`  ${opLine}`);
    }
  }
  
  // Default show if no operations
  if (action.operations.length === 0) {
    lines.push(`  // TODO: Implement action logic`);
  }
  
  return lines.join('\n');
}

/**
 * Generate ShepLang code for an operation
 */
function generateOperationCode(op: ActionOperation): string {
  switch (op.kind) {
    case 'add':
      return op.entity ? `add ${op.entity}` : '# add entity';
    
    case 'update':
      return op.entity ? `update ${op.entity}` : '# update entity';
    
    case 'remove':
      return op.entity ? `remove ${op.entity}` : '# remove entity';
    
    case 'call':
      const fields = op.fields ? ` with ${op.fields.join(', ')}` : '';
      return `call ${op.method || 'POST'} "${op.endpoint}"${fields}`;
    
    case 'load':
      const variable = op.variable || 'data';
      return `load ${op.method || 'GET'} "${op.endpoint}" into ${variable}`;
    
    case 'show':
      return op.view ? `show ${op.view}` : '# show view';
    
    case 'set':
      return op.variable ? `set ${op.variable} to ${op.value}` : '# set value';
    
    default:
      return '';
  }
}

/**
 * View & Action types for ShepLang generation
 * Used by Slice 4 to convert React components to ShepLang views/actions
 */

/**
 * ShepLang Widget types matching ShepLang UI primitives
 */
export type WidgetType = 'button' | 'form' | 'list' | 'input' | 'text' | 'container' | 'link';

/**
 * A ShepLang widget (UI element)
 */
export interface ShepLangWidget {
  type: WidgetType;
  label?: string;
  action?: string;           // Reference to action name
  entity?: string;           // For list widgets
  fields?: string[];         // For form inputs
  href?: string;             // For link widgets
  className?: string;        // Preserve styling hints
  children?: ShepLangWidget[];
}

/**
 * Binding between view state and data
 */
export interface ViewBinding {
  variable: string;
  entity: string;
  type: 'list' | 'single';
}

/**
 * A ShepLang view (page or component)
 */
export interface ShepLangView {
  name: string;
  kind: 'page' | 'component';
  route?: string;            // For pages, the URL path
  widgets: ShepLangWidget[];
  bindings: ViewBinding[];
  props?: string[];          // For components, input props
}

/**
 * Action parameter
 */
export interface ActionParam {
  name: string;
  type: string;
  required: boolean;
}

/**
 * Action operation kinds
 */
export type OperationKind = 'add' | 'update' | 'remove' | 'call' | 'load' | 'show' | 'set';

/**
 * A single operation within an action
 */
export interface ActionOperation {
  kind: OperationKind;
  entity?: string;           // For add/update/remove
  endpoint?: string;         // For call/load
  method?: string;           // HTTP method
  fields?: string[];         // Fields to include
  variable?: string;         // For load: target variable
  view?: string;             // For show: target view
  value?: string;            // For set: new value
}

/**
 * A ShepLang action
 */
export interface ShepLangAction {
  name: string;
  trigger: 'click' | 'submit' | 'change' | 'load' | 'custom';
  params: ActionParam[];
  operations: ActionOperation[];
  sourceHandler?: string;    // Original handler function name
}

/**
 * Complete view/action mapping result for a component
 */
export interface ViewActionMapping {
  view: ShepLangView;
  actions: ShepLangAction[];
}

/**
 * Result of mapping an entire project
 */
export interface ProjectMapping {
  views: ShepLangView[];
  actions: ShepLangAction[];
  entities: string[];        // Referenced entity names
  confidence: number;
  warnings: string[];
}

/**
 * Import Wizard Types for Slice 6
 * 
 * Types for the import analysis wizard that allows users to:
 * - View detected entities, views, actions with confidence scores
 * - Rename items before code generation
 * - Enable/disable items to include/exclude from output
 */

/**
 * Type of detected item
 */
export type DetectedItemType = 'entity' | 'view' | 'action' | 'route';

/**
 * A single detected item from analysis
 */
export interface DetectedItem {
  /** Unique ID for tracking */
  id: string;
  
  /** Original name from source code */
  originalName: string;
  
  /** Display name (can be renamed by user) */
  displayName: string;
  
  /** Item type */
  type: DetectedItemType;
  
  /** Whether to include in generation */
  enabled: boolean;
  
  /** Detection confidence (0-1) */
  confidence: number;
  
  /** Source file or description */
  source: string;
  
  /** Additional details based on type */
  details: ItemDetails;
}

/**
 * Type-specific details for detected items
 */
export type ItemDetails = 
  | EntityDetails 
  | ViewDetails 
  | ActionDetails 
  | RouteDetails;

export interface EntityDetails {
  kind: 'entity';
  fields: { name: string; type: string; required: boolean }[];
  relations?: { name: string; target: string; type: string }[];
}

export interface ViewDetails {
  kind: 'view';
  viewType: 'page' | 'component';
  route?: string;
  widgets: string[];
  bindings: string[];
}

export interface ActionDetails {
  kind: 'action';
  trigger: string;
  operations: string[];
  apiEndpoint?: string;
  method?: string;
}

export interface RouteDetails {
  kind: 'route';
  method: string;
  path: string;
  prismaOperation?: string;
  prismaModel?: string;
  bodyFields: string[];
}

/**
 * Complete analysis result from all parsers
 */
export interface ImportAnalysis {
  /** Project name */
  projectName: string;
  
  /** Project root path */
  projectRoot: string;
  
  /** Detected entities */
  entities: DetectedItem[];
  
  /** Detected views */
  views: DetectedItem[];
  
  /** Detected actions */
  actions: DetectedItem[];
  
  /** Detected API routes */
  routes: DetectedItem[];
  
  /** Overall confidence score */
  confidence: number;
  
  /** Analysis warnings */
  warnings: string[];
  
  /** Analysis timestamp */
  analyzedAt: string;
}

/**
 * User's choice for a single item
 */
export interface ItemChoice {
  /** Whether to include this item */
  enabled: boolean;
  
  /** Renamed value (if changed) */
  renamedTo?: string;
}

/**
 * All user choices from the wizard
 */
export interface WizardChoices {
  /** Choices per item ID */
  items: Record<string, ItemChoice>;
  
  /** Optional app name override */
  appName?: string;
  
  /** Optional app type */
  appType?: string;
  
  /** Custom instructions */
  customInstructions?: string;
  
  /** Generate backend */
  generateBackend: boolean;
}

/**
 * Message types for wizard panel communication
 */
export type WizardMessage = 
  | { command: 'ready' }
  | { command: 'toggleItem'; id: string; enabled: boolean }
  | { command: 'renameItem'; id: string; newName: string }
  | { command: 'generate'; choices: WizardChoices }
  | { command: 'cancel' };

/**
 * Message types sent to the wizard panel
 */
export type WizardPanelMessage =
  | { command: 'setAnalysis'; analysis: ImportAnalysis }
  | { command: 'updateItem'; id: string; item: Partial<DetectedItem> }
  | { command: 'showError'; message: string }
  | { command: 'showProgress'; message: string; percent: number };

/**
 * Result of applying wizard choices
 */
export interface WizardResult {
  /** Filtered and renamed entities */
  entities: { name: string; original: string; details: EntityDetails }[];
  
  /** Filtered and renamed views */
  views: { name: string; original: string; details: ViewDetails }[];
  
  /** Filtered and renamed actions */
  actions: { name: string; original: string; details: ActionDetails }[];
  
  /** Filtered routes */
  routes: { name: string; original: string; details: RouteDetails }[];
  
  /** App name */
  appName: string;
  
  /** Whether to generate backend */
  generateBackend: boolean;
}

/**
 * Apply wizard choices to analysis to get filtered/renamed results
 */
export function applyWizardChoices(
  analysis: ImportAnalysis,
  choices: WizardChoices
): WizardResult {
  const getItemResult = <T extends ItemDetails>(
    items: DetectedItem[],
    kind: T['kind']
  ) => {
    return items
      .filter(item => {
        const choice = choices.items[item.id];
        return choice ? choice.enabled : item.enabled;
      })
      .map(item => {
        const choice = choices.items[item.id];
        return {
          name: choice?.renamedTo || item.displayName,
          original: item.originalName,
          details: item.details as T
        };
      });
  };

  return {
    entities: getItemResult<EntityDetails>(analysis.entities, 'entity'),
    views: getItemResult<ViewDetails>(analysis.views, 'view'),
    actions: getItemResult<ActionDetails>(analysis.actions, 'action'),
    routes: getItemResult<RouteDetails>(analysis.routes, 'route'),
    appName: choices.appName || analysis.projectName,
    generateBackend: choices.generateBackend
  };
}

/**
 * Calculate display confidence class
 */
export function getConfidenceClass(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.6) return 'medium';
  return 'low';
}

/**
 * Format confidence as percentage string
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

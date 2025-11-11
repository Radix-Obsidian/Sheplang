/**
 * Complete app model derived from ShepLang source
 */
export type AppModel = {
  name: string;
  datas: DataModel[];
  views: ViewModel[];
  actions: ActionModel[];
};

/**
 * Data model definition
 */
export type DataModel = {
  name: string;
  fields: FieldDefinition[];
  rules?: string[];
};

/**
 * Field definition in a data model
 */
export type FieldDefinition = {
  name: string;
  type: string;
  required?: boolean;
};

/**
 * View model definition
 */
export type ViewModel = {
  name: string;
  list?: string;
  buttons?: ButtonDefinition[];
};

/**
 * Button definition in a view
 */
export type ButtonDefinition = {
  label: string;
  action: string;
};

/**
 * Action model definition
 */
export type ActionModel = {
  name: string;
  params?: ParamDefinition[];
  ops: Operation[];
};

/**
 * Parameter definition for an action
 */
export type ParamDefinition = {
  name: string;
  type?: string;
  required?: boolean;
};

/**
 * Operation within an action
 */
export type Operation = AddOperation | ShowOperation | TextOperation;

export type AddOperation = {
  kind: 'add';
  data: string;
  fields: Record<string, any>;
};

export type ShowOperation = {
  kind: 'show';
  view: string;
};

/**
 * Text operation - supports both 'text' and 'raw' kinds for compatibility
 * with the language package's parser output
 */
export type TextOperation = {
  kind: 'text' | 'raw';
  text: string;
};

/**
 * Configuration for transpiler output
 */
export interface TranspilerOptions {
  outDir?: string;
  generateSnapshots?: boolean;
  prettify?: boolean;
}

/**
 * Result of transpilation
 */
export interface TranspileResult {
  entryPath: string;
  outDir: string;
  snapshotPath?: string;
}

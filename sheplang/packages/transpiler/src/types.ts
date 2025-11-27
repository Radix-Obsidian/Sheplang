/**
 * Complete app model derived from ShepLang source (v0.3 - Prisma/Next.js parity)
 */
export type AppModel = {
  name: string;
  enums?: EnumDefinition[];
  layouts?: LayoutDefinition[];
  datas: DataModel[];
  views: ViewModel[];
  actions: ActionModel[];
};

/**
 * Enum definition (Prisma parity)
 */
export type EnumDefinition = {
  name: string;
  values: string[];
};

/**
 * Layout definition (Next.js parity)
 */
export type LayoutDefinition = {
  name: string;
  header?: string;
  sidebar?: string;
  nav?: string;
  footer?: string;
};

/**
 * Data model definition
 */
export type DataModel = {
  name: string;
  fields: FieldDefinition[];
  rules?: string[];
  modelAttributes?: ModelAttribute[];
};

/**
 * Model-level attribute (@@unique, @@index)
 */
export type ModelAttribute = {
  type: 'id' | 'unique' | 'index';
  fields: string[];
};

/**
 * Field definition in a data model (Prisma parity)
 */
export type FieldDefinition = {
  name: string;
  type: string;
  isOptional?: boolean;
  isArray?: boolean;
  defaultValue?: string;
  defaultFunction?: string;
  isId?: boolean;
  isUnique?: boolean;
  isUpdatedAt?: boolean;
  isRelation?: boolean;
  relatedEntity?: string;
  onDelete?: string;
  onUpdate?: string;
  required?: boolean; // backward compat
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

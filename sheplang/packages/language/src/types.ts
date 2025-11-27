// Expression types for the new expression system
export type Expression =
  | { type: 'number'; value: number }
  | { type: 'string'; value: string }
  | { type: 'boolean'; value: boolean }
  | { type: 'identifier'; name: string }
  | { type: 'field'; object: string; field: string }
  | { type: 'call'; func: string; args: Expression[] }
  | { type: 'binary'; op: string; left: Expression; right: Expression }
  | { type: 'unary'; op: string; operand: Expression };

// Statement types for the new control flow
export type Statement =
  | { kind: 'add'; data: string; fields: Record<string, string> }
  | { kind: 'show'; view: string }
  | { kind: 'call'; method: string; path: string; fields: string[] }
  | { kind: 'load'; method: string; path: string; variable: string }
  | { kind: 'update'; model: string; condition: Expression; assignments: Record<string, Expression> }
  | { kind: 'delete'; model: string; condition: Expression }
  | { kind: 'if'; condition: Expression; thenBranch: Statement[]; elseIfs: { condition: Expression; body: Statement[] }[]; elseBranch: Statement[] }
  | { kind: 'for'; type: 'each' | 'range'; variable: string; collection?: Expression; start?: Expression; end?: Expression; body: Statement[] }
  | { kind: 'assign'; target: string; value: Expression }
  | { kind: 'workflow'; steps: WorkflowStepDef[]; errorHandler?: string }
  | { kind: 'raw'; text: string };

// Phase 3: Workflow Step Definition
export type WorkflowStepDef = {
  name: string;
  body: Statement[];
};

// Phase II: State Machine Types
export type StateTransition = {
  from: string;
  to: string;
};

export type StatusDeclaration = {
  states: string[];
  transitions: StateTransition[];
};

// Phase II: Job Types
export type JobSchedule = {
  type: 'cron' | 'natural';
  pattern?: string;
  expression?: string;
};

export type JobTrigger = {
  type: 'lifecycle' | 'state_transition';
  entity: string;
  eventType?: string;
  field?: string;
  value?: string;
};

export type JobDelay = {
  amount: string;
  unit: string;
};

export type JobDeclaration = {
  name: string;
  schedule?: JobSchedule;
  trigger?: JobTrigger;
  delay?: JobDelay;
  actions: Statement[];
};

// Phase II: Workflow Types
export type WorkflowCondition = {
  expression: Expression;
  alternative?: string;
};

export type WorkflowAction = {
  name: string;
  condition?: WorkflowCondition;
  target: string;
};

export type WorkflowEvent = {
  state: string;
  actions: WorkflowAction[];
};

export type WorkflowDeclaration = {
  name: string;
  events: WorkflowEvent[];
};

// Field definition with Prisma-parity features
export type FieldDef = {
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
  constraints: Record<string, unknown>[];
};

// Enum declaration
export type EnumDef = {
  name: string;
  values: string[];
};

// Layout declaration (Next.js parity)
export type LayoutDef = {
  name: string;
  header?: string;
  sidebar?: string;
  nav?: string;
  footer?: string;
};

// Model-level attributes
export type ModelAttribute = {
  type: 'id' | 'unique' | 'index';
  fields: string[];
};

export type AppModel = {
  name: string;
  enums?: EnumDef[];
  layouts?: LayoutDef[];
  datas: { 
    name: string; 
    fields: FieldDef[]; 
    status?: StatusDeclaration;
    rules: string[];
    modelAttributes?: ModelAttribute[];
  }[];
  views: { 
    name: string; 
    params?: { name: string; type?: string }[];
    layout?: string;
    loading?: string;
    error?: string;
    list?: string; 
    buttons: { label: string; action: string }[] 
  }[];
  actions: {
    name: string;
    params: { name: string; type?: string }[];
    ops: Statement[];
  }[];
  flows?: {
    name: string;
    from: string;
    trigger: string;
    steps: { description: string }[];
  }[];
  jobs?: JobDeclaration[];
  workflows?: WorkflowDeclaration[];
};

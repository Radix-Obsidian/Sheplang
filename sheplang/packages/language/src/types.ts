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
  | { kind: 'raw'; text: string };

export type AppModel = {
  name: string;
  datas: { name: string; fields: { name: string; type: string; constraints: any[] }[]; rules: string[] }[];
  views: { name: string; list?: string; buttons: { label: string; action: string }[] }[];
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
};

import type { AppModel } from './types.js';
import type {
  ShepFile,
  ActionDecl,
  DataDecl,
  ViewDecl,
  AddStmt,
  ShowStmt,
  RawStmt,
  BooleanLiteral,
  StringLiteral,
  IdentifierRef
} from './generated/ast.js';

export function mapToAppModel(ast: ShepFile): AppModel {
  const app = ast.app;
  if (!app) {
    throw new Error('Missing app declaration');
  }

  const datas: AppModel['datas'] = [];
  const views: AppModel['views'] = [];
  const actions: AppModel['actions'] = [];
  const flows: AppModel['flows'] = [];

  for (const decl of app.decls) {
    if (decl.$type === 'DataDecl') {
      datas.push(mapDataDecl(decl));
    } else if (decl.$type === 'ViewDecl') {
      views.push(mapViewDecl(decl));
    } else if (decl.$type === 'ActionDecl') {
      actions.push(mapActionDecl(decl));
    } else if (decl.$type === 'FlowDecl') {
      flows.push(mapFlowDecl(decl));
    }
  }

  return { 
    name: app.name, 
    datas, 
    views, 
    actions,
    flows: flows.length > 0 ? flows : undefined
  };
}

function mapDataDecl(decl: DataDecl): AppModel['datas'][0] {
  return {
    name: decl.name,
    fields: decl.fields.map(f => ({
      name: f.name,
      type: serializeBaseType(f.type.base) + (f.type.isArray ? '[]' : ''),
      constraints: (f.constraints || []).map(c => serializeConstraint(c))
    })),
    rules: decl.rules.map(r => r.text)
  };
}

function serializeBaseType(baseType: any): string {
  if (typeof baseType === 'string') {
    return baseType;
  }
  
  if (baseType && typeof baseType === 'object') {
    if (baseType.$type === 'SimpleType') {
      return baseType.value;
    } else if (baseType.$type === 'RefType') {
      return `ref[${baseType.entity}]`;
    }
  }
  
  return String(baseType);
}

function mapFlowDecl(decl: any): NonNullable<AppModel['flows']>[0] {
  return {
    name: decl.name,
    from: decl.from,
    trigger: decl.trigger,
    steps: decl.steps.map((step: any) => ({
      description: step.description
    }))
  };
}

function serializeConstraint(constraint: any): any {
  // From generated AST, Constraint has shape:
  // { $type: 'Constraint'; kind?: 'optional'|'required'|'unique'; max?: string; value?: BooleanLiteral | string }

  if (!constraint) {
    return { type: 'unknown' };
  }

  // If mapper is ever called with a plain string, keep a safe fallback
  if (typeof constraint === 'string') {
    return { type: constraint };
  }

  if (typeof constraint === 'object') {
    // Keyword constraints: required / optional / unique
    if (
      typeof constraint.kind === 'string' &&
      (constraint.kind === 'required' || constraint.kind === 'optional' || constraint.kind === 'unique')
    ) {
      return { type: constraint.kind };
    }

    // Max constraint: max = NUMBER (stored as string in AST)
    if (typeof constraint.max === 'string') {
      return { type: 'max', value: constraint.max };
    }

    // Default constraint: default = <literal>
    if (constraint.value !== undefined) {
      let v: any = constraint.value;
      // Unwrap BooleanLiteral node if present
      if (v && typeof v === 'object' && v.$type === 'BooleanLiteral') {
        v = v.value === 'true';
      }
      return { type: 'default', value: v };
    }
  }

  return { type: 'unknown' };
}

function mapViewDecl(decl: ViewDecl): AppModel['views'][0] {
  const buttons: { label: string; action: string }[] = [];
  let list: string | undefined;

  for (const widget of decl.widgets) {
    if (widget.$type === 'ListDecl') {
      const ref = widget.ref.ref;
      if (!ref) {
        throw new Error(`Unresolved list reference in view "${decl.name}"`);
      }
      list = ref.name;
    } else if (widget.$type === 'ButtonDecl') {
      const target = widget.target.ref;
      if (!target) {
        throw new Error(`Unresolved button target "${widget.label}" in view "${decl.name}"`);
      }
      buttons.push({ label: widget.label, action: target.name });
    }
  }

  return { name: decl.name, list, buttons };
}

function mapActionDecl(decl: ActionDecl): AppModel['actions'][0] {
  return {
    name: decl.name,
    params: decl.params.map(p => ({
      name: p.name,
      type: p.type ? serializeBaseType(p.type.base) : undefined
    })),
    ops: decl.statements.map(stmt => mapStmt(stmt, decl.name))
  };
}

function mapStmt(
  stmt: any,
  actionName: string
): AppModel['actions'][0]['ops'][0] {
  if (stmt.$type === 'AddStmt') {
    const ref = stmt.ref.ref;
    if (!ref) {
      throw new Error(`Unresolved data reference in action "${actionName}"`);
    }
    const fields: Record<string, string> = {};
    for (const fv of stmt.fields) {
      // If value is present, use it; otherwise use the name as the value (parameter reference)
      fields[fv.name] = fv.value ? mapExpr(fv.value) : fv.name;
    }
    return { kind: 'add', data: ref.name, fields };
  } else if (stmt.$type === 'ShowStmt') {
    const ref = stmt.view.ref;
    if (!ref) {
      throw new Error(`Unresolved view reference in action "${actionName}"`);
    }
    return { kind: 'show', view: ref.name };
  } else if (stmt.$type === 'CallStmt') {
    return {
      kind: 'call',
      method: stmt.method,
      path: stmt.path,
      fields: stmt.fields?.map((f: any) => f) || []
    };
  } else if (stmt.$type === 'LoadStmt') {
    return {
      kind: 'load',
      method: stmt.method,
      path: stmt.path,
      variable: stmt.variable
    };
  } else if (stmt.$type === 'UpdateStmt') {
    const model = stmt.model.ref;
    if (!model) {
      throw new Error(`Unresolved model reference in update statement`);
    }
    const assignments: Record<string, any> = {};
    for (const assign of stmt.assignments || []) {
      assignments[assign.field] = mapExpression(assign.value);
    }
    return {
      kind: 'update',
      model: model.name,
      condition: mapExpression(stmt.condition),
      assignments
    };
  } else if (stmt.$type === 'DeleteStmt') {
    const model = stmt.model.ref;
    if (!model) {
      throw new Error(`Unresolved model reference in delete statement`);
    }
    return {
      kind: 'delete',
      model: model.name,
      condition: mapExpression(stmt.condition)
    };
  } else if (stmt.$type === 'IfStmt') {
    return {
      kind: 'if',
      condition: mapExpression(stmt.condition),
      thenBranch: stmt.thenBranch?.map((s: any) => mapStmt(s, actionName)) || [],
      elseIfs: stmt.elseIfs?.map((elif: any) => ({
        condition: mapExpression(elif.condition),
        body: elif.body?.map((s: any) => mapStmt(s, actionName)) || []
      })) || [],
      elseBranch: stmt.elseBranch?.map((s: any) => mapStmt(s, actionName)) || []
    };
  } else if (stmt.$type === 'ForStmt') {
    const loop = stmt.loop;
    if (loop.$type === 'ForEachClause') {
      return {
        kind: 'for',
        type: 'each',
        variable: loop.variable,
        collection: mapExpression(loop.collection),
        body: stmt.body?.map((s: any) => mapStmt(s, actionName)) || []
      };
    } else if (loop.$type === 'ForRangeClause') {
      return {
        kind: 'for',
        type: 'range',
        variable: loop.variable,
        start: mapExpression(loop.start),
        end: mapExpression(loop.end),
        body: stmt.body?.map((s: any) => mapStmt(s, actionName)) || []
      };
    } else {
      throw new Error(`Unknown for loop type: ${loop.$type}`);
    }
  } else if (stmt.$type === 'AssignStmt') {
    return {
      kind: 'assign',
      target: stmt.target,
      value: mapExpression(stmt.value)
    };
  } else if (stmt.$type === 'RawStmt') {
    return { kind: 'raw', text: stmt.text };
  } else {
    throw new Error(`Unknown statement type: ${stmt.$type}`);
  }
}

// Map new Expression AST to a value or expression object
function mapExpression(expr: any): any {
  if (!expr) return null;
  
  // Literals
  if (expr.$type === 'NumberLiteral') {
    return { type: 'number', value: parseFloat(expr.value) };
  } else if (expr.$type === 'StringLiteral') {
    return { type: 'string', value: expr.value };
  } else if (expr.$type === 'BooleanLiteral') {
    return { type: 'boolean', value: expr.value === 'true' };
  } else if (expr.$type === 'IdentifierRef') {
    return { type: 'identifier', name: expr.ref };
  }
  
  // Field access
  else if (expr.$type === 'FieldAccess') {
    return { type: 'field', object: expr.object, field: expr.field };
  }
  
  // Function call
  else if (expr.$type === 'FunctionCall') {
    return {
      type: 'call',
      func: expr.func,
      args: expr.args?.map((a: any) => mapExpression(a)) || []
    };
  }
  
  // Binary expressions (unified)
  else if (expr.$type === 'BinaryExpr') {
    return {
      type: 'binary',
      op: expr.op,
      left: mapExpression(expr.left),
      right: mapExpression(expr.right)
    };
  }
  
  // Unary expressions
  else if (expr.$type === 'UnaryExpr') {
    return {
      type: 'unary',
      op: expr.op,
      operand: mapExpression(expr.operand)
    };
  }
  
  // Fallback for simple cases (backward compatibility)
  return String(expr);
}

// Keep old mapExpr for backward compatibility
function mapExpr(expr: any): string {
  const mapped = mapExpression(expr);
  if (typeof mapped === 'string') return mapped;
  if (typeof mapped === 'object' && mapped !== null) {
    if (mapped.type === 'number') return String(mapped.value);
    if (mapped.type === 'string') return mapped.value;
    if (mapped.type === 'boolean') return String(mapped.value);
    if (mapped.type === 'identifier') return mapped.name;
  }
  return String(mapped);
}

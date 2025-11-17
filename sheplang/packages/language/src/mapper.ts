import type { AppModel, SourceLocation } from './types.js';
import type {
  ShepFile,
  ActionDecl,
  DataDecl,
  ViewDecl,
  AddStmt,
  ShowStmt,
  RawStmt,
  CallStmt,
  LoadStmt,
  BooleanLiteral,
  StringLiteral,
  IdentifierRef,
  ButtonDecl,
  Stmt
} from '../generated/ast.js';
import type { AstNode } from 'langium';

/**
 * Extract source location from Langium CST node
 */
function extractLocation(node: AstNode): SourceLocation | undefined {
  const cstNode = node.$cstNode;
  if (!cstNode?.range) return undefined;
  
  return {
    startLine: cstNode.range.start.line + 1, // Langium uses 0-indexed lines
    startColumn: cstNode.range.start.character + 1,
    endLine: cstNode.range.end.line + 1,
    endColumn: cstNode.range.end.character + 1,
  };
}

export function mapToAppModel(ast: ShepFile): AppModel {
  const app = ast.app;
  if (!app) {
    throw new Error('Missing app declaration');
  }

  const datas: AppModel['datas'] = [];
  const views: AppModel['views'] = [];
  const actions: AppModel['actions'] = [];

  for (const decl of app.decls) {
    if (decl.$type === 'DataDecl') {
      datas.push(mapDataDecl(decl));
    } else if (decl.$type === 'ViewDecl') {
      views.push(mapViewDecl(decl));
    } else if (decl.$type === 'ActionDecl') {
      actions.push(mapActionDecl(decl));
    }
  }

  return { name: app.name, datas, views, actions };
}

function mapDataDecl(decl: DataDecl): AppModel['datas'][0] {
  return {
    name: decl.name,
    fields: decl.fields.map(f => ({
      name: f.name,
      type: f.type.base
    })),
    rules: decl.rules.map(r => r.text),
    __location: extractLocation(decl)
  };
}

function mapViewDecl(decl: ViewDecl): AppModel['views'][0] {
  const buttons: { label: string; action: string; __location?: SourceLocation }[] = [];
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
      buttons.push({ 
        label: widget.label, 
        action: target.name,
        __location: extractLocation(widget)
      });
    }
  }

  return { 
    name: decl.name, 
    list, 
    buttons,
    __location: extractLocation(decl)
  };
}

function mapActionDecl(decl: ActionDecl): AppModel['actions'][0] {
  return {
    name: decl.name,
    params: decl.params.map(p => ({
      name: p.name,
      type: p.type?.base
    })),
    ops: decl.statements.map(stmt => mapStmt(stmt, decl.name)),
    __location: extractLocation(decl)
  };
}

function mapStmt(
  stmt: Stmt,
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
    // Handle call statements (HTTP requests) - connect to bridge
    return { 
      kind: 'call', 
      method: stmt.method, 
      path: stmt.path.replace(/['"]/g, ''), // Remove quotes from string literal
      args: stmt.args?.map(arg => mapExpr(arg)) || []
    };
  } else if (stmt.$type === 'LoadStmt') {
    // Handle load statements - connect to bridge and update state
    return { 
      kind: 'load', 
      method: stmt.method, 
      path: stmt.path.replace(/['"]/g, ''), // Remove quotes from string literal
      target: stmt.target
    };
  } else {
    return { kind: 'raw', text: stmt.text };
  }
}

function mapExpr(expr: any): string {
  if (expr.$type === 'BooleanLiteral') {
    return expr.value;
  } else if (expr.$type === 'StringLiteral') {
    return expr.value;
  } else if (expr.$type === 'IdentifierRef') {
    return expr.ref;
  }
  return String(expr);
}

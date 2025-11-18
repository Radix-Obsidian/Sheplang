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
} from '../generated/ast.js';

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
    rules: decl.rules.map(r => r.text)
  };
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
      type: p.type?.base
    })),
    ops: decl.statements.map(stmt => mapStmt(stmt, decl.name))
  };
}

function mapStmt(
  stmt: AddStmt | ShowStmt | RawStmt,
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
  } else {
    return { kind: 'raw', text: stmt.text };
  }
}

function mapExpr(expr: any): string {
  if (expr.$type === 'BooleanLiteral') {
    return expr.value;
  } else if (expr.$type === 'StringLiteral') {
    return expr.value;
  } else if (expr.$type === 'NumberLiteral') {
    return expr.value;
  } else if (expr.$type === 'IdentifierRef') {
    return expr.ref;
  }
  return String(expr);
}

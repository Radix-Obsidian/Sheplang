export function mapToAppModel(ast) {
    const app = ast.app;
    if (!app) {
        throw new Error('Missing app declaration');
    }
    const datas = [];
    const views = [];
    const actions = [];
    for (const decl of app.decls) {
        if (decl.$type === 'DataDecl') {
            datas.push(mapDataDecl(decl));
        }
        else if (decl.$type === 'ViewDecl') {
            views.push(mapViewDecl(decl));
        }
        else if (decl.$type === 'ActionDecl') {
            actions.push(mapActionDecl(decl));
        }
    }
    return { name: app.name, datas, views, actions };
}
function mapDataDecl(decl) {
    return {
        name: decl.name,
        fields: decl.fields.map(f => ({
            name: f.name,
            type: f.type.base
        })),
        rules: decl.rules.map(r => r.text)
    };
}
function mapViewDecl(decl) {
    const buttons = [];
    let list;
    for (const widget of decl.widgets) {
        if (widget.$type === 'ListDecl') {
            const ref = widget.ref.ref;
            if (!ref) {
                throw new Error(`Unresolved list reference in view "${decl.name}"`);
            }
            list = ref.name;
        }
        else if (widget.$type === 'ButtonDecl') {
            const target = widget.target.ref;
            if (!target) {
                throw new Error(`Unresolved button target "${widget.label}" in view "${decl.name}"`);
            }
            buttons.push({ label: widget.label, action: target.name });
        }
    }
    return { name: decl.name, list, buttons };
}
function mapActionDecl(decl) {
    return {
        name: decl.name,
        params: decl.params.map(p => ({
            name: p.name,
            type: p.type?.base
        })),
        ops: decl.statements.map(stmt => mapStmt(stmt, decl.name))
    };
}
function mapStmt(stmt, actionName) {
    if (stmt.$type === 'AddStmt') {
        const ref = stmt.ref.ref;
        if (!ref) {
            throw new Error(`Unresolved data reference in action "${actionName}"`);
        }
        const fields = {};
        for (const fv of stmt.fields) {
            // If value is present, use it; otherwise use the name as the value (parameter reference)
            fields[fv.name] = fv.value ? mapExpr(fv.value) : fv.name;
        }
        return { kind: 'add', data: ref.name, fields };
    }
    else if (stmt.$type === 'ShowStmt') {
        const ref = stmt.view.ref;
        if (!ref) {
            throw new Error(`Unresolved view reference in action "${actionName}"`);
        }
        return { kind: 'show', view: ref.name };
    }
    else if (stmt.$type === 'CallStmt') {
        return {
            kind: 'call',
            method: stmt.method,
            path: stmt.path,
            fields: stmt.fields?.map((f) => f) || []
        };
    }
    else if (stmt.$type === 'LoadStmt') {
        return {
            kind: 'load',
            method: stmt.method,
            path: stmt.path,
            variable: stmt.variable
        };
    }
    else if (stmt.$type === 'UpdateStmt') {
        const model = stmt.model.ref;
        if (!model) {
            throw new Error(`Unresolved model reference in update statement`);
        }
        const assignments = {};
        for (const assign of stmt.assignments || []) {
            assignments[assign.field] = mapExpression(assign.value);
        }
        return {
            kind: 'update',
            model: model.name,
            condition: mapExpression(stmt.condition),
            assignments
        };
    }
    else if (stmt.$type === 'DeleteStmt') {
        const model = stmt.model.ref;
        if (!model) {
            throw new Error(`Unresolved model reference in delete statement`);
        }
        return {
            kind: 'delete',
            model: model.name,
            condition: mapExpression(stmt.condition)
        };
    }
    else if (stmt.$type === 'IfStmt') {
        return {
            kind: 'if',
            condition: mapExpression(stmt.condition),
            thenBranch: stmt.thenBranch?.map((s) => mapStmt(s, actionName)) || [],
            elseIfs: stmt.elseIfs?.map((elif) => ({
                condition: mapExpression(elif.condition),
                body: elif.body?.map((s) => mapStmt(s, actionName)) || []
            })) || [],
            elseBranch: stmt.elseBranch?.map((s) => mapStmt(s, actionName)) || []
        };
    }
    else if (stmt.$type === 'ForStmt') {
        const loop = stmt.loop;
        if (loop.$type === 'ForEachClause') {
            return {
                kind: 'for',
                type: 'each',
                variable: loop.variable,
                collection: mapExpression(loop.collection),
                body: stmt.body?.map((s) => mapStmt(s, actionName)) || []
            };
        }
        else if (loop.$type === 'ForRangeClause') {
            return {
                kind: 'for',
                type: 'range',
                variable: loop.variable,
                start: mapExpression(loop.start),
                end: mapExpression(loop.end),
                body: stmt.body?.map((s) => mapStmt(s, actionName)) || []
            };
        }
        else {
            throw new Error(`Unknown for loop type: ${loop.$type}`);
        }
    }
    else if (stmt.$type === 'AssignStmt') {
        return {
            kind: 'assign',
            target: stmt.target,
            value: mapExpression(stmt.value)
        };
    }
    else if (stmt.$type === 'RawStmt') {
        return { kind: 'raw', text: stmt.text };
    }
    else {
        throw new Error(`Unknown statement type: ${stmt.$type}`);
    }
}
// Map new Expression AST to a value or expression object
function mapExpression(expr) {
    if (!expr)
        return null;
    // Literals
    if (expr.$type === 'NumberLiteral') {
        return { type: 'number', value: parseFloat(expr.value) };
    }
    else if (expr.$type === 'StringLiteral') {
        return { type: 'string', value: expr.value };
    }
    else if (expr.$type === 'BooleanLiteral') {
        return { type: 'boolean', value: expr.value === 'true' };
    }
    else if (expr.$type === 'IdentifierRef') {
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
            args: expr.args?.map((a) => mapExpression(a)) || []
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
function mapExpr(expr) {
    const mapped = mapExpression(expr);
    if (typeof mapped === 'string')
        return mapped;
    if (typeof mapped === 'object' && mapped !== null) {
        if (mapped.type === 'number')
            return String(mapped.value);
        if (mapped.type === 'string')
            return mapped.value;
        if (mapped.type === 'boolean')
            return String(mapped.value);
        if (mapped.type === 'identifier')
            return mapped.name;
    }
    return String(mapped);
}

export function mapToAppModel(ast) {
    const app = ast.app;
    if (!app) {
        throw new Error('Missing app declaration');
    }
    const datas = [];
    const views = [];
    const actions = [];
    const flows = [];
    const jobs = [];
    const workflows = [];
    // For tracking transitions to add to data models
    const transitions = {};
    // Process all declarations
    if (app.decls) {
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
            else if (decl.$type === 'FlowDecl') {
                flows.push(mapFlowDecl(decl));
            }
            else if (decl.$type === 'JobDecl') {
                jobs.push(mapJobDecl(decl));
            }
            else if (decl.$type === 'WorkflowDecl') {
                workflows.push(mapWorkflowDecl(decl));
            }
        }
    }
    // Add transitions to data models
    for (const data of datas) {
        if (transitions[data.name]) {
            const transitionsList = transitions[data.name];
            const statesSet = new Set();
            transitionsList.forEach(t => {
                statesSet.add(t.from);
                statesSet.add(t.to);
            });
            data.status = {
                states: Array.from(statesSet),
                transitions: transitionsList
            };
        }
    }
    return {
        name: app.name,
        datas,
        views,
        actions,
        flows: flows.length > 0 ? flows : undefined,
        jobs: jobs.length > 0 ? jobs : undefined,
        workflows: workflows.length > 0 ? workflows : undefined
    };
}
function mapDataDecl(decl) {
    // Extract fields from data declaration
    const fields = decl.fields.map(f => ({
        name: f.name,
        type: serializeBaseType(f.type.base) + (f.type.isArray ? '[]' : ''),
        constraints: (f.constraints || []).map(c => serializeConstraint(c))
    }));
    // Extract rules if present
    const rules = decl.rules?.map(r => r.text) || [];
    // Extract inline status transitions if present
    let status;
    if (decl.statusBlock?.chain && decl.statusBlock.chain.states && decl.statusBlock.chain.states.length > 0) {
        const states = decl.statusBlock.chain.states;
        const transitions = [];
        for (let i = 0; i < states.length - 1; i++) {
            transitions.push({ from: states[i], to: states[i + 1] });
        }
        status = {
            states,
            transitions
        };
    }
    return {
        name: decl.name,
        fields,
        status,
        rules
    };
}
function serializeBaseType(baseType) {
    if (typeof baseType === 'string') {
        return baseType;
    }
    if (baseType && typeof baseType === 'object') {
        if (baseType.$type === 'SimpleType') {
            return baseType.value;
        }
        else if (baseType.$type === 'RefType') {
            return `ref[${baseType.entity}]`;
        }
    }
    return String(baseType);
}
function mapFlowDecl(decl) {
    return {
        name: decl.name,
        from: decl.from,
        trigger: decl.trigger,
        steps: decl.steps.map((step) => ({
            description: step.description
        }))
    };
}
function serializeConstraint(constraint) {
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
        if (typeof constraint.kind === 'string' &&
            (constraint.kind === 'required' || constraint.kind === 'optional' || constraint.kind === 'unique')) {
            return { type: constraint.kind };
        }
        // Max constraint: max = NUMBER (stored as string in AST)
        if (typeof constraint.max === 'string') {
            return { type: 'max', value: constraint.max };
        }
        // Phase 5: Min constraint
        if (typeof constraint.min === 'string') {
            return { type: 'min', value: constraint.min };
        }
        // Phase 5: MinLength constraint
        if (typeof constraint.minLength === 'string') {
            return { type: 'minLength', value: constraint.minLength };
        }
        // Phase 5: MaxLength constraint
        if (typeof constraint.maxLength === 'string') {
            return { type: 'maxLength', value: constraint.maxLength };
        }
        // Phase 5: Email validation constraint
        if (typeof constraint.emailValidation === 'string') {
            return { type: 'email', value: constraint.emailValidation === 'true' };
        }
        // Phase 5: Pattern (regex) constraint
        if (typeof constraint.pattern === 'string') {
            return { type: 'pattern', value: constraint.pattern };
        }
        // Default constraint: default = <literal>
        if (constraint.value !== undefined) {
            let v = constraint.value;
            // Unwrap BooleanLiteral node if present
            if (v && typeof v === 'object' && v.$type === 'BooleanLiteral') {
                v = v.value === 'true';
            }
            return { type: 'default', value: v };
        }
    }
    return { type: 'unknown' };
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
            type: p.type ? serializeBaseType(p.type.base) : undefined
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
    else if (stmt.$type === 'WorkflowStmt') {
        // Phase 3: Workflow Engine
        return {
            kind: 'workflow',
            steps: stmt.steps?.map((step) => ({
                name: step.name,
                body: step.body?.map((s) => mapStmt(s, actionName)) || []
            })) || [],
            errorHandler: stmt.errorHandler?.ref?.name
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
// No longer needed for direct state transitions
// Keeping for reference on how to map state transitions
// Phase II: Scheduler Declaration Mapping
function mapJobDecl(decl) {
    const job = {
        name: decl.name,
        delay: decl.delay ? mapJobDelay(decl.delay) : undefined,
        actions: decl.actions.map(stmt => mapStmt(stmt, decl.name))
    };
    // Handle JobTiming union type
    if (decl.timing) {
        if (decl.timing.$type === 'JobSchedule') {
            job.schedule = mapJobSchedule(decl.timing);
        }
        else if (decl.timing.$type === 'JobTrigger') {
            job.trigger = mapJobTrigger(decl.timing);
        }
    }
    return job;
}
function mapJobSchedule(schedule) {
    return mapScheduleTiming(schedule.timing);
}
function mapScheduleTiming(timing) {
    if (timing.$type === 'CronExpression') {
        return {
            type: 'cron',
            pattern: timing.pattern
        };
    }
    else if (timing.$type === 'NaturalLanguage') {
        return {
            type: 'natural',
            expression: serializeNaturalLanguage(timing)
        };
    }
    throw new Error(`Unknown schedule timing type: ${timing.$type}`);
}
function serializeNaturalLanguage(timing) {
    // Convert natural language timing back to string representation
    if (timing.frequency) {
        const freq = `${timing.frequency.amount} ${timing.frequency.unit}`;
        return timing.time ? `every ${freq} at ${timing.time}` : `every ${freq}`;
    }
    else if (timing.day && timing.time) {
        return `weekly on ${timing.day} at ${timing.time}`;
    }
    else if (timing.time) {
        return `daily at ${timing.time}`;
    }
    // More patterns can be added as needed
    return 'unknown schedule';
}
function mapJobTrigger(trigger) {
    return mapTriggerEvent(trigger.event);
}
function mapTriggerEvent(event) {
    return {
        type: 'entity',
        entity: event.entity || 'unknown',
        eventType: event.eventType || 'created'
    };
}
function mapJobDelay(delay) {
    return {
        amount: delay.duration.amount,
        unit: delay.duration.unit
    };
}
// Phase II: Workflow Declaration Mapping
function mapWorkflowDecl(decl) {
    return {
        name: decl.name,
        events: decl.events.map(mapWorkflowEvent)
    };
}
function mapWorkflowEvent(event) {
    return {
        state: event.state,
        actions: event.actions.map(mapWorkflowAction)
    };
}
function mapWorkflowAction(action) {
    return {
        name: action.name,
        condition: action.condition ? mapWorkflowCondition(action.condition) : undefined,
        target: action.target
    };
}
function mapWorkflowCondition(condition) {
    return {
        expression: mapExpression(condition.expression),
        alternative: condition.alternative
    };
}
//# sourceMappingURL=mapper.js.map
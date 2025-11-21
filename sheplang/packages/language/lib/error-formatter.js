const FIX_TIPS = {
    'missing fields:': 'Add a "fields:" block with at least one field, e.g.\n  fields:\n    name: text',
    'missing rules:': 'Add a "rules:" block with validation rules, e.g.\n  rules:\n    - user can update own items',
    'unterminated block': 'Close the block with "}" at the correct indentation level',
    'invalid type': 'Use one of: text, number, yes/no, date, email, id, or a custom ID',
    'unresolved reference': 'Check that the referenced data/view/action name exists',
    'invalid token': 'Check syntax - expected keyword or punctuation',
    'mixed indentation': 'Use consistent 2-space indentation (no tabs)',
};
export function formatFriendlyError(diagnostic) {
    const message = diagnostic.message;
    const line = diagnostic.range.start.line + 1;
    const column = diagnostic.range.start.character + 1;
    let fixTip = 'Check the syntax and ensure all required elements are present.';
    // Match common error patterns
    if (message.includes('fields:')) {
        fixTip = FIX_TIPS['missing fields:'];
    }
    else if (message.includes('rules:')) {
        fixTip = FIX_TIPS['missing rules:'];
    }
    else if (message.includes('}')) {
        fixTip = FIX_TIPS['unterminated block'];
    }
    else if (message.includes('type')) {
        fixTip = FIX_TIPS['invalid type'];
    }
    else if (message.includes('unresolved') || message.includes('not found')) {
        fixTip = FIX_TIPS['unresolved reference'];
    }
    else if (message.includes('indent')) {
        fixTip = FIX_TIPS['mixed indentation'];
    }
    else if (message.includes('token')) {
        fixTip = FIX_TIPS['invalid token'];
    }
    return {
        message: message.replace(/\n/g, ' ').trim(),
        line,
        column,
        fixTip,
        severity: diagnostic.severity === 1 ? 'error' : 'warning'
    };
}
export function formatErrorMessage(error) {
    return `❌ Line ${error.line}, Col ${error.column} — ${error.message}
Fix: ${error.fixTip}`;
}

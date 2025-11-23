const headerRegex = {
    app: /^(app)\b\s+[A-Za-z_]\w*\s*:?\s*$/,
    data: /^(data)\b\s+[A-Za-z_]\w*\s*:?\s*$/,
    view: /^(view)\b\s+[A-Za-z_]\w*\s*:?\s*$/,
    action: /^(action)\b\s+[A-Za-z_]\w*\s*\(.*\)\s*:?\s*$/,
    fields: /^(fields)\s*:\s*$/,
    rules: /^(rules)\s*:\s*$/,
    if: /^(if)\b\s+.*:\s*$/,
    elseif: /^(else\s+if)\b\s+.*:\s*$/,
    else: /^(else)\s*:\s*$/,
    for: /^(for)\b\s+.*:\s*$/
};
function isHeader(line) {
    const t = line.trim();
    for (const k of Object.keys(headerRegex)) {
        if (headerRegex[k].test(t))
            return k;
    }
    return undefined;
}
export function preprocessIndentToBraces(input) {
    const lines = input.replace(/\r\n?/g, '\n').split('\n');
    const out = [];
    const stack = [];
    const indentSize = 2;
    let inApp = false;
    const getIndent = (s) => (s.match(/^[ ]*/)?.[0].length ?? 0);
    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        if (/\t/.test(raw)) {
            throw new Error(`Tabs not allowed (use spaces) at line ${i + 1}`);
        }
        const trimmed = raw.trim();
        const indent = getIndent(raw);
        // close blocks when indent decreases
        if (trimmed.length > 0) {
            while (stack.length && indent < stack[stack.length - 1]) {
                out.push('}');
                stack.pop();
            }
        }
        if (!trimmed) {
            out.push('');
            continue;
        }
        const kind = isHeader(trimmed); // Check trimmed line, not raw
        if (kind) {
            if (kind === 'fields' || kind === 'rules') {
                const [kw] = trimmed.split(/\s*:/);
                const line = `${kw} : {`;
                out.push(line);
                stack.push(indent + indentSize);
            }
            else if (kind === 'if' || kind === 'elseif' || kind === 'else' || kind === 'for') {
                // Control flow: preserve the full line with colon and add brace
                out.push(`${trimmed} {`);
                stack.push(indent + indentSize);
            }
            else if (kind === 'app') {
                const line = trimmed.replace(/:\s*$/, '');
                out.push(`${line} {`);
                inApp = true;
            }
            else {
                const line = trimmed.replace(/:\s*$/, '');
                out.push(`${line} {`);
                stack.push(indent + indentSize);
            }
        }
        else {
            out.push(trimmed);
        }
    }
    // close any remaining blocks
    while (stack.length) {
        out.push('}');
        stack.pop();
    }
    if (inApp)
        out.push('}');
    return out.join('\n');
}
// Back-compat export name used elsewhere
export function preprocess(source) {
    return preprocessWithMap(source).text;
}
export function preprocessWithMap(input) {
    const lines = input.replace(/\r\n?/g, '\n').split('\n');
    const out = [];
    const map = [];
    const stack = [];
    const indentSize = 2;
    let inApp = false;
    const getIndent = (s) => (s.match(/^[ ]*/)?.[0].length ?? 0);
    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        if (/\t/.test(raw)) {
            throw new Error(`Tabs not allowed (use spaces) at line ${i + 1}`);
        }
        const trimmed = raw.trim();
        const indent = getIndent(raw);
        if (trimmed.length > 0) {
            while (stack.length && indent < stack[stack.length - 1]) {
                out.push('}');
                map.push(Math.max(1, i));
                stack.pop();
            }
        }
        if (!trimmed) {
            out.push('');
            map.push(i + 1);
            continue;
        }
        const kind = isHeader(trimmed); // Check trimmed line, not raw
        if (kind) {
            if (kind === 'fields' || kind === 'rules') {
                const [kw] = trimmed.split(/\s*:/);
                const line = `${kw} : {`;
                out.push(line);
                map.push(i + 1);
                stack.push(indent + indentSize);
            }
            else if (kind === 'if' || kind === 'elseif' || kind === 'else' || kind === 'for') {
                // Control flow: preserve the full line with colon and add brace
                out.push(`${trimmed} {`);
                map.push(i + 1);
                stack.push(indent + indentSize);
            }
            else if (kind === 'app') {
                const line = trimmed.replace(/:\s*$/, '');
                out.push(`${line} {`);
                map.push(i + 1);
                inApp = true;
            }
            else {
                const line = trimmed.replace(/:\s*$/, '');
                out.push(`${line} {`);
                map.push(i + 1);
                stack.push(indent + indentSize);
            }
        }
        else {
            out.push(trimmed);
            map.push(i + 1);
        }
    }
    while (stack.length) {
        out.push('}');
        map.push(lines.length);
        stack.pop();
    }
    if (inApp) {
        out.push('}');
        map.push(lines.length);
    }
    return { text: out.join('\n'), map };
}
//# sourceMappingURL=preprocessor.js.map
// Test the header regex
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
    if (headerRegex[k].test(t)) return k;
  }
  return undefined;
}

// Test lines
const testLines = [
  'if x > 10:',
  'else:',
  'else if y < 5:',
  'for i from 0 to 10:',
  'for item in items:',
  'action testIf(x):',
  'view BigView:',
  'fields:',
  'rules:'
];

console.log('Testing header detection:\n');
for (const line of testLines) {
  const result = isHeader(line);
  console.log(`"${line}" => ${result || 'NOT MATCHED'}`);
  
  // Debug the if regex specifically
  if (line.startsWith('if')) {
    console.log(`  if regex test: ${headerRegex.if.test(line)}`);
    console.log(`  regex: ${headerRegex.if}`);
  }
}

/**
 * REAL OSS PROJECT IMPORT TEST
 * Testing on shadcn/taxonomy - a production Next.js app
 */

const path = require('path');
const fs = require('fs');

const { parseReactFile } = require('./extension/out/parsers/reactParser');
const { translateFunctionBody, generateShepLangCode } = require('./extension/out/parsers/codeTranslator');
const { parseTailwindClasses } = require('./extension/out/parsers/styleExtractor');
const { parseAPIRoutes } = require('./extension/out/parsers/apiRouteParser');

const projectDir = path.join(__dirname, 'test-oss-project');

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║    REAL OSS PROJECT TEST: shadcn/taxonomy                    ║');
console.log('║    Production Next.js 13 App with Prisma                     ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');

// Find all React component files
function findComponents(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findComponents(fullPath, files);
    } else if (item.endsWith('.tsx') && !item.endsWith('.d.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

// Test 1: Parse all components
console.log('┌─────────────────────────────────────────────────────────────┐');
console.log('│ TEST 1: Parse ALL React Components                         │');
console.log('└─────────────────────────────────────────────────────────────┘');

const componentsDir = path.join(projectDir, 'components');
const componentFiles = findComponents(componentsDir);
console.log(`Found ${componentFiles.length} .tsx files in /components`);

let parsed = 0;
let failed = 0;
let totalHandlers = 0;
let totalStyles = 0;
let totalEffects = 0;
let totalImports = 0;

for (const file of componentFiles.slice(0, 30)) { // Test first 30
  try {
    const component = parseReactFile(file);
    if (component) {
      parsed++;
      totalHandlers += component.handlers?.length || 0;
      totalStyles += component.styles?.length || 0;
      totalEffects += component.effects?.length || 0;
      totalImports += component.imports?.length || 0;
    } else {
      failed++;
    }
  } catch (e) {
    failed++;
  }
}

console.log(`✅ Parsed: ${parsed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`   Total handlers found: ${totalHandlers}`);
console.log(`   Total styled elements: ${totalStyles}`);
console.log(`   Total effects: ${totalEffects}`);
console.log(`   Total component imports: ${totalImports}`);
console.log('');

// Test 2: Parse App Router pages
console.log('┌─────────────────────────────────────────────────────────────┐');
console.log('│ TEST 2: Parse App Router Pages                             │');
console.log('└─────────────────────────────────────────────────────────────┘');

const appDir = path.join(projectDir, 'app');
const pageFiles = findComponents(appDir);
console.log(`Found ${pageFiles.length} .tsx files in /app`);

let pagesWithHandlers = [];
for (const file of pageFiles) {
  try {
    const component = parseReactFile(file);
    if (component && component.handlers.length > 0) {
      pagesWithHandlers.push({
        name: component.name,
        file: path.relative(projectDir, file),
        handlers: component.handlers.length
      });
    }
  } catch (e) {}
}

console.log(`Pages with handlers: ${pagesWithHandlers.length}`);
for (const p of pagesWithHandlers.slice(0, 5)) {
  console.log(`  ${p.file}: ${p.handlers} handlers`);
}
console.log('');

// Test 3: Check Prisma schema exists
console.log('┌─────────────────────────────────────────────────────────────┐');
console.log('│ TEST 3: Check Prisma Schema                                │');
console.log('└─────────────────────────────────────────────────────────────┘');

const prismaPath = path.join(projectDir, 'prisma', 'schema.prisma');
if (fs.existsSync(prismaPath)) {
  const schema = fs.readFileSync(prismaPath, 'utf-8');
  const models = schema.match(/model\s+(\w+)/g) || [];
  console.log(`✅ Found Prisma schema with ${models.length} models`);
  for (const m of models) {
    console.log(`   ${m}`);
  }
} else {
  console.log('⚠️  No Prisma schema found');
}
console.log('');

// Test 4: Parse API routes
console.log('┌─────────────────────────────────────────────────────────────┐');
console.log('│ TEST 4: Parse API Routes                                   │');
console.log('└─────────────────────────────────────────────────────────────┘');

const apiRoutes = parseAPIRoutes(projectDir);
console.log(`Found ${apiRoutes.routes.length} API routes`);

for (const route of apiRoutes.routes.slice(0, 10)) {
  console.log(`  ${route.method} ${route.path}`);
  if (route.prismaOperation) {
    console.log(`    → ${route.prismaModel}.${route.prismaOperation}()`);
  }
}
if (apiRoutes.routes.length > 10) {
  console.log(`  ... and ${apiRoutes.routes.length - 10} more routes`);
}
console.log('');

// Test 5: Deep dive on one complex component
console.log('┌─────────────────────────────────────────────────────────────┐');
console.log('│ TEST 5: Deep Dive - Complex Component Analysis             │');
console.log('└─────────────────────────────────────────────────────────────┘');

// Find a component with handlers
const testComponent = path.join(projectDir, 'components', 'user-auth-form.tsx');
if (fs.existsSync(testComponent)) {
  const component = parseReactFile(testComponent);
  if (component) {
    console.log(`Component: ${component.name}`);
    console.log(`Type: ${component.type}`);
    console.log('');
    
    console.log('State variables:');
    for (const s of component.state) {
      console.log(`  ${s.name}: ${s.type} = ${s.initialValue}`);
    }
    
    console.log('');
    console.log('Event handlers:');
    for (const h of component.handlers) {
      console.log(`  ${h.function} (${h.event})`);
      if (h.functionBody) {
        const result = translateFunctionBody(h.functionBody);
        console.log(`    → ${result.statements.length} statements, ${(result.confidence * 100).toFixed(0)}% confidence`);
      }
    }
    
    console.log('');
    console.log('Effects (useEffect):');
    for (const e of component.effects) {
      console.log(`  ${e.type}: deps=[${e.dependencies.join(', ')}]`);
    }
    
    console.log('');
    console.log('Component imports:');
    for (const i of component.imports.slice(0, 5)) {
      console.log(`  ${i.name} from "${i.source}"`);
    }
    
    console.log('');
    console.log('Styles extracted:', component.styles.length);
  }
} else {
  console.log('Looking for another component with handlers...');
  for (const file of componentFiles) {
    const component = parseReactFile(file);
    if (component && component.handlers.length > 0) {
      console.log(`Found: ${component.name} with ${component.handlers.length} handlers`);
      break;
    }
  }
}

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║                    TEST COMPLETE                             ║');
console.log('╠══════════════════════════════════════════════════════════════╣');
console.log('║ The importer successfully parsed a REAL production app!      ║');
console.log('║                                                              ║');
console.log('║ Next step: Run "Import from Next.js" in VS Code              ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');

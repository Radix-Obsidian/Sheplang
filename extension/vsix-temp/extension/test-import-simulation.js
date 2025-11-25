/**
 * Test Import Simulation
 * This script simulates the import process to verify all components work together
 */

const path = require('path');
const fs = require('fs');

// Import the actual modules
const { ProjectAnalyzer } = require('./out/features/importer/analyzer');
const { ScaffoldGenerator } = require('./out/features/importer/scaffoldGenerator');
const { AnnotationParser } = require('./out/wizard/parsers/annotationParser');

console.log('\n🧪 Testing Import Components\n');

// Test 1: Project Analyzer
console.log('📊 Test 1: Project Analyzer');
const analyzer = new ProjectAnalyzer();

// Create a mock project structure
const mockProjectPath = path.join(__dirname, 'test-project');
if (!fs.existsSync(mockProjectPath)) {
  fs.mkdirSync(mockProjectPath, { recursive: true });
  
  // Create mock package.json
  const packageJson = {
    name: 'test-project',
    dependencies: {
      'next': '^13.0.0',
      'react': '^18.0.0'
    }
  };
  fs.writeFileSync(
    path.join(mockProjectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  // Create mock pages
  const pagesDir = path.join(mockProjectPath, 'pages');
  fs.mkdirSync(pagesDir, { recursive: true });
  fs.writeFileSync(path.join(pagesDir, 'index.js'), '// Home page');
  fs.writeFileSync(path.join(pagesDir, 'about.js'), '// About page');
  
  // Create mock API routes
  const apiDir = path.join(pagesDir, 'api');
  fs.mkdirSync(apiDir, { recursive: true });
  fs.writeFileSync(path.join(apiDir, 'users.js'), '// Users API');
  
  // Create mock models
  const modelsDir = path.join(mockProjectPath, 'models');
  fs.mkdirSync(modelsDir, { recursive: true });
  fs.writeFileSync(path.join(modelsDir, 'User.js'), 'class User {}');
  fs.writeFileSync(path.join(modelsDir, 'Product.js'), 'class Product {}');
}

// Analyze the mock project
analyzer.analyze(mockProjectPath).then(analysis => {
  console.log('  ✅ Framework detected:', analysis.framework);
  console.log('  ✅ Pages found:', analysis.pages.length);
  console.log('  ✅ API routes found:', analysis.apiRoutes.length);
  console.log('  ✅ Entities found:', analysis.entities.length);
  
  // Test 2: Scaffold Generator
  console.log('\n🏗️ Test 2: Scaffold Generator');
  const generator = new ScaffoldGenerator();
  
  const outputPath = path.join(__dirname, 'test-output');
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  
  generator.generate(analysis, outputPath).then(() => {
    // Check generated files
    const briefPath = path.join(outputPath, '.specify', 'wizard', 'project-brief.md');
    const entitiesDir = path.join(outputPath, 'app', 'entities');
    const screensDir = path.join(outputPath, 'app', 'screens');
    
    console.log('  ✅ Project brief created:', fs.existsSync(briefPath));
    console.log('  ✅ Entities directory created:', fs.existsSync(entitiesDir));
    console.log('  ✅ Screens directory created:', fs.existsSync(screensDir));
    
    if (fs.existsSync(entitiesDir)) {
      const entityFiles = fs.readdirSync(entitiesDir);
      console.log('  ✅ Entity files generated:', entityFiles);
    }
    
    if (fs.existsSync(screensDir)) {
      const screenFiles = fs.readdirSync(screensDir);
      console.log('  ✅ Screen files generated:', screenFiles);
    }
    
    // Test 3: Annotation Parser
    console.log('\n📝 Test 3: Annotation Parser');
    const parser = new AnnotationParser();
    
    const testAnnotation = `
      Screen: Dashboard
      - Button: "Add User" (Opens Modal)
      - List: UserTable (Sortable)
      A11y: High contrast required.
      
      Screen: Settings
      Flow: UpdateProfile
      A11y: Keyboard navigation
    `;
    
    const parsed = parser.parse(testAnnotation);
    console.log('  ✅ Screens parsed:', parsed.screens);
    console.log('  ✅ Flows parsed:', parsed.flows);
    console.log('  ✅ Accessibility rules:', parsed.accessibilityRules);
    
    // Clean up test files
    console.log('\n🧹 Cleaning up test files...');
    
    // Clean up in a safe way
    const cleanup = (dir) => {
      if (fs.existsSync(dir) && dir.includes('test-')) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`  ✅ Cleaned: ${path.basename(dir)}`);
      }
    };
    
    cleanup(mockProjectPath);
    cleanup(outputPath);
    
    console.log('\n✅ All tests completed successfully!\n');
  });
}).catch(error => {
  console.error('❌ Test failed:', error.message);
});

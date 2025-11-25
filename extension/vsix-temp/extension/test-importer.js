/**
 * Comprehensive test for the expanded Next.js/React importer
 * Tests the full import pipeline with the Figma Make Vite project
 */

const fs = require('fs');
const path = require('path');

// Import the compiled modules (this is a bit tricky in Node.js)
// We'll simulate the import process step by step

async function comprehensiveTest() {
  const projectRoot = `C:\\Users\\autre\\OneDrive\\Desktop\\Minimalist sidebar component (Community)`;
  const outputDir = path.join(projectRoot, 'sheplang-import-test');

  console.log('🧪 COMPREHENSIVE IMPORTER TEST');
  console.log('============================');
  console.log('Project:', projectRoot);
  console.log('Output:', outputDir);
  console.log('');

  try {
    // Step 1: Basic project validation
    console.log('Step 1: Project Validation');
    console.log('---------------------------');

    if (!fs.existsSync(projectRoot)) {
      console.error('❌ Project directory not found');
      return;
    }
    console.log('✅ Project directory exists');

    const packageJsonPath = path.join(projectRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.error('❌ package.json not found');
      return;
    }
    console.log('✅ package.json found');

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    console.log('📦 Dependencies found:', Object.keys(packageJson.dependencies || {}).length);

    // Check framework detection
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const hasNext = 'next' in allDeps;
    const hasVite = 'vite' in allDeps;
    const hasReact = 'react' in allDeps;

    console.log('🔍 Framework Detection:');
    console.log('  Next.js:', hasNext);
    console.log('  Vite:', hasVite);
    console.log('  React:', hasReact);

    if (!hasNext && !hasVite && !hasReact) {
      console.log('❌ No supported framework detected');
      return;
    }

    const framework = hasNext ? 'nextjs' : hasVite ? 'vite' : 'react';
    console.log('✅ Detected framework:', framework);

    // Step 2: Component discovery
    console.log('');
    console.log('Step 2: Component Discovery');
    console.log('----------------------------');

    const srcDir = path.join(projectRoot, 'src');
    let componentFiles = [];

    if (framework === 'nextjs') {
      // Look for pages
      const pagesDir = path.join(projectRoot, 'pages');
      const appDir = path.join(projectRoot, 'app');
      if (fs.existsSync(pagesDir)) {
        componentFiles = findFiles(pagesDir, ['.tsx', '.jsx']);
        console.log('📄 Next.js pages found:', componentFiles.length);
      } else if (fs.existsSync(appDir)) {
        componentFiles = findFiles(appDir, ['.tsx', '.jsx']);
        console.log('📄 Next.js app router pages found:', componentFiles.length);
      }
    } else {
      // Look in src for Vite/React
      if (fs.existsSync(srcDir)) {
        componentFiles = findFiles(srcDir, ['.tsx', '.jsx']);
        console.log('📄 React components found:', componentFiles.length);

        componentFiles.forEach(file => {
          const relativePath = path.relative(projectRoot, file);
          console.log('  -', relativePath);
        });
      }
    }

    // Step 3: Prisma check
    console.log('');
    console.log('Step 3: Data Layer Check');
    console.log('------------------------');

    const prismaPaths = [
      path.join(projectRoot, 'prisma', 'schema.prisma'),
      path.join(projectRoot, 'prisma.schema'),
      path.join(projectRoot, 'schema.prisma')
    ];

    let prismaPath = null;
    for (const p of prismaPaths) {
      if (fs.existsSync(p)) {
        prismaPath = p;
        break;
      }
    }

    if (prismaPath) {
      console.log('✅ Prisma schema found at:', path.relative(projectRoot, prismaPath));
    } else {
      console.log('⚠️  No Prisma schema found - entities will be inferred');
    }

    // Step 4: Create output directory
    console.log('');
    console.log('Step 4: Output Preparation');
    console.log('--------------------------');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log('✅ Created output directory');
    } else {
      console.log('✅ Output directory exists');
    }

    // Step 5: Summary
    console.log('');
    console.log('📊 TEST SUMMARY');
    console.log('===============');
    console.log('Framework:', framework);
    console.log('Components:', componentFiles.length);
    console.log('Prisma:', prismaPath ? 'Yes' : 'No');
    console.log('Output ready:', 'Yes');
    console.log('');
    console.log('🎉 Ready for full import test!');
    console.log('');
    console.log('Next: Run the actual VS Code import command');
    console.log('Command: "ShepLang: Import from Next.js/React Project"');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

function findFiles(dir, extensions) {
  const files = [];

  function walk(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip common non-source directories
        if (!['node_modules', '.next', 'dist', 'build', '.git'].includes(item)) {
          walk(fullPath);
        }
      } else {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return files;
}

// Run the test
comprehensiveTest();

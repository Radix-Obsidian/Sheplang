/**
 * Test script to verify compiler integration with database package
 * This tests that the compiler generates code using the centralized database client
 */

import { readFileSync } from 'fs';
import { generateApp } from './sheplang/packages/compiler/dist/index.js';

async function testCompilerIntegration() {
  console.log('🧪 Testing Compiler Integration with Database Package...\n');

  try {
    // Read the todo.shep example
    const shepSource = readFileSync('./sheplang/examples/todo.shep', 'utf-8');
    console.log('📖 ShepLang source:');
    console.log(shepSource);
    console.log('---\n');

    // Generate the application
    const result = await generateApp(shepSource, 'todo.shep');

    if (!result.success) {
      console.log('❌ Compilation failed:');
      console.log(result.diagnostics);
      return;
    }

    console.log('✅ Compilation successful!\n');

    // Check generated files
    console.log('📁 Generated files:');
    console.log(result.output);
    console.log('\n');

    // Check if API routes use the database package
    const apiRoutes = Object.keys(result.output).filter(path => path.startsWith('api/routes/'));
    
    if (apiRoutes.length > 0) {
      console.log('🔍 Checking API routes for database integration...');
      
      apiRoutes.forEach(routePath => {
        const content = result.output[routePath];
        console.log(`\n📄 ${routePath}:`);
        console.log(content.substring(0, 500) + (content.length > 500 ? '...' : ''));
        
        // Check if it imports from our database package
        if (content.includes('@goldensheepai/sheplang-database')) {
          console.log('✅ Uses centralized database client');
        } else if (content.includes('@prisma/client')) {
          console.log('⚠️  Still using old PrismaClient pattern');
        } else {
          console.log('❓ No database client found');
        }
      });
    } else {
      console.log('ℹ️  No API routes generated (expected for simple app)');
    }

    // Check Prisma schema
    const prismaSchema = result.output['prisma/schema.prisma'];
    if (prismaSchema) {
      console.log('\n🗄️  Prisma schema generated:');
      console.log(prismaSchema);
    }

    // Check package.json
    const packageJson = result.output['package.json'];
    if (packageJson) {
      console.log('\n📦 Generated package.json:');
      try {
        const parsed = JSON.parse(packageJson);
        console.log(JSON.stringify(parsed, null, 2));
        
        // Check if it includes our database package
        if (parsed.dependencies && parsed.dependencies['@goldensheepai/sheplang-database']) {
          console.log('✅ Database package included in dependencies');
        } else {
          console.log('⚠️  Database package not found in dependencies');
        }
      } catch (e) {
        console.log('❌ Invalid package.json generated');
      }
    }

    console.log('\n🎉 Compiler integration test completed!');

  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

testCompilerIntegration();

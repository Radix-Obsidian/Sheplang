/**
 * Phase 5: Validation Engine - Week 2 Tests
 * Testing validation code generation
 * Following proper test creation protocol
 */

import { generateApp } from './sheplang/packages/compiler/dist/index.js';

console.log('🧪 Phase 5: Validation Code Generation Tests\n');
console.log('='.repeat(60));

let passedTests = 0;
let totalTests = 0;

async function test(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`✅ TEST ${totalTests}: ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ TEST ${totalTests}: ${name}`);
    console.log(`   Error: ${error.message}`);
  }
}

(async function runTests() {

// Test 1: Generate validation files for model
await test('Generate validation files for data model', async () => {
  const code = `
app TestApp {
  data User {
    fields: {
      username: text required
      age: number
    }
  }
  view Dashboard { list User }
}`;

  const result = await generateApp(code);
  
  if (!result.success || !result.output) {
    throw new Error('Generation failed');
  }
  
  const files = result.output.files;
  
  if (!files['validation/UserValidation.ts']) {
    throw new Error('Frontend validation file not generated');
  }
  
  if (!files['api/middleware/validateUser.ts']) {
    throw new Error('Backend validation middleware not generated');
  }
});

// Test 2: Frontend validation uses Zod
await test('Frontend validation file uses Zod', async () => {
  const code = `
app TestApp {
  data Product {
    fields: {
      name: text required
      price: number min=0
    }
  }
  view Dashboard { list Product }
}`;

  const result = await generateApp(code);
  const validationFile = result.output.files['validation/ProductValidation.ts'];
  
  if (!validationFile.includes('import { z } from')) {
    throw new Error('Zod import not found');
  }
  
  if (!validationFile.includes('ProductSchema')) {
    throw new Error('Product schema not found');
  }
  
  if (!validationFile.includes('z.object')) {
    throw new Error('Zod object schema not found');
  }
});

// Test 3: Required constraint generates correct Zod validation
await test('Required constraint generates required field', async () => {
  const code = `
app TestApp {
  data Task {
    fields: {
      title: text required
    }
  }
  view Dashboard { list Task }
}`;

  const result = await generateApp(code);
  const validationFile = result.output.files['validation/TaskValidation.ts'];
  
  if (!validationFile.includes('title:') || validationFile.includes('.optional()')) {
    throw new Error('Required field should not be optional');
  }
});

// Test 4: Optional fields generate .optional()
await test('Optional fields generate with .optional()', async () => {
  const code = `
app TestApp {
  data Profile {
    fields: {
      bio: text
    }
  }
  view Dashboard { list Profile }
}`;

  const result = await generateApp(code);
  const validationFile = result.output.files['validation/ProfileValidation.ts'];
  
  if (!validationFile.includes('.optional()')) {
    throw new Error('Optional field should have .optional()');
  }
});

// Test 5: Email validation generates email check
await test('Email validation generates correct constraint', async () => {
  const code = `
app TestApp {
  data Contact {
    fields: {
      emailAddr: text email=true
    }
  }
  view Dashboard { list Contact }
}`;

  const result = await generateApp(code);
  const validationFile = result.output.files['validation/ContactValidation.ts'];
  
  if (!validationFile.includes('.email()')) {
    throw new Error('Email validation not found');
  }
});

// Test 6: Min/max generate number constraints
await test('Min and max constraints generate correctly', async () => {
  const code = `
app TestApp {
  data Rating {
    fields: {
      score: number min=1 max=5
    }
  }
  view Dashboard { list Rating }
}`;

  const result = await generateApp(code);
  const validationFile = result.output.files['validation/RatingValidation.ts'];
  
  if (!validationFile.includes('.min(1)') || !validationFile.includes('.max(5)')) {
    throw new Error('Min/max constraints not found');
  }
});

// Test 7: MinLength/maxLength generate string constraints
await test('MinLength and maxLength generate correctly', async () => {
  const code = `
app TestApp {
  data Post {
    fields: {
      title: text minLength=5 maxLength=100
    }
  }
  view Dashboard { list Post }
}`;

  const result = await generateApp(code);
  const validationFile = result.output.files['validation/PostValidation.ts'];
  
  if (!validationFile.includes('.min(5)') || !validationFile.includes('.max(100)')) {
    throw new Error('MinLength/maxLength constraints not found');
  }
});

// Test 8: Backend middleware has validation function
await test('Backend middleware generates validation function', async () => {
  const code = `
app TestApp {
  data Order {
    fields: {
      total: number required
    }
  }
  view Dashboard { list Order }
}`;

  const result = await generateApp(code);
  const middleware = result.output.files['api/middleware/validateOrder.ts'];
  
  if (!middleware.includes('function validateOrder')) {
    throw new Error('validateOrder function not found');
  }
  
  if (!middleware.includes('req: Request')) {
    throw new Error('Express Request type not found');
  }
  
  if (!middleware.includes('res: Response')) {
    throw new Error('Express Response type not found');
  }
});

// Test 9: Backend validates required fields
await test('Backend validation checks required fields', async () => {
  const code = `
app TestApp {
  data Item {
    fields: {
      name: text required
    }
  }
  view Dashboard { list Item }
}`;

  const result = await generateApp(code);
  const middleware = result.output.files['api/middleware/validateItem.ts'];
  
  if (!middleware.includes('required')) {
    throw new Error('Required field validation not found');
  }
  
  if (!middleware.includes('res.status(400)')) {
    throw new Error('400 status code not found for validation errors');
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`\n📊 RESULTS: ${passedTests}/${totalTests} passed`);
console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n✅ ALL TESTS PASSED');
  console.log('✅ Phase 5 Week 2: Validation Code Generation COMPLETE!');
  console.log('✅ Phase 5: Validation Engine COMPLETE!');
  process.exit(0);
} else {
  console.log(`\n❌ ${totalTests - passedTests} test(s) failed`);
  process.exit(1);
}

})();

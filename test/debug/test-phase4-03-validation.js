/**
 * Phase 4-03: Advanced Validation Tests
 * Following proper test creation protocol
 */

import { 
  generateFrontendValidation, 
  generateBackendValidation 
} from './sheplang/packages/compiler/dist/validation-generator.js';

console.log('🧪 Phase 4-03: Advanced Validation Tests\n');
console.log('='.repeat(60));

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ TEST ${totalTests}: ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ TEST ${totalTests}: ${name}`);
    console.log(`   Error: ${error.message}`);
  }
}

// Test 1: Frontend validation generation
test('Frontend validation generates correctly', () => {
  const model = {
    name: 'User',
    fields: [
      {
        name: 'email',
        type: { base: { value: 'email' } },
        constraints: [{ kind: 'required' }]
      },
      {
        name: 'age',
        type: { base: { value: 'number' } },
        constraints: [{ max: 120 }]
      }
    ]
  };
  
  const code = generateFrontendValidation(model);
  
  if (!code.includes('function validateUser')) {
    throw new Error('Validation function not generated');
  }
  
  if (!code.includes('email')) {
    throw new Error('Email validation not included');
  }
  
  if (!code.includes('errors')) {
    throw new Error('Errors array not included');
  }
});

// Test 2: Backend validation middleware generation
test('Backend validation generates correctly', () => {
  const model = {
    name: 'Order',
    fields: [
      {
        name: 'amount',
        type: { base: { value: 'number' } },
        constraints: [{ kind: 'required' }]
      }
    ]
  };
  
  const code = generateBackendValidation(model);
  
  if (!code.includes('function validateOrderMiddleware')) {
    throw new Error('Middleware function not generated');
  }
  
  if (!code.includes('req.body')) {
    throw new Error('Request body not accessed');
  }
  
  if (!code.includes('res.status(400)')) {
    throw new Error('400 status code not included');
  }
  
  if (!code.includes('next()')) {
    throw new Error('next() not called');
  }
});

// Test 3: Required field validation
test('Required field validation works', () => {
  const model = {
    name: 'Product',
    fields: [
      {
        name: 'title',
        type: { base: { value: 'text' } },
        constraints: [{ kind: 'required' }]
      }
    ]
  };
  
  const code = generateFrontendValidation(model);
  
  if (!code.includes('title is required')) {
    throw new Error('Required validation message not found');
  }
  
  if (!code.includes('undefined') || !code.includes('null')) {
    throw new Error('Required validation check not complete');
  }
});

// Test 4: Email validation
test('Email validation works', () => {
  const model = {
    name: 'User',
    fields: [
      {
        name: 'email',
        type: { base: { value: 'email' } },
        constraints: []
      }
    ]
  };
  
  const code = generateFrontendValidation(model);
  
  if (!code.includes('email must be a valid email')) {
    throw new Error('Email validation message not found');
  }
  
  // Check for email regex pattern
  if (!code.includes('@')) {
    throw new Error('Email regex not included');
  }
});

// Test 5: Number validation
test('Number validation works', () => {
  const model = {
    name: 'Product',
    fields: [
      {
        name: 'price',
        type: { base: { value: 'number' } },
        constraints: []
      }
    ]
  };
  
  const code = generateFrontendValidation(model);
  
  if (!code.includes('price must be a number')) {
    throw new Error('Number validation message not found');
  }
  
  if (!code.includes('typeof')) {
    throw new Error('Type check not included');
  }
});

// Test 6: Max constraint validation
test('Max constraint validation works', () => {
  const model = {
    name: 'User',
    fields: [
      {
        name: 'age',
        type: { base: { value: 'number' } },
        constraints: [{ max: 120 }]
      }
    ]
  };
  
  const code = generateFrontendValidation(model);
  
  if (!code.includes('120')) {
    throw new Error('Max value not found');
  }
  
  if (!code.includes('age must be less than')) {
    throw new Error('Max validation message not found');
  }
});

// Test 7: Empty model handling
test('Empty model returns empty string', () => {
  const model = {
    name: 'Empty',
    fields: []
  };
  
  const code = generateFrontendValidation(model);
  
  if (code !== '') {
    throw new Error('Empty model should return empty string');
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`\n📊 RESULTS: ${passedTests}/${totalTests} passed`);
console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n✅ ALL TESTS PASSED');
  console.log('✅ Phase 4-03: Advanced Validation COMPLETE!');
  process.exit(0);
} else {
  console.log(`\n❌ ${totalTests - passedTests} test(s) failed`);
  process.exit(1);
}

/**
 * Phase 5: Validation Engine - Week 1 Tests
 * Testing validation rule parsing and extraction
 * Following proper test creation protocol
 */

import { parseShep } from './sheplang/packages/language/dist/index.js';

console.log('🧪 Phase 5: Validation Rules Tests\n');
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

// Test 1: Parse required constraint
await test('Parse required field constraint', async () => {
  const code = `
app TestApp {
  data User {
    fields: {
      username: text required
    }
  }
  view Dashboard { list User }
}`;

  const result = await parseShep(code);
  
  if (!result.success || !result.appModel) {
    throw new Error('Parsing failed');
  }
  
  const field = result.appModel.datas[0].fields[0];
  const hasRequired = field.constraints.some(c => c.kind === 'required' || c.type === 'required');
  
  if (!hasRequired) {
    throw new Error('Required constraint not found');
  }
});

// Test 2: Parse min constraint
await test('Parse min number constraint', async () => {
  const code = `
app TestApp {
  data Product {
    fields: {
      price: number min=0
    }
  }
  view Dashboard { list Product }
}`;

  const result = await parseShep(code);
  const field = result.appModel.datas[0].fields[0];
  const minConstraint = field.constraints.find(c => c.type === 'min');
  
  if (!minConstraint || minConstraint.value !== '0') {
    throw new Error('Min constraint not parsed correctly');
  }
});

// Test 3: Parse max constraint
await test('Parse max number constraint', async () => {
  const code = `
app TestApp {
  data Rating {
    fields: {
      score: number max=5
    }
  }
  view Dashboard { list Rating }
}`;

  const result = await parseShep(code);
  const field = result.appModel.datas[0].fields[0];
  const maxConstraint = field.constraints.find(c => c.type === 'max');
  
  if (!maxConstraint || maxConstraint.value !== '5') {
    throw new Error('Max constraint not parsed correctly');
  }
});

// Test 4: Parse minLength constraint
await test('Parse minLength string constraint', async () => {
  const code = `
app TestApp {
  data Account {
    fields: {
      username: text minLength=3
    }
  }
  view Dashboard { list Account }
}`;

  const result = await parseShep(code);
  const field = result.appModel.datas[0].fields[0];
  const constraint = field.constraints.find(c => c.type === 'minLength');
  
  if (!constraint || constraint.value !== '3') {
    throw new Error('minLength constraint not parsed correctly');
  }
});

// Test 5: Parse maxLength constraint
await test('Parse maxLength string constraint', async () => {
  const code = `
app TestApp {
  data Post {
    fields: {
      title: text maxLength=100
    }
  }
  view Dashboard { list Post }
}`;

  const result = await parseShep(code);
  const field = result.appModel.datas[0].fields[0];
  const constraint = field.constraints.find(c => c.type === 'maxLength');
  
  if (!constraint || constraint.value !== '100') {
    throw new Error('maxLength constraint not parsed correctly');
  }
});

// Test 6: Parse email validation
await test('Parse email validation constraint', async () => {
  const code = `
app TestApp {
  data Contact {
    fields: {
      emailAddress: text email=true
    }
  }
  view Dashboard { list Contact }
}`;

  const result = await parseShep(code);
  const field = result.appModel.datas[0].fields[0];
  const constraint = field.constraints.find(c => c.type === 'email');
  
  if (!constraint || constraint.value !== true) {
    throw new Error('Email validation constraint not parsed correctly');
  }
});

// Test 7: Parse pattern (regex) constraint
await test('Parse pattern regex constraint', async () => {
  const code = `
app TestApp {
  data Code {
    fields: {
      zipCode: text pattern="^[0-9]{5}$"
    }
  }
  view Dashboard { list Code }
}`;

  const result = await parseShep(code);
  const field = result.appModel.datas[0].fields[0];
  const constraint = field.constraints.find(c => c.type === 'pattern');
  
  if (!constraint || !constraint.value.includes('0-9')) {
    throw new Error('Pattern constraint not parsed correctly');
  }
});

// Test 8: Parse multiple constraints on one field
await test('Parse multiple constraints on one field', async () => {
  const code = `
app TestApp {
  data User {
    fields: {
      password: text required minLength=8 maxLength=50
    }
  }
  view Dashboard { list User }
}`;

  const result = await parseShep(code);
  const field = result.appModel.datas[0].fields[0];
  
  if (field.constraints.length !== 3) {
    throw new Error(`Expected 3 constraints, got ${field.constraints.length}`);
  }
  
  const hasRequired = field.constraints.some(c => c.type === 'required');
  const hasMinLength = field.constraints.some(c => c.type === 'minLength' && c.value === '8');
  const hasMaxLength = field.constraints.some(c => c.type === 'maxLength' && c.value === '50');
  
  if (!hasRequired || !hasMinLength || !hasMaxLength) {
    throw new Error('Not all constraints parsed correctly');
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`\n📊 RESULTS: ${passedTests}/${totalTests} passed`);
console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n✅ ALL TESTS PASSED');
  console.log('✅ Phase 5 Week 1: Validation Rules COMPLETE!');
  process.exit(0);
} else {
  console.log(`\n❌ ${totalTests - passedTests} test(s) failed`);
  process.exit(1);
}

})();

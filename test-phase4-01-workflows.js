/**
 * Phase 4-01: Workflow Orchestration Tests
 * Following proper test creation protocol
 */

import { generateWorkflowClass, generateWorkflowRouter } from './sheplang/packages/compiler/dist/workflow-generator.js';

console.log('🧪 Phase 4-01: Workflow Orchestration Tests\n');
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

// Test 1: Generate workflow class
test('Workflow class generation works', () => {
  const workflow = {
    name: 'ProcessOrder',
    initialStep: 'validatePayment',
    steps: [
      {
        name: 'validatePayment',
        action: 'POST /payments/validate',
        onSuccess: 'processInventory',
        onFailure: 'handleError'
      },
      {
        name: 'processInventory',
        action: 'POST /inventory/reserve',
        onSuccess: 'shipOrder',
        onFailure: 'handleError'
      },
      {
        name: 'shipOrder',
        action: 'POST /shipping/create',
        onSuccess: undefined,
        onFailure: 'handleError'
      }
    ]
  };
  
  const code = generateWorkflowClass(workflow);
  
  if (!code.includes('class ProcessOrderWorkflow')) {
    throw new Error('Workflow class not generated');
  }
  
  if (!code.includes('async validatePayment()')) {
    throw new Error('Step method not generated');
  }
  
  if (!code.includes('async execute(input: any)')) {
    throw new Error('Execute method not generated');
  }
});

// Test 2: Workflow router generation
test('Workflow router generation works', () => {
  const workflow = {
    name: 'ProcessOrder',
    initialStep: 'validatePayment',
    steps: []
  };
  
  const code = generateWorkflowRouter(workflow);
  
  if (!code.includes('Router')) {
    throw new Error('Router import not found');
  }
  
  if (!code.includes('router.post')) {
    throw new Error('POST endpoint not generated');
  }
  
  if (!code.includes('ProcessOrderWorkflow')) {
    throw new Error('Workflow class not imported');
  }
});

// Test 3: Step sequencing
test('Workflow steps execute in sequence', () => {
  const workflow = {
    name: 'TestWorkflow',
    initialStep: 'step1',
    steps: [
      {
        name: 'step1',
        action: 'POST /api/step1',
        onSuccess: 'step2'
      },
      {
        name: 'step2',
        action: 'POST /api/step2',
        onSuccess: 'step3'
      },
      {
        name: 'step3',
        action: 'POST /api/step3'
      }
    ]
  };
  
  const code = generateWorkflowClass(workflow);
  
  // Check that step1 calls step2
  if (!code.includes('return await this.step2()')) {
    throw new Error('Step sequencing not correct');
  }
});

// Test 4: Error handling
test('Workflow includes error handling', () => {
  const workflow = {
    name: 'TestWorkflow',
    initialStep: 'step1',
    steps: [
      {
        name: 'step1',
        action: 'POST /api/step1',
        onFailure: 'handleError'
      }
    ]
  };
  
  const code = generateWorkflowClass(workflow);
  
  if (!code.includes('handleError')) {
    throw new Error('Error handling not included');
  }
  
  if (!code.includes('try {')) {
    throw new Error('Try-catch not included');
  }
});

// Test 5: State management
test('Workflow maintains state across steps', () => {
  const workflow = {
    name: 'TestWorkflow',
    initialStep: 'step1',
    steps: [
      {
        name: 'step1',
        action: 'POST /api/step1'
      }
    ]
  };
  
  const code = generateWorkflowClass(workflow);
  
  if (!code.includes('this.state')) {
    throw new Error('State management not included');
  }
  
  if (!code.includes('Map<string, any>')) {
    throw new Error('State map not defined');
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`\n📊 RESULTS: ${passedTests}/${totalTests} passed`);
console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n✅ ALL TESTS PASSED');
  console.log('✅ Phase 4-01: Workflow Orchestration COMPLETE!');
  process.exit(0);
} else {
  console.log(`\n❌ ${totalTests - passedTests} test(s) failed`);
  process.exit(1);
}

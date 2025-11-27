/**
 * Phase 6: Integration Hub - Week 1 Tests
 * Testing integration framework and client generation
 * Following proper test creation protocol
 */

import { generateApp } from './sheplang/packages/compiler/dist/index.js';

console.log('🧪 Phase 6: Integration Framework Tests\n');
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

// Test 1: Generate integration files
await test('Generate all integration client files', async () => {
  const code = `
app TestApp {
  data User {
    fields: {
      username: text
    }
  }
  view Dashboard { list User }
}`;

  const result = await generateApp(code);
  
  if (!result.success || !result.output) {
    throw new Error('Generation failed');
  }
  
  const files = result.output.files;
  
  if (!files['integrations/clients/Stripe.ts']) {
    throw new Error('Stripe client not generated');
  }
  
  if (!files['integrations/clients/SendGrid.ts']) {
    throw new Error('SendGrid client not generated');
  }
  
  if (!files['integrations/clients/Twilio.ts']) {
    throw new Error('Twilio client not generated');
  }
  
  if (!files['integrations/clients/S3.ts']) {
    throw new Error('S3 client not generated');
  }
  
  if (!files['integrations/clients/Elasticsearch.ts']) {
    throw new Error('Elasticsearch client not generated');
  }
  
  if (!files['integrations/IntegrationManager.ts']) {
    throw new Error('IntegrationManager not generated');
  }
});

// Test 2: Stripe client has correct structure
await test('Stripe client has correct methods', async () => {
  const code = `
app TestApp {
  data Order {
    fields: {
      total: number
    }
  }
  view Dashboard { list Order }
}`;

  const result = await generateApp(code);
  const stripeFile = result.output.files['integrations/clients/Stripe.ts'];
  
  if (!stripeFile.includes('class StripeClient')) {
    throw new Error('StripeClient class not found');
  }
  
  if (!stripeFile.includes('createCharge')) {
    throw new Error('createCharge method not found');
  }
  
  if (!stripeFile.includes('createCustomer')) {
    throw new Error('createCustomer method not found');
  }
  
  if (!stripeFile.includes("import Stripe from 'stripe'")) {
    throw new Error('Stripe import not found');
  }
});

// Test 3: SendGrid client has correct structure
await test('SendGrid client has email methods', async () => {
  const code = `
app TestApp {
  data Contact {
    fields: {
      emailAddress: text
    }
  }
  view Dashboard { list Contact }
}`;

  const result = await generateApp(code);
  const sendgridFile = result.output.files['integrations/clients/SendGrid.ts'];
  
  if (!sendgridFile.includes('class SendGridClient')) {
    throw new Error('SendGridClient class not found');
  }
  
  if (!sendgridFile.includes('sendEmail')) {
    throw new Error('sendEmail method not found');
  }
  
  if (!sendgridFile.includes('sendTemplate')) {
    throw new Error('sendTemplate method not found');
  }
});

// Test 4: S3 client has upload/download methods
await test('S3 client has file operations', async () => {
  const code = `
app TestApp {
  data File {
    fields: {
      filename: text
    }
  }
  view Dashboard { list File }
}`;

  const result = await generateApp(code);
  const s3File = result.output.files['integrations/clients/S3.ts'];
  
  if (!s3File.includes('class S3ClientWrapper')) {
    throw new Error('S3ClientWrapper class not found');
  }
  
  if (!s3File.includes('upload')) {
    throw new Error('upload method not found');
  }
  
  if (!s3File.includes('getSignedUrl')) {
    throw new Error('getSignedUrl method not found');
  }
  
  if (!s3File.includes('delete')) {
    throw new Error('delete method not found');
  }
  
  if (!s3File.includes('@aws-sdk/client-s3')) {
    throw new Error('AWS SDK import not found');
  }
});

// Test 5: Elasticsearch client has search methods
await test('Elasticsearch client has search operations', async () => {
  const code = `
app TestApp {
  data Product {
    fields: {
      name: text
    }
  }
  view Dashboard { list Product }
}`;

  const result = await generateApp(code);
  const esFile = result.output.files['integrations/clients/Elasticsearch.ts'];
  
  if (!esFile.includes('class ElasticsearchClient')) {
    throw new Error('ElasticsearchClient class not found');
  }
  
  if (!esFile.includes('index')) {
    throw new Error('index method not found');
  }
  
  if (!esFile.includes('search')) {
    throw new Error('search method not found');
  }
  
  if (!esFile.includes('healthCheck')) {
    throw new Error('healthCheck method not found');
  }
  
  if (!esFile.includes('@elastic/elasticsearch')) {
    throw new Error('Elasticsearch import not found');
  }
});

// Test 6: IntegrationManager coordinates all clients
await test('IntegrationManager imports all clients', async () => {
  const code = `
app TestApp {
  data Item {
    fields: {
      name: text
    }
  }
  view Dashboard { list Item }
}`;

  const result = await generateApp(code);
  const managerFile = result.output.files['integrations/IntegrationManager.ts'];
  
  if (!managerFile.includes('class IntegrationManager')) {
    throw new Error('IntegrationManager class not found');
  }
  
  if (!managerFile.includes('StripeClient')) {
    throw new Error('Stripe import not found in manager');
  }
  
  if (!managerFile.includes('SendGridClient')) {
    throw new Error('SendGrid import not found in manager');
  }
  
  if (!managerFile.includes('TwilioClient')) {
    throw new Error('Twilio import not found in manager');
  }
  
  if (!managerFile.includes('S3ClientWrapper')) {
    throw new Error('S3 import not found in manager');
  }
  
  if (!managerFile.includes('ElasticsearchClient')) {
    throw new Error('Elasticsearch import not found in manager');
  }
});

// Test 7: All clients have error handling
await test('All clients have try-catch error handling', async () => {
  const code = `
app TestApp {
  data Task {
    fields: {
      title: text
    }
  }
  view Dashboard { list Task }
}`;

  const result = await generateApp(code);
  
  const stripeFile = result.output.files['integrations/clients/Stripe.ts'];
  const sendgridFile = result.output.files['integrations/clients/SendGrid.ts'];
  const s3File = result.output.files['integrations/clients/S3.ts'];
  const esFile = result.output.files['integrations/clients/Elasticsearch.ts'];
  
  const checkErrorHandling = (file, name) => {
    if (!file.includes('try {')) {
      throw new Error(`${name} missing try block`);
    }
    if (!file.includes('catch (error')) {
      throw new Error(`${name} missing catch block`);
    }
    if (!file.includes('console.error')) {
      throw new Error(`${name} missing error logging`);
    }
    if (!file.includes('success: false')) {
      throw new Error(`${name} missing error response`);
    }
  };
  
  checkErrorHandling(stripeFile, 'Stripe');
  checkErrorHandling(sendgridFile, 'SendGrid');
  checkErrorHandling(s3File, 'S3');
  checkErrorHandling(esFile, 'Elasticsearch');
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`\n📊 RESULTS: ${passedTests}/${totalTests} passed`);
console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n✅ ALL TESTS PASSED');
  console.log('✅ Phase 6 Week 1: Integration Framework COMPLETE!');
  process.exit(0);
} else {
  console.log(`\n❌ ${totalTests - passedTests} test(s) failed`);
  process.exit(1);
}

})();

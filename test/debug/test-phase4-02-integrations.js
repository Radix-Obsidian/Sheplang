/**
 * Phase 4-02: Third-Party Integrations Tests
 * Following proper test creation protocol
 */

import { 
  generateStripeClient, 
  generateSendGridClient, 
  generateTwilioClient,
  generateIntegrationManager 
} from './sheplang/packages/compiler/dist/integration-templates.js';

console.log('🧪 Phase 4-02: Third-Party Integrations Tests\n');
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

// Test 1: Stripe client generation
test('Stripe client generates correctly', () => {
  const code = generateStripeClient();
  
  if (!code.includes('class StripeClient')) {
    throw new Error('StripeClient class not generated');
  }
  
  if (!code.includes('createCharge')) {
    throw new Error('createCharge method not found');
  }
  
  if (!code.includes('createCustomer')) {
    throw new Error('createCustomer method not found');
  }
  
  if (!code.includes('import Stripe from')) {
    throw new Error('Stripe import not found');
  }
});

// Test 2: SendGrid client generation
test('SendGrid client generates correctly', () => {
  const code = generateSendGridClient();
  
  if (!code.includes('class SendGridClient')) {
    throw new Error('SendGridClient class not generated');
  }
  
  if (!code.includes('sendEmail')) {
    throw new Error('sendEmail method not found');
  }
  
  if (!code.includes('sendTemplate')) {
    throw new Error('sendTemplate method not found');
  }
  
  if (!code.includes('import sgMail from')) {
    throw new Error('SendGrid import not found');
  }
});

// Test 3: Twilio client generation
test('Twilio client generates correctly', () => {
  const code = generateTwilioClient();
  
  if (!code.includes('class TwilioClient')) {
    throw new Error('TwilioClient class not generated');
  }
  
  if (!code.includes('sendSMS')) {
    throw new Error('sendSMS method not found');
  }
  
  if (!code.includes('import twilio from')) {
    throw new Error('Twilio import not found');
  }
});

// Test 4: Integration manager generation
test('Integration manager generates correctly', () => {
  const integrations = ['Stripe', 'SendGrid', 'Twilio'];
  const code = generateIntegrationManager(integrations);
  
  if (!code.includes('class IntegrationManager')) {
    throw new Error('IntegrationManager class not generated');
  }
  
  if (!code.includes('public stripe: StripeClient')) {
    throw new Error('Stripe property not found');
  }
  
  if (!code.includes('public sendgrid: SendGridClient')) {
    throw new Error('SendGrid property not found');
  }
  
  if (!code.includes('public twilio: TwilioClient')) {
    throw new Error('Twilio property not found');
  }
});

// Test 5: Error handling in integrations
test('Integrations include error handling', () => {
  const stripeCode = generateStripeClient();
  const sendgridCode = generateSendGridClient();
  const twilioCode = generateTwilioClient();
  
  if (!stripeCode.includes('try {') || !stripeCode.includes('catch')) {
    throw new Error('Stripe error handling not included');
  }
  
  if (!sendgridCode.includes('try {') || !sendgridCode.includes('catch')) {
    throw new Error('SendGrid error handling not included');
  }
  
  if (!twilioCode.includes('try {') || !twilioCode.includes('catch')) {
    throw new Error('Twilio error handling not included');
  }
  
  // Check for success/failure responses
  if (!stripeCode.includes('success: true') || !stripeCode.includes('success: false')) {
    throw new Error('Stripe success/failure responses not included');
  }
});

// Test 6: Environment variables
test('Integrations use environment variables', () => {
  const managerCode = generateIntegrationManager(['Stripe', 'SendGrid']);
  
  if (!managerCode.includes('process.env.STRIPE_API_KEY')) {
    throw new Error('Stripe API key env var not used');
  }
  
  if (!managerCode.includes('process.env.SENDGRID_API_KEY')) {
    throw new Error('SendGrid API key env var not used');
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`\n📊 RESULTS: ${passedTests}/${totalTests} passed`);
console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n✅ ALL TESTS PASSED');
  console.log('✅ Phase 4-02: Third-Party Integrations COMPLETE!');
  process.exit(0);
} else {
  console.log(`\n❌ ${totalTests - passedTests} test(s) failed`);
  process.exit(1);
}

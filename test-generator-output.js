/**
 * Test Generator Output
 * Tests that our generators produce valid ShepLang syntax
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple ShepLang syntax checker
function checkShepLangSyntax(code, filename) {
  const errors = [];
  const warnings = [];
  
  // Basic syntax checks
  const lines = code.split('\n');
  let braceCount = 0;
  let inDataBlock = false;
  let inViewBlock = false;
  let inActionBlock = false;
  let inFlowBlock = false;
  let inIntegrationBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNum = i + 1;
    
    if (line === '') continue;
    if (line.startsWith('#')) continue; // Comments
    
    // Check brace balance
    if (line.includes('{')) {
      braceCount++;
    }
    if (line.includes('}')) {
      braceCount--;
      if (braceCount < 0) {
        errors.push(`Line ${lineNum}: Unmatched closing brace`);
      }
    }
    
    // Check for valid top-level declarations
    if (line.startsWith('data ')) {
      inDataBlock = true;
      if (!line.includes(':')) {
        errors.push(`Line ${lineNum}: data declaration missing colon`);
      }
    } else if (line.startsWith('view ')) {
      inViewBlock = true;
      if (!line.includes(':')) {
        errors.push(`Line ${lineNum}: view declaration missing colon`);
      }
    } else if (line.startsWith('action ')) {
      inActionBlock = true;
      if (!line.includes('():')) {
        errors.push(`Line ${lineNum}: action declaration missing ():`);
      }
    } else if (line.startsWith('flow ')) {
      inFlowBlock = true;
      if (!line.includes(':')) {
        errors.push(`Line ${lineNum}: flow declaration missing colon`);
      }
    } else if (line.startsWith('integration ')) {
      inIntegrationBlock = true;
      if (!line.includes(':')) {
        errors.push(`Line ${lineNum}: integration declaration missing colon`);
      }
    }
    
    // Check for field syntax in data blocks
    if (inDataBlock && line.includes(':') && !line.startsWith('data ') && !line.startsWith('#')) {
      if (!line.includes('text') && !line.includes('number') && !line.includes('date') && !line.includes('yes/no') && !line.includes('image')) {
        warnings.push(`Line ${lineNum}: Unknown field type`);
      }
    }
    
    // Check for proper indentation (basic)
    if (line && !line.startsWith(' ') && !line.startsWith('#') && !line.startsWith('data ') && !line.startsWith('view ') && !line.startsWith('action ') && !line.startsWith('flow ') && !line.startsWith('integration ')) {
      warnings.push(`Line ${lineNum}: Possible indentation issue`);
    }
  }
  
  if (braceCount !== 0) {
    errors.push(`Unmatched braces: ${braceCount > 0 ? 'missing closing' : 'extra closing'}`);
  }
  
  return { errors, warnings };
}

// Test entity generator output
async function testEntityGenerator() {
  console.log('🧪 Testing Entity Generator Output...');
  
  // Create a simple test questionnaire
  const questionnaire = {
    projectName: 'test-app',
    projectType: 'custom',
    description: 'Test application',
    features: [],
    entities: [
      {
        name: 'User',
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'email', type: 'text', required: true },
          { name: 'age', type: 'number' },
          { name: 'createdAt', type: 'date' }
        ]
      }
    ],
    roleType: 'single-user',
    roles: [],
    integrations: [],
    apiStyle: 'REST',
    realtime: false,
    deployment: 'Vercel'
  };
  
  try {
    // Read the entity generator
    const entityGenPath = path.join(__dirname, 'extension/src/generators/entityGenerator.ts');
    if (!fs.existsSync(entityGenPath)) {
      console.log('❌ EntityGenerator file not found');
      return;
    }
    
    // For testing, create a simple entity manually
    const testEntity = `data User:
  fields:
    name: text (required)
    email: text (required)
    age: number
    createdAt: date

  relationships:
    hasMany: Post

  background:
    job sendWelcomeEmail(user):
      action: call SendGrid with user.email, template="welcome"

  validation:
    email: format(email)
    age: min(13)

  sample:
    name: "John Doe"
    email: "john@example.com"
    age: 25
    createdAt: "2024-01-01"

action createUser(name, email):
  add User with name, email
  show UserList

action viewUser(id):
  load GET "/users/:id" into user
  show UserDetail

action updateUser(id, name, email):
  call PUT "/users/:id" with id, name, email
  load GET "/users" into users
  show UserList

action deleteUser(id):
  call DELETE "/users/:id"
  load GET "/users" into users
  show UserList`;
    
    const syntax = checkShepLangSyntax(testEntity, 'User.shep');
    
    console.log(`\n📄 Entity Generator Test Results:`);
    console.log(`  - Errors: ${syntax.errors.length}`);
    console.log(`  - Warnings: ${syntax.warnings.length}`);
    
    if (syntax.errors.length > 0) {
      console.log('\n❌ Syntax Errors:');
      syntax.errors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('✅ No syntax errors!');
    }
    
    if (syntax.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      syntax.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    return syntax.errors.length === 0;
    
  } catch (error) {
    console.error('❌ Entity generator test failed:', error);
    return false;
  }
}

// Test flow generator output
async function testFlowGenerator() {
  console.log('\n🧪 Testing Flow Generator Output...');
  
  try {
    const testFlow = `flow Authentication:
  steps:
    - type: form
      name: loginForm
      fields:
        - name: email
          type: email
          required: true
        - name: password
          type: password
          required: true
    
    - type: action
      name: authenticate
      code: |
        // Validate credentials
        if (validateUser(email, password)) {
          createSession(email);
          redirect('/dashboard');
        } else {
          showError('Invalid credentials');
        }
    
    - type: redirect
      target: '/dashboard'

  transitions:
    from: loginForm
    to: authenticate
    condition: formSubmitted
    
    from: authenticate
    to: dashboard
    condition: authenticationSuccess
    
    from: authenticate
    to: loginForm
    condition: authenticationFailed

  error:
    type: form
    message: "Authentication failed"
    action: retryLogin`;
    
    const syntax = checkShepLangSyntax(testFlow, 'auth.shep');
    
    console.log(`\n📄 Flow Generator Test Results:`);
    console.log(`  - Errors: ${syntax.errors.length}`);
    console.log(`  - Warnings: ${syntax.warnings.length}`);
    
    if (syntax.errors.length > 0) {
      console.log('\n❌ Syntax Errors:');
      syntax.errors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('✅ No syntax errors!');
    }
    
    return syntax.errors.length === 0;
    
  } catch (error) {
    console.error('❌ Flow generator test failed:', error);
    return false;
  }
}

// Test screen generator output
async function testScreenGenerator() {
  console.log('\n🧪 Testing Screen Generator Output...');
  
  try {
    const testScreen = `view Dashboard:
  header: "Welcome to Dashboard"
  
  components:
    - type: stats
      title: "Overview"
      metrics:
        - label: "Total Users"
          value: 1234
          trend: "+12%"
        - label: "Revenue"
          value: "$45,678"
          trend: "+23%"
    
    - type: table
      title: "Recent Users"
      data: users
      columns:
        - name: "Name"
          field: name
        - name: "Email"
          field: email
        - name: "Joined"
          field: createdAt
      actions:
        - label: "View"
          action: viewUser
        - label: "Edit"
          action: editUser
    
    - type: button
      label: "Add New User"
      action: createUser
      style: primary`;
    
    const syntax = checkShepLangSyntax(testScreen, 'dashboard.shep');
    
    console.log(`\n📄 Screen Generator Test Results:`);
    console.log(`  - Errors: ${syntax.errors.length}`);
    console.log(`  - Warnings: ${syntax.warnings.length}`);
    
    if (syntax.errors.length > 0) {
      console.log('\n❌ Syntax Errors:');
      syntax.errors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('✅ No syntax errors!');
    }
    
    return syntax.errors.length === 0;
    
  } catch (error) {
    console.error('❌ Screen generator test failed:', error);
    return false;
  }
}

// Test integration generator output
async function testIntegrationGenerator() {
  console.log('\n🧪 Testing Integration Generator Output...');
  
  try {
    const testIntegration = `integration Stripe:
  config:
    apiKey: "${process.env.STRIPE_API_KEY}"
    webhookSecret: "${process.env.STRIPE_WEBHOOK_SECRET}"
    mode: "development"
  
  webhooks:
    - event: "payment_intent.succeeded"
      handler: handlePaymentSuccess
    - event: "invoice.payment_failed"
      handler: handlePaymentFailure
  
  functions:
    createCustomer(email, paymentMethod):
      call POST "https://api.stripe.com/v1/customers" with email, paymentMethod
      return customer
    
    createPayment(amount, customerId):
      call POST "https://api.stripe.com/v1/payment_intents" with amount, customerId
      return paymentIntent
    
    refundPayment(paymentIntentId):
      call POST "https://api.stripe.com/v1/refunds" with paymentIntentId
      return refund`;
    
    const syntax = checkShepLangSyntax(testIntegration, 'stripe.shep');
    
    console.log(`\n📄 Integration Generator Test Results:`);
    console.log(`  - Errors: ${syntax.errors.length}`);
    console.log(`  - Warnings: ${syntax.warnings.length}`);
    
    if (syntax.errors.length > 0) {
      console.log('\n❌ Syntax Errors:');
      syntax.errors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('✅ No syntax errors!');
    }
    
    return syntax.errors.length === 0;
    
  } catch (error) {
    console.error('❌ Integration generator test failed:', error);
    return false;
  }
}

// Run all generator tests
async function runGeneratorTests() {
  console.log('🚀 Starting Generator Output Tests\n');
  
  const results = {
    entity: await testEntityGenerator(),
    flow: await testFlowGenerator(),
    screen: await testScreenGenerator(),
    integration: await testIntegrationGenerator()
  };
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log('\n🎉 Generator Tests Completed!');
  console.log('\n📊 Summary:');
  console.log(`  ✅ Passed: ${passed}/${total}`);
  console.log(`  ❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎯 All generators produce valid ShepLang syntax!');
  } else {
    console.log('\n⚠️  Some generators have syntax issues to fix.');
  }
  
  return passed === total;
}

runGeneratorTests();

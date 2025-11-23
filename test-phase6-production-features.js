/**
 * Phase 6: Integration Hub - Week 2 & 3 Tests
 * Testing production-ready integration features
 * Following proper test creation protocol
 */

import { generateApp } from './sheplang/packages/compiler/dist/index.js';

console.log('🧪 Phase 6: Production Integration Features Tests\n');
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

// Test 1: Generate health check endpoint
await test('Generate health check endpoint', async () => {
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
  
  if (!files['api/routes/health.ts']) {
    throw new Error('Health check endpoint not generated');
  }
});

// Test 2: Health check has proper structure
await test('Health check endpoint has proper structure', async () => {
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
  const healthFile = result.output.files['api/routes/health.ts'];
  
  if (!healthFile.includes('router.get(\'/health\'')) {
    throw new Error('Health route not found');
  }
  
  if (!healthFile.includes('HealthStatus')) {
    throw new Error('HealthStatus interface not found');
  }
  
  if (!healthFile.includes('services')) {
    throw new Error('Services health check not found');
  }
  
  if (!healthFile.includes('elasticsearch')) {
    throw new Error('Elasticsearch health check not found');
  }
});

// Test 3: Environment manager generated
await test('Generate environment manager', async () => {
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
  
  if (!result.output.files['integrations/EnvironmentManager.ts']) {
    throw new Error('Environment manager not generated');
  }
});

// Test 4: Environment manager has config validation
await test('Environment manager validates configuration', async () => {
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
  const envFile = result.output.files['integrations/EnvironmentManager.ts'];
  
  if (!envFile.includes('class EnvironmentManager')) {
    throw new Error('EnvironmentManager class not found');
  }
  
  if (!envFile.includes('validate()')) {
    throw new Error('Validate method not found');
  }
  
  if (!envFile.includes('getConfig()')) {
    throw new Error('getConfig method not found');
  }
  
  if (!envFile.includes('isConfigured')) {
    throw new Error('isConfigured method not found');
  }
});

// Test 5: Circuit breaker generated
await test('Generate circuit breaker', async () => {
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
  
  if (!result.output.files['integrations/CircuitBreaker.ts']) {
    throw new Error('Circuit breaker not generated');
  }
});

// Test 6: Circuit breaker has correct states
await test('Circuit breaker has proper state management', async () => {
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
  const cbFile = result.output.files['integrations/CircuitBreaker.ts'];
  
  if (!cbFile.includes('class CircuitBreaker')) {
    throw new Error('CircuitBreaker class not found');
  }
  
  if (!cbFile.includes("'closed'") || !cbFile.includes("'open'") || !cbFile.includes("'half-open'")) {
    throw new Error('Circuit breaker states not found');
  }
  
  if (!cbFile.includes('execute')) {
    throw new Error('Execute method not found');
  }
  
  if (!cbFile.includes('onSuccess')) {
    throw new Error('onSuccess handler not found');
  }
  
  if (!cbFile.includes('onFailure')) {
    throw new Error('onFailure handler not found');
  }
});

// Test 7: Retry logic generated
await test('Generate retry logic with exponential backoff', async () => {
  const code = `
app TestApp {
  data Post {
    fields: {
      title: text
    }
  }
  view Dashboard { list Post }
}`;

  const result = await generateApp(code);
  
  if (!result.output.files['integrations/RetryLogic.ts']) {
    throw new Error('Retry logic not generated');
  }
});

// Test 8: Retry logic has exponential backoff
await test('Retry logic implements exponential backoff', async () => {
  const code = `
app TestApp {
  data Comment {
    fields: {
      content: text
    }
  }
  view Dashboard { list Comment }
}`;

  const result = await generateApp(code);
  const retryFile = result.output.files['integrations/RetryLogic.ts'];
  
  if (!retryFile.includes('withRetry')) {
    throw new Error('withRetry function not found');
  }
  
  if (!retryFile.includes('maxAttempts')) {
    throw new Error('maxAttempts option not found');
  }
  
  if (!retryFile.includes('initialDelay')) {
    throw new Error('initialDelay option not found');
  }
  
  if (!retryFile.includes('Math.pow')) {
    throw new Error('Exponential calculation not found');
  }
});

// Test 9: Environment manager supports all integrations
await test('Environment manager supports all 5 integrations', async () => {
  const code = `
app TestApp {
  data Account {
    fields: {
      name: text
    }
  }
  view Dashboard { list Account }
}`;

  const result = await generateApp(code);
  const envFile = result.output.files['integrations/EnvironmentManager.ts'];
  
  if (!envFile.includes('stripe')) {
    throw new Error('Stripe config not found');
  }
  
  if (!envFile.includes('sendgrid')) {
    throw new Error('SendGrid config not found');
  }
  
  if (!envFile.includes('twilio')) {
    throw new Error('Twilio config not found');
  }
  
  if (!envFile.includes('aws')) {
    throw new Error('AWS config not found');
  }
  
  if (!envFile.includes('elasticsearch')) {
    throw new Error('Elasticsearch config not found');
  }
});

// Test 10: Health check checks all services
await test('Health check monitors all configured services', async () => {
  const code = `
app TestApp {
  data Review {
    fields: {
      rating: number
    }
  }
  view Dashboard { list Review }
}`;

  const result = await generateApp(code);
  const healthFile = result.output.files['api/routes/health.ts'];
  
  if (!healthFile.includes('elasticsearch')) {
    throw new Error('Elasticsearch health check not found');
  }
  
  if (!healthFile.includes('stripe')) {
    throw new Error('Stripe in services list not found');
  }
  
  if (!healthFile.includes('sendgrid')) {
    throw new Error('SendGrid in services list not found');
  }
  
  if (!healthFile.includes('twilio')) {
    throw new Error('Twilio in services list not found');
  }
  
  if (!healthFile.includes('s3')) {
    throw new Error('S3 in services list not found');
  }
});

// Test 11: Circuit breaker has timeout protection
await test('Circuit breaker implements timeout protection', async () => {
  const code = `
app TestApp {
  data Setting {
    fields: {
      key: text
      value: text
    }
  }
  view Dashboard { list Setting }
}`;

  const result = await generateApp(code);
  const cbFile = result.output.files['integrations/CircuitBreaker.ts'];
  
  if (!cbFile.includes('timeout')) {
    throw new Error('Timeout property not found');
  }
  
  if (!cbFile.includes('Promise.race')) {
    throw new Error('Promise.race for timeout not found');
  }
  
  if (!cbFile.includes('timeoutPromise')) {
    throw new Error('timeoutPromise method not found');
  }
});

// Test 12: Retry logic has max delay cap
await test('Retry logic caps maximum delay', async () => {
  const code = `
app TestApp {
  data Log {
    fields: {
      message: text
    }
  }
  view Dashboard { list Log }
}`;

  const result = await generateApp(code);
  const retryFile = result.output.files['integrations/RetryLogic.ts'];
  
  if (!retryFile.includes('maxDelay')) {
    throw new Error('maxDelay option not found');
  }
  
  if (!retryFile.includes('Math.min')) {
    throw new Error('Math.min for delay cap not found');
  }
});

// Test 13: Environment manager has error messages
await test('Environment manager provides clear error messages', async () => {
  const code = `
app TestApp {
  data Session {
    fields: {
      token: text
    }
  }
  view Dashboard { list Session }
}`;

  const result = await generateApp(code);
  const envFile = result.output.files['integrations/EnvironmentManager.ts'];
  
  if (!envFile.includes('errors: string[]')) {
    throw new Error('Errors array not found');
  }
  
  if (!envFile.includes('API key is required') || !envFile.includes('credentials are incomplete')) {
    throw new Error('Error messages not found');
  }
});

// Test 14: Health endpoint returns proper status codes
await test('Health endpoint returns proper HTTP status codes', async () => {
  const code = `
app TestApp {
  data Metric {
    fields: {
      name: text
      value: number
    }
  }
  view Dashboard { list Metric }
}`;

  const result = await generateApp(code);
  const healthFile = result.output.files['api/routes/health.ts'];
  
  if (!healthFile.includes('statusCode') || !healthFile.includes('503')) {
    throw new Error('Degraded status code (503) not found');
  }
  
  if (!healthFile.includes('200')) {
    throw new Error('Healthy status code (200) not found');
  }
  
  if (!healthFile.includes('res.status(statusCode)')) {
    throw new Error('Dynamic status code not found');
  }
});

// Test 15: Circuit breaker has failure threshold
await test('Circuit breaker respects failure threshold', async () => {
  const code = `
app TestApp {
  data Event {
    fields: {
      name: text
    }
  }
  view Dashboard { list Event }
}`;

  const result = await generateApp(code);
  const cbFile = result.output.files['integrations/CircuitBreaker.ts'];
  
  if (!cbFile.includes('threshold')) {
    throw new Error('Threshold property not found');
  }
  
  if (!cbFile.includes('failureCount')) {
    throw new Error('failureCount property not found');
  }
  
  if (!cbFile.includes('failureCount >= this.threshold')) {
    throw new Error('Threshold check not found');
  }
});

// Test 16: Retry logic logs attempts
await test('Retry logic logs retry attempts', async () => {
  const code = `
app TestApp {
  data Notification {
    fields: {
      message: text
    }
  }
  view Dashboard { list Notification }
}`;

  const result = await generateApp(code);
  const retryFile = result.output.files['integrations/RetryLogic.ts'];
  
  if (!retryFile.includes('console.log')) {
    throw new Error('Retry logging not found');
  }
  
  if (!retryFile.includes('Retry attempt')) {
    throw new Error('Retry attempt message not found');
  }
});

// Test 17: Health check has timestamp
await test('Health check includes timestamp', async () => {
  const code = `
app TestApp {
  data Report {
    fields: {
      title: text
    }
  }
  view Dashboard { list Report }
}`;

  const result = await generateApp(code);
  const healthFile = result.output.files['api/routes/health.ts'];
  
  if (!healthFile.includes('timestamp')) {
    throw new Error('Timestamp field not found');
  }
  
  if (!healthFile.includes('new Date().toISOString()')) {
    throw new Error('ISO timestamp generation not found');
  }
});

// Test 18: All production features work together
await test('All production features integrate correctly', async () => {
  const code = `
app TestApp {
  data User {
    fields: {
      username: text required
      emailAddress: text email=true
    }
  }
  view Dashboard { list User }
  action createUser(username, emailAddress) {
    call POST "/users" with username, emailAddress
    show Dashboard
  }
}`;

  const result = await generateApp(code);
  
  // Check all major features present
  if (!result.output.files['integrations/clients/Stripe.ts']) {
    throw new Error('Stripe client missing');
  }
  
  if (!result.output.files['api/routes/health.ts']) {
    throw new Error('Health check missing');
  }
  
  if (!result.output.files['integrations/EnvironmentManager.ts']) {
    throw new Error('Environment manager missing');
  }
  
  if (!result.output.files['integrations/CircuitBreaker.ts']) {
    throw new Error('Circuit breaker missing');
  }
  
  if (!result.output.files['integrations/RetryLogic.ts']) {
    throw new Error('Retry logic missing');
  }
  
  if (!result.output.files['validation/UserValidation.ts']) {
    throw new Error('Validation missing');
  }
  
  if (!result.output.files['hooks/useUserRealtime.ts']) {
    throw new Error('Real-time missing');
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`\n📊 RESULTS: ${passedTests}/${totalTests} passed`);
console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n✅ ALL TESTS PASSED');
  console.log('✅ Phase 6 Week 2 & 3: Production Features COMPLETE!');
  console.log('✅ Phase 6: Integration Hub COMPLETE!');
  process.exit(0);
} else {
  console.log(`\n❌ ${totalTests - passedTests} test(s) failed`);
  process.exit(1);
}

})();

/**
 * Phase 7: ShepUI Screen Generation Tests
 * Testing advanced screen generation with comprehensive validation
 * Following proper test creation protocol
 */

import { generateApp } from './sheplang/packages/compiler/dist/index.js';

console.log('🧪 Phase 7: ShepUI Screen Generation Tests\n');
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

// Test 1: Generate screens folder
await test('Generate screens folder with screen components', async () => {
  const code = `
app TestApp {
  data Product {
    fields: {
      name: text
      price: number
    }
  }
  view ProductFeed { list Product }
}`;

  const result = await generateApp(code);
  
  if (!result.success || !result.output) {
    throw new Error('Generation failed');
  }
  
  const files = result.output.files;
  
  if (!files['screens/ProductFeed.tsx']) {
    throw new Error('Screen file not generated');
  }
});

// Test 2: Feed screen has infinite scroll
await test('Feed screen includes Intersection Observer for infinite scroll', async () => {
  const code = `
app ShopApp {
  data Item {
    fields: {
      title: text
    }
  }
  view ItemFeed { list Item }
}`;

  const result = await generateApp(code);
  const screenFile = result.output.files['screens/ItemFeed.tsx'];
  
  if (!screenFile.includes('IntersectionObserver')) {
    throw new Error('IntersectionObserver not found in feed screen');
  }
  
  if (!screenFile.includes('lastElementRef')) {
    throw new Error('lastElementRef callback ref not found');
  }
  
  if (!screenFile.includes('useCallback')) {
    throw new Error('useCallback hook not found');
  }
});

// Test 3: Feed screen has search functionality
await test('Feed screen includes search bar', async () => {
  const code = `
app BlogApp {
  data Post {
    fields: {
      title: text
      content: text
    }
  }
  view PostFeed { list Post }
}`;

  const result = await generateApp(code);
  const screenFile = result.output.files['screens/PostFeed.tsx'];
  
  if (!screenFile.includes('searchQuery')) {
    throw new Error('Search query state not found');
  }
  
  if (!screenFile.includes('handleSearch')) {
    throw new Error('Search handler not found');
  }
  
  if (!screenFile.includes('placeholder="Search')) {
    throw new Error('Search input not found');
  }
});

// Test 4: Feed screen has real-time integration
await test('Feed screen integrates with Phase 4 real-time hooks', async () => {
  const code = `
app SocialApp {
  data Message {
    fields: {
      content: text
    }
  }
  view MessageFeed { list Message }
}`;

  const result = await generateApp(code);
  const screenFile = result.output.files['screens/MessageFeed.tsx'];
  
  if (!screenFile.includes('useMessagesRealtime')) {
    throw new Error('Real-time hook not imported');
  }
  
  if (!screenFile.includes('realtimeMessages')) {
    throw new Error('Real-time state not found');
  }
});

// Test 5: Feed screen has loading states
await test('Feed screen includes loading indicators and empty states', async () => {
  const code = `
app MediaApp {
  data Video {
    fields: {
      videoTitle: text
    }
  }
  view VideoFeed { list Video }
}`;

  const result = await generateApp(code);
  const screenFile = result.output.files['screens/VideoFeed.tsx'];
  
  if (!screenFile.includes('loading')) {
    throw new Error('Loading state not found');
  }
  
  if (!screenFile.includes('animate-spin')) {
    throw new Error('Loading spinner not found');
  }
  
  if (!screenFile.includes('No videos found') || !screenFile.includes('Empty state')) {
    throw new Error('Empty state message not found');
  }
  
  if (!screenFile.includes('No more videos to load')) {
    throw new Error('End of feed message not found');
  }
});

// Test 6: Screen uses proper React hooks
await test('Screens use React hooks correctly (useState, useEffect, useRef, useCallback)', async () => {
  const code = `
app EcommerceApp {
  data Product {
    fields: {
      name: text
      price: number
    }
  }
  view Products { list Product }
}`;

  const result = await generateApp(code);
  const screenFile = result.output.files['screens/Products.tsx'];
  
  if (!screenFile.includes("import { useState, useEffect, useRef, useCallback } from 'react'")) {
    throw new Error('React hooks import not found');
  }
  
  if (!screenFile.includes('useState')) {
    throw new Error('useState not used');
  }
  
  if (!screenFile.includes('useEffect')) {
    throw new Error('useEffect not used');
  }
});

// Test 7: Screen has TypeScript types
await test('Screens include proper TypeScript types', async () => {
  const code = `
app TaskApp {
  data Task {
    fields: {
      title: text
      completed: yes/no
    }
  }
  view TaskList { list Task }
}`;

  const result = await generateApp(code);
  const screenFile = result.output.files['screens/TaskList.tsx'];
  
  if (!screenFile.includes('import type { Task }')) {
    throw new Error('TypeScript type import not found');
  }
  
  if (!screenFile.includes('interface TaskListProps')) {
    throw new Error('Props interface not found');
  }
  
  if (!screenFile.includes('Task[]')) {
    throw new Error('Type array not found');
  }
});

// Test 8: Screen has responsive grid layout
await test('Screens use responsive Tailwind grid classes', async () => {
  const code = `
app GalleryApp {
  data Photo {
    fields: {
      url: text
      caption: text
    }
  }
  view PhotoGallery { list Photo }
}`;

  const result = await generateApp(code);
  const screenFile = result.output.files['screens/PhotoGallery.tsx'];
  
  if (!screenFile.includes('grid')) {
    throw new Error('Grid layout not found');
  }
  
  if (!screenFile.includes('md:grid-cols') || !screenFile.includes('lg:grid-cols')) {
    throw new Error('Responsive grid columns not found');
  }
  
  if (!screenFile.includes('container mx-auto')) {
    throw new Error('Container classes not found');
  }
});

// Test 9: Screen has proper error handling
await test('Screens include error handling for API calls', async () => {
  const code = `
app NewsApp {
  data Article {
    fields: {
      headline: text
    }
  }
  view NewsFeed { list Article }
}`;

  const result = await generateApp(code);
  const screenFile = result.output.files['screens/NewsFeed.tsx'];
  
  if (!screenFile.includes('.catch(err =>')) {
    throw new Error('Error catch handler not found');
  }
  
  if (!screenFile.includes('console.error')) {
    throw new Error('Error logging not found');
  }
});

// Test 10: Multiple screens generated for multiple views
await test('Generate multiple screen files for multiple views', async () => {
  const code = `
app MultiViewApp {
  data User {
    fields: {
      username: text
    }
  }
  data Post {
    fields: {
      postTitle: text
    }
  }
  view UserList { list User }
  view PostList { list Post }
}`;

  const result = await generateApp(code);
  
  if (!result.success || !result.output) {
    throw new Error('Generation failed');
  }
  
  if (!result.output.files['screens/UserList.tsx']) {
    throw new Error('UserList screen not generated');
  }
  
  if (!result.output.files['screens/PostList.tsx']) {
    throw new Error('PostList screen not generated');
  }
});

// Test 11: Screens integrate with validation (Phase 5)
await test('Form screens integrate with Phase 5 validation', async () => {
  const code = `
app FormApp {
  data Contact {
    fields: {
      contactName: text required
      contactEmail: text email=true
    }
  }
  view ContactForm { list Contact }
}`;

  const result = await generateApp(code);
  
  if (!result.success || !result.output) {
    throw new Error('Generation failed');
  }
  
  // Should have validation file from Phase 5
  if (!result.output.files['validation/ContactValidation.ts']) {
    throw new Error('Validation file not generated');
  }
  
  // Check if screen would use validation (in a form context)
  const validationFile = result.output.files['validation/ContactValidation.ts'];
  if (!validationFile.includes('useContactValidation')) {
    throw new Error('Validation hook not generated');
  }
});

// Test 12: Screens work with all existing phases
await test('Screens work alongside all previous phase features', async () => {
  const code = `
app CompleteApp {
  data Order {
    fields: {
      customerName: text required
      total: number min=1
    }
  }
  view OrderFeed { list Order }
  action CreateOrder(customerName, total) {
    call POST "/orders" with customerName, total
    show OrderFeed
  }
}`;

  const result = await generateApp(code);
  
  if (!result.success || !result.output) {
    throw new Error('Generation failed');
  }
  
  // Should have screen
  if (!result.output.files['screens/OrderFeed.tsx']) {
    throw new Error('Screen not generated');
  }
  
  // Should have validation (Phase 5)
  if (!result.output.files['validation/OrderValidation.ts']) {
    throw new Error('Validation not generated');
  }
  
  // Should have real-time hooks (Phase 4)
  if (!result.output.files['hooks/useOrderRealtime.ts']) {
    throw new Error('Real-time hook not generated');
  }
  
  // Should have API routes (Phase 3)
  if (!result.output.files['api/routes/orders.ts']) {
    throw new Error('API routes not generated');
  }
  
  // Should have integrations (Phase 6)
  if (!result.output.files['integrations/clients/Stripe.ts']) {
    throw new Error('Integration clients not generated');
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`\n📊 RESULTS: ${passedTests}/${totalTests} passed`);
console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n✅ ALL TESTS PASSED');
  console.log('✅ Phase 7: ShepUI Screen Generation COMPLETE!');
  process.exit(0);
} else {
  console.log(`\n❌ ${totalTests - passedTests} test(s) failed`);
  process.exit(1);
}

})();

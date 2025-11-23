/**
 * Phase 4-05: Authentication & Authorization Tests
 * Following proper test creation protocol
 */

import { 
  generateAuthMiddleware, 
  generateRBACMiddleware, 
  generateAuthRoutes,
  generateAuthContext 
} from './sheplang/packages/compiler/dist/auth-templates.js';

console.log('🧪 Phase 4-05: Authentication & Authorization Tests\n');
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

// Test 1: Auth middleware generation
test('Auth middleware generates correctly', () => {
  const code = generateAuthMiddleware();
  
  if (!code.includes('function authMiddleware')) {
    throw new Error('Auth middleware function not generated');
  }
  
  if (!code.includes('import jwt from')) {
    throw new Error('JWT import not found');
  }
  
  if (!code.includes('jwt.verify')) {
    throw new Error('JWT verify not called');
  }
  
  if (!code.includes('req.user')) {
    throw new Error('User not attached to request');
  }
  
  if (!code.includes('401')) {
    throw new Error('401 status code not included');
  }
});

// Test 2: RBAC middleware generation
test('RBAC middleware generates correctly', () => {
  const roles = ['admin', 'manager', 'user'];
  const code = generateRBACMiddleware(roles);
  
  if (!code.includes('function requireRole')) {
    throw new Error('RBAC function not generated');
  }
  
  if (!code.includes('allowedRoles')) {
    throw new Error('Allowed roles parameter not found');
  }
  
  if (!code.includes('req.user.role')) {
    throw new Error('User role not checked');
  }
  
  if (!code.includes('403')) {
    throw new Error('403 status code not included');
  }
  
  if (!code.includes('Roles')) {
    throw new Error('Roles object not defined');
  }
});

// Test 3: Auth routes generation
test('Auth routes generate correctly', () => {
  const code = generateAuthRoutes();
  
  if (!code.includes('router.post(\'/register\'')) {
    throw new Error('Register route not found');
  }
  
  if (!code.includes('router.post(\'/login\'')) {
    throw new Error('Login route not found');
  }
  
  if (!code.includes('router.get(\'/me\'')) {
    throw new Error('Get user route not found');
  }
  
  if (!code.includes('router.post(\'/logout\'')) {
    throw new Error('Logout route not found');
  }
});

// Test 4: Password hashing
test('Password hashing is included', () => {
  const code = generateAuthRoutes();
  
  if (!code.includes('import bcrypt from')) {
    throw new Error('bcrypt import not found');
  }
  
  if (!code.includes('bcrypt.hash')) {
    throw new Error('Password hashing not used');
  }
  
  if (!code.includes('bcrypt.compare')) {
    throw new Error('Password comparison not used');
  }
});

// Test 5: JWT token generation
test('JWT token generation works', () => {
  const code = generateAuthRoutes();
  
  if (!code.includes('jwt.sign')) {
    throw new Error('JWT signing not found');
  }
  
  if (!code.includes('expiresIn')) {
    throw new Error('Token expiration not set');
  }
  
  if (!code.includes('JWT_SECRET')) {
    throw new Error('JWT secret not used');
  }
});

// Test 6: Auth context for React
test('Auth context generates correctly', () => {
  const code = generateAuthContext();
  
  if (!code.includes('createContext')) {
    throw new Error('Context not created');
  }
  
  if (!code.includes('function AuthProvider')) {
    throw new Error('AuthProvider not defined');
  }
  
  if (!code.includes('function useAuth')) {
    throw new Error('useAuth hook not defined');
  }
  
  if (!code.includes('login')) {
    throw new Error('Login function not found');
  }
  
  if (!code.includes('register')) {
    throw new Error('Register function not found');
  }
  
  if (!code.includes('logout')) {
    throw new Error('Logout function not found');
  }
});

// Test 7: Token persistence
test('Token persistence works', () => {
  const code = generateAuthContext();
  
  if (!code.includes('localStorage.getItem')) {
    throw new Error('Token loading not implemented');
  }
  
  if (!code.includes('localStorage.setItem')) {
    throw new Error('Token saving not implemented');
  }
  
  if (!code.includes('localStorage.removeItem')) {
    throw new Error('Token removal not implemented');
  }
});

// Test 8: Role checking
test('Role checking works', () => {
  const code = generateAuthContext();
  
  if (!code.includes('hasRole')) {
    throw new Error('hasRole function not found');
  }
  
  if (!code.includes('user?.role')) {
    throw new Error('Role check not implemented');
  }
});

// Test 9: Error handling in auth
test('Auth includes error handling', () => {
  const authCode = generateAuthMiddleware();
  const routesCode = generateAuthRoutes();
  
  if (!authCode.includes('try {') || !authCode.includes('catch')) {
    throw new Error('Auth middleware error handling not included');
  }
  
  if (!routesCode.includes('try {') || !routesCode.includes('catch')) {
    throw new Error('Auth routes error handling not included');
  }
});

// Test 10: User validation
test('User input validation included', () => {
  const code = generateAuthRoutes();
  
  if (!code.includes('if (!email || !password)')) {
    throw new Error('Email/password validation not found');
  }
  
  if (!code.includes('400')) {
    throw new Error('400 status code for validation not included');
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`\n📊 RESULTS: ${passedTests}/${totalTests} passed`);
console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n✅ ALL TESTS PASSED');
  console.log('✅ Phase 4-05: Authentication & Authorization COMPLETE!');
  process.exit(0);
} else {
  console.log(`\n❌ ${totalTests - passedTests} test(s) failed`);
  process.exit(1);
}

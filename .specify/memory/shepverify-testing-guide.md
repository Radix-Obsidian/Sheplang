# ShepVerify Testing Guide
**4-Phase Verification Engine for 100% Bug-Free Code**

---

## 🎯 Overview

ShepVerify is the world's first verification engine designed specifically for AI-generated code. It ensures 100% type safety, null safety, API validity, and integration correctness through 4 comprehensive phases.

### Verification Phases
1. **Phase 1**: Type Safety Verification
2. **Phase 2**: Null Safety Verification
3. **Phase 3**: API Endpoint Validation
4. **Phase 4**: Integration Testing

---

## 🔧 Phase 1: Type Safety Verification

### What It Checks
- Type inference correctness
- Interface compatibility
- Generic type constraints
- Function signature matching
- Model field type consistency

### Example Verification
```sheplang
// Input code
app MyApp {
  data User {
    fields: {
      name: text
      age: number
    }
  }
  
  action CreateUser(name, age) {
    add User with name, age
    show Dashboard
  }
}
```

```shepthon
// Backend model
model User {
  id: string
  name: string      // ✅ Matches text field
  age: number       // ✅ Matches number field
}
```

### Phase 1 Output
```
✅ Type Safety: PASSED
✅ All model fields have matching types
✅ Action parameters match expected types
✅ API endpoints use correct types
```

### Common Type Errors
```sheplang
// ❌ Type mismatch
action CreateUser(name) {
  add User with name, age  // age parameter missing
}

// ❌ Wrong type
action CreateUser(name, age) {
  add User with name, "twenty"  // age should be number, not string
}
```

### Phase 1 Error Messages
```
❌ Type Error: Missing parameter 'age' in CreateUser action
   Expected: CreateUser(name: text, age: number)
   Found: CreateUser(name: text)

❌ Type Error: Type mismatch for field 'age'
   Expected: number
   Found: string ("twenty")
```

---

## 🛡️ Phase 2: Null Safety Verification

### What It Checks
- Null reference prevention
- Optional field handling
- Required field validation
- Default value presence
- Undefined reference detection

### Example Verification
```sheplang
app MyApp {
  data User {
    fields: {
      name: text
      email: text?      // Optional field
      age: number
    }
  }
  
  action CreateUser(name, age) {
    add User with name, age
    show Dashboard
  }
}
```

### Phase 2 Output
```
✅ Null Safety: PASSED
✅ Required fields 'name' and 'age' are provided
✅ Optional field 'email' properly handled
✅ No null reference risks detected
```

### Common Null Errors
```sheplang
// ❌ Missing required field
action CreateUser(name) {
  add User with name  // Missing required 'age' field
}

// ❌ Using optional field without check
action UpdateUserEmail(userId, email) {
  load GET "/users/:id" into user
  if user.email {  // ❌ Should check if user exists first
    // Do something with email
  }
}
```

### Phase 2 Error Messages
```
❌ Null Error: Required field 'age' not provided
   Field 'age' is required but missing in add User statement

❌ Null Error: Potential null reference to 'user'
   Variable 'user' may be null, add null check before access
```

---

## 🌐 Phase 3: API Endpoint Validation

### What It Checks
- Endpoint existence verification
- HTTP method compatibility
- Parameter matching
- Response type validation
- Path parameter handling

### Example Verification
```sheplang
// Frontend API call
action CreateTask(title) {
  call POST "/tasks" with title
  show Dashboard
}
```

```shepthon
// Backend endpoint
POST /tasks -> db.create("tasks", body)
```

### Phase 3 Output
```
✅ API Validation: PASSED
✅ Endpoint POST /tasks exists in backend
✅ Method POST matches backend definition
✅ Parameter 'title' matches expected body fields
✅ Response type matches frontend expectations
```

### Common API Errors
```sheplang
// ❌ Endpoint doesn't exist
action CreateTask(title) {
  call POST "/task" with title  // Should be /tasks (plural)
}

// ❌ Method mismatch
action GetTasks() {
  call POST "/tasks"  // Should be GET for retrieval
}

// ❌ Parameter mismatch
action CreateTask(title, priority) {
  call POST "/tasks" with title  // Missing priority parameter
}
```

### Phase 3 Error Messages
```
❌ API Error: Endpoint not found: POST /task
   Available endpoints: GET /tasks, POST /tasks, PUT /tasks/:id
   Suggestion: Use POST /tasks instead

❌ API Error: Method mismatch for /tasks
   Backend expects: GET, PUT, DELETE
   Frontend uses: POST
   Suggestion: Use GET for data retrieval

❌ API Error: Parameter mismatch for POST /tasks
   Backend expects: { title: string, priority: string }
   Frontend provides: { title: string }
   Missing parameter: priority
```

---

## 🔗 Phase 4: Integration Testing

### What It Checks
- End-to-end workflow validation
- Frontend-backend communication
- State synchronization
- Error propagation
- Performance benchmarks

### Example Integration Test
```sheplang
app TodoApp {
  data Task {
    fields: {
      title: text
      completed: yes/no
    }
  }
  
  view Dashboard {
    list Task
    button "Add Task" -> CreateTask
  }
  
  action CreateTask(title) {
    call POST "/tasks" with title
    show Dashboard
  }
}
```

```shepthon
model Task {
  id: string
  title: string
  completed: boolean
  createdAt: datetime
}

POST /tasks -> db.create("tasks", body)
GET /tasks -> db.all("tasks")
```

### Phase 4 Output
```
✅ Integration Testing: PASSED
✅ CreateTask action successfully creates task
✅ Dashboard view updates after task creation
✅ API response correctly handled
✅ State synchronization verified
⏱️ Performance: 45ms average response time
```

### Common Integration Errors
```sheplang
// ❌ Missing state update
action CreateTask(title) {
  call POST "/tasks" with title
  // ❌ Missing show Dashboard to refresh view
}

// ❌ No error handling
action CreateTask(title) {
  call POST "/tasks" with title
  // ❌ No error handling if API fails
  show Dashboard
}
```

### Phase 4 Error Messages
```
❌ Integration Error: UI not updated after API call
   Action CreateTask doesn't refresh Dashboard view
   Suggestion: Add show Dashboard after API call

❌ Integration Error: No error handling for API failures
   Action CreateTask doesn't handle API errors
   Suggestion: Add try-catch block around API call
```

---

## 🚀 Running ShepVerify

### Basic Commands
```bash
# Run all verification phases
shepverify verify

# Run specific phase
shepverify verify --phase=1
shepverify verify --phase=2
shepverify verify --phase=3
shepverify verify --phase=4

# Run with detailed output
shepverify verify --verbose

# Run with JSON output for CI/CD
shepverify verify --format=json
```

### Configuration
```yaml
# shepverify.config.yml
verification:
  phases: [1, 2, 3, 4]
  strict: true
  timeout: 30000
  
type-safety:
  strict-types: true
  check-generics: true
  
null-safety:
  strict-nulls: true
  check-optional: true
  
api-validation:
  check-methods: true
  check-parameters: true
  check-responses: true
  
integration:
  test-endpoints: true
  mock-data: true
  performance-threshold: 1000
```

### CI/CD Integration
```yaml
# .github/workflows/verify.yml
name: ShepVerify
on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup AIVP Stack
        run: npm install -g aivp-stack
      - name: Run ShepVerify
        run: shepverify verify --format=json --output=results.json
      - name: Upload Results
        uses: actions/upload-artifact@v2
        with:
          name: verification-results
          path: results.json
```

---

## 📊 Understanding Results

### Success Output
```json
{
  "status": "PASSED",
  "phases": {
    "type-safety": "PASSED",
    "null-safety": "PASSED", 
    "api-validation": "PASSED",
    "integration": "PASSED"
  },
  "metrics": {
    "files-checked": 15,
    "errors": 0,
    "warnings": 0,
    "performance": {
      "average-response-time": 45,
      "memory-usage": "128MB"
    }
  }
}
```

### Error Output
```json
{
  "status": "FAILED",
  "phases": {
    "type-safety": "FAILED",
    "null-safety": "PASSED",
    "api-validation": "FAILED", 
    "integration": "SKIPPED"
  },
  "errors": [
    {
      "phase": "type-safety",
      "file": "actions/CreateUser.ts",
      "line": 15,
      "message": "Type mismatch for field 'age'",
      "suggestion": "Convert string to number before assignment"
    },
    {
      "phase": "api-validation",
      "file": "actions/CreateTask.ts",
      "line": 8,
      "message": "Endpoint not found: POST /task",
      "suggestion": "Use POST /tasks instead"
    }
  ]
}
```

---

## 🔧 Custom Verification Rules

### Type Safety Rules
```javascript
// custom-rules/type-safety.js
module.exports = {
  rules: {
    'no-string-to-number': {
      meta: {
        type: 'error',
        description: 'Prevent string to number conversions'
      },
      create: function(context) {
        return {
          AssignmentExpression(node) {
            if (isStringToNumberConversion(node)) {
              context.report({
                node,
                message: 'Explicit string to number conversion required'
              });
            }
          }
        };
      }
    }
  }
};
```

### API Validation Rules
```javascript
// custom-rules/api-validation.js
module.exports = {
  rules: {
    'restful-endpoints': {
      meta: {
        type: 'warning',
        description: 'Ensure RESTful endpoint patterns'
      },
      create: function(context) {
        return {
          CallExpression(node) {
            if (!isRestfulEndpoint(node)) {
              context.report({
                node,
                message: 'Endpoint should follow RESTful patterns'
              });
            }
          }
        };
      }
    }
  }
};
```

---

## 📈 Performance Metrics

### Built-in Metrics
- **Response Time**: API call performance
- **Memory Usage**: Frontend component memory
- **Bundle Size**: Generated code size
- **Type Inference**: Type checking speed
- **Database Queries**: Query performance

### Custom Metrics
```javascript
// custom-metrics/performance.js
module.exports = {
  metrics: {
    'user-interaction-time': {
      measure: (action) => {
        return measureUserInteractionTime(action);
      }
    },
    'component-render-time': {
      measure: (component) => {
        return measureRenderTime(component);
      }
    }
  }
};
```

---

## 🛠️ Troubleshooting

### Common Issues
1. **Type Inference Failures**
   - Check model field definitions
   - Verify action parameter types
   - Ensure API response types match

2. **Null Reference Errors**
   - Add null checks for optional fields
   - Provide default values
   - Use proper error handling

3. **API Validation Failures**
   - Verify endpoint paths match
   - Check HTTP methods
   - Ensure parameter names align

4. **Integration Test Failures**
   - Check API connectivity
   - Verify mock data
   - Ensure proper state management

### Debug Commands
```bash
# Debug specific file
shepverify verify --file=actions/CreateUser.ts --debug

# Show inference details
shepverify verify --phase=1 --show-inference

# Generate detailed report
shepverify verify --report=full --output=report.html
```

---

## 📚 Best Practices

### Before Verification
1. **Clean Build**: Ensure all code compiles
2. **Dependencies**: Verify all dependencies installed
3. **Configuration**: Check ShepVerify config
4. **Environment**: Ensure proper environment setup

### During Verification
1. **Phase-by-Phase**: Run phases individually for debugging
2. **Verbose Output**: Use --verbose for detailed information
3. **Save Results**: Store verification results for analysis
4. **Fix Incrementally**: Address errors one phase at a time

### After Verification
1. **Review Warnings**: Address all warnings
2. **Performance**: Check performance metrics
3. **Documentation**: Update documentation based on results
4. **CI/CD**: Integrate into continuous integration

---

**💡 Remember**: ShepVerify ensures 100% bug-free code by catching issues at compile-time, before they reach production. Always run verification before deployment.

---

*Last Updated: November 22, 2025*  
*Version: 1.0 (Complete Verification Engine)*

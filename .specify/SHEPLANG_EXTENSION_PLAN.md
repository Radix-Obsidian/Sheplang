# ShepLang Grammar Extension Plan
## Adding `call` and `load` Statements for API Integration

**Date:** November 17, 2025  
**Status:** Research Complete → Ready for Implementation  
**Priority:** HIGH (Required for ShepVerify Phase 3)

---

## Research Summary

### Industry Standards Reviewed:
1. **Bubble.io** - API Connector
   - `Use as Action` = Executes API calls (POST, PUT, DELETE)
   - `Use as Data` = Retrieves data (GET)
   
2. **Retool** - REST API Queries
   - Action types: GET, POST, PUT, PATCH, DELETE
   - Path/URL parameters support
   - Manual vs automatic execution

3. **Langium** - Grammar Language
   - EBNF expressions
   - Parser rules with assignments
   - Type-safe AST generation

---

## Proposed Syntax

### `call` Statement (Action - Side Effects)
```sheplang
# Basic call
call POST "/todos"

# Call with data
call POST "/todos" with title, done

# Call with HTTP methods
call GET "/users"
call POST "/users" with name, email
call PUT "/users/123" with name
call DELETE "/users/123"
```

### `load` Statement (Data Source - No Side Effects)
```sheplang
# Load into variable
load GET "/todos" into todos
load GET "/users/123" into user

# Load with path parameters
load GET "/users/:id" into user
```

---

## Grammar Changes

### File: `sheplang/packages/language/src/shep.langium`

#### 1. Update Stmt Rule
```langium
// CURRENT
Stmt: AddStmt | ShowStmt | RawStmt;

// NEW
Stmt: AddStmt | ShowStmt | CallStmt | LoadStmt | RawStmt;
```

#### 2. Add CallStmt Rule
```langium
CallStmt:
  'call' method=HttpMethod path=STRING ('with' fields+=ID (',' fields+=ID)*)?;

HttpMethod:
  'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
```

#### 3. Add LoadStmt Rule
```langium
LoadStmt:
  'load' method=HttpMethod path=STRING 'into' variable=ID;
```

---

## Mapper Changes

### File: `sheplang/packages/language/src/mapper.ts`

#### Add to `mapStmt` function:
```typescript
function mapStmt(stmt: any, actionName: string): Op {
  // ... existing code ...
  
  } else if (stmt.$type === 'CallStmt') {
    return {
      kind: 'call',
      method: stmt.method,
      path: stmt.path,
      fields: stmt.fields?.map((f: any) => f) || []
    };
  } else if (stmt.$type === 'LoadStmt') {
    return {
      kind: 'load',
      method: stmt.method,
      path: stmt.path,
      variable: stmt.variable
    };
  } else {
    return { kind: 'raw', text: stmt.text };
  }
}
```

---

## Type Definitions

### File: `sheplang/packages/language/src/types.ts`

```typescript
export type Op =
  | { kind: 'add'; data: string; fields: Record<string, string> }
  | { kind: 'show'; view: string }
  | { kind: 'call'; method: string; path: string; fields: string[] }
  | { kind: 'load'; method: string; path: string; variable: string }
  | { kind: 'raw'; text: string };
```

---

## Verification Integration

The new statements integrate with ShepVerify Phase 3:

1. **Endpoint Validation** validates `call` and `load` against ShepThon backend
2. **Type Safety** ensures loaded data types match expectations
3. **Null Safety** tracks nullable loaded variables

---

## Examples

### Todo App with API Calls
```sheplang
app MyTodos

data Todo:
  fields:
    title: text
    done: yes/no

view Dashboard:
  list Todo
  button "Add" -> CreateTodo
  button "Refresh" -> LoadTodos

action CreateTodo(title):
  call POST "/todos" with title
  load GET "/todos" into todos
  show Dashboard

action LoadTodos():
  load GET "/todos" into todos
  show Dashboard

action DeleteTodo(id):
  call DELETE "/todos/:id"
  load GET "/todos" into todos
  show Dashboard
```

### User Management
```sheplang
action GetUser(id):
  load GET "/users/:id" into user
  show UserProfile

action UpdateUser(id, name, email):
  call PUT "/users/:id" with name, email
  load GET "/users/:id" into user
  show UserProfile

action DeleteUser(id):
  call DELETE "/users/:id"
  show UserList
```

---

## Implementation Steps

### Phase 1: Grammar (15 min)
1. Update `shep.langium` with new statement rules
2. Run `pnpm run langium:generate` to regenerate AST types
3. Verify no parse errors

### Phase 2: Mapper (15 min)
4. Update `mapper.ts` to handle CallStmt and LoadStmt
5. Update type definitions in `types.ts`
6. Test with simple examples

### Phase 3: Verification (30 min)
7. Run existing ShepVerify tests (should now pass)
8. Add integration tests with new statements
9. Verify all 42 tests still passing

### Phase 4: Documentation (15 min)
10. Update example files
11. Update README with new syntax
12. Document API call patterns

**Total Estimated Time:** 75 minutes

---

## Backward Compatibility

✅ **100% Backward Compatible**
- Existing `.shep` files continue to work
- `call` and `load` are additive features
- No breaking changes to existing grammar

---

## Success Criteria

- [ ] Grammar compiles without errors
- [ ] AST types regenerated correctly
- [ ] Mapper handles new statements
- [ ] ShepVerify Phase 3 tests pass (14/14)
- [ ] All other tests still pass (42/42 total)
- [ ] Examples demonstrate usage
- [ ] Documentation updated

---

## References

- [Langium Grammar Language](https://langium.org/docs/reference/grammar-language/)
- [Bubble.io API Connector](https://manual.bubble.io/help-guides/integrations/api/the-api-connector)
- [Retool REST API Queries](https://docs.retool.com/queries/guides/api/rest)

---

**Next Action:** Implement Phase 1 - Grammar Extension

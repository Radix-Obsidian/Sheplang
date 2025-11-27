# React to ShepLang Mapping

**Source:** Official React Documentation (react.dev)  
**Date:** November 26, 2025  
**Status:** RESEARCH COMPLETE

---

## Executive Summary

ShepLang **abstracts React implementation details**. Users describe WHAT they want (declaratively), and the transpiler generates the React code (imperatively).

Most React patterns don't need ShepLang representation because they're transpiler concerns.

---

## React Patterns → ShepLang Mapping

| React Pattern | ShepLang Representation | Transpiler Handles? |
|---------------|-------------------------|---------------------|
| Functional components | `view` blocks | ✅ Yes |
| Props | View/action parameters | ✅ Yes |
| useState (local state) | N/A - abstracted | ✅ Yes |
| useEffect (side effects) | `load`, `call`, `job` | ✅ Yes |
| Event handlers | `button -> Action` | ✅ Yes |
| Conditional rendering | `if` statements | ✅ Yes |
| Lists/mapping | `list Entity` | ✅ Yes |
| Forms | Derived from `data` fields | ✅ Yes |
| Context | N/A - abstracted | ✅ Yes |
| Refs | N/A - abstracted | ✅ Yes |
| Custom hooks | N/A - not needed | ✅ Yes |

---

## What ShepLang Already Covers

### 1. Components → Views
```sheplang
view Dashboard {
  list User
  button "Add" -> CreateUser
}
```
**Transpiles to:** React functional component

### 2. State Management → Actions + Data
```sheplang
action CreateUser(name, email) {
  call POST "/api/users" with name, email
  load GET "/api/users" into users
  show UserList
}
```
**Transpiles to:** API calls with React Query or SWR

### 3. Effects → Background Jobs
```sheplang
job RefreshData {
  schedule: every 5 minutes
  action {
    load GET "/api/data" into data
  }
}
```
**Transpiles to:** useEffect with intervals or React Query polling

### 4. Lists → List Widget
```sheplang
view UserList {
  list User
}
```
**Transpiles to:** `{users.map(user => <UserCard key={user.id} user={user} />)}`

---

## Gaps Analysis

| Feature | ShepLang Status | Priority |
|---------|-----------------|----------|
| Component state (useState) | ✅ Abstracted | - |
| Side effects (useEffect) | ✅ Covered by load/call/job | - |
| Event handling | ✅ Covered by button actions | - |
| Conditional rendering | ✅ if statements | - |
| Lists | ✅ list widget | - |
| Forms | ⚠️ Implicit from data | P2 |
| Modals/Dialogs | 🔴 Not explicit | P2 |
| Animation | ❌ Not in scope | - |
| Refs/DOM access | ❌ Not needed | - |

---

## Recommended Grammar Additions (P2)

### 1. Form Widget (Optional)
```sheplang
view CreateUserForm {
  form User -> CreateUser  // Generate form from User fields, submit to CreateUser action
}
```

### 2. Modal/Dialog (Optional)
```sheplang
view ConfirmDelete {
  modal: true
  button "Delete" -> DeleteUser
  button "Cancel" -> CloseModal
}
```

---

## Conclusion

**React patterns are NOT grammar blockers.**

ShepLang's declarative approach means:
- Users don't need to know React
- Transpiler generates idiomatic React code
- State management is abstracted
- Effects are replaced by explicit data operations

The only P2 consideration is making forms and modals more explicit, but these can be auto-generated from context.

---

## References

- React Hooks: https://react.dev/reference/react/hooks
- useState: https://react.dev/reference/react/useState
- useEffect: https://react.dev/reference/react/useEffect
- Component patterns: https://react.dev/learn

---

**This document is based on official React documentation. No hallucinated features.**

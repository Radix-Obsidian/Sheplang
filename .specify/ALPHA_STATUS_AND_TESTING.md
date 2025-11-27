# ShepLang Alpha Status & Testing Guide

**Date:** November 26, 2025
**Version:** Alpha v0.3

---

## ✅ What's Working

### 1. Grammar (v0.3 - Full-Stack Parity)
- ✅ 11 Prisma features (optional, defaults, enums, arrays, attributes)
- ✅ 4 Next.js features (layouts, parameterized views)
- ✅ `call POST "/api/tasks"` and `load GET` statements
- ✅ All tests parse correctly

### 2. Prisma Import Pipeline
- ✅ `extension/src/parsers/prismaParser.ts` - Updated parser
- ✅ Generates correct ShepLang v0.3 syntax
- ✅ Tested with real Vercel example

### 3. Transpiler
- ✅ `sheplang/packages/transpiler/` - Updated types
- ✅ Generates TypeScript with optional fields, arrays, enums

### 4. Extension
- ✅ Compiles cleanly
- ✅ Import commands wired (`sheplang.importFromGitHub`, `sheplang.importFromNextJS`)

---

## ⚠️ Known Issues to Fix

### 1. Duplicate Prisma Parser (HIGH PRIORITY)
**Problem:** Two separate Prisma parsing implementations exist:
- `extension/src/parsers/prismaParser.ts` - **Updated** (correct)
- `extension/src/parsers/entityExtractor.ts` - **OLD inline version** (lines 147-229)

**Fix:** Update `entityExtractor.ts` to import from `prismaParser.ts` instead of inline parsing.

### 2. Grammar Ambiguity Warning (LOW PRIORITY)
**Issue:** Chevrotain warns about `BaseType` alternatives between `SimpleType` and `EnumRefType`
**Impact:** None - parser handles it correctly
**Status:** Cosmetic, can ignore for alpha

### 3. Syntax Highlighting Outdated
**Issue:** TextMate grammar in `extension/syntaxes/sheplang.tmLanguage.json` may not highlight new keywords:
- `enum`, `layout`, `@id`, `@unique`, `@updatedAt`, `@onDelete`
- New types: `bigint`, `json`, `bytes`, `decimal`, `uuid`, `url`, `phone`

---

## 📋 Manual Testing Checklist

### Test 1: CLI Parse Test
```bash
cd sheplang
pnpm shep parse "../test-import-fixtures/nextjs-prisma/.shep/imported.shep"
```
**Expected:** Valid JSON output with fields, types, defaults, attributes

### Test 2: Extension Local Import
1. Open VS Code with ShepLang extension
2. Run command: `ShepLang: Import from Local Project`
3. Select `test-import-fixtures/nextjs-prisma/`
4. Name the project (e.g., "test-import")
5. Choose save location

**Expected:** 
- Creates `.shep` files
- Opens new workspace
- No errors in Output panel (View → Output → ShepLang)

### Test 3: Extension GitHub Import
1. Run command: `ShepLang: Import from GitHub`
2. Enter URL: `https://github.com/vercel/nextjs-prisma-example`
3. Choose save location

**Expected:** Clones, analyzes, generates ShepLang project

### Test 4: Syntax Verification
Create this file and verify no errors:
```sheplang
app TestApp {
  
  enum Role {
    USER, ADMIN, MODERATOR
  }
  
  data User {
    fields: {
      id: text = cuid @id
      email: text @unique
      name: text?
      role: Role = USER
      createdAt: datetime = now
      updatedAt: datetime @updatedAt
    }
  }
  
  view UserList {
    list User
    button "Create" -> CreateUser
  }
  
  action CreateUser(email, name) {
    call POST "/api/users" with email, name
    show UserList
  }
}
```

### Test 5: TypeScript Output
After running E2E test script:
```bash
cd test-import-fixtures
node e2e-import-test.mjs
```
Then verify TypeScript compiles:
```bash
cd nextjs-prisma/.shep
npx tsc --project tsconfig.json
```

---

## 🔧 Fixes Needed Before Alpha Release

### Priority 1: Critical
1. [x] **Unify Prisma parsers** - Updated `entityExtractor.ts` to use `prismaParser.ts` ✅
2. [x] **Fix AI null safety** - Added validation and default empty folders array ✅
3. [x] **Fix workspace linking** - Directly installed language package v0.2.1 ✅
4. [ ] **Verify API key** - Current key may be revoked
5. [ ] **Test import flow end-to-end** - Reload VS Code and test

### Priority 2: Important
6. [ ] **Update syntax highlighting** - Add new keywords to tmLanguage
7. [ ] **Update .sheplang.rules** - Ensure AI context file reflects v0.3 grammar

### Priority 3: Nice to Have
8. [ ] Add regression tests for new grammar features
9. [ ] Update README documentation
10. [ ] Package new VSIX for distribution

---

## 🧪 Automated Test Status

### Language Package
```bash
cd sheplang/packages/language
pnpm test
```
**Status:** Vitest has ESM resolution issues (pre-existing)

### E2E Import Test
```bash
cd test-import-fixtures
node e2e-import-test.mjs
```
**Status:** ✅ Passing

---

## 📊 Feature Coverage Matrix

| Feature | Grammar | Parser | Transpiler | Extension UI |
|---------|---------|--------|------------|--------------|
| Optional fields (`?`) | ✅ | ✅ | ✅ | ✅ |
| Default values (`=`) | ✅ | ✅ | ✅ | ✅ |
| Default functions | ✅ | ✅ | ✅ | ✅ |
| `@id` attribute | ✅ | ✅ | ✅ | ✅ |
| `@unique` attribute | ✅ | ✅ | ✅ | ✅ |
| `@updatedAt` attribute | ✅ | ✅ | ✅ | ✅ |
| Enum declarations | ✅ | ✅ | ✅ | ⚠️ Not tested |
| Array fields (`[]`) | ✅ | ✅ | ✅ | ⚠️ Not tested |
| `call POST` statements | ✅ | ✅ | ❓ | ⚠️ Not tested |
| `load GET` statements | ✅ | ✅ | ❓ | ⚠️ Not tested |
| Layouts | ✅ | ❓ | ❓ | ❌ Not implemented |
| Parameterized views | ✅ | ❓ | ❓ | ❌ Not implemented |

---

## 🚀 Alpha Release Criteria

### Must Have
- [x] Grammar v0.3 complete
- [x] Prisma import working
- [ ] Entity extractor unified
- [ ] Local import tested manually
- [ ] GitHub import tested manually

### Should Have
- [ ] Syntax highlighting for new features
- [ ] AI rules updated

### Nice to Have
- [ ] Regression test suite
- [ ] Updated documentation

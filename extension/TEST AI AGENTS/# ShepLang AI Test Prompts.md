# ShepLang AI Test Prompts

Use these prompts to test how AI (Copilot/GPT-5 Mini) handles ShepLang files.

---

## Test 1: Understanding (Run on both files)

**Prompt:**
```
This is a ShepLang file. ShepLang is an AI-native programming language for building SaaS applications.

1. Tell me what you understand about this file
2. What entities/data models does it define?
3. What views (screens) does it have?
4. What actions (behaviors) does it have?
5. What would you improve or add?
```

---

## Test 2: Add Feature - Clean File

**Prompt:**
```
Add a "Payments" feature to this invoice app:
1. Add a Payment data model with fields: amount, date, method, invoice reference
2. Add a PaymentList view
3. Add a RecordPayment action
4. Make sure to follow the exact same syntax patterns as the existing code
```

---

## Test 3: Add Feature - Messy File  

**Prompt:**
```
I need to add user authentication to this app:
1. Add a login view
2. Add a signup view  
3. Add login and signup actions
4. The user data model already exists, use it
5. Follow the existing syntax exactly
```

---

## Test 4: Refactor Request - Messy File

**Prompt:**
```
This ShepLang code is messy. Please:
1. Rename entities to be more descriptive (user -> User, thing -> Product, stuff -> Category)
2. Rename fields to be clear (n -> name, e -> email, pw -> password)
3. Add missing fields that a real app would need
4. Keep the EXACT same syntax structure - don't change any grammar
```

---

## Test 5: Build from Scratch

**Prompt:**
```
Create a ShepLang file for a simple blog platform with:
- Users who can write posts
- Posts with title, content, author, published date
- Comments on posts
- A dashboard view listing posts
- Views for creating and editing posts
- Actions for CRUD operations

Use the exact syntax patterns from this example file as reference.
```

---

## Test 6: Debug/Fix Request

**Prompt:**
```
This ShepLang file has syntax errors. Can you:
1. Identify what's wrong
2. Fix the issues
3. Explain what the correct syntax should be
4. Make sure all braces {} are properly matched
```

---

## What to Record

After each test, note:

1. **Did AI understand the syntax?** (Yes/No/Partial)
2. **Did AI generate valid ShepLang?** (Yes/No/Partial)
3. **What syntax errors occurred?** (List them)
4. **Did AI follow existing patterns?** (Yes/No)
5. **Did AI add features that don't exist in grammar?** (Like `?` or `|`)
6. **Quality of suggestions** (1-5 scale)
7. **Would a non-technical founder understand the output?** (Yes/No)

---

## Grammar Reference (For Your Reference)

**Supported Types:**
- text, number, yes/no, id, date, email, money, image, datetime, richtext, file
- ref[EntityName] for references

**Required Syntax:**
- `app Name { ... }` - App must use braces
- `data Name { fields: { ... } }` - Data must use braces  
- `view Name { ... }` - Views must use braces
- `action Name(params) { ... }` - Actions must use braces
- `// comment` - Comments use double slash

**NOT Supported (AI might try to use these):**
- `text?` - Optional markers
- `low|medium|high` - Union/enum types
- `uuid` type - Use `id` instead
- `user` type - Use `ref[User]` or `text`
- `#` comments - Use `//` instead
- Colon-based blocks like `data Name:` - Must use braces

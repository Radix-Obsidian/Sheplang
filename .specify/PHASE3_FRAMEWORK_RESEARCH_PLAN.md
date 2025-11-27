# Phase 3: Framework Compatibility Research Plan

**Date:** November 26, 2025  
**Status:** PLANNING  
**Goal:** Build a complete grammar library based on official documentation from every framework/language we support

---

## The Problem

ShepLang claims to convert from existing projects (primarily Next.js) and deploy working applications. But we're encountering grammar/syntax issues because:

1. We don't fully understand what users write in their source frameworks
2. Our grammar can't represent all the patterns they use
3. Conversions produce syntax errors or lose functionality
4. Users can't deploy because the output has bugs

**The Fix:** Research every framework we support, document their patterns, and ensure our grammar can represent them accurately.

---

## Research Matrix

### Source Frameworks (Convert FROM)

| Framework | Priority | Official Docs | Grammar Coverage | Research Status |
|-----------|----------|---------------|------------------|-----------------|
| **Next.js** | P0 | nextjs.org/docs | ~40% | NOT STARTED |
| **React** | P0 | react.dev | ~30% | NOT STARTED |
| **Prisma** | P0 | prisma.io/docs | ~50% | NOT STARTED |
| **TypeScript** | P1 | typescriptlang.org/docs | ~60% | NOT STARTED |
| **tRPC** | P2 | trpc.io/docs | ~10% | NOT STARTED |
| **Tailwind CSS** | P2 | tailwindcss.com/docs | ~0% | NOT STARTED |
| **Supabase** | P2 | supabase.com/docs | ~20% | NOT STARTED |

### Target Output (Convert TO)

| Target | Priority | Official Docs | Generator Status |
|--------|----------|---------------|------------------|
| **TypeScript** | P0 | typescriptlang.org | Basic |
| **React Components** | P1 | react.dev | Not Started |
| **API Routes** | P1 | nextjs.org/docs/api | Not Started |

---

## Research Tasks by Framework

### 1. Next.js (P0 - HIGHEST PRIORITY)

**Official Documentation:** https://nextjs.org/docs

**What We Need to Understand:**

- [ ] **Project Structure**
  - `app/` directory (App Router)
  - `pages/` directory (Pages Router)
  - `components/` directory patterns
  - `lib/` and `utils/` patterns
  - `api/` routes structure

- [ ] **Routing Patterns**
  - Dynamic routes `[id]`, `[...slug]`
  - Route groups `(group)`
  - Parallel routes `@folder`
  - Intercepting routes `(.)folder`
  - Layout and template files

- [ ] **Data Fetching**
  - `getServerSideProps`
  - `getStaticProps`
  - `getStaticPaths`
  - Server Components
  - Client Components
  - `use client` directive
  - `use server` directive

- [ ] **API Routes**
  - Route handlers
  - Request/Response handling
  - Middleware
  - Edge functions

- [ ] **File Conventions**
  - `page.tsx`
  - `layout.tsx`
  - `loading.tsx`
  - `error.tsx`
  - `not-found.tsx`
  - `template.tsx`
  - `default.tsx`

**Grammar Gaps to Fill:**
- [ ] Layout concept (nested layouts)
- [ ] Loading states
- [ ] Error boundaries
- [ ] Parallel data loading
- [ ] Server vs Client components

---

### 2. React (P0 - HIGHEST PRIORITY)

**Official Documentation:** https://react.dev

**What We Need to Understand:**

- [ ] **Component Patterns**
  - Functional components
  - Props and state
  - Hooks (useState, useEffect, useContext, etc.)
  - Event handling
  - Conditional rendering
  - Lists and keys
  - Forms and controlled components

- [ ] **State Management**
  - Local state
  - Context API
  - useReducer pattern
  - External stores (Zustand, Jotai, Redux)

- [ ] **Effects and Lifecycle**
  - useEffect patterns
  - Cleanup functions
  - Dependencies array
  - useMemo, useCallback

- [ ] **Component Composition**
  - Children props
  - Render props
  - Higher-order components
  - Compound components

**Grammar Gaps to Fill:**
- [ ] Component state (beyond yes/no)
- [ ] Effect declarations
- [ ] Computed values
- [ ] Event handlers with parameters
- [ ] Conditional rendering logic

---

### 3. Prisma (P0 - HIGHEST PRIORITY)

**Official Documentation:** https://www.prisma.io/docs

**What We Need to Understand:**

- [ ] **Schema Language**
  - Model definitions
  - Field types (String, Int, Boolean, DateTime, etc.)
  - Modifiers (@id, @unique, @default, etc.)
  - Relations (one-to-one, one-to-many, many-to-many)
  - Enums
  - Composite types

- [ ] **Field Types Mapping**
  ```prisma
  String    -> text
  Int       -> number
  Float     -> number
  Boolean   -> yes/no
  DateTime  -> datetime
  Json      -> ??? (need support)
  Bytes     -> ??? (need support)
  BigInt    -> ??? (need support)
  Decimal   -> money?
  ```

- [ ] **Relation Patterns**
  - Foreign keys
  - Implicit many-to-many
  - Self-relations
  - Cascading deletes

- [ ] **Advanced Features**
  - Composite keys
  - Unique constraints
  - Indexes
  - Full-text search

**Grammar Gaps to Fill:**
- [ ] `Json` field type
- [ ] `Bytes` field type
- [ ] `BigInt` field type
- [ ] Composite unique constraints
- [ ] Indexes
- [ ] Cascade rules

---

### 4. TypeScript (P1)

**Official Documentation:** https://www.typescriptlang.org/docs

**What We Need to Understand:**

- [ ] **Type System**
  - Primitive types (string, number, boolean, etc.)
  - Object types
  - Array types
  - Union types
  - Intersection types
  - Literal types
  - Template literal types

- [ ] **Type Modifiers**
  - Optional properties (`?`)
  - Readonly properties
  - Index signatures
  - Mapped types

- [ ] **Generics**
  - Generic functions
  - Generic types
  - Generic constraints
  - Conditional types

- [ ] **Module System**
  - Import/export
  - Type imports
  - Declaration files

**Grammar Gaps to Fill:**
- [ ] Optional fields (`text?`)
- [ ] Union types (`"low" | "medium" | "high"`)
- [ ] Array types (`text[]`)
- [ ] Nullable types (`text | null`)

---

### 5. tRPC (P2)

**Official Documentation:** https://trpc.io/docs

**What We Need to Understand:**

- [ ] **Router Structure**
  - Procedure definitions
  - Input validation (Zod)
  - Output types
  - Middleware

- [ ] **Query/Mutation Patterns**
  - Query procedures
  - Mutation procedures
  - Subscriptions
  - Batching

- [ ] **Client Usage**
  - React Query integration
  - Hooks (useQuery, useMutation)
  - Optimistic updates

**Grammar Gaps to Fill:**
- [ ] Input validation rules
- [ ] Procedure return types
- [ ] Subscription support

---

### 6. Tailwind CSS (P2)

**Official Documentation:** https://tailwindcss.com/docs

**What We Need to Understand:**

- [ ] **Class Patterns**
  - Utility classes
  - Responsive modifiers
  - State modifiers (hover, focus, etc.)
  - Dark mode

- [ ] **Component Patterns**
  - Common layouts (flex, grid)
  - Typography patterns
  - Color systems
  - Spacing systems

**Grammar Gaps to Fill:**
- [ ] Style declarations
- [ ] Layout constraints
- [ ] Responsive breakpoints
- [ ] Theme tokens

---

### 7. Supabase (P2)

**Official Documentation:** https://supabase.com/docs

**What We Need to Understand:**

- [ ] **Database**
  - Table structure
  - Row Level Security (RLS)
  - Policies
  - Triggers
  - Functions

- [ ] **Auth**
  - User management
  - OAuth providers
  - Session handling
  - Role-based access

- [ ] **Storage**
  - Bucket management
  - File uploads
  - Access policies

- [ ] **Realtime**
  - Subscriptions
  - Presence
  - Broadcast

**Grammar Gaps to Fill:**
- [ ] RLS policy syntax
- [ ] Auth rules
- [ ] Realtime subscriptions
- [ ] Storage file references

---

## Type Mapping Reference

### Current ShepLang Types

| ShepLang Type | Description |
|---------------|-------------|
| `text` | String values |
| `number` | Numeric values |
| `yes/no` | Boolean values |
| `id` | Unique identifiers |
| `date` | Date only |
| `datetime` | Date and time |
| `email` | Email addresses |
| `money` | Currency values |
| `image` | Image URLs/paths |
| `richtext` | Formatted text/HTML |
| `file` | File uploads |
| `ref[Entity]` | Reference to another entity |

### Types We Need to Add

| Proposed Type | Use Case | Source |
|---------------|----------|--------|
| `json` | Arbitrary JSON data | Prisma |
| `text[]` | Array of strings | TypeScript |
| `number[]` | Array of numbers | TypeScript |
| `text?` | Optional string | TypeScript |
| `enum[...]` | Fixed set of values | Prisma/TS |
| `bigint` | Large integers | Prisma |
| `decimal` | Precise decimals | Prisma |
| `bytes` | Binary data | Prisma |
| `url` | URL strings | Common |
| `phone` | Phone numbers | Common |
| `uuid` | UUID strings | Common |

---

## Grammar Extension Roadmap

### Phase 3A: TypeScript Parity (Week 1-2)
1. Optional fields: `name: text?`
2. Array fields: `tags: text[]`
3. Union types: `status: "draft" | "published"`
4. Default values: `active: yes/no = yes`

### Phase 3B: Prisma Parity (Week 2-3)
1. Enum declarations
2. Composite unique constraints
3. Index declarations
4. Cascade rules
5. JSON type support

### Phase 3C: React/Next.js Parity (Week 3-4)
1. Layout declarations
2. Loading state declarations
3. Error boundary declarations
4. Effect declarations
5. Computed field declarations

### Phase 3D: Advanced Features (Week 4+)
1. RLS policy syntax
2. Realtime subscriptions
3. File storage rules
4. Custom validation rules

---

## Research Process

For each framework:

1. **Read Official Docs**
   - Start with "Getting Started"
   - Read "Core Concepts"
   - Study "API Reference"
   - Review "Best Practices"

2. **Analyze Real Projects**
   - Study open-source examples
   - Identify common patterns
   - Note edge cases

3. **Document Gaps**
   - What can't ShepLang represent?
   - What would be lost in conversion?
   - What errors would occur?

4. **Propose Grammar Changes**
   - Minimal changes for maximum coverage
   - Backward compatible when possible
   - Clear syntax that AI can learn

5. **Implement & Test**
   - Update `shep.langium` grammar
   - Update transpiler generators
   - Add test cases
   - Verify conversions

---

## Success Criteria

### Minimum Viable (Alpha)
- [ ] Convert simple Next.js + Prisma projects without errors
- [ ] All Prisma field types supported
- [ ] Basic React component patterns represented
- [ ] TypeScript types generated correctly

### Production Ready (Beta)
- [ ] Convert complex Next.js projects
- [ ] Support all common Prisma patterns
- [ ] RLS policies supported
- [ ] Realtime features supported
- [ ] 95%+ conversion accuracy

### Enterprise Ready (v1.0)
- [ ] Full Next.js App Router support
- [ ] Full Prisma schema support
- [ ] Full Supabase integration
- [ ] Custom validation rules
- [ ] 99%+ conversion accuracy

---

## Immediate Next Steps

1. **Start with Next.js App Router documentation**
   - This is what most new projects use
   - Understanding this unlocks modern patterns

2. **Map Prisma types to ShepLang**
   - Create complete type mapping table
   - Identify missing types
   - Propose grammar additions

3. **Study React patterns in real Next.js apps**
   - Clone 5-10 popular templates
   - Analyze component patterns
   - Document what ShepLang can't represent

4. **Create test conversion suite**
   - Build sample Next.js projects
   - Convert to ShepLang
   - Measure conversion accuracy
   - Document failures

---

## Resources

### Official Documentation Links
- Next.js: https://nextjs.org/docs
- React: https://react.dev
- Prisma: https://www.prisma.io/docs
- TypeScript: https://www.typescriptlang.org/docs
- tRPC: https://trpc.io/docs
- Tailwind: https://tailwindcss.com/docs
- Supabase: https://supabase.com/docs

### Example Projects to Study
- T3 Stack: https://github.com/t3-oss/create-t3-app
- Next.js Examples: https://github.com/vercel/next.js/tree/canary/examples
- Prisma Examples: https://github.com/prisma/prisma-examples
- Supabase Examples: https://github.com/supabase/supabase/tree/master/examples

---

**Remember:** Every decision must be backed by official documentation. No hallucinating features. When in doubt, search the internet for the official answer.

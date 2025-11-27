# Next.js to ShepLang Mapping

**Source:** Official Next.js Documentation (nextjs.org/docs/app)  
**Date:** November 26, 2025  
**Status:** RESEARCH COMPLETE

---

## Executive Summary

This document maps Next.js App Router concepts to ShepLang equivalents, identifying patterns that ShepLang already supports and gaps that may need grammar extensions.

---

## Next.js App Router Core Concepts

### File Conventions (Official)

| File | Purpose | ShepLang Equivalent |
|------|---------|---------------------|
| `page.tsx` | Page UI | `view` block |
| `layout.tsx` | Shared UI wrapper | ⚠️ No direct equivalent |
| `loading.tsx` | Loading skeleton | ⚠️ No direct equivalent |
| `error.tsx` | Error boundary | ⚠️ No direct equivalent |
| `route.ts` | API endpoint | `action` with `call`/`load` |
| `template.tsx` | Re-renders on nav | ⚠️ No direct equivalent |
| `not-found.tsx` | 404 page | ⚠️ No direct equivalent |

### Routing Patterns (Official)

| Pattern | Next.js Syntax | ShepLang Support |
|---------|----------------|------------------|
| Nested routes | `app/blog/page.tsx` → `/blog` | ✅ Views can reference other views |
| Dynamic routes | `app/blog/[slug]/page.tsx` | ⚠️ No parameter routes |
| Catch-all | `app/shop/[...slug]/page.tsx` | ❌ Not supported |
| Optional catch-all | `app/docs/[[...slug]]/page.tsx` | ❌ Not supported |
| Route groups | `(marketing)` | ❌ Not needed (ShepLang is flat) |
| Private folders | `_components` | ❌ Not applicable |
| Parallel routes | `@folder` | ❌ Not supported |
| Intercepting routes | `(.)folder` | ❌ Not supported |

---

## Mapping Analysis

### 1. Views/Pages

**Next.js:**
```tsx
// app/dashboard/page.tsx
export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <UserList />
      <button onClick={createUser}>New User</button>
    </div>
  );
}
```

**ShepLang (Current):**
```sheplang
view Dashboard {
  list User
  button "New User" -> CreateUser
}
```

**Status:** ✅ Core view concept maps well

---

### 2. Data Fetching

**Next.js Server Component:**
```tsx
export default async function Page() {
  const data = await fetch('https://api.example.com/posts');
  const posts = await data.json();
  return <PostList posts={posts} />;
}
```

**Next.js with ORM:**
```tsx
import { db } from '@/lib/db';

export default async function Page() {
  const posts = await db.select().from(posts);
  return <PostList posts={posts} />;
}
```

**ShepLang (Current):**
```sheplang
action LoadPosts() {
  load GET "/api/posts" into posts
  show PostList
}
```

**Status:** ✅ `load` statement handles API fetching

---

### 3. API Routes

**Next.js Route Handler:**
```tsx
// app/api/users/route.ts
export async function GET() {
  const users = await db.users.findMany();
  return Response.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await db.users.create({ data: body });
  return Response.json(user);
}
```

**ShepLang (Current):**
```sheplang
action CreateUser(name, email) {
  call POST "/api/users" with name, email
  load GET "/api/users" into users
  show UserList
}
```

**Status:** ✅ `call` and `load` handle API interactions

---

### 4. Layouts (GAP)

**Next.js:**
```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        <Sidebar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

**ShepLang (Current):** ❌ No layout concept

**Proposed ShepLang:**
```sheplang
layout Main {
  header: AppHeader
  sidebar: Navigation
  footer: AppFooter
}

view Dashboard {
  layout: Main
  list User
  button "New" -> CreateUser
}
```

**Gap:** 🔴 Need `layout` declaration

---

### 5. Loading States (GAP)

**Next.js:**
```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <Skeleton />;
}
```

**ShepLang (Current):** ❌ No loading state concept

**Proposed ShepLang:**
```sheplang
view Dashboard {
  loading: DashboardSkeleton
  list User
}

view DashboardSkeleton {
  // Skeleton UI
}
```

**Gap:** 🟡 Optional - can be handled at transpile time

---

### 6. Error Boundaries (GAP)

**Next.js:**
```tsx
// app/dashboard/error.tsx
'use client';

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

**ShepLang (Current):** ❌ No error boundary concept

**Proposed ShepLang:**
```sheplang
view Dashboard {
  error: DashboardError
  list User
}

action DashboardError(error) {
  show ErrorView
}
```

**Gap:** 🟡 Optional - can be auto-generated

---

### 7. Server vs Client Components (GAP)

**Next.js:**
```tsx
// Server Component (default)
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Client Component
'use client';
export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

**ShepLang (Current):** No distinction - everything is declarative

**Proposed:** Not needed for ShepLang - transpiler decides based on usage

**Gap:** ⚪ Not applicable - ShepLang abstracts this

---

### 8. Dynamic Routes (GAP)

**Next.js:**
```tsx
// app/posts/[id]/page.tsx
export default async function Post({ params }) {
  const post = await getPost(params.id);
  return <article>{post.title}</article>;
}
```

**ShepLang (Current):** ❌ No parameterized views

**Proposed ShepLang:**
```sheplang
view PostDetail(postId) {
  // postId is accessible
  show Post where id = postId
}
```

**Gap:** 🔴 Need parameterized views

---

## Gap Analysis Summary

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Basic pages/views | ✅ Supported | - | Core mapping works |
| API calls | ✅ Supported | - | `call`/`load` statements |
| Data models | ✅ Supported | - | `data` blocks |
| Layouts | 🔴 Missing | P1 | Common pattern |
| Parameterized views | 🔴 Missing | P1 | Essential for detail pages |
| Loading states | 🟡 Optional | P2 | Can auto-generate |
| Error boundaries | 🟡 Optional | P2 | Can auto-generate |
| Route groups | ⚪ Not needed | - | ShepLang is flat |
| Parallel routes | ⚪ Not needed | - | Advanced pattern |
| Server/Client split | ⚪ Not needed | - | Transpiler handles |

---

## Proposed Grammar Extensions for Next.js Parity

### 1. Layout Declarations (P1)

```langium
LayoutDecl:
  'layout' name=ShepIdentifier '{'
    ('header' ':' header=[ViewDecl])?
    ('sidebar' ':' sidebar=[ViewDecl])?
    ('footer' ':' footer=[ViewDecl])?
  '}';

// Update ViewDecl to reference layout
ViewDecl:
  'view' name=ShepIdentifier ('(' params+=ParamDecl (',' params+=ParamDecl)* ')')? '{'
    ('layout' ':' layout=[LayoutDecl])?
    widgets+=WidgetDecl*
  '}';
```

### 2. Parameterized Views (P1)

```langium
// Already partially supported via action params
// Views need param support:
ViewDecl:
  'view' name=ShepIdentifier ('(' params+=ParamDecl (',' params+=ParamDecl)* ')')? '{'
    widgets+=WidgetDecl*
  '}';
```

### 3. Loading/Error States (P2)

```langium
// Add optional loading/error references to ViewDecl
ViewDecl:
  'view' name=ShepIdentifier '{'
    ('loading' ':' loading=[ViewDecl])?
    ('error' ':' error=[ActionDecl])?
    widgets+=WidgetDecl*
  '}';
```

---

## Conversion Examples

### Before (Next.js)

```
app/
├── layout.tsx
├── page.tsx
├── dashboard/
│   ├── page.tsx
│   ├── loading.tsx
│   └── error.tsx
├── posts/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
└── api/
    └── posts/
        └── route.ts
```

### After (ShepLang)

```sheplang
app BlogApp {

  // Layout (proposed)
  layout Main {
    header: AppHeader
    footer: AppFooter
  }

  // Views
  view Home {
    layout: Main
    list Post
    button "Dashboard" -> ShowDashboard
  }

  view Dashboard {
    layout: Main
    loading: DashboardSkeleton
    list User
    list Post
  }

  view DashboardSkeleton {
    // Skeleton placeholder
  }

  view PostList {
    list Post
    button "New Post" -> CreatePost
  }

  // Parameterized view (proposed)
  view PostDetail(postId) {
    show Post where id = postId
    button "Back" -> ShowPosts
  }

  // Actions
  action ShowDashboard() {
    load GET "/api/posts" into posts
    load GET "/api/users" into users
    show Dashboard
  }

  action ShowPosts() {
    load GET "/api/posts" into posts
    show PostList
  }

  action ShowPost(postId) {
    load GET "/api/posts/:id" into post
    show PostDetail
  }

  action CreatePost(title, content) {
    call POST "/api/posts" with title, content
    load GET "/api/posts" into posts
    show PostList
  }

}
```

---

## Implementation Priority

### P1 - Must Have for Basic Next.js Conversion
1. **Parameterized views** - `view PostDetail(postId)` - Essential for detail pages
2. **Layout declarations** - Common pattern in all Next.js apps

### P2 - Nice to Have
3. **Loading state references** - Can be auto-generated for now
4. **Error boundary references** - Can be auto-generated for now

### Not Needed
- Route groups (ShepLang doesn't need URL organization)
- Parallel routes (Advanced, rare pattern)
- Server/Client distinction (Transpiler handles this)

---

## References

- Next.js Project Structure: https://nextjs.org/docs/app/getting-started/project-structure
- Next.js Routing: https://nextjs.org/docs/app/building-your-application/routing
- Next.js Data Fetching: https://nextjs.org/docs/app/getting-started/fetching-data
- Next.js File Conventions: https://nextjs.org/docs/app/api-reference/file-conventions

---

**This document is based entirely on official Next.js documentation. No hallucinated features.**

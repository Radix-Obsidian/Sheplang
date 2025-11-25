# GitHub Repo Analysis - Production Pattern Research

**Date:** November 25, 2025  
**Status:** BRAINSTORM / RESEARCH PHASE  
**Purpose:** Ensure ShepLang can import/generate intermediate & complex projects  
**Methodology:** Evidence-Driven Debugging™ - No hallucinations, only real code

---

## Goal

Analyze **real-world production repositories** to ensure our ShepLang import and generator can handle:

1. **Intermediate Projects** - Multi-feature apps with auth, payments, file upload
2. **Complex Projects** - Production SaaS with webhooks, queues, search, real-time

**Constraint:** We adapt the **generator**, never the **language**. ShepLang syntax stays stable.

---

## Repository Selection Criteria

### Must Have:
- ✅ **Real production code** (not tutorials or demos)
- ✅ **Active maintenance** (updated in last 6 months)
- ✅ **Good documentation** (README explains architecture)
- ✅ **TypeScript/JavaScript** (our target ecosystem)
- ✅ **Modern stack** (Next.js 13+, React 18+)
- ✅ **Production patterns** (auth, payments, email, etc.)

### Categories:
1. **SaaS Starters** - Full auth + payments + subscription
2. **Marketplaces** - Two-sided platforms, search, messaging
3. **Developer Tools** - API platforms, webhooks, integrations
4. **Social Apps** - Feeds, notifications, real-time
5. **AI Apps** - LLM integrations, vector search, streaming

---

## Target Repositories

### Category 1: SaaS Starters

#### 1. `vercel/nextjs-subscription-payments`
- **URL:** https://github.com/vercel/nextjs-subscription-payments
- **Stack:** Next.js 13, Supabase, Stripe
- **Patterns to Extract:**
  - Stripe Checkout integration
  - Webhook handling (subscription events)
  - Protected routes (auth middleware)
  - Database schema (users, subscriptions, prices)
  - Email notifications (subscription changes)

**Why this matters:** Most SaaS apps need subscriptions. If we can import this, we can handle 80% of SaaS starters.

---

#### 2. `steven-tey/dub`
- **URL:** https://github.com/dubinc/dub
- **Stack:** Next.js 14, Prisma, Upstash, Tinybird
- **Patterns to Extract:**
  - Custom short URLs (slug generation)
  - Analytics tracking (click events)
  - Rate limiting (Redis)
  - QR code generation
  - Webhook notifications (link clicks)
  - Team/workspace management

**Why this matters:** Complex data flows, real-time analytics, multi-tenancy.

---

#### 3. `calcom/cal.com`
- **URL:** https://github.com/calcom/cal.com
- **Stack:** Next.js 14, Prisma, Stripe, SendGrid
- **Patterns to Extract:**
  - Calendar integration (Google, Outlook)
  - Scheduling logic (availability, timezones)
  - Email reminders (SendGrid templates)
  - Payment collection (Stripe)
  - Webhooks (booking created, cancelled)
  - Video conferencing (Zoom, Google Meet)

**Why this matters:** Complex business logic, external integrations, real-time scheduling.

---

### Category 2: Marketplaces

#### 4. `boxyhq/saas-starter-kit`
- **URL:** https://github.com/boxyhq/saas-starter-kit
- **Stack:** Next.js, Prisma, NextAuth, Stripe
- **Patterns to Extract:**
  - Multi-tenancy (teams, workspaces)
  - Role-based access control (RBAC)
  - Invitation system (email invites)
  - Billing per team
  - Audit logs

**Why this matters:** B2B SaaS pattern, team management.

---

#### 5. `airbnb/javascript` (NOT CODE - but style guide)
- Actually, let's use a real marketplace repo instead:

#### 5. `directus/directus`
- **URL:** https://github.com/directus/directus
- **Stack:** Node.js, PostgreSQL, Vue.js
- **Patterns to Extract:**
  - Dynamic schema generation
  - File upload (multiple providers: S3, Google Cloud, local)
  - Webhooks (CRUD events)
  - API auto-generation
  - GraphQL + REST
  - Permissions system (granular RBAC)

**Why this matters:** Headless CMS pattern, dynamic data modeling.

---

### Category 3: Developer Tools

#### 6. `novuhq/novu`
- **URL:** https://github.com/novuhq/novu
- **Stack:** NestJS, MongoDB, Redis, Bull
- **Patterns to Extract:**
  - Multi-channel notifications (email, SMS, push, in-app)
  - Webhook delivery
  - Template management
  - Event triggers
  - Rate limiting
  - Queue processing (Bull)
  - Digest notifications (batching)

**Why this matters:** Complex queuing, multi-provider integrations, webhook reliability.

---

#### 7. `supabase/realtime`
- **URL:** https://github.com/supabase/realtime
- **Stack:** Elixir, PostgreSQL, WebSockets
- **Patterns to Extract:**
  - Real-time subscriptions (database changes)
  - WebSocket management
  - Presence tracking
  - Broadcast channels
  - PostgreSQL CDC (change data capture)

**Why this matters:** Real-time features, WebSocket patterns.

---

#### 8. `highlight/highlight`
- **URL:** https://github.com/highlight/highlight
- **Stack:** Next.js, Go, ClickHouse, Kafka
- **Patterns to Extract:**
  - Session replay storage
  - Error tracking
  - Log aggregation
  - Time-series data (ClickHouse)
  - Real-time dashboards

**Why this matters:** High-volume data ingestion, analytics.

---

### Category 4: Social Apps

#### 9. `t3-oss/create-t3-app` (template)
- **URL:** https://github.com/t3-oss/create-t3-app
- **Stack:** Next.js, tRPC, Prisma, NextAuth
- **Patterns to Extract:**
  - tRPC API routes (type-safe)
  - Authentication (NextAuth)
  - Database ORM (Prisma)
  - Type safety end-to-end

**Why this matters:** Type-safe full-stack pattern, modern best practices.

---

#### 10. `civitai/civitai`
- **URL:** https://github.com/civitai/civitai
- **Stack:** Next.js, Prisma, S3, Cloudflare
- **Patterns to Extract:**
  - Image generation workflow
  - File storage (large files, CDN)
  - User-generated content
  - Moderation system
  - Like/comment system
  - Search & filtering (Meilisearch)

**Why this matters:** UGC platform, content moderation, large file handling.

---

### Category 5: AI Apps

#### 11. `mckaywrigley/chatbot-ui`
- **URL:** https://github.com/mckaywrigley/chatbot-ui
- **Stack:** Next.js, OpenAI API, Supabase
- **Patterns to Extract:**
  - Streaming responses (OpenAI)
  - Conversation management
  - Message history
  - Prompt templates
  - API key management

**Why this matters:** AI chat pattern, streaming responses.

---

#### 12. `run-llama/chat-llamaindex`
- **URL:** https://github.com/run-llama/chat-llamaindex
- **Stack:** Next.js, LlamaIndex, Pinecone
- **Patterns to Extract:**
  - Vector database (embeddings)
  - RAG (retrieval-augmented generation)
  - Document processing
  - Streaming chat
  - Context management

**Why this matters:** RAG pattern, vector search, document Q&A.

---

#### 13. `danny-avila/LibreChat`
- **URL:** https://github.com/danny-avila/LibreChat
- **Stack:** Node.js, MongoDB, Redis, OpenAI
- **Patterns to Extract:**
  - Multi-model support (GPT, Claude, Gemini)
  - Conversation branching
  - Plugin system
  - File attachments
  - User preferences

**Why this matters:** Multi-provider AI, plugin architecture.

---

## Analysis Framework

For each repository, extract:

### 1. Architecture Patterns

```yaml
Project: vercel/nextjs-subscription-payments

Architecture:
  - Pattern: Vertical Features (by domain)
  - Structure:
      /app
        /api
          /webhooks
            /stripe/route.ts       # Webhook handler
        /account
          /page.tsx               # Protected route
      /utils
        /supabase
          /server.ts              # Server client
          /client.ts              # Client client
        /stripe
          /server.ts              # Stripe helpers

  Key Decisions:
    - Server Components for auth checks
    - Route handlers for API
    - Supabase for auth + database
    - Stripe for payments
```

### 2. Data Models

```prisma
// What entities exist?
model User {
  id: String
  email: String
  subscriptionId: String?
  customerId: String?        // Stripe customer ID
}

model Subscription {
  id: String
  userId: String
  status: String             // active, cancelled, past_due
  priceId: String
  currentPeriodEnd: DateTime
}

model Price {
  id: String
  productId: String
  amount: Number
  interval: String           // month, year
}
```

### 3. API Endpoints

```typescript
// What routes exist?
POST /api/webhooks/stripe    // Stripe webhook
POST /api/create-checkout    // Create Stripe checkout
GET  /api/user               // Get current user
POST /api/create-portal      // Stripe customer portal
```

### 4. External Integrations

```yaml
Services:
  - Stripe:
      - Checkout Sessions
      - Customer Portal
      - Webhooks (subscription.created, subscription.updated)
  - Supabase:
      - Authentication (magic link)
      - Database (PostgreSQL)
      - Row-level security (RLS)
  - Resend:
      - Transactional emails
```

### 5. Complex Logic

```typescript
// What business logic is non-trivial?

// Example: Webhook handling
async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'customer.subscription.created':
      // Create subscription record
      // Send welcome email
      // Update user tier
      break;
    case 'customer.subscription.updated':
      // Update subscription status
      // Handle downgrades/upgrades
      break;
    case 'invoice.payment_failed':
      // Send payment failed email
      // Mark subscription as past_due
      break;
  }
}
```

### 6. Environment Configuration

```bash
# What env vars are required?
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

## Pattern Mapping to ShepThon

For each discovered pattern, map to ShepThon syntax:

### Example: Stripe Webhook Handler

**Real Code (Next.js):**
```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  
  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );
  
  switch (event.type) {
    case 'customer.subscription.created':
      const subscription = event.data.object;
      await db.subscription.create({
        data: {
          id: subscription.id,
          userId: subscription.metadata.userId,
          status: subscription.status
        }
      });
      break;
  }
  
  return new Response(JSON.stringify({ received: true }));
}
```

**ShepThon Equivalent:**
```shepthon
POST /webhooks/stripe -> {
  verify: payments.verifyWebhook(body, headers.signature, env.STRIPE_WEBHOOK_SECRET),
  action: payments.handleEvent({
    event: body.type,
    handlers: {
      "customer.subscription.created": [
        db.add("subscriptions", {
          id: body.data.object.id,
          userId: body.data.object.metadata.userId,
          status: body.data.object.status
        })
      ]
    }
  })
}
```

**Generator Output (TypeScript):**
```typescript
// Generated by ShepLang
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;
  
  // Verify webhook signature
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
  
  // Handle events
  switch (event.type) {
    case 'customer.subscription.created': {
      const subscription = event.data.object as Stripe.Subscription;
      await db.subscription.create({
        data: {
          id: subscription.id,
          userId: subscription.metadata.userId!,
          status: subscription.status
        }
      });
      break;
    }
  }
  
  return Response.json({ received: true });
}
```

---

## Analysis Deliverables

For each of the 13 repositories, produce:

1. **Pattern Catalog** (markdown)
   - List all patterns found
   - Code examples from repo
   - Mapped ShepThon syntax

2. **Generator Requirements** (spec)
   - What the generator needs to support
   - Edge cases to handle
   - Type mappings (Prisma → ShepThon)

3. **Test Cases** (real imports)
   - Import the actual repo
   - Verify all patterns captured
   - Check generated code quality

4. **Documentation Updates**
   - Add patterns to ShepThon reference
   - Create examples for each pattern
   - Link to official docs (Stripe, etc.)

---

## Research Process

### Phase 1: Clone & Explore (Week 1)
For each repo:
1. Clone locally
2. Read README & architecture docs
3. Map folder structure
4. Identify key files (API routes, models, utils)

### Phase 2: Pattern Extraction (Week 1-2)
1. Extract data models (Prisma schemas)
2. Extract API routes (endpoint list)
3. Extract integrations (Stripe, SendGrid, S3)
4. Extract business logic (complex functions)

### Phase 3: ShepThon Mapping (Week 2)
1. Design ShepThon syntax for each pattern
2. Validate with team
3. Update ShepThon grammar if needed (minimal)
4. Document each mapping

### Phase 4: Generator Implementation (Week 2-3)
1. Update parser to recognize patterns
2. Update mapper to convert patterns
3. Update generator to produce correct TypeScript
4. Test with real repos

### Phase 5: Validation (Week 3-4)
1. Import each repo with ShepLang
2. Compare generated code to original
3. Fix gaps in generator
4. Achieve 95%+ pattern coverage

---

## Success Criteria

ShepLang generator is ready when:

- ✅ Can import `vercel/nextjs-subscription-payments` with 95%+ accuracy
- ✅ Can import `calcom/cal.com` core features (scheduling, payments)
- ✅ Can import `dub` link shortening + analytics
- ✅ Can generate a SaaS starter from scratch with all patterns
- ✅ Zero hallucinated code in generator
- ✅ All patterns map to official documentation

---

## Pattern Coverage Matrix

| Pattern | ShepThon Syntax | Generator Support | Test Repo |
|---------|-----------------|-------------------|-----------|
| **Authentication** |
| Email/Password | `auth.register()` | ⏳ Planned | vercel/nextjs-sub |
| Magic Link | `auth.sendMagicLink()` | ⏳ Planned | vercel/nextjs-sub |
| OAuth (Google/GitHub) | `auth.oauth()` | ⏳ Planned | cal.com |
| JWT Sessions | `auth.session` | ⏳ Planned | All |
| **Payments** |
| Stripe Checkout | `payments.createCheckout()` | ⏳ Planned | vercel/nextjs-sub |
| Subscription Webhooks | `payments.handleEvent()` | ⏳ Planned | vercel/nextjs-sub |
| Customer Portal | `payments.createPortal()` | ⏳ Planned | vercel/nextjs-sub |
| **File Upload** |
| S3 Presigned URL | `storage.generateUploadUrl()` | ⏳ Planned | directus |
| Direct Upload | `storage.upload()` | ⏳ Planned | civitai |
| Image Optimization | `storage.uploadImage()` | ⏳ Planned | civitai |
| **Email** |
| Transactional | `email.send()` | ⏳ Planned | cal.com |
| Templates | `email template` | ⏳ Planned | novu |
| Bulk Send | `email.sendBulk()` | ⏳ Planned | novu |
| **Real-Time** |
| WebSockets | `websocket.on()` | ⏳ Future | supabase/realtime |
| Server-Sent Events | `sse.stream()` | ⏳ Future | chatbot-ui |
| **Search** |
| Full-Text | `search.fullText()` | ⏳ Planned | dub |
| Filters | `db.filter()` | ✅ Exists | All |
| **Background Jobs** |
| Cron | `job { schedule: "..." }` | ⏳ Planned | novu |
| Queue | `queue.add()` | ⏳ Planned | novu |
| **Multi-Tenancy** |
| Teams | `model Team` | ⏳ Planned | boxyhq |
| RBAC | `auth.hasRole()` | ⏳ Planned | directus |

---

## Next Steps

1. **Select 3 repos to start** (Recommendations):
   - `vercel/nextjs-subscription-payments` (foundational SaaS)
   - `calcom/cal.com` (complex business logic)
   - `dub` (analytics, rate limiting)

2. **Deep dive each repo** (1 week per repo):
   - Clone and explore
   - Extract patterns
   - Map to ShepThon
   - Update generator

3. **Validate with imports**:
   - Test actual import of each repo
   - Measure pattern coverage
   - Fix gaps

4. **Document findings**:
   - Create pattern catalog
   - Update ShepThon reference
   - Write migration guides

---

## Questions to Answer

1. **Type Mapping**: How do we handle complex Prisma types (Decimal, Json, Bytes)?
2. **Middleware**: How to represent Next.js middleware in ShepThon?
3. **Edge Cases**: What about server actions, streaming, parallel routes?
4. **Provider Abstraction**: Should we abstract Stripe/SendGrid or stay specific?
5. **Environment Validation**: How to validate required env vars at generation time?

---

## Risk Mitigation

**Risk:** Repos use patterns we can't represent in ShepThon  
**Mitigation:** Focus on 80/20 - cover most common patterns, not every edge case

**Risk:** Generated code differs too much from original  
**Mitigation:** Generate idiomatic Next.js/TypeScript, not custom framework

**Risk:** Patterns change over time (e.g., Stripe API updates)  
**Mitigation:** Document API versions used, provide migration guides

**Risk:** Too many patterns = bloated generator  
**Mitigation:** Modular generator (plugins for Stripe, S3, etc.)

---

**Status:** READY TO START  
**First Repo:** `vercel/nextjs-subscription-payments`  
**Timeline:** 4 weeks to comprehensive pattern coverage  
**Methodology:** Evidence-Driven Debugging™ - No guessing, only real code

---

*Built by: Jordan "AJ" Autrey - Golden Sheep AI*  
*"If it works in production, we can generate it."*

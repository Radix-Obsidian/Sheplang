# AIVP Stack Architecture Specification
**Version:** 1.0 (Draft)  
**Date:** November 21, 2025  
**Status:** SPECIFICATION - Awaiting Review & Approval

---

## Executive Summary

AIVP (AI-Native Verified Platform) Stack is a **full-stack framework for building real applications**, not CRUD toys.

**Vision:** Non-technical founders write a **single spec** that generates:
- ✅ Production-ready backend (ShepAPI)
- ✅ Type-safe data layer (ShepData)
- ✅ Real-world UI components (ShepUI)
- ✅ Verified runtime (ShepRuntime)

**Result:** SaaS products, marketplaces, social platforms—the kind of apps that take MERN teams 3–6 months—built in weeks.

---

## What AIVP Is NOT

- ❌ Another low-code CRUD generator
- ❌ A database admin panel builder
- ❌ "10-minute todo app" demos
- ❌ Form-builder-as-a-service
- ❌ Visual programming for non-developers (we're better than that)

---

## What AIVP IS

- ✅ **Spec-driven development** for real products
- ✅ **End-to-end type safety** from database to UI
- ✅ **Built-in verification** (ShepVerify) catching bugs at compile-time
- ✅ **Third-party integrations** declared in spec (Stripe, Elasticsearch, S3, Twilio, etc.)
- ✅ **Real-time features** (WebSockets, optimistic updates) auto-configured
- ✅ **Production patterns** (multi-tenancy, rate limiting, caching, background jobs)
- ✅ **AI-native** (AI agents generate code from specs, not templates)

---

## Core Components

### 1. ShepData (Data Layer)
**Replaces:** MongoDB + Mongoose + manual schema management

**Defines:** Entities, fields, relationships, constraints, enums, arrays

**Generates:**
- Database schemas with proper indexing
- TypeScript types with full relationship inference
- ORM models (Mongoose, Prisma, etc.)
- Migration scripts
- GraphQL/REST type definitions

**Example:**
```sheplang
entities:
  User:
    fields:
      - "email: email, required, unique"
      - "subscriptionTier: enum[Free, Pro, Enterprise], default=Free"
      - "stripeCustomerId: text, optional"
  
  Listing:
    fields:
      - "title: text, required"
      - "price: money, required"
      - "seller: ref[User], required"
      - "images: image[], max=10"
      - "status: enum[Draft, Active, Sold], default=Draft"
```

**Key Capabilities:**
- Complex relationships (not just flat CRUD)
- Rich field types (money, email, image, richtext, file, datetime, enum, etc.)
- Arrays and references
- Constraints (unique, required, max length, etc.)
- Default values and state machines via enums

---

### 2. ShepAPI (Backend Logic Layer)
**Replaces:** Express + manual route/controller/middleware setup

**Defines:** Flows (workflows), integrations, rules, state machines

**Generates:**
- REST/GraphQL endpoints with full type safety
- Workflow orchestration logic
- Third-party API integration code
- Validation middleware
- Error handling
- Background job definitions
- WebSocket handlers

**Example:**
```sheplang
flows:
  PurchaseListing:
    from: ListingDetail
    trigger: "User clicks 'Buy Now'"
    steps:
      - "Validate listing is still available"
      - "Create Stripe payment intent"
      - "On success: Create Purchase record"
      - "Update listing status to Sold"
      - "Send notification to seller"
      - "Send confirmation email to buyer"

integrations:
  Stripe:
    actions:
      - "createPaymentIntent(amount, currency, customerId)"
      - "confirmPayment(paymentIntentId)"

rules:
  - scope: "action.PurchaseListing"
    rule: "Buyer cannot purchase their own listing"
  - scope: "data.Listing"
    rule: "Price must be greater than $1.00"
```

**Key Capabilities:**
- Multi-step workflows with state tracking
- Third-party API integration (Stripe, Elasticsearch, SendGrid, S3, Twilio, etc.)
- Business rule enforcement
- Real-time features (WebSockets, pub/sub)
- Background jobs and scheduled tasks
- Email/SMS notifications
- Analytics tracking
- Payment processing and escrow patterns

---

### 3. ShepUI (Frontend Layer)
**Replaces:** React + manual component/form/state management setup

**Defines:** Screens, layouts, components, interactions

**Generates:**
- React components with TypeScript
- Form handling with validation
- Real-time updates (optimistic, WebSocket-driven)
- Image galleries, rich text editors, multi-step wizards
- Responsive layouts
- Accessibility built-in
- Mobile-ready by default

**Example:**
```sheplang
screens:
  MarketplaceHome:
    kind: "feed"
    layout:
      - "Header with search"
      - "Category navigation"
      - "Grid of listings with infinite scroll"
      - "Filter panel: category, price, sort"

  ListingDetail:
    kind: "detail"
    entity: Listing
    layout:
      - "Image gallery with zoom"
      - "Title, price, seller info"
      - "Action buttons: Buy, Favorite, Share"
      - "Related listings"

  CreateListing:
    kind: "wizard"
    entity: Listing
    steps:
      - name: "Basic Info"
        fields: [title, category, description]
      - name: "Pricing"
        fields: [price, acceptOffers]
      - name: "Images"
        fields: [imageUploader]
      - name: "Review"
        preview: true
        submit: "Publish"
```

**Key Capabilities:**
- Complex layouts (feeds, dashboards, detail pages, wizards)
- Real-time features (WebSockets, optimistic updates)
- Media handling (image galleries, uploads, compression)
- Rich text editing
- Multi-step forms with validation
- Infinite scroll and pagination
- Search with filters
- Mobile-responsive by default
- Accessibility (WCAG 2.1 AA)

---

### 4. ShepRuntime (Execution Layer)
**Replaces:** Node.js + manual middleware/verification setup

**Provides:**
- Type-safe execution (TypeScript strict mode)
- Real-time verification (ShepVerify continuously validates)
- Background job processing
- WebSocket support
- Caching layer (Redis)
- Rate limiting
- Monitoring hooks (Sentry, Datadog)
- Multi-tenant isolation
- Authentication/authorization

**Example:**
```typescript
@ShepApp('MarketplaceApp')
export class MarketplaceRuntime {
  
  @ShepAction('PurchaseListing')
  @Verify(PurchaseRules)
  @RateLimit({ max: 5, window: '1m' })
  @RequireAuth()
  async purchaseListing(
    @Param('listingId') listingId: string,
    @User() buyer: AuthenticatedUser
  ): Promise<PurchaseResult> {
    // All constraints verified at runtime
    // All types guaranteed by ShepLang
  }
  
  @ShepWebSocket('message:sent')
  @Verify(MessageRules)
  async handleNewMessage(socket: Socket, message: CreateMessageInput): Promise<void> {
    // Real-time message delivery
  }
  
  @ShepJob('process-payment', { cron: '*/5 * * * *' })
  async processPayments(): Promise<void> {
    // Background job for payment confirmation
  }
}
```

**Key Capabilities:**
- Decorator-based action/job/websocket definitions
- Automatic constraint verification
- Rate limiting and throttling
- Caching strategies
- Error handling and recovery
- Monitoring and observability
- Multi-tenancy support
- Authentication/authorization patterns

---

## Data Flow: From Spec to Running App

```
spec TodoApp.shep
    ↓
[ShepLang Parser]
    ↓
AppModel (AST)
    ↓
┌─────────────────────────────────────────┐
│                                         │
├─→ ShepData Compiler → Database Schema   │
│                    → TypeScript Types   │
│                    → ORM Models         │
│                                         │
├─→ ShepAPI Compiler  → REST Endpoints    │
│                    → Workflow Logic     │
│                    → Integration Code   │
│                    → Validation Rules   │
│                                         │
├─→ ShepUI Compiler   → React Components  │
│                    → Form Handling      │
│                    → State Management   │
│                    → Real-time Hooks    │
│                                         │
└─→ ShepVerify        → Type Checking     │
                     → Constraint Checks  │
                     → Integration Validation
                     → End-to-end Verification
                     ↓
            ✅ Production-Ready App
```

---

## Real Application Examples

### Example 1: SaaS Product (Project Management)

**Spec Highlights:**
```sheplang
entities:
  Workspace, Project, Task, Comment, Attachment
  User, Team, Invitation, Subscription

flows:
  InviteTeamMember, AcceptInvitation, AssignTask
  UploadAttachment, @MentionUser, FilterTasks
  UpgradeSubscription, BillingPortal

integrations:
  Stripe: subscriptions, invoicing
  AWS_S3: file storage
  SendGrid: transactional emails
  Slack: notifications
```

**What Gets Built:**
- Multi-tenant workspaces
- Team collaboration features
- File upload/storage
- @mentions and notifications
- Subscription billing
- Usage analytics
- Admin dashboard

**Typical MERN Timeline:** 4–6 months  
**AIVP Timeline:** 2–3 weeks

---

### Example 2: Consumer Social App

**Spec Highlights:**
```sheplang
entities:
  User, Post, Comment, Like, Follow
  Media, Hashtag, Notification, DirectMessage

flows:
  CreatePost, LikePost, CommentOnPost
  FollowUser, UnfollowUser
  SendDirectMessage, SearchUsers
  DiscoverFeed (algorithmic)

features:
  - "Infinite scroll feed with optimistic updates"
  - "Real-time notifications"
  - "Image/video upload with compression"
  - "Hashtag discovery"
  - "User mentions"
```

**What Gets Built:**
- News feed with algorithm
- Real-time messaging
- Media upload pipeline
- Social graph
- Discovery/search
- Notifications system

**Typical MERN Timeline:** 3–5 months  
**AIVP Timeline:** 2–3 weeks

---

### Example 3: Marketplace (Two-Sided Platform)

**Spec Highlights:**
```sheplang
entities:
  User, Listing, Purchase, Review, Message
  Category, SavedSearch, Report

flows:
  CreateListing, PurchaseItem, LeaveReview
  SearchWithFilters, SaveSearch
  ContactSeller, ReportListing

integrations:
  Stripe: Connect (multi-party payments)
  Elasticsearch: advanced search
  Twilio: SMS verification
  AWS_S3: image storage
```

**What Gets Built:**
- Seller/buyer workflows
- Payment processing with escrow
- Advanced search
- Messaging system
- Review/rating system
- Moderation tools

**Typical MERN Timeline:** 5–6 months  
**AIVP Timeline:** 3–4 weeks

---

## Key Differentiators vs MERN

| Feature | MERN | AIVP |
|---------|------|------|
| **Setup Time** | 2–4 hours | 5 minutes |
| **MVP Timeline** | 3–6 months | 2–4 weeks |
| **Type Safety** | Manual TypeScript | Automatic from spec |
| **Validation** | Manual middleware | Generated from rules |
| **Real-time** | Socket.io boilerplate | Auto-configured |
| **Payments** | Integrate Stripe manually | Declared in integrations |
| **File Uploads** | Multer + S3 setup | Declared in field types |
| **Search** | Build Elasticsearch queries | Declared in flows |
| **Auth/Permissions** | Custom middleware | Generated from rules |
| **API Docs** | Write Swagger manually | Auto-generated |
| **Background Jobs** | Set up Bull/Agenda | Declared in flows |
| **Verification** | Write tests after building | Built-in, continuous |
| **Mobile App** | Separate React Native codebase | Same spec, different target |
| **Non-Technical Friendly** | No | Yes |

---

## Constraints & Scope (V1.0)

### What We Support
- ✅ Relational data modeling (1:1, 1:N, N:N relationships)
- ✅ Standard REST/GraphQL endpoints
- ✅ Third-party integrations (Stripe, Elasticsearch, S3, SendGrid, Twilio, Slack)
- ✅ Real-time features (WebSockets, pub/sub)
- ✅ Background jobs and scheduled tasks
- ✅ Multi-tenancy patterns
- ✅ Role-based access control (RBAC)
- ✅ File uploads and media handling
- ✅ Email/SMS notifications
- ✅ Payment processing (Stripe, PayPal)
- ✅ Search and filtering (Elasticsearch, full-text)

### What We Don't Support (Yet)
- ❌ Machine learning model integration
- ❌ Complex analytics pipelines
- ❌ Video streaming/transcoding
- ❌ Blockchain/Web3 features
- ❌ Advanced geospatial queries
- ❌ Custom C++ extensions

---

## Design Principles

1. **Spec-First:** The spec is the source of truth. Everything else is generated.
2. **Type-Safe:** End-to-end type safety from database to UI.
3. **Verified:** ShepVerify catches bugs before runtime.
4. **AI-Native:** AI agents generate code from specs, not templates.
5. **Real-World:** Support production patterns (multi-tenancy, rate limiting, caching).
6. **Non-Technical:** Founders, not just developers, can build real apps.
7. **Extensible:** Easy to add new integrations, field types, and patterns.

---

## Open Questions for Review

1. **Deployment:** How do we handle deployment from spec → production? (Vercel, Railway, self-hosted?)
2. **Customization:** How much hand-written code can users add without breaking the spec?
3. **Versioning:** How do we handle breaking changes to specs?
4. **Monitoring:** What observability/monitoring should be built-in?
5. **Scaling:** How do we handle high-traffic applications (caching, CDN, database optimization)?
6. **Testing:** Should ShepVerify generate tests automatically?

---

**Status:** DRAFT - Awaiting review and approval before proceeding to component specs.

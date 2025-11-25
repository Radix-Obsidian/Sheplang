# ShepThon Production Patterns - Beyond CRUD

**Date:** November 25, 2025  
**Status:** DESIGN SPECIFICATION  
**Methodology:** Golden Sheep AI - Zero-Placeholder Policy™

---

## Philosophy

Following the **Golden Sheep AI Methodology**, ShepThon must support **real production patterns**, not just CRUD:

- ✅ **Zero-Placeholder Policy™** - No TODOs, no "implement later", no fake logic
- ✅ **Evidence-Driven Debugging™** - Every pattern based on official documentation
- ✅ **Vertical Slice Delivery™** - Each pattern enables a complete feature end-to-end
- ✅ **Full-Stack Reality Testing™** - Patterns tested with real services (test mode)

**Goal:** Support the same backend patterns as Lovable, Builder.io, and Cursor - but with **verification-first** guarantees.

---

## Current State (CRUD-Only)

```shepthon
# Basic CRUD (all we have today)
model User {
  id: String
  email: String
  name: String
}

GET /users -> db.all("users")
GET /users/:id -> db.find("users", params.id)
POST /users -> db.add("users", body)
PUT /users/:id -> db.update("users", params.id, body)
DELETE /users/:id -> db.remove("users", params.id)
```

**Problem:** This only covers 20% of real app requirements.

**Missing:**
- Authentication flows
- File uploads
- Email notifications
- Payment processing
- Search & filtering
- Background jobs
- Webhooks
- Rate limiting

---

## Production Patterns (Evidence-Based)

### 1. Authentication & Authorization

**Based on:** Passport.js, JWT spec, bcrypt documentation

```shepthon
# User model with auth fields
model User {
  id: String
  email: String
  password: String         # Hashed with bcrypt
  verified: Boolean
  resetToken: String?
  resetExpires: DateTime?
  createdAt: DateTime
}

# Sign up flow
POST /auth/signup -> auth.register({
  email: body.email,
  password: body.password,
  hash: "bcrypt",
  rounds: 10
})

# Login flow
POST /auth/login -> auth.authenticate({
  email: body.email,
  password: body.password,
  strategy: "local",
  sessionDuration: "7d"
})

# Logout
POST /auth/logout -> auth.logout(session.userId)

# Password reset request
POST /auth/reset-request -> auth.sendResetEmail({
  email: body.email,
  tokenExpiry: "1h"
})

# Password reset confirm
POST /auth/reset-confirm -> auth.resetPassword({
  token: body.token,
  newPassword: body.password
})

# Verify email
GET /auth/verify/:token -> auth.verifyEmail(params.token)

# Protected routes
GET /profile -> {
  require: auth.isAuthenticated(),
  action: db.find("users", session.userId)
}

# Role-based access
GET /admin/users -> {
  require: auth.hasRole("admin"),
  action: db.all("users")
}

# JWT token refresh
POST /auth/refresh -> auth.refreshToken(body.refreshToken)
```

**Implementation Requirements:**
- ✅ Uses bcrypt (industry standard)
- ✅ JWT with configurable expiry
- ✅ Email verification flow
- ✅ Password reset with expiring tokens
- ✅ Session management
- ✅ Role-based access control (RBAC)

**Official Docs Used:**
- [Passport.js](http://www.passportjs.org/docs/)
- [JWT.io](https://jwt.io/introduction)
- [bcrypt npm](https://www.npmjs.com/package/bcrypt)

---

### 2. File Upload (AWS S3)

**Based on:** AWS S3 SDK v3 documentation, presigned URL pattern

```shepthon
# File model
model File {
  id: String
  key: String          # S3 key
  url: String          # Public URL
  bucket: String
  size: Number
  mimeType: String
  uploadedBy: String   # User ID
  createdAt: DateTime
}

# Generate presigned upload URL
POST /upload/presigned -> storage.generateUploadUrl({
  bucket: env.S3_BUCKET,
  fileType: body.mimeType,
  maxSize: "10MB",
  expiresIn: "5m"
})

# Upload file (client uses presigned URL)
# Then confirm upload
POST /upload/confirm -> {
  action: db.add("files", {
    key: body.key,
    url: storage.getPublicUrl(env.S3_BUCKET, body.key),
    size: body.size,
    mimeType: body.mimeType,
    uploadedBy: session.userId
  })
}

# Get file URL
GET /files/:id -> storage.getSignedUrl({
  bucket: env.S3_BUCKET,
  key: db.find("files", params.id).key,
  expiresIn: "1h"
})

# Delete file
DELETE /files/:id -> {
  action: [
    storage.deleteObject(env.S3_BUCKET, file.key),
    db.remove("files", params.id)
  ]
}

# List user files
GET /files -> db.filter("files", {
  uploadedBy: session.userId
})

# Image optimization (optional)
POST /upload/image -> storage.uploadImage({
  bucket: env.S3_BUCKET,
  resize: { width: 800, height: 600 },
  format: "webp",
  quality: 80
})
```

**Implementation Requirements:**
- ✅ Presigned URLs (secure client-side upload)
- ✅ File size limits
- ✅ MIME type validation
- ✅ Automatic cleanup on delete
- ✅ Image optimization (optional)

**Official Docs Used:**
- [AWS S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)

---

### 3. Email Notifications (SendGrid)

**Based on:** SendGrid API v3, transactional templates

```shepthon
# Email template configuration
email template welcome {
  provider: "sendgrid",
  templateId: "d-abc123",
  from: env.FROM_EMAIL,
  subject: "Welcome to {{appName}}!"
}

email template passwordReset {
  provider: "sendgrid",
  templateId: "d-def456",
  from: env.FROM_EMAIL,
  subject: "Reset your password"
}

# Send welcome email
POST /auth/signup -> [
  auth.register(body),
  email.send({
    template: "welcome",
    to: body.email,
    data: {
      name: body.name,
      appName: env.APP_NAME,
      verifyUrl: `${env.APP_URL}/verify/${token}`
    }
  })
]

# Send password reset email
POST /auth/reset-request -> email.send({
  template: "passwordReset",
  to: body.email,
  data: {
    resetUrl: `${env.APP_URL}/reset/${token}`,
    expiresIn: "1 hour"
  }
})

# Bulk email (e.g., newsletter)
POST /admin/broadcast -> email.sendBulk({
  template: "newsletter",
  to: db.filter("users", { subscribed: true }).map(u => u.email),
  data: body.content,
  batchSize: 1000  # SendGrid best practice
})

# Email with attachment
POST /send-invoice -> email.send({
  to: body.email,
  subject: "Your invoice",
  template: "invoice",
  attachments: [{
    filename: "invoice.pdf",
    content: body.pdfBase64,
    type: "application/pdf"
  }]
})
```

**Implementation Requirements:**
- ✅ Template support (SendGrid dynamic templates)
- ✅ Environment variable configuration
- ✅ Bulk sending with batching
- ✅ Attachment support
- ✅ Error handling & retry

**Official Docs Used:**
- [SendGrid Transactional Templates](https://docs.sendgrid.com/api-reference/transactional-templates)
- [SendGrid Node.js Library](https://github.com/sendgrid/sendgrid-nodejs)

---

### 4. Payment Processing (Stripe)

**Based on:** Stripe Payment Intents API, webhooks

```shepthon
# Payment model
model Payment {
  id: String
  userId: String
  amount: Number
  currency: String
  status: String       # pending, succeeded, failed
  stripeId: String     # Stripe PaymentIntent ID
  createdAt: DateTime
}

# Create payment intent
POST /payments/create -> payments.createIntent({
  provider: "stripe",
  amount: body.amount,
  currency: "usd",
  metadata: {
    userId: session.userId,
    orderId: body.orderId
  }
})

# Webhook handler (Stripe callbacks)
POST /webhooks/stripe -> {
  verify: payments.verifyWebhook(body, headers.signature, env.STRIPE_WEBHOOK_SECRET),
  action: payments.handleEvent({
    event: body.type,
    handlers: {
      "payment_intent.succeeded": [
        db.update("payments", { stripeId: body.data.object.id }, { status: "succeeded" }),
        email.send({ template: "paymentSuccess", to: user.email })
      ],
      "payment_intent.failed": [
        db.update("payments", { stripeId: body.data.object.id }, { status: "failed" }),
        email.send({ template: "paymentFailed", to: user.email })
      ],
      "charge.refunded": [
        db.update("payments", { stripeId: body.data.object.id }, { status: "refunded" })
      ]
    }
  })
}

# List user payments
GET /payments -> db.filter("payments", {
  userId: session.userId
})

# Refund payment
POST /payments/:id/refund -> payments.refund({
  provider: "stripe",
  paymentIntentId: payment.stripeId,
  amount: body.amount  # Partial refund supported
})

# Create customer
POST /customers -> payments.createCustomer({
  provider: "stripe",
  email: session.user.email,
  name: session.user.name
})

# Subscription (recurring)
POST /subscriptions -> payments.createSubscription({
  provider: "stripe",
  customerId: user.stripeCustomerId,
  priceId: body.priceId,
  trialDays: 14
})
```

**Implementation Requirements:**
- ✅ Payment Intents API (SCA-compliant)
- ✅ Webhook signature verification
- ✅ Event-driven payment updates
- ✅ Refund support
- ✅ Customer & subscription management

**Official Docs Used:**
- [Stripe Payment Intents](https://docs.stripe.com/payments/payment-intents)
- [Stripe Webhooks](https://docs.stripe.com/webhooks)
- [Stripe Node.js Library](https://github.com/stripe/stripe-node)

---

### 5. Search & Filtering

**Based on:** Elasticsearch, PostgreSQL full-text search, MongoDB text indexes

```shepthon
# Full-text search
GET /search -> search.fullText({
  collection: "posts",
  query: params.q,
  fields: ["title", "content", "tags"],
  limit: 20
})

# Faceted search
GET /products -> search.faceted({
  collection: "products",
  query: params.q,
  filters: {
    category: params.category,
    priceMin: params.minPrice,
    priceMax: params.maxPrice,
    inStock: true
  },
  facets: ["category", "brand", "color"],
  sort: params.sort || "relevance"
})

# Autocomplete
GET /search/autocomplete -> search.autocomplete({
  collection: "users",
  field: "name",
  query: params.q,
  limit: 10
})

# Advanced filtering
GET /users -> db.filter("users", {
  role: params.role,
  verified: true,
  createdAt: { gte: params.startDate, lte: params.endDate },
  city: { in: params.cities }
})

# Pagination
GET /posts -> db.paginate("posts", {
  page: params.page || 1,
  limit: params.limit || 20,
  sort: { createdAt: "desc" }
})

# Cursor-based pagination (for infinite scroll)
GET /feed -> db.cursor("posts", {
  after: params.cursor,
  limit: 20
})
```

**Implementation Requirements:**
- ✅ Full-text search across multiple fields
- ✅ Faceted filtering
- ✅ Autocomplete/typeahead
- ✅ Range queries (dates, numbers)
- ✅ Pagination (offset & cursor)

**Official Docs Used:**
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [MongoDB Text Search](https://www.mongodb.com/docs/manual/text-search/)
- [Elasticsearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html)

---

### 6. Background Jobs & Queues

**Based on:** Bull (Redis), AWS SQS

```shepthon
# Job definition
job sendWeeklyDigest {
  schedule: "0 9 * * MON",  # Cron: Every Monday at 9 AM
  action: [
    db.filter("users", { subscribed: true }),
    email.sendBulk({ template: "weeklyDigest", to: users.map(u => u.email) })
  ]
}

job processVideo {
  queue: "video-processing",
  concurrency: 2,
  timeout: "10m",
  action: video.transcode(job.data.videoUrl)
}

# Enqueue job
POST /videos/upload -> [
  storage.upload(body.file),
  queue.add("processVideo", {
    videoUrl: file.url,
    userId: session.userId
  })
]

# Job status
GET /jobs/:id -> queue.getStatus(params.id)

# Retry failed jobs
POST /jobs/:id/retry -> queue.retry(params.id)

# Scheduled tasks
job cleanupOldFiles {
  schedule: "0 2 * * *",  # Daily at 2 AM
  action: [
    db.filter("files", { createdAt: { lte: Date.now() - 30 * 24 * 60 * 60 * 1000 } }),
    storage.deleteMany(files.map(f => f.key))
  ]
}
```

**Implementation Requirements:**
- ✅ Cron scheduling
- ✅ Queue-based jobs
- ✅ Retry logic
- ✅ Concurrency control
- ✅ Job status tracking

**Official Docs Used:**
- [Bull (Redis Queue)](https://github.com/OptimalBits/bull)
- [node-cron](https://github.com/node-cron/node-cron)

---

### 7. Rate Limiting & Caching

**Based on:** express-rate-limit, Redis

```shepthon
# Rate limiting
GET /api/* -> {
  rateLimit: {
    window: "15m",
    max: 100,
    message: "Too many requests, please try again later"
  },
  action: <handler>
}

POST /auth/login -> {
  rateLimit: {
    window: "15m",
    max: 5,
    keyBy: body.email,  # Rate limit per email
    blockDuration: "1h"
  },
  action: auth.authenticate(body)
}

# Caching
GET /products/:id -> {
  cache: {
    key: `product:${params.id}`,
    ttl: "5m"
  },
  action: db.find("products", params.id)
}

# Cache invalidation
POST /products/:id -> [
  db.update("products", params.id, body),
  cache.invalidate(`product:${params.id}`)
]
```

**Implementation Requirements:**
- ✅ Request rate limiting
- ✅ Per-user/per-IP/per-email limits
- ✅ Response caching
- ✅ Cache invalidation

**Official Docs Used:**
- [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit)
- [Redis caching patterns](https://redis.io/docs/manual/patterns/)

---

### 8. Webhooks (Outgoing)

**Based on:** Webhook best practices, Svix

```shepthon
# Webhook configuration
model Webhook {
  id: String
  userId: String
  url: String
  events: String[]     # ["user.created", "payment.succeeded"]
  secret: String
  active: Boolean
}

# Register webhook
POST /webhooks -> db.add("webhooks", {
  userId: session.userId,
  url: body.url,
  events: body.events,
  secret: crypto.randomString(32)
})

# Trigger webhook on event
POST /users -> [
  db.add("users", body),
  webhooks.trigger({
    event: "user.created",
    data: user,
    filters: { active: true, events: { includes: "user.created" } }
  })
]

# Webhook delivery logs
GET /webhooks/:id/logs -> db.filter("webhook_logs", {
  webhookId: params.id
})
```

**Implementation Requirements:**
- ✅ HMAC signature for security
- ✅ Retry logic (3 attempts)
- ✅ Delivery logs
- ✅ Event filtering

---

## Syntax Design Principles

### 1. Declarative, Not Imperative

```shepthon
# ✅ GOOD - Declarative
POST /auth/signup -> auth.register({
  email: body.email,
  password: body.password,
  hash: "bcrypt"
})

# ❌ BAD - Imperative (too verbose)
POST /auth/signup -> {
  let user = new User()
  user.email = body.email
  user.password = bcrypt.hash(body.password)
  db.save(user)
}
```

### 2. Environment Variables

```shepthon
# Always use env. prefix for secrets
storage.upload({
  bucket: env.S3_BUCKET,
  accessKey: env.AWS_ACCESS_KEY
})

# ❌ NEVER hardcode
storage.upload({
  bucket: "my-bucket-name"  # WRONG
})
```

### 3. Chaining Operations

```shepthon
# Multiple actions in sequence
POST /auth/signup -> [
  auth.register(body),
  email.send({ template: "welcome", to: body.email }),
  db.add("audit_log", { action: "signup", userId: user.id })
]
```

### 4. Error Handling

```shepthon
POST /payments/create -> {
  action: payments.createIntent(body),
  onError: {
    status: 400,
    message: "Payment failed: {error.message}",
    log: true
  }
}
```

---

## Implementation Roadmap

### Phase 1: Authentication (Week 1)
- [ ] `auth.register()` - Sign up with bcrypt
- [ ] `auth.authenticate()` - Login with JWT
- [ ] `auth.sendResetEmail()` - Password reset flow
- [ ] `auth.verifyEmail()` - Email verification
- [ ] `auth.isAuthenticated()` - Middleware
- [ ] `auth.hasRole()` - RBAC

**Test with:** Real registration flow end-to-end

### Phase 2: File Upload (Week 1)
- [ ] `storage.generateUploadUrl()` - S3 presigned URLs
- [ ] `storage.upload()` - Direct upload
- [ ] `storage.getSignedUrl()` - Download URLs
- [ ] `storage.deleteObject()` - Cleanup

**Test with:** Real image upload to S3 test bucket

### Phase 3: Email (Week 2)
- [ ] `email.send()` - SendGrid transactional
- [ ] `email.sendBulk()` - Batch sending
- [ ] Template configuration syntax

**Test with:** Real emails via SendGrid test API key

### Phase 4: Payments (Week 2)
- [ ] `payments.createIntent()` - Stripe Payment Intents
- [ ] `payments.verifyWebhook()` - Webhook signature
- [ ] `payments.handleEvent()` - Event routing
- [ ] `payments.refund()` - Refund flow

**Test with:** Stripe test mode

### Phase 5: Search & Filtering (Week 3)
- [ ] `search.fullText()` - PostgreSQL full-text
- [ ] `db.filter()` - Advanced filtering
- [ ] `db.paginate()` - Offset pagination
- [ ] `db.cursor()` - Cursor pagination

### Phase 6: Background Jobs (Week 3)
- [ ] `job` syntax - Cron definitions
- [ ] `queue.add()` - Enqueue
- [ ] `queue.getStatus()` - Monitoring

### Phase 7: Rate Limiting (Week 4)
- [ ] `rateLimit` block - Per-endpoint limits
- [ ] `cache` block - Response caching

---

## Testing Strategy (FSRT™)

Following **Full-Stack Reality Testing**, every pattern must be tested with:

1. **Real Services (Test Mode)**
   - Stripe test API keys
   - SendGrid test environment
   - AWS S3 test bucket
   - Real database (dev instance)

2. **Real Flows**
   - Complete sign-up flow (email verification)
   - Complete payment flow (webhook callback)
   - Complete file upload (presigned URL)

3. **Real Errors**
   - Invalid credentials
   - Expired tokens
   - Failed payments
   - S3 upload failures

4. **Deployment Validation**
   - Test on Vercel/Railway
   - Verify webhooks receive callbacks
   - Verify environment variables work

---

## Success Metrics

ShepThon is production-ready when:

- ✅ Can build a **real SaaS app** (auth + payments + email)
- ✅ Can build a **real marketplace** (search + filtering + files)
- ✅ Can build a **real social app** (feeds + notifications + media)
- ✅ **Zero TODOs** - All patterns fully implemented
- ✅ **Official docs-based** - Every pattern cites source
- ✅ **E2E tested** - Real services, real flows, real deployment

---

## Competitive Analysis

| Feature | ShepLang | Lovable | Builder.io | Bubble | Traditional Code |
|---------|----------|---------|------------|--------|------------------|
| **Auth Flows** | ✅ (planned) | ✅ | ✅ | ✅ | ⚠️ Manual |
| **File Upload** | ✅ (planned) | ✅ | ✅ | ✅ | ⚠️ Manual |
| **Payments** | ✅ (planned) | ✅ | ✅ | ✅ | ⚠️ Manual |
| **Email** | ✅ (planned) | ✅ | ✅ | ✅ | ⚠️ Manual |
| **Search** | ✅ (planned) | ⚠️ Basic | ⚠️ Basic | ✅ | ⚠️ Manual |
| **Webhooks** | ✅ (planned) | ❌ | ❌ | ⚠️ Limited | ⚠️ Manual |
| **Background Jobs** | ✅ (planned) | ❌ | ❌ | ⚠️ Limited | ⚠️ Manual |
| **Compile-Time Verification** | ✅ **UNIQUE** | ❌ | ❌ | ❌ | ❌ |
| **Type Safety** | ✅ **100%** | ❌ | ❌ | ❌ | ⚠️ Optional |
| **API Contract Validation** | ✅ **UNIQUE** | ❌ | ❌ | ❌ | ❌ |

**ShepLang's Moat:** The only platform with **verification-first** + **production patterns**

---

## Documentation Requirements

For each pattern, we must provide:

1. **Syntax Reference** - Complete ShepThon syntax
2. **TypeScript Output** - What code is generated
3. **Environment Setup** - What env vars are needed
4. **Real Example** - Complete vertical slice (UI → API → DB)
5. **Error Handling** - What can go wrong, how to handle
6. **Official Docs Link** - Link to Stripe/SendGrid/AWS docs

**Following:** Evidence-Driven Debugging™ - Always cite sources

---

## Brainstorm: GitHub Repo Analysis

**Purpose:** Ensure ShepLang can import/generate **intermediate and complex** projects

**Approach:**
1. Find 10-20 popular GitHub repos (Next.js, SaaS starters, marketplaces)
2. Analyze their patterns (auth, payments, file upload, etc.)
3. Design our generator to support these patterns
4. **No pivot to ShepLang** - Generator adapts to real-world code

**Example Repos to Analyze:**
- `vercel/nextjs-subscription-payments` (Stripe + Supabase)
- `steven-tey/dub` (URL shortener, analytics)
- `calcom/cal.com` (Scheduling, Stripe, emails)
- `novuhq/novu` (Notifications, webhooks)
- `supabase/realtime` (WebSockets, real-time)

**What to Extract:**
- Auth patterns (NextAuth, Clerk, custom)
- Payment flows (Stripe Checkout, Payment Intents)
- File upload (S3, Cloudinary, local)
- Email services (SendGrid, Resend, Postmark)
- Search implementation (Algolia, Meilisearch, Postgres FTS)
- Database ORM usage (Prisma, Drizzle, TypeORM)

**Outcome:** Comprehensive mapping of real-world patterns → ShepThon syntax

---

**Status:** READY TO IMPLEMENT  
**Next Step:** Start with Phase 1 (Authentication) based on official docs  
**Methodology:** Golden Sheep AI - Build narrow, test deep, ship confidently™

---

*Built by: Jordan "AJ" Autrey - Golden Sheep AI*  
*"No placeholders. No TODOs. Only production-ready patterns."*

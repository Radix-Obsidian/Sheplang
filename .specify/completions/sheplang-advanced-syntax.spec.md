# ShepLang Advanced Syntax Specification
**Version:** 1.0 (Draft)  
**Date:** November 21, 2025  
**Status:** SPECIFICATION - Awaiting Review & Approval

---

## Overview

Advanced ShepLang syntax enables **real application features** beyond basic CRUD:
- State machines (enums with transitions)
- Background jobs (scheduled tasks)
- Webhooks (event subscriptions)
- Real-time subscriptions (WebSocket)
- Complex validations
- Computed properties

---

## 1. State Machines (Enums with Transitions)

**Use Case:** Model complex state flows (purchase lifecycle, order status, etc.)

**Syntax:**
```sheplang
entities:
  Purchase:
    fields:
      - "status: enum[Pending, Processing, Completed, Refunded, Cancelled]"
      - "createdAt: datetime"
      - "completedAt: datetime, optional"
    
    transitions:
      - "Pending -> Processing: when payment confirmed"
      - "Processing -> Completed: when item delivered"
      - "Completed -> Refunded: when refund requested within 30 days"
      - "* -> Cancelled: when user requests cancellation"
    
    rules:
      - "Cannot transition from Completed to Pending"
      - "Refund only allowed within 30 days of completion"
      - "Cannot cancel if already shipped"
```

**Generated Code:**
```typescript
interface Purchase {
  status: 'Pending' | 'Processing' | 'Completed' | 'Refunded' | 'Cancelled';
  createdAt: Date;
  completedAt?: Date;
}

// State machine validation
const validTransitions = {
  'Pending': ['Processing', 'Cancelled'],
  'Processing': ['Completed', 'Cancelled'],
  'Completed': ['Refunded', 'Cancelled'],
  'Refunded': [],
  'Cancelled': []
};

async function transitionStatus(purchase: Purchase, newStatus: string) {
  if (!validTransitions[purchase.status].includes(newStatus)) {
    throw new Error(`Cannot transition from ${purchase.status} to ${newStatus}`);
  }
  
  if (newStatus === 'Refunded') {
    const daysSinceCompletion = (Date.now() - purchase.completedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCompletion > 30) {
      throw new Error('Refund window expired');
    }
  }
  
  return await Purchase.updateOne({ _id: purchase.id }, { status: newStatus });
}
```

---

## 2. Background Jobs (Scheduled Tasks)

**Use Case:** Periodic tasks (payment processing, cleanup, notifications)

**Syntax:**
```sheplang
jobs:
  ProcessPendingPayments:
    schedule: "every 5 minutes"
    timeout: 30000
    retry: 3
    steps:
      - "Find all purchases with status=Pending"
      - "For each: check Stripe payment status"
      - "Update status based on result"
      - "Send notifications"
  
  CleanupExpiredSessions:
    schedule: "daily at 2am"
    steps:
      - "Find all sessions older than 30 days"
      - "Delete them"
      - "Log cleanup count"
  
  SendDailyDigest:
    schedule: "daily at 9am"
    timezone: "America/New_York"
    steps:
      - "Find all users with digest enabled"
      - "Compile daily summary"
      - "Send email to each user"
```

**Generated Code:**
```typescript
import Bull from 'bull';

const paymentQueue = new Bull('process-payments', process.env.REDIS_URL);

// Define job handler
paymentQueue.process(async (job) => {
  const purchases = await Purchase.find({ status: 'Pending' });
  
  for (const purchase of purchases) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(purchase.stripePaymentIntent);
      
      if (paymentIntent.status === 'succeeded') {
        await Purchase.updateOne({ _id: purchase.id }, { status: 'Completed' });
        await sendNotification(purchase.buyer, 'Payment confirmed');
      }
    } catch (error) {
      throw error; // Bull will retry
    }
  }
});

// Schedule job
const schedule = require('node-schedule');
schedule.scheduleJob('*/5 * * * *', () => {
  paymentQueue.add({}, { repeat: { every: 5 * 60 * 1000 } });
});
```

---

## 3. Webhooks (Event Subscriptions)

**Use Case:** React to external events (Stripe webhooks, GitHub events, etc.)

**Syntax:**
```sheplang
webhooks:
  StripePaymentConfirmed:
    source: "Stripe"
    event: "payment_intent.succeeded"
    steps:
      - "Extract payment intent ID"
      - "Find purchase by payment intent"
      - "Update purchase status to Completed"
      - "Send confirmation email"
      - "Notify seller"
  
  StripePaymentFailed:
    source: "Stripe"
    event: "payment_intent.payment_failed"
    steps:
      - "Extract payment intent ID"
      - "Find purchase by payment intent"
      - "Update purchase status to Failed"
      - "Send retry email to buyer"
  
  GitHubPushEvent:
    source: "GitHub"
    event: "push"
    steps:
      - "Extract repo and branch"
      - "Trigger deployment if branch=main"
```

**Generated Code:**
```typescript
import express from 'express';
import Stripe from 'stripe';

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe webhook endpoint
app.post('/webhooks/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      
      // Find purchase
      const purchase = await Purchase.findOne({ stripePaymentIntent: paymentIntent.id });
      
      // Update status
      await Purchase.updateOne({ _id: purchase.id }, { status: 'Completed' });
      
      // Send notifications
      await sendgrid.sendTransactional('payment-confirmed', purchase.buyer.email, {...});
      socket.to(purchase.seller.id).emit('sale:confirmed', { purchase });
    }
    
    res.json({ received: true });
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// GitHub webhook endpoint
app.post('/webhooks/github', express.json(), async (req, res) => {
  const { action, ref, repository } = req.body;
  
  if (action === 'push' && ref === 'refs/heads/main') {
    // Trigger deployment
    await triggerDeployment(repository.name);
  }
  
  res.json({ received: true });
});
```

---

## 4. Real-Time Subscriptions (WebSocket)

**Use Case:** Live updates (notifications, feed updates, real-time data)

**Syntax:**
```sheplang
subscriptions:
  UserNotifications:
    entity: Notification
    filter: "where userId = currentUser.id"
    events:
      - "on create: send to user"
      - "on update: send to user"
    
  ListingUpdates:
    entity: Listing
    filter: "where id in userFavorites"
    events:
      - "on price change: notify user"
      - "on status change: notify user"
    
  MessageThread:
    entity: Message
    filter: "where conversationId = activeConversation"
    events:
      - "on create: add to thread"
      - "on delete: remove from thread"
      - "on update: update in thread"
```

**Generated Code:**
```typescript
import { Server } from 'socket.io';

const io = new Server(server);

io.on('connection', (socket) => {
  // Subscribe to user notifications
  socket.on('subscribe:notifications', (userId) => {
    socket.join(`notifications:${userId}`);
  });
  
  // Subscribe to listing updates
  socket.on('subscribe:listing', (listingId) => {
    socket.join(`listing:${listingId}`);
  });
  
  // Subscribe to message thread
  socket.on('subscribe:messages', (conversationId) => {
    socket.join(`messages:${conversationId}`);
  });
});

// Emit events when data changes
async function createNotification(userId: string, data: any) {
  const notification = await Notification.create({ userId, ...data });
  io.to(`notifications:${userId}`).emit('notification:new', notification);
}

async function updateListing(listingId: string, updates: any) {
  const listing = await Listing.findByIdAndUpdate(listingId, updates, { new: true });
  io.to(`listing:${listingId}`).emit('listing:updated', listing);
}

async function createMessage(conversationId: string, message: any) {
  const newMessage = await Message.create({ conversationId, ...message });
  io.to(`messages:${conversationId}`).emit('message:new', newMessage);
}
```

---

## 5. Complex Validations

**Use Case:** Multi-field validation, cross-entity rules

**Syntax:**
```sheplang
validations:
  PriceValidation:
    entity: Listing
    rule: "price must be between $1 and $1,000,000"
    trigger: "on create or update"
  
  EmailUniqueness:
    entity: User
    rule: "email must be unique"
    trigger: "on create or update"
  
  RefundWindowValidation:
    entity: Purchase
    rule: "refund only allowed within 30 days of completion"
    trigger: "on refund request"
  
  InventoryValidation:
    entity: Order
    rule: "quantity cannot exceed available inventory"
    trigger: "on create"
    check: "quantity <= Inventory.available"
  
  SellerVerification:
    entity: Listing
    rule: "seller must have verified email and phone"
    trigger: "on publish"
    check: "seller.emailVerified = true AND seller.phoneVerified = true"
```

**Generated Code:**
```typescript
async function validatePrice(price: number) {
  if (price < 1 || price > 1000000) {
    throw new ValidationError('Price must be between $1 and $1,000,000');
  }
}

async function validateEmailUniqueness(email: string) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ValidationError('Email already in use');
  }
}

async function validateRefundWindow(purchase: Purchase) {
  const daysSinceCompletion = (Date.now() - purchase.completedAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCompletion > 30) {
    throw new ValidationError('Refund window expired');
  }
}

async function validateInventory(orderId: string, quantity: number) {
  const inventory = await Inventory.findOne({ orderId });
  if (quantity > inventory.available) {
    throw new ValidationError('Insufficient inventory');
  }
}

async function validateSellerVerification(sellerId: string) {
  const seller = await User.findById(sellerId);
  if (!seller.emailVerified || !seller.phoneVerified) {
    throw new ValidationError('Seller must verify email and phone');
  }
}
```

---

## 6. Computed Properties

**Use Case:** Derived values, aggregations, calculations

**Syntax:**
```sheplang
computed:
  TotalRevenue:
    entity: Seller
    formula: "sum of Purchase.amount where seller = this AND status = Completed"
    cached: true
    cacheExpiry: 3600
  
  AverageRating:
    entity: Seller
    formula: "average of Review.rating where seller = this"
    cached: true
  
  ActiveListings:
    entity: Seller
    formula: "count of Listing where seller = this AND status = Active"
  
  CustomerLifetimeValue:
    entity: Customer
    formula: "sum of Purchase.amount where buyer = this"
  
  DaysUntilRefundExpires:
    entity: Purchase
    formula: "30 - (today - completedAt).days"
```

**Generated Code:**
```typescript
async function getTotalRevenue(sellerId: string) {
  // Check cache first
  const cached = await redis.get(`revenue:${sellerId}`);
  if (cached) return JSON.parse(cached);
  
  // Calculate
  const result = await Purchase.aggregate([
    { $match: { seller: sellerId, status: 'Completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  const revenue = result[0]?.total || 0;
  
  // Cache for 1 hour
  await redis.setex(`revenue:${sellerId}`, 3600, JSON.stringify(revenue));
  
  return revenue;
}

async function getAverageRating(sellerId: string) {
  const cached = await redis.get(`rating:${sellerId}`);
  if (cached) return JSON.parse(cached);
  
  const result = await Review.aggregate([
    { $match: { seller: sellerId } },
    { $group: { _id: null, average: { $avg: '$rating' } } }
  ]);
  
  const average = result[0]?.average || 0;
  await redis.setex(`rating:${sellerId}`, 3600, JSON.stringify(average));
  
  return average;
}

async function getActiveListings(sellerId: string) {
  return await Listing.countDocuments({ seller: sellerId, status: 'Active' });
}

async function getDaysUntilRefundExpires(purchaseId: string) {
  const purchase = await Purchase.findById(purchaseId);
  const daysSinceCompletion = (Date.now() - purchase.completedAt.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, 30 - Math.floor(daysSinceCompletion));
}
```

---

## 7. Event Emissions

**Use Case:** Trigger actions based on events

**Syntax:**
```sheplang
events:
  UserSignedUp:
    trigger: "when User.create"
    actions:
      - "Send welcome email"
      - "Create default preferences"
      - "Emit to analytics"
  
  ListingPublished:
    trigger: "when Listing.status changes to Active"
    actions:
      - "Index in Elasticsearch"
      - "Send notification to followers"
      - "Update seller stats"
  
  PurchaseCompleted:
    trigger: "when Purchase.status changes to Completed"
    actions:
      - "Send confirmation email"
      - "Update seller revenue"
      - "Trigger fulfillment workflow"
      - "Emit to real-time subscribers"
```

**Generated Code:**
```typescript
// Hook into model lifecycle
userSchema.post('save', async (doc) => {
  if (doc.isNew) {
    // Send welcome email
    await sendgrid.sendTransactional('welcome', doc.email, { name: doc.name });
    
    // Create default preferences
    await UserPreferences.create({ userId: doc._id });
    
    // Emit to analytics
    analytics.track('user_signup', { userId: doc._id, email: doc.email });
  }
});

listingSchema.pre('save', async (doc) => {
  if (doc.status === 'Active' && doc.wasModified('status')) {
    // Index in Elasticsearch
    await elasticsearch.index({
      index: 'listings',
      id: doc._id,
      body: doc.toObject()
    });
    
    // Send notification to followers
    const followers = await User.find({ favoriteListings: doc._id });
    for (const follower of followers) {
      io.to(`notifications:${follower._id}`).emit('listing:published', { listing: doc });
    }
    
    // Update seller stats
    await updateSellerStats(doc.seller);
  }
});
```

---

## Summary: Advanced Features

| Feature | Use Case | Complexity |
|---------|----------|-----------|
| **State Machines** | Complex workflows, order status | Medium |
| **Background Jobs** | Periodic tasks, cleanup | Medium |
| **Webhooks** | External integrations, events | High |
| **Real-Time Subscriptions** | Live updates, notifications | High |
| **Complex Validations** | Multi-field rules, cross-entity | Medium |
| **Computed Properties** | Aggregations, derived values | Low |
| **Event Emissions** | Trigger actions on changes | Medium |

---

**Status:** DRAFT - Awaiting review and approval

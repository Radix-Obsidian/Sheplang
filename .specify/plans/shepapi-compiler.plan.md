# ShepAPI Compiler Implementation Plan
**Version:** 1.0 (Draft)  
**Date:** November 21, 2025  
**Status:** PLAN - Ready for Execution

---

## Overview

ShepAPI Compiler transforms workflow specifications into:
- REST/GraphQL endpoints with full type safety
- Workflow orchestration logic
- Third-party API integration code
- Validation middleware
- Error handling
- Background job definitions
- WebSocket handlers

---

## Phase 1: Workflow Parsing (Week 1)

### Goal
Parse ShepLang workflow definitions into an intermediate model.

### Deliverables
- ✅ Workflow parser (name, trigger, steps, integrations)
- ✅ Step parser (action descriptions, conditional logic)
- ✅ Integration reference parser
- ✅ Rule parser (business constraints)
- ✅ Notification parser (email, push, real-time)

### Technical Approach
```typescript
// Input: ShepLang spec
flows:
  PurchaseListing:
    from: ListingDetail
    trigger: "User clicks 'Buy Now'"
    steps:
      - "Validate listing is still available"
      - "Create Stripe payment intent"
      - "On success: Create Purchase record"

// Output: Intermediate model
interface WorkflowModel {
  name: string;
  fromScreen: string;
  trigger: string;
  steps: StepModel[];
  integrations: IntegrationReference[];
  rules: RuleModel[];
  notifications: NotificationModel[];
}

interface StepModel {
  description: string;
  action: string;
  condition?: string;
  integration?: string;
}
```

### Success Criteria
- ✅ Parse all workflow types
- ✅ Extract step descriptions
- ✅ Identify integration calls
- ✅ Parse business rules
- ✅ 100% test coverage

### Dependencies
- ShepLang parser (already exists)
- Integration Hub spec

---

## Phase 2: Endpoint Generation (Week 2)

### Goal
Generate REST/GraphQL endpoints from workflows.

### Deliverables
- ✅ REST endpoint generator
- ✅ GraphQL mutation generator
- ✅ Request/response type generation
- ✅ Parameter validation
- ✅ Error response types

### Technical Approach
```typescript
// Generated REST endpoint

@Post('/listings/:id/purchase')
@UseGuards(AuthGuard)
@Validate(PurchaseListingInput)
async purchaseListing(
  @Param('id') listingId: string,
  @Body() input: PurchaseListingInput,
  @User() buyer: AuthenticatedUser
): Promise<PurchaseResult> {
  // Implementation generated from workflow
}

// Generated GraphQL mutation

type Mutation {
  purchaseListing(input: PurchaseListingInput!): PurchaseResult!
}

input PurchaseListingInput {
  listingId: ID!
}

type PurchaseResult {
  purchase: Purchase!
  paymentIntent: PaymentIntent!
}
```

### Success Criteria
- ✅ Generate valid REST endpoints
- ✅ Generate GraphQL mutations
- ✅ Create input/output types
- ✅ Add parameter validation
- ✅ Include error types

### Dependencies
- Phase 1: Workflow parsing
- ShepData types (from ShepData compiler)

---

## Phase 3: Workflow Logic Generation (Week 2-3)

### Goal
Generate the actual workflow orchestration logic.

### Deliverables
- ✅ Step executor generator
- ✅ Conditional logic generator
- ✅ Error handling generator
- ✅ State transition generator
- ✅ Logging/tracing generator

### Technical Approach
```typescript
// Generated workflow logic

async function executePurchaseListingWorkflow(
  listingId: string,
  buyer: User
): Promise<PurchaseResult> {
  try {
    // Step 1: Validate listing
    const listing = await Listing.findById(listingId);
    if (listing.status !== 'Active') {
      throw new ValidationError('Listing no longer available');
    }
    
    // Step 2: Verify buyer isn't seller
    if (listing.seller.toString() === buyer.id) {
      throw new ValidationError('Cannot purchase your own listing');
    }
    
    // Step 3: Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: listing.price * 100,
      currency: 'usd',
      customer: buyer.stripeCustomerId
    });
    
    // Step 4: Create purchase record
    const purchase = await Purchase.create({
      listing: listingId,
      buyer: buyer.id,
      seller: listing.seller,
      amount: listing.price,
      stripePaymentIntent: paymentIntent.id,
      status: 'Pending'
    });
    
    // Step 5-7: Send notifications
    await sendNotifications(purchase, buyer, listing);
    
    return { purchase, paymentIntent };
  } catch (error) {
    logger.error('Purchase workflow failed', { error, listingId, buyerId: buyer.id });
    throw error;
  }
}
```

### Success Criteria
- ✅ Generate correct step sequence
- ✅ Handle conditional logic
- ✅ Include error handling
- ✅ Add logging/tracing
- ✅ Support state transitions

### Dependencies
- Phase 1: Workflow parsing
- Phase 2: Endpoint generation
- Integration Hub spec

---

## Phase 4: Integration Code Generation (Week 3)

### Goal
Generate third-party API integration code.

### Deliverables
- ✅ Integration client initialization
- ✅ API call wrappers
- ✅ Error handling for integrations
- ✅ Retry logic
- ✅ Rate limiting

### Technical Approach
```typescript
// Generated integration code

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Wrapper for payment intent creation
async function createStripePaymentIntent(
  amount: number,
  currency: string,
  customerId: string
) {
  try {
    return await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      customer: customerId
    });
  } catch (error) {
    logger.error('Stripe payment intent creation failed', { error, amount, customerId });
    throw new IntegrationError('Payment processing failed', error);
  }
}

// Retry logic
async function createStripePaymentIntentWithRetry(
  amount: number,
  currency: string,
  customerId: string,
  maxRetries: number = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await createStripePaymentIntent(amount, currency, customerId);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(1000 * (i + 1)); // Exponential backoff
    }
  }
}
```

### Success Criteria
- ✅ Generate integration clients
- ✅ Create API call wrappers
- ✅ Include error handling
- ✅ Add retry logic
- ✅ Support rate limiting

### Dependencies
- Phase 3: Workflow logic generation
- Integration Hub spec

---

## Phase 5: Validation & Rules Engine (Week 3)

### Goal
Generate validation middleware and business rule enforcement.

### Deliverables
- ✅ Input validation generator
- ✅ Business rule validator
- ✅ Cross-entity validation
- ✅ State machine validator
- ✅ Permission checker

### Technical Approach
```typescript
// Generated validation

const purchaseListingRules = [
  {
    rule: 'Buyer cannot purchase their own listing',
    validate: (listing: Listing, buyer: User) => listing.seller.id !== buyer.id
  },
  {
    rule: 'Listing must have status=Active',
    validate: (listing: Listing) => listing.status === 'Active'
  },
  {
    rule: 'Buyer must have verified email',
    validate: (buyer: User) => buyer.emailVerified === true
  },
  {
    rule: 'Price must be greater than $1.00',
    validate: (listing: Listing) => listing.price > 1.00
  }
];

async function validatePurchaseListing(
  listing: Listing,
  buyer: User
): Promise<ValidationResult> {
  const errors: string[] = [];
  
  for (const rule of purchaseListingRules) {
    try {
      if (!rule.validate(listing, buyer)) {
        errors.push(rule.rule);
      }
    } catch (error) {
      errors.push(`Validation error: ${rule.rule}`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}
```

### Success Criteria
- ✅ Generate input validators
- ✅ Create business rule checkers
- ✅ Support cross-entity validation
- ✅ Include state machine validation
- ✅ Generate permission checks

### Dependencies
- Phase 1: Workflow parsing
- ShepData types

---

## Phase 6: Background Jobs & Webhooks (Week 4)

### Goal
Generate background job handlers and webhook receivers.

### Deliverables
- ✅ Job queue setup (Bull/BullMQ)
- ✅ Job handler generator
- ✅ Webhook endpoint generator
- ✅ Event subscription generator
- ✅ Scheduled task generator

### Technical Approach
```typescript
// Generated background job

const paymentQueue = new Bull('process-payments', process.env.REDIS_URL);

paymentQueue.process(async (job) => {
  const purchases = await Purchase.find({ status: 'Pending' });
  
  for (const purchase of purchases) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        purchase.stripePaymentIntent
      );
      
      if (paymentIntent.status === 'succeeded') {
        await Purchase.updateOne({ _id: purchase.id }, { status: 'Completed' });
        await sendNotification(purchase.buyer, 'Payment confirmed');
      }
    } catch (error) {
      logger.error('Payment processing failed', { error, purchaseId: purchase.id });
      throw error; // Bull will retry
    }
  }
});

// Schedule job
schedule.scheduleJob('*/5 * * * *', () => {
  paymentQueue.add({}, { repeat: { every: 5 * 60 * 1000 } });
});

// Generated webhook handler

@Post('/webhooks/stripe')
@RawBody()
async handleStripeWebhook(@Req() req: Request) {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const purchase = await Purchase.findOne({ stripePaymentIntent: paymentIntent.id });
      
      await Purchase.updateOne({ _id: purchase.id }, { status: 'Completed' });
      await sendNotification(purchase.buyer, 'Payment confirmed');
    }
    
    return { received: true };
  } catch (error) {
    logger.error('Webhook processing failed', { error });
    throw error;
  }
}
```

### Success Criteria
- ✅ Generate job handlers
- ✅ Create webhook receivers
- ✅ Support scheduled tasks
- ✅ Include error handling
- ✅ Add retry logic

### Dependencies
- Phase 3: Workflow logic generation
- Bull/BullMQ library

---

## Phase 7: Real-Time & Notifications (Week 4)

### Goal
Generate WebSocket handlers and notification code.

### Deliverables
- ✅ WebSocket handler generator
- ✅ Event emitter generator
- ✅ Email notification generator
- ✅ Push notification generator
- ✅ Real-time subscription generator

### Technical Approach
```typescript
// Generated WebSocket handler

@ShepWebSocket('message:send')
async handleSendMessage(
  @Socket() socket: Socket,
  @User() sender: User,
  @Data() data: { recipientId: string; content: string }
): Promise<void> {
  // Validate
  if (sender.id === data.recipientId) {
    throw new ValidationError('Cannot message yourself');
  }
  
  // Create message
  const message = await Message.create({
    sender: sender.id,
    recipient: data.recipientId,
    content: data.content,
    read: false
  });
  
  // Broadcast to recipient
  socket.to(data.recipientId).emit('message:new', message);
  
  // Send email if offline
  const recipientSocket = io.sockets.sockets.get(data.recipientId);
  if (!recipientSocket) {
    await sendgrid.send({
      to: recipient.email,
      template: 'new-message',
      data: { senderName: sender.name }
    });
  }
}

// Generated notification sender

async function sendPurchaseConfirmation(purchase: Purchase) {
  const buyer = await User.findById(purchase.buyer);
  const seller = await User.findById(purchase.seller);
  
  // Email notifications
  await Promise.all([
    sendgrid.send({
      to: buyer.email,
      template: 'purchase-confirmation',
      data: { listingTitle: purchase.listing.title }
    }),
    sendgrid.send({
      to: seller.email,
      template: 'sale-notification',
      data: { buyerName: buyer.name }
    })
  ]);
  
  // Real-time notifications
  io.to(`notifications:${seller.id}`).emit('sale:new', { purchase });
}
```

### Success Criteria
- ✅ Generate WebSocket handlers
- ✅ Create event emitters
- ✅ Generate email notifications
- ✅ Support push notifications
- ✅ Include real-time subscriptions

### Dependencies
- Phase 3: Workflow logic generation
- Socket.io library
- SendGrid integration

---

## Phase 8: Integration & Testing (Week 5)

### Goal
Integrate all components and test end-to-end.

### Deliverables
- ✅ Integrated ShepAPI compiler
- ✅ End-to-end tests
- ✅ Example output verification
- ✅ Performance benchmarks
- ✅ Documentation

### Success Criteria
- ✅ All phases integrated
- ✅ 100% test coverage
- ✅ Performance acceptable (< 2s for typical spec)
- ✅ Documentation complete
- ✅ Ready for production use

### Dependencies
- All previous phases

---

## Timeline

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| Phase 1: Workflow Parsing | 1 week | Week 1 | Week 1 |
| Phase 2: Endpoint Generation | 1 week | Week 2 | Week 2 |
| Phase 3: Workflow Logic | 2 weeks | Week 2 | Week 3 |
| Phase 4: Integration Code | 1 week | Week 3 | Week 3 |
| Phase 5: Validation & Rules | 1 week | Week 3 | Week 3 |
| Phase 6: Jobs & Webhooks | 1 week | Week 4 | Week 4 |
| Phase 7: Real-Time & Notifications | 1 week | Week 4 | Week 4 |
| Phase 8: Integration & Testing | 1 week | Week 5 | Week 5 |
| **Total** | **5 weeks** | **Week 1** | **Week 5** |

---

## Success Criteria (Overall)

- ✅ Parse all workflow types
- ✅ Generate valid REST/GraphQL endpoints
- ✅ Generate workflow orchestration logic
- ✅ Generate integration code
- ✅ Generate validation middleware
- ✅ Generate background job handlers
- ✅ Generate WebSocket handlers
- ✅ Generate notification code
- ✅ 100% test coverage
- ✅ Performance: < 2s for typical spec
- ✅ Documentation complete
- ✅ Ready for ShepUI compiler integration

---

**Status:** PLAN - Ready for execution

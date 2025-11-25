# ShepAPI Workflows Specification
**Version:** 1.0 (Draft)  
**Date:** November 21, 2025  
**Status:** SPECIFICATION - Awaiting Review & Approval

---

## Overview

ShepAPI generates **real backend logic**, not just CRUD endpoints. Workflows define multi-step business processes with integrations, validations, and state management.

---

## Workflow Anatomy

A workflow is a **multi-step process** that orchestrates:
- Data validation
- Business rule enforcement
- Third-party API calls
- State transitions
- Notifications
- Analytics tracking

**Spec Structure:**
```sheplang
flows:
  WorkflowName:
    from: ScreenName
    trigger: "User action description"
    steps:
      - "Step 1 description"
      - "Step 2 description"
      - "Step 3 description"
    
    integrations:
      - "Third-party API calls"
    
    rules:
      - "Business rule 1"
      - "Business rule 2"
    
    notifications:
      - "Email to user"
      - "Notification to other users"
```

---

## Example 1: Purchase with Payment Processing

**Real-world scenario:** User buys item on marketplace, payment processed, seller notified

**Spec:**
```sheplang
flows:
  PurchaseListing:
    from: ListingDetail
    trigger: "User clicks 'Buy Now'"
    steps:
      - "Validate listing is still available (status=Active)"
      - "Verify buyer isn't seller"
      - "Create Stripe payment intent"
      - "Show payment form to buyer"
      - "On payment success: Create Purchase record"
      - "Update listing status to Sold"
      - "Send confirmation email to buyer"
      - "Send notification to seller"
      - "Redirect to purchase confirmation"
    
    integrations:
      Stripe:
        - "createPaymentIntent(amount, currency, customerId)"
        - "confirmPayment(paymentIntentId)"
    
    SendGrid:
      - "sendTransactional('buyer-confirmation', buyer.email, {...})"
      - "sendTransactional('seller-notification', seller.email, {...})"
    
    rules:
      - "Buyer cannot purchase their own listing"
      - "Listing must have status=Active"
      - "Buyer must have verified email"
      - "Price must be > $1.00"
    
    notifications:
      - "Email: buyer receives order confirmation"
      - "Email: seller receives sale notification"
      - "Push: seller gets real-time notification"
      - "In-app: both users see transaction in history"
```

**Generated Backend Code (Conceptual):**
```typescript
@ShepAction('PurchaseListing')
@Verify(PurchaseRules)
@RequireAuth()
async purchaseListing(
  @Param('listingId') listingId: string,
  @User() buyer: AuthenticatedUser
): Promise<PurchaseResult> {
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
    customer: buyer.stripeCustomerId,
    metadata: { listingId, buyerId: buyer.id, sellerId: listing.seller }
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
  
  // Step 5: Update listing status
  await Listing.findByIdAndUpdate(listingId, { status: 'Sold' });
  
  // Step 6-7: Send emails
  await Promise.all([
    sendgrid.send({
      to: buyer.email,
      template: 'buyer-confirmation',
      data: { listingTitle: listing.title, amount: listing.price }
    }),
    sendgrid.send({
      to: listing.seller.email,
      template: 'seller-notification',
      data: { buyerName: buyer.name, listingTitle: listing.title }
    })
  ]);
  
  // Step 8: Send real-time notification
  socket.to(listing.seller.id).emit('sale:new', { purchase, listing });
  
  // Step 9: Analytics
  analytics.track('purchase_completed', {
    listingId, buyerId: buyer.id, sellerId: listing.seller, amount: listing.price
  });
  
  return { purchase, paymentIntent };
}
```

---

## Example 2: Search with Elasticsearch

**Real-world scenario:** User searches marketplace with filters, results ranked by relevance

**Spec:**
```sheplang
flows:
  SearchListings:
    from: MarketplaceHome
    trigger: "User enters search query"
    inputs:
      - "query: text, optional"
      - "category: ref[Category], optional"
      - "priceMin: money, optional"
      - "priceMax: money, optional"
      - "sortBy: enum[Recent, PriceLow, PriceHigh, Popular], default=Recent"
    
    steps:
      - "Build Elasticsearch query from filters"
      - "Apply text search on title and description"
      - "Apply category filter"
      - "Apply price range filter"
      - "Apply sort order"
      - "Return paginated results (20 per page)"
      - "Track search analytics"
    
    integrations:
      Elasticsearch:
        - "search(query, filters, sort, pagination)"
    
    rules:
      - "Query must be at least 2 characters"
      - "Price range must be valid (min <= max)"
      - "Only return Active listings"
    
    realtime:
      - "Results update as user types (debounced)"
      - "Popular listings appear first"
```

**Generated Backend Code (Conceptual):**
```typescript
@ShepAction('SearchListings')
@Verify(SearchRules)
async searchListings(
  @Query('query') query: string,
  @Query('category') category: string,
  @Query('priceMin') priceMin: number,
  @Query('priceMax') priceMax: number,
  @Query('sortBy') sortBy: 'Recent' | 'PriceLow' | 'PriceHigh' | 'Popular',
  @Query('page') page: number = 1
): Promise<SearchResult> {
  // Build Elasticsearch query
  const esQuery = {
    bool: {
      must: [],
      filter: [
        { term: { status: 'Active' } }
      ]
    }
  };
  
  if (query) {
    esQuery.bool.must.push({
      multi_match: {
        query,
        fields: ['title^2', 'description'],
        fuzziness: 'AUTO'
      }
    });
  }
  
  if (category) {
    esQuery.bool.filter.push({ term: { category } });
  }
  
  if (priceMin || priceMax) {
    esQuery.bool.filter.push({
      range: { price: { gte: priceMin, lte: priceMax } }
    });
  }
  
  // Apply sort
  const sort = {
    'Recent': { createdAt: 'desc' },
    'PriceLow': { price: 'asc' },
    'PriceHigh': { price: 'desc' },
    'Popular': { views: 'desc' }
  }[sortBy];
  
  // Execute search
  const results = await elasticsearch.search({
    index: 'listings',
    body: {
      query: esQuery,
      sort: [sort],
      from: (page - 1) * 20,
      size: 20
    }
  });
  
  // Track analytics
  analytics.track('search_performed', {
    query, category, priceMin, priceMax, sortBy, resultCount: results.hits.total
  });
  
  return {
    listings: results.hits.hits.map(h => h._source),
    total: results.hits.total.value,
    page
  };
}
```

---

## Example 3: Real-Time Messaging

**Real-world scenario:** User sends message, recipient sees it instantly with typing indicators

**Spec:**
```sheplang
flows:
  SendMessage:
    from: ListingDetail
    trigger: "User clicks 'Contact Seller'"
    steps:
      - "Validate sender and recipient are different users"
      - "Create Message record"
      - "Broadcast message to recipient via WebSocket"
      - "Send email notification if recipient offline"
      - "Update conversation list for both users"
      - "Mark as read when recipient opens"
    
    integrations:
      WebSocket:
        - "broadcast(recipientId, 'message:new', message)"
        - "emit(senderId, 'message:sent', message)"
      
      SendGrid:
        - "sendTransactional('new-message', recipient.email, {...})"
    
    rules:
      - "Users cannot message themselves"
      - "Message content cannot be empty"
      - "Message cannot exceed 5000 characters"
    
    realtime:
      - "Message appears instantly in recipient's inbox"
      - "Typing indicator shows when sender is typing"
      - "Read receipt updates when recipient reads"
      - "Conversation list updates with latest message"
```

**Generated Backend Code (Conceptual):**
```typescript
@ShepWebSocket('message:send')
@Verify(MessageRules)
@RequireAuth()
async handleSendMessage(
  @Socket() socket: Socket,
  @User() sender: AuthenticatedUser,
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
    read: false,
    createdAt: new Date()
  });
  
  // Broadcast to recipient
  socket.to(data.recipientId).emit('message:new', {
    id: message.id,
    sender: sender.name,
    content: message.content,
    createdAt: message.createdAt
  });
  
  // Confirm to sender
  socket.emit('message:sent', { id: message.id, status: 'delivered' });
  
  // Send email if recipient offline
  const recipientSocket = io.sockets.sockets.get(data.recipientId);
  if (!recipientSocket) {
    const recipient = await User.findById(data.recipientId);
    await sendgrid.send({
      to: recipient.email,
      template: 'new-message',
      data: { senderName: sender.name, preview: data.content.substring(0, 100) }
    });
  }
}

@ShepWebSocket('message:typing')
async handleTypingIndicator(
  @Socket() socket: Socket,
  @User() user: AuthenticatedUser,
  @Data() data: { recipientId: string; isTyping: boolean }
): Promise<void> {
  socket.to(data.recipientId).emit('user:typing', {
    userId: user.id,
    userName: user.name,
    isTyping: data.isTyping
  });
}

@ShepWebSocket('message:read')
async handleMessageRead(
  @Socket() socket: Socket,
  @User() user: AuthenticatedUser,
  @Data() data: { messageId: string }
): Promise<void> {
  await Message.findByIdAndUpdate(data.messageId, { read: true });
  
  const message = await Message.findById(data.messageId);
  socket.to(message.sender).emit('message:read', { messageId: data.messageId });
}
```

---

## Example 4: Background Job (Payment Processing)

**Real-world scenario:** Periodically check pending payments and confirm them

**Spec:**
```sheplang
flows:
  ProcessPendingPayments:
    trigger: "Every 5 minutes"
    steps:
      - "Find all purchases with status=Pending"
      - "For each purchase: check Stripe payment status"
      - "If confirmed: update Purchase status to Completed"
      - "If failed: update Purchase status to Failed, refund if needed"
      - "Send email notifications to buyer and seller"
      - "Update analytics"
    
    integrations:
      Stripe:
        - "retrievePaymentIntent(paymentIntentId)"
        - "createRefund(chargeId, amount)"
      
      SendGrid:
        - "sendTransactional('payment-confirmed', buyer.email, {...})"
        - "sendTransactional('payment-failed', buyer.email, {...})"
    
    rules:
      - "Only process purchases older than 1 minute"
      - "Retry failed payments up to 3 times"
      - "Log all payment processing attempts"
```

**Generated Backend Code (Conceptual):**
```typescript
@ShepJob('process-pending-payments', { cron: '*/5 * * * *' })
@Verify(PaymentRules)
async processPendingPayments(): Promise<void> {
  const purchases = await Purchase.find({
    status: 'Pending',
    createdAt: { $lt: new Date(Date.now() - 60000) }
  });
  
  for (const purchase of purchases) {
    try {
      // Check Stripe status
      const paymentIntent = await stripe.paymentIntents.retrieve(
        purchase.stripePaymentIntent
      );
      
      if (paymentIntent.status === 'succeeded') {
        // Confirm purchase
        await Purchase.findByIdAndUpdate(purchase.id, { status: 'Completed' });
        
        // Send confirmation emails
        await Promise.all([
          sendgrid.send({
            to: purchase.buyer.email,
            template: 'payment-confirmed',
            data: { listingTitle: purchase.listing.title }
          }),
          sendgrid.send({
            to: purchase.seller.email,
            template: 'payment-confirmed',
            data: { buyerName: purchase.buyer.name }
          })
        ]);
        
        analytics.track('payment_confirmed', { purchaseId: purchase.id });
      } else if (paymentIntent.status === 'requires_payment_method') {
        // Payment failed
        await Purchase.findByIdAndUpdate(purchase.id, { status: 'Failed' });
        
        await sendgrid.send({
          to: purchase.buyer.email,
          template: 'payment-failed',
          data: { retryUrl: `${APP_URL}/retry-payment/${purchase.id}` }
        });
      }
    } catch (error) {
      logger.error('Payment processing failed', { purchaseId: purchase.id, error });
    }
  }
}
```

---

## Workflow Patterns

### Pattern 1: Validation → Action → Notification

```
User Action
    ↓
Validate Business Rules
    ↓
Execute Action (DB update, API call)
    ↓
Send Notifications (email, push, real-time)
    ↓
Track Analytics
    ↓
Return Result
```

### Pattern 2: Conditional Branching

```
User Action
    ↓
Check Condition
    ├─ If A: Execute Flow A
    ├─ If B: Execute Flow B
    └─ If C: Execute Flow C
    ↓
Send Appropriate Notifications
    ↓
Return Result
```

### Pattern 3: Third-Party Integration

```
User Action
    ↓
Validate Input
    ↓
Call Third-Party API (Stripe, Elasticsearch, etc.)
    ↓
Handle Response
    ↓
Update Local State
    ↓
Send Notifications
    ↓
Return Result
```

---

**Status:** DRAFT - Awaiting review and approval

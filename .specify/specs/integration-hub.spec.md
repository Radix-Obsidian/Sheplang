# Integration Hub Specification
**Version:** 1.0 (Draft)  
**Date:** November 21, 2025  
**Status:** SPECIFICATION - Awaiting Review & Approval

---

## Overview

The Integration Hub defines how third-party services (Stripe, Elasticsearch, S3, SendGrid, Twilio, Slack, etc.) are declared and used in ShepLang specs.

**Goal:** Developers declare integrations in the spec, ShepAPI generates all wiring code.

---

## Integration Declaration

**Spec Structure:**
```sheplang
integrations:
  ServiceName:
    config:
      - "apiKey: from environment"
      - "baseUrl: https://api.service.com"
    
    actions:
      - "actionName(param1, param2) -> returns Type"
      - "anotherAction(param) -> returns Type"
```

---

## Supported Integrations (V1.0)

### 1. Stripe (Payments)

**Use Cases:**
- One-time payments
- Subscriptions
- Refunds
- Multi-party payments (Connect)

**Spec:**
```sheplang
integrations:
  Stripe:
    config:
      - "apiKey: from STRIPE_SECRET_KEY"
      - "publishableKey: from STRIPE_PUBLISHABLE_KEY"
    
    actions:
      - "createPaymentIntent(amount: money, currency: text, customerId: text) -> PaymentIntent"
      - "confirmPayment(paymentIntentId: text) -> PaymentResult"
      - "createRefund(chargeId: text, amount: money) -> Refund"
      - "createSubscription(customerId: text, priceId: text) -> Subscription"
      - "cancelSubscription(subscriptionId: text) -> Subscription"
      - "createConnectAccount(email: text, country: text) -> Account"
      - "createTransfer(amount: money, destination: text) -> Transfer"
```

**Generated Code:**
```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createPaymentIntent(amount: number, currency: string, customerId: string) {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    customer: customerId
  });
}

async function confirmPayment(paymentIntentId: string) {
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return { status: intent.status, succeeded: intent.status === 'succeeded' };
}
```

---

### 2. Elasticsearch (Search)

**Use Cases:**
- Full-text search
- Filtering and faceting
- Autocomplete
- Analytics

**Spec:**
```sheplang
integrations:
  Elasticsearch:
    config:
      - "node: from ELASTICSEARCH_URL"
      - "auth: from ELASTICSEARCH_AUTH"
    
    actions:
      - "search(index: text, query: object, filters: object, sort: object, pagination: object) -> SearchResult"
      - "index(index: text, document: object) -> IndexResult"
      - "update(index: text, id: text, document: object) -> UpdateResult"
      - "delete(index: text, id: text) -> DeleteResult"
      - "bulk(index: text, operations: array) -> BulkResult"
```

**Generated Code:**
```typescript
const client = new Client({ node: process.env.ELASTICSEARCH_URL });

async function search(index: string, query: any, filters: any, sort: any, pagination: any) {
  const response = await client.search({
    index,
    body: {
      query: { bool: { must: [query], filter: filters } },
      sort,
      from: pagination.from,
      size: pagination.size
    }
  });
  return { hits: response.hits.hits, total: response.hits.total.value };
}
```

---

### 3. AWS S3 (File Storage)

**Use Cases:**
- Image upload
- Document storage
- Media hosting
- Backup

**Spec:**
```sheplang
integrations:
  AWS_S3:
    config:
      - "accessKeyId: from AWS_ACCESS_KEY_ID"
      - "secretAccessKey: from AWS_SECRET_ACCESS_KEY"
      - "region: from AWS_REGION"
      - "bucket: from AWS_S3_BUCKET"
    
    actions:
      - "uploadFile(key: text, file: file, contentType: text) -> UploadResult"
      - "downloadFile(key: text) -> file"
      - "deleteFile(key: text) -> DeleteResult"
      - "generatePresignedUrl(key: text, expiresIn: number) -> text"
      - "listFiles(prefix: text) -> array"
```

**Generated Code:**
```typescript
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function uploadFile(key: string, file: Buffer, contentType: string) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: file,
    ContentType: contentType
  };
  return await s3.upload(params).promise();
}

async function generatePresignedUrl(key: string, expiresIn: number) {
  return s3.getSignedUrl('getObject', {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Expires: expiresIn
  });
}
```

---

### 4. SendGrid (Email)

**Use Cases:**
- Transactional emails
- Email templates
- Bulk emails
- Email tracking

**Spec:**
```sheplang
integrations:
  SendGrid:
    config:
      - "apiKey: from SENDGRID_API_KEY"
      - "fromEmail: from SENDGRID_FROM_EMAIL"
    
    actions:
      - "sendTransactional(templateId: text, to: text, data: object) -> SendResult"
      - "sendBulk(templateId: text, recipients: array, data: object) -> SendResult"
      - "trackOpen(messageId: text) -> TrackResult"
      - "trackClick(messageId: text, url: text) -> TrackResult"
```

**Generated Code:**
```typescript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendTransactional(templateId: string, to: string, data: any) {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    templateId,
    dynamicTemplateData: data
  };
  return await sgMail.send(msg);
}
```

---

### 5. Twilio (SMS & Voice)

**Use Cases:**
- SMS verification
- OTP delivery
- SMS notifications
- Voice calls

**Spec:**
```sheplang
integrations:
  Twilio:
    config:
      - "accountSid: from TWILIO_ACCOUNT_SID"
      - "authToken: from TWILIO_AUTH_TOKEN"
      - "fromNumber: from TWILIO_PHONE_NUMBER"
    
    actions:
      - "sendSMS(to: text, message: text) -> SMSResult"
      - "sendOTP(to: text) -> OTPResult"
      - "verifyOTP(to: text, code: text) -> VerifyResult"
      - "makeCall(to: text, message: text) -> CallResult"
```

**Generated Code:**
```typescript
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendSMS(to: string, message: string) {
  return await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to
  });
}

async function sendOTP(to: string) {
  const code = Math.random().toString().slice(2, 8);
  await client.messages.create({
    body: `Your verification code is: ${code}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to
  });
  return { code, expiresIn: 600 };
}
```

---

### 6. Slack (Notifications)

**Use Cases:**
- Team notifications
- Alert channels
- Logging
- Workflow notifications

**Spec:**
```sheplang
integrations:
  Slack:
    config:
      - "botToken: from SLACK_BOT_TOKEN"
      - "webhookUrl: from SLACK_WEBHOOK_URL"
    
    actions:
      - "sendMessage(channel: text, message: text) -> MessageResult"
      - "sendNotification(channel: text, title: text, body: text, data: object) -> MessageResult"
      - "sendAlert(channel: text, severity: enum[low, medium, high], message: text) -> MessageResult"
```

**Generated Code:**
```typescript
const { WebClient } = require('@slack/web-api');
const client = new WebClient(process.env.SLACK_BOT_TOKEN);

async function sendMessage(channel: string, message: string) {
  return await client.chat.postMessage({
    channel,
    text: message
  });
}

async function sendAlert(channel: string, severity: string, message: string) {
  const color = { low: '#36a64f', medium: '#ff9900', high: '#ff0000' }[severity];
  return await client.chat.postMessage({
    channel,
    attachments: [{
      color,
      title: `${severity.toUpperCase()} Alert`,
      text: message
    }]
  });
}
```

---

### 7. Redis (Caching)

**Use Cases:**
- Session storage
- Rate limiting
- Caching
- Real-time data

**Spec:**
```sheplang
integrations:
  Redis:
    config:
      - "url: from REDIS_URL"
      - "ttl: 3600"
    
    actions:
      - "set(key: text, value: any, ttl: number) -> SetResult"
      - "get(key: text) -> any"
      - "delete(key: text) -> DeleteResult"
      - "increment(key: text) -> number"
      - "expire(key: text, ttl: number) -> ExpireResult"
```

**Generated Code:**
```typescript
const redis = require('redis').createClient({ url: process.env.REDIS_URL });

async function set(key: string, value: any, ttl: number) {
  return await redis.setex(key, ttl, JSON.stringify(value));
}

async function get(key: string) {
  const value = await redis.get(key);
  return value ? JSON.parse(value) : null;
}

async function increment(key: string) {
  return await redis.incr(key);
}
```

---

## Integration Patterns

### Pattern 1: Simple Action Call

```sheplang
flows:
  SendWelcomeEmail:
    steps:
      - "Call SendGrid to send welcome email"

# Generated:
await sendgrid.sendTransactional('welcome-template', user.email, { name: user.name });
```

### Pattern 2: Conditional Integration

```sheplang
flows:
  ProcessPayment:
    steps:
      - "If payment method is Stripe: call Stripe"
      - "If payment method is PayPal: call PayPal"

# Generated:
if (paymentMethod === 'stripe') {
  await stripe.createPaymentIntent(...);
} else if (paymentMethod === 'paypal') {
  await paypal.createOrder(...);
}
```

### Pattern 3: Error Handling

```sheplang
flows:
  UploadImage:
    steps:
      - "Upload to S3"
      - "If upload fails: retry up to 3 times"
      - "If still fails: use fallback CDN"

# Generated:
let uploaded = false;
for (let i = 0; i < 3; i++) {
  try {
    await s3.uploadFile(key, file);
    uploaded = true;
    break;
  } catch (error) {
    if (i === 2) {
      await fallbackCDN.uploadFile(key, file);
    }
  }
}
```

---

## Environment Configuration

All integrations require environment variables:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Elasticsearch
ELASTICSEARCH_URL=https://...
ELASTICSEARCH_AUTH=...

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=my-bucket

# SendGrid
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@app.com

# Twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# Slack
SLACK_BOT_TOKEN=xoxb-...
SLACK_WEBHOOK_URL=https://hooks.slack.com/...

# Redis
REDIS_URL=redis://...
```

---

## Adding New Integrations

To add a new integration:

1. **Define the spec** in `integrations` section
2. **List all actions** with parameters and return types
3. **ShepAPI compiler** generates initialization and wrapper code
4. **Developers** use actions in workflows

**Example: Adding PayPal**

```sheplang
integrations:
  PayPal:
    config:
      - "clientId: from PAYPAL_CLIENT_ID"
      - "clientSecret: from PAYPAL_CLIENT_SECRET"
      - "mode: from PAYPAL_MODE (sandbox or live)"
    
    actions:
      - "createOrder(amount: money, currency: text) -> Order"
      - "captureOrder(orderId: text) -> Capture"
      - "refundCapture(captureId: text, amount: money) -> Refund"
```

---

**Status:** DRAFT - Awaiting review and approval

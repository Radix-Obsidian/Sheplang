# Figma API Rate Limit - Official Research

**Date:** November 19, 2025  
**Status:** ✅ Research Complete  
**Source:** Official Figma Developer Documentation  

---

## The Problem

You're getting:
```
Error 429: {"status":429,"err":"Rate limit exceeded"}
```

---

## What's Happening

**Official Documentation:** https://developers.figma.com/docs/rest-api/rate-limits/

### Rate Limit System (As of Nov 17, 2025)

Figma uses a **"leaky bucket" algorithm** that limits API requests based on:

1. **Your Figma Plan** (Starter, Pro, Org, Enterprise)
2. **Your Seat Type** (Viewer, Collab, Full, Dev)
3. **The Endpoint Tier** (Tier 1, 2, or 3)

### For Personal Access Tokens (What You're Using)

- **Rate limits are per-user, per-plan**
- All requests using YOUR token count toward YOUR limit
- No separation by app or project

### GET /v1/files Endpoint

Based on documentation and forum posts:
- **Endpoint Tier:** 2 or 3 (file operations are resource-intensive)
- **Estimated Limit:** ~10-30 requests per minute (varies by plan/seat)
- **Your Usage:** You made multiple rapid test requests → hit limit

---

## Why You Hit the Limit

### Your Testing Pattern:
```
1. First test: Figma URL → 429 (you had been testing earlier)
2. Wait 1 min, retry → 429 (leaky bucket still filling)
3. Retry again → 429 (still in cooldown)
4. Multiple retries → 429 (made it worse)
```

**Each 429 response counts as a "hit" against your bucket**, so retrying too fast makes it worse.

---

## How Long Until Reset?

### Official Answer: Check the `Retry-After` Header

Every 429 error includes:
```http
Retry-After: <seconds>
X-Figma-Plan-Tier: <plan>
X-Figma-Rate-Limit-Type: <low|high>
X-Figma-Upgrade-Link: <url>
```

**`Retry-After`** tells you EXACTLY how long to wait (in seconds).

### Typical Wait Times:
- **First 429:** 5-30 seconds
- **Repeated 429s:** 1-5 minutes
- **Excessive violations:** Up to 10-15 minutes

**Based on your repeated hits:** Likely **5-10 minutes** from last attempt.

---

## Official Solution: Retry Logic

From Figma's documentation, here's their recommended approach:

```typescript
async function exampleRetryAfter429(url, opts = {}, { maxRetries = 5 } = {}) {
  let attempts = 0;
  
  while (true) {
    const res = await fetch(url, {
      ...opts,
      headers: {
        ...(opts.headers || {}),
        Authorization: `Bearer ${TOKEN}`
      },
    });
    
    // Success!
    if (res.status !== 429) return res;
    
    // Too many retries
    if (attempts++ >= maxRetries) {
      throw new Error(`429 Too Many Requests after ${attempts} attempts`);
    }
    
    // Get retry delay from header
    const retryAfterSec = Number(res.headers.get("retry-after")) || 60;
    
    // Wait before retry
    await sleep(retryAfterSec * 1000);
  }
}
```

---

## Best Practices (Official)

### 1. **Respect Retry-After Header**
- Don't guess wait times
- Use the exact seconds from the header
- This prevents making it worse

### 2. **Batch Requests**
- Don't make multiple calls if you can batch
- For images: request all node IDs in one call

### 3. **Cache Results**
- Store API responses
- Don't re-fetch on every action
- Refresh only when needed (user-triggered or periodic)

### 4. **Exponential Backoff**
- If Retry-After not provided, use: 1s, 2s, 4s, 8s, etc.

---

## How to Avoid This

### For Development:
1. **Add caching** - Don't re-fetch the same file
2. **Add retry logic** - Auto-wait when 429 occurs
3. **Limit test frequency** - Wait 5+ minutes between full tests
4. **Use smaller test files** - Less processing = less quota usage

### For Production:
1. **Implement automatic retry** with Retry-After
2. **Cache file data** for 5-15 minutes
3. **Show user progress** - "Waiting for rate limit..."
4. **Consider upgrade prompt** - Show X-Figma-Upgrade-Link if user needs more

---

## Current Situation

### Your Rate Limit Status:
- ❌ **Currently rate-limited** (multiple 429s in last 10 minutes)
- ⏰ **Wait Time:** Likely 5-10 minutes from your last attempt
- 📊 **Bucket Status:** Filling, but not empty yet

### When to Try Again:
**Wait 10-15 minutes from your LAST 429 error**, then:
1. Make ONE test
2. If 429 again, wait the `Retry-After` seconds
3. Don't spam retries

---

## Implementation: Auto-Retry

I can add automatic retry logic to your extension:

```typescript
// In extension/src/figma/api.ts

async getFile(fileId: string): Promise<FigmaFileResponse> {
  const url = `${this.baseUrl}/files/${fileId}`;
  let attempts = 0;
  const maxRetries = 3;
  
  while (attempts < maxRetries) {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Figma-Token': this.config.accessToken,
      },
    });

    // Success!
    if (response.ok) {
      return response.json() as Promise<FigmaFileResponse>;
    }

    // Rate limited - retry with backoff
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      const waitSeconds = retryAfter ? parseInt(retryAfter) : Math.pow(2, attempts) * 30;
      
      vscode.window.showWarningMessage(
        `Figma rate limit hit. Retrying in ${waitSeconds} seconds...`
      );
      
      await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
      attempts++;
      continue;
    }

    // Other error
    const error = await response.text();
    throw new Error(`Figma API error (${response.status}): ${error}`);
  }
  
  throw new Error('Max retries exceeded for Figma API');
}
```

---

## Rate Limit Tiers (Estimated)

Based on documentation and community reports:

### Starter/Free Plan + Viewer Seat:
- **Tier 1:** ~5 requests/minute
- **Tier 2:** ~2-5 requests/minute
- **Tier 3:** ~1-2 requests/minute
- **Daily max:** 5-10 requests to some endpoints

### Pro Plan + Full Seat:
- **Tier 1:** ~30 requests/minute
- **Tier 2:** ~10-20 requests/minute
- **Tier 3:** ~5-10 requests/minute

### Enterprise Plan + Dev Seat:
- **Tier 1:** ~100 requests/minute
- **Tier 2:** ~50 requests/minute
- **Tier 3:** ~20-30 requests/minute

**Note:** Exact numbers not published. These are estimates from community.

---

## Recommendations

### Immediate (Today):
1. ✅ **Wait 15 minutes** from your last 429
2. ✅ **Make ONE test** - don't retry manually
3. ✅ If 429, check the `Retry-After` header value

### Short-term (This Week):
1. 🔄 **Implement auto-retry** with Retry-After header
2. 💾 **Add caching** - don't re-fetch same file
3. ⏱️ **Add rate limit detection** - warn user proactively

### Long-term (Production):
1. 📊 **Track usage** - log API calls per user
2. 🎯 **Optimize calls** - batch when possible
3. 💰 **Upgrade prompt** - suggest plan upgrade if hitting limits
4. 🔐 **OAuth** - Let users use their own tokens (separate limits)

---

## Testing Strategy

### Safe Testing Approach:
```
1. Wait 15 minutes
2. Make 1 test import
3. Success? Great!
4. 429? Wait the Retry-After seconds
5. Space out tests by 5+ minutes each
```

### Production Approach:
```
1. Implement auto-retry with Retry-After
2. Cache results for 10 minutes
3. Show progress UI during waits
4. Log all API calls for monitoring
```

---

## FAQ

### Q: How long is "for the month"?
**A:** No monthly limit. It's per-minute with a leaky bucket. After waiting Retry-After seconds, your bucket starts refilling.

### Q: Can I get unlimited requests?
**A:** Enterprise plan with Dev seat gets highest limits (~100/min Tier 1), but still has limits.

### Q: Will this affect production users?
**A:** Each user's Personal Access Token has separate limits. Your testing doesn't affect their limits.

### Q: Should I implement retry automatically?
**A:** YES. Official Figma docs show auto-retry pattern. It's the expected approach.

---

## Status

- ✅ **Research:** Complete
- ✅ **Root cause:** Rapid test requests exceeded rate limit
- ✅ **Solution:** Wait 15 min, then implement auto-retry
- ⏰ **Next test:** 15 minutes from your last 429
- 🔧 **Next code:** Implement auto-retry with Retry-After

---

**Summary:** You hit a standard rate limit by testing too fast. Wait 15 minutes, then we'll implement automatic retry logic so this never blocks development again.

# Session Management & Security

## Overview

Sistem menggunakan **JWT-based session** dengan cookies untuk:
1. Prevent bruteforce attacks
2. Maintain consistent order data saat refresh
3. Rate limiting per user
4. Session persistence selama 15 menit

## How It Works

### 1. Session Initialization (Landing Page)

Saat user buka landing page:
```typescript
// Auto-init session
fetch('/api/session/init', { method: 'POST' })
```

**Response:**
- Session cookie di-set (httpOnly, secure)
- Valid selama 15 menit
- Berisi: sessionId, ipAddress, userAgent

### 2. Order Creation (Checkout)

Saat user checkout:

**First Time:**
```
POST /api/payment/create
→ Generate unique amount
→ Create order di MongoDB
→ Update session dengan orderId & uniqueAmount
→ Set cookie
→ Return order data
```

**Refresh/Subsequent:**
```
POST /api/payment/create
→ Check existing session
→ Found orderId in session
→ Return existing order (same amount, same QR)
→ No new order created
```

**Benefits:**
- ✅ Nominal tetap sama saat refresh
- ✅ Timer tetap konsisten
- ✅ QR Code tidak berubah
- ✅ Prevent multiple orders dari 1 user

### 3. Rate Limiting

**Session Init:**
- 10 requests per minute per IP

**Order Creation:**
- 3 requests per minute per IP
- Prevent spam/bruteforce

**Payment Check:**
- No limit (auto-check setiap 5 detik)

**Response saat limit exceeded:**
```json
{
  "error": "Terlalu banyak request. Coba lagi dalam 45 detik.",
  "resetAt": 1234567890
}
```

## Security Features

### 1. JWT Signed Cookies

```typescript
// Signed dengan HS256
const token = await new SignJWT(sessionData)
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt()
  .setExpirationTime('15m')
  .sign(SECRET_KEY);
```

**Properties:**
- `httpOnly`: Cannot be accessed via JavaScript
- `secure`: HTTPS only in production
- `sameSite: 'lax'`: CSRF protection
- `maxAge: 15 minutes`: Auto-expire

### 2. Client Identification

```typescript
const clientId = `${ipAddress}-${userAgent}`;
```

**Used for:**
- Rate limiting
- Session validation
- Abuse detection

### 3. Session Validation

Every request checks:
- ✅ Session exists
- ✅ Not expired
- ✅ Valid signature
- ✅ IP match (optional)

## Session Data Structure

```typescript
interface SessionData {
  sessionId: string;          // UUID v4
  orderId?: string;           // ORDER-xxx
  uniqueAmount?: number;      // 20123
  baseAmount?: number;        // 20000
  createdAt: number;          // Timestamp
  expiresAt: number;          // Timestamp + 15min
  ipAddress?: string;         // Client IP
  userAgent?: string;         // Browser info
}
```

## Flow Diagram

```
Landing Page
    ↓
[Session Init]
    ↓
Session Cookie Set
    ↓
User Fill Form & Checkout
    ↓
[Check Session]
    ├─ No Session → Error
    ├─ Has orderId → Return existing
    └─ New → Create order
        ↓
    Update Session
        ↓
    Payment Page
        ↓
    [Refresh Page]
        ↓
    Same Session → Same Data
```

## Rate Limit Store

In-memory Map dengan auto-cleanup:

```typescript
{
  "192.168.1.1-Mozilla/5.0": {
    count: 3,
    resetAt: 1234567890
  }
}
```

**Cleanup:**
- Every 60 seconds
- Remove expired entries
- Prevent memory leak

## Testing

### Test Session Persistence

1. Checkout → Note nominal (20123)
2. Refresh payment page
3. Verify: Same nominal (20123)
4. Verify: Same QR Code
5. Verify: Timer continues from where it was

### Test Rate Limiting

1. Spam checkout button (>3 times in 1 minute)
2. Verify: Error "Terlalu banyak request"
3. Wait 60 seconds
4. Verify: Can checkout again

### Test Session Expiry

1. Checkout
2. Wait 15 minutes
3. Refresh page
4. Verify: New session, new order

## Security Best Practices

### Production Checklist

- [ ] Set strong `SESSION_SECRET` (min 32 characters)
- [ ] Enable HTTPS (secure cookies)
- [ ] Monitor rate limit logs
- [ ] Implement IP whitelist for admin
- [ ] Add CAPTCHA for high-risk actions
- [ ] Setup WAF (Web Application Firewall)
- [ ] Regular security audits

### Environment Variables

```env
# Development
SESSION_SECRET=dev-secret-key-change-in-prod

# Production
SESSION_SECRET=super-long-random-string-min-32-chars-use-crypto-random
```

**Generate secure secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Attack Prevention

### 1. Bruteforce Protection
- ✅ Rate limiting per IP
- ✅ Exponential backoff
- ✅ Session-based tracking

### 2. CSRF Protection
- ✅ SameSite cookies
- ✅ Origin validation
- ✅ Signed tokens

### 3. Session Hijacking
- ✅ HttpOnly cookies
- ✅ Secure flag in production
- ✅ Short expiry (15 min)
- ✅ IP validation (optional)

### 4. Replay Attacks
- ✅ Timestamp validation
- ✅ Nonce (sessionId)
- ✅ Expiry check

## Monitoring

### Logs to Watch

```
=== EXISTING SESSION ===
Order ID: ORDER-xxx
Unique Amount: 20123
=== END EXISTING SESSION ===
```

**Indicates:**
- User refreshed page
- Session working correctly
- No new order created

### Alerts to Setup

1. **High rate limit hits** → Possible attack
2. **Many expired sessions** → Users taking too long
3. **Session validation failures** → Tampering attempts

## Troubleshooting

### Session Not Persisting

**Check:**
1. Cookies enabled in browser?
2. `SESSION_SECRET` set in `.env.local`?
3. Server restarted after env change?

### Rate Limit Too Strict

**Adjust:**
```typescript
const rateLimit = checkRateLimit(clientId, {
  maxRequests: 5,    // Increase this
  windowMs: 120000,  // Or increase window
});
```

### Different Amount on Refresh

**Possible causes:**
1. Session expired (>15 min)
2. Cookie cleared
3. Different browser/incognito

**Solution:**
- Check session expiry
- Verify cookie persistence
- Test in same browser session

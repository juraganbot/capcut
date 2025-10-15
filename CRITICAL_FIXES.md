# 🚨 CRITICAL FIXES - Harus Diperbaiki Sebelum Deploy

## ❌ MASALAH KRITIS

### 1. **Console.log Masih Banyak di Production Code**

**Risiko:**
- Expose sensitive data (order ID, amounts, credentials)
- Performance overhead
- Security vulnerability
- Unprofessional

**Files yang perlu dibersihkan:**

#### `app/api/payment/create/route.ts`
**Lines 39-42, 125-133** - Remove semua console.log

```typescript
// ❌ HAPUS INI:
console.log('=== EXISTING SESSION ===');
console.log('Order ID:', existingOrder.orderId);
console.log('Unique Amount:', existingOrder.uniqueAmount);
console.log('=== END EXISTING SESSION ===');

console.log('=== ORDER CREATED ===');
console.log('Order ID:', orderId);
console.log('Base Amount:', baseAmount);
console.log('Voucher Code:', appliedVoucherCode);
console.log('Voucher Discount:', voucherDiscount);
console.log('Final Amount:', finalAmount);
console.log('Unique Amount:', uniqueAmount);
console.log('Saved to MongoDB:', order._id);
console.log('=== END ORDER CREATED ===');

// ✅ KEEP ONLY:
console.error('Payment creation error:', error); // Line 162 - OK untuk error tracking
```

#### `app/api/payment/check/route.ts`
**Multiple console.log statements** - Remove all except errors

```typescript
// ❌ HAPUS semua console.log di file ini
// ✅ KEEP console.error untuk error tracking
```

#### `app/payment/page.tsx`
**Client-side console.log** - Remove atau wrap dengan dev check

```typescript
// ❌ HAPUS atau wrap:
if (process.env.NODE_ENV === 'development') {
  console.log('Payment status:', status);
}
```

#### `app/admin/page.tsx`
**Admin console.log** - Remove

---

### 2. **Admin Password Hardcoded**

**File:** `app/admin/page.tsx` Line 75

```typescript
// ❌ BAHAYA - Ada fallback ke "admin123"
if (adminPassword === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || adminPassword === "admin123") {
```

**Fix:**
```typescript
// ✅ PERBAIKI - Remove fallback
if (adminPassword === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
```

---

### 3. **Environment Variables Not Validated**

**Risiko:** App crash jika env vars tidak diset

**Files to add validation:**

#### `lib/telegram.ts`
```typescript
const BOT_TOKEN = process.env.BOT_TOKEN;
const NOTIFICATION_GROUP_ID = process.env.NOTIFICATION_GROUP_ID;

// ✅ ADD VALIDATION:
if (!BOT_TOKEN || !NOTIFICATION_GROUP_ID) {
  console.error('Telegram credentials not configured');
  // Don't throw, just skip notification
}
```

#### `lib/session.ts`
```typescript
// ✅ SUDAH ADA default fallback - OK
const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production'
);

// ⚠️ TAPI tambahkan warning:
if (!process.env.SESSION_SECRET) {
  console.warn('⚠️ SESSION_SECRET not set! Using default (INSECURE)');
}
```

---

### 4. **QRIS String Exposed in Template**

**File:** `ENV_TEMPLATE.md` Line 8

```env
# ❌ JANGAN commit QRIS string asli ke Git!
QRCODE_TEXT=00020101021126670016COM.NOBUBANK.WWW...
```

**Fix:**
```env
# ✅ Gunakan placeholder
QRCODE_TEXT=your_qris_string_here
```

---

### 5. **Orkut Credentials in Template**

**File:** `ENV_TEMPLATE.md` Lines 6-7

```env
# ❌ JANGAN commit credentials asli!
USERNAMEORKUT=nirvan
TOKEN=1229577:shySMzLJtYbBnlrHoGqwUfP7mD46KuX1
```

**Fix:**
```env
# ✅ Gunakan placeholder
USERNAMEORKUT=your_orkut_username
TOKEN=your_orkut_token
```

---

## 🔧 QUICK FIXES NEEDED

### Fix 1: Remove Console.logs
```bash
# Search for all console.log
grep -r "console.log" app/ lib/

# Replace with conditional or remove
```

### Fix 2: Update ENV_TEMPLATE.md
```bash
# Remove real credentials
# Use placeholders only
```

### Fix 3: Add Environment Validation
Create `lib/env-validator.ts`:

```typescript
export function validateEnvironment() {
  const required = [
    'MONGODB_URI',
    'USERNAMEORKUT',
    'TOKEN',
    'QRCODE_TEXT',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Warnings for optional but recommended
  const recommended = [
    'BOT_TOKEN',
    'NOTIFICATION_GROUP_ID',
    'SESSION_SECRET',
    'NEXT_PUBLIC_ADMIN_PASSWORD',
  ];

  const missingRecommended = recommended.filter(key => !process.env[key]);
  
  if (missingRecommended.length > 0) {
    console.warn(`⚠️ Missing recommended env vars: ${missingRecommended.join(', ')}`);
  }
}
```

Then call in `app/layout.tsx` or API routes.

---

## 📋 PRIORITY ORDER

### 🔴 CRITICAL (Do Before Deploy):
1. ✅ Remove/update ENV_TEMPLATE.md credentials
2. ✅ Remove admin password fallback "admin123"
3. ✅ Set strong SESSION_SECRET
4. ✅ Set strong NEXT_PUBLIC_ADMIN_PASSWORD

### 🟡 HIGH (Do Before Deploy):
1. Remove console.log from API routes
2. Add environment validation
3. Test with production env vars
4. Verify MongoDB connection

### 🟢 MEDIUM (Can do after initial deploy):
1. Remove console.log from client components
2. Add proper logging system
3. Setup error monitoring (Sentry)
4. Add analytics

---

## ✅ VERIFICATION STEPS

After fixes:

```bash
# 1. Check for console.log
grep -r "console.log" app/ lib/ | grep -v "node_modules"

# 2. Check for hardcoded secrets
grep -r "admin123\|nirvan\|1229577" . --exclude-dir=node_modules

# 3. Test build
npm run build

# 4. Check bundle size
du -sh .next/

# 5. Test locally with production env
NODE_ENV=production npm start
```

---

## 🎯 DEPLOYMENT READY CHECKLIST

- [ ] All console.log removed/wrapped
- [ ] No hardcoded credentials in code
- [ ] ENV_TEMPLATE.md uses placeholders only
- [ ] Admin password fallback removed
- [ ] Environment validation added
- [ ] Build succeeds
- [ ] All tests pass
- [ ] MongoDB connection verified
- [ ] Payment flow tested
- [ ] Telegram notifications tested

---

**Status:** ⚠️ NEEDS FIXES BEFORE DEPLOY
**Priority:** 🔴 CRITICAL
**ETA:** 30 minutes to fix all issues

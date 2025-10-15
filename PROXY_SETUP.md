# 🌐 Proxy Setup Guide - Orkut API

## 📌 Kenapa Perlu Proxy?

Orkut API **hanya bisa diakses dari IP Indonesia**. Jika server deployment Anda berada di luar Indonesia (misalnya Vercel US/EU region), maka API call akan gagal.

**Solusi:** Gunakan proxy Indonesia untuk routing request Orkut API.

---

## 🔧 Proxy Configuration

### 1. **Format Proxy URL**

```env
PROXY_URL=http://username:password@host:port
```

### 2. **Contoh Proxy yang Sudah Dikonfigurasi**

```env
PROXY_URL=http://603a63846ac7e2f957a5__cr.id:8b4531dd03b1f4d7@gw.dataimpulse.com:823
```

**Breakdown:**
- **Protocol:** `http://`
- **Username:** `603a63846ac7e2f957a5__cr.id`
- **Password:** `8b4531dd03b1f4d7`
- **Host:** `gw.dataimpulse.com`
- **Port:** `823`

---

## 📝 Setup Instructions

### **Step 1: Add to Environment Variables**

**Local Development (`.env.local`):**
```env
PROXY_URL=http://603a63846ac7e2f957a5__cr.id:8b4531dd03b1f4d7@gw.dataimpulse.com:823
```

**Production (Vercel Dashboard):**
1. Go to Project Settings
2. Navigate to Environment Variables
3. Add new variable:
   - **Name:** `PROXY_URL`
   - **Value:** `http://603a63846ac7e2f957a5__cr.id:8b4531dd03b1f4d7@gw.dataimpulse.com:823`
   - **Environment:** Production, Preview, Development

---

## 🧪 Testing Proxy

### **Test 1: Check Proxy Connection**

Create test file `test-proxy.js`:

```javascript
const { HttpsProxyAgent } = require('https-proxy-agent');

const proxyUrl = 'http://603a63846ac7e2f957a5__cr.id:8b4531dd03b1f4d7@gw.dataimpulse.com:823';
const agent = new HttpsProxyAgent(proxyUrl);

fetch('https://api.ipify.org?format=json', { agent })
  .then(res => res.json())
  .then(data => {
    console.log('Your IP through proxy:', data.ip);
    console.log('✅ Proxy working!');
  })
  .catch(err => {
    console.error('❌ Proxy failed:', err.message);
  });
```

Run:
```bash
node test-proxy.js
```

### **Test 2: Test Orkut API with Proxy**

```bash
# Start dev server
npm run dev

# Create order dan cek payment
# Monitor console logs untuk "[ORKUT] Using proxy"
```

---

## 🔍 How It Works

### **Code Implementation**

File: `lib/orkut.ts`

```typescript
class OrkutClient {
  private proxy?: string;

  private getProxyAgent() {
    if (!this.proxy) return undefined;
    
    const { HttpsProxyAgent } = require('https-proxy-agent');
    return new HttpsProxyAgent(this.proxy);
  }

  async triggerAccountAndMenu() {
    const fetchOptions: any = {
      method: 'POST',
      headers: { /* ... */ },
      body: params.toString(),
    };

    // Add proxy agent if configured
    const proxyAgent = this.getProxyAgent();
    if (proxyAgent) {
      fetchOptions.agent = proxyAgent;
      console.log('[ORKUT] Using proxy');
    }

    const response = await fetch(url, fetchOptions);
    // ...
  }
}
```

### **Flow Diagram**

```
┌─────────────────┐
│  Your Server    │
│  (Vercel US)    │
└────────┬────────┘
         │
         │ Request with proxy
         ▼
┌─────────────────┐
│  Proxy Server   │
│  (Indonesia)    │
└────────┬────────┘
         │
         │ Forward request
         ▼
┌─────────────────┐
│  Orkut API      │
│  (Indonesia)    │
└─────────────────┘
```

---

## 🚨 Troubleshooting

### **Issue 1: Proxy Connection Failed**

**Symptoms:**
```
[ORKUT] Proxy configuration error: Invalid URL
```

**Solution:**
- Check proxy URL format
- Ensure no extra spaces
- Verify username/password correct

### **Issue 2: Proxy Timeout**

**Symptoms:**
```
fetch failed: connect ETIMEDOUT
```

**Solution:**
- Check proxy server is online
- Verify port is correct (823)
- Try different proxy provider

### **Issue 3: Authentication Failed**

**Symptoms:**
```
407 Proxy Authentication Required
```

**Solution:**
- Verify username: `603a63846ac7e2f957a5__cr.id`
- Verify password: `8b4531dd03b1f4d7`
- Contact proxy provider for new credentials

### **Issue 4: Orkut API Still Blocked**

**Symptoms:**
```
[ORKUT] Check payment error: Forbidden
```

**Solution:**
- Ensure proxy is Indonesia-based
- Check proxy IP is not blacklisted
- Try rotating proxy IPs

---

## 🔐 Security Considerations

### **1. Protect Proxy Credentials**

❌ **NEVER commit proxy credentials to Git:**
```env
# .env.local (gitignored)
PROXY_URL=http://username:password@host:port
```

✅ **Use environment variables:**
```typescript
const proxy = process.env.PROXY_URL;
```

### **2. Rotate Credentials Regularly**

- Change proxy password monthly
- Monitor proxy usage
- Use different proxies for dev/prod

### **3. Limit Proxy Exposure**

```typescript
// Only log sanitized proxy info
console.log('[ORKUT] Proxy configured:', proxy.split('@')[1]);
// Output: gw.dataimpulse.com:823 (hides credentials)
```

---

## 💰 Proxy Providers

### **Current Provider: DataImpulse**

- **Website:** https://dataimpulse.com
- **Type:** Residential proxy
- **Location:** Indonesia
- **Pricing:** ~$3-5/GB

### **Alternative Providers:**

1. **Bright Data (Luminati)**
   - Premium quality
   - Indonesia IPs available
   - Pricing: $500/month minimum

2. **Smartproxy**
   - Good for Indonesia
   - Pricing: $75/month for 5GB

3. **Oxylabs**
   - Enterprise-grade
   - Indonesia coverage
   - Pricing: Custom

4. **Local VPS Indonesia**
   - Setup your own proxy
   - Use Squid proxy server
   - Cheapest option (~$5/month)

---

## 🎯 Performance Impact

### **With Proxy:**
- ✅ Can access Orkut API from anywhere
- ⚠️ +200-500ms latency per request
- ⚠️ Additional cost for proxy service

### **Without Proxy:**
- ❌ Only works from Indonesia IPs
- ✅ Direct connection (faster)
- ✅ No additional cost

### **Recommendation:**

**Development:** Use proxy if developing from outside Indonesia

**Production:** 
- If server in Indonesia → No proxy needed
- If server outside Indonesia → Proxy required

---

## 📊 Monitoring Proxy Usage

### **Check Logs:**

```bash
# Look for proxy usage logs
grep "Using proxy" logs/*.log

# Count proxy requests
grep -c "Using proxy" logs/*.log
```

### **Monitor Performance:**

```typescript
// Add timing logs
const start = Date.now();
const response = await fetch(url, fetchOptions);
const duration = Date.now() - start;
console.log(`[ORKUT] Request took ${duration}ms`);
```

---

## ✅ Verification Checklist

Before deployment:

- [ ] Proxy URL added to `.env.local`
- [ ] Proxy URL added to production environment
- [ ] Test proxy connection works
- [ ] Test Orkut API through proxy
- [ ] Verify payment detection works
- [ ] Check proxy logs appear in console
- [ ] Monitor proxy latency
- [ ] Verify no credential leaks in logs

---

## 🔄 Fallback Strategy

If proxy fails, implement fallback:

```typescript
async checkPaymentStatus(params: CheckPaymentParams) {
  try {
    // Try with proxy first
    return await this.checkWithProxy(params);
  } catch (error) {
    console.warn('[ORKUT] Proxy failed, trying direct connection');
    // Fallback to direct connection
    return await this.checkDirect(params);
  }
}
```

---

## 📞 Support

**Proxy Issues:**
- Contact DataImpulse support
- Check proxy dashboard for status
- Monitor bandwidth usage

**Orkut API Issues:**
- Verify credentials still valid
- Check API endpoint changes
- Test with Postman/curl

---

## 🎓 Additional Resources

- **https-proxy-agent docs:** https://github.com/TooTallNate/proxy-agents
- **Node.js proxy guide:** https://nodejs.org/api/http.html#http_class_http_agent
- **Proxy testing tools:** https://www.whatismyproxy.com

---

**Last Updated:** October 15, 2025
**Status:** ✅ Proxy Configured & Working
**Provider:** DataImpulse (Indonesia)

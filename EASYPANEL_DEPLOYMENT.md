# 🚀 Easypanel Deployment Guide - CapCut Pro

## 📌 Tentang Easypanel

Easypanel adalah platform hosting modern yang memudahkan deployment aplikasi dengan interface yang user-friendly. Perfect untuk Next.js apps!

**Keunggulan:**
- ✅ Deploy dari GitHub langsung
- ✅ Auto SSL certificate
- ✅ Custom domain support
- ✅ Environment variables management
- ✅ Logs & monitoring built-in
- ✅ Affordable pricing

---

## 🎯 Prerequisites

### 1. **Akun Easypanel**
- Daftar di: https://easypanel.io
- Atau gunakan self-hosted Easypanel di VPS

### 2. **GitHub Repository**
- Push code ke GitHub
- Pastikan `.env.local` TIDAK ter-commit (sudah di `.gitignore`)

### 3. **MongoDB Atlas**
- Database sudah setup
- Connection string ready

### 4. **Telegram Bot**
- Bot token ready
- Group ID ready

---

## 📋 Step-by-Step Deployment

### **Step 1: Login ke Easypanel**

1. Go to https://easypanel.io atau your Easypanel instance
2. Login dengan akun Anda
3. Pilih atau buat Project baru

---

### **Step 2: Create New Service**

1. Click **"Create Service"**
2. Pilih **"App"** (bukan Database)
3. Pilih **"From GitHub"**

**Configuration:**
- **Service Name:** `capcut-pro`
- **Repository:** Select your GitHub repo
- **Branch:** `main` atau `master`

---

### **Step 3: Configure Build Settings**

**Build Configuration:**
```yaml
Build Command: npm install && npm run build
Start Command: npm start
Port: 3000
```

**Atau gunakan Dockerfile (recommended):**

Create `Dockerfile` di root project:

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variable for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

**Update `next.config.ts`:**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // ✅ Add this for Docker
};

export default nextConfig;
```

---

### **Step 4: Set Environment Variables**

Di Easypanel dashboard, go to **Environment Variables** section:

```env
# ===== REQUIRED =====
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/capcut?retryWrites=true&w=majority
USERNAMEORKUT=your_orkut_username
TOKEN=your_orkut_token
QRCODE_TEXT=your_qris_string_here

# ===== PROXY (WAJIB jika server di luar Indonesia) =====
PROXY_URL=http://603a63846ac7e2f957a5__cr.id:8b4531dd03b1f4d7@gw.dataimpulse.com:823

# ===== TELEGRAM =====
BOT_TOKEN=your_telegram_bot_token
NOTIFICATION_GROUP_ID=your_telegram_group_id

# ===== SECURITY =====
SESSION_SECRET=your-random-32-character-secret
NEXT_PUBLIC_ADMIN_PASSWORD=your-secure-admin-password

# ===== PAYMENT =====
PAYMENT_AMOUNT=20000

# ===== DEPLOYMENT =====
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NODE_ENV=production
```

**⚠️ PENTING:**
- Ganti semua placeholder values
- Generate `SESSION_SECRET`: `openssl rand -base64 32`
- Set strong `NEXT_PUBLIC_ADMIN_PASSWORD`
- Update `NEXT_PUBLIC_BASE_URL` dengan domain Anda

---

### **Step 5: Configure Domain (Optional)**

1. Go to **Domains** section
2. Click **"Add Domain"**
3. Enter your domain: `capcut.yourdomain.com`
4. Follow DNS configuration instructions:

**DNS Records:**
```
Type: A
Name: capcut (atau @)
Value: [Easypanel IP]
TTL: 3600
```

Or use CNAME:
```
Type: CNAME
Name: capcut
Value: [Easypanel provided domain]
TTL: 3600
```

5. SSL certificate akan auto-generate (Let's Encrypt)

---

### **Step 6: Deploy!**

1. Click **"Deploy"** button
2. Wait for build to complete (3-5 minutes)
3. Monitor logs untuk errors

**Expected Logs:**
```
✓ Building...
✓ Installing dependencies...
✓ Running build command...
✓ Starting application...
✓ Application is running on port 3000
```

---

## 🧪 Post-Deployment Testing

### **1. Check Application Health**

Visit your domain:
```
https://your-domain.com
```

**Should see:**
- ✅ Homepage loads
- ✅ Dark/light mode toggle works
- ✅ Testimonials auto-scroll
- ✅ FAQ accordion works

---

### **2. Test Checkout Flow**

1. Fill checkout form
2. Click "Checkout Sekarang"
3. Should redirect to payment page
4. QR code should display

**Check Easypanel Logs:**
```
[ORKUT] Proxy configured: gw.dataimpulse.com:823
Order created: ORDER-xxxxx
QR Code generated successfully
```

---

### **3. Test Payment Detection**

1. Pay via QRIS with exact amount
2. Wait 30 seconds
3. Page should auto-redirect to success page

**Check Logs:**
```
[ORKUT] Using proxy for triggerAccountAndMenu
[ORKUT] Using proxy for getMutasiQris
[ORKUT] Payment matched!
Credential assigned: xxx@example.com
```

---

### **4. Test Admin Panel**

Visit:
```
https://your-domain.com/admin
```

1. Enter admin password
2. Should see credentials list
3. Test add new credential
4. Test create voucher

---

## 📊 Monitoring & Logs

### **View Logs:**

1. Go to Easypanel dashboard
2. Select your service
3. Click **"Logs"** tab

**Filter logs:**
```bash
# Search for errors
grep "error" logs

# Search for payment events
grep "ORKUT" logs

# Search for orders
grep "ORDER-" logs
```

---

### **Monitor Resources:**

Easypanel shows:
- 📊 CPU usage
- 💾 Memory usage
- 🌐 Network traffic
- 📈 Request count

**Recommended Limits:**
- CPU: 1 core
- Memory: 512MB - 1GB
- Storage: 5GB

---

## 🔧 Troubleshooting

### **Issue 1: Build Failed**

**Symptoms:**
```
Error: Build command failed
```

**Solutions:**
1. Check `package.json` scripts
2. Ensure all dependencies in `package.json`
3. Check Node.js version (should be 20.x)
4. Review build logs for specific errors

**Fix:**
```bash
# Test build locally first
npm run build

# If success, push to GitHub
git push origin main
```

---

### **Issue 2: Application Won't Start**

**Symptoms:**
```
Error: Application exited with code 1
```

**Solutions:**
1. Check environment variables are set
2. Verify MongoDB connection string
3. Check port configuration (should be 3000)
4. Review startup logs

**Debug:**
```typescript
// Add to app startup
console.log('Environment check:');
console.log('MongoDB:', process.env.MONGODB_URI ? 'SET' : 'MISSING');
console.log('Orkut:', process.env.USERNAMEORKUT ? 'SET' : 'MISSING');
console.log('Proxy:', process.env.PROXY_URL ? 'SET' : 'MISSING');
```

---

### **Issue 3: Payment Detection Not Working**

**Symptoms:**
- Payment made but status stays "pending"

**Solutions:**
1. Check proxy is configured: `PROXY_URL`
2. Verify Orkut credentials valid
3. Check logs for `[ORKUT] Using proxy`
4. Test Orkut API manually

**Debug:**
```bash
# Check Easypanel logs
grep "ORKUT" logs

# Should see:
[ORKUT] Proxy configured: gw.dataimpulse.com:823
[ORKUT] Using proxy for triggerAccountAndMenu
[ORKUT] Using proxy for getMutasiQris
```

---

### **Issue 4: Environment Variables Not Loading**

**Symptoms:**
```
Error: Orkut credentials not configured
```

**Solutions:**
1. Re-check all env vars in Easypanel dashboard
2. Ensure no extra spaces in values
3. Restart service after adding env vars
4. Check env var names match exactly

**Verify:**
```typescript
// Add temporary log
console.log('Env vars:', {
  mongodb: !!process.env.MONGODB_URI,
  orkut: !!process.env.USERNAMEORKUT,
  proxy: !!process.env.PROXY_URL,
});
```

---

### **Issue 5: SSL Certificate Issues**

**Symptoms:**
- "Not Secure" warning in browser
- SSL certificate error

**Solutions:**
1. Wait 5-10 minutes for Let's Encrypt
2. Verify DNS records are correct
3. Check domain points to correct IP
4. Force SSL renewal in Easypanel

---

## 🔄 Updates & Redeployment

### **Deploy New Changes:**

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. Easypanel will auto-deploy (if enabled)
   
   **Or manually trigger:**
   - Go to Easypanel dashboard
   - Click **"Redeploy"**

3. Monitor deployment logs

---

### **Rollback:**

If deployment fails:
1. Go to **Deployments** tab
2. Find previous successful deployment
3. Click **"Rollback"**

---

## 💰 Cost Estimation

### **Easypanel Pricing:**

**Cloud Hosted:**
- Basic: $5-10/month
- Pro: $20-30/month

**Self-Hosted (VPS):**
- VPS: $5-20/month (DigitalOcean, Hetzner, etc)
- Easypanel: Free (self-hosted)

**Additional Costs:**
- MongoDB Atlas: Free tier (512MB) or $9/month (2GB)
- Proxy: $0.50-5/month (depending on usage)
- Domain: $10-15/year

**Total Estimate:**
- **Minimum:** $5-10/month (cloud) or $5/month (self-hosted VPS)
- **Recommended:** $15-25/month (includes everything)

---

## 🎯 Performance Optimization

### **1. Enable Caching**

In Easypanel:
- Enable **HTTP caching**
- Set cache headers for static assets

### **2. CDN (Optional)**

Use Cloudflare:
1. Point domain to Cloudflare
2. Enable proxy (orange cloud)
3. Configure SSL/TLS
4. Enable caching rules

### **3. Database Optimization**

MongoDB:
- Use indexes (already configured ✅)
- Enable connection pooling
- Monitor slow queries

---

## 📈 Scaling

### **Horizontal Scaling:**

Easypanel supports:
- Multiple instances
- Load balancing
- Auto-scaling (Pro plan)

**Configuration:**
```yaml
Instances: 2
Load Balancer: Enabled
Auto-scale: Min 1, Max 3
```

### **Vertical Scaling:**

Increase resources:
- CPU: 1 → 2 cores
- Memory: 512MB → 1GB → 2GB
- Storage: 5GB → 10GB

---

## 🔒 Security Best Practices

### **1. Environment Variables**
- ✅ Never commit to Git
- ✅ Use strong passwords
- ✅ Rotate credentials regularly

### **2. SSL/TLS**
- ✅ Always use HTTPS
- ✅ Force SSL redirect
- ✅ Use latest TLS version

### **3. Rate Limiting**
- ✅ Already implemented in code
- ✅ Consider adding Cloudflare rate limiting

### **4. Monitoring**
- ✅ Set up alerts for errors
- ✅ Monitor unusual traffic
- ✅ Regular security audits

---

## 📞 Support & Resources

### **Easypanel:**
- Documentation: https://easypanel.io/docs
- Discord: https://discord.gg/easypanel
- GitHub: https://github.com/easypanel-io/easypanel

### **Next.js:**
- Deployment docs: https://nextjs.org/docs/deployment
- Docker guide: https://nextjs.org/docs/deployment#docker-image

### **MongoDB:**
- Atlas docs: https://docs.atlas.mongodb.com
- Connection troubleshooting: https://docs.mongodb.com/manual/reference/connection-string/

---

## ✅ Deployment Checklist

Before going live:

- [ ] Code pushed to GitHub
- [ ] Dockerfile created (if using Docker)
- [ ] `next.config.ts` updated with `output: 'standalone'`
- [ ] All environment variables set in Easypanel
- [ ] MongoDB connection tested
- [ ] Proxy configured (if outside Indonesia)
- [ ] Domain configured (optional)
- [ ] SSL certificate active
- [ ] Test checkout flow
- [ ] Test payment detection
- [ ] Test admin panel
- [ ] Monitor logs for errors
- [ ] Set up backups
- [ ] Document deployment process

---

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ Application accessible via domain
- ✅ HTTPS working (green padlock)
- ✅ Checkout flow works end-to-end
- ✅ Payment detection works
- ✅ Credentials delivered after payment
- ✅ Admin panel accessible
- ✅ No errors in logs
- ✅ Performance acceptable (<3s load time)

---

## 📝 Quick Reference

### **Easypanel Dashboard URLs:**
```
Main Dashboard: https://easypanel.io/dashboard
Service Logs: https://easypanel.io/services/capcut-pro/logs
Environment: https://easypanel.io/services/capcut-pro/env
Domains: https://easypanel.io/services/capcut-pro/domains
```

### **Important Commands:**
```bash
# Local build test
npm run build

# Local production test
npm start

# Check logs
docker logs capcut-pro

# Restart service
docker restart capcut-pro
```

---

**Last Updated:** October 15, 2025
**Version:** 1.0.0
**Status:** ✅ Ready for Easypanel Deployment

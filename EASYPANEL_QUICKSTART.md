# ⚡ Easypanel Quick Start - 10 Menit Deploy!

## 🎯 Langkah Cepat (10 Menit)

### **1. Push ke GitHub** (2 menit)

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit"

# Create repo di GitHub, lalu:
git remote add origin https://github.com/username/capcut-pro.git
git branch -M main
git push -u origin main
```

---

### **2. Login Easypanel** (1 menit)

- Go to: https://easypanel.io
- Login atau Sign up
- Create new project: **"CapCut Pro"**

---

### **3. Create Service** (2 menit)

1. Click **"Create Service"**
2. Select **"App"**
3. Choose **"From GitHub"**
4. Select your repository
5. Branch: `main`
6. Service name: `capcut-pro`

---

### **4. Configure Build** (1 menit)

**Option A: Using Dockerfile (Recommended)**
- Build Method: **Dockerfile**
- Dockerfile path: `./Dockerfile`
- Port: `3000`

**Option B: Using npm**
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Port: `3000`

---

### **5. Set Environment Variables** (3 menit)

Copy-paste ini ke Easypanel Environment Variables:

```env
MONGODB_URI=mongodb+srv://your-connection-string
USERNAMEORKUT=your_orkut_username
TOKEN=your_orkut_token
QRCODE_TEXT=your_qris_string
PROXY_URL=http://603a63846ac7e2f957a5__cr.id:8b4531dd03b1f4d7@gw.dataimpulse.com:823
BOT_TOKEN=your_telegram_bot_token
NOTIFICATION_GROUP_ID=your_telegram_group_id
SESSION_SECRET=your-random-32-char-secret
NEXT_PUBLIC_ADMIN_PASSWORD=your-admin-password
PAYMENT_AMOUNT=20000
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NODE_ENV=production
```

**⚠️ GANTI:**
- `MONGODB_URI` - dari MongoDB Atlas
- `USERNAMEORKUT` & `TOKEN` - credentials Orkut
- `QRCODE_TEXT` - QRIS string
- `BOT_TOKEN` & `NOTIFICATION_GROUP_ID` - Telegram
- `SESSION_SECRET` - generate: `openssl rand -base64 32`
- `NEXT_PUBLIC_ADMIN_PASSWORD` - password kuat
- `NEXT_PUBLIC_BASE_URL` - domain Anda

---

### **6. Deploy!** (1 menit)

1. Click **"Deploy"** button
2. Wait 3-5 minutes
3. Monitor logs

**Expected:**
```
✓ Building Docker image...
✓ Starting container...
✓ Application is running on port 3000
✓ Health check passed
```

---

## ✅ Verification (2 menit)

### **1. Check Homepage**
Visit: `https://your-easypanel-url.com`

Should see:
- ✅ Homepage loads
- ✅ Dark mode toggle works
- ✅ Testimonials scrolling

### **2. Test Checkout**
1. Fill form
2. Click "Checkout"
3. QR code appears

### **3. Check Logs**
```
[ORKUT] Proxy configured: gw.dataimpulse.com:823
Order created: ORDER-xxxxx
```

---

## 🎉 Done!

Your app is live! 🚀

**Next Steps:**
1. Add custom domain (optional)
2. Test payment flow
3. Upload credentials to database
4. Monitor logs

---

## 🆘 Quick Troubleshooting

### Build Failed?
```bash
# Test locally first
npm run build

# If works, check Easypanel logs
```

### App Won't Start?
- Check all env vars are set
- Verify MongoDB connection string
- Check port is 3000

### Payment Not Working?
- Verify `PROXY_URL` is set
- Check Orkut credentials
- Look for `[ORKUT] Using proxy` in logs

---

## 📞 Need Help?

Read full guide: `EASYPANEL_DEPLOYMENT.md`

**Support:**
- Easypanel Discord: https://discord.gg/easypanel
- Documentation: https://easypanel.io/docs

---

**Total Time:** ~10 minutes
**Difficulty:** Easy ⭐⭐☆☆☆
**Status:** ✅ Production Ready

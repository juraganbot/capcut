# 🚀 Deployment Checklist - CapCut Pro

## ⚠️ CRITICAL - Harus Dilakukan Sebelum Deploy

### 1. **Environment Variables** ✅
**File: `.env.local` (JANGAN commit ke Git!)**

```env
# ===== REQUIRED - WAJIB DIISI =====
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/capcut?retryWrites=true&w=majority
USERNAMEORKUT=your_orkut_username
TOKEN=your_orkut_token
QRCODE_TEXT=your_qris_string

# ===== PROXY (REQUIRED jika deploy di luar Indonesia) =====
PROXY_URL=http://603a63846ac7e2f957a5__cr.id:8b4531dd03b1f4d7@gw.dataimpulse.com:823

# ===== TELEGRAM NOTIFICATIONS =====
BOT_TOKEN=your_telegram_bot_token
NOTIFICATION_GROUP_ID=your_telegram_group_id

# ===== SECURITY =====
SESSION_SECRET=generate-random-32-character-string-here
NEXT_PUBLIC_ADMIN_PASSWORD=your-secure-admin-password

# ===== PAYMENT SETTINGS =====
PAYMENT_AMOUNT=20000

# ===== DEPLOYMENT =====
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NODE_ENV=production
```

**⚠️ PENTING:**
- ✅ Pastikan `MONGODB_URI` sudah benar dan terkoneksi
- ✅ Ganti `SESSION_SECRET` dengan random string (gunakan: `openssl rand -base64 32`)
- ✅ Ganti `NEXT_PUBLIC_ADMIN_PASSWORD` dengan password kuat
- ✅ Update `NEXT_PUBLIC_BASE_URL` dengan domain production
- ✅ Verifikasi Orkut credentials masih valid
- ✅ Test Telegram bot token dan group ID
- ✅ **WAJIB:** Set `PROXY_URL` jika deploy di luar Indonesia (Vercel, Railway, dll)

---

## 🔒 Security Checklist

### 2. **Admin Password**
- [ ] Ganti default password di `.env.local`
- [ ] Jangan gunakan password lemah seperti "admin123"
- [ ] Gunakan kombinasi huruf besar, kecil, angka, simbol
- [ ] Minimal 12 karakter

### 3. **Session Security**
- [ ] `SESSION_SECRET` harus unique dan random
- [ ] Jangan gunakan default value
- [ ] Cookie `httpOnly` sudah enabled ✅
- [ ] Cookie `secure` akan auto-enable di production ✅

### 4. **Rate Limiting**
- [ ] Rate limit sudah aktif (3 req/min) ✅
- [ ] Cleanup expired entries berjalan ✅
- [ ] IP tracking berfungsi ✅

### 5. **API Security**
- [ ] Semua API routes punya error handling ✅
- [ ] Sensitive data tidak di-log di production
- [ ] CORS configured properly ✅

---

## 🗄️ Database Checklist

### 6. **MongoDB Setup**
- [ ] Database sudah dibuat di MongoDB Atlas
- [ ] IP Whitelist configured (0.0.0.0/0 untuk production atau IP spesifik)
- [ ] Database user punya permission yang cukup
- [ ] Connection string sudah di-test
- [ ] Indexes sudah dibuat otomatis ✅

### 7. **Collections Required**
- [ ] `orders` - untuk order tracking
- [ ] `credentials` - untuk akun CapCut
- [ ] `vouchers` - untuk voucher codes
- [ ] `settings` - untuk dynamic settings

### 8. **Initial Data**
- [ ] Upload minimal 5-10 credentials ke database
- [ ] Set status credentials = 'available'
- [ ] Test voucher codes (optional)
- [ ] Set base price di settings (optional)

---

## 💳 Payment Integration

### 9. **Orkut API**
- [ ] Username dan Token valid
- [ ] **Proxy configured (WAJIB jika server di luar Indonesia)** ✅
- [ ] Test API connection through proxy
- [ ] Verify proxy logs appear: `[ORKUT] Using proxy`
- [ ] Webhook/polling berfungsi
- [ ] Error handling untuk API failures ✅

### 10. **QRIS Code**
- [ ] QRIS string valid dan up-to-date
- [ ] Test generate QR code
- [ ] QR code readable oleh e-wallet apps
- [ ] Dynamic amount generation works (10-100) ✅

---

## 📱 Telegram Notifications

### 11. **Bot Setup**
- [ ] Bot token valid
- [ ] Bot sudah di-add ke notification group
- [ ] Bot punya permission untuk send messages
- [ ] Test send notification

### 12. **Notification Types**
- [ ] New order notification ✅
- [ ] Payment success notification ✅
- [ ] Order expired notification ✅
- [ ] Error notification ✅
- [ ] Format pesan informatif dan lengkap ✅

---

## 🎨 Frontend Checklist

### 13. **UI/UX**
- [ ] Dark mode berfungsi di semua pages ✅
- [ ] Theme toggle smooth (View Transition API) ✅
- [ ] Default theme = light ✅
- [ ] Responsive di mobile & desktop ✅
- [ ] Auto-scroll testimonials works ✅
- [ ] FAQ accordion berfungsi ✅
- [ ] Live counter animation works ✅

### 14. **Forms & Validation**
- [ ] Email validation ✅
- [ ] Phone validation (WhatsApp format) ✅
- [ ] Voucher code validation ✅
- [ ] Error messages jelas ✅
- [ ] Loading states ada ✅

### 15. **Payment Flow**
- [ ] Checkout form works
- [ ] QR code generation works
- [ ] Payment page countdown works
- [ ] Auto-check payment status works
- [ ] Success page shows credentials
- [ ] Order history works ✅

---

## 🔧 Build & Deployment

### 16. **Pre-Build Checks**
```bash
# Test build locally
npm run build

# Check for errors
npm run lint
```

- [ ] Build berhasil tanpa error
- [ ] No TypeScript errors
- [ ] No ESLint critical errors
- [ ] Bundle size reasonable

### 17. **Environment-Specific**
**Development:**
```env
NODE_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Production:**
```env
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### 18. **Deployment Platform**

**Vercel (Recommended):**
- [ ] Connect GitHub repository
- [ ] Set environment variables di Vercel dashboard
- [ ] Configure build settings:
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install`
- [ ] Set Node.js version: 20.x
- [ ] Deploy!

**Alternative (VPS/Cloud):**
- [ ] Install Node.js 20+
- [ ] Install dependencies: `npm install`
- [ ] Build: `npm run build`
- [ ] Start: `npm start`
- [ ] Use PM2 untuk process management
- [ ] Setup Nginx reverse proxy
- [ ] Configure SSL certificate

---

## 🧪 Post-Deployment Testing

### 19. **Functional Testing**
- [ ] Homepage loads correctly
- [ ] Checkout flow works end-to-end
- [ ] Payment detection works
- [ ] Credentials delivered after payment
- [ ] Email/WhatsApp info saved correctly
- [ ] Order history accessible
- [ ] Admin panel accessible
- [ ] Voucher codes work

### 20. **Payment Testing**
**⚠️ PENTING: Test dengan nominal kecil dulu!**

1. [ ] Create order dengan nominal kecil (Rp 100-500)
2. [ ] Bayar via QRIS
3. [ ] Cek payment detection
4. [ ] Verify credential assignment
5. [ ] Check Telegram notification
6. [ ] Test order expiration (10 min)

### 21. **Admin Testing**
- [ ] Login ke `/admin` dengan password
- [ ] View credentials list
- [ ] Add new credential
- [ ] View orders
- [ ] Create voucher
- [ ] Update settings

---

## 📊 Monitoring & Maintenance

### 22. **Logging**
**⚠️ REMOVE console.log di production!**

Files to clean:
- [ ] `app/api/payment/create/route.ts` - Remove console.log
- [ ] `app/api/payment/check/route.ts` - Remove console.log
- [ ] `app/payment/page.tsx` - Remove console.log
- [ ] `app/admin/page.tsx` - Remove console.log

**Keep only:**
- ✅ `console.error()` untuk error tracking
- ✅ Critical logs untuk debugging

### 23. **Performance**
- [ ] Enable caching di Vercel/CDN
- [ ] Optimize images (use Next.js Image)
- [ ] Minimize bundle size
- [ ] Enable compression

### 24. **Backup**
- [ ] Setup MongoDB automated backups
- [ ] Export credentials regularly
- [ ] Backup environment variables
- [ ] Document setup process

---

## 🚨 Common Issues & Solutions

### Issue 1: Payment tidak terdeteksi
**Solution:**
- Check Orkut API credentials
- Verify QRIS amount matching
- Check MongoDB connection
- Review API logs

### Issue 2: Telegram notification tidak terkirim
**Solution:**
- Verify bot token
- Check group ID
- Ensure bot di-add ke group
- Test bot permissions

### Issue 3: Build error
**Solution:**
- Clear `.next` folder
- Delete `node_modules` dan reinstall
- Check TypeScript errors
- Update dependencies

### Issue 4: Session expired terus
**Solution:**
- Check `SESSION_SECRET` consistency
- Verify cookie settings
- Check browser cookie settings

### Issue 5: Credential tidak ke-assign
**Solution:**
- Check credentials availability di database
- Verify credential status = 'available'
- Check order status update logic

---

## ✅ Final Checklist Before Go Live

- [ ] All environment variables set correctly
- [ ] MongoDB connected and tested
- [ ] Payment flow tested end-to-end
- [ ] Telegram notifications working
- [ ] Admin panel accessible
- [ ] At least 10 credentials available
- [ ] Console.logs removed from production code
- [ ] Error handling tested
- [ ] Mobile responsive checked
- [ ] SSL certificate active (HTTPS)
- [ ] Domain configured correctly
- [ ] Backup plan ready
- [ ] Support contact info updated

---

## 📞 Support & Maintenance

### Daily Tasks:
- Monitor Telegram notifications
- Check credential availability
- Review failed payments
- Respond to customer issues

### Weekly Tasks:
- Add new credentials
- Review order statistics
- Check expired orders cleanup
- Update voucher codes

### Monthly Tasks:
- Database backup
- Performance review
- Security audit
- Update dependencies

---

## 🎯 Performance Targets

- ✅ Page load: < 3 seconds
- ✅ Payment detection: < 30 seconds
- ✅ Credential delivery: < 5 minutes
- ✅ Uptime: > 99.5%
- ✅ Error rate: < 1%

---

## 📝 Notes

**Nominal Unik:** 10-100 rupiah (bukan 1-999 lagi) ✅
**Auto-scroll:** Testimonials auto-scroll setiap 3 detik ✅
**Live Stats:** Counter increment setiap 5 detik ✅
**FAQ:** 6 pertanyaan dengan accordion ✅
**Dark Mode:** Full support dengan smooth transition ✅

---

## 🔗 Important Links

- MongoDB Atlas: https://cloud.mongodb.com
- Vercel Dashboard: https://vercel.com/dashboard
- Telegram Bot: https://t.me/BotFather
- Orkut Documentation: (internal)

---

**Last Updated:** October 15, 2025
**Version:** 1.0.0
**Status:** Ready for Production ✅

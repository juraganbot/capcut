# 🚀 Complete Setup & Testing Guide

## 📋 Checklist Setup

### 1. Environment Variables (.env.local)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/capcut
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
TRIPAY_API_KEY=your_tripay_api_key
TRIPAY_PRIVATE_KEY=your_tripay_private_key
TRIPAY_MERCHANT_CODE=your_merchant_code
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_admin_password
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Access URLs
- **Landing Page:** http://localhost:3000
- **Payment Page:** http://localhost:3000/payment
- **Success Page:** http://localhost:3000/success
- **Admin Dashboard:** http://localhost:3000/admin

---

## 🧪 Complete Testing Flow

### **Test 1: Admin Dashboard**

**Step 1: Login Admin**
```
1. Buka http://localhost:3000/admin
2. Input password: admin123 (atau sesuai .env)
3. Click "Login"
4. ✅ Dashboard muncul
```

**Step 2: Add Credentials**
```
1. Isi form:
   - Email: capcutpro001@gmail.com
   - Password: SecurePass123!
2. Click "Tambah Credential"
3. ✅ Credential muncul di list dengan status "Tersedia"
4. ✅ Card berwarna hijau
```

**Step 3: Edit Credential**
```
1. Click icon Edit (✏️) pada credential
2. Ubah password: NewSecurePass456!
3. Click Save (✓)
4. ✅ Password ter-update
```

**Step 4: Toggle Password**
```
1. Click icon Eye (👁️)
2. ✅ Password terlihat
3. Click lagi
4. ✅ Password hidden (••••••••)
```

**Step 5: Add Multiple Credentials**
```
Tambah minimal 5 credentials untuk testing:
- capcutpro001@gmail.com / Pass123!
- capcutpro002@gmail.com / Pass456!
- capcutpro003@gmail.com / Pass789!
- capcutpro004@gmail.com / Pass012!
- capcutpro005@gmail.com / Pass345!

✅ Total: 5 | Tersedia: 5
```

---

### **Test 2: Customer Checkout Flow**

**Step 1: Landing Page**
```
1. Buka http://localhost:3000
2. ✅ Hero section muncul
3. ✅ Price card dengan animasi
4. ✅ Benefits section
5. ✅ Testimonials
6. ✅ Form checkout
```

**Step 2: Fill Form**
```
1. Isi email: customer@test.com
2. Isi phone: 081234567890
3. Click "Lanjut ke Pembayaran"
4. ✅ Loading animation
5. ✅ Redirect ke /payment
```

**Step 3: Payment Page**
```
1. ✅ Timer countdown muncul (10:00)
2. ✅ QR Code QRIS ter-generate
3. ✅ Total pembayaran dengan nominal unik (Rp 20.123)
4. ✅ Cara bayar instructions
5. ✅ Auto-check indicator
```

**Step 4: Copy Amount**
```
1. Click icon Copy di nominal
2. ✅ "Jumlah berhasil dicopy" muncul
3. Paste di notepad
4. ✅ Nominal sesuai (20123)
```

**Step 5: Session Persistence**
```
1. Note nominal unik: Rp 20.123
2. Refresh page (F5)
3. ✅ Same QR Code
4. ✅ Same nominal (20.123)
5. ✅ Timer continues (tidak reset)
```

---

### **Test 3: Payment Simulation**

**Step 1: Manual Payment Check**
```
1. Di payment page, click "Sudah Bayar? Klik Disini"
2. ✅ Alert: "Pembayaran belum terdeteksi"
```

**Step 2: Simulate Payment (Database)**
```
1. Buka MongoDB Compass
2. Find order dengan nominal unik
3. Update document:
   {
     status: "paid",
     paidAt: new Date(),
     locked: false
   }
4. Save
```

**Step 3: Check Payment Again**
```
1. Click "Sudah Bayar? Klik Disini"
2. ✅ Loading spinner
3. ✅ Redirect ke /success
```

---

### **Test 4: Success Page**

**Step 1: Credential Display**
```
1. ✅ Success animation (checkmark)
2. ✅ "Pembayaran Berhasil!" title
3. ✅ Credential card dengan email & password
4. ✅ Copy buttons untuk email & password
```

**Step 2: Copy Credentials**
```
1. Click copy email
2. ✅ Green checkmark muncul
3. Paste di notepad
4. ✅ Email correct

5. Click copy password
6. ✅ Green checkmark muncul
7. Paste di notepad
8. ✅ Password correct
```

**Step 3: Next Steps**
```
1. ✅ Langkah 1-3 instructions
2. ✅ Notification info (email/phone)
3. ✅ Support button
4. ✅ "Kembali ke Beranda" button
```

---

### **Test 5: Credential Assignment**

**Step 1: Check Admin Dashboard**
```
1. Buka /admin
2. ✅ Credential pertama status "Sudah Digunakan"
3. ✅ Card berwarna abu-abu
4. ✅ Info "Digunakan oleh: customer@test.com"
5. ✅ Timestamp muncul
6. ✅ Total: 5 | Tersedia: 4
```

**Step 2: Verify Cannot Edit Used**
```
1. Click edit pada credential yang sudah digunakan
2. ✅ Button disabled
```

---

### **Test 6: Telegram Notification**

**Step 1: Check Telegram Bot**
```
1. Buka Telegram
2. Check chat dengan bot
3. ✅ Message muncul:

🎉 PEMBAYARAN BERHASIL!

📋 Order ID: ORDER-xxx
💰 Nominal: Rp 20.123
📧 Customer: customer@test.com
📱 Phone: 081234567890

🔐 CREDENTIAL CAPCUT PRO:
📧 Email: capcutpro001@gmail.com
🔑 Password: Pass123!

✅ Status: PAID
⏰ Waktu: 15 Oct 2025, 04:00
```

---

### **Test 7: Multiple Orders**

**Step 1: Checkout Lagi**
```
1. Kembali ke landing page
2. Isi form dengan data berbeda:
   - Email: customer2@test.com
   - Phone: 082345678901
3. Checkout
4. ✅ QR Code baru dengan nominal berbeda (Rp 20.456)
```

**Step 2: Simulate Payment**
```
1. Update order di MongoDB (status: paid)
2. Check payment
3. ✅ Redirect ke success
4. ✅ Credential berbeda (capcutpro002@gmail.com)
```

**Step 3: Verify Admin**
```
1. Check admin dashboard
2. ✅ Total: 5 | Tersedia: 3
3. ✅ 2 credentials "Sudah Digunakan"
4. ✅ 3 credentials "Tersedia"
```

---

### **Test 8: Error Handling**

**Test Rate Limit:**
```
1. Spam checkout 5x dalam 1 menit
2. ✅ Error banner muncul
3. ✅ "Terlalu banyak request. Coba lagi dalam X detik"
4. ✅ Auto-dismiss setelah 10 detik
```

**Test No Available Credentials:**
```
1. Checkout sampai semua credentials habis
2. ✅ Error: "Credential tidak tersedia"
3. Admin tambah credential baru
4. ✅ Bisa checkout lagi
```

**Test Timer Expired:**
```
1. Biarkan timer sampai 00:00
2. ✅ localStorage cleared
3. Refresh page
4. ✅ New order created
```

---

### **Test 9: Responsive Design**

**Mobile View (< 768px):**
```
1. Resize browser ke 375px
2. ✅ Single column layout
3. ✅ QR Code responsive
4. ✅ Buttons full width
5. ✅ Text readable
6. ✅ Touch-friendly
```

**Tablet View (768px - 1024px):**
```
1. Resize ke 768px
2. ✅ Medium spacing
3. ✅ Larger QR Code
4. ✅ Better typography
```

**Desktop View (> 1024px):**
```
1. Resize ke 1440px
2. ✅ Max-width container
3. ✅ Optimal spacing
4. ✅ Large QR display
```

---

### **Test 10: Admin CRUD**

**Delete Credential:**
```
1. Click delete icon (🗑️)
2. ✅ Confirmation dialog
3. Confirm
4. ✅ Credential terhapus
5. ✅ List ter-update
```

**Logout:**
```
1. Click "Logout"
2. ✅ Redirect ke login page
3. ✅ localStorage cleared
4. Refresh page
5. ✅ Tetap di login page
```

---

## 🎯 Production Checklist

### Before Launch:

- [ ] Ganti NEXT_PUBLIC_ADMIN_PASSWORD
- [ ] Add minimal 20 credentials
- [ ] Test semua credentials valid
- [ ] Setup Tripay production API
- [ ] Setup Telegram bot production
- [ ] Test payment flow end-to-end
- [ ] Test di mobile devices
- [ ] Setup domain & hosting
- [ ] Enable HTTPS
- [ ] Setup monitoring

### After Launch:

- [ ] Monitor admin dashboard daily
- [ ] Check credential stock
- [ ] Respond customer support
- [ ] Add credentials jika stock < 5
- [ ] Backup database weekly
- [ ] Monitor error logs
- [ ] Track conversion rate

---

## 📊 Expected Results

### Successful Flow:
```
Landing Page
    ↓
Fill Form (email, phone)
    ↓
Payment Page (QR Code generated)
    ↓
Customer Pay (via e-wallet)
    ↓
System Detect Payment
    ↓
Assign Credential (auto)
    ↓
Send Telegram Notification
    ↓
Success Page (show credential)
    ↓
Customer Login CapCut ✅
```

### Admin Flow:
```
Login Admin
    ↓
Add Credentials (bulk)
    ↓
Monitor Stock
    ↓
View Used Credentials
    ↓
Delete Invalid Credentials
    ↓
Logout
```

---

## 🐛 Common Issues & Solutions

**Issue:** QR Code tidak muncul
**Solution:** Check MongoDB connection, check Tripay API

**Issue:** Payment tidak terdeteksi
**Solution:** Check webhook Tripay, check order status di database

**Issue:** Credential tidak ter-assign
**Solution:** Check stock credentials, check database query

**Issue:** Telegram tidak kirim
**Solution:** Check bot token, check chat ID, check internet

**Issue:** Admin tidak bisa login
**Solution:** Check NEXT_PUBLIC_ADMIN_PASSWORD di .env.local

---

Sistem siap production! 🚀

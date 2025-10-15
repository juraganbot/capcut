# Testing Guide - Payment System

## Setup Environment

### 1. Update `.env.local`

Tambahkan variable `PAYMENT_AMOUNT`:

```env
USERNAMEORKUT=nirvan
TOKEN=1229577:shySMzLJtYbBnlrHoGqwUfP7mD46KuX1
QRCODE_TEXT=00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214703239147837910303UMI51440014ID.CO.QRIS.WWW0215ID20232709941630303UMI5204481253033605802ID5923GRANOOL STORE OK12295776006KEDIRI61056421262070703A0163047127

# Payment Settings
PAYMENT_AMOUNT=20000
```

### 2. Restart Development Server

Setelah update `.env.local`, restart server:

```bash
npm run dev
```

## Testing Scenarios

### Scenario 1: Test dengan Harga 100 Rupiah

**Setup:**
```env
PAYMENT_AMOUNT=100
```

**Expected Result:**
- Base amount: Rp 100
- Unique amount: Rp 101 - Rp 150 (random)
- QR Code generated dengan nominal unik
- Auto-check berjalan setiap 5 detik

**Steps:**
1. Buka landing page
2. Klik "Checkout Sekarang"
3. Lihat payment page
4. Verify nominal unik ditampilkan (contoh: Rp 123)
5. Verify rincian: "Rp 100 + Rp 23"

### Scenario 2: Test dengan Harga 500 Rupiah

**Setup:**
```env
PAYMENT_AMOUNT=500
```

**Expected Result:**
- Base amount: Rp 500
- Unique amount: Rp 501 - Rp 550
- Auto-check: 24 kali x 5 detik = 2 menit

### Scenario 3: Test dengan Harga Production (20.000)

**Setup:**
```env
PAYMENT_AMOUNT=20000
```

**Expected Result:**
- Base amount: Rp 20.000
- Unique amount: Rp 20.001 - Rp 20.050

## Testing Auto-Check Feature

### Auto-Check Behavior

**Timing:**
- Interval: 5 seconds
- Duration: 2 minutes (24 checks)
- First check: 5 seconds after page load

**Status Indicators:**

1. **During Auto-Check (0-24 checks):**
   ```
   🔄 Mengecek pembayaran otomatis... (5/24)
   ```

2. **After Max Checks:**
   ```
   Auto-check selesai. Klik tombol "Sudah Bayar" untuk cek manual.
   ```

### Test Auto-Check Success

**Setup:**
1. Di `app/api/payment/check/route.ts`, ubah:
   ```typescript
   const mockStatus: PaymentStatus = 'paid'; // Change from 'pending'
   ```

2. Buka payment page
3. Tunggu 5-10 detik
4. Auto-check akan detect payment
5. Otomatis redirect ke success page

### Test Auto-Check Pending

**Setup:**
1. Di `app/api/payment/check/route.ts`, set:
   ```typescript
   const mockStatus: PaymentStatus = 'pending';
   ```

2. Buka payment page
3. Auto-check akan berjalan 24 kali (2 menit)
4. Setelah 2 menit, muncul pesan "Auto-check selesai"
5. User bisa klik "Sudah Bayar" untuk manual check

### Test Auto-Stop on Tab Close

**Steps:**
1. Buka payment page
2. Lihat console: auto-check berjalan
3. Close tab atau navigate away
4. Auto-check otomatis berhenti (cleanup)

**Verification:**
- Check browser console
- Tidak ada error "Can't perform state update on unmounted component"

## Testing Nominal Unik

### Verify Unique Amount Generation

**Test 1: Multiple Orders**
1. Buka payment page → Note nominal (contoh: Rp 20.023)
2. Back ke landing page
3. Checkout lagi → Note nominal (contoh: Rp 20.047)
4. Verify: Nominal berbeda setiap kali

**Test 2: Range Validation**
1. Buat 10 orders
2. Catat semua nominal unik
3. Verify: Semua dalam range +1 sampai +50 dari base amount

### Copy Functionality

**Steps:**
1. Klik icon copy di samping nominal
2. Paste di notepad
3. Verify: Nominal yang di-copy sesuai dengan unique amount

## UI/UX Testing

### Payment Page Elements

**Checklist:**
- [ ] QR Code loading spinner
- [ ] QR Code displayed correctly
- [ ] Nominal unik displayed (large text)
- [ ] Yellow warning box dengan rincian
- [ ] Auto-check counter (X/24)
- [ ] Copy button dengan feedback
- [ ] Countdown timer (10 menit)
- [ ] E-wallet badges
- [ ] Instructions dengan nominal unik
- [ ] "Sudah Bayar" button

### Responsive Testing

**Desktop (>768px):**
- QR Code: 256x256px
- Text: Larger font sizes
- Layout: Centered, max-width 2xl

**Mobile (<768px):**
- QR Code: Responsive
- Text: Smaller but readable
- Layout: Full width dengan padding

## Performance Testing

### Auto-Check Load

**Monitor:**
1. Open browser DevTools → Network tab
2. Watch API calls to `/api/payment/check`
3. Verify: 1 call every 5 seconds
4. Verify: Stops after 24 calls or on success

**Expected:**
- No memory leaks
- Cleanup on unmount
- No duplicate requests

## Error Handling Testing

### Test API Failure

**Scenario 1: Create Payment Fails**
1. Stop dev server
2. Try checkout
3. Expected: Error message, no QR code

**Scenario 2: Check Payment Fails**
1. Modify API to return error
2. Auto-check should continue
3. Manual check should show error

## Integration Testing

### Full Flow Test

**Steps:**
1. Landing page → Fill form (optional)
2. Click "Checkout Sekarang"
3. Payment page loads
4. QR Code generated
5. Nominal unik displayed
6. Auto-check starts
7. Set mock status to 'paid'
8. Wait for auto-check
9. Redirect to success page
10. Credentials displayed

**Verify:**
- No console errors
- Smooth transitions
- Data persisted (localStorage)
- Auto-check cleanup

## Production Checklist

Before going live:

- [ ] Set `PAYMENT_AMOUNT=20000` in production `.env`
- [ ] Implement real payment gateway integration
- [ ] Setup database untuk store orders
- [ ] Implement webhook endpoint
- [ ] Remove mock status from check API
- [ ] Add proper error handling
- [ ] Setup monitoring & logging
- [ ] Test with real QRIS payments
- [ ] Verify nominal unik range (1-50)
- [ ] Test auto-check with real gateway
- [ ] Load testing untuk concurrent users

## Troubleshooting

### Auto-Check Not Working

**Check:**
1. Console errors?
2. API endpoint accessible?
3. orderId exists?
4. isLoading = false?

### Nominal Unik Not Showing

**Check:**
1. API response includes `baseAmount` & `uniqueAmount`?
2. State updated correctly?
3. Environment variable `PAYMENT_AMOUNT` set?

### QR Code Not Loading

**Check:**
1. `qrcode` package installed?
2. API `/api/payment/create` working?
3. QRCODE_TEXT in `.env.local`?
4. Image component configured correctly?

## Debug Commands

```bash
# Check environment variables
echo $PAYMENT_AMOUNT

# Test API endpoints
curl -X POST http://localhost:3000/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","phone":"08123456789"}'

curl -X POST http://localhost:3000/api/payment/check \
  -H "Content-Type: application/json" \
  -d '{"orderId":"ORDER-123"}'
```

## Notes

- Auto-check menggunakan `setInterval` dengan cleanup
- Nominal unik di-generate server-side untuk keamanan
- QR Code di-cache di client untuk performance
- Session data di `sessionStorage` (cleared on tab close)
- Form data di `localStorage` (persisted across sessions)

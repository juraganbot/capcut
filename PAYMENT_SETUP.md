# Payment Gateway Setup

## Environment Variables

Buat file `.env.local` di root project dengan isi:

```env
USERNAMEORKUT=nirvan
TOKEN=1229577:shySMzLJtYbBnlrHoGqwUfP7mD46KuX1
QRCODE_TEXT=00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214703239147837910303UMI51440014ID.CO.QRIS.WWW0215ID20232709941630303UMI5204481253033605802ID5923GRANOOL STORE OK12295776006KEDIRI61056421262070703A0163047127
```

## Cara Kerja Payment Flow

### 1. Landing Page → Payment Page
- User klik "Checkout Sekarang"
- Form data (email, phone) disimpan ke localStorage
- Redirect ke `/payment`

### 2. Payment Page
- Auto-generate QR Code QRIS
- Ada 2 opsi:
  - **Static QRIS**: Menggunakan `QRCODE_TEXT` dari environment (current)
  - **Dynamic QRIS**: Menggunakan Orkut API untuk generate QRIS per-order

#### Menggunakan Dynamic QRIS dengan Custom Amount (Default)
File: `app/api/payment/create/route.ts`
```typescript
// Option 2 is active (Dynamic QRIS with custom amount)
const qrCodeDataUrl = await generateDynamicQRCode(uniqueAmount, {
  size: 512,
  margin: 4,
});
```

**Cara Kerja:**
1. Base QRIS diambil dari `QRCODE_TEXT` environment
2. Nominal unik (baseAmount + 1-50) di-inject ke QRIS
3. CRC16 checksum dihitung ulang
4. QR Code di-generate dengan nominal yang tepat

**Keuntungan:**
- Setiap order punya nominal unik
- Pembayaran bisa auto-detected berdasarkan nominal
- Tidak perlu API call ke payment gateway
- QR Code langsung valid untuk nominal tersebut

#### Menggunakan Dynamic QRIS (Orkut API)
Uncomment code di `app/api/payment/create/route.ts`:
```typescript
// Option 1: Use Orkut API
const orkut = getOrkutClient();
const orderResult = await orkut.createOrder({
  amount,
  customerEmail: email,
  customerPhone: phone,
});
```

### 3. Check Payment Status
File: `app/api/payment/check/route.ts`

#### Mock Status (Default - untuk testing)
```typescript
const mockStatus: PaymentStatus = 'pending'; // Change to 'paid' for testing
```

Untuk testing success flow, ubah jadi:
```typescript
const mockStatus: PaymentStatus = 'paid';
```

#### Real Payment Check (Orkut API)
Uncomment code untuk menggunakan Orkut API:
```typescript
const orkut = getOrkutClient();
const statusResult = await orkut.checkPaymentStatus({ orderId });
```

### 4. Success Page
- Tampilkan credentials akun CapCut Pro
- Email & password bisa di-copy
- Next steps untuk login
- Support WhatsApp button

## Testing Payment Flow

### Test dengan Mock Status

1. **Test Pending Payment:**
   - Di `app/api/payment/check/route.ts`, set:
     ```typescript
     const mockStatus: PaymentStatus = 'pending';
     ```
   - Klik "Sudah Bayar" → akan muncul alert "Pembayaran belum terdeteksi"

2. **Test Successful Payment:**
   - Di `app/api/payment/check/route.ts`, set:
     ```typescript
     const mockStatus: PaymentStatus = 'paid';
     ```
   - Klik "Sudah Bayar" → redirect ke success page

### Test dengan Real Payment Gateway

1. Uncomment Orkut API code di:
   - `app/api/payment/create/route.ts` (untuk create order)
   - `app/api/payment/check/route.ts` (untuk check status)

2. Pastikan credentials Orkut sudah benar di `.env.local`

3. Implement webhook endpoint untuk menerima notifikasi pembayaran dari gateway

## File Structure

```
lib/
├── orkut.ts          # Orkut payment gateway client
└── qrcode.ts         # QR code generator utilities

app/
├── api/
│   └── payment/
│       ├── create/
│       │   └── route.ts    # Create payment order
│       └── check/
│           └── route.ts    # Check payment status
├── payment/
│   └── page.tsx      # Payment page with QRIS
└── success/
    └── page.tsx      # Success page with credentials
```

## Production Checklist

- [ ] Setup database untuk store orders
- [ ] Implement webhook endpoint untuk payment notifications
- [ ] Update order status di database saat payment berhasil
- [ ] Generate real credentials dari database/API
- [ ] Add proper error handling
- [ ] Add logging untuk tracking payments
- [ ] Setup monitoring untuk failed payments
- [ ] Test payment flow end-to-end
- [ ] Add rate limiting untuk API endpoints
- [ ] Secure API routes dengan authentication

## Notes

- QR Code generated menggunakan library `qrcode`
- Static QRIS cocok untuk testing atau fixed amount
- Dynamic QRIS lebih flexible dan bisa track per-order
- Countdown timer: 10 menit untuk selesaikan pembayaran
- LocalStorage digunakan untuk persist form data

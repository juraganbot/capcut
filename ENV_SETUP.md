# Environment Variables Setup

Update file `.env.local` dengan konfigurasi berikut:

```env
# Orkut Payment Gateway
USERNAMEORKUT=nirvan
TOKEN=1229577:shySMzLJtYbBnlrHoGqwUfP7mD46KuX1
QRCODE_TEXT=00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214703239147837910303UMI51440014ID.CO.QRIS.WWW0215ID20232709941630303UMI5204481253033605802ID5923GRANOOL STORE OK12295776006KEDIRI61056421262070703A0163047127

# Payment Settings
PAYMENT_AMOUNT=20000

# MongoDB
MONGODB_URI=mongodb+srv://waroengku:masuk123@capcut.wjl1mme.mongodb.net/?retryWrites=true&w=majority&appName=capcut

# Telegram Webhook
BOT_TOKEN=8040841376:AAGpKGf5d6k7whc3xtRjul7FukCJADmJAcQ
NOTIFICATION_GROUP_ID=-1002598164081

# Session Security
SESSION_SECRET=change-this-to-random-string-in-production
```

## Setup Instructions

1. Copy semua variable di atas ke `.env.local`
2. Restart development server: `npm run dev`
3. MongoDB akan auto-connect saat pertama kali digunakan
4. Telegram notifications akan otomatis terkirim untuk setiap order

## Testing

### 1. Test Order Creation
- Checkout dari landing page
- Check Telegram group untuk notifikasi order baru
- Check MongoDB untuk order data

### 2. Test Payment
- Bayar sesuai nominal unik
- Auto-check akan berjalan setiap 5 detik
- Saat payment detected, akan redirect ke success page
- Check Telegram untuk notifikasi payment success

### 3. Test Credentials
- Success page akan fetch credential dari database
- Credential akan ditampilkan di UI
- User bisa copy email & password

## MongoDB Collections

### Orders Collection
```json
{
  "orderId": "ORDER-xxx",
  "baseAmount": 20000,
  "uniqueAmount": 20123,
  "status": "pending|paid|expired|cancelled",
  "customerEmail": "user@example.com",
  "customerPhone": "08123456789",
  "qrCodeDataUrl": "data:image/png;base64,...",
  "credentialId": ObjectId("..."),
  "locked": false,
  "paidAt": ISODate("..."),
  "expiredAt": ISODate("..."),
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

### Credentials Collection
```json
{
  "email": "capcut@example.com",
  "password": "password123",
  "accountType": "CapCut Pro",
  "status": "available|used|expired|invalid",
  "usedBy": "user@example.com",
  "usedAt": ISODate("..."),
  "orderId": "ORDER-xxx",
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

## Add Credentials Manually

Via MongoDB Compass atau mongosh:

```javascript
db.credentials.insertMany([
  {
    email: "capcut1@example.com",
    password: "Password123",
    accountType: "CapCut Pro",
    status: "available",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: "capcut2@example.com",
    password: "Password456",
    accountType: "CapCut Pro",
    status: "available",
    createdAt: new Date(),
    updatedAt: new Date()
  }
])
```

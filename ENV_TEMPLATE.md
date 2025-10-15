# Environment Variables Template

Copy this to your `.env.local` file:

```env
# Orkut API Credentials
USERNAMEORKUT=your_orkut_username
TOKEN=your_orkut_token

# QRIS Configuration
QRCODE_TEXT=your_qris_string_here

# Proxy Configuration (Optional - untuk akses Orkut API dari luar Indonesia)
# Format: http://username:password@host:port
PROXY_URL=http://603a63846ac7e2f957a5__cr.id:8b4531dd03b1f4d7@gw.dataimpulse.com:823

# Payment Settings
PAYMENT_AMOUNT=20000

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/capcut

# Telegram Notifications
BOT_TOKEN=your_telegram_bot_token
NOTIFICATION_GROUP_ID=your_telegram_group_id

# Security
SESSION_SECRET=generate-random-32-character-string
NEXT_PUBLIC_ADMIN_PASSWORD=your-secure-admin-password

# Deployment
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

## Testing dengan harga berbeda:

Untuk testing dengan harga 100 rupiah:
```env
PAYMENT_AMOUNT=100
```

Untuk testing dengan harga 500 rupiah:
```env
PAYMENT_AMOUNT=500
```

**Note:** Nominal unik (1-50 rupiah) akan ditambahkan otomatis ke harga ini.
Contoh: Jika `PAYMENT_AMOUNT=20000`, maka total bisa jadi 20001 - 20050 rupiah.

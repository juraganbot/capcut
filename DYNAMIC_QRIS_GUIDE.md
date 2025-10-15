# Dynamic QRIS Implementation Guide

## Overview

Sistem ini menggunakan **Dynamic QRIS** yang dapat meng-inject nominal pembayaran langsung ke dalam QR Code QRIS. Setiap order mendapat nominal unik sehingga pembayaran dapat diidentifikasi secara otomatis.

## Cara Kerja

### 1. Base QRIS String

QRIS base string disimpan di environment variable `QRCODE_TEXT`:

```
00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214703239147837910303UMI51440014ID.CO.QRIS.WWW0215ID20232709941630303UMI5204481253033605802ID5923GRANOOL STORE OK12295776006KEDIRI61056421262070703A0163047127
```

### 2. Dynamic Amount Injection

Fungsi `createDynamicQRIS()` melakukan:

1. **Remove CRC**: Hapus 4 karakter terakhir (checksum)
2. **Update Format**: Ubah `010211` → `010212` (static → dynamic)
3. **Create Tag 54**: Format nominal sebagai tag QRIS
   ```
   Tag 54 = Transaction Amount
   Format: 54[length][amount]
   Contoh: 540620023 (untuk Rp 20.023)
   ```
4. **Insert Amount**: Sisipkan tag 54 sebelum tag 58 (Country Code)
5. **Calculate CRC16**: Hitung ulang checksum untuk validasi
6. **Return**: QRIS string baru dengan nominal yang tepat

### 3. CRC16 Calculation

```typescript
function toCRC16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
}
```

## Implementation

### File: `lib/qrcode.ts`

```typescript
export function createDynamicQRIS(baseQRIS: string, amount: number): string {
  // Remove last 4 characters (CRC) and update payload format
  const updatedQris = baseQRIS.slice(0, -4).replace('010211', '010212');
  
  // Create tag 54 (Transaction Amount)
  const amountStr = amount.toString();
  const tag54 = `54${amountStr.length.toString().padStart(2, '0')}${amountStr}`;
  
  // Find position to insert amount (before tag 58 - Country Code)
  const i58 = updatedQris.indexOf('5802ID');
  
  // Build new payload with amount
  const payload = updatedQris.slice(0, i58) + tag54 + updatedQris.slice(i58);
  
  // Add CRC16 checksum
  const qrString = payload + toCRC16(payload);
  
  return qrString;
}

export async function generateDynamicQRCode(amount: number, options?: QRCodeOptions): Promise<string> {
  const baseQRIS = getStaticQRIS();
  const dynamicQRIS = createDynamicQRIS(baseQRIS, amount);
  return generateQRCode(dynamicQRIS, options);
}
```

### File: `app/api/payment/create/route.ts`

```typescript
// Get base amount from environment and add unique code
const baseAmount = getBasePaymentAmount(); // e.g., 20000
const uniqueAmount = generateUniqueAmount(baseAmount); // e.g., 20023

// Generate dynamic QRIS with unique amount
const qrCodeDataUrl = await generateDynamicQRCode(uniqueAmount, {
  size: 512,
  margin: 4,
});
```

## QRIS Tag Structure

### Tag 54 - Transaction Amount

Format: `54[LL][VV...]`
- `54` = Tag ID untuk Transaction Amount
- `LL` = Length (2 digit, padded)
- `VV...` = Value (nominal dalam rupiah)

**Examples:**

| Amount | Tag 54 |
|--------|--------|
| Rp 100 | `5403100` |
| Rp 500 | `5403500` |
| Rp 20.000 | `54052000` |
| Rp 20.023 | `54052023` |
| Rp 149.000 | `540614900` |

### Complete QRIS Structure

```
[Payload Format] 0002
[Point of Initiation] 01[02]
[Merchant Account] 26...
[Transaction Amount] 54[LL][amount]  ← Dynamic part
[Country Code] 5802ID
[Merchant Name] 59...
[Merchant City] 60...
[Additional Data] 62...
[CRC] [XXXX]  ← Recalculated
```

## Testing

### Test 1: Verify Dynamic Amount

```typescript
const baseQRIS = "0002010102112667...47127"; // Your base QRIS
const amount = 20023;

const dynamicQRIS = createDynamicQRIS(baseQRIS, amount);

// Verify tag 54 exists
console.log(dynamicQRIS.includes('540520023')); // true

// Verify CRC is valid
const payload = dynamicQRIS.slice(0, -4);
const crc = dynamicQRIS.slice(-4);
console.log(crc === toCRC16(payload)); // true
```

### Test 2: Different Amounts

```bash
# Test dengan 100 rupiah
PAYMENT_AMOUNT=100 npm run dev

# Test dengan 500 rupiah
PAYMENT_AMOUNT=500 npm run dev

# Test dengan 20000 rupiah
PAYMENT_AMOUNT=20000 npm run dev
```

### Test 3: Scan QR Code

1. Generate QR Code dengan nominal 20023
2. Scan dengan e-wallet app
3. Verify: Nominal yang muncul = Rp 20.023 ✅

## Advantages

### 1. Unique Payment Identification
- Setiap order punya nominal unik (base + 1-50)
- Mudah identifikasi pembayaran berdasarkan nominal
- Auto-matching dengan database

### 2. No External API Required
- Tidak perlu call ke payment gateway untuk generate QRIS
- Faster response time
- Reduced API costs

### 3. Offline Capability
- QR Code bisa di-generate offline
- Base QRIS cukup disimpan di environment
- Hanya perlu internet untuk check payment status

### 4. Scalability
- Bisa handle banyak concurrent orders
- Setiap order guaranteed unique amount
- No rate limiting dari payment gateway

## Security Considerations

### 1. CRC16 Validation
- Setiap QRIS harus punya CRC16 valid
- E-wallet app akan reject jika CRC salah
- Mencegah tampering

### 2. Amount Range
- Unique code: 1-50 rupiah
- Cukup untuk identifikasi tanpa terlalu besar
- Predictable range untuk validation

### 3. Base QRIS Protection
- Simpan di environment variable (server-side)
- Jangan expose ke client
- Rotate secara berkala jika perlu

## Troubleshooting

### QR Code Invalid

**Problem:** E-wallet app tidak bisa scan QR Code

**Solutions:**
1. Verify base QRIS valid (test manual scan)
2. Check CRC16 calculation
3. Verify tag 54 format correct
4. Test dengan nominal sederhana (100, 500)

### Amount Not Showing

**Problem:** Scan QR tapi nominal tidak muncul

**Solutions:**
1. Verify `010212` (dynamic mode)
2. Check tag 54 position (before `5802ID`)
3. Verify amount format (no decimal, no separator)

### CRC Mismatch

**Problem:** CRC calculation tidak match

**Solutions:**
1. Verify payload tidak include CRC
2. Check CRC16 algorithm implementation
3. Test dengan known valid QRIS

## Migration from Static to Dynamic

### Before (Static QRIS):
```typescript
const staticQRIS = getStaticQRIS();
const qrCodeDataUrl = await generateQRCode(staticQRIS);
```

**Problem:**
- Semua order punya QR Code sama
- Tidak bisa auto-identify payment
- Manual matching required

### After (Dynamic QRIS):
```typescript
const qrCodeDataUrl = await generateDynamicQRCode(uniqueAmount);
```

**Benefits:**
- Setiap order unique QR Code
- Auto-identify via amount
- Better UX & automation

## Production Checklist

- [ ] Test QRIS dengan real e-wallet app
- [ ] Verify CRC16 calculation correct
- [ ] Test range nominal (100 - 1.000.000)
- [ ] Implement payment webhook
- [ ] Auto-match payment by amount
- [ ] Handle edge cases (duplicate amount)
- [ ] Monitor QRIS generation performance
- [ ] Setup error logging
- [ ] Backup base QRIS securely
- [ ] Document QRIS rotation procedure

## References

- QRIS Standard: Indonesian Payment System Blueprint
- Tag 54: EMV QR Code Specification
- CRC16-CCITT: Polynomial 0x1021

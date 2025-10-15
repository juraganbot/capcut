# Admin Dashboard Setup

## 🔐 Admin Password Configuration

Tambahkan password admin ke file `.env.local`:

```env
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_admin_password_here
```

**Default password (untuk development):** `admin123`

⚠️ **PENTING:** Ganti password default sebelum production!

---

## 📍 Akses Dashboard

URL: `http://localhost:3000/admin`

---

## ✨ Fitur Dashboard

### 1. **Authentication**
- Login dengan password admin
- Session tersimpan di localStorage
- Logout button

### 2. **CRUD Credentials**

**Create:**
- Tambah email & password baru
- Validasi email duplicate
- Auto-refresh list setelah tambah

**Read:**
- List semua credentials
- Status: Tersedia / Sudah Digunakan
- Info penggunaan (email customer, waktu)
- Counter total & tersedia

**Update:**
- Edit email & password
- Hanya bisa edit yang belum digunakan
- Save/Cancel button

**Delete:**
- Hapus credential
- Confirmation dialog
- Bisa hapus yang sudah/belum digunakan

### 3. **UI Features**

**Visual Status:**
- 🟢 Green card = Tersedia
- ⚪ Gray card = Sudah Digunakan

**Password Security:**
- Hidden by default (••••••••)
- Toggle show/hide per credential
- Eye icon button

**Responsive:**
- Mobile friendly
- Grid layout untuk desktop
- Stack layout untuk mobile

---

## 🎨 Design Consistency

Dashboard menggunakan style yang sama dengan landing page:
- White cards
- Black buttons
- Gray backgrounds
- Rounded corners
- Shadow effects
- Clean typography

---

## 🔒 Security Features

1. **Password Protection**
   - Admin harus login
   - Session di localStorage
   - Logout functionality

2. **Validation**
   - Email duplicate check
   - Required fields validation
   - Used credential protection

3. **Confirmation**
   - Delete confirmation dialog
   - Clear error messages

---

## 📊 Credential Status

**Tersedia (Available):**
- Belum pernah digunakan
- Bisa di-edit
- Bisa di-delete
- Akan di-assign ke customer baru

**Sudah Digunakan (Used):**
- Sudah di-assign ke customer
- Tidak bisa di-edit
- Bisa di-delete (jika perlu cleanup)
- Menampilkan info:
  - Email/phone customer
  - Waktu penggunaan

---

## 🚀 Usage Flow

1. **Admin Login**
   ```
   → Buka /admin
   → Input password
   → Click Login
   ```

2. **Tambah Credential**
   ```
   → Isi email & password
   → Click "Tambah Credential"
   → Credential masuk list dengan status "Tersedia"
   ```

3. **Edit Credential**
   ```
   → Click icon Edit (✏️) pada credential
   → Ubah email/password
   → Click Save (✓) atau Cancel (✗)
   ```

4. **Delete Credential**
   ```
   → Click icon Delete (🗑️)
   → Confirm dialog
   → Credential terhapus dari database
   ```

5. **View Password**
   ```
   → Click icon Eye (👁️)
   → Password terlihat
   → Click lagi untuk hide
   ```

---

## 🔄 Auto-Assignment System

Ketika customer checkout & bayar:
1. System cari credential dengan `isUsed: false`
2. Lock credential (prevent race condition)
3. Update credential:
   - `isUsed: true`
   - `usedBy: customer email/phone`
   - `usedAt: timestamp`
4. Kirim credential ke customer via Telegram
5. Tampil di dashboard dengan status "Sudah Digunakan"

---

## 📱 API Endpoints

**GET /api/admin/credentials**
- Fetch all credentials
- Sorted by newest first

**POST /api/admin/credentials**
- Create new credential
- Body: `{ email, password }`

**PUT /api/admin/credentials**
- Update credential
- Body: `{ id, email, password }`
- Only if not used

**DELETE /api/admin/credentials**
- Delete credential
- Body: `{ id }`

---

## 🎯 Best Practices

1. **Tambah Credential Sebelum Launch**
   - Siapkan minimal 10-20 credentials
   - Test semua credentials valid
   - Pastikan email/password benar

2. **Monitor Stock**
   - Check dashboard regularly
   - Tambah credential jika stock menipis
   - Alert jika tersedia < 5

3. **Cleanup**
   - Hapus credential yang invalid
   - Archive old used credentials
   - Keep database clean

4. **Security**
   - Ganti admin password
   - Jangan share password
   - Logout setelah selesai

---

## 🐛 Troubleshooting

**Problem:** Tidak bisa login
- **Solution:** Check NEXT_PUBLIC_ADMIN_PASSWORD di .env.local

**Problem:** Credential tidak muncul
- **Solution:** Check MongoDB connection, refresh page

**Problem:** Tidak bisa edit credential
- **Solution:** Credential sudah digunakan, tidak bisa di-edit

**Problem:** Error saat tambah
- **Solution:** Email sudah ada, gunakan email lain

---

## 📝 Example Credentials

Format yang baik:
```
Email: capcutpro001@gmail.com
Password: SecurePass123!

Email: capcutpro002@gmail.com
Password: SecurePass456!

Email: capcutpro003@gmail.com
Password: SecurePass789!
```

---

Dashboard siap digunakan! 🎉

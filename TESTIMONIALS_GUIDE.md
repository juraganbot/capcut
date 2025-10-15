# Cara Setting Testimoni Pelanggan

## Lokasi File
File testimoni ada di: `lib/testimonials.ts`

## Cara Edit Testimoni

1. Buka file `lib/testimonials.ts`
2. Edit array `testimonials` sesuai kebutuhan

### Format Data

```typescript
{
  name: "Nama Pelanggan",
  text: "Testimoni pelanggan di sini",
  rating: 5  // Rating 1-5 bintang
}
```

### Contoh Menambah Testimoni Baru

```typescript
export const testimonials: Testimonial[] = [
  {
    name: "Budi S.",
    text: "Mantap banget! Gak pernah logout sendiri, akunnya beneran private.",
    rating: 5
  },
  {
    name: "Siti R.",
    text: "Pelayanan cepet, 5 menit udah aktif. Worth it banget cuma 20rb!",
    rating: 5
  },
  {
    name: "Andi P.",
    text: "Udah 2 minggu pakai, lancar jaya. Template premiumnya keren semua.",
    rating: 5
  },
  // Tambah testimoni baru di sini
  {
    name: "Rina M.",
    text: "Testimoni baru di sini",
    rating: 5
  }
];
```

## Tips

- Gunakan bahasa yang santai dan natural
- Testimoni sebaiknya tidak terlalu panjang (1-2 kalimat)
- Rating bisa 1-5, tapi disarankan 4-5 untuk testimoni positif
- Nama bisa disingkat (contoh: "Budi S." atau "Siti R.")
- Testimoni akan otomatis muncul di landing page dalam 3 kolom (mobile: 1 kolom)

## Fitur Testimoni

✅ Responsive design (3 kolom di desktop, 1 kolom di mobile)
✅ Star rating visual (bintang kuning)
✅ Hover effect (shadow saat di-hover)
✅ Fade in animation saat page load
✅ Mudah di-edit tanpa ubah kode UI

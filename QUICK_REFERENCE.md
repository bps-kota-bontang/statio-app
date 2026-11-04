# 📋 Kartu Panduan Cepat Statio App

## Untuk Operator Instansi

### 🎯 Langkah Pengisian Data

```
1. Login → Menu "Tables"
2. Pilih tabel yang ditugaskan
3. Isi data sesuai indikator
4. (Opsional) Revisi data tahun lama
5. Tambahkan catatan jika perlu
6. Submit untuk review
```

### 📊 Status Tabel Anda

| Icon | Status | Artinya |
|------|--------|---------|
| 📝 | **Draft** | Masih bisa diedit |
| 📤 | **Submitted** | Sedang direview admin |
| ✅ | **Finalized** | Sudah disetujui |
| 🔄 | **Returned** | Perlu perbaikan |

### ⚡ Tips Cepat Selesai

- ✅ Isi data bertahap, save draft
- ✅ Beri catatan untuk data yang tidak biasa
- ✅ Cek kelengkapan sebelum submit
- ✅ Perhatikan deadline di dashboard
- ⚠️ Setelah submit, tidak bisa edit!

---

## Untuk Admin BPS

### Mengatur Year Offset Tabel

1. Buka `/collection/tables`, lalu pilih **Edit** pada tabel.
2. Isi **Year Offset** di bawah **Dimension** dengan bilangan bulat, lalu klik **Update**.
3. Tahun acuan dihitung sebagai `tahun berjalan + year_offset`: `-1` untuk
   tahun sebelumnya, `0` untuk tahun ini, dan `1` untuk tahun berikutnya.

Pengaturan ini menentukan tahun default tabel berdimensi ketika tahun tidak
dipilih secara eksplisit, serta awal pilihan empat tahun pada halaman tabel
dan review. Nilai yang didukung adalah -32768 sampai 32767 sesuai tipe kolom
database. Pengaturan hanya dapat diubah oleh admin dan tidak mengubah tahun
pada data yang sudah tersimpan.

### Mengatur Status Deprecated

Di `/collection/tables`, pilih **Edit** pada tabel. Centang **Deprecated** untuk
menandai tabel sebagai deprecated, atau hapus centang untuk mengaktifkannya
kembali, lalu klik **Update**. Status ini dikelola melalui form edit, bukan
tombol terpisah pada daftar tabel. Badge dan filter **Deprecated** tetap tersedia.

### 🔍 Workflow Review

```
1. Dashboard → Lihat tabel "Submitted"
2. Analysis → Pilih tabel untuk review
3. Cek:
   • Outlier (data melonjak?)
   • Missing data (masih kosong?)
   • Revisi data lama (sudah benar?)
4. Keputusan:
   • Return → Perlu perbaikan
   • Finalize → Sudah OK
```

### 📈 Dashboard Metrics

| Metric | Fungsi |
|--------|--------|
| **Total Tabel** | Jumlah semua tabel |
| **Selesai** | Tabel yang finalized |
| **Dalam Proses** | Tabel submitted/draft |
| **Instansi Tercepat** | Peringkat dinormalisasi |

### 🏆 Skor Dinormalisasi

```
Score = Kelengkapan (40%) +
        Kecepatan (30%) +
        Kualitas (20%) +
        Kompleksitas (10%)
```

**Adil untuk semua instansi!** 🎯

---

## 🆘 Troubleshooting

### Masalah Umum Operator

**❓ "Tidak bisa submit"**
- Cek: Apakah masih ada data kosong?
- Cek: Apakah koneksi internet stabil?

**❓ "Tabel dikembalikan admin"**
- Lihat catatan admin di tabel
- Perbaiki sesuai instruksi
- Submit ulang

**❓ "Data tahun lalu tidak muncul"**
- Gunakan filter tahun
- Hubungi admin jika tetap kosong

### Masalah Umum Admin

**❓ "Sistem deteksi outlier tapi data benar"**
- Beri catatan mengapa data tinggi/rendah
- Tetap finalize jika valid

**❓ "Operator komplain tabel dikembalikan"**
- Pastikan catatan jelas
- Komunikasi via telp/email jika perlu

---

## 📞 Kontak Cepat

**Technical Support:**
- 📧 support-statio@bps.go.id
- 📱 (0123) 456-7890

**Admin BPS:**
- 📧 admin-statio@bps.go.id

---

**💡 Pro Tip:**
Dashboard real-time! Refresh tiap menit. 
Pantau progres instansi Anda! 🚀

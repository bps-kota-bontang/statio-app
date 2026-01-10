# Panduan Workflow Pengisian Data Statistik BPS 2026

## Ringkasan Sistem

Aplikasi Statio dirancang untuk menggantikan proses pengisian data menggunakan Google Spreadsheet dengan sistem terintegrasi yang mendukung:
- Pengisian data oleh instansi (Januari-Februari)
- Revisi data tahun sebelumnya
- Labeling dan kategorisasi tabel
- Pengajuan revisi dimensi/kolom (perlu approval)
- Pemeriksaan outlier otomatis (antar tahun)
- Review dan verifikasi oleh admin BPS
- FGD untuk finalisasi akhir
- Penyusunan publikasi

---

## ⏰ Timeline Pengumpulan Data 2026

| Periode | Aktivitas | PIC |
|---------|-----------|-----|
| **Desember 2025** | Persiapan sistem & kredensial | Admin BPS |
| **Januari - Februari 2026** | **Pengumpulan data aktif** | Operator Dinas |
| **Awal Maret 2026** | Review & finalisasi | Admin BPS |
| **Pertengahan Maret 2026** | **FGD** (Focus Group Discussion) | BPS + Semua Dinas |
| **Akhir Maret 2026** | Penyusunan publikasi | Admin BPS |

> ⚠️ **PENTING:** Pengumpulan data **HANYA** berlangsung di **Januari-Februari**. Setelah itu sistem akan ditutup kecuali untuk perbaikan hasil FGD.

---

## Alur Kerja Lengkap

### 1️⃣ **Persiapan (Desember 2025 - Admin BPS)**

**Dilakukan oleh:** Admin BPS

**Aktivitas:**
- Admin membuat tabel-tabel yang perlu diisi untuk tahun 2026
- Assign tabel ke masing-masing dinas
- Set dimensi (0-2 dimensi) dan indikator untuk setiap tabel
- **Buat kredensial login untuk setiap dinas**
- Kirim kredensial ke masing-masing dinas

**Fitur yang digunakan:**
- `/collection/tables` - Buat dan kelola tabel
- `/collection/organizations` - Kelola dinas & assign tabel
- `/collection/indicators` - Kelola indikator statistik
- `/collection/dimensions` - Kelola dimensi data

**Output:**
- Email ke setiap dinas berisi:
  - Username & password
  - Link aplikasi
  - Panduan singkat
  - Deadline: **Akhir Februari 2026**

---

### 2️⃣ **Pengisian Data (Januari-Februari 2026 - Operator Dinas)**

**Dilakukan oleh:** Operator dari setiap dinas

**Periode:** **1 Januari - 28 Februari 2026** (2 bulan)

**Aktivitas:**

#### A. Login Pertama Kali
1. Login dengan **kredensial dari BPS** (username & password)
2. Ganti password pada login pertama (recommended)
3. Buka menu **Tables** → Lihat daftar tabel yang ditugaskan

#### B. Labeling Tabel (Kategorisasi)
1. Di halaman **Tables**, ada kolom **Labels**
2. Klik **Add Label** pada setiap tabel
3. Beri label sesuai bidang/kategori:
   - Contoh: "Kesehatan Ibu", "Pendidikan Dasar", "Infrastruktur Jalan"
   - Label memudahkan filter dan organisasi tabel
4. Satu tabel bisa punya banyak label

**Manfaat Label:**
- Cari tabel lebih cepat (filter by label)
- Kelompokkan tabel berdasarkan bidang
- Koordinasi antar bagian dalam dinas

#### C. Cek Missing Facts (Data Kosong)
1. Di halaman **Tables**, ada kolom **Missing Facts**
2. Angka menunjukkan berapa banyak data yang masih kosong
3. **PENTING:** Missing facts bisa dari:
   - Data tahun 2026 yang belum diisi
   - **Data tahun 2023-2025 yang masih kosong** ⚠️
4. Klik tabel → Sistem highlight cell yang kosong (warna merah/kuning)
5. **Prioritas:** Isi semua missing facts dulu sebelum submit

#### D. Mengisi Data Tahun Berjalan (2026)
1. Pilih tabel → Status awal: **Draft**
2. Isi data sesuai indikator dan dimensi (0-2 dimensi)
3. Sistem menampilkan:
   - Grid/tabel sesuai dimensi
   - Cell yang sudah/belum diisi
   - Preview real-time

#### E. Merevisi Data Tahun Sebelumnya (2023-2025)
1. Di tabel yang sama, gunakan **filter tahun**
2. Pilih tahun yang ingin direvisi (2023/2024/2025)
3. Edit data yang tidak sesuai
4. Sistem otomatis mencatat:
   - Siapa yang merevisi
   - Kapan direvisi
   - Nilai lama → Nilai baru
5. **WAJIB:** Tambahkan **catatan** kenapa data direvisi

#### F. Mengubah Nama Tabel
- Jika nama default tidak sesuai konteks dinas:
  - Contoh: "Data Kesehatan" → "Data Kesehatan Puskesmas & Pustu"
- Klik **Edit Table Name** di header tabel
- **NOTE:** Perubahan nama hanya untuk view dinas, tidak mengubah nama master

#### G. Pengajuan Revisi Dimensi/Kolom/Baris
**Kapan mengajukan?**
- Dimensi/kategori kurang sesuai dengan kondisi dinas
- Ada kategori yang perlu ditambah/dihapus
- Contoh: Dimensi "Jenis Puskesmas" perlu tambahan "Puskesmas Satelit"

**Cara mengajukan:**
1. Klik **Request Dimension Change** di tabel
2. Pilih jenis perubahan:
   - **Add Column/Row:** Tambah kategori baru
   - **Edit Column/Row:** Ubah nama kategori
   - **Delete Column/Row:** Hapus kategori
3. Isi form pengajuan:
   - Dimensi yang ingin diubah
   - Alasan perubahan
   - Detail perubahan yang diminta
4. Submit pengajuan

**Proses persetujuan:**
- Status: **Pending** → Menunggu review admin
- Admin review: **Approved** atau **Rejected**
- Jika **Approved:**
  - Kolom/baris baru muncul otomatis di tabel
  - Notifikasi dikirim ke operator
  - Operator bisa langsung isi data di kolom/baris baru
- Jika **Rejected:**
  - Alasan penolakan diberikan
  - Operator bisa ajukan ulang dengan perbaikan

**Timeline pengajuan:**
- **Deadline pengajuan:** **31 Januari 2026**
- Setelah tanggal tersebut, pengajuan tidak bisa diproses
- Admin butuh waktu review, jadi ajukan sedini mungkin!

#### H. Menambah Catatan (Notes)
- **SANGAT PENTING** untuk memudahkan review admin
- Kapan perlu catatan:
  - Data direvisi (wajib)
  - Data tidak ada/tidak tersedia
  - Data tampak anomali tapi valid (misal: program baru)
  - Informasi konteks penting

**Cara menambah catatan:**
1. Klik **Add Note** di bagian bawah tabel
2. Tulis catatan yang jelas dan informatif
3. Contoh catatan yang baik:
   - ✅ "Data 2023-2024 direvisi karena ada koreksi dari Puskesmas Baru"
   - ✅ "Data Januari 2026 melonjak karena program vaksinasi massal"
   - ✅ "Data tidak tersedia untuk kategori X karena program baru mulai Februari"
   - ❌ "Data direvisi" (terlalu singkat, tidak informatif)

#### I. Submit untuk Review
**Sebelum submit, pastikan:**
- ✅ Semua **missing facts** sudah diisi (atau diberi catatan jika memang tidak ada)
- ✅ Data tahun lama yang perlu direvisi sudah diperbaiki
- ✅ Catatan sudah ditambahkan untuk setiap revisi
- ✅ Pengajuan dimensi (jika ada) sudah diproses/approved
- ✅ Nama tabel sudah sesuai (jika perlu diubah)
- ✅ Label sudah ditambahkan

**Proses submit:**
1. Klik **Submit** di tabel
2. Sistem validasi:
   - Cek apakah masih ada missing facts
   - Jika ada, muncul warning (tetap bisa submit jika memang tidak ada data)
3. Status berubah: **Draft** → **Submitted**
4. Operator **tidak bisa edit lagi** sampai admin review
5. Sistem otomatis **mulai hitung outlier**

**Fitur yang digunakan:**
- `/tables` - Lihat semua tabel, labeling, cek missing facts
- `/tables/:id` - Edit data, revisi, submit
- Form pengajuan dimensi
- Form catatan

---

### 3️⃣ **Pemeriksaan Otomatis (Sistem)**

**Dilakukan oleh:** Sistem secara otomatis **segera setelah submit**

**Proses:**

#### A. Cek Outlier (Antar Tahun)
**Algoritma Outlier:**
- Sistem membandingkan data **antar tahun** untuk **dimensi yang sama**
- Contoh untuk tabel dengan 2 dimensi (Jenis Puskesmas × Bulan):
  - Bandingkan "Puskesmas A - Januari 2026" dengan "Puskesmas A - Januari 2025"
  - Bandingkan "Puskesmas A - Januari 2026" dengan "Puskesmas A - Januari 2024"
  - Dan seterusnya untuk setiap kombinasi dimensi

**Kriteria Outlier:**
- Perubahan > 50% dari tahun sebelumnya (threshold bisa diatur admin)
- Atau: Nilai di luar 3× standar deviasi dari rata-rata historis
- **NOTE:** Outlier tidak selalu salah! Bisa jadi karena:
  - Program baru
  - Perubahan kebijakan
  - Kondisi khusus (misal: pandemi, bencana)

**Dimensi yang Didukung:**
- **0 dimensi:** Satu nilai agregat (outlier dibanding tahun lalu saja)
- **1 dimensi:** Contoh: per Bulan, per Jenis Layanan
- **2 dimensi:** Contoh: Jenis Puskesmas × Bulan, Wilayah × Kategori Pasien

**Hasil:**
- Tabel ditandai **"Has Outliers"**
- Jumlah outlier dicatat
- Cell outlier di-highlight warna merah/orange di view admin

#### B. Cek Data Kosong (Missing Values)
- Sistem memeriksa setiap cell/fakta
- Termasuk data tahun 2023-2025 yang masih kosong
- Jika ada yang kosong → Tabel ditandai **"Has Missing Data"**
- Jumlah data kosong dicatat per tahun

**Exception:**
- Jika operator beri catatan "Data tidak tersedia", warning berkurang
- Tetap dicatat tapi tidak dianggap error

#### C. Cek Revisi Data Lama
- Sistem mencatat jika ada revisi data tahun 2023-2025
- Tabel ditandai **"Has Revisions"**
- Detail revisi disimpan:
  - Tahun yang direvisi
  - Dimensi yang direvisi
  - Nilai lama → Nilai baru
  - Catatan revisi (wajib)

**Output:**
- Status tetap **Submitted**
- Flag kualitas ditambahkan:
  - `outlier_facts_summary` (berapa outlier, dimensi mana)
  - `missing_facts_summary` (berapa kosong, tahun berapa)
  - `revision_facts_summary` (berapa revisi, tahun berapa)
- Notifikasi ke admin: "Ada tabel baru untuk direview"

---

### 4️⃣ **Review dan Analisis (Admin BPS)**

**Dilakukan oleh:** Admin BPS

**Aktivitas:**

#### A. Melihat Dashboard
- Buka **Dashboard** untuk overview keseluruhan:
  - Berapa tabel yang sudah submitted
  - Berapa tabel yang ada outlier/missing/revisi
  - Instansi mana yang belum mengumpulkan
  - Tren pengumpulan vs target

#### B. Review Tabel yang Submitted
1. Buka menu **Analysis** → **Table Review**
2. Filter tabel yang perlu direview:
   - Status: Submitted
   - Has Outliers
   - Has Missing Data
   - Has Revisions

3. Untuk setiap tabel, lakukan:

   **a. Cek Outlier:**


**Dilakukan oleh:** Admin BPS  
**Kapan:** Sepanjang periode **Januari-Februari 2026** (paralel dengan pengisian oleh dinas)  
**Tujuan:** Memastikan data yang masuk berkualitas **sebelum FGD** di Pertengahan Maret

---

**Tugas Admin:**

#### A. Review Permohonan Perubahan Dimensi/Kolom

**Prioritas Tertinggi** karena ada **deadline 31 Januari 2026**.

**Langkah:**
1. Buka menu **"Permohonan Perubahan Dimensi"**
2. Lihat list permohonan dengan status **"Pending"**
3. Untuk setiap permohonan:
   - Baca alasan dari instansi
   - Cek apakah perubahan masuk akal
   - Cek apakah sudah ada data untuk dimensi lama (kalau ada, data akan hilang/reset)
   
4. **Action:**
   - ✅ **Approve:** Dimensi/kolom berubah, instansi bisa lanjut isi data dengan struktur baru
   - ❌ **Reject:** Dimensi tetap, instansi harus isi dengan struktur lama
   
5. Beri catatan ke instansi (wajib, terutama jika reject)

**Notifikasi:**
- Operator instansi langsung dapat notifikasi hasil approve/reject
- Jika approve → Tabel berubah struktur, data lama (jika ada) ter-backup
- Jika reject → Tabel tetap, operator harus isi sesuai struktur awal

---

#### B. Review Outlier

**Untuk tabel dengan flag "Has Outliers":**

**Langkah:**
1. Buka tabel yang ditandai
2. Cell outlier otomatis di-highlight merah/orange
3. Periksa setiap outlier:
   - Bandingkan dengan data tahun lalu (2025, 2024, 2023)
   - Baca catatan instansi (jika ada)

4. Pertanyaan kunci:
   - Apakah outlier ini wajar? (program baru, perubahan kebijakan, kondisi khusus?)
   - Apakah ada catatan penjelasan dari instansi?
   - Apakah perlu konfirmasi lebih lanjut?

5. **Action:**
   - ✅ **Approve Outlier:** Tandai outlier sebagai valid (warna hijau/abu)
   - ⚠️ **Request Revision:** Kirim kembali ke instansi dengan catatan spesifik

**Contoh:**
- Outlier wajar: "Jumlah pasien COVID naik 200% di Januari 2024" → Approve
- Outlier perlu konfirmasi: "Puskesmas A: 0 pasien bulan Januari, tapi Desember ada 500" → Request Revision dengan catatan: "Mohon konfirmasi apakah Puskesmas tutup atau salah input?"

---

#### C. Review Data Kosong (Missing Facts)

**Untuk tabel dengan flag "Has Missing Data":**

**Langkah:**
1. Buka tabel yang ditandai
2. Cell kosong otomatis di-highlight kuning
3. Periksa apakah ada catatan dari instansi:
   - "Data tidak tersedia"
   - "Puskesmas tutup"
   - "Program belum berjalan"

4. Pertanyaan kunci:
   - Apakah data **memang tidak ada**? (cek catatan)
   - Atau instansi **lupa mengisi**?

5. **Action:**
   - ✅ **Approve:** Jika ada catatan valid → Data kosong dianggap wajar
   - ⚠️ **Request Revision:** Jika tidak ada catatan → Minta instansi isi atau beri penjelasan

**Exception:**
- Data historis (2023-2025) yang kosong lebih dimaklumi jika memang tidak ada arsip
- Data 2026 yang kosong harus dikonfirmasi

---

#### D. Review Revisi Data Lama (2023-2025)

**Untuk tabel dengan flag "Has Revisions":**

**Langkah:**
1. Buka tabel yang ditandai
2. Lihat **Revision Log**:
   - Tahun berapa yang direvisi?
   - Dimensi/cell mana?
   - Nilai lama → Nilai baru
   - Catatan revisi (wajib diisi operator)

3. Pertanyaan kunci:
   - Apakah revisi ini masuk akal?
   - Apakah ada catatan penjelasan yang cukup jelas?
   - Apakah revisi ini mencurigakan? (misal: data tiba-tiba "terlalu bagus")

4. **Action:**
   - ✅ **Approve:** Revisi valid → Data tahun lama terupdate
   - ⚠️ **Request Revision:** Revisi mencurigakan → Minta penjelasan lebih detail atau bukti

**Audit Trail:**
- Semua revisi data lama tercatat permanen
- Admin bisa lihat siapa, kapan, dan kenapa data direvisi

---

#### E. Finalisasi Tabel

**Setelah semua review selesai:**

**Status Transition:**
- Admin bisa ubah status tabel dari **Submitted** ke:
  - ✅ **Finalized:** Data sudah OK, siap dibawa ke FGD
  - ⚠️ **Request Revision:** Ada masalah, instansi harus perbaiki dulu

**Catatan:**
- Tabel yang **Finalized** tidak bisa diedit lagi oleh instansi (kecuali admin buka kembali)
- Target: Semua tabel **Finalized** sebelum **28 Februari 2026**
- Tabel yang belum Finalized di awal Maret akan jadi prioritas review admin

**Notifikasi:**
- Operator instansi dapat notifikasi otomatis jika ada **Request Revision**
- Notifikasi berisi detail masalah dan catatan dari admin
- Instansi bisa edit dan submit ulang

**Fitur yang digunakan:**
- `/dashboard` - Overview keseluruhan
- `/analysis` - Review tabel submitted
- `/analysis/:tableId` - Detail review per tabel
- `/collection/dimension-requests` - Review permohonan perubahan dimensi

---

### 5️⃣ **FGD (Focus Group Discussion)**

**Dilakukan oleh:** BPS + Seluruh Dinas/Instansi  
**Kapan:** **Pertengahan Maret 2026** (setelah periode pengumpulan selesai)  
**Lokasi:** Kantor BPS atau tempat yang ditentukan  
**Peserta:** Tim BPS + minimal 1 perwakilan dari setiap dinas

---

#### A. Tujuan FGD

**Validasi Final:**
- Memastikan semua data yang sudah **Finalized** benar-benar akurat
- Menyamakan persepsi antar dinas tentang definisi indikator
- Diskusi data outlier yang masih diragukan
- Klarifikasi data yang masih missing/kosong

**Perbaikan On-the-Spot:**
- Jika ada kesalahan ditemukan saat FGD → Bisa langsung diperbaiki
- Admin BPS bisa buka kembali tabel yang **Finalized** → Ubah ke **Draft**
- Operator dinas bisa edit di tempat (bawa laptop)
- Setelah perbaikan → Submit ulang → Admin langsung Finalize

---

#### B. Proses FGD

**1. Persiapan (Sebelum FGD):**
- Admin BPS siapkan:
  - Daftar tabel yang masih ada masalah
  - Daftar outlier yang belum jelas
  - Daftar missing data yang belum dijelaskan
  - Ringkasan performa setiap instansi

**2. Presentasi:**
- BPS presentasikan hasil sementara:
  - Berapa persen tabel sudah Finalized
  - Tren data 2023-2026 (ada anomali?)
  - Outlier yang perlu diskusi
  - Missing data yang perlu konfirmasi

**3. Diskusi Terbuka:**
- Setiap dinas bisa angkat tangan jika:
  - Ada kesalahan di data mereka
  - Ada pertanyaan tentang definisi indikator
  - Ada usulan perbaikan struktur tabel (untuk tahun depan)

**4. Perbaikan Data:**
- Untuk tabel yang perlu perbaikan:
  - Admin buka tabel (Finalized → Draft)
  - Operator edit di tempat
  - Submit ulang
  - Admin review dan Finalize langsung

**5. Finalisasi Akhir:**
- Setelah semua selesai → Admin kunci semua data
- Status semua tabel: **Finalized (Locked for Publication)**
- Tidak ada perubahan lagi setelah FGD

---

#### C. Output FGD

**Dokumen Berita Acara:**
- Daftar kehadiran
- Daftar tabel yang diperbaiki saat FGD
- Catatan penting (misal: usulan perubahan untuk tahun depan)
- Tanda tangan semua peserta

**Data yang Terkunci:**
- Semua tabel **Finalized**
- Siap untuk penyusunan publikasi
- Tidak bisa diedit lagi (kecuali ada persetujuan khusus dari Kepala BPS)

---

### 6️⃣ **Penyusunan Publikasi**

**Dilakukan oleh:** Tim Publikasi BPS  
**Kapan:** **Akhir Maret 2026**  
**Tujuan:** Kompilasi data dari semua dinas menjadi dokumen publikasi resmi

---

#### A. Proses Kompilasi

**Export Data:**
- Admin export semua tabel yang sudah **Finalized**
- Format: Excel, CSV, atau langsung ke sistem publikasi BPS
- Data meliputi:
  - Tahun 2023, 2024, 2025, 2026
  - Semua dimensi dan fakta
  - Metadata: nama tabel, instansi, tanggal finalisasi

**Penyusunan Narasi:**
- Tim publikasi buat narasi analisis:
  - Tren 4 tahun terakhir
  - Highlight: Daerah/instansi dengan capaian terbaik
  - Analisis outlier yang sudah divalidasi FGD
  - Rekomendasi kebijakan

**Visualisasi:**
- Chart/grafik untuk publikasi:
  - Tren antar tahun
  - Perbandingan antar dinas
  - Peta sebaran (jika relevan)

---

#### B. Review Internal BPS

**Sebelum Publikasi:**
- Draft publikasi direview oleh:
  - Kepala Seksi Statistik Sosial
  - Kepala BPS
  - Tim Quality Assurance

**Revisi Akhir:**
- Jika ada kesalahan ditemukan → Diperbaiki di draft
- **Tidak mengubah data di sistem** (data sudah locked)
- Hanya perbaikan narasi/visualisasi

---

#### C. Publikasi

**Rilis:**
- Publikasi diterbitkan di:
  - Website BPS
  - Buku cetak (jika ada)
  - Press release

**Timeline:**
- Target publikasi: **Akhir Maret 2026**
- Setelah publikasi → Data tahun 2026 menjadi data resmi BPS
- Data digunakan untuk perencanaan pembangunan daerah

---

### 7️⃣ **Peringkat dan Penghargaan (Admin BPS)**

**Dilakukan oleh:** Admin BPS (Otomatis di dashboard)  
**Kapan:** Sepanjang periode pengumpulan dan **diumumkan saat FGD**

**Sistem Peringkat:**

#### A. Metrik yang Dinormalisasi
Dashboard menampilkan **"Instansi Tercepat (Dinormalisasi)"** dengan mempertimbangkan:

1. **Kecepatan Pengisian:**
   - Rata-rata waktu dari tabel dibuka sampai submitted
   - Contoh: Dinas Kesehatan rata-rata 2.3 hari

2. **Tingkat Kelengkapan:**
   - Persentase tabel yang finalized vs total tabel
   - Contoh: 12 tabel ditugaskan, 11 finalized = 92%

3. **Kompleksitas Tabel:**
   - Tabel dengan banyak dimensi dan fakta diberi bobot lebih
   - Instansi dengan tabel kompleks tidak dirugikan

4. **Kualitas Data:**
   - Bonus: Tidak ada outlier yang bermasalah
   - Bonus: Tidak ada data yang dikembalikan admin
   - Penalti: Banyak revisi atau kesalahan

#### B. Skor Normalisasi
```
Normalized Score = 
  (Tingkat Kelengkapan × 40%) +
  (Kecepatan × 30%) +
  (Kualitas × 20%) +
  (Bonus Kompleksitas × 10%)
```

#### C. Peringkat di Dashboard
- Top 3 instansi tercepat ditampilkan
- Badge: 🥇 Emas, 🥈 Silver, 🥉 Bronze
- Info detail: Rata-rata waktu, persentase completion

**Pengumuman:**
- Peringkat sementara bisa dilihat di dashboard sepanjang Januari-Februari
- Peringkat final diumumkan saat **FGD Pertengahan Maret 2026**
- Instansi terbaik mendapat penghargaan/sertifikat dari BPS

**Manfaat:**
- Adil untuk semua instansi (tidak cuma lihat jumlah tabel)
- Motivasi instansi untuk cepat dan berkualitas
- Data untuk penghargaan akhir tahun
- Transparansi performa antar dinas

---

## Status Tabel dan Artinya

| Status | Artinya | Siapa yang Bisa Edit |
|--------|---------|---------------------|
| **Draft** | Tabel masih dalam pengisian | Operator Instansi |
| **Submitted** | Tabel sudah dikumpulkan, menunggu review | Tidak ada (kunci sementara) |
| **Finalized** | Tabel sudah disetujui admin | Tidak ada (kunci permanen) |

**Transition:**
```
Draft → Submit → Submitted → Finalize → Finalized
              ↑                ↓
              └─── Return ─────┘
```

---

## Aktivitas yang Dicatat Sistem

Sistem mencatat semua aktivitas untuk transparansi dan audit:

| Aktivitas | Deskripsi | Muncul di Dashboard |
|-----------|-----------|-------------------|
| `created` | Tabel baru dibuat oleh admin | ✅ |
| `updated` | Data tabel diubah oleh operator | ✅ |
| `submitted` | Operator submit untuk review | ✅ |
| `returned` | Admin mengembalikan ke operator | ✅ |
| `finalized` | Admin finalisasi tabel | ✅ |
| `revised` | Operator merevisi data tahun lama | ✅ |

---

## Perbedaan dengan Google Spreadsheet

| Aspek | Google Spreadsheet (Lama) | Statio App (Baru) |
|-------|-------------------------|-------------------|
| **Pengumpulan** | Manual request ke setiap instansi | Sistem assign tabel otomatis |
| **Revisi Data Lama** | Harus buka file lama terpisah | Dalam satu tabel, filter tahun |
| **Cek Outlier** | Manual, satu-satu | Otomatis oleh sistem |
| **Cek Data Kosong** | Manual scroll | Otomatis highlight |
| **Tracking Revisi** | Sulit dilacak | Sistem catat semua perubahan |
| **Catatan/Notes** | Di cell terpisah atau email | Langsung di form tabel |
| **Status Tabel** | Tidak jelas | Draft/Submitted/Finalized |
| **Peringkat Instansi** | Hitung manual Excel | Otomatis di dashboard (dinormalisasi) |
| **Audit Trail** | Tidak ada | Lengkap (siapa, kapan, apa) |

---

## Tips untuk Operator Instansi

### ✅ Best Practices
1. **Manfaatkan fitur Label:** Kategorikan tabel berdasarkan bidang untuk memudahkan tracking
2. **Prioritaskan Missing Facts:** Isi data yang kosong dulu (cek kolom Missing Facts)
3. **Isi data secara bertahap:** Tidak perlu sekaligus, save draft dulu
4. **Beri catatan jika ada anomali:** Bantu admin paham konteksnya (misal: "Puskesmas tutup renovasi")
5. **Ajukan perubahan dimensi SEGERA:** Deadline 31 Januari 2026, jangan tunggu akhir bulan
6. **Cek ulang sebelum submit:** Setelah submit, tidak bisa edit sampai admin review
7. **Revisi data lama jika perlu:** Jangan ragu update data tahun 2023-2025, tapi WAJIB beri catatan
8. **Perhatikan deadline:** Target selesai **28 Februari 2026** untuk persiapan FGD

### ⚠️ Hindari
1. **Submit tanpa cek Missing Facts:** Pastikan data yang kosong memang tidak ada, beri catatan
2. **Merevisi data lama tanpa catatan:** Admin akan menolak jika tidak ada penjelasan
3. **Mengabaikan tabel yang dikembalikan:** Prioritaskan perbaikan segera
4. **Ajukan perubahan dimensi tanpa alasan jelas:** Admin butuh justifikasi kuat
5. **Ganti nama tabel sembarangan:** Gunakan nama yang deskriptif dan konsisten

---

## Tips untuk Admin BPS

### ✅ Best Practices
1. **Prioritaskan review permohonan dimensi:** Deadline 31 Januari, jangan sampai telat approve/reject
2. **Review rutin:** Jangan tunggu akhir Februari, review bertahap sepanjang Januari-Februari
3. **Komunikasi dengan operator:** Jika ada outlier mencurigakan, hubungi instansi dulu sebelum return
4. **Catat alasan spesifik jika return:** "Data outlier perlu konfirmasi" lebih baik dari "Ada kesalahan"
5. **Approve outlier yang valid:** Jangan otomatis return semua outlier, baca catatannya
6. **Finalisasi bertahap:** Target semua Finalized sebelum 28 Februari 2026
7. **Monitor dashboard:** Lihat instansi yang tertinggal, kontak langsung jika perlu
8. **Siapkan FGD dengan baik:** List semua masalah yang perlu diskusi kelompok

### ⚠️ Hindari
1. **Return tanpa penjelasan spesifik:** "Ada kesalahan" tidak membantu, sebutkan cell/dimensi mana
2. **Terlalu ketat dengan outlier:** Outlier ≠ Salah. Bisa jadi memang ada program baru
3. **Reject permohonan dimensi tanpa diskusi:** Telepon dulu, pahami kebutuhan instansi
4. **Finalisasi terlalu cepat tanpa cek lengkap:** Lebih baik teliti dari awal daripada buka lagi saat FGD
5. **Mengabaikan revisi data lama:** Cek audit trail, pastikan revisi masuk akal

---

## Frequently Asked Questions (FAQ)

### Untuk Operator Instansi

**Q: Apakah saya bisa edit data setelah submit?**  
A: Tidak bisa, kecuali admin mengembalikan tabel ke status Draft. Pastikan data sudah lengkap sebelum submit.

**Q: Bagaimana cara merevisi data tahun 2023-2025?**  
A: Buka tabel yang sama, gunakan filter tahun untuk pilih tahun yang mau direvisi, lalu edit. Sistem akan catat sebagai revisi. **WAJIB isi catatan revisi.**

**Q: Apa itu kolom "Missing Facts"?**  
A: Kolom yang menunjukkan data mana yang masih kosong (baik tahun 2026 maupun 2023-2025). Prioritaskan mengisi data yang kosong ini dulu sebelum submit.

**Q: Bagaimana cara mengajukan perubahan dimensi/kolom?**  
A: Di halaman edit tabel, ada tombol **"Ajukan Perubahan Struktur"**. Isi alasan dengan jelas. **Deadline 31 Januari 2026.**

**Q: Apa yang terjadi jika permohonan perubahan dimensi ditolak?**  
A: Struktur tabel tetap seperti semula. Admin akan beri catatan alasan penolakan. Anda harus mengisi dengan struktur yang ada.

**Q: Apakah saya harus mengisi semua data sekaligus?**  
A: Tidak, Anda bisa save sebagai Draft dan lanjutkan nanti. Tapi pastikan selesai sebelum **28 Februari 2026.**

**Q: Apa yang terjadi jika saya telat submit?**  
A: Tidak ada penalti sistem, tapi:
- Dashboard akan menunjukkan instansi Anda tertinggal dari target
- Peringkat instansi Anda turun
- Data Anda mungkin tidak sempat direview sebelum FGD

**Q: Apa fungsi Label tabel?**  
A: Untuk kategorikan tabel berdasarkan bidang (misal: "Kesehatan Ibu dan Anak", "Puskesmas", "Rumah Sakit"). Memudahkan Anda mengelompokkan tabel yang banyak.

**Q: Apakah saya wajib hadir FGD?**  
A: Ya, minimal 1 perwakilan dari instansi Anda. FGD untuk validasi final dan perbaikan on-the-spot jika ada masalah.

---

### Untuk Admin BPS

**Q: Bagaimana sistem mendeteksi outlier?**  
A: Sistem membandingkan data **antar tahun untuk dimensi yang sama**. Contoh: "Puskesmas A - Januari 2026" dibanding "Puskesmas A - Januari 2025". Jika perubahan >50% (atau di luar 3× std dev), ditandai outlier.

**Q: Apakah semua outlier harus dikembalikan?**  
A: **TIDAK.** Outlier tidak selalu salah. Bisa jadi karena:
- Program baru (misal: screening gratis → jumlah pasien naik drastis)
- Perubahan kebijakan (misal: BPJS gratis untuk anak → pasien naik)
- Kondisi khusus (misal: bencana, pandemi)
- Cek catatan dari operator dulu. Jika ada penjelasan wajar → Approve Outlier.

**Q: Apakah saya bisa edit data yang sudah finalized?**  
A: Tidak disarankan. Jika benar-benar perlu (misal: kesalahan fatal ditemukan saat FGD), Anda bisa buka kembali tabel (Finalized → Draft), tapi harus ada persetujuan Kepala BPS.

**Q: Bagaimana cara menentukan peringkat yang adil?**  
A: Dashboard menggunakan skor dinormalisasi (0-100) yang mempertimbangkan:
- **Kelengkapan** (40%): Berapa tabel sudah Finalized
- **Kecepatan** (30%): Rata-rata waktu pengisian
- **Kualitas** (20%): Tidak ada return, tidak ada outlier bermasalah
- **Kompleksitas** (10%): Bonus untuk instansi dengan tabel kompleks (banyak dimensi)

**Q: Apa yang harus dibahas di FGD?**  
A: 
- Tabel yang masih ada masalah (belum Finalized)
- Outlier yang masih diragukan
- Missing data yang belum dijelaskan
- Klarifikasi definisi indikator antar dinas
- Usulan perbaikan untuk tahun depan

**Q: Bagaimana menangani permohonan perubahan dimensi?**  
A:
1. **Approve** jika: Alasan jelas, perubahan masuk akal, tidak mengganggu komparabilitas data
2. **Reject** jika: Alasan tidak jelas, perubahan merusak struktur, atau sudah ada banyak data dengan struktur lama
3. **WAJIB beri catatan** terutama jika reject
4. **Deadline 31 Januari**, jangan sampai telat karena instansi perlu waktu isi data dengan struktur baru

**Q: Apa yang terjadi setelah FGD?**  
A: Semua data **locked for publication**. Tidak bisa diedit lagi. Data siap dikompilasi untuk publikasi akhir Maret 2026.

---

## Kontak Support

Jika ada pertanyaan atau masalah teknis:
- **Email:** support-statio@bps.go.id
- **Telepon:** (0123) 456-7890
- **Jam Kerja:** Senin-Jumat, 08:00-16:00

---

**Versi Dokumen:** 1.0  
**Terakhir Diupdate:** 22 November 2025  
**Untuk Tahun:** 2026

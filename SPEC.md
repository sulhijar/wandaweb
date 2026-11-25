# SPEC.md — Spesifikasi Sistem Aplikasi Web **HalalExpl Aceh**

**Versi Dokumen:** 1.0 (MVP)  
**Tanggal:** 24 November 2026  
**Peran Penyusun:** System Analyst & Software Engineer  
**Domain:** Pariwisata Halal & Ekonomi Kreatif UMKM Provinsi Aceh  

---

## 1. Tujuan (Objectives)

**HalalExpl Aceh** adalah aplikasi web pariwisata halal yang dirancang untuk membantu wisatawan merencanakan dan menjalani perjalanan yang nyaman, informatif, serta sesuai prinsip ramah Muslim di wilayah Provinsi Aceh (meliputi Banda Aceh, Sabang, Aceh Besar, Aceh Tengah, dan Bener Meriah).

Tujuan utama pengembangan sistem ini adalah:
1. **Sentralisasi Informasi Wisata Ramah Muslim:** Menyediakan direktori destinasi wisata, fasilitas ibadah, kuliner halal, produk UMKM lokal, dan akomodasi ramah Muslim secara terstruktur dan mudah dicari.
2. **Transparansi Status Kehalalan & Verifikasi Data:** Memisahkan secara tegas antara **status sertifikasi halal resmi** (yang diverifikasi melalui otoritas berwenang seperti BPJPH / MPU Aceh) dengan **fasilitas ramah Muslim** (ketersediaan mushalla, tempat wudhu, arah kiblat, dan layanan bebas alkohol), serta menandai data awal yang belum diverifikasi secara lapangan.
3. **Perencanaan Perjalanan Mandiri (1–5 Hari):** Memberikan alat bantu interaktif berupa penyusun rencana perjalanan (*Travel Itinerary Planner*), kalkulator estimasi anggaran otomatis, dan sistem rekomendasi paket wisata berbasis aturan (*rule-based filtering*).
4. **Pemberdayaan UMKM Lokal (Simulasi):** Membuka kanal akses langsung kepada pelaku usaha kuliner, kriya, dan akomodasi melalui tautan pesan WhatsApp terstruktur dalam mode demo, serta menyediakan dashboard pengelolaan data (CRUD) berbasis penyimpanan peramban (`localStorage`).

---

## 2. Pengguna (Target Users)

| Peran Pengguna | Kebutuhan Utama | Fitur Kunci yang Digunakan |
| :--- | :--- | :--- |
| **Wisatawan Domestik** | Mencari referensi destinasi unggulan Aceh, lokasi mushalla/masjid terdekat, estimasi biaya keluarga dalam Rupiah, dan penyusunan rute 1–5 hari. | Pencarian & filter katalog, kalkulator anggaran, itinerary planner, peta ilustratif, favorit. |
| **Wisatawan Mancanegara** | Membutuhkan panduan wisata berbahasa Inggris dengan informasi budaya lokal, kepastian makanan halal, navigasi Google Maps, dan paket terkurasi. | Pengalih bahasa (ID/EN), rekomendasi paket wisata berbasis minat & bujet, tautan Google Maps. |
| **Pelaku UMKM Pariwisata** | Menampilkan produk kuliner, kopi, suvenir, atau penginapan syariah lengkap dengan status sertifikasi halal dan kanal kontak cepat. | Katalog Kuliner/UMKM & Akomodasi, informasi verifikasi sertifikasi halal, tombol kontak WhatsApp demo. |
| **Pengelola Informasi Destinasi** | Menambah, memperbarui, atau mengoreksi data destinasi, kuliner, akomodasi, dan paket wisata secara cepat untuk uji coba tata kelola konten. | Dashboard Demo CRUD (Tambah, Edit, Hapus, Reset Data Awal) berbasis `localStorage`. |

---

## 3. Daftar Fitur MVP

1. **Landing Page Editorial Wisata Aceh:** Informasi pengantar nilai wisata Aceh, sorotan destinasi utama, ringkasan cakupan 5 wilayah, dan navigasi cepat.
2. **Katalog Minimal 12 Destinasi Wisata (14 Data Awal):** Mencakup Banda Aceh, Sabang, Aceh Besar, Aceh Tengah, dan Bener Meriah lintas kategori **Religi, Alam, Bahari, Sejarah, Budaya, dan Kuliner**.
3. **Halaman/Modal Detail Destinasi:** Foto ilustrasi/aset lokal, deskripsi, alamat, estimasi biaya (simulasi), daftar fasilitas umum, dan status verifikasi lapangan.
4. **Informasi Fasilitas Ibadah & Layanan Ramah Muslim:** Detail ketersediaan masjid/mushalla, tempat wudhu terpisah, arah kiblat, serta panduan etika berpakaian dan waktu shalat.
5. **Katalog Kuliner Halal & Produk UMKM Lokal:** Daftar kuliner khas Aceh dan produk UMKM (kopi Gayo, kue tradisional, kriya) dengan rentang harga simulasi dan kontak simulasi.
6. **Katalog Akomodasi Ramah Muslim:** Pilihan penginapan di 5 wilayah dengan harga per malam (simulasi), fasilitas umum, dan fasilitas ramah Muslim (perlengkapan shalat, arah kiblat, kebijakan syariah).
7. **Status Verifikasi Sertifikasi Halal:** Penandaan eksplisit status sertifikasi (`Tersertifikasi Halal - Simulasi`, `Dalam Proses Verifikasi`, atau `Klaim Mandiri / Belum Tersertifikasi Resmi`) beserta sumber verifikasinya, terpisah dari label *Ramah Muslim*.
8. **Pencarian, Filter & Sorting:** Pencarian kata kunci real-time, filter wilayah (5 kab/kota), filter kategori (6 kategori), dan pengurutan (Unggulan, Nama A–Z, Biaya Terendah, Biaya Tertinggi).
9. **Peta Ilustratif SVG & Tautan Google Maps:** Peta vektor interaktif wilayah Aceh (Banda Aceh, Sabang, Aceh Besar, Aceh Tengah, Bener Meriah) untuk memfilter wilayah secara visual serta tautan eksternal Google Maps tanpa API key.
10. **Favorit Wisatawan:** Menyimpan dan menghapus destinasi, kuliner, maupun akomodasi favorit ke dalam `localStorage`.
11. **Travel Itinerary Planner (1–5 Hari):** Membuat rencana perjalanan kustom (nama perjalanan, tanggal mulai, durasi 1–5 hari, jumlah wisatawan) serta menambah/menghapus aktivitas per hari dari katalog.
12. **Kalkulator Estimasi Anggaran Perjalanan:** Menghitung estimasi total biaya secara real-time berdasarkan tiket aktivitas, estimasi konsumsi harian, akomodasi per malam, jumlah wisatawan, dan durasi hari (ditandai sebagai estimasi simulasi).
13. **Rekomendasi Paket Wisata (Rule-Based Filtering):** Menyaring dan mengurutkan paket wisata berdasarkan minat kategori, durasi maksimal (1–5 hari), dan batas anggaran per wisatawan, lengkap dengan tombol terapkan ke itinerary.
14. **Tombol Kontak WhatsApp Mode Demo:** Menghasilkan pratinjau pesan terformat untuk menghubungi pelaku UMKM atau pengelola akomodasi/wisata menggunakan nomor kontak simulasi nonpribadi.
15. **Dukungan Dwibahasa (Indonesia & Inggris):** Pengalihan bahasa (`ID` / `EN`) secara instan untuk seluruh antarmuka dan navigasi, tersimpan di `localStorage`.
16. **Dashboard Demo CRUD:** Antarmuka pengelolaan untuk menambah, mengubah, dan menghapus entitas Destinasi, Kuliner, Akomodasi, dan Paket Wisata, disertai fitur reset ke data awal.
17. **Persistensi Lokal (`localStorage`):** Penyimpanan seluruh favorit, daftar itinerary, data katalog hasil CRUD, serta konfigurasi bahasa di sisi klien tanpa server backend maupun sistem login palsu.

---

## 4. Data Model

Seluruh entitas disimpan dalam format JSON pada `localStorage` dengan prefix `halalexpl_aceh_v1_*`.

### 4.1 `Destinasi`
| Field | Tipe | Keterangan |
| :--- | :--- | :--- |
| `id` | `string` | Pengenal unik destinasi (mis. `dest-baiturrahman`) |
| `nama` | `string` | Nama destinasi wisata |
| `kategori` | `'Religi' \| 'Alam' \| 'Bahari' \| 'Sejarah' \| 'Budaya' \| 'Kuliner'` | Kategori utama wisata |
| `wilayah` | `'Banda Aceh' \| 'Sabang' \| 'Aceh Besar' \| 'Aceh Tengah' \| 'Bener Meriah'` | Wilayah administratif |
| `deskripsi` | `string` | Deskripsi ringkas dan konteks wisata |
| `imageUrl` | `string` | Path aset gambar lokal atau ilustrasi SVG |
| `alamat` | `string` | Alamat atau lokasi geografis |
| `mapsUrl` | `string` | Tautan Google Maps query tanpa API key |
| `estimasiBiaya` | `number` | Estimasi biaya tiket/aktivitas per orang dalam IDR (simulasi) |
| `fasilitas` | `string[]` | Fasilitas wisata umum (parkir, pemandu, toilet, dll.) |
| `fasilitasIbadah` | `string[]` | Fasilitas ibadah & ramah Muslim (mushalla, wudhu terpisah, dll.) |
| `unggulan` | `boolean` | Penanda destinasi sorotan utama |
| `statusVerifikasiData` | `'Terverifikasi Referensi' \| 'Data Awal - Perlu Verifikasi Lapangan'` | Transparansi status keakuratan data destinasi |

### 4.2 `Kuliner`
| Field | Tipe | Keterangan |
| :--- | :--- | :--- |
| `id` | `string` | Pengenal unik item kuliner/UMKM |
| `nama` | `string` | Nama hidangan atau produk UMKM |
| `kategori` | `'Hidangan Utama' \| 'Kopi & Minuman' \| 'Kue Tradisional' \| 'Produk UMKM'` | Sub-kategori kuliner/UMKM |
| `wilayah` | `string` | Wilayah asal/lokasi UMKM |
| `harga` | `number` | Estimasi harga satuan/porsi dalam IDR (simulasi) |
| `imageUrl` | `string` | Path aset lokal / SVG fallback |
| `statusSertifikasiHalal` | `'Tersertifikasi Halal' \| 'Dalam Proses' \| 'Belum Tersertifikasi Resmi'` | Status kehalalan produk secara eksplisit |
| `sumberVerifikasi` | `string` | Sumber klaim/verifikasi (mis. `Simulasi Data BPJPH / MPU Aceh` atau `Klaim Mandiri Pelaku Usaha`) |
| `kontak` | `string` | Nomor WhatsApp demo simulasi (`+62 811-0000-XXXX`) |

### 4.3 `Akomodasi`
| Field | Tipe | Keterangan |
| :--- | :--- | :--- |
| `id` | `string` | Pengenal unik akomodasi |
| `nama` | `string` | Nama penginapan/villa/homestay |
| `wilayah` | `string` | Wilayah lokasi akomodasi |
| `hargaPerMalam` | `number` | Estimasi tarif per malam dalam IDR (simulasi) |
| `fasilitas` | `string[]` | Fasilitas umum (Wi-Fi, AC, sarapan, parkir) |
| `fasilitasRamahMuslim` | `string[]` | Fasilitas ramah Muslim (alat shalat, penunjuk kiblat, bebas alkohol, privasi keluarga) |
| `imageUrl` | `string` | Path aset lokal / SVG fallback |
| `kontak` | `string` | Nomor WhatsApp demo simulasi |

### 4.4 `PaketWisata`
| Field | Tipe | Keterangan |
| :--- | :--- | :--- |
| `id` | `string` | Pengenal unik paket wisata |
| `nama` | `string` | Judul paket wisata |
| `durasi` | `number` | Durasi hari (1–5 hari) |
| `daftarDestinasi` | `string[]` | Array berisi `id` destinasi yang termasuk |
| `estimasiBiaya` | `number` | Estimasi biaya paket per wisatawan dalam IDR (simulasi) |
| `deskripsi` | `string` | Ringkasan pengalaman dan kecocokan minat |
| `kategoriMinat` | `string[]` | Tag kategori untuk pencocokan rule-based |

### 4.5 `Itinerary`
| Field | Tipe | Keterangan |
| :--- | :--- | :--- |
| `id` | `string` | Pengenal unik rencana perjalanan |
| `namaPerjalanan` | `string` | Nama rencana perjalanan (mis. `Jelajah Banda Aceh - Sabang`) |
| `tanggalMulai` | `string` | Tanggal mulai format `YYYY-MM-DD` |
| `jumlahHari` | `number` | Durasi perjalanan (1 sampai 5 hari) |
| `jumlahWisatawan` | `number` | Jumlah peserta perjalanan |
| `daftarAktivitas` | `Array<{ id: string; hariKe: number; itemId: string; tipeItem: 'destinasi' \| 'kuliner' \| 'akomodasi'; nama: string; wilayah: string; estimasiBiaya: number; catatan: string }>` | Daftar aktivitas terstruktur per hari |
| `totalAnggaran` | `number` | Total estimasi anggaran hasil kalkulasi |

### 4.6 `Favorit`
| Field | Tipe | Keterangan |
| :--- | :--- | :--- |
| `id` | `string` | Pengenal unik entri favorit |
| `itemId` | `string` | ID dari Destinasi, Kuliner, atau Akomodasi |
| `tipeItem` | `'destinasi' \| 'kuliner' \| 'akomodasi'` | Jenis entitas yang difavoritkan |
| `tanggalDitambahkan` | `string` | Timestamp ISO tanggal penyimpanan |

---

## 5. Nonfunctional Requirements (NFR)

1. **Kinerja & Ketergantungan Nol pada Backend:** Aplikasi berjalan sepenuhnya di sisi klien dengan waktu muat awal cepat (< 1,5 detik pada jaringan lokal) dan penyaringan katalog instan (< 50 ms). Prototipe single-HTML dapat langsung dijalankan melalui `file://` maupun server statis tanpa proses build atau API eksternal.
2. **Desain Responsif & Aksesibilitas:** Tampilan beradaptasi mulus pada layar desktop (1440px), tablet, dan ponsel pintar (360px+), dengan kontras teks memenuhi standar WCAG AA (≥ 4,5:1), fokus keyboard yang terlihat, dan ukuran target sentuh minimal 40px.
3. **Kepatuhan Etika Informasi & Kehalalan:**
   - Dilarang mengklaim produk memiliki sertifikasi halal resmi tanpa sumber verifikasi eksplisit.
   - Perbedaan antara **sertifikasi halal resmi** dan **layanan ramah Muslim** wajib dijelaskan secara visual dan tekstual.
   - Dilarang menampilkan ulasan atau rating bintang wisatawan fiktif seolah-olah ulasan nyata.
   - Seluruh angka harga dan nomor telepon wajib diberi keterangan **Simulasi / Estimasi**.
4. **Keamanan & Privasi:** Tidak menyimpan API key, kredensial, atau data pribadi nyata pengguna. Seluruh input dari Dashboard CRUD disanitasi sebelum dirender ke DOM untuk mencegah injeksi skrip (XSS).
5. **Keandalan Penyimpanan Lokal:** Pembacaan dan penulisan `localStorage` dilindungi blok `try/catch` serta validasi struktur skema dengan opsi pemulihan data awal (*Reset Demo Data*).

---

## 6. Risiko & Mitigasi

| Risiko | Dampak | Strategi Mitigasi |
| :--- | :--- | :--- |
| **Salah paham terhadap status halal kuliner/UMKM** | Wisatawan mengira produk bertanda "Ramah Muslim" sudah bersertifikat halal resmi BPJPH/MPU. | Memisahkan label "Sertifikasi Halal" (dengan keterangan sumber & status verifikasi) dari label "Fasilitas Ramah Muslim", disertai catatan edukatif. |
| **Ketidakakuratan estimasi biaya & kontak simulasi** | Pengguna mengira harga atau nomor WhatsApp demo merupakan tarif/kontak operasional tetap. | Memberikan penanda eksplisit "Estimasi Simulasi" pada harga dan dialog konfirmasi "Mode Demo" sebelum membuka tautan WhatsApp. |
| **Kehilangan data akibat pembersihan cache browser** | Data itinerary atau hasil CRUD pengguna di `localStorage` terhapus. | Menyediakan fungsi ekspor ringkasan itinerary (salin/unduh JSON atau teks) serta notifikasi bahwa penyimpanan bersifat lokal pada peramban. |
| **Keterbatasan akses Google Maps jika offline** | Tautan Google Maps tidak terbuka saat perangkat tidak terhubung internet. | Menyediakan peta ilustratif SVG luring (*offline-ready*) sebagai panduan orientasi wilayah antar 5 kabupaten/kota. |

---

## 7. Out-of-Scope (Di Luar Cakupan MVP)

- Sistem autentikasi, registrasi akun wisatawan/UMKM, dan otorisasi berbasis server.
- Pemrosesan transaksi pembayaran online (*payment gateway*), pemesanan tiket pesawat/kapal, atau reservasi kamar hotel real-time.
- Integrasi API dinamis Google Maps JavaScript SDK berbayar, API BPJPH langsung, atau layanan peta berbasis token.
- Kolom ulasan publik, rating bintang pengguna, dan forum komunitas berbasis database terpusat.
- Fitur pelacakan GPS real-time atau notifikasi push berbasis backend.

---

## 8. Acceptance Criteria (Kriteria Penerimaan Manual)

Pengujian manual dinyatakan **LULUS** apabila seluruh skenario berikut berjalan sesuai harapan:

1. **Pencarian Destinasi:** Mengetik kata kunci (mis. `"Rubiah"` atau `"Tsunami"`) pada kotak pencarian langsung menyaring katalog destinasi secara akurat dan menampilkan kondisi kosong yang jelas jika tidak ada hasil.
2. **Filter Wilayah & Kategori:** Memilih wilayah (mis. `Sabang` atau `Aceh Tengah`) dan kategori (mis. `Bahari` atau `Alam`) serta mengklik pin pada peta SVG interaktif memperbarui daftar destinasi sesuai kombinasi filter, dan tombol "Reset Filter" memulihkan seluruh daftar (≥ 12 destinasi).
3. **Sorting Katalog:** Memilih opsi urutkan (`Unggulan`, `Nama A–Z`, `Biaya Terendah`, `Biaya Tertinggi`) mengurutkan kartu katalog secara konsisten.
4. **Detail Destinasi & Peta Google Maps:** Mengklik kartu destinasi membuka detail lengkap (fasilitas umum, fasilitas ibadah ramah Muslim, status verifikasi data, estimasi biaya simulasi, dan tautan Google Maps yang valid tanpa API key).
5. **Status Sertifikasi Halal vs Ramah Muslim:** Halaman Kuliner & UMKM menampilkan status sertifikasi halal + sumber verifikasinya secara terpisah dari fasilitas ramah Muslim pada Destinasi/Akomodasi, serta memiliki filter status halal.
6. **Simpan Favorit (`localStorage`):** Menekan tombol Favorit pada destinasi/kuliner/akomodasi menambahkannya ke daftar Favorit, jumlah favorit bertambah, dan data tetap tersimpan setelah halaman dimuat ulang (*refresh*).
7. **Itinerary Planner (1–5 Hari):** Pengguna dapat mengubah nama perjalanan, tanggal mulai, durasi (1–5 hari), jumlah wisatawan, menambahkan aktivitas dari katalog ke hari tertentu, menghapus aktivitas, serta memuat ulang halaman tanpa kehilangan itinerary.
8. **Kalkulator Anggaran:** Perubahan jumlah hari, jumlah wisatawan, maupun penambahan/penghapusan aktivitas/akomodasi langsung memperbarui rincian biaya (tiket, konsumsi, penginapan, transportasi) dan total anggaran secara akurat.
9. **Rekomendasi Paket Wisata (Rule-Based):** Memilih minat kategori, batas hari, dan anggaran maksimal menghasilkan daftar paket wisata yang relevan beserta alasan pencocokan, serta dapat langsung diterapkan ke dalam Itinerary Planner.
10. **Pengalih Bahasa (ID / EN):** Mengklik tombol `ID` / `EN` mengubah teks navigasi, label filter, tombol aksi, dan teks antarmuka antara bahasa Indonesia dan Inggris, dan pilihan tetap aktif setelah *refresh*.
11. **Tombol Kontak WhatsApp Demo:** Mengklik tombol hubungi pada Kuliner/UMKM atau Akomodasi membuka pratinjau pesan WhatsApp mode demo dengan keterangan nomor simulasi dan opsi membuka `wa.me`.
12. **Dashboard Demo CRUD:** Pengelola dapat menambah item baru (Destinasi, Kuliner, Akomodasi, atau Paket Wisata), mengedit item yang ada, dan menghapus item; perubahan langsung tercermin di katalog publik, tetap bertahan setelah *refresh*, dan dapat dikembalikan melalui tombol "Reset Data Awal".

---

## 9. Implementation Plan per Iterasi

### Iterasi 1 — Fondasi Data, Desain Editorial & Katalog Eksplorasi
- Penyusunan arsitektur UI/UX bernuansa *emerald green*, *turquoise*, *gold*, dan putih dengan sentuhan ornamen motif Aceh SVG.
- Inisialisasi dataset awal nonpribadi: 14 destinasi (5 wilayah, 6 kategori), 8 item kuliner/UMKM dengan variasi status sertifikasi halal, 6 akomodasi ramah Muslim, dan 4 paket wisata.
- Implementasi Landing Page, modul dwibahasa (ID/EN), serta pencari, filter wilayah/kategori, dan pengurutan katalog.

### Iterasi 2 — Peta Ilustratif SVG, Detail Ibadah & Favorit
- Pembangunan peta SVG interaktif 5 wilayah Aceh (Banda Aceh, Sabang, Aceh Besar, Aceh Tengah, Bener Meriah) beserta tautan Google Maps tanpa API key.
- Implementasi modal detail destinasi dengan pemisahan jelas antara fasilitas umum, fasilitas ibadah ramah Muslim, dan status verifikasi data.
- Integrasi penyimpanan Favorit pada `localStorage` dan panel manajemen favorit.

### Iterasi 3 — Itinerary Planner (1–5 Hari), Kalkulator Anggaran & Rule-Based Recommender
- Implementasi perencana perjalanan 1–5 hari dengan penambahan aktivitas lintas katalog dan alokasi per hari.
- Pembangunan kalkulator estimasi anggaran otomatis berdasarkan parameter durasi, jumlah wisatawan, dan komponen biaya simulasi.
- Implementasi mesin rekomendasi paket wisata berbasis aturan (*rule-based filtering*) dan fitur WhatsApp demo.

### Iterasi 4 — Dashboard Demo CRUD, Prototipe Single-HTML & Verifikasi Penerimaan
- Implementasi Dashboard Demo CRUD lengkap untuk entitas Destinasi, Kuliner, Akomodasi, dan Paket Wisata beserta validasi input dan tombol Reset Data Awal.
- Pengemasan prototipe single-file HTML (`halalexpl-aceh-prototype.html`) yang mandiri dan dapat dijalankan langsung di browser tanpa instalasi.
- Pengujian manual terhadap seluruh 12 Acceptance Criteria dan audit keterbacaan responsif desktop/smartphone.

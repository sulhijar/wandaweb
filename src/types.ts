export type Language = 'id' | 'en';

export type UserRole = 'user' | 'operator' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface AuthStatus {
  adminConfigured: boolean;
  operatorConfigured: boolean;
  envAdminActive: boolean;
  envOperatorActive: boolean;
}

export type WilayahAceh =
  | 'Banda Aceh'
  | 'Sabang'
  | 'Aceh Besar'
  | 'Aceh Tengah'
  | 'Bener Meriah';

export type KategoriWisata =
  | 'Religi'
  | 'Alam'
  | 'Bahari'
  | 'Sejarah'
  | 'Budaya'
  | 'Kuliner';

export type StatusSertifikasiHalal =
  | 'Tersertifikasi Halal'
  | 'Dalam Proses'
  | 'Belum Tersertifikasi Resmi';

export type StatusVerifikasiDestinasi =
  | 'Terverifikasi Referensi'
  | 'Data Awal - Perlu Verifikasi Lapangan';

export interface Destinasi {
  id: string;
  nama: string;
  kategori: KategoriWisata;
  wilayah: WilayahAceh;
  deskripsi: string;
  deskripsiEn?: string;
  imageUrl: string;
  alamat: string;
  mapsUrl: string;
  estimasiBiaya: number;
  fasilitas: string[];
  fasilitasIbadah: string[];
  unggulan: boolean;
  statusVerifikasiData?: StatusVerifikasiDestinasi;
}

export interface Kuliner {
  id: string;
  nama: string;
  kategori: 'Hidangan Utama' | 'Kopi & Minuman' | 'Kue Tradisional' | 'Produk UMKM';
  wilayah: WilayahAceh;
  harga: number;
  imageUrl: string;
  statusSertifikasiHalal: StatusSertifikasiHalal;
  sumberVerifikasi: string;
  kontak: string;
  deskripsi?: string;
}

export interface Akomodasi {
  id: string;
  nama: string;
  wilayah: WilayahAceh;
  hargaPerMalam: number;
  fasilitas: string[];
  fasilitasRamahMuslim: string[];
  imageUrl: string;
  kontak: string;
}

export interface PaketWisata {
  id: string;
  nama: string;
  durasi: number; // 1 - 5 days
  daftarDestinasi: string[]; // destination IDs
  estimasiBiaya: number;
  deskripsi: string;
  kategoriMinat?: KategoriWisata[];
}

export interface ItineraryActivity {
  id: string;
  hariKe: number;
  itemId: string;
  tipeItem: 'destinasi' | 'kuliner' | 'akomodasi';
  nama: string;
  wilayah: WilayahAceh;
  estimasiBiaya: number;
  catatan: string;
}

export interface Itinerary {
  id: string;
  namaPerjalanan: string;
  tanggalMulai: string;
  jumlahHari: number;
  jumlahWisatawan: number;
  daftarAktivitas: ItineraryActivity[];
  totalAnggaran: number;
}

export interface Favorit {
  id: string;
  itemId: string;
  tipeItem: 'destinasi' | 'kuliner' | 'akomodasi';
  tanggalDitambahkan: string;
}

export interface AppConfig {
  language: Language;
}

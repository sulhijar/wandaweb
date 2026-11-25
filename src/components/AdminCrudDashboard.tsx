import React, { useCallback, useEffect, useState } from 'react';
import { Lock, Pencil, Plus, RotateCcw, Shield, Trash2, UserPlus } from 'lucide-react';
import {
  IMG_AKOMODASI_RESORT,
  IMG_HERO_MOSQUE,
  IMG_KULINER_MIE,
  KATEGORI_LIST,
  WILAYAH_LIST,
} from '../data/acehData';
import {
  Akomodasi,
  AuthUser,
  Destinasi,
  KategoriWisata,
  Kuliner,
  Language,
  PaketWisata,
  StatusSertifikasiHalal,
  UserRole,
  WilayahAceh,
} from '../types';
import { formatIDR } from './DestinationCatalog';
import { ImagePickerControl, isSafeImageUrl } from './ImagePickerControl';

interface AdminCrudDashboardProps {
  authUser: AuthUser | null;
  authToken: string | null;
  onRequestLogin: (preferredRole: UserRole) => void;
  destinations: Destinasi[];
  kulinerList: Kuliner[];
  accommodations: Akomodasi[];
  packages: PaketWisata[];
  onSaveDestination: (item: Destinasi) => void;
  onDeleteDestination: (id: string) => void;
  onSaveKuliner: (item: Kuliner) => void;
  onDeleteKuliner: (id: string) => void;
  onSaveAkomodasi: (item: Akomodasi) => void;
  onDeleteAkomodasi: (id: string) => void;
  onSavePaket: (item: PaketWisata) => void;
  onDeletePaket: (id: string) => void;
  heroImageUrl: string;
  onUpdateHeroImageUrl: (nextUrl: string) => void;
  onResetAllData: () => void;
  language: Language;
  t: Record<string, string>;
}

type EntityTab = 'destinasi' | 'kuliner' | 'akomodasi' | 'paket' | 'akun';

export const AdminCrudDashboard: React.FC<AdminCrudDashboardProps> = ({
  authUser,
  authToken,
  onRequestLogin,
  destinations,
  kulinerList,
  accommodations,
  packages,
  onSaveDestination,
  onDeleteDestination,
  onSaveKuliner,
  onDeleteKuliner,
  onSaveAkomodasi,
  onDeleteAkomodasi,
  onSavePaket,
  onDeletePaket,
  heroImageUrl,
  onUpdateHeroImageUrl,
  onResetAllData,
  language,
  t,
}) => {
  const isAdmin = authUser?.role === 'admin';
  const isOperatorOrAdmin = authUser?.role === 'operator' || authUser?.role === 'admin';

  const [activeTab, setActiveTab] = useState<EntityTab>('destinasi');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Catalog form fields
  const [nama, setNama] = useState('');
  const [wilayah, setWilayah] = useState<WilayahAceh>('Banda Aceh');
  const [kategori, setKategori] = useState<KategoriWisata>('Religi');
  const [kulinerKategori, setKulinerKategori] =
    useState<Kuliner['kategori']>('Hidangan Utama');
  const [biaya, setBiaya] = useState(25000);
  const [deskripsi, setDeskripsi] = useState('');
  const [alamat, setAlamat] = useState('');
  const [fasilitasText, setFasilitasText] = useState('Parkir, Toilet bersih');
  const [ibadahText, setIbadahText] = useState('Mushalla, Tempat wudhu terpisah');
  const [halalStatus, setHalalStatus] =
    useState<StatusSertifikasiHalal>('Dalam Proses');
  const [sumberVerifikasi, setSumberVerifikasi] = useState(
    'Input pengelola terotorisasi'
  );
  const [kontak, setKontak] = useState('+62 811-0000-9999');
  const [durasi, setDurasi] = useState(2);
  const [unggulan, setUnggulan] = useState(false);
  const [imageUrl, setImageUrl] = useState(IMG_HERO_MOSQUE);

  // Admin account management state
  const [managedUsers, setManagedUsers] = useState<AuthUser[]>([]);
  const [acctName, setAcctName] = useState('');
  const [acctEmail, setAcctEmail] = useState('');
  const [acctPassword, setAcctPassword] = useState('');
  const [acctRole, setAcctRole] = useState<UserRole>('operator');
  const [acctMsg, setAcctMsg] = useState<string | null>(null);

  const loadManagedUsers = useCallback(async () => {
    if (!isAdmin || !authToken) return;
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setManagedUsers(Array.isArray(data.users) ? data.users : []);
      }
    } catch {
      // Ignore network errors
    }
  }, [isAdmin, authToken]);

  useEffect(() => {
    if (isAdmin && activeTab === 'akun') {
      loadManagedUsers();
    }
  }, [isAdmin, activeTab, loadManagedUsers]);

  // Ensure Operator stays off Admin-only tabs
  useEffect(() => {
    if (!isAdmin && (activeTab === 'paket' || activeTab === 'akun')) {
      setActiveTab('destinasi');
    }
  }, [isAdmin, activeTab]);

  if (!isOperatorOrAdmin) {
    return (
      <section
        id="kelola"
        aria-labelledby="admin-gate-heading"
        className="max-w-[1200px] mx-auto px-4 sm:px-6 py-14"
      >
        <div className="bg-white border border-[#065F46]/15 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-semibold text-[#0D9488] inline-flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              {language === 'en'
                ? 'Operator & Admin Access Only'
                : 'Akses Khusus Operator & Admin'}
            </p>
            <h2
              id="admin-gate-heading"
              className="text-2xl font-semibold tracking-tight text-[#0F241D]"
            >
              {t.adminTitle}
            </h2>
            <p className="text-sm text-[#3D524A] leading-relaxed">
              {authUser?.role === 'user'
                ? language === 'en'
                  ? `You are currently signed in as User (${authUser.name}). Sign in with an Operator or Admin account to manage destinations, culinary halal status, stays, or system accounts.`
                  : `Anda sedang masuk sebagai User (${authUser.name}). Silakan masuk menggunakan akun Operator atau Admin untuk mengelola katalog destinasi, status halal kuliner, akomodasi, maupun akun pengguna.`
                : language === 'en'
                  ? 'Sign in as Operator or Admin to manage Destinations, Halal Culinary, Muslim-Friendly Stays, Tour Packages, and User Accounts.'
                  : 'Masuk sebagai Operator atau Admin untuk mengelola data Destinasi, Kuliner Halal, Akomodasi Ramah Muslim, Paket Wisata, dan Manajemen Akun.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onRequestLogin('operator')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#065F46] bg-[#F2F6F4] hover:bg-[#E2EBE6] border border-[#065F46]/20 rounded-lg cursor-pointer whitespace-nowrap"
            >
              {language === 'en' ? 'Sign In as Operator' : 'Masuk Operator'}
            </button>
            <button
              type="button"
              onClick={() => onRequestLogin('admin')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#065F46] hover:bg-[#054E3A] rounded-lg cursor-pointer whitespace-nowrap"
            >
              <Shield className="w-3.5 h-3.5" aria-hidden="true" />
              {language === 'en' ? 'Sign In as Admin' : 'Masuk Admin'}
            </button>
          </div>
        </div>
      </section>
    );
  }

  const openNewForm = () => {
    setEditingId(null);
    setNama('');
    setWilayah('Banda Aceh');
    setKategori('Religi');
    setKulinerKategori('Hidangan Utama');
    setBiaya(25000);
    setDeskripsi('');
    setAlamat('Banda Aceh, Provinsi Aceh');
    setFasilitasText('Area parkir, Pusat informasi');
    setIbadahText('Mushalla tersedia, Tempat wudhu terpisah');
    setHalalStatus('Dalam Proses');
    setSumberVerifikasi('Input pengelola terotorisasi');
    setKontak('+62 811-0000-9999');
    setDurasi(2);
    setUnggulan(false);
    setImageUrl(
      activeTab === 'kuliner'
        ? IMG_KULINER_MIE
        : activeTab === 'akomodasi'
          ? IMG_AKOMODASI_RESORT
          : IMG_HERO_MOSQUE
    );
    setShowForm(true);
  };

  const handleEditDestination = (d: Destinasi) => {
    setActiveTab('destinasi');
    setEditingId(d.id);
    setNama(d.nama);
    setWilayah(d.wilayah);
    setKategori(d.kategori);
    setBiaya(d.estimasiBiaya);
    setDeskripsi(d.deskripsi);
    setAlamat(d.alamat);
    setFasilitasText(d.fasilitas.join(', '));
    setIbadahText(d.fasilitasIbadah.join(', '));
    setUnggulan(d.unggulan);
    setImageUrl(d.imageUrl || IMG_HERO_MOSQUE);
    setShowForm(true);
  };

  const handleEditKuliner = (k: Kuliner) => {
    setActiveTab('kuliner');
    setEditingId(k.id);
    setNama(k.nama);
    setWilayah(k.wilayah);
    setKulinerKategori(k.kategori);
    setBiaya(k.harga);
    setHalalStatus(k.statusSertifikasiHalal);
    setSumberVerifikasi(k.sumberVerifikasi);
    setKontak(k.kontak);
    setDeskripsi(k.deskripsi || '');
    setImageUrl(k.imageUrl || IMG_KULINER_MIE);
    setShowForm(true);
  };

  const handleEditAkomodasi = (a: Akomodasi) => {
    setActiveTab('akomodasi');
    setEditingId(a.id);
    setNama(a.nama);
    setWilayah(a.wilayah);
    setBiaya(a.hargaPerMalam);
    setFasilitasText(a.fasilitas.join(', '));
    setIbadahText(a.fasilitasRamahMuslim.join(', '));
    setKontak(a.kontak);
    setImageUrl(a.imageUrl || IMG_AKOMODASI_RESORT);
    setShowForm(true);
  };

  const handleEditPaket = (p: PaketWisata) => {
    setActiveTab('paket');
    setEditingId(p.id);
    setNama(p.nama);
    setDurasi(p.durasi);
    setBiaya(p.estimasiBiaya);
    setDeskripsi(p.deskripsi);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    const splitClean = (raw: string) =>
      raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    if (activeTab === 'destinasi') {
      const id = editingId || `dest-${Date.now()}`;
      onSaveDestination({
        id,
        nama: nama.trim(),
        kategori,
        wilayah,
        deskripsi:
          deskripsi.trim() ||
          `Destinasi wisata ${kategori.toLowerCase()} di ${wilayah}.`,
        imageUrl: isSafeImageUrl(imageUrl) ? imageUrl : IMG_HERO_MOSQUE,
        alamat: alamat.trim() || wilayah,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${nama.trim()} ${wilayah} Aceh`
        )}`,
        estimasiBiaya: Math.max(0, Number(biaya) || 0),
        fasilitas: splitClean(fasilitasText),
        fasilitasIbadah: splitClean(ibadahText),
        unggulan,
        statusVerifikasiData: 'Data Awal - Perlu Verifikasi Lapangan',
      });
    } else if (activeTab === 'kuliner') {
      const id = editingId || `kul-${Date.now()}`;
      onSaveKuliner({
        id,
        nama: nama.trim(),
        kategori: kulinerKategori,
        wilayah,
        harga: Math.max(0, Number(biaya) || 0),
        imageUrl: isSafeImageUrl(imageUrl) ? imageUrl : IMG_KULINER_MIE,
        statusSertifikasiHalal: halalStatus,
        sumberVerifikasi: sumberVerifikasi.trim() || 'Input pengelola',
        kontak: kontak.trim() || '+62 811-0000-9999',
        deskripsi: deskripsi.trim(),
      });
    } else if (activeTab === 'akomodasi') {
      const id = editingId || `ako-${Date.now()}`;
      onSaveAkomodasi({
        id,
        nama: nama.trim(),
        wilayah,
        hargaPerMalam: Math.max(0, Number(biaya) || 0),
        fasilitas: splitClean(fasilitasText),
        fasilitasRamahMuslim: splitClean(ibadahText),
        imageUrl: isSafeImageUrl(imageUrl) ? imageUrl : IMG_AKOMODASI_RESORT,
        kontak: kontak.trim() || '+62 811-0000-9999',
      });
    } else if (activeTab === 'paket' && isAdmin) {
      const id = editingId || `pkt-${Date.now()}`;
      const existing = packages.find((p) => p.id === editingId);
      onSavePaket({
        id,
        nama: nama.trim(),
        durasi: Math.min(5, Math.max(1, Number(durasi) || 1)),
        daftarDestinasi:
          existing?.daftarDestinasi ||
          destinations.slice(0, 3).map((d) => d.id),
        estimasiBiaya: Math.max(0, Number(biaya) || 0),
        deskripsi:
          deskripsi.trim() || 'Paket wisata ramah Muslim hasil kurasi pengelola.',
        kategoriMinat: existing?.kategoriMinat || ['Religi', 'Alam'],
      });
    }

    setShowForm(false);
    setEditingId(null);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;
    setAcctMsg(null);
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        name: acctName.trim(),
        email: acctEmail.trim(),
        password: acctPassword,
        role: acctRole,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAcctMsg(data.error || 'Gagal membuat akun.');
      return;
    }
    setAcctName('');
    setAcctEmail('');
    setAcctPassword('');
    setAcctMsg(`Akun ${data.user.role} (${data.user.email}) berhasil dibuat.`);
    loadManagedUsers();
  };

  const handleChangeUserRole = async (userId: string, nextRole: UserRole) => {
    if (!authToken) return;
    setAcctMsg(null);
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ role: nextRole }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAcctMsg(data.error || 'Gagal memperbarui peran.');
      return;
    }
    loadManagedUsers();
  };

  const handleDeleteAccount = async (userId: string) => {
    if (!authToken) return;
    setAcctMsg(null);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    if (!res.ok) {
      setAcctMsg(data.error || 'Gagal menghapus akun.');
      return;
    }
    loadManagedUsers();
  };

  const availableTabs: Array<{ key: EntityTab; label: string }> = [
    { key: 'destinasi', label: `Destinasi (${destinations.length})` },
    { key: 'kuliner', label: `Kuliner & UMKM (${kulinerList.length})` },
    { key: 'akomodasi', label: `Akomodasi (${accommodations.length})` },
    ...(isAdmin
      ? [
          { key: 'paket' as const, label: `Paket Wisata (${packages.length})` },
          {
            key: 'akun' as const,
            label:
              language === 'en' ? 'User & Operator Accounts' : 'Akun Operator & User',
          },
        ]
      : []),
  ];

  return (
    <section
      id="kelola"
      aria-labelledby="admin-heading"
      className="max-w-[1200px] mx-auto px-4 sm:px-6 py-14"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-semibold text-[#0D9488]">
            {isAdmin
              ? language === 'en'
                ? `Signed in as Admin · ${authUser?.email}`
                : `Masuk sebagai Admin · ${authUser?.email}`
              : language === 'en'
                ? `Signed in as Operator · ${authUser?.email}`
                : `Masuk sebagai Operator · ${authUser?.email}`}
          </p>
          <h2
            id="admin-heading"
            className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F241D]"
          >
            {isAdmin
              ? t.adminTitle
              : language === 'en'
                ? 'Operator Content Workspace'
                : 'Workspace Pengelolaan Operator'}
          </h2>
          <p className="text-sm sm:text-base text-[#3D524A] leading-relaxed">
            {isAdmin
              ? t.adminSubtitle
              : language === 'en'
                ? 'Operator role can create, update, and delete Destinations, Halal Culinary, and Muslim-Friendly Stays.'
                : 'Peran Operator dapat mengelola data Destinasi, Kuliner Halal, dan Akomodasi Ramah Muslim.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {activeTab !== 'akun' && (
            <button
              type="button"
              onClick={openNewForm}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#065F46] hover:bg-[#054E3A] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              {t.adminAddBtn}
            </button>
          )}
          {isAdmin && (
            <button
              type="button"
              onClick={onResetAllData}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#6B4423] bg-[#FBF6EE] hover:bg-[#F5EBD8] border border-[#B45309]/25 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              {t.adminResetBtn}
            </button>
          )}
        </div>
      </div>

      {/* Hero Banner Image Manager for Operator & Admin */}
      <div className="mb-6">
        <ImagePickerControl
          value={heroImageUrl}
          onChange={onUpdateHeroImageUrl}
          authToken={authToken}
          language={language}
          label={
            language === 'en'
              ? 'Main Landing Page Banner Photo (Hero)'
              : 'Gambar Utama Halaman Depan (Hero Banner Pariwisata)'
          }
        />
      </div>

      {/* Entity Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {availableTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key);
              setShowForm(false);
            }}
            className={`px-4 py-2 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
              activeTab === tab.key
                ? 'bg-[#065F46] text-white border-[#065F46]'
                : 'bg-white text-[#3D524A] border-[#065F46]/20 hover:border-[#065F46]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Admin Account Management Tab */}
      {isAdmin && activeTab === 'akun' ? (
        <div className="space-y-6">
          <form
            onSubmit={handleCreateAccount}
            className="bg-white border border-[#065F46]/15 rounded-xl p-5 sm:p-6 space-y-4"
          >
            <h3 className="text-base font-semibold text-[#0F241D] flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#065F46]" aria-hidden="true" />
              {language === 'en'
                ? 'Create New Operator / User Account'
                : 'Buat Akun Operator / User Baru'}
            </h3>

            {acctMsg && (
              <div className="text-xs bg-[#F2F6F4] border border-[#065F46]/20 text-[#0F241D] rounded-lg p-3">
                {acctMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#0F241D]">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={acctName}
                  onChange={(e) => setAcctName(e.target.value)}
                  placeholder="Operator Sabang"
                  className="w-full px-3 py-2 text-sm bg-[#FAFBF9] border border-[#065F46]/20 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#0F241D]">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={acctEmail}
                  onChange={(e) => setAcctEmail(e.target.value)}
                  placeholder="operator.sabang@aceh.id"
                  className="w-full px-3 py-2 text-sm bg-[#FAFBF9] border border-[#065F46]/20 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#0F241D]">
                  Kata Sandi (min. 8) *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={acctPassword}
                  onChange={(e) => setAcctPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full px-3 py-2 text-sm bg-[#FAFBF9] border border-[#065F46]/20 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#0F241D]">
                  Peran
                </label>
                <select
                  value={acctRole}
                  onChange={(e) => setAcctRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-sm bg-[#FAFBF9] border border-[#065F46]/20 rounded-lg"
                >
                  <option value="operator">Operator</option>
                  <option value="user">User (Wisatawan)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#065F46] hover:bg-[#054E3A] rounded-lg cursor-pointer"
            >
              {language === 'en' ? 'Create Account' : 'Simpan Akun Baru'}
            </button>
          </form>

          <div className="bg-white border border-[#065F46]/15 rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#065F46]/15 bg-[#F2F6F4] text-xs font-semibold text-[#0F241D]">
                  <th className="py-3 px-4">Nama</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Peran</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#065F46]/10">
                {managedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 px-4 text-center text-xs text-[#5B7068]">
                      {language === 'en'
                        ? 'No persisted user records yet (or signed in via server passcode).'
                        : 'Belum ada daftar akun tersimpan di database lokal server.'}
                    </td>
                  </tr>
                ) : (
                  managedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#FAFBF9]">
                      <td className="py-3 px-4 font-medium text-[#0F241D]">{u.name}</td>
                      <td className="py-3 px-4 text-[#3D524A] font-mono text-xs">{u.email}</td>
                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          disabled={u.id === authUser?.id}
                          onChange={(e) =>
                            handleChangeUserRole(u.id, e.target.value as UserRole)
                          }
                          aria-label={`Ubah peran ${u.email}`}
                          className="px-2.5 py-1 text-xs bg-[#FAFBF9] border border-[#065F46]/20 rounded-md"
                        >
                          <option value="user">user</option>
                          <option value="operator">operator</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {u.id !== authUser?.id && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAccount(u.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" aria-hidden="true" />
                            {t.adminDeleteBtn}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          {/* Create / Update Form */}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-[#065F46]/25 rounded-xl p-5 sm:p-6 mb-6 space-y-4"
            >
              <h3 className="text-lg font-semibold text-[#0F241D]">
                {editingId ? t.adminEditBtn : t.adminAddBtn} — {activeTab.toUpperCase()}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#0F241D]">
                    {language === 'en' ? 'Name / Title' : 'Nama'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAFBF9] border border-[#065F46]/20 rounded-lg"
                  />
                </div>

                {activeTab !== 'paket' && (
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#0F241D]">
                      {t.filterRegionLabel}
                    </label>
                    <select
                      value={wilayah}
                      onChange={(e) => setWilayah(e.target.value as WilayahAceh)}
                      className="w-full px-3 py-2 text-sm bg-[#FAFBF9] border border-[#065F46]/20 rounded-lg"
                    >
                      {WILAYAH_LIST.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {activeTab === 'destinasi' && (
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#0F241D]">
                      {t.filterCategoryLabel}
                    </label>
                    <select
                      value={kategori}
                      onChange={(e) => setKategori(e.target.value as KategoriWisata)}
                      className="w-full px-3 py-2 text-sm bg-[#FAFBF9] border border-[#065F46]/20 rounded-lg"
                    >
                      {KATEGORI_LIST.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {activeTab === 'kuliner' && (
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#0F241D]">
                      Sub-Kategori
                    </label>
                    <select
                      value={kulinerKategori}
                      onChange={(e) =>
                        setKulinerKategori(e.target.value as Kuliner['kategori'])
                      }
                      className="w-full px-3 py-2 text-sm bg-[#FAFBF9] border border-[#065F46]/20 rounded-lg"
                    >
                      <option value="Hidangan Utama">Hidangan Utama</option>
                      <option value="Kopi & Minuman">Kopi & Minuman</option>
                      <option value="Kue Tradisional">Kue Tradisional</option>
                      <option value="Produk UMKM">Produk UMKM</option>
                    </select>
                  </div>
                )}

                {activeTab === 'paket' && (
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#0F241D]">
                      {t.daysCount}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={durasi}
                      onChange={(e) => setDurasi(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-[#FAFBF9] border border-[#065F46]/20 rounded-lg"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#0F241D]">
                    {language === 'en' ? 'Simulated Price (IDR)' : 'Estimasi Harga / Biaya (IDR)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={5000}
                    value={biaya}
                    onChange={(e) => setBiaya(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-[#FAFBF9] border border-[#065F46]/20 rounded-lg"
                  />
                </div>

                {activeTab === 'kuliner' && (
                  <>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-[#0F241D]">
                        Status Sertifikasi Halal
                      </label>
                      <select
                        value={halalStatus}
                        onChange={(e) =>
                          setHalalStatus(e.target.value as StatusSertifikasiHalal)
                        }
                        className="w-full px-3 py-2 text-sm bg-[#FAFBF9] border border-[#065F46]/20 rounded-lg"
                      >
                        <option value="Tersertifikasi Halal">Tersertifikasi Halal</option>
                        <option value="Dalam Proses">Dalam Proses</option>
                        <option value="Belum Tersertifikasi Resmi">
                          Belum Tersertifikasi Resmi
                        </option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-[#0F241D]">
                        Sumber Verifikasi
                      </label>
                      <input
                        type="text"
                        value={sumberVerifikasi}
                        onChange={(e) => setSumberVerifikasi(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[#FAFBF9] border border-[#065F46]/20 rounded-lg"
                      />
                    </div>
                  </>
                )}

                {(activeTab === 'kuliner' || activeTab === 'akomodasi') && (
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#0F241D]">
                      Kontak WhatsApp Simulasi
                    </label>
                    <input
                      type="text"
                      value={kontak}
                      onChange={(e) => setKontak(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#FAFBF9] border border-[#065F46]/20 rounded-lg"
                    />
                  </div>
                )}

                {(activeTab === 'destinasi' || activeTab === 'akomodasi') && (
                  <>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-[#0F241D]">
                        {t.generalFacilities} (pisahkan koma)
                      </label>
                      <input
                        type="text"
                        value={fasilitasText}
                        onChange={(e) => setFasilitasText(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[#FAFBF9] border border-[#065F46]/20 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-[#0F241D]">
                        {t.prayerFacilities} (pisahkan koma)
                      </label>
                      <input
                        type="text"
                        value={ibadahText}
                        onChange={(e) => setIbadahText(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-[#FAFBF9] border border-[#065F46]/20 rounded-lg"
                      />
                    </div>
                  </>
                )}
              </div>

              {activeTab === 'destinasi' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#0F241D]">
                      Alamat Lokasi
                    </label>
                    <input
                      type="text"
                      value={alamat}
                      onChange={(e) => setAlamat(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#FAFBF9] border border-[#065F46]/20 rounded-lg"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-[#0F241D] pt-5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={unggulan}
                      onChange={(e) => setUnggulan(e.target.checked)}
                      className="accent-[#065F46] w-4 h-4"
                    />
                    Tandai sebagai Destinasi Unggulan
                  </label>
                </div>
              )}

              {activeTab !== 'akomodasi' && (
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#0F241D]">
                    Deskripsi
                  </label>
                  <textarea
                    rows={2}
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAFBF9] border border-[#065F46]/20 rounded-lg"
                  />
                </div>
              )}

              {activeTab !== 'paket' && (
                <ImagePickerControl
                  value={imageUrl}
                  onChange={setImageUrl}
                  authToken={authToken}
                  language={language}
                />
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#065F46] hover:bg-[#054E3A] rounded-lg cursor-pointer"
                >
                  {t.adminSaveBtn}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-medium text-[#3D524A] bg-[#F2F6F4] hover:bg-[#E2EBE6] rounded-lg cursor-pointer"
                >
                  {t.adminCancelBtn}
                </button>
              </div>
            </form>
          )}

          {/* CRUD Data Table */}
          <div className="bg-white border border-[#065F46]/15 rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#065F46]/15 bg-[#F2F6F4] text-xs font-semibold text-[#0F241D]">
                  <th className="py-3 px-4">{language === 'en' ? 'Name' : 'Nama'}</th>
                  <th className="py-3 px-4">
                    {activeTab === 'paket'
                      ? language === 'en'
                        ? 'Duration'
                        : 'Durasi'
                      : t.filterRegionLabel}
                  </th>
                  <th className="py-3 px-4">
                    {activeTab === 'kuliner'
                      ? 'Status Halal'
                      : activeTab === 'destinasi'
                        ? t.filterCategoryLabel
                        : language === 'en'
                          ? 'Details'
                          : 'Keterangan'}
                  </th>
                  <th className="py-3 px-4 text-right">
                    {language === 'en' ? 'Est. Cost' : 'Estimasi Biaya'}
                  </th>
                  <th className="py-3 px-4 text-right">
                    {language === 'en' ? 'Actions' : 'Aksi'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#065F46]/10">
                {activeTab === 'destinasi' &&
                  destinations.map((d) => (
                    <tr key={d.id} className="hover:bg-[#FAFBF9]">
                      <td className="py-3 px-4 font-medium text-[#0F241D]">
                        <div className="flex items-center gap-3">
                          <img
                            src={d.imageUrl}
                            alt={d.nama}
                            referrerPolicy="no-referrer"
                            className="w-12 h-9 rounded object-cover bg-[#E3F0EA] shrink-0"
                          />
                          <span>{d.nama}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#3D524A]">{d.wilayah}</td>
                      <td className="py-3 px-4 text-[#3D524A]">{d.kategori}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {formatIDR(d.estimasiBiaya)}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleEditDestination(d)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#065F46] bg-[#F2F6F4] rounded hover:bg-[#E2EBE6] cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" aria-hidden="true" />
                          {language === 'en' ? 'Edit / Photo' : 'Edit & Gambar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteDestination(d.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" aria-hidden="true" />
                          {t.adminDeleteBtn}
                        </button>
                      </td>
                    </tr>
                  ))}

                {activeTab === 'kuliner' &&
                  kulinerList.map((k) => (
                    <tr key={k.id} className="hover:bg-[#FAFBF9]">
                      <td className="py-3 px-4 font-medium text-[#0F241D]">
                        <div className="flex items-center gap-3">
                          <img
                            src={k.imageUrl}
                            alt={k.nama}
                            referrerPolicy="no-referrer"
                            className="w-12 h-9 rounded object-cover bg-[#E3F0EA] shrink-0"
                          />
                          <span>{k.nama}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#3D524A]">{k.wilayah}</td>
                      <td className="py-3 px-4 text-[#3D524A]">{k.statusSertifikasiHalal}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {formatIDR(k.harga)}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleEditKuliner(k)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#065F46] bg-[#F2F6F4] rounded hover:bg-[#E2EBE6] cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" aria-hidden="true" />
                          {language === 'en' ? 'Edit / Photo' : 'Edit & Gambar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteKuliner(k.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" aria-hidden="true" />
                          {t.adminDeleteBtn}
                        </button>
                      </td>
                    </tr>
                  ))}

                {activeTab === 'akomodasi' &&
                  accommodations.map((a) => (
                    <tr key={a.id} className="hover:bg-[#FAFBF9]">
                      <td className="py-3 px-4 font-medium text-[#0F241D]">
                        <div className="flex items-center gap-3">
                          <img
                            src={a.imageUrl}
                            alt={a.nama}
                            referrerPolicy="no-referrer"
                            className="w-12 h-9 rounded object-cover bg-[#E3F0EA] shrink-0"
                          />
                          <span>{a.nama}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#3D524A]">{a.wilayah}</td>
                      <td className="py-3 px-4 text-[#3D524A] text-xs">
                        {a.fasilitasRamahMuslim.slice(0, 2).join(', ')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {formatIDR(a.hargaPerMalam)}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleEditAkomodasi(a)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#065F46] bg-[#F2F6F4] rounded hover:bg-[#E2EBE6] cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" aria-hidden="true" />
                          {language === 'en' ? 'Edit / Photo' : 'Edit & Gambar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteAkomodasi(a.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" aria-hidden="true" />
                          {t.adminDeleteBtn}
                        </button>
                      </td>
                    </tr>
                  ))}

                {activeTab === 'paket' &&
                  isAdmin &&
                  packages.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAFBF9]">
                      <td className="py-3 px-4 font-medium text-[#0F241D]">{p.nama}</td>
                      <td className="py-3 px-4 text-[#3D524A] font-mono tabular-nums">
                        {p.durasi} {language === 'en' ? 'Days' : 'Hari'}
                      </td>
                      <td className="py-3 px-4 text-[#3D524A] text-xs">
                        {p.daftarDestinasi.length} destinasi
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {formatIDR(p.estimasiBiaya)}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleEditPaket(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#065F46] bg-[#F2F6F4] rounded hover:bg-[#E2EBE6] cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" aria-hidden="true" />
                          {t.adminEditBtn}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeletePaket(p.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" aria-hidden="true" />
                          {t.adminDeleteBtn}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
};

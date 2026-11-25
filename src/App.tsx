import React, { useEffect, useMemo, useState } from 'react';
import {
  Bookmark,
  Compass,
  Download,
  Globe,
  LogIn,
  LogOut,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react';
import { AcehMapSvg } from './components/AcehMapSvg';
import { AdminCrudDashboard } from './components/AdminCrudDashboard';
import { CulinaryAndStays } from './components/CulinaryAndStays';
import { DestinationCatalog } from './components/DestinationCatalog';
import { isSafeImageUrl } from './components/ImagePickerControl';
import { ItineraryAndRecommender } from './components/ItineraryAndRecommender';
import { LoginPage } from './components/LoginPage';
import {
  DestinationDetailModal,
  FavoritesModal,
  WhatsAppDemoModal,
} from './components/Modals';
import {
  IMG_HERO_MOSQUE,
  INITIAL_AKOMODASI,
  INITIAL_DESTINASI,
  INITIAL_ITINERARY,
  INITIAL_KULINER,
  INITIAL_PAKET,
} from './data/acehData';
import { TRANSLATIONS } from './i18n/translations';
import {
  Akomodasi,
  AuthUser,
  Destinasi,
  Favorit,
  Itinerary,
  Kuliner,
  Language,
  PaketWisata,
  UserRole,
  WilayahAceh,
} from './types';

const STORAGE_KEYS = {
  destinasi: 'halalexpl_aceh_v1_destinasi',
  kuliner: 'halalexpl_aceh_v1_kuliner',
  akomodasi: 'halalexpl_aceh_v1_akomodasi',
  paket: 'halalexpl_aceh_v1_paket',
  itinerary: 'halalexpl_aceh_v1_itinerary',
  favorit: 'halalexpl_aceh_v1_favorit',
  language: 'halalexpl_aceh_v1_language',
  heroImageUrl: 'halalexpl_aceh_v1_hero_image',
};

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export default function App() {
  const [language, setLanguage] = useState<Language>(() =>
    readLocal<Language>(STORAGE_KEYS.language, 'id')
  );

  // Auth state strictly in React memory (never localStorage/sessionStorage)
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [viewMode, setViewMode] = useState<'main' | 'login'>('main');
  const [loginInitialRole, setLoginInitialRole] = useState<UserRole>('user');

  const [destinations, setDestinations] = useState<Destinasi[]>(() =>
    readLocal<Destinasi[]>(STORAGE_KEYS.destinasi, INITIAL_DESTINASI)
  );
  const [kulinerList, setKulinerList] = useState<Kuliner[]>(() =>
    readLocal<Kuliner[]>(STORAGE_KEYS.kuliner, INITIAL_KULINER)
  );
  const [accommodations, setAccommodations] = useState<Akomodasi[]>(() =>
    readLocal<Akomodasi[]>(STORAGE_KEYS.akomodasi, INITIAL_AKOMODASI)
  );
  const [packages, setPackages] = useState<PaketWisata[]>(() =>
    readLocal<PaketWisata[]>(STORAGE_KEYS.paket, INITIAL_PAKET)
  );
  const [itinerary, setItinerary] = useState<Itinerary>(() =>
    readLocal<Itinerary>(STORAGE_KEYS.itinerary, INITIAL_ITINERARY)
  );
  const [favorites, setFavorites] = useState<Favorit[]>(() =>
    readLocal<Favorit[]>(STORAGE_KEYS.favorit, [])
  );
  const [heroImageUrl, setHeroImageUrl] = useState<string>(() =>
    readLocal<string>(STORAGE_KEYS.heroImageUrl, IMG_HERO_MOSQUE)
  );

  const [selectedRegion, setSelectedRegion] = useState<WilayahAceh | 'Semua'>('Semua');
  const [detailDest, setDetailDest] = useState<Destinasi | null>(null);
  const [waModalInfo, setWaModalInfo] = useState<{
    name: string;
    phone: string;
    region: string;
  } | null>(null);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    writeLocal(STORAGE_KEYS.language, language);
    document.documentElement.lang = language;
  }, [language]);

  // Load shared server catalog if available
  useEffect(() => {
    fetch('/api/catalog')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.catalog) {
          if (Array.isArray(data.catalog.destinasi)) setDestinations(data.catalog.destinasi);
          if (Array.isArray(data.catalog.kuliner)) setKulinerList(data.catalog.kuliner);
          if (Array.isArray(data.catalog.akomodasi)) setAccommodations(data.catalog.akomodasi);
          if (Array.isArray(data.catalog.paket)) setPackages(data.catalog.paket);
          if (
            typeof data.catalog.heroImageUrl === 'string' &&
            isSafeImageUrl(data.catalog.heroImageUrl)
          ) {
            setHeroImageUrl(data.catalog.heroImageUrl);
          }
        }
      })
      .catch(() => {
        // Fallback to local data
      });
  }, []);

  useEffect(() => writeLocal(STORAGE_KEYS.destinasi, destinations), [destinations]);
  useEffect(() => writeLocal(STORAGE_KEYS.kuliner, kulinerList), [kulinerList]);
  useEffect(() => writeLocal(STORAGE_KEYS.akomodasi, accommodations), [accommodations]);
  useEffect(() => writeLocal(STORAGE_KEYS.paket, packages), [packages]);
  useEffect(() => writeLocal(STORAGE_KEYS.itinerary, itinerary), [itinerary]);
  useEffect(() => writeLocal(STORAGE_KEYS.favorit, favorites), [favorites]);
  useEffect(() => writeLocal(STORAGE_KEYS.heroImageUrl, heroImageUrl), [heroImageUrl]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 2600);
  };

  const syncServerCatalog = (next: {
    destinasi?: Destinasi[];
    kuliner?: Kuliner[];
    akomodasi?: Akomodasi[];
    paket?: PaketWisata[];
    heroImageUrl?: string;
  }) => {
    if (!authToken || (authUser?.role !== 'operator' && authUser?.role !== 'admin')) return;
    fetch('/api/catalog', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(next),
    }).catch(() => {
      // Ignore network hiccup
    });
  };

  const syncServerWorkspace = (nextFavs: Favorit[], nextItin: Itinerary) => {
    if (!authToken) return;
    fetch('/api/user/workspace', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ favorites: nextFavs, itinerary: nextItin }),
    }).catch(() => {
      // Ignore network hiccup
    });
  };

  const handleAuthSuccess = async (token: string, user: AuthUser) => {
    setAuthToken(token);
    setAuthUser(user);
    setViewMode('main');
    showToast(
      language === 'en'
        ? `Signed in as ${user.name} (${user.role})`
        : `Masuk sebagai ${user.name} (${user.role})`
    );

    // Load user-scoped workspace if saved on server
    try {
      const res = await fetch('/api/user/workspace', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.workspace) {
          if (Array.isArray(data.workspace.favorites)) setFavorites(data.workspace.favorites);
          if (data.workspace.itinerary) setItinerary(data.workspace.itinerary);
        }
      }
    } catch {
      // Keep current workspace
    }

    if (user.role === 'operator' || user.role === 'admin') {
      window.setTimeout(() => {
        document.getElementById('kelola')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setAuthUser(null);
    showToast(language === 'en' ? 'Signed out' : 'Berhasil keluar dari sesi');
  };

  const openLoginPage = (preferredRole: UserRole = 'user') => {
    setLoginInitialRole(preferredRole);
    setViewMode('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const favoriteIdSet = useMemo(
    () => new Set(favorites.map((f) => f.itemId)),
    [favorites]
  );

  const handleToggleFavorite = (
    itemId: string,
    tipeItem: 'destinasi' | 'kuliner' | 'akomodasi' = 'destinasi'
  ) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.itemId === itemId);
      const next = exists
        ? prev.filter((f) => f.itemId !== itemId)
        : [
            ...prev,
            {
              id: `fav-${Date.now()}`,
              itemId,
              tipeItem,
              tanggalDitambahkan: new Date().toISOString(),
            },
          ];
      showToast(
        exists
          ? language === 'en'
            ? 'Removed from favorites'
            : 'Dihapus dari daftar favorit'
          : language === 'en'
            ? 'Saved to favorites'
            : 'Disimpan ke daftar favorit'
      );
      syncServerWorkspace(next, itinerary);
      return next;
    });
  };

  const handleUpdateItinerary = (updated: Itinerary) => {
    setItinerary(updated);
    syncServerWorkspace(favorites, updated);
  };

  const handleAddDestToItinerary = (dest: Destinasi) => {
    const next: Itinerary = {
      ...itinerary,
      daftarAktivitas: [
        ...itinerary.daftarAktivitas,
        {
          id: `act-${Date.now()}`,
          hariKe: 1,
          itemId: dest.id,
          tipeItem: 'destinasi',
          nama: dest.nama,
          wilayah: dest.wilayah,
          estimasiBiaya: dest.estimasiBiaya,
          catatan: dest.fasilitasIbadah[0] || '',
        },
      ],
    };
    handleUpdateItinerary(next);
    showToast(
      language === 'en'
        ? `Added "${dest.nama}" to Day 1 of Itinerary`
        : `"${dest.nama}" ditambahkan ke Hari ke-1 Itinerary`
    );
  };

  // CRUD helpers
  const upsert = <T extends { id: string }>(list: T[], item: T): T[] => {
    const idx = list.findIndex((x) => x.id === item.id);
    if (idx >= 0) {
      const next = [...list];
      next[idx] = item;
      return next;
    }
    return [item, ...list];
  };

  const handleResetAllData = async () => {
    if (authToken && authUser?.role === 'admin') {
      await fetch('/api/catalog/reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      }).catch(() => {});
    }
    setDestinations(INITIAL_DESTINASI);
    setKulinerList(INITIAL_KULINER);
    setAccommodations(INITIAL_AKOMODASI);
    setPackages(INITIAL_PAKET);
    setItinerary(INITIAL_ITINERARY);
    setFavorites([]);
    setHeroImageUrl(IMG_HERO_MOSQUE);
    showToast(
      language === 'en'
        ? 'All demo data reset to defaults'
        : 'Seluruh data dikembalikan ke data awal'
    );
  };

  if (viewMode === 'login') {
    return (
      <LoginPage
        initialRole={loginInitialRole}
        language={language}
        t={t}
        onAuthSuccess={handleAuthSuccess}
        onBack={() => setViewMode('main')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBF9] text-[#0F241D]">
      {/* Top Bar Contract: 3 exact zones separated by gap-8 */}
      <header className="sticky top-0 z-40 bg-[#FAFBF9]/95 backdrop-blur border-b border-[#065F46]/15">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="text-xl font-bold font-editorial tracking-tight text-[#065F46] whitespace-nowrap shrink-0"
          >
            {t.brand}
          </a>

          <nav
            aria-label="Navigasi Utama"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[#3D524A]"
          >
            <a
              href="#destinasi"
              className="hover:text-[#065F46] transition-colors whitespace-nowrap shrink-0"
            >
              {t.navDestinations}
            </a>
            <a
              href="#kuliner"
              className="hover:text-[#065F46] transition-colors whitespace-nowrap shrink-0"
            >
              {t.navCulinary}
            </a>
            <a
              href="#akomodasi"
              className="hover:text-[#065F46] transition-colors whitespace-nowrap shrink-0"
            >
              {t.navAccommodations}
            </a>
            <a
              href="#itinerary"
              className="hover:text-[#065F46] transition-colors whitespace-nowrap shrink-0"
            >
              {t.navItinerary}
            </a>
            <a
              href="#kelola"
              className="hover:text-[#065F46] transition-colors whitespace-nowrap shrink-0"
            >
              {t.navAdmin}
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {authUser ? (
              <button
                type="button"
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#065F46] bg-[#F2F6F4] hover:bg-[#E2EBE6] border border-[#065F46]/20 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                {t.logoutBtn} ({authUser.role})
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openLoginPage('user')}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#065F46] hover:bg-[#054E3A] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
                {t.loginBtn}
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2 text-[#0F241D] rounded-lg border border-[#065F46]/20"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden bg-white border-t border-[#065F46]/15 px-4 py-3 flex flex-col gap-2 text-sm font-medium">
            <a
              href="#destinasi"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-[#0F241D]"
            >
              {t.navDestinations}
            </a>
            <a
              href="#kuliner"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-[#0F241D]"
            >
              {t.navCulinary}
            </a>
            <a
              href="#akomodasi"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-[#0F241D]"
            >
              {t.navAccommodations}
            </a>
            <a
              href="#itinerary"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-[#0F241D]"
            >
              {t.navItinerary}
            </a>
            <a
              href="#kelola"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-[#0F241D]"
            >
              {t.navAdmin}
            </a>
            {authUser ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="py-2 text-left text-[#065F46] font-semibold"
              >
                {t.logoutBtn} ({authUser.role})
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openLoginPage('user');
                }}
                className="py-2 text-left text-[#065F46] font-semibold"
              >
                {t.loginBtn} (User · Operator · Admin)
              </button>
            )}
          </nav>
        )}
      </header>

      <main id="top" className="flex-1">
        {/* Hero Editorial Section */}
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-10 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <p className="text-xs font-medium tracking-wide text-[#0D9488]">
                {t.heroKicker}
              </p>

              <h1
                style={{ fontSize: 'clamp(2.1rem, 3.8vw, 3.4rem)', textWrap: 'balance' }}
                className="font-semibold leading-[1.12] tracking-tight text-[#0F241D]"
              >
                {t.heroTitle}
              </h1>

              <p className="text-base text-[#3D524A] leading-relaxed max-w-xl">
                {t.heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="#destinasi"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#065F46] hover:bg-[#054E3A] rounded-lg transition-colors whitespace-nowrap"
                >
                  <Compass className="w-4 h-4" aria-hidden="true" />
                  {t.heroPrimaryBtn}
                </a>
                <a
                  href="#itinerary"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#065F46] bg-[#F2F6F4] hover:bg-[#E2EBE6] border border-[#065F46]/20 rounded-lg transition-colors whitespace-nowrap"
                >
                  {t.heroSecondaryBtn}
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-full min-h-[280px] sm:min-h-[360px] rounded-xl overflow-hidden border border-[#065F46]/15 bg-[#E3F0EA]">
                <img
                  src={isSafeImageUrl(heroImageUrl) ? heroImageUrl : IMG_HERO_MOSQUE}
                  alt="Masjid Raya Baiturrahman Banda Aceh"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/75 via-black/30 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2 text-white text-xs">
                  <span className="font-medium">
                    Masjid Raya Baiturrahman · Banda Aceh
                  </span>
                  <span className="font-mono text-[#FDE68A] tabular-nums">
                    5 {language === 'en' ? 'Regions' : 'Wilayah'} · {destinations.length}{' '}
                    {language === 'en' ? 'Destinations' : 'Destinasi'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Workspace Control & Auth Session Ribbon below Hero */}
          <div className="mt-8 pt-6 border-t border-[#065F46]/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-xs text-[#4C635B] space-y-1">
              {authUser ? (
                <p className="text-[#065F46] font-semibold inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                  {language === 'en'
                    ? `Active session: ${authUser.name} (${authUser.role.toUpperCase()})`
                    : `Sesi aktif: ${authUser.name} (${authUser.role.toUpperCase()})`}
                </p>
              ) : (
                <p>{t.utilitySimNote}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {/* Language Switcher ID / EN */}
              <div
                role="group"
                aria-label="Pilihan Bahasa"
                className="inline-flex items-center bg-[#F2F6F4] border border-[#065F46]/15 rounded-lg p-1"
              >
                <Globe className="w-3.5 h-3.5 text-[#065F46] mx-1.5" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => setLanguage('id')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    language === 'id'
                      ? 'bg-white text-[#065F46] shadow-xs'
                      : 'text-[#4C635B] hover:text-[#0F241D]'
                  }`}
                >
                  ID
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    language === 'en'
                      ? 'bg-white text-[#065F46] shadow-xs'
                      : 'text-[#4C635B] hover:text-[#0F241D]'
                  }`}
                >
                  EN
                </button>
              </div>

              <button
                type="button"
                onClick={() => setFavoritesOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#78350F] bg-[#FBF6EE] hover:bg-[#F5EBD8] border border-[#B45309]/25 rounded-lg transition-colors cursor-pointer whitespace-nowrap tabular-nums"
              >
                <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                {t.utilitySaved} ({favorites.length})
              </button>

              {!authUser && (
                <button
                  type="button"
                  onClick={() => openLoginPage('user')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#065F46] bg-[#F2F6F4] hover:bg-[#E2EBE6] border border-[#065F46]/20 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
                  {language === 'en'
                    ? 'Login (User · Operator · Admin)'
                    : 'Portal Login (User · Operator · Admin)'}
                </button>
              )}

              <a
                href="/halalexpl-aceh-prototype.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#065F46] bg-white hover:bg-[#F2F6F4] border border-[#065F46]/20 rounded-lg transition-colors whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                {t.heroProtoLink}
              </a>
            </div>
          </div>

          {/* Subtle Acehnese geometric lattice band */}
          <div className="mt-8 h-6 w-full aceh-motif-band" aria-hidden="true" />
        </section>

        {/* Interactive SVG Map Section */}
        <AcehMapSvg
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
          destinations={destinations}
          t={t}
        />

        {/* Destinations Catalog */}
        <DestinationCatalog
          destinations={destinations}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
          favoriteIds={favoriteIdSet}
          onToggleFavorite={(id) => handleToggleFavorite(id, 'destinasi')}
          onSelectDetail={setDetailDest}
          onAddToItinerary={handleAddDestToItinerary}
          language={language}
          t={t}
        />

        {/* Culinary Halal & Muslim-Friendly Accommodations */}
        <CulinaryAndStays
          kulinerList={kulinerList}
          akomodasiList={accommodations}
          favoriteIds={favoriteIdSet}
          onToggleFavorite={handleToggleFavorite}
          onOpenWhatsAppDemo={(name, phone, region) =>
            setWaModalInfo({ name, phone, region })
          }
          language={language}
          t={t}
        />

        {/* Rule-Based Package Recommender + 1-5 Day Itinerary Planner + Budget Calculator */}
        <ItineraryAndRecommender
          itinerary={itinerary}
          onUpdateItinerary={handleUpdateItinerary}
          destinations={destinations}
          accommodations={accommodations}
          packages={packages}
          language={language}
          t={t}
        />

        {/* Role-Protected Operator & Admin CRUD Dashboard */}
        <AdminCrudDashboard
          authUser={authUser}
          authToken={authToken}
          onRequestLogin={openLoginPage}
          destinations={destinations}
          kulinerList={kulinerList}
          accommodations={accommodations}
          packages={packages}
          onSaveDestination={(item) => {
            const next = upsert(destinations, item);
            setDestinations(next);
            syncServerCatalog({ destinasi: next });
            showToast(language === 'en' ? 'Destination saved' : 'Destinasi disimpan');
          }}
          onDeleteDestination={(id) => {
            const next = destinations.filter((x) => x.id !== id);
            setDestinations(next);
            syncServerCatalog({ destinasi: next });
            showToast(language === 'en' ? 'Destination deleted' : 'Destinasi dihapus');
          }}
          onSaveKuliner={(item) => {
            const next = upsert(kulinerList, item);
            setKulinerList(next);
            syncServerCatalog({ kuliner: next });
            showToast(language === 'en' ? 'Culinary saved' : 'Kuliner disimpan');
          }}
          onDeleteKuliner={(id) => {
            const next = kulinerList.filter((x) => x.id !== id);
            setKulinerList(next);
            syncServerCatalog({ kuliner: next });
            showToast(language === 'en' ? 'Culinary deleted' : 'Kuliner dihapus');
          }}
          onSaveAkomodasi={(item) => {
            const next = upsert(accommodations, item);
            setAccommodations(next);
            syncServerCatalog({ akomodasi: next });
            showToast(language === 'en' ? 'Stay saved' : 'Akomodasi disimpan');
          }}
          onDeleteAkomodasi={(id) => {
            const next = accommodations.filter((x) => x.id !== id);
            setAccommodations(next);
            syncServerCatalog({ akomodasi: next });
            showToast(language === 'en' ? 'Stay deleted' : 'Akomodasi dihapus');
          }}
          onSavePaket={(item) => {
            const next = upsert(packages, item);
            setPackages(next);
            syncServerCatalog({ paket: next });
            showToast(language === 'en' ? 'Package saved' : 'Paket wisata disimpan');
          }}
          onDeletePaket={(id) => {
            const next = packages.filter((x) => x.id !== id);
            setPackages(next);
            syncServerCatalog({ paket: next });
            showToast(language === 'en' ? 'Package deleted' : 'Paket wisata dihapus');
          }}
          heroImageUrl={heroImageUrl}
          onUpdateHeroImageUrl={(nextUrl) => {
            setHeroImageUrl(nextUrl);
            syncServerCatalog({ heroImageUrl: nextUrl });
            showToast(
              language === 'en'
                ? 'Hero banner image updated'
                : 'Gambar banner utama diperbarui'
            );
          }}
          onResetAllData={handleResetAllData}
          language={language}
          t={t}
        />
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="bg-[#0F241D] text-[#E2EBE6] py-10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <p className="font-editorial text-lg font-semibold text-white">
              {t.brand}
            </p>
            <p className="text-xs text-[#A7BDB4] leading-relaxed">
              {t.footerDisclaimer}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-xs text-[#D0E0DA]">
            <a href="#destinasi" className="hover:text-white">
              {t.navDestinations}
            </a>
            <a href="#kuliner" className="hover:text-white">
              {t.navCulinary}
            </a>
            <a href="#itinerary" className="hover:text-white">
              {t.navItinerary}
            </a>
            <button
              type="button"
              onClick={() => openLoginPage('user')}
              className="underline underline-offset-4 hover:text-white cursor-pointer"
            >
              {t.loginBtn} (User · Operator · Admin)
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DestinationDetailModal
        dest={detailDest}
        onClose={() => setDetailDest(null)}
        isFavorite={detailDest ? favoriteIdSet.has(detailDest.id) : false}
        onToggleFavorite={(id) => handleToggleFavorite(id, 'destinasi')}
        onAddToItinerary={handleAddDestToItinerary}
        language={language}
        t={t}
      />

      <WhatsAppDemoModal
        info={waModalInfo}
        onClose={() => setWaModalInfo(null)}
        language={language}
        t={t}
      />

      <FavoritesModal
        open={favoritesOpen}
        onClose={() => setFavoritesOpen(false)}
        favorites={favorites}
        destinations={destinations}
        kulinerList={kulinerList}
        accommodations={accommodations}
        onRemoveFavorite={(id) => handleToggleFavorite(id)}
        t={t}
      />

      {/* Toast Feedback */}
      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 bg-[#0F241D] text-white text-xs font-medium px-4 py-3 rounded-lg shadow-lg border border-[#0D9488]/40"
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}

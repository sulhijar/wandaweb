import React, { useMemo, useState } from 'react';
import {
  Bookmark,
  ExternalLink,
  MapPin,
  Plus,
  RotateCcw,
  Search,
} from 'lucide-react';
import { KATEGORI_LIST, WILAYAH_LIST } from '../data/acehData';
import { Destinasi, KategoriWisata, Language, WilayahAceh } from '../types';

interface DestinationCatalogProps {
  destinations: Destinasi[];
  selectedRegion: WilayahAceh | 'Semua';
  onSelectRegion: (r: WilayahAceh | 'Semua') => void;
  favoriteIds: Set<string>;
  onToggleFavorite: (id: string) => void;
  onSelectDetail: (dest: Destinasi) => void;
  onAddToItinerary: (dest: Destinasi) => void;
  language: Language;
  t: Record<string, string>;
}

type SortOption = 'featured' | 'name' | 'price-low' | 'price-high';

export const formatIDR = (val: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);

export const DestinationCatalog: React.FC<DestinationCatalogProps> = ({
  destinations,
  selectedRegion,
  onSelectRegion,
  favoriteIds,
  onToggleFavorite,
  onSelectDetail,
  onAddToItinerary,
  language,
  t,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<KategoriWisata | 'Semua'>('Semua');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  const filteredDestinations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = destinations.filter((d) => {
      if (selectedRegion !== 'Semua' && d.wilayah !== selectedRegion) return false;
      if (selectedCategory !== 'Semua' && d.kategori !== selectedCategory) return false;
      if (!q) return true;
      return (
        d.nama.toLowerCase().includes(q) ||
        d.wilayah.toLowerCase().includes(q) ||
        d.kategori.toLowerCase().includes(q) ||
        d.deskripsi.toLowerCase().includes(q) ||
        d.fasilitasIbadah.some((f) => f.toLowerCase().includes(q))
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'featured') {
        if (a.unggulan !== b.unggulan) return a.unggulan ? -1 : 1;
        return a.nama.localeCompare(b.nama);
      }
      if (sortBy === 'name') return a.nama.localeCompare(b.nama);
      if (sortBy === 'price-low') return a.estimasiBiaya - b.estimasiBiaya;
      return b.estimasiBiaya - a.estimasiBiaya;
    });
  }, [destinations, searchQuery, selectedRegion, selectedCategory, sortBy]);

  const handleReset = () => {
    setSearchQuery('');
    onSelectRegion('Semua');
    setSelectedCategory('Semua');
    setSortBy('featured');
  };

  return (
    <section
      id="destinasi"
      aria-labelledby="catalog-heading"
      className="max-w-[1200px] mx-auto px-4 sm:px-6 py-14 border-b border-[#065F46]/10"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="space-y-2 max-w-2xl">
          <h2
            id="catalog-heading"
            className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F241D]"
          >
            {t.catalogTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#3D524A] leading-relaxed">
            {t.catalogSubtitle}
          </p>
        </div>
        <div className="text-xs font-mono text-[#065F46] tabular-nums shrink-0">
          {filteredDestinations.length} / {destinations.length}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-[#065F46]/15 rounded-xl p-4 sm:p-5 mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search
              className="w-4 h-4 text-[#4C635B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FAFBF9] border border-[#065F46]/20 rounded-lg text-[#0F241D] placeholder:text-[#6B8078] focus:outline-none focus:border-[#065F46]"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedRegion}
              onChange={(e) => onSelectRegion(e.target.value as WilayahAceh | 'Semua')}
              aria-label={t.filterRegionLabel}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAFBF9] border border-[#065F46]/20 rounded-lg text-[#0F241D] focus:outline-none focus:border-[#065F46]"
            >
              <option value="Semua">
                {t.filterRegionLabel}: {t.mapAllRegions}
              </option>
              {WILAYAH_LIST.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label={t.sortLabel}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAFBF9] border border-[#065F46]/20 rounded-lg text-[#0F241D] focus:outline-none focus:border-[#065F46]"
            >
              <option value="featured">{t.sortFeatured}</option>
              <option value="name">{t.sortName}</option>
              <option value="price-low">{t.sortPriceLow}</option>
              <option value="price-high">{t.sortPriceHigh}</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="button"
              onClick={handleReset}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-[#065F46] bg-[#F2F6F4] hover:bg-[#E2EBE6] border border-[#065F46]/15 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              {t.resetFilters}
            </button>
          </div>
        </div>

        {/* Interactive Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('Semua')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedCategory === 'Semua'
                ? 'bg-[#065F46] text-white'
                : 'bg-[#F2F6F4] text-[#3D524A] hover:text-[#0F241D]'
            }`}
          >
            {t.filterCategoryLabel}: {language === 'en' ? 'All' : 'Semua'}
          </button>
          {KATEGORI_LIST.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0D9488] text-white'
                  : 'bg-[#F2F6F4] text-[#3D524A] hover:text-[#0F241D]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      {filteredDestinations.length === 0 ? (
        <div className="bg-white border border-[#065F46]/15 rounded-xl p-10 text-center space-y-3">
          <p className="text-base text-[#3D524A]">{t.noResults}</p>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-[#065F46] text-white rounded-lg cursor-pointer"
          >
            {t.resetFilters}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((dest) => {
            const isFav = favoriteIds.has(dest.id);
            const desc =
              language === 'en' && dest.deskripsiEn ? dest.deskripsiEn : dest.deskripsi;
            const needsFieldCheck =
              dest.statusVerifikasiData === 'Data Awal - Perlu Verifikasi Lapangan';

            return (
              <article
                key={dest.id}
                className="bg-white border border-[#065F46]/15 rounded-xl overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div>
                  <div className="relative aspect-[4/3] bg-[#E3F0EA] overflow-hidden">
                    <img
                      src={dest.imageUrl}
                      alt={dest.nama}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/75 via-black/35 to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 text-white text-xs">
                      <span className="inline-flex items-center gap-1 font-medium truncate">
                        <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        {dest.wilayah}
                      </span>
                      <span className="font-mono tabular-nums shrink-0">
                        {dest.estimasiBiaya === 0
                          ? t.freeEntry
                          : `${formatIDR(dest.estimasiBiaya)}`}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    {/* Clean unboxed metadata (Zero-Pill Rule) */}
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-[#4C635B]">
                      <span className="font-semibold text-[#065F46]">{dest.kategori}</span>
                      <span aria-hidden="true">·</span>
                      <span>{dest.wilayah}</span>
                      {dest.unggulan && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-[#B45309]">
                            {language === 'en' ? 'Featured' : 'Unggulan'}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-[#0F241D] leading-snug">
                      {dest.nama}
                    </h3>

                    <p className="text-sm text-[#3D524A] leading-relaxed line-clamp-3">
                      {desc}
                    </p>

                    <div className="pt-2 border-t border-[#065F46]/10 space-y-1.5 text-xs text-[#3D524A]">
                      <p className="font-medium text-[#065F46]">
                        {t.prayerFacilities}:{' '}
                        <span className="font-normal text-[#3D524A]">
                          {dest.fasilitasIbadah[0]}
                        </span>
                      </p>
                      <p className="text-[11px] text-[#5B7068]">
                        {needsFieldCheck
                          ? language === 'en'
                            ? 'Initial record — field verification recommended'
                            : 'Data awal — verifikasi lapangan berkala diperlukan'
                          : language === 'en'
                            ? 'Reference verified · Simulated cost estimate'
                            : 'Terverifikasi referensi · Estimasi biaya simulasi'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectDetail(dest)}
                    className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-[#065F46] hover:bg-[#054E3A] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {t.viewDetails}
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddToItinerary(dest)}
                    title={t.addToItinerary}
                    aria-label={`${t.addToItinerary}: ${dest.nama}`}
                    className="px-3 py-2 text-xs font-medium text-[#065F46] bg-[#F2F6F4] hover:bg-[#E2EBE6] border border-[#065F46]/15 rounded-lg inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    Itinerary
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(dest.id)}
                    aria-label={isFav ? t.savedFavorite : t.saveFavorite}
                    aria-pressed={isFav}
                    className={`p-2 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                      isFav
                        ? 'bg-[#B45309] text-white border-[#B45309]'
                        : 'bg-white text-[#4C635B] border-[#065F46]/20 hover:border-[#B45309] hover:text-[#B45309]'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <a
                    href={dest.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t.mapOpenGmaps}: ${dest.nama}`}
                    className="p-2 rounded-lg border border-[#065F46]/20 text-[#0D9488] hover:bg-[#F2F6F4] transition-colors shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

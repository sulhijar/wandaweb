import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Bookmark,
  CheckCircle2,
  Clock,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { formatIDR } from './DestinationCatalog';
import { Akomodasi, Kuliner, Language, StatusSertifikasiHalal } from '../types';

interface CulinaryAndStaysProps {
  kulinerList: Kuliner[];
  akomodasiList: Akomodasi[];
  favoriteIds: Set<string>;
  onToggleFavorite: (id: string, tipe: 'kuliner' | 'akomodasi') => void;
  onOpenWhatsAppDemo: (name: string, phone: string, itemLabel: string) => void;
  language: Language;
  t: Record<string, string>;
}

export const CulinaryAndStays: React.FC<CulinaryAndStaysProps> = ({
  kulinerList,
  akomodasiList,
  favoriteIds,
  onToggleFavorite,
  onOpenWhatsAppDemo,
  language,
  t,
}) => {
  const [halalFilter, setHalalFilter] = useState<StatusSertifikasiHalal | 'Semua'>('Semua');

  const filteredKuliner = useMemo(() => {
    if (halalFilter === 'Semua') return kulinerList;
    return kulinerList.filter((k) => k.statusSertifikasiHalal === halalFilter);
  }, [kulinerList, halalFilter]);

  const renderHalalStatusLine = (status: StatusSertifikasiHalal) => {
    if (status === 'Tersertifikasi Halal') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#065F46]">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          {language === 'en' ? 'Halal Certified (Simulated)' : 'Tersertifikasi Halal (Simulasi)'}
        </span>
      );
    }
    if (status === 'Dalam Proses') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B45309]">
          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          {language === 'en' ? 'Certification In Process' : 'Dalam Proses Verifikasi'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B4423]">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        {language === 'en'
          ? 'Not Officially Certified (Self-Declared)'
          : 'Belum Tersertifikasi Resmi (Klaim Mandiri)'}
      </span>
    );
  };

  return (
    <>
      {/* Culinary & SME Halal Section */}
      <section
        id="kuliner"
        aria-labelledby="culinary-heading"
        className="max-w-[1200px] mx-auto px-4 sm:px-6 py-14 border-b border-[#065F46]/10"
      >
        <div className="space-y-3 max-w-3xl mb-6">
          <h2
            id="culinary-heading"
            className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F241D]"
          >
            {t.culinaryTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#3D524A] leading-relaxed">
            {t.culinarySubtitle}
          </p>
        </div>

        {/* Clear Editorial Notice: Halal Certification vs Muslim-Friendly */}
        <div className="bg-[#F2F6F4] border border-[#065F46]/15 rounded-xl p-4 sm:p-5 mb-6 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#065F46] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-[#0F241D]">{t.halalNoticeTitle}</p>
            <p className="text-[#3D524A] leading-relaxed">{t.halalNoticeBody}</p>
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(
            [
              { val: 'Semua', label: t.filterHalalAll },
              { val: 'Tersertifikasi Halal', label: t.filterHalalCertified },
              { val: 'Dalam Proses', label: t.filterHalalProcess },
              { val: 'Belum Tersertifikasi Resmi', label: t.filterHalalUnverified },
            ] as const
          ).map((item) => (
            <button
              key={item.val}
              type="button"
              onClick={() => setHalalFilter(item.val)}
              className={`px-3.5 py-2 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                halalFilter === item.val
                  ? 'bg-[#065F46] text-white border-[#065F46]'
                  : 'bg-white text-[#3D524A] border-[#065F46]/20 hover:border-[#065F46]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredKuliner.map((item) => {
            const isFav = favoriteIds.has(item.id);
            return (
              <article
                key={item.id}
                className="bg-white border border-[#065F46]/15 rounded-xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[4/3] bg-[#E3F0EA] overflow-hidden relative">
                    <img
                      src={item.imageUrl}
                      alt={item.nama}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-2.5">
                    <div className="text-xs text-[#4C635B] flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-[#0D9488]">{item.kategori}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.wilayah}</span>
                    </div>

                    <h3 className="text-base font-semibold text-[#0F241D] leading-snug">
                      {item.nama}
                    </h3>

                    <p className="text-sm font-mono font-semibold text-[#0F241D] tabular-nums">
                      {formatIDR(item.harga)}{' '}
                      <span className="text-[11px] font-sans font-normal text-[#5B7068]">
                        ({language === 'en' ? 'sim.' : 'simulasi'})
                      </span>
                    </p>

                    {item.deskripsi && (
                      <p className="text-xs text-[#3D524A] leading-relaxed line-clamp-2">
                        {item.deskripsi}
                      </p>
                    )}

                    <div className="pt-2 border-t border-[#065F46]/10 space-y-1">
                      {renderHalalStatusLine(item.statusSertifikasiHalal)}
                      <p className="text-[11px] text-[#5B7068] leading-snug">
                        {item.sumberVerifikasi}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenWhatsAppDemo(item.nama, item.kontak, item.wilayah)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#065F46] hover:bg-[#054E3A] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    WhatsApp (Demo)
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(item.id, 'kuliner')}
                    aria-label={isFav ? t.savedFavorite : t.saveFavorite}
                    aria-pressed={isFav}
                    className={`p-2 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                      isFav
                        ? 'bg-[#B45309] text-white border-[#B45309]'
                        : 'bg-white text-[#4C635B] border-[#065F46]/20 hover:border-[#B45309]'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Muslim-Friendly Accommodations Section */}
      <section
        id="akomodasi"
        aria-labelledby="stays-heading"
        className="max-w-[1200px] mx-auto px-4 sm:px-6 py-14 border-b border-[#065F46]/10"
      >
        <div className="space-y-2 max-w-2xl mb-8">
          <h2
            id="stays-heading"
            className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F241D]"
          >
            {t.staysTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#3D524A] leading-relaxed">
            {t.staysSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {akomodasiList.map((stay) => {
            const isFav = favoriteIds.has(stay.id);
            return (
              <article
                key={stay.id}
                className="bg-white border border-[#065F46]/15 rounded-xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[4/3] bg-[#E3F0EA] overflow-hidden">
                    <img
                      src={stay.imageUrl}
                      alt={stay.nama}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2 text-xs text-[#4C635B]">
                      <span className="font-semibold text-[#0D9488]">{stay.wilayah}</span>
                      <span className="font-mono font-semibold text-[#0F241D] tabular-nums">
                        {formatIDR(stay.hargaPerMalam)}{' '}
                        <span className="font-sans font-normal text-[#5B7068]">
                          {t.perNightSim}
                        </span>
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-[#0F241D] leading-snug">
                      {stay.nama}
                    </h3>

                    <div className="space-y-1 text-xs text-[#3D524A]">
                      <p className="font-semibold text-[#065F46]">
                        {t.muslimFriendlyFeatures}:
                      </p>
                      <ul className="space-y-1 list-disc list-inside">
                        {stay.fasilitasRamahMuslim.map((f, idx) => (
                          <li key={idx}>{f}</li>
                        ))}
                      </ul>
                    </div>

                    <p className="text-xs text-[#5B7068] pt-2 border-t border-[#065F46]/10">
                      {t.generalFacilities}: {stay.fasilitas.join(' · ')}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenWhatsAppDemo(stay.nama, stay.kontak, stay.wilayah)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#065F46] hover:bg-[#054E3A] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    {t.contactWhatsApp}
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(stay.id, 'akomodasi')}
                    aria-label={isFav ? t.savedFavorite : t.saveFavorite}
                    aria-pressed={isFav}
                    className={`p-2 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                      isFav
                        ? 'bg-[#B45309] text-white border-[#B45309]'
                        : 'bg-white text-[#4C635B] border-[#065F46]/20 hover:border-[#B45309]'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
};

import React from 'react';
import {
  Bookmark,
  Check,
  ExternalLink,
  MapPin,
  MessageCircle,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import {
  Akomodasi,
  Destinasi,
  Favorit,
  Kuliner,
  Language,
} from '../types';
import { formatIDR } from './DestinationCatalog';

interface DetailModalProps {
  dest: Destinasi | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onAddToItinerary: (dest: Destinasi) => void;
  language: Language;
  t: Record<string, string>;
}

export const DestinationDetailModal: React.FC<DetailModalProps> = ({
  dest,
  onClose,
  isFavorite,
  onToggleFavorite,
  onAddToItinerary,
  language,
  t,
}) => {
  if (!dest) return null;
  const desc = language === 'en' && dest.deskripsiEn ? dest.deskripsiEn : dest.deskripsi;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
      className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#065F46]/20 rounded-xl max-w-2xl w-full overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[16/9] bg-[#E3F0EA]">
          <img
            src={dest.imageUrl}
            alt={dest.nama}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="absolute top-3 right-3 p-2 rounded-lg bg-white/95 text-[#0F241D] hover:bg-white cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#4C635B]">
              <span className="font-semibold text-[#065F46]">{dest.kategori}</span>
              <span aria-hidden="true">·</span>
              <span>{dest.wilayah}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {dest.estimasiBiaya === 0
                  ? t.freeEntry
                  : `${formatIDR(dest.estimasiBiaya)} (${t.simPriceLabel})`}
              </span>
            </div>
            <h3
              id="detail-modal-title"
              className="text-2xl font-semibold text-[#0F241D]"
            >
              {dest.nama}
            </h3>
            <p className="text-xs text-[#4C635B] inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#065F46]" aria-hidden="true" />
              {dest.alamat}
            </p>
          </div>

          <p className="text-sm text-[#3D524A] leading-relaxed">{desc}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#065F46]/10">
            <div className="space-y-2 bg-[#F2F6F4] p-4 rounded-lg">
              <h4 className="text-xs font-semibold text-[#065F46]">
                {t.prayerFacilities}
              </h4>
              <ul className="space-y-1.5 text-xs text-[#0F241D]">
                {dest.fasilitasIbadah.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <Check
                      className="w-3.5 h-3.5 text-[#065F46] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 bg-[#FAFBF9] border border-[#065F46]/10 p-4 rounded-lg">
              <h4 className="text-xs font-semibold text-[#0F241D]">
                {t.generalFacilities}
              </h4>
              <ul className="space-y-1.5 text-xs text-[#3D524A] list-disc list-inside">
                {dest.fasilitas.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-xs text-[#5B7068] border-t border-[#065F46]/10 pt-3">
            <strong>{t.verificationStatus}:</strong>{' '}
            {dest.statusVerifikasiData || 'Data Awal - Perlu Verifikasi Lapangan'}.{' '}
            {language === 'en'
              ? 'Note: Muslim-friendly facilities are separate from official BPJPH food halal certification.'
              : 'Catatan: Ketersediaan fasilitas ibadah ramah Muslim berbeda dengan sertifikasi halal resmi produk pangan.'}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                onAddToItinerary(dest);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#065F46] hover:bg-[#054E3A] rounded-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              {t.addToItinerary}
            </button>
            <button
              type="button"
              onClick={() => onToggleFavorite(dest.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border cursor-pointer ${
                isFavorite
                  ? 'bg-[#B45309] text-white border-[#B45309]'
                  : 'bg-white text-[#0F241D] border-[#065F46]/25'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
              {isFavorite ? t.savedFavorite : t.saveFavorite}
            </button>
            <a
              href={dest.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0D9488] bg-[#F2F6F4] hover:bg-[#E2EBE6] rounded-lg"
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              {t.mapOpenGmaps}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

interface WhatsAppModalProps {
  info: { name: string; phone: string; region: string } | null;
  onClose: () => void;
  language: Language;
  t: Record<string, string>;
}

export const WhatsAppDemoModal: React.FC<WhatsAppModalProps> = ({
  info,
  onClose,
  language,
  t,
}) => {
  if (!info) return null;

  const cleanDigits = info.phone.replace(/[^0-9]/g, '');
  const message =
    language === 'en'
      ? `Assalamu'alaikum, I found "${info.name}" (${info.region}) on HalalExpl Aceh and would like to inquire about availability.`
      : `Assalamu'alaikum, saya melihat "${info.name}" (${info.region}) di HalalExpl Aceh dan ingin menanyakan informasi layanan.`;
  const waUrl = `https://wa.me/${cleanDigits}?text=${encodeURIComponent(message)}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wa-modal-title"
      className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#065F46]/20 rounded-xl max-w-md w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 id="wa-modal-title" className="text-lg font-semibold text-[#0F241D]">
            {t.waModalTitle}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="p-1.5 text-[#4C635B] hover:text-[#0F241D] cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <p className="text-xs text-[#6B4423] bg-[#FBF6EE] border border-[#B45309]/25 rounded-lg p-3 leading-relaxed">
          {t.waModalWarning}
        </p>

        <div className="space-y-2 text-sm">
          <p className="text-[#3D524A]">
            <strong>UMKM / Layanan:</strong> {info.name}
          </p>
          <p className="text-[#3D524A] font-mono">
            <strong className="font-sans">Kontak Simulasi:</strong> {info.phone}
          </p>
          <div className="bg-[#FAFBF9] border border-[#065F46]/15 rounded-lg p-3 text-xs text-[#0F241D] leading-relaxed">
            {message}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#3D524A] bg-[#F2F6F4] rounded-lg cursor-pointer"
          >
            {t.close}
          </button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#065F46] hover:bg-[#054E3A] rounded-lg"
          >
            <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
            {t.waOpenLink}
          </a>
        </div>
      </div>
    </div>
  );
};

interface FavoritesDrawerProps {
  open: boolean;
  onClose: () => void;
  favorites: Favorit[];
  destinations: Destinasi[];
  kulinerList: Kuliner[];
  accommodations: Akomodasi[];
  onRemoveFavorite: (itemId: string) => void;
  t: Record<string, string>;
}

export const FavoritesModal: React.FC<FavoritesDrawerProps> = ({
  open,
  onClose,
  favorites,
  destinations,
  kulinerList,
  accommodations,
  onRemoveFavorite,
  t,
}) => {
  if (!open) return null;

  const resolveItem = (fav: Favorit) => {
    if (fav.tipeItem === 'destinasi') {
      const d = destinations.find((x) => x.id === fav.itemId);
      return d ? { name: d.nama, sub: `${d.wilayah} · ${d.kategori}` } : null;
    }
    if (fav.tipeItem === 'kuliner') {
      const k = kulinerList.find((x) => x.id === fav.itemId);
      return k ? { name: k.nama, sub: `${k.wilayah} · ${k.statusSertifikasiHalal}` } : null;
    }
    const a = accommodations.find((x) => x.id === fav.itemId);
    return a ? { name: a.nama, sub: `${a.wilayah} · ${formatIDR(a.hargaPerMalam)}` } : null;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="fav-modal-title"
      className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#065F46]/20 rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#065F46]/10 pb-3">
          <h3 id="fav-modal-title" className="text-lg font-semibold text-[#0F241D]">
            {t.favoritesDrawerTitle} ({favorites.length})
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="p-1.5 text-[#4C635B] hover:text-[#0F241D] cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {favorites.length === 0 ? (
          <p className="text-sm text-[#4C635B] py-4">{t.favoritesEmpty}</p>
        ) : (
          <ul className="divide-y divide-[#065F46]/10">
            {favorites.map((fav) => {
              const resolved = resolveItem(fav);
              if (!resolved) return null;
              return (
                <li
                  key={fav.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0F241D] truncate">
                      {resolved.name}
                    </p>
                    <p className="text-xs text-[#4C635B] truncate">{resolved.sub}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveFavorite(fav.itemId)}
                    aria-label={`Remove ${resolved.name}`}
                    className="p-2 text-red-700 hover:bg-red-50 rounded-md cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

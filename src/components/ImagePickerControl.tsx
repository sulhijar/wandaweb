import React, { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Upload } from 'lucide-react';
import {
  IMG_AKOMODASI_RESORT,
  IMG_GAYO_HIGHLANDS,
  IMG_HERO_MOSQUE,
  IMG_KULINER_MIE,
  IMG_SABANG_MARINE,
} from '../data/acehData';
import { Language } from '../types';

export const ACEH_IMAGE_PRESETS = [
  { labelId: 'Masjid Baiturrahman', labelEn: 'Baiturrahman Mosque', url: IMG_HERO_MOSQUE },
  { labelId: 'Bahari Sabang', labelEn: 'Sabang Marine', url: IMG_SABANG_MARINE },
  { labelId: 'Dataran Tinggi Gayo', labelEn: 'Gayo Highlands', url: IMG_GAYO_HIGHLANDS },
  { labelId: 'Kuliner Mie & Kopi', labelEn: 'Aceh Culinary', url: IMG_KULINER_MIE },
  { labelId: 'Eco-Villa Pesisir', labelEn: 'Coastal Villa', url: IMG_AKOMODASI_RESORT },
];

export function isSafeImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  return (
    trimmed.startsWith('/src/assets/images/') ||
    trimmed.startsWith('/api/media/') ||
    trimmed.startsWith('https://')
  );
}

interface ImagePickerControlProps {
  value: string;
  onChange: (nextUrl: string) => void;
  authToken: string | null;
  language: Language;
  label?: string;
}

export const ImagePickerControl: React.FC<ImagePickerControlProps> = ({
  value,
  onChange,
  authToken,
  language,
  label,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState(value);

  useEffect(() => {
    setUrlInput(value);
    setUploadErr(null);
  }, [value]);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadErr(null);

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setUploadErr(
        language === 'en'
          ? 'Only PNG, JPG, or WEBP images are supported.'
          : 'Format gambar harus PNG, JPG, atau WEBP.'
      );
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadErr(
        language === 'en' ? 'Maximum image size is 2 MB.' : 'Ukuran gambar maksimal 2 MB.'
      );
      return;
    }

    setUploading(true);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = typeof reader.result === 'string' ? reader.result : '';
          const commaIdx = result.indexOf(',');
          resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : '');
        };
        reader.onerror = () => reject(new Error('Read failed'));
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          base64Data,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadErr(data.error || 'Gagal mengunggah gambar.');
        return;
      }
      onChange(data.imageUrl);
      setUrlInput(data.imageUrl);
    } catch {
      setUploadErr(
        language === 'en' ? 'Image upload failed.' : 'Gagal mengunggah gambar.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleManualUrlChange = (raw: string) => {
    setUrlInput(raw);
    setUploadErr(null);
    if (isSafeImageUrl(raw)) {
      onChange(raw.trim());
    } else if (raw.trim().length > 0) {
      setUploadErr(
        language === 'en'
          ? 'Use an uploaded image, gallery preset, or https:// URL.'
          : 'Gunakan gambar unggahan, galeri preset, atau tautan https:// yang valid.'
      );
    }
  };

  const displayUrl = isSafeImageUrl(value) ? value : IMG_HERO_MOSQUE;

  return (
    <div className="bg-[#FAFBF9] border border-[#065F46]/15 rounded-lg p-4 space-y-3">
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="w-36 h-24 rounded-lg overflow-hidden bg-[#E3F0EA] border border-[#065F46]/15 shrink-0">
          <img
            src={displayUrl}
            alt="Pratinjau gambar pariwisata"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 space-y-2.5 w-full">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#0F241D] inline-flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#065F46]" aria-hidden="true" />
              {label ||
                (language === 'en'
                  ? 'Tourism Photo (Upload or Choose Preset)'
                  : 'Gambar Pariwisata (Unggah atau Pilih Galeri)')}
            </span>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileSelected}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#065F46] hover:bg-[#054E3A] disabled:opacity-60 rounded-md cursor-pointer whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
              {uploading
                ? language === 'en'
                  ? 'Uploading...'
                  : 'Mengunggah...'
                : language === 'en'
                  ? 'Upload Image'
                  : 'Unggah Gambar Baru'}
            </button>
          </div>

          {/* Preset Quick-Pick Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {ACEH_IMAGE_PRESETS.map((preset) => {
              const active = value === preset.url;
              return (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => {
                    onChange(preset.url);
                    setUrlInput(preset.url);
                    setUploadErr(null);
                  }}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded border transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#0D9488] text-white border-[#0D9488]'
                      : 'bg-white text-[#3D524A] border-[#065F46]/20 hover:border-[#0D9488]'
                  }`}
                >
                  {language === 'en' ? preset.labelEn : preset.labelId}
                </button>
              );
            })}
          </div>

          <input
            type="text"
            value={urlInput}
            onChange={(e) => handleManualUrlChange(e.target.value)}
            placeholder="/src/assets/images/... atau https://..."
            aria-label="URL Gambar"
            className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#065F46]/20 rounded-md text-[#0F241D]"
          />

          {uploadErr && (
            <p className="text-[11px] font-medium text-red-700">{uploadErr}</p>
          )}
        </div>
      </div>
    </div>
  );
};

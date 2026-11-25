import React from 'react';
import { ExternalLink, MapPin } from 'lucide-react';
import { Destinasi, WilayahAceh } from '../types';

interface AcehMapSvgProps {
  selectedRegion: WilayahAceh | 'Semua';
  onSelectRegion: (region: WilayahAceh | 'Semua') => void;
  destinations: Destinasi[];
  t: Record<string, string>;
}

const REGION_NODES: Array<{
  region: WilayahAceh;
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  taglineId: string;
  taglineEn: string;
  mapsQuery: string;
}> = [
  {
    region: 'Sabang',
    x: 112,
    y: 72,
    labelX: 138,
    labelY: 66,
    taglineId: 'Pulau Weh · Bahari & Nol Km',
    taglineEn: 'Weh Island · Marine & Zero Km',
    mapsQuery: 'https://www.google.com/maps/search/?api=1&query=Sabang+Pulau+Weh+Aceh',
  },
  {
    region: 'Banda Aceh',
    x: 146,
    y: 162,
    labelX: 168,
    labelY: 150,
    taglineId: 'Pusat Sejarah & Religi',
    taglineEn: 'Heritage & Spiritual Center',
    mapsQuery: 'https://www.google.com/maps/search/?api=1&query=Banda+Aceh+Indonesia',
  },
  {
    region: 'Aceh Besar',
    x: 185,
    y: 222,
    labelX: 208,
    labelY: 228,
    taglineId: 'Pesisir Lampuuk & Lembah Seulawah',
    taglineEn: 'Lampuuk Coast & Seulawah Valley',
    mapsQuery: 'https://www.google.com/maps/search/?api=1&query=Aceh+Besar+Indonesia',
  },
  {
    region: 'Bener Meriah',
    x: 372,
    y: 238,
    labelX: 394,
    labelY: 230,
    taglineId: 'Lereng Burni Telong & Agrowisata',
    taglineEn: 'Burni Telong & Highland Farms',
    mapsQuery: 'https://www.google.com/maps/search/?api=1&query=Bener+Meriah+Aceh',
  },
  {
    region: 'Aceh Tengah',
    x: 348,
    y: 298,
    labelX: 372,
    labelY: 304,
    taglineId: 'Danau Lut Tawar & Kopi Gayo',
    taglineEn: 'Lake Lut Tawar & Gayo Coffee',
    mapsQuery: 'https://www.google.com/maps/search/?api=1&query=Takengon+Aceh+Tengah',
  },
];

export const AcehMapSvg: React.FC<AcehMapSvgProps> = ({
  selectedRegion,
  onSelectRegion,
  destinations,
  t,
}) => {
  const countByRegion = (r: WilayahAceh) =>
    destinations.filter((d) => d.wilayah === r).length;

  const activeNode = REGION_NODES.find((n) => n.region === selectedRegion);

  return (
    <section
      aria-labelledby="map-heading"
      className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 border-b border-[#065F46]/10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-5 space-y-5">
          <div className="space-y-2">
            <h2
              id="map-heading"
              className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F241D]"
            >
              {t.mapTitle}
            </h2>
            <p className="text-sm sm:text-base text-[#3D524A] leading-relaxed">
              {t.mapSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onSelectRegion('Semua')}
              className={`px-3.5 py-2 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedRegion === 'Semua'
                  ? 'bg-[#065F46] text-white border-[#065F46]'
                  : 'bg-white text-[#0F241D] border-[#065F46]/20 hover:border-[#065F46]/50'
              }`}
            >
              {t.mapAllRegions} ({destinations.length})
            </button>
            {REGION_NODES.map((node) => {
              const isSelected = selectedRegion === node.region;
              return (
                <button
                  key={node.region}
                  type="button"
                  onClick={() => onSelectRegion(node.region)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                    isSelected
                      ? 'bg-[#0D9488] text-white border-[#0D9488]'
                      : 'bg-white text-[#0F241D] border-[#065F46]/20 hover:border-[#0D9488]'
                  }`}
                >
                  {node.region} ({countByRegion(node.region)})
                </button>
              );
            })}
          </div>

          {activeNode ? (
            <div className="p-4 bg-[#F2F6F4] border border-[#065F46]/15 rounded-lg space-y-2">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-[#0F241D] font-sans">
                  {activeNode.region}
                </h3>
                <span className="text-xs font-mono text-[#065F46] tabular-nums">
                  {countByRegion(activeNode.region)} destinasi
                </span>
              </div>
              <p className="text-sm text-[#3D524A]">
                {t.brand === 'HalalExpl Aceh' && t.navCta === 'Plan Trip'
                  ? activeNode.taglineEn
                  : activeNode.taglineId}
              </p>
              <a
                href={activeNode.mapsQuery}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#065F46] hover:text-[#0D9488] underline underline-offset-4 pt-1"
              >
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                {t.mapOpenGmaps}
              </a>
            </div>
          ) : (
            <div className="p-4 bg-[#F2F6F4] border border-[#065F46]/15 rounded-lg text-sm text-[#3D524A]">
              {t.navCta === 'Plan Trip'
                ? 'Click any emerald pin on the map to filter destinations in Banda Aceh, Sabang, Aceh Besar, Aceh Tengah, or Bener Meriah.'
                : 'Klik salah satu titik wilayah pada peta untuk menyaring katalog destinasi di Banda Aceh, Sabang, Aceh Besar, Aceh Tengah, atau Bener Meriah.'}
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          <div className="relative bg-white border border-[#065F46]/15 rounded-xl p-3 sm:p-4 overflow-hidden">
            <svg
              viewBox="0 0 600 380"
              role="img"
              aria-label="Peta Ilustratif Wilayah Wisata Halal Aceh"
              className="w-full h-auto rounded-lg bg-[#EBF5F3]"
            >
              <defs>
                <pattern id="seaGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path
                    d="M 24 0 L 0 0 0 24"
                    fill="none"
                    stroke="#0D9488"
                    strokeOpacity="0.08"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>

              {/* Sea grid background */}
              <rect width="600" height="380" fill="url(#seaGrid)" />

              {/* Sea label */}
              <text
                x="44"
                y="34"
                fill="#0D9488"
                fillOpacity="0.6"
                fontSize="11"
                fontFamily="JetBrains Mono, monospace"
                letterSpacing="1.5"
              >
                SAMUDRA HINDIA / SELAT MALAKA
              </text>

              {/* Pulau Weh (Sabang) silhouette */}
              <path
                d="M 88 64 C 98 48, 128 50, 134 68 C 138 82, 122 96, 102 92 C 86 88, 80 76, 88 64 Z"
                fill="#D7EAE2"
                stroke="#065F46"
                strokeWidth="1.5"
              />
              {/* Pulau Breueh / Aceh Islands */}
              <path
                d="M 74 114 C 84 106, 98 112, 95 124 C 90 132, 74 128, 74 114 Z"
                fill="#D7EAE2"
                stroke="#065F46"
                strokeOpacity="0.6"
                strokeWidth="1"
              />

              {/* Northern Sumatra / Aceh Mainland illustrative coastline */}
              <path
                d="M 118 158 C 134 142, 178 144, 212 162 C 258 186, 330 180, 412 172 C 470 166, 526 184, 566 206 L 566 365 L 154 365 C 132 320, 124 268, 114 218 C 108 188, 108 172, 118 158 Z"
                fill="#F7FAF8"
                stroke="#065F46"
                strokeWidth="1.75"
              />

              {/* Gayo Highland contour accents */}
              <path
                d="M 278 242 C 315 212, 398 206, 442 238 C 468 258, 448 326, 386 334 C 324 342, 260 302, 278 242 Z"
                fill="#E3F0EA"
                stroke="#065F46"
                strokeOpacity="0.25"
                strokeDasharray="4 4"
              />

              {/* Danau Lut Tawar shape */}
              <ellipse cx="348" cy="296" rx="18" ry="8" fill="#0D9488" fillOpacity="0.35" />

              {/* Ferry dashed route Banda Aceh - Sabang */}
              <path
                d="M 146 162 Q 124 118 112 72"
                fill="none"
                stroke="#B45309"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Highland road route Banda Aceh - Aceh Besar - Bener Meriah - Aceh Tengah */}
              <path
                d="M 146 162 L 185 222 Q 275 218 372 238 L 348 298"
                fill="none"
                stroke="#065F46"
                strokeOpacity="0.35"
                strokeWidth="1.5"
              />

              {/* Interactive Region Pins */}
              {REGION_NODES.map((node) => {
                const isActive = selectedRegion === node.region;
                const count = countByRegion(node.region);
                return (
                  <g
                    key={node.region}
                    role="button"
                    tabIndex={0}
                    aria-label={`${node.region} (${count})`}
                    onClick={() => onSelectRegion(node.region)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectRegion(node.region);
                      }
                    }}
                    className="cursor-pointer focus:outline-none"
                  >
                    {isActive && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="18"
                        fill="#B45309"
                        fillOpacity="0.18"
                        stroke="#B45309"
                        strokeWidth="1.5"
                      />
                    )}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isActive ? 10 : 8}
                      fill={isActive ? '#B45309' : '#065F46'}
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                    />
                    <text
                      x={node.labelX}
                      y={node.labelY}
                      fontSize="12"
                      fontWeight={isActive ? '700' : '600'}
                      fill={isActive ? '#78350F' : '#0F241D'}
                      fontFamily="Plus Jakarta Sans, sans-serif"
                    >
                      {node.region} ({count})
                    </text>
                  </g>
                );
              })}

              {/* Compass */}
              <g transform="translate(544, 48)">
                <circle cx="0" cy="0" r="18" fill="#FFFFFF" stroke="#065F46" strokeOpacity="0.25" />
                <path d="M 0 -11 L 4 2 L 0 -1 L -4 2 Z" fill="#B45309" />
                <text
                  x="0"
                  y="12"
                  textAnchor="middle"
                  fontSize="8"
                  fontFamily="JetBrains Mono, monospace"
                  fill="#065F46"
                >
                  U/N
                </text>
              </g>
            </svg>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#4C635B] px-1">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#065F46]" aria-hidden="true" />
                {t.navCta === 'Plan Trip'
                  ? 'Illustrative offline-ready SVG map · No API key required'
                  : 'Peta vektor ilustratif luring · Tanpa API key'}
              </span>
              <span className="font-mono tabular-nums">5 Kab/Kota · {destinations.length} Destinasi</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

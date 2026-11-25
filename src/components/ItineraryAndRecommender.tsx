import React, { useMemo, useState } from 'react';
import { Calculator, Calendar, Compass, Plus, Trash2, Users } from 'lucide-react';
import { KATEGORI_LIST } from '../data/acehData';
import {
  Akomodasi,
  Destinasi,
  Itinerary,
  KategoriWisata,
  Language,
  PaketWisata,
} from '../types';
import { formatIDR } from './DestinationCatalog';

interface ItineraryAndRecommenderProps {
  itinerary: Itinerary;
  onUpdateItinerary: (updated: Itinerary) => void;
  destinations: Destinasi[];
  accommodations: Akomodasi[];
  packages: PaketWisata[];
  language: Language;
  t: Record<string, string>;
}

export const ItineraryAndRecommender: React.FC<ItineraryAndRecommenderProps> = ({
  itinerary,
  onUpdateItinerary,
  destinations,
  accommodations,
  packages,
  language,
  t,
}) => {
  // Rule-based package recommender state
  const [selectedInterests, setSelectedInterests] = useState<KategoriWisata[]>([
    'Religi',
    'Bahari',
  ]);
  const [maxDuration, setMaxDuration] = useState<number>(5);
  const [maxBudgetPerPerson, setMaxBudgetPerPerson] = useState<number>(2000000);

  // Quick activity adder state
  const [selectedDestId, setSelectedDestId] = useState<string>(
    destinations[0]?.id ?? ''
  );
  const [targetDay, setTargetDay] = useState<number>(1);
  const [selectedStayId, setSelectedStayId] = useState<string>(
    accommodations[0]?.id ?? ''
  );

  // Rule-based filtering & scoring
  const recommendedPackages = useMemo(() => {
    return packages
      .filter((pkg) => pkg.durasi <= maxDuration && pkg.estimasiBiaya <= maxBudgetPerPerson)
      .map((pkg) => {
        const pkgCats =
          pkg.kategoriMinat && pkg.kategoriMinat.length > 0
            ? pkg.kategoriMinat
            : pkg.daftarDestinasi
                .map((id) => destinations.find((d) => d.id === id)?.kategori)
                .filter((x): x is KategoriWisata => Boolean(x));

        const matchedInterests = selectedInterests.filter((cat) =>
          pkgCats.includes(cat)
        );
        return {
          pkg,
          score: matchedInterests.length,
          matchedInterests,
        };
      })
      .filter((entry) => selectedInterests.length === 0 || entry.score > 0)
      .sort((a, b) => b.score - a.score || a.pkg.estimasiBiaya - b.pkg.estimasiBiaya);
  }, [packages, destinations, selectedInterests, maxDuration, maxBudgetPerPerson]);

  const toggleInterest = (cat: KategoriWisata) => {
    setSelectedInterests((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Budget calculator computation
  const budgetSummary = useMemo(() => {
    const travelers = Math.max(1, itinerary.jumlahWisatawan);
    const days = Math.min(5, Math.max(1, itinerary.jumlahHari));
    const nights = Math.max(0, days - 1);

    const ticketsTotal = itinerary.daftarAktivitas
      .filter((a) => a.hariKe <= days)
      .reduce((sum, a) => sum + a.estimasiBiaya * travelers, 0);

    // Simulated meal cost: IDR 120,000 / traveler / day (3 halal meals)
    const mealsTotal = days * travelers * 120000;

    // Simulated lodging cost: 1 room per 2 travelers
    const selectedStay = accommodations.find((a) => a.id === selectedStayId);
    const nightlyRate = selectedStay ? selectedStay.hargaPerMalam : 420000;
    const rooms = Math.ceil(travelers / 2);
    const lodgingTotal = nights * rooms * nightlyRate;

    // Simulated local transport cost: IDR 250,000 / day + ferry estimate if Sabang visited
    const hasSabang = itinerary.daftarAktivitas.some(
      (a) => a.hariKe <= days && a.wilayah === 'Sabang'
    );
    const transportTotal = days * 250000 + (hasSabang ? travelers * 200000 : 0);

    const grandTotal = ticketsTotal + mealsTotal + lodgingTotal + transportTotal;
    return {
      ticketsTotal,
      mealsTotal,
      lodgingTotal,
      transportTotal,
      grandTotal,
      perPerson: Math.round(grandTotal / travelers),
      rooms,
      nights,
    };
  }, [itinerary, accommodations, selectedStayId]);

  const handleApplyPackage = (pkg: PaketWisata) => {
    const days = Math.min(5, Math.max(1, pkg.durasi));
    const activities = pkg.daftarDestinasi
      .map((destId, idx) => {
        const dest = destinations.find((d) => d.id === destId);
        if (!dest) return null;
        return {
          id: `act-pkg-${Date.now()}-${idx}`,
          hariKe: (idx % days) + 1,
          itemId: dest.id,
          tipeItem: 'destinasi' as const,
          nama: dest.nama,
          wilayah: dest.wilayah,
          estimasiBiaya: dest.estimasiBiaya,
          catatan: `${pkg.nama}`,
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));

    onUpdateItinerary({
      ...itinerary,
      namaPerjalanan: pkg.nama,
      jumlahHari: days,
      daftarAktivitas: activities,
      totalAnggaran: budgetSummary.grandTotal,
    });
    setTargetDay(1);
  };

  const handleAddActivity = () => {
    const dest = destinations.find((d) => d.id === selectedDestId);
    if (!dest) return;
    const dayClamped = Math.min(itinerary.jumlahHari, Math.max(1, targetDay));
    const nextActivity = {
      id: `act-${Date.now()}`,
      hariKe: dayClamped,
      itemId: dest.id,
      tipeItem: 'destinasi' as const,
      nama: dest.nama,
      wilayah: dest.wilayah,
      estimasiBiaya: dest.estimasiBiaya,
      catatan: dest.fasilitasIbadah[0] || '',
    };
    onUpdateItinerary({
      ...itinerary,
      daftarAktivitas: [...itinerary.daftarAktivitas, nextActivity],
    });
  };

  const handleRemoveActivity = (actId: string) => {
    onUpdateItinerary({
      ...itinerary,
      daftarAktivitas: itinerary.daftarAktivitas.filter((a) => a.id !== actId),
    });
  };

  return (
    <div id="itinerary" className="border-b border-[#065F46]/10">
      {/* Rule-Based Package Recommender */}
      <section
        aria-labelledby="recommender-heading"
        className="max-w-[1200px] mx-auto px-4 sm:px-6 py-14 border-b border-[#065F46]/10"
      >
        <div className="space-y-2 max-w-2xl mb-8">
          <h2
            id="recommender-heading"
            className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F241D]"
          >
            {t.recommenderTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#3D524A] leading-relaxed">
            {t.recommenderSubtitle}
          </p>
        </div>

        <div className="bg-white border border-[#065F46]/15 rounded-xl p-5 mb-8 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-2">
              <label className="block text-xs font-semibold text-[#0F241D]">
                {t.interestLabel}
              </label>
              <div className="flex flex-wrap gap-2">
                {KATEGORI_LIST.map((cat) => {
                  const active = selectedInterests.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleInterest(cat)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-[#065F46] text-white border-[#065F46]'
                          : 'bg-[#FAFBF9] text-[#3D524A] border-[#065F46]/20 hover:border-[#065F46]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-3 space-y-2">
              <label
                htmlFor="rec-duration"
                className="block text-xs font-semibold text-[#0F241D]"
              >
                {t.maxDurationLabel}:{' '}
                <span className="font-mono text-[#065F46]">{maxDuration} {language === 'en' ? 'days' : 'hari'}</span>
              </label>
              <input
                id="rec-duration"
                type="range"
                min={1}
                max={5}
                value={maxDuration}
                onChange={(e) => setMaxDuration(Number(e.target.value))}
                className="w-full accent-[#065F46]"
              />
            </div>

            <div className="lg:col-span-3 space-y-2">
              <label
                htmlFor="rec-budget"
                className="block text-xs font-semibold text-[#0F241D]"
              >
                {t.maxBudgetLabel}:{' '}
                <span className="font-mono text-[#065F46] tabular-nums">
                  {formatIDR(maxBudgetPerPerson)}
                </span>
              </label>
              <input
                id="rec-budget"
                type="range"
                min={400000}
                max={3500000}
                step={100000}
                value={maxBudgetPerPerson}
                onChange={(e) => setMaxBudgetPerPerson(Number(e.target.value))}
                className="w-full accent-[#0D9488]"
              />
            </div>
          </div>
        </div>

        {recommendedPackages.length === 0 ? (
          <div className="bg-[#F2F6F4] border border-[#065F46]/15 rounded-xl p-6 text-sm text-[#3D524A]">
            {t.noPackageMatch}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedPackages.map(({ pkg, matchedInterests }) => (
              <article
                key={pkg.id}
                className="bg-white border border-[#065F46]/15 rounded-xl p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-[#4C635B]">
                    <span className="font-semibold text-[#0D9488]">
                      {pkg.durasi} {language === 'en' ? 'Days' : 'Hari'} · {pkg.daftarDestinasi.length}{' '}
                      {language === 'en' ? 'Stops' : 'Destinasi'}
                    </span>
                    <span className="font-mono font-semibold text-[#0F241D] tabular-nums">
                      {formatIDR(pkg.estimasiBiaya)}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-[#0F241D] leading-snug">
                    {pkg.nama}
                  </h3>

                  <p className="text-sm text-[#3D524A] leading-relaxed">
                    {pkg.deskripsi}
                  </p>

                  <p className="text-xs text-[#065F46] pt-2 border-t border-[#065F46]/10">
                    <span className="font-semibold">{t.matchReason}:</span>{' '}
                    {matchedInterests.length > 0
                      ? matchedInterests.join(', ')
                      : language === 'en'
                        ? 'Matches duration & budget'
                        : 'Sesuai durasi & batas anggaran'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyPackage(pkg)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#065F46] hover:bg-[#054E3A] rounded-lg transition-colors cursor-pointer"
                >
                  <Compass className="w-4 h-4" aria-hidden="true" />
                  {t.applyPackageBtn}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Itinerary Planner + Budget Calculator */}
      <section
        aria-labelledby="itinerary-heading"
        className="max-w-[1200px] mx-auto px-4 sm:px-6 py-14"
      >
        <div className="space-y-2 max-w-2xl mb-8">
          <h2
            id="itinerary-heading"
            className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0F241D]"
          >
            {t.itineraryTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#3D524A] leading-relaxed">
            {t.itinerarySubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Itinerary Controls & Day-by-day list */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-[#065F46]/15 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label
                  htmlFor="itin-name"
                  className="block text-xs font-semibold text-[#0F241D]"
                >
                  {t.tripName}
                </label>
                <input
                  id="itin-name"
                  type="text"
                  value={itinerary.namaPerjalanan}
                  onChange={(e) =>
                    onUpdateItinerary({ ...itinerary, namaPerjalanan: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm bg-[#FAFBF9] border border-[#065F46]/20 rounded-lg text-[#0F241D] focus:outline-none focus:border-[#065F46]"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="itin-date"
                  className="block text-xs font-semibold text-[#0F241D]"
                >
                  <Calendar className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />
                  {t.startDate}
                </label>
                <input
                  id="itin-date"
                  type="date"
                  value={itinerary.tanggalMulai}
                  onChange={(e) =>
                    onUpdateItinerary({ ...itinerary, tanggalMulai: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm bg-[#FAFBF9] border border-[#065F46]/20 rounded-lg text-[#0F241D] focus:outline-none focus:border-[#065F46]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="itin-days"
                    className="block text-xs font-semibold text-[#0F241D]"
                  >
                    {t.daysCount}
                  </label>
                  <select
                    id="itin-days"
                    value={itinerary.jumlahHari}
                    onChange={(e) =>
                      onUpdateItinerary({
                        ...itinerary,
                        jumlahHari: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-[#FAFBF9] border border-[#065F46]/20 rounded-lg text-[#0F241D] focus:outline-none focus:border-[#065F46]"
                  >
                    {[1, 2, 3, 4, 5].map((d) => (
                      <option key={d} value={d}>
                        {d} {language === 'en' ? 'Day(s)' : 'Hari'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="itin-travelers"
                    className="block text-xs font-semibold text-[#0F241D]"
                  >
                    <Users className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />
                    {t.travelersCount}
                  </label>
                  <input
                    id="itin-travelers"
                    type="number"
                    min={1}
                    max={20}
                    value={itinerary.jumlahWisatawan}
                    onChange={(e) =>
                      onUpdateItinerary({
                        ...itinerary,
                        jumlahWisatawan: Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-[#FAFBF9] border border-[#065F46]/20 rounded-lg text-[#0F241D] focus:outline-none focus:border-[#065F46]"
                  />
                </div>
              </div>
            </div>

            {/* Add Destination to Itinerary Bar */}
            <div className="bg-[#F2F6F4] border border-[#065F46]/15 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
              <div className="flex-1 space-y-1">
                <label
                  htmlFor="add-dest-select"
                  className="block text-xs font-semibold text-[#0F241D]"
                >
                  {language === 'en' ? 'Add Destination' : 'Tambah Destinasi'}
                </label>
                <select
                  id="add-dest-select"
                  value={selectedDestId}
                  onChange={(e) => setSelectedDestId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#065F46]/20 rounded-lg text-[#0F241D]"
                >
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nama} ({d.wilayah})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-28 space-y-1">
                <label
                  htmlFor="add-day-select"
                  className="block text-xs font-semibold text-[#0F241D]"
                >
                  {language === 'en' ? 'Day' : 'Hari'}
                </label>
                <select
                  id="add-day-select"
                  value={Math.min(targetDay, itinerary.jumlahHari)}
                  onChange={(e) => setTargetDay(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#065F46]/20 rounded-lg text-[#0F241D]"
                >
                  {Array.from({ length: itinerary.jumlahHari }, (_, i) => i + 1).map(
                    (dayNum) => (
                      <option key={dayNum} value={dayNum}>
                        {t.dayLabel}
                        {dayNum}
                      </option>
                    )
                  )}
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddActivity}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#065F46] hover:bg-[#054E3A] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer h-[38px]"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                {language === 'en' ? 'Add' : 'Tambah'}
              </button>
            </div>

            {/* Day-by-Day Schedule */}
            <div className="space-y-4">
              {Array.from({ length: itinerary.jumlahHari }, (_, idx) => idx + 1).map(
                (dayNum) => {
                  const dayActivities = itinerary.daftarAktivitas.filter(
                    (a) => a.hariKe === dayNum
                  );
                  return (
                    <div
                      key={dayNum}
                      className="bg-white border border-[#065F46]/15 rounded-xl p-4 sm:p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-[#065F46]/10 pb-2.5">
                        <h3 className="text-base font-semibold text-[#0F241D]">
                          {t.dayLabel}
                          {dayNum}
                        </h3>
                        <span className="text-xs font-mono text-[#065F46] tabular-nums">
                          {dayActivities.length}{' '}
                          {language === 'en' ? 'activities' : 'aktivitas'}
                        </span>
                      </div>

                      {dayActivities.length === 0 ? (
                        <p className="text-xs text-[#5B7068] py-2">
                          {t.noActivitiesDay}
                        </p>
                      ) : (
                        <ul className="divide-y divide-[#065F46]/10">
                          {dayActivities.map((act) => (
                            <li
                              key={act.id}
                              className="py-2.5 flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#0F241D] truncate">
                                  {act.nama}
                                </p>
                                <p className="text-xs text-[#4C635B] truncate">
                                  {act.wilayah} ·{' '}
                                  <span className="font-mono tabular-nums">
                                    {act.estimasiBiaya === 0
                                      ? t.freeEntry
                                      : formatIDR(act.estimasiBiaya)}
                                  </span>
                                  {act.catatan ? ` · ${act.catatan}` : ''}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveActivity(act.id)}
                                aria-label={`Hapus ${act.nama}`}
                                className="p-2 text-[#6B4423] hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer shrink-0"
                              >
                                <Trash2 className="w-4 h-4" aria-hidden="true" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Right: Budget Calculator */}
          <aside className="lg:col-span-5 bg-white border border-[#065F46]/15 rounded-xl p-5 sm:p-6 space-y-5 lg:sticky lg:top-6">
            <div className="flex items-center gap-2.5 border-b border-[#065F46]/10 pb-3">
              <Calculator className="w-5 h-5 text-[#065F46]" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-[#0F241D]">
                {t.budgetBreakdown}
              </h3>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="stay-calc-select"
                className="block text-xs font-semibold text-[#0F241D]"
              >
                {language === 'en'
                  ? 'Reference Muslim-Friendly Stay'
                  : 'Pilihan Akomodasi Referensi'}
              </label>
              <select
                id="stay-calc-select"
                value={selectedStayId}
                onChange={(e) => setSelectedStayId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAFBF9] border border-[#065F46]/20 rounded-lg text-[#0F241D]"
              >
                {accommodations.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nama} — {formatIDR(a.hargaPerMalam)}/mlm
                  </option>
                ))}
              </select>
            </div>

            <dl className="space-y-3 text-sm border-t border-[#065F46]/10 pt-4">
              <div className="flex justify-between gap-4">
                <dt className="text-[#3D524A]">{t.budgetTickets}</dt>
                <dd className="font-mono font-medium text-[#0F241D] tabular-nums">
                  {formatIDR(budgetSummary.ticketsTotal)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#3D524A]">
                  {t.budgetMeals} ({itinerary.jumlahHari}h × {itinerary.jumlahWisatawan}p)
                </dt>
                <dd className="font-mono font-medium text-[#0F241D] tabular-nums">
                  {formatIDR(budgetSummary.mealsTotal)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#3D524A]">
                  {t.budgetLodging} ({budgetSummary.nights} mlm × {budgetSummary.rooms} kmr)
                </dt>
                <dd className="font-mono font-medium text-[#0F241D] tabular-nums">
                  {formatIDR(budgetSummary.lodgingTotal)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#3D524A]">{t.budgetTransport}</dt>
                <dd className="font-mono font-medium text-[#0F241D] tabular-nums">
                  {formatIDR(budgetSummary.transportTotal)}
                </dd>
              </div>

              <div className="flex justify-between gap-4 pt-3 border-t border-[#065F46]/20 text-base font-semibold">
                <dt className="text-[#0F241D]">{t.budgetTotal}</dt>
                <dd className="font-mono text-[#065F46] tabular-nums">
                  {formatIDR(budgetSummary.grandTotal)}
                </dd>
              </div>

              <div className="flex justify-between gap-4 text-xs text-[#4C635B]">
                <dt>{t.budgetPerPerson}</dt>
                <dd className="font-mono font-semibold text-[#B45309] tabular-nums">
                  {formatIDR(budgetSummary.perPerson)}
                </dd>
              </div>
            </dl>

            <p className="text-[11px] text-[#5B7068] bg-[#FAFBF9] border border-[#065F46]/10 rounded-lg p-3 leading-relaxed">
              {language === 'en'
                ? 'Simulation estimate: Calculations automatically update based on travelers, trip duration (1–5 days), and selected activities/stay.'
                : 'Estimasi simulasi: Rincian diperbarui otomatis sesuai jumlah wisatawan, durasi (1–5 hari), aktivitas terdaftar, dan tarif akomodasi referensi.'}
            </p>
          </aside>
        </div>
      </section>
    </div>
  );
};

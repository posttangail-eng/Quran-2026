import { BookOpen, Moon, Play, Search, Sun } from 'lucide-react';
import { useMemo, useState } from 'react';
import manuscriptBanner from '../assets/images/quran_manuscript_banner_1794587166342.jpg';
import { SURAHS } from '../data/surahs';
import { RevelationType, SurahMeta } from '../types/quran';
import { toBengaliDigits } from '../utils/bengaliTransliteration';

interface SurahDirectoryProps {
  onOpenSurah: (surahNumber: number, targetAyah?: number) => void;
  onPlaySurah: (surahNumber: number) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

const FEATURED_SHORTCUTS: Array<{ label: string; surah: number; ayah?: number }> = [
  { label: 'সূরা আল-ফাতিহা', surah: 1 },
  { label: 'আয়াতুল কুরসি', surah: 2, ayah: 255 },
  { label: 'সূরা ইয়াসীন', surah: 36 },
  { label: 'সূরা আর-রাহমান', surah: 55 },
  { label: 'সূরা আল-মুলক', surah: 67 },
];

function normalizeBengaliDigitsToAscii(str: string): string {
  const map: Record<string, string> = {
    '০': '0',
    '১': '1',
    '২': '2',
    '৩': '3',
    '৪': '4',
    '৫': '5',
    '৬': '6',
    '৭': '7',
    '৮': '8',
    '৯': '9',
  };
  return str.replace(/[০-৯]/g, (d) => map[d] ?? d);
}

export function SurahDirectory({
  onOpenSurah,
  onPlaySurah,
  isDark,
  onToggleTheme,
}: SurahDirectoryProps) {
  const [query, setQuery] = useState('');
  const [revelationFilter, setRevelationFilter] = useState<'all' | RevelationType>('all');
  const [imgError, setImgError] = useState(false);

  const filteredSurahs = useMemo(() => {
    const q = normalizeBengaliDigitsToAscii(query.trim().toLowerCase());
    return SURAHS.filter((surah) => {
      if (revelationFilter !== 'all' && surah.revelationType !== revelationFilter) {
        return false;
      }
      if (!q) return true;
      return (
        String(surah.number) === q ||
        surah.banglaName.toLowerCase().includes(q) ||
        surah.banglaMeaning.toLowerCase().includes(q) ||
        surah.englishName.toLowerCase().includes(q) ||
        surah.arabicName.includes(q)
      );
    });
  }, [query, revelationFilter]);

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* Editorial Hero Split (2-column items-stretch) */}
      <section className="grid grid-cols-1 items-stretch gap-8 border-b border-[#E2DBD0] pb-10 dark:border-[#282D28] lg:grid-cols-12">
        <div className="flex flex-col justify-between lg:col-span-7 lg:py-2">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#6E655B] dark:text-[#A8A29E]">
              পবিত্র কুরআনুল কারীম · ১১৪টি সূরা · ৬,২৩৬টি আয়াত
            </p>
            <h1 className="font-bn-serif mt-3 max-w-2xl text-3xl font-bold leading-snug text-[#1C1917] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.22] dark:text-[#F2EFE9]" style={{ textWrap: 'balance' }}>
              আরবি তিলাওয়াত, বিশুদ্ধ বাংলা উচ্চারণ ও অর্থসহ কুরআন অধ্যয়ন
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
              উসমানী আরবি লিপি, সহজ বাংলা উচ্চারণ, মাওলানা মুহিউদ্দীন খান ও ড. জহুরুল হকের নির্ভরযোগ্য বঙ্গানুবাদ এবং খ্যাতিমান ক্বারীদের আয়াতভিত্তিক অডিও তিলাওয়াত একসাথে।
            </p>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenSurah(1)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#14532D] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#166534] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14532D] dark:bg-emerald-700 dark:hover:bg-emerald-600 cursor-pointer whitespace-nowrap shrink-0"
            >
              <BookOpen className="h-4 w-4" />
              সূরা আল-ফাতিহা পড়ুন
            </button>
            <button
              type="button"
              onClick={() => onPlaySurah(1)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#D6CEBE] bg-[#F4EFE6] px-5 py-2.5 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#EBE4D8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14532D] dark:border-[#2E342E] dark:bg-[#191C19] dark:text-[#F2EFE9] dark:hover:bg-[#232823] cursor-pointer whitespace-nowrap shrink-0"
            >
              <Play className="h-4 w-4 text-[#14532D] dark:text-emerald-400" />
              তিলাওয়াত শুনুন
            </button>
          </div>

          {/* Quick Jump Links */}
          <div className="mt-7 border-t border-[#E2DBD0]/80 pt-4 dark:border-[#282D28]">
            <span className="mr-3 text-xs font-medium text-[#6E655B] dark:text-[#A8A29E]">
              দ্রুত পাঠ:
            </span>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              {FEATURED_SHORTCUTS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => onOpenSurah(item.surah, item.ayah)}
                  className="font-medium text-[#14532D] underline-offset-4 hover:underline dark:text-emerald-400 cursor-pointer whitespace-nowrap shrink-0"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right visual slot using generated manuscript banner */}
        <div className="lg:col-span-5">
          <div className="relative h-56 w-full overflow-hidden rounded-xl border border-[#E2DBD0] bg-[#F4EFE6] dark:border-[#282D28] dark:bg-[#191C19] sm:h-64 lg:h-full lg:min-h-[300px]">
            {!imgError ? (
              <img
                src={manuscriptBanner}
                alt="ইসলামিক পাণ্ডুলিপির জ্যামিতিক অলংকরণ"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#F4EFE6] to-[#E6DFD2] p-6 text-center dark:from-[#191C19] dark:to-[#111311]">
                <span className="font-arabic text-4xl text-[#14532D] dark:text-emerald-400">
                  القرآن الكريم
                </span>
                <p className="mt-2 text-xs text-[#6E655B] dark:text-[#A8A29E]">
                  পবিত্র কুরআনুল কারীম
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Search, Filter & Theme Bar */}
      <section className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6E655B] dark:text-[#A8A29E]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="সূরার নাম বা নম্বর খুঁজুন (যেমন: ইয়াসীন বা ৩৬)..."
            aria-label="সূরা অনুসন্ধান"
            className="w-full rounded-lg border border-[#E2DBD0] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1C1917] placeholder:text-[#8C8378] focus:border-[#14532D] focus:outline-none focus:ring-1 focus:ring-[#14532D] dark:border-[#282D28] dark:bg-[#191C19] dark:text-[#F2EFE9] dark:placeholder:text-[#78716C] dark:focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Interactive Segmented Filter Control */}
          <div
            role="tablist"
            aria-label="অবতীর্ণ হওয়ার স্থান অনুযায়ী সূরা"
            className="flex items-center gap-1 rounded-lg border border-[#E2DBD0] bg-[#F4EFE6] p-1 dark:border-[#282D28] dark:bg-[#191C19]"
          >
            <button
              type="button"
              role="tab"
              aria-selected={revelationFilter === 'all'}
              onClick={() => setRevelationFilter('all')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                revelationFilter === 'all'
                  ? 'bg-white text-[#1C1917] shadow-xs dark:bg-[#262B26] dark:text-[#F2EFE9]'
                  : 'text-[#57534E] hover:text-[#1C1917] dark:text-[#A8A29E] dark:hover:text-[#F2EFE9]'
              }`}
            >
              সকল সূরা (১১৪)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={revelationFilter === 'Meccan'}
              onClick={() => setRevelationFilter('Meccan')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                revelationFilter === 'Meccan'
                  ? 'bg-white text-[#1C1917] shadow-xs dark:bg-[#262B26] dark:text-[#F2EFE9]'
                  : 'text-[#57534E] hover:text-[#1C1917] dark:text-[#A8A29E] dark:hover:text-[#F2EFE9]'
              }`}
            >
              মক্কী (৮৬)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={revelationFilter === 'Medinan'}
              onClick={() => setRevelationFilter('Medinan')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                revelationFilter === 'Medinan'
                  ? 'bg-white text-[#1C1917] shadow-xs dark:bg-[#262B26] dark:text-[#F2EFE9]'
                  : 'text-[#57534E] hover:text-[#1C1917] dark:text-[#A8A29E] dark:hover:text-[#F2EFE9]'
              }`}
            >
              মাদানী (২৮)
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'দিবা মোড চালু করুন' : 'রাতের মোড চালু করুন'}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2DBD0] bg-white px-3 py-2 text-xs font-medium text-[#1C1917] transition-colors hover:bg-[#F4EFE6] dark:border-[#282D28] dark:bg-[#191C19] dark:text-[#F2EFE9] dark:hover:bg-[#232823] whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isDark ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-[#57534E]" />}
            <span>{isDark ? 'দিবা মোড' : 'রাতের মোড'}</span>
          </button>
        </div>
      </section>

      {/* 114 Surahs Grid */}
      {filteredSurahs.length === 0 ? (
        <div className="mt-10 rounded-xl border border-[#E2DBD0] bg-[#F4EFE6]/50 p-10 text-center dark:border-[#282D28] dark:bg-[#191C19]/60">
          <p className="font-bn-serif text-lg font-semibold text-[#1C1917] dark:text-[#F2EFE9]">
            কোনো সূরা খুঁজে পাওয়া যায়নি
          </p>
          <p className="mt-1 text-sm text-[#6E655B] dark:text-[#A8A29E]">
            অন্য কোনো নাম বা ১ থেকে ১১৪ এর মধ্যে সূরা নম্বর লিখে চেষ্টা করুন।
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setRevelationFilter('all');
            }}
            className="mt-4 rounded-lg border border-[#D6CEBE] bg-white px-4 py-2 text-xs font-medium text-[#1C1917] hover:bg-[#F4EFE6] dark:border-[#282D28] dark:bg-[#191C19] dark:text-[#F2EFE9] cursor-pointer"
          >
            ফিল্টার রিসেট করুন
          </button>
        </div>
      ) : (
        <section
          aria-label="সূরা তালিকা"
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredSurahs.map((surah) => (
            <SurahCard
              key={surah.number}
              surah={surah}
              onOpen={() => onOpenSurah(surah.number)}
            />
          ))}
        </section>
      )}
    </main>
  );
}

function SurahCard({ surah, onOpen }: { surah: SurahMeta; onOpen: () => void }) {
  const revBangla = surah.revelationType === 'Meccan' ? 'মক্কী' : 'মাদানী';

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full items-center justify-between gap-4 rounded-xl border border-[#E2DBD0] bg-white p-5 text-left transition-colors duration-150 hover:border-[#14532D]/50 hover:bg-[#F7F4EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14532D] dark:border-[#282D28] dark:bg-[#161916] dark:hover:border-emerald-500/40 dark:hover:bg-[#1D211D] cursor-pointer"
    >
      <div className="flex min-w-0 items-center gap-4">
        <span className="tabular-nums flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F4EFE6] text-sm font-semibold text-[#14532D] transition-colors group-hover:bg-[#14532D] group-hover:text-white dark:bg-[#222622] dark:text-emerald-400 dark:group-hover:bg-emerald-700 dark:group-hover:text-white">
          {toBengaliDigits(surah.number)}
        </span>
        <div className="min-w-0">
          <h2 className="font-bn-serif truncate text-base font-semibold text-[#1C1917] dark:text-[#F2EFE9]">
            {surah.banglaName}
          </h2>
          <p className="mt-0.5 truncate text-xs text-[#6E655B] dark:text-[#A8A29E]">
            {surah.banglaMeaning}
          </p>
          <p className="mt-1.5 text-xs text-[#78716C] dark:text-[#8E8780]">
            <span>{revBangla}</span>
            <span aria-hidden="true"> · </span>
            <span className="tabular-nums">{toBengaliDigits(surah.ayahCount)} আয়াত</span>
            <span aria-hidden="true"> · </span>
            <span className="tabular-nums">পারা {toBengaliDigits(surah.juz)}</span>
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <span
          dir="rtl"
          lang="ar"
          className="font-arabic text-2xl leading-none text-[#1C1917] transition-colors group-hover:text-[#14532D] dark:text-[#F2EFE9] dark:group-hover:text-emerald-400"
        >
          {surah.arabicName}
        </span>
      </div>
    </button>
  );
}

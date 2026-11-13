import {
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  List,
  Minus,
  Moon,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Sun,
  Volume2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { RECITERS, SURAHS, TRANSLATIONS } from '../data/surahs';
import {
  AudioPlayMode,
  AyahData,
  BanglaVoiceName,
  BookmarkItem,
  SurahContent,
} from '../types/quran';
import { toBengaliDigits } from '../utils/bengaliTransliteration';

interface SurahReaderProps {
  surahNumber: number;
  surahContent: SurahContent | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelectSurah: (surahNumber: number, targetAyah?: number) => void;
  targetAyah: number | null;
  onClearTargetAyah: () => void;

  // Preferences
  reciterId: string;
  onChangeReciter: (id: string) => void;
  translationId: string;
  onChangeTranslation: (id: string) => void;
  audioPlayMode: AudioPlayMode;
  onChangeAudioPlayMode: (mode: AudioPlayMode) => void;
  banglaVoice: BanglaVoiceName;
  onChangeBanglaVoice: (voice: BanglaVoiceName) => void;
  showPronunciation: boolean;
  onTogglePronunciation: () => void;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  arabicFontSize: number;
  onChangeArabicFontSize: (delta: number) => void;
  banglaFontSize: number;
  onChangeBanglaFontSize: (delta: number) => void;
  isDark: boolean;
  onToggleTheme: () => void;

  // Audio state
  playingSurahNumber: number | null;
  playingAyahIndex: number | null;
  activeSegment: 'arabic' | 'bangla';
  isPlaying: boolean;
  isBuffering: boolean;
  onPlayAyah: (surahNumber: number, ayahIndex: number, segment?: 'arabic' | 'bangla') => void;
  onTogglePlayPause: () => void;

  // Bookmarks
  bookmarks: BookmarkItem[];
  onToggleBookmark: (ayah: AyahData) => void;
}

export function SurahReader({
  surahNumber,
  surahContent,
  loading,
  error,
  onRetry,
  onSelectSurah,
  targetAyah,
  onClearTargetAyah,
  reciterId,
  onChangeReciter,
  translationId,
  onChangeTranslation,
  audioPlayMode,
  onChangeAudioPlayMode,
  banglaVoice,
  onChangeBanglaVoice,
  showPronunciation,
  onTogglePronunciation,
  showTranslation,
  onToggleTranslation,
  arabicFontSize,
  onChangeArabicFontSize,
  banglaFontSize,
  onChangeBanglaFontSize,
  isDark,
  onToggleTheme,
  playingSurahNumber,
  playingAyahIndex,
  activeSegment,
  isPlaying,
  isBuffering,
  onPlayAyah,
  onTogglePlayPause,
  bookmarks,
  onToggleBookmark,
}: SurahReaderProps) {
  const [sidebarQuery, setSidebarQuery] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [copiedAyahNumber, setCopiedAyahNumber] = useState<number | null>(null);
  const ayahRefs = useRef<Record<number, HTMLElement | null>>({});

  const currentMeta = useMemo(
    () => SURAHS.find((s) => s.number === surahNumber) ?? SURAHS[0],
    [surahNumber]
  );

  const filteredSidebarSurahs = useMemo(() => {
    const q = sidebarQuery.trim().toLowerCase();
    if (!q) return SURAHS;
    return SURAHS.filter(
      (s) =>
        String(s.number) === q ||
        toBengaliDigits(s.number) === q ||
        s.banglaName.toLowerCase().includes(q) ||
        s.englishName.toLowerCase().includes(q)
    );
  }, [sidebarQuery]);

  // Scroll to targetAyah once loaded
  useEffect(() => {
    if (!loading && surahContent && targetAyah) {
      const el = ayahRefs.current[targetAyah];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      onClearTargetAyah();
    }
  }, [loading, surahContent, targetAyah, onClearTargetAyah]);

  // Scroll gently to currently playing ayah if inside this Surah
  useEffect(() => {
    if (
      isPlaying &&
      playingSurahNumber === surahNumber &&
      playingAyahIndex !== null &&
      surahContent
    ) {
      const ayah = surahContent.ayahs[playingAyahIndex];
      if (ayah) {
        const el = ayahRefs.current[ayah.numberInSurah];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }
  }, [isPlaying, playingSurahNumber, playingAyahIndex, surahNumber, surahContent]);

  const isThisSurahPlaying = isPlaying && playingSurahNumber === surahNumber;
  const revBangla = currentMeta.revelationType === 'Meccan' ? 'মক্কী' : 'মাদানী';

  const handleCopyAyah = async (ayah: AyahData) => {
    const text = [
      `${currentMeta.banglaName} (${toBengaliDigits(surahNumber)}:${toBengaliDigits(ayah.numberInSurah)})`,
      ayah.arabicText,
      ayah.banglaPronunciation ? `উচ্চারণ: ${ayah.banglaPronunciation}` : '',
      `অর্থ: ${ayah.banglaTranslation}`,
    ]
      .filter(Boolean)
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAyahNumber(ayah.numberInSurah);
      setTimeout(() => {
        setCopiedAyahNumber((prev) => (prev === ayah.numberInSurah ? null : prev));
      }, 1800);
    } catch {
      // Clipboard blocked in sandboxed iframe gracefully ignored
    }
  };

  const renderSidebarList = (onPick: (num: number) => void) => (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#E2DBD0] p-3 dark:border-[#282D28]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6E655B] dark:text-[#A8A29E]" />
          <input
            type="text"
            value={sidebarQuery}
            onChange={(e) => setSidebarQuery(e.target.value)}
            placeholder="সূরা খুঁজুন..."
            aria-label="সূরা তালিকা অনুসন্ধান"
            className="w-full rounded-lg border border-[#E2DBD0] bg-[#FBF9F5] py-2 pl-9 pr-3 text-xs text-[#1C1917] placeholder:text-[#8C8378] focus:border-[#14532D] focus:outline-none dark:border-[#282D28] dark:bg-[#111311] dark:text-[#F2EFE9]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filteredSidebarSurahs.map((s) => {
          const active = s.number === surahNumber;
          return (
            <button
              key={s.number}
              type="button"
              onClick={() => onPick(s.number)}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer ${
                active
                  ? 'bg-[#14532D] text-white dark:bg-emerald-700'
                  : 'text-[#1C1917] hover:bg-[#F4EFE6] dark:text-[#F2EFE9] dark:hover:bg-[#222622]'
              }`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`tabular-nums w-6 text-xs font-medium ${
                    active ? 'text-emerald-100' : 'text-[#6E655B] dark:text-[#A8A29E]'
                  }`}
                >
                  {toBengaliDigits(s.number)}.
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{s.banglaName}</div>
                  <div
                    className={`truncate text-[11px] ${
                      active ? 'text-emerald-100/90' : 'text-[#78716C] dark:text-[#8E8780]'
                    }`}
                  >
                    {toBengaliDigits(s.ayahCount)} আয়াত
                  </div>
                </div>
              </div>
              <span dir="rtl" lang="ar" className="font-arabic shrink-0 text-base">
                {s.arabicName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="mx-auto flex max-w-[1440px] gap-8 px-4 py-6 sm:px-6 lg:px-8">
      {/* Desktop Left Rail: 114 Surah Switcher */}
      <aside
        aria-label="সূরা নেভিগেশন সাইডবার"
        className="hidden lg:flex lg:w-72 xl:w-80 shrink-0 flex-col rounded-xl border border-[#E2DBD0] bg-white dark:border-[#282D28] dark:bg-[#161916] sticky top-20 h-[calc(100vh-7rem)] overflow-hidden"
      >
        {renderSidebarList((num) => onSelectSurah(num))}
      </aside>

      {/* Mobile Drawer for Surah Switcher */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative z-10 flex h-full w-80 max-w-[85vw] flex-col bg-white shadow-xl dark:bg-[#161916]">
            <div className="flex items-center justify-between border-b border-[#E2DBD0] px-4 py-3 dark:border-[#282D28]">
              <span className="font-bn-serif text-base font-semibold text-[#1C1917] dark:text-[#F2EFE9]">
                সূরা নির্বাচন করুন
              </span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="বন্ধ করুন"
                className="rounded-lg p-1.5 text-[#57534E] hover:bg-[#F4EFE6] dark:text-[#A8A29E] dark:hover:bg-[#232823] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderSidebarList((num) => {
              onSelectSurah(num);
              setMobileDrawerOpen(false);
            })}
          </div>
        </div>
      )}

      {/* Main Reading Column */}
      <main className="min-w-0 flex-1 pb-28">
        {/* Mobile Surah Switcher Trigger */}
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E2DBD0] bg-white px-3.5 py-2 text-xs font-medium text-[#1C1917] dark:border-[#282D28] dark:bg-[#191C19] dark:text-[#F2EFE9] cursor-pointer"
          >
            <List className="h-4 w-4 text-[#14532D] dark:text-emerald-400" />
            সূরা পরিবর্তন ({currentMeta.banglaName})
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'দিবা মোড' : 'রাতের মোড'}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2DBD0] bg-white px-3 py-2 text-xs font-medium text-[#1C1917] dark:border-[#282D28] dark:bg-[#191C19] dark:text-[#F2EFE9] cursor-pointer"
          >
            {isDark ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5" />}
            <span>{isDark ? 'দিবা' : 'রাত'}</span>
          </button>
        </div>

        {/* Surah Monument Header */}
        <section className="border-b border-[#E2DBD0] pb-7 dark:border-[#282D28]">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium text-[#6E655B] dark:text-[#A8A29E]">
                <span className="tabular-nums">সূরা {toBengaliDigits(currentMeta.number)}</span>
                <span aria-hidden="true"> · </span>
                <span>{revBangla}</span>
                <span aria-hidden="true"> · </span>
                <span className="tabular-nums">{toBengaliDigits(currentMeta.ayahCount)} আয়াত</span>
                <span aria-hidden="true"> · </span>
                <span className="tabular-nums">পারা {toBengaliDigits(currentMeta.juz)}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-baseline gap-4">
                <h1 className="font-bn-serif text-3xl font-bold text-[#1C1917] sm:text-4xl dark:text-[#F2EFE9]">
                  {currentMeta.banglaName}
                </h1>
                <span className="text-base text-[#6E655B] dark:text-[#A8A29E]">
                  ({currentMeta.banglaMeaning})
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
              <span
                dir="rtl"
                lang="ar"
                className="font-arabic text-4xl text-[#14532D] dark:text-emerald-400"
              >
                {currentMeta.arabicName}
              </span>
              <button
                type="button"
                disabled={loading || !surahContent}
                onClick={() => {
                  if (playingSurahNumber === surahNumber) {
                    onTogglePlayPause();
                  } else {
                    onPlayAyah(surahNumber, 0);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#166534] disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isThisSurahPlaying ? (
                  <>
                    <Pause className="h-4 w-4" />
                    বিরতি দিন
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    {audioPlayMode === 'bangla'
                      ? 'সূরার বাংলা অর্থ শুনুন'
                      : audioPlayMode === 'both'
                        ? 'আরবি ও বাংলা অর্থ শুনুন'
                        : 'সম্পূর্ণ সূরা শুনুন'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Workspace Reading & Audio Toolbar */}
          <div className="mt-6 space-y-3 rounded-xl border border-[#E2DBD0] bg-[#F4EFE6]/70 p-3.5 dark:border-[#282D28] dark:bg-[#191C19]">
            {/* Row 1: Reciter, Translation, Bangla Voice & Audio Play Mode */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-[#57534E] dark:text-[#A8A29E]">
                  <span className="whitespace-nowrap">ক্বারী:</span>
                  <select
                    value={reciterId}
                    onChange={(e) => onChangeReciter(e.target.value)}
                    className="rounded-md border border-[#D6CEBE] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1C1917] focus:border-[#14532D] focus:outline-none dark:border-[#2E342E] dark:bg-[#111311] dark:text-[#F2EFE9]"
                  >
                    {RECITERS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.banglaName}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center gap-2 text-xs text-[#57534E] dark:text-[#A8A29E]">
                  <span className="whitespace-nowrap">অনুবাদ:</span>
                  <select
                    value={translationId}
                    onChange={(e) => onChangeTranslation(e.target.value)}
                    className="rounded-md border border-[#D6CEBE] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1C1917] focus:border-[#14532D] focus:outline-none dark:border-[#2E342E] dark:bg-[#111311] dark:text-[#F2EFE9]"
                  >
                    {TRANSLATIONS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.banglaName}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center gap-2 text-xs text-[#57534E] dark:text-[#A8A29E]">
                  <span className="whitespace-nowrap">অর্থ কণ্ঠ:</span>
                  <select
                    value={banglaVoice}
                    onChange={(e) => onChangeBanglaVoice(e.target.value as BanglaVoiceName)}
                    className="rounded-md border border-[#D6CEBE] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1C1917] focus:border-[#14532D] focus:outline-none dark:border-[#2E342E] dark:bg-[#111311] dark:text-[#F2EFE9]"
                  >
                    <option value="Charon">পুরুষ কণ্ঠ (গম্ভীর)</option>
                    <option value="Kore">নারী কণ্ঠ (স্বচ্ছ)</option>
                  </select>
                </label>
              </div>

              {/* Audio Playback Mode Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#57534E] dark:text-[#A8A29E] whitespace-nowrap">
                  অডিও মোড:
                </span>
                <div
                  role="group"
                  aria-label="অডিও প্লেব্যাক মোড"
                  className="flex items-center rounded-md border border-[#D6CEBE] bg-white p-0.5 dark:border-[#2E342E] dark:bg-[#111311]"
                >
                  {(
                    [
                      { id: 'arabic', label: 'আরবি' },
                      { id: 'both', label: 'আরবি + অর্থ' },
                      { id: 'bangla', label: 'শুধু বাংলা অর্থ' },
                    ] as const
                  ).map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => onChangeAudioPlayMode(mode.id)}
                      className={`rounded px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        audioPlayMode === mode.id
                          ? 'bg-[#14532D] text-white dark:bg-emerald-700'
                          : 'text-[#57534E] hover:text-[#1C1917] dark:text-[#A8A29E] dark:hover:text-[#F2EFE9]'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Text Visibility Toggles, Font Sizes & Theme */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E2DBD0]/80 pt-2.5 dark:border-[#282D28]">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onTogglePronunciation}
                  className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    showPronunciation
                      ? 'border-[#14532D] bg-[#14532D] text-white dark:border-emerald-600 dark:bg-emerald-700'
                      : 'border-[#D6CEBE] bg-white text-[#57534E] dark:border-[#2E342E] dark:bg-[#111311] dark:text-[#A8A29E]'
                  }`}
                >
                  বাংলা উচ্চারণ
                </button>
                <button
                  type="button"
                  onClick={onToggleTranslation}
                  className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    showTranslation
                      ? 'border-[#14532D] bg-[#14532D] text-white dark:border-emerald-600 dark:bg-emerald-700'
                      : 'border-[#D6CEBE] bg-white text-[#57534E] dark:border-[#2E342E] dark:bg-[#111311] dark:text-[#A8A29E]'
                  }`}
                >
                  বাংলা অর্থ
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 rounded-md border border-[#D6CEBE] bg-white px-2 py-1 text-xs dark:border-[#2E342E] dark:bg-[#111311]">
                  <span className="text-[11px] text-[#6E655B] dark:text-[#A8A29E] mr-1">আরবি</span>
                  <button
                    type="button"
                    onClick={() => onChangeArabicFontSize(-2)}
                    aria-label="আরবি ফন্ট ছোট করুন"
                    className="rounded p-1 text-[#57534E] hover:bg-[#F4EFE6] dark:text-[#A8A29E] dark:hover:bg-[#232823] cursor-pointer"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="tabular-nums w-5 text-center text-[11px] font-medium text-[#1C1917] dark:text-[#F2EFE9]">
                    {toBengaliDigits(arabicFontSize)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onChangeArabicFontSize(2)}
                    aria-label="আরবি ফন্ট বড় করুন"
                    className="rounded p-1 text-[#57534E] hover:bg-[#F4EFE6] dark:text-[#A8A29E] dark:hover:bg-[#232823] cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <div className="flex items-center gap-1 rounded-md border border-[#D6CEBE] bg-white px-2 py-1 text-xs dark:border-[#2E342E] dark:bg-[#111311]">
                  <span className="text-[11px] text-[#6E655B] dark:text-[#A8A29E] mr-1">বাংলা</span>
                  <button
                    type="button"
                    onClick={() => onChangeBanglaFontSize(-1)}
                    aria-label="বাংলা ফন্ট ছোট করুন"
                    className="rounded p-1 text-[#57534E] hover:bg-[#F4EFE6] dark:text-[#A8A29E] dark:hover:bg-[#232823] cursor-pointer"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="tabular-nums w-5 text-center text-[11px] font-medium text-[#1C1917] dark:text-[#F2EFE9]">
                    {toBengaliDigits(banglaFontSize)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onChangeBanglaFontSize(1)}
                    aria-label="বাংলা ফন্ট বড় করুন"
                    className="rounded p-1 text-[#57534E] hover:bg-[#F4EFE6] dark:text-[#A8A29E] dark:hover:bg-[#232823] cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onToggleTheme}
                  aria-label={isDark ? 'দিবা মোড' : 'রাতের মোড'}
                  className="hidden lg:inline-flex items-center gap-1.5 rounded-md border border-[#D6CEBE] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1C1917] hover:bg-[#F4EFE6] dark:border-[#2E342E] dark:bg-[#111311] dark:text-[#F2EFE9] dark:hover:bg-[#232823] cursor-pointer whitespace-nowrap shrink-0"
                >
                  {isDark ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-[#57534E]" />}
                  <span>{isDark ? 'দিবা' : 'রাত'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Bismillah Banner (Surahs 2..114 except Surah 9 At-Tawbah) */}
        {surahNumber !== 1 && surahNumber !== 9 && (
          <div className="border-b border-[#E2DBD0] py-7 text-center dark:border-[#282D28]">
            <p
              dir="rtl"
              lang="ar"
              className="font-arabic text-3xl leading-relaxed text-[#1C1917] sm:text-4xl dark:text-[#F2EFE9]"
            >
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
            {showPronunciation && (
              <p className="mt-2 text-sm font-medium text-[#14532D] dark:text-emerald-400">
                বিসমিল্লা-হির রাহমা-নির রাহীম
              </p>
            )}
            {showTranslation && (
              <p className="font-bn-serif mt-1 text-sm text-[#6E655B] dark:text-[#A8A29E]">
                পরম করুণাময় অসীম দয়ালু আল্লাহর নামে শুরু করছি।
              </p>
            )}
          </div>
        )}

        {/* Content Loading / Error / Ayah Stream */}
        {loading ? (
          <div className="space-y-6 py-8">
            {[1, 2, 3, 4].map((skeleton) => (
              <div
                key={skeleton}
                className="animate-pulse border-b border-[#E2DBD0] pb-8 dark:border-[#282D28]"
              >
                <div className="h-4 w-28 rounded bg-[#EBE6DF] dark:bg-[#222622]" />
                <div className="mt-5 ml-auto h-8 w-3/4 rounded bg-[#EBE6DF] dark:bg-[#222622]" />
                <div className="mt-5 h-4 w-2/3 rounded bg-[#EBE6DF] dark:bg-[#222622]" />
                <div className="mt-3 h-4 w-5/6 rounded bg-[#EBE6DF] dark:bg-[#222622]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="my-10 rounded-xl border border-red-200 bg-red-50/70 p-8 text-center dark:border-red-900/40 dark:bg-red-950/20">
            <p className="font-bn-serif text-lg font-semibold text-red-900 dark:text-red-200">
              সূরাটি লোড করা সম্ভব হয়নি
            </p>
            <p className="mt-1.5 text-sm text-red-700 dark:text-red-300">
              {error} — অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ যাচাই করে পুনরায় চেষ্টা করুন।
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#14532D] px-4 py-2 text-sm font-medium text-white hover:bg-[#166534] dark:bg-emerald-700 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#E2DBD0] dark:divide-[#282D28]">
            {surahContent?.ayahs.map((ayah, idx) => {
              const isActiveAyah =
                playingSurahNumber === surahNumber && playingAyahIndex === idx;
              const isArabicPlayingHere =
                isActiveAyah && activeSegment === 'arabic' && isPlaying;
              const isBanglaPlayingHere =
                isActiveAyah && activeSegment === 'bangla' && (isPlaying || isBuffering);
              const isBookmarked = bookmarks.some(
                (b) =>
                  b.surahNumber === surahNumber &&
                  b.ayahNumberInSurah === ayah.numberInSurah
              );
              const isCopied = copiedAyahNumber === ayah.numberInSurah;

              return (
                <article
                  key={ayah.number}
                  ref={(el) => {
                    ayahRefs.current[ayah.numberInSurah] = el;
                  }}
                  className={`px-3 py-8 transition-colors sm:px-5 ${
                    isActiveAyah
                      ? 'bg-[#14532D]/[0.045] dark:bg-emerald-500/[0.07]'
                      : ''
                  }`}
                >
                  {/* Ayah Header Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-xs text-[#6E655B] dark:text-[#A8A29E]">
                      <span className="tabular-nums font-semibold text-[#14532D] dark:text-emerald-400">
                        আয়াত {toBengaliDigits(surahNumber)}:{toBengaliDigits(ayah.numberInSurah)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">পারা {toBengaliDigits(ayah.juz)}</span>
                      {ayah.sajda && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-[#854D0E] dark:text-amber-400">
                            সিজদাহ আয়াত
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Play Arabic / Bilingual */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isActiveAyah && activeSegment === 'arabic') {
                            onTogglePlayPause();
                          } else {
                            onPlayAyah(
                              surahNumber,
                              idx,
                              audioPlayMode === 'bangla' ? 'arabic' : undefined
                            );
                          }
                        }}
                        aria-label={isArabicPlayingHere ? 'তিলাওয়াত থামান' : 'আরবি তিলাওয়াত শুনুন'}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isArabicPlayingHere
                            ? 'bg-[#14532D] text-white dark:bg-emerald-700'
                            : 'text-[#57534E] hover:bg-[#F4EFE6] hover:text-[#14532D] dark:text-[#A8A29E] dark:hover:bg-[#232823] dark:hover:text-emerald-400'
                        }`}
                      >
                        {isArabicPlayingHere ? (
                          <>
                            <Pause className="h-3.5 w-3.5" />
                            <span>থামান</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5" />
                            <span>তিলাওয়াত</span>
                          </>
                        )}
                      </button>

                      {/* Play Bengali Meaning Audio */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isActiveAyah && activeSegment === 'bangla') {
                            onTogglePlayPause();
                          } else {
                            onPlayAyah(surahNumber, idx, 'bangla');
                          }
                        }}
                        aria-label={isBanglaPlayingHere ? 'অর্থের অডিও থামান' : 'বাংলা অর্থ শুনুন'}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isBanglaPlayingHere
                            ? 'bg-[#854D0E] text-white dark:bg-amber-700'
                            : 'text-[#57534E] hover:bg-[#F4EFE6] hover:text-[#854D0E] dark:text-[#A8A29E] dark:hover:bg-[#232823] dark:hover:text-amber-400'
                        }`}
                      >
                        {isBanglaPlayingHere && isPlaying ? (
                          <>
                            <Pause className="h-3.5 w-3.5" />
                            <span>অর্থ থামান</span>
                          </>
                        ) : isBanglaPlayingHere && isBuffering ? (
                          <>
                            <Volume2 className="h-3.5 w-3.5" />
                            <span>প্রস্তুত হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3.5 w-3.5" />
                            <span>অর্থ শুনুন</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleBookmark(ayah)}
                        aria-label={isBookmarked ? 'বুকমার্ক সরান' : 'বুকমার্ক করুন'}
                        className={`rounded-lg p-2 transition-colors cursor-pointer ${
                          isBookmarked
                            ? 'text-[#14532D] bg-[#14532D]/10 dark:text-emerald-400 dark:bg-emerald-500/15'
                            : 'text-[#6E655B] hover:bg-[#F4EFE6] dark:text-[#A8A29E] dark:hover:bg-[#232823]'
                        }`}
                      >
                        <Bookmark
                          className="h-4 w-4"
                          fill={isBookmarked ? 'currentColor' : 'none'}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyAyah(ayah)}
                        aria-label="আয়াত কপি করুন"
                        className="rounded-lg p-2 text-[#6E655B] transition-colors hover:bg-[#F4EFE6] dark:text-[#A8A29E] dark:hover:bg-[#232823] cursor-pointer"
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4 text-[#14532D] dark:text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Arabic Verse */}
                  <p
                    dir="rtl"
                    lang="ar"
                    style={{ fontSize: `${arabicFontSize}px`, lineHeight: 2.25 }}
                    className="font-arabic mt-6 text-right text-[#1C1917] dark:text-[#F2EFE9]"
                  >
                    {ayah.arabicText}
                    <span
                      aria-hidden="true"
                      className="mr-2 inline-block font-arabic text-[0.75em] text-[#854D0E] dark:text-amber-400/90"
                    >
                      ﴿{toBengaliDigits(ayah.numberInSurah)}﴾
                    </span>
                  </p>

                  {/* Bengali Pronunciation */}
                  {showPronunciation && ayah.banglaPronunciation && (
                    <div className="mt-5 max-w-3xl">
                      <span className="text-xs font-semibold text-[#14532D] dark:text-emerald-400">
                        উচ্চারণ:
                      </span>
                      <p
                        style={{ fontSize: `${banglaFontSize}px`, lineHeight: 1.75 }}
                        className="font-bn-sans mt-1 font-medium text-[#292524] dark:text-[#E7E5E4]"
                      >
                        {ayah.banglaPronunciation}
                      </p>
                    </div>
                  )}

                  {/* Bengali Meaning / Translation */}
                  {showTranslation && (
                    <div className="mt-4 max-w-3xl">
                      <span className="text-xs font-semibold text-[#6E655B] dark:text-[#A8A29E]">
                        বাংলা অর্থ:
                      </span>
                      <p
                        style={{ fontSize: `${banglaFontSize}px`, lineHeight: 1.8 }}
                        className="font-bn-serif mt-1 text-[#44403C] dark:text-[#D6D3D1]"
                      >
                        {ayah.banglaTranslation}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {/* Previous / Next Surah Footer Navigation */}
        <div className="mt-6 flex items-center justify-between border-t border-[#E2DBD0] pt-6 dark:border-[#282D28]">
          {surahNumber > 1 ? (
            <button
              type="button"
              onClick={() => onSelectSurah(surahNumber - 1)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#D6CEBE] bg-white px-4 py-2.5 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#F4EFE6] dark:border-[#282D28] dark:bg-[#191C19] dark:text-[#F2EFE9] dark:hover:bg-[#232823] cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>পূর্ববর্তী সূরা ({SURAHS[surahNumber - 2]?.banglaName})</span>
            </button>
          ) : (
            <div />
          )}

          {surahNumber < 114 ? (
            <button
              type="button"
              onClick={() => onSelectSurah(surahNumber + 1)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#D6CEBE] bg-white px-4 py-2.5 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#F4EFE6] dark:border-[#282D28] dark:bg-[#191C19] dark:text-[#F2EFE9] dark:hover:bg-[#232823] cursor-pointer"
            >
              <span>পরবর্তী সূরা ({SURAHS[surahNumber]?.banglaName})</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <div />
          )}
        </div>
      </main>
    </div>
  );
}

import {
  Pause,
  Play,
  Repeat,
  SkipBack,
  SkipForward,
  Volume2,
  X,
} from 'lucide-react';
import { RECITERS, SURAHS } from '../data/surahs';
import { AudioPlayMode } from '../types/quran';
import { formatAudioTime, toBengaliDigits } from '../utils/bengaliTransliteration';

interface AudioPlayerBarProps {
  surahNumber: number;
  ayahNumberInSurah: number;
  totalAyahs: number;
  reciterId: string;
  audioPlayMode: AudioPlayMode;
  activeSegment: 'arabic' | 'bangla';
  audioError: string | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  repeatOne: boolean;
  autoAdvance: boolean;
  onChangeAudioPlayMode: (mode: AudioPlayMode) => void;
  onTogglePlayPause: () => void;
  onPrevAyah: () => void;
  onNextAyah: () => void;
  onSeek: (time: number) => void;
  onCyclePlaybackRate: () => void;
  onToggleRepeatOne: () => void;
  onToggleAutoAdvance: () => void;
  onJumpToAyah: () => void;
  onClose: () => void;
}

export function AudioPlayerBar({
  surahNumber,
  ayahNumberInSurah,
  totalAyahs,
  reciterId,
  audioPlayMode,
  activeSegment,
  audioError,
  isPlaying,
  isBuffering,
  currentTime,
  duration,
  playbackRate,
  repeatOne,
  autoAdvance,
  onChangeAudioPlayMode,
  onTogglePlayPause,
  onPrevAyah,
  onNextAyah,
  onSeek,
  onCyclePlaybackRate,
  onToggleRepeatOne,
  onToggleAutoAdvance,
  onJumpToAyah,
  onClose,
}: AudioPlayerBarProps) {
  const surahMeta = SURAHS.find((s) => s.number === surahNumber);
  const reciter = RECITERS.find((r) => r.id === reciterId);
  const safeDuration = duration > 0 ? duration : 1;

  const segmentLabel =
    activeSegment === 'bangla'
      ? 'বাংলা অর্থ অডিও'
      : reciter?.banglaName ?? 'আরবি তিলাওয়াত';

  return (
    <div
      role="region"
      aria-label="কুরআন অডিও প্লেয়ার"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E2DBD0] bg-[#FBF9F5]/98 backdrop-blur-md shadow-[0_-4px_20px_rgba(28,25,23,0.06)] dark:border-[#282D28] dark:bg-[#141714]/98"
    >
      {/* Thin Top Progress Seek Strip */}
      <div className="relative h-1 w-full bg-[#E2DBD0] dark:bg-[#282D28]">
        <div
          className="h-full bg-[#14532D] transition-[width] duration-100 dark:bg-emerald-500"
          style={{ width: `${Math.min(100, (currentTime / safeDuration) * 100)}%` }}
        />
        <input
          type="range"
          min={0}
          max={safeDuration}
          step={0.1}
          value={Math.min(currentTime, safeDuration)}
          onChange={(e) => onSeek(Number(e.target.value))}
          aria-label="অডিও প্রগ্রেস"
          className="absolute inset-0 h-3 -top-1 w-full cursor-pointer opacity-0"
        />
      </div>

      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Left: Current Surah & Ayah Info */}
        <button
          type="button"
          onClick={onJumpToAyah}
          className="flex min-w-0 items-center gap-3 text-left group cursor-pointer"
        >
          <span className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#14532D]/10 text-[#14532D] dark:bg-emerald-500/15 dark:text-emerald-400">
            <Volume2 className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs sm:text-sm font-semibold text-[#1C1917] group-hover:text-[#14532D] dark:text-[#F2EFE9] dark:group-hover:text-emerald-400">
              {surahMeta?.banglaName} · আয়াত {toBengaliDigits(ayahNumberInSurah)}/{toBengaliDigits(totalAyahs)}
            </p>
            <p className="truncate text-[11px] text-[#6E655B] dark:text-[#A8A29E]">
              {audioError
                ? audioError
                : isBuffering
                  ? activeSegment === 'bangla'
                    ? 'বাংলা অর্থের অডিও তৈরি হচ্ছে...'
                    : 'অডিও লোড হচ্ছে...'
                  : segmentLabel}
            </p>
          </div>
        </button>

        {/* Center: Transport Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onPrevAyah}
            disabled={ayahNumberInSurah <= 1}
            aria-label="পূর্ববর্তী আয়াত"
            className="rounded-lg p-2 text-[#57534E] transition-colors hover:bg-[#F4EFE6] disabled:opacity-35 dark:text-[#A8A29E] dark:hover:bg-[#232823] cursor-pointer"
          >
            <SkipBack className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onTogglePlayPause}
            aria-label={isPlaying ? 'বিরতি' : 'শুনুন'}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#14532D] text-white transition-colors hover:bg-[#166534] dark:bg-emerald-700 dark:hover:bg-emerald-600 cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 translate-x-[1px]" />
            )}
          </button>

          <button
            type="button"
            onClick={onNextAyah}
            disabled={ayahNumberInSurah >= totalAyahs}
            aria-label="পরবর্তী আয়াত"
            className="rounded-lg p-2 text-[#57534E] transition-colors hover:bg-[#F4EFE6] disabled:opacity-35 dark:text-[#A8A29E] dark:hover:bg-[#232823] cursor-pointer"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        {/* Right: Mode, Time, Speed, Repeat & Close */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Mode Switcher */}
          <div className="hidden lg:flex items-center rounded-md border border-[#D6CEBE] bg-white p-0.5 text-[11px] dark:border-[#2E342E] dark:bg-[#191C19]">
            {(
              [
                { id: 'arabic', label: 'আরবি' },
                { id: 'both', label: 'আরবি + অর্থ' },
                { id: 'bangla', label: 'শুধু অর্থ' },
              ] as const
            ).map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => onChangeAudioPlayMode(mode.id)}
                className={`rounded px-2 py-1 font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  audioPlayMode === mode.id
                    ? 'bg-[#14532D] text-white dark:bg-emerald-700'
                    : 'text-[#57534E] hover:text-[#1C1917] dark:text-[#A8A29E] dark:hover:text-[#F2EFE9]'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <span className="hidden md:inline font-mono-tabular text-xs text-[#6E655B] dark:text-[#A8A29E]">
            {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
          </span>

          <button
            type="button"
            onClick={onCyclePlaybackRate}
            aria-label="প্লেব্যাক গতি পরিবর্তন"
            className="hidden sm:inline-flex rounded-md border border-[#D6CEBE] bg-white px-2 py-1 font-mono-tabular text-[11px] font-medium text-[#1C1917] hover:bg-[#F4EFE6] dark:border-[#2E342E] dark:bg-[#191C19] dark:text-[#F2EFE9] cursor-pointer"
          >
            {playbackRate}x
          </button>

          <button
            type="button"
            onClick={onToggleRepeatOne}
            title="একই আয়াত পুনরাবৃত্তি"
            aria-label="আয়াত পুনরাবৃত্তি"
            className={`hidden sm:inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
              repeatOne
                ? 'border-[#14532D] bg-[#14532D] text-white dark:border-emerald-600 dark:bg-emerald-700'
                : 'border-[#D6CEBE] bg-white text-[#57534E] dark:border-[#2E342E] dark:bg-[#191C19] dark:text-[#A8A29E]'
            }`}
          >
            <Repeat className="h-3 w-3" />
            <span>পুনরাবৃত্তি</span>
          </button>

          <button
            type="button"
            onClick={onToggleAutoAdvance}
            title="ধারাবাহিকভাবে পরবর্তী আয়াত চালান"
            className={`hidden xl:inline-flex rounded-md border px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
              autoAdvance
                ? 'border-[#14532D] bg-[#14532D]/10 text-[#14532D] dark:border-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                : 'border-[#D6CEBE] bg-white text-[#57534E] dark:border-[#2E342E] dark:bg-[#191C19] dark:text-[#A8A29E]'
            }`}
          >
            ধারাবাহিক
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="প্লেয়ার বন্ধ করুন"
            className="rounded-lg p-1.5 text-[#6E655B] hover:bg-[#F4EFE6] hover:text-[#1C1917] dark:text-[#A8A29E] dark:hover:bg-[#232823] dark:hover:text-[#F2EFE9] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

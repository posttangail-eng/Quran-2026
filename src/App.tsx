import { useCallback, useEffect, useRef, useState } from 'react';
import { AboutQuranView } from './components/AboutQuranView';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { BookmarksView } from './components/BookmarksView';
import { Header } from './components/Header';
import { SurahDirectory } from './components/SurahDirectory';
import { SurahReader } from './components/SurahReader';
import { SURAHS } from './data/surahs';
import {
  fetchBanglaMeaningAudioUrl,
  prefetchBanglaMeaningAudio,
} from './services/banglaAudio';
import { fetchSurahContent } from './services/quranApi';
import {
  AppView,
  AudioPlayMode,
  AyahData,
  BanglaVoiceName,
  BookmarkItem,
  SurahContent,
} from './types/quran';
import { toBengaliDigits } from './utils/bengaliTransliteration';

const STORAGE_KEYS = {
  THEME: 'quran_bangla_theme',
  RECITER: 'quran_bangla_reciter',
  TRANSLATION: 'quran_bangla_translation',
  AUDIO_MODE: 'quran_bangla_audio_mode',
  BANGLA_VOICE: 'quran_bangla_voice',
  SHOW_PRON: 'quran_bangla_show_pron',
  SHOW_TRANS: 'quran_bangla_show_trans',
  ARABIC_SIZE: 'quran_bangla_arabic_size',
  BANGLA_SIZE: 'quran_bangla_size',
  LAST_READ: 'quran_bangla_last_read',
  BOOKMARKS: 'quran_bangla_bookmarks',
};

const PLAYBACK_RATES = [1, 1.25, 1.5, 0.75];

function readJsonStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('directory');
  const [selectedSurah, setSelectedSurah] = useState<number>(() => {
    const last = readJsonStorage<{ surah: number; ayah: number }>(STORAGE_KEYS.LAST_READ, {
      surah: 1,
      ayah: 1,
    });
    return last.surah >= 1 && last.surah <= 114 ? last.surah : 1;
  });
  const [targetAyah, setTargetAyah] = useState<number | null>(null);

  // Preferences
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME) === 'dark';
  });
  const [reciterId, setReciterId] = useState<string>(
    () => localStorage.getItem(STORAGE_KEYS.RECITER) || 'ar.alafasy'
  );
  const [translationId, setTranslationId] = useState<string>(
    () => localStorage.getItem(STORAGE_KEYS.TRANSLATION) || 'bn.bengali'
  );
  const [audioPlayMode, setAudioPlayMode] = useState<AudioPlayMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIO_MODE);
    return saved === 'arabic' || saved === 'bangla' || saved === 'both' ? saved : 'both';
  });
  const [banglaVoice, setBanglaVoice] = useState<BanglaVoiceName>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BANGLA_VOICE);
    return saved === 'Kore' || saved === 'Charon' ? saved : 'Charon';
  });
  const [showPronunciation, setShowPronunciation] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHOW_PRON);
    return saved === null ? true : saved === 'true';
  });
  const [showTranslation, setShowTranslation] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHOW_TRANS);
    return saved === null ? true : saved === 'true';
  });
  const [arabicFontSize, setArabicFontSize] = useState<number>(() => {
    const saved = Number(localStorage.getItem(STORAGE_KEYS.ARABIC_SIZE));
    return Number.isFinite(saved) && saved >= 22 && saved <= 48 ? saved : 32;
  });
  const [banglaFontSize, setBanglaFontSize] = useState<number>(() => {
    const saved = Number(localStorage.getItem(STORAGE_KEYS.BANGLA_SIZE));
    return Number.isFinite(saved) && saved >= 13 && saved <= 24 ? saved : 16;
  });
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() =>
    readJsonStorage<BookmarkItem[]>(STORAGE_KEYS.BOOKMARKS, [])
  );
  const [lastRead, setLastRead] = useState<{ surah: number; ayah: number }>(() =>
    readJsonStorage<{ surah: number; ayah: number }>(STORAGE_KEYS.LAST_READ, {
      surah: 1,
      ayah: 1,
    })
  );

  // Viewed Surah Data
  const [surahContent, setSurahContent] = useState<SurahContent | null>(null);
  const [loadingSurah, setLoadingSurah] = useState<boolean>(false);
  const [surahError, setSurahError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);

  // Audio State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playTokenRef = useRef<number>(0);
  const [playingSurahContent, setPlayingSurahContent] = useState<SurahContent | null>(null);
  const [playingAyahIndex, setPlayingAyahIndex] = useState<number | null>(null);
  const [activeSegment, setActiveSegment] = useState<'arabic' | 'bangla'>('arabic');
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [repeatOne, setRepeatOne] = useState<boolean>(false);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [pendingPlayOnLoad, setPendingPlayOnLoad] = useState<{
    surah: number;
    ayahIndex: number;
    segment?: 'arabic' | 'bangla';
  } | null>(null);

  // Keep latest state in refs for audio event listeners
  const repeatOneRef = useRef(repeatOne);
  repeatOneRef.current = repeatOne;
  const autoAdvanceRef = useRef(autoAdvance);
  autoAdvanceRef.current = autoAdvance;
  const playingSurahContentRef = useRef(playingSurahContent);
  playingSurahContentRef.current = playingSurahContent;
  const playingAyahIndexRef = useRef(playingAyahIndex);
  playingAyahIndexRef.current = playingAyahIndex;
  const playbackRateRef = useRef(playbackRate);
  playbackRateRef.current = playbackRate;
  const activeSegmentRef = useRef(activeSegment);
  activeSegmentRef.current = activeSegment;
  const audioPlayModeRef = useRef(audioPlayMode);
  audioPlayModeRef.current = audioPlayMode;
  const banglaVoiceRef = useRef(banglaVoice);
  banglaVoiceRef.current = banglaVoice;

  // Sync Dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
  }, [isDark]);

  // Persist preferences
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECITER, reciterId);
  }, [reciterId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSLATION, translationId);
  }, [translationId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIO_MODE, audioPlayMode);
  }, [audioPlayMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BANGLA_VOICE, banglaVoice);
  }, [banglaVoice]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHOW_PRON, String(showPronunciation));
  }, [showPronunciation]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHOW_TRANS, String(showTranslation));
  }, [showTranslation]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ARABIC_SIZE, String(arabicFontSize));
  }, [arabicFontSize]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BANGLA_SIZE, String(banglaFontSize));
  }, [banglaFontSize]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LAST_READ, JSON.stringify(lastRead));
  }, [lastRead]);

  // Fetch selected Surah whenever surah, translation, or reciter changes
  useEffect(() => {
    const controller = new AbortController();
    setLoadingSurah(true);
    setSurahError(null);

    fetchSurahContent(selectedSurah, translationId, reciterId, controller.signal)
      .then((data) => {
        setSurahContent(data);
        setLoadingSurah(false);
        if (playingSurahContentRef.current?.meta.number === data.meta.number) {
          setPlayingSurahContent(data);
        }
      })
      .catch((err) => {
        if ((err as Error)?.name === 'AbortError') return;
        setLoadingSurah(false);
        setSurahError((err as Error)?.message || 'তথ্য লোড করা যায়নি');
      });

    return () => controller.abort();
  }, [selectedSurah, translationId, reciterId, reloadNonce]);

  const startAyahAudio = useCallback(
    async (
      content: SurahContent,
      ayahIndex: number,
      overrideSegment?: 'arabic' | 'bangla'
    ) => {
      const ayah = content.ayahs[ayahIndex];
      if (!ayah) return;

      const segment: 'arabic' | 'bangla' =
        overrideSegment ??
        (audioPlayModeRef.current === 'bangla' ? 'bangla' : 'arabic');

      const token = ++playTokenRef.current;

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      const audio = audioRef.current;
      audio.pause();

      setPlayingSurahContent(content);
      setPlayingAyahIndex(ayahIndex);
      setActiveSegment(segment);
      setAudioError(null);
      setCurrentTime(0);
      setDuration(0);
      setIsBuffering(true);
      setIsPlaying(false);
      setLastRead({ surah: content.meta.number, ayah: ayah.numberInSurah });

      if (segment === 'arabic') {
        audio.src = ayah.audioUrl;
        audio.playbackRate = playbackRateRef.current;
        audio.currentTime = 0;

        // Prefetch Bangla meaning audio if in bilingual mode
        if (audioPlayModeRef.current === 'both' && ayah.banglaTranslation) {
          prefetchBanglaMeaningAudio(ayah.banglaTranslation, banglaVoiceRef.current);
        } else if (autoAdvanceRef.current && content.ayahs[ayahIndex + 1]) {
          const preloader = new Audio();
          preloader.preload = 'auto';
          preloader.src = content.ayahs[ayahIndex + 1].audioUrl;
        }

        audio
          .play()
          .then(() => {
            if (playTokenRef.current !== token) return;
            setIsPlaying(true);
            setIsBuffering(false);
          })
          .catch(() => {
            if (playTokenRef.current !== token) return;
            if (ayah.audioSecondaryUrl && audio.src !== ayah.audioSecondaryUrl) {
              audio.src = ayah.audioSecondaryUrl;
              audio
                .play()
                .then(() => {
                  if (playTokenRef.current !== token) return;
                  setIsPlaying(true);
                  setIsBuffering(false);
                })
                .catch(() => {
                  if (playTokenRef.current !== token) return;
                  setIsPlaying(false);
                  setIsBuffering(false);
                  setAudioError('আরবি তিলাওয়াত লোড করা যায়নি।');
                });
            } else {
              setIsPlaying(false);
              setIsBuffering(false);
              setAudioError('আরবি তিলাওয়াত লোড করা যায়নি।');
            }
          });
      } else {
        // Play Bengali Meaning Audio via server-side Gemini TTS
        try {
          const wavUrl = await fetchBanglaMeaningAudioUrl(
            ayah.banglaTranslation,
            banglaVoiceRef.current
          );
          if (playTokenRef.current !== token) return;

          // Prefetch next Ayah's Bangla meaning audio if auto-advance is enabled
          const nextAyah = content.ayahs[ayahIndex + 1];
          if (
            autoAdvanceRef.current &&
            nextAyah &&
            audioPlayModeRef.current === 'bangla'
          ) {
            prefetchBanglaMeaningAudio(
              nextAyah.banglaTranslation,
              banglaVoiceRef.current
            );
          }

          audio.src = wavUrl;
          audio.playbackRate = playbackRateRef.current;
          audio.currentTime = 0;
          await audio.play();
          if (playTokenRef.current !== token) return;
          setIsPlaying(true);
          setIsBuffering(false);
        } catch (err) {
          if (playTokenRef.current !== token) return;
          setIsPlaying(false);
          setIsBuffering(false);
          setAudioError(
            err instanceof Error
              ? err.message
              : 'বাংলা অর্থের অডিও চালানো যায়নি।'
          );
        }
      }
    },
    []
  );

  // Trigger pending play once Surah finishes loading
  useEffect(() => {
    if (
      pendingPlayOnLoad &&
      !loadingSurah &&
      surahContent &&
      surahContent.meta.number === pendingPlayOnLoad.surah
    ) {
      startAyahAudio(
        surahContent,
        pendingPlayOnLoad.ayahIndex,
        pendingPlayOnLoad.segment
      );
      setPendingPlayOnLoad(null);
    }
  }, [pendingPlayOnLoad, loadingSurah, surahContent, startAyahAudio]);

  // Attach persistent Audio listeners
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      const content = playingSurahContentRef.current;
      const idx = playingAyahIndexRef.current;
      if (!content || idx === null) {
        setIsPlaying(false);
        return;
      }

      const mode = audioPlayModeRef.current;
      const currentSeg = activeSegmentRef.current;

      // In bilingual mode, Arabic finishes -> play Bengali meaning of the same Ayah
      if (currentSeg === 'arabic' && mode === 'both') {
        startAyahAudio(content, idx, 'bangla');
        return;
      }

      if (repeatOneRef.current) {
        startAyahAudio(content, idx, mode === 'bangla' ? 'bangla' : 'arabic');
        return;
      }

      if (autoAdvanceRef.current && idx + 1 < content.ayahs.length) {
        startAyahAudio(content, idx + 1);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [startAyahAudio]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handleOpenSurah = useCallback((surahNumber: number, ayahNumber?: number) => {
    setSelectedSurah(surahNumber);
    setTargetAyah(ayahNumber ?? null);
    setCurrentView('reader');
    setLastRead({ surah: surahNumber, ayah: ayahNumber ?? 1 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePlaySurahFromDirectory = useCallback((surahNumber: number) => {
    setSelectedSurah(surahNumber);
    setTargetAyah(1);
    setCurrentView('reader');
    setPendingPlayOnLoad({ surah: surahNumber, ayahIndex: 0 });
  }, []);

  const handlePlayAyahInReader = useCallback(
    (surahNumber: number, ayahIndex: number, segment?: 'arabic' | 'bangla') => {
      if (surahContent && surahContent.meta.number === surahNumber) {
        startAyahAudio(surahContent, ayahIndex, segment);
      } else {
        setSelectedSurah(surahNumber);
        setPendingPlayOnLoad({ surah: surahNumber, ayahIndex, segment });
      }
    },
    [surahContent, startAyahAudio]
  );

  const handlePlayBookmarkMeaning = useCallback(
    (item: BookmarkItem) => {
      setSelectedSurah(item.surahNumber);
      setTargetAyah(item.ayahNumberInSurah);
      setPendingPlayOnLoad({
        surah: item.surahNumber,
        ayahIndex: item.ayahNumberInSurah - 1,
        segment: 'bangla',
      });
    },
    []
  );

  const handleTogglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || playingAyahIndex === null || !playingSurahContent) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [isPlaying, playingAyahIndex, playingSurahContent]);

  const handlePrevAyah = useCallback(() => {
    if (!playingSurahContent || playingAyahIndex === null || playingAyahIndex <= 0) return;
    startAyahAudio(playingSurahContent, playingAyahIndex - 1);
  }, [playingSurahContent, playingAyahIndex, startAyahAudio]);

  const handleNextAyah = useCallback(() => {
    if (
      !playingSurahContent ||
      playingAyahIndex === null ||
      playingAyahIndex + 1 >= playingSurahContent.ayahs.length
    ) {
      return;
    }
    startAyahAudio(playingSurahContent, playingAyahIndex + 1);
  }, [playingSurahContent, playingAyahIndex, startAyahAudio]);

  const handleSeek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleCyclePlaybackRate = useCallback(() => {
    const idx = PLAYBACK_RATES.indexOf(playbackRate);
    const nextRate = PLAYBACK_RATES[(idx + 1) % PLAYBACK_RATES.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  }, [playbackRate]);

  const handleChangeReciter = useCallback(
    (newReciterId: string) => {
      setReciterId(newReciterId);
      if (playingSurahContent && playingAyahIndex !== null) {
        const targetSurah = playingSurahContent.meta.number;
        const targetIndex = playingAyahIndex;
        const wasPlayingArabic = isPlaying && activeSegmentRef.current === 'arabic';
        fetchSurahContent(targetSurah, translationId, newReciterId)
          .then((updated) => {
            setPlayingSurahContent(updated);
            if (wasPlayingArabic) {
              startAyahAudio(updated, targetIndex, 'arabic');
            }
          })
          .catch(() => {});
      }
    },
    [playingSurahContent, playingAyahIndex, isPlaying, translationId, startAyahAudio]
  );

  const handleChangeAudioPlayMode = useCallback(
    (mode: AudioPlayMode) => {
      setAudioPlayMode(mode);
      audioPlayModeRef.current = mode;
      if (playingSurahContent && playingAyahIndex !== null && isPlaying) {
        if (mode === 'bangla' && activeSegmentRef.current !== 'bangla') {
          startAyahAudio(playingSurahContent, playingAyahIndex, 'bangla');
        } else if (mode === 'arabic' && activeSegmentRef.current !== 'arabic') {
          startAyahAudio(playingSurahContent, playingAyahIndex, 'arabic');
        }
      }
    },
    [playingSurahContent, playingAyahIndex, isPlaying, startAyahAudio]
  );

  const handleClosePlayer = useCallback(() => {
    playTokenRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setIsBuffering(false);
    setAudioError(null);
    setPlayingAyahIndex(null);
    setPlayingSurahContent(null);
  }, []);

  const handleToggleBookmark = useCallback(
    (ayah: AyahData) => {
      const meta = SURAHS.find((s) => s.number === selectedSurah) ?? SURAHS[0];
      setBookmarks((prev) => {
        const exists = prev.some(
          (b) =>
            b.surahNumber === selectedSurah &&
            b.ayahNumberInSurah === ayah.numberInSurah
        );
        if (exists) {
          return prev.filter(
            (b) =>
              !(
                b.surahNumber === selectedSurah &&
                b.ayahNumberInSurah === ayah.numberInSurah
              )
          );
        }
        return [
          {
            surahNumber: selectedSurah,
            ayahNumberInSurah: ayah.numberInSurah,
            globalAyahNumber: ayah.number,
            surahBanglaName: meta.banglaName,
            arabicText: ayah.arabicText,
            banglaPronunciation: ayah.banglaPronunciation,
            banglaTranslation: ayah.banglaTranslation,
            savedAt: Date.now(),
          },
          ...prev,
        ];
      });
    },
    [selectedSurah]
  );

  const handleRemoveBookmark = useCallback((surahNum: number, ayahNum: number) => {
    setBookmarks((prev) =>
      prev.filter(
        (b) => !(b.surahNumber === surahNum && b.ayahNumberInSurah === ayahNum)
      )
    );
  }, []);

  const lastReadMeta = SURAHS.find((s) => s.number === lastRead.surah) ?? SURAHS[0];
  const lastReadLabel = `সর্বশেষ পাঠ: ${lastReadMeta.banglaName} · আয়াত ${toBengaliDigits(lastRead.ayah)}`;

  const activeAudioAyah =
    playingSurahContent && playingAyahIndex !== null
      ? playingSurahContent.ayahs[playingAyahIndex]
      : null;

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C1917] dark:bg-[#111311] dark:text-[#F2EFE9]">
      <Header
        currentView={currentView}
        onSelectView={setCurrentView}
        onContinueReading={() => handleOpenSurah(lastRead.surah, lastRead.ayah)}
        lastReadLabel={lastReadLabel}
      />

      {currentView === 'directory' && (
        <SurahDirectory
          onOpenSurah={handleOpenSurah}
          onPlaySurah={handlePlaySurahFromDirectory}
          isDark={isDark}
          onToggleTheme={() => setIsDark((d) => !d)}
        />
      )}

      {currentView === 'reader' && (
        <SurahReader
          surahNumber={selectedSurah}
          surahContent={surahContent}
          loading={loadingSurah}
          error={surahError}
          onRetry={() => setReloadNonce((n) => n + 1)}
          onSelectSurah={handleOpenSurah}
          targetAyah={targetAyah}
          onClearTargetAyah={() => setTargetAyah(null)}
          reciterId={reciterId}
          onChangeReciter={handleChangeReciter}
          translationId={translationId}
          onChangeTranslation={setTranslationId}
          audioPlayMode={audioPlayMode}
          onChangeAudioPlayMode={handleChangeAudioPlayMode}
          banglaVoice={banglaVoice}
          onChangeBanglaVoice={setBanglaVoice}
          showPronunciation={showPronunciation}
          onTogglePronunciation={() => setShowPronunciation((v) => !v)}
          showTranslation={showTranslation}
          onToggleTranslation={() => setShowTranslation((v) => !v)}
          arabicFontSize={arabicFontSize}
          onChangeArabicFontSize={(delta) =>
            setArabicFontSize((s) => Math.min(48, Math.max(22, s + delta)))
          }
          banglaFontSize={banglaFontSize}
          onChangeBanglaFontSize={(delta) =>
            setBanglaFontSize((s) => Math.min(24, Math.max(13, s + delta)))
          }
          isDark={isDark}
          onToggleTheme={() => setIsDark((d) => !d)}
          playingSurahNumber={playingSurahContent?.meta.number ?? null}
          playingAyahIndex={playingAyahIndex}
          activeSegment={activeSegment}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          onPlayAyah={handlePlayAyahInReader}
          onTogglePlayPause={handleTogglePlayPause}
          bookmarks={bookmarks}
          onToggleBookmark={handleToggleBookmark}
        />
      )}

      {currentView === 'bookmarks' && (
        <BookmarksView
          bookmarks={bookmarks}
          onOpenBookmark={handleOpenSurah}
          onPlayBookmarkMeaning={handlePlayBookmarkMeaning}
          onRemoveBookmark={handleRemoveBookmark}
          onExploreSurahs={() => setCurrentView('directory')}
        />
      )}

      {currentView === 'about' && (
        <AboutQuranView onStartReading={() => setCurrentView('reader')} />
      )}

      {playingSurahContent && activeAudioAyah && (
        <AudioPlayerBar
          surahNumber={playingSurahContent.meta.number}
          ayahNumberInSurah={activeAudioAyah.numberInSurah}
          totalAyahs={playingSurahContent.ayahs.length}
          reciterId={playingSurahContent.reciterId}
          audioPlayMode={audioPlayMode}
          activeSegment={activeSegment}
          audioError={audioError}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          currentTime={currentTime}
          duration={duration}
          playbackRate={playbackRate}
          repeatOne={repeatOne}
          autoAdvance={autoAdvance}
          onChangeAudioPlayMode={handleChangeAudioPlayMode}
          onTogglePlayPause={handleTogglePlayPause}
          onPrevAyah={handlePrevAyah}
          onNextAyah={handleNextAyah}
          onSeek={handleSeek}
          onCyclePlaybackRate={handleCyclePlaybackRate}
          onToggleRepeatOne={() => setRepeatOne((r) => !r)}
          onToggleAutoAdvance={() => setAutoAdvance((a) => !a)}
          onJumpToAyah={() =>
            handleOpenSurah(
              playingSurahContent.meta.number,
              activeAudioAyah.numberInSurah
            )
          }
          onClose={handleClosePlayer}
        />
      )}
    </div>
  );
}

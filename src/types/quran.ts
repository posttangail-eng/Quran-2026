export type RevelationType = 'Meccan' | 'Medinan';

export interface SurahMeta {
  number: number;
  arabicName: string;
  englishName: string;
  banglaName: string;
  banglaMeaning: string;
  revelationType: RevelationType;
  ayahCount: number;
  juz: number;
}

export interface AyahData {
  number: number; // Global ayah number 1..6236
  numberInSurah: number;
  arabicText: string;
  banglaPronunciation: string;
  banglaTranslation: string;
  audioUrl: string;
  audioSecondaryUrl?: string;
  juz: number;
  page: number;
  ruku: number;
  sajda: boolean;
}

export interface SurahContent {
  meta: SurahMeta;
  ayahs: AyahData[];
  translationId: string;
  reciterId: string;
}

export interface ReciterOption {
  id: string;
  banglaName: string;
  arabicName: string;
  style: string;
}

export interface TranslationOption {
  id: string;
  banglaName: string;
  translatorBio: string;
}

export interface BookmarkItem {
  surahNumber: number;
  ayahNumberInSurah: number;
  globalAyahNumber: number;
  surahBanglaName: string;
  arabicText: string;
  banglaPronunciation: string;
  banglaTranslation: string;
  savedAt: number;
}

export type AppView = 'directory' | 'reader' | 'bookmarks' | 'about';

export type AudioPlayMode = 'arabic' | 'bangla' | 'both';

export type BanglaVoiceName = 'Charon' | 'Kore';

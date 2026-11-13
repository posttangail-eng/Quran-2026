import { SURAHS } from '../data/surahs';
import { AyahData, SurahContent } from '../types/quran';
import { getBanglaPronunciation } from '../utils/bengaliTransliteration';

const SURAH_CACHE = new Map<string, SurahContent>();

interface ApiAyah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  ruku: number;
  sajda: boolean | { recommended?: boolean; obligatory?: boolean };
  audio?: string;
  audioSecondary?: string[];
}

interface ApiEditionBlock {
  number: number;
  ayahs: ApiAyah[];
  edition: {
    identifier: string;
  };
}

const BISMILLAH_PREFIX_REGEX =
  /^\uFEFF?\s*بِسْمِ\s+ٱ?للَّهِ\s+ٱ?لرَّحْمَٰنِ\s+ٱ?لرَّحِيمِ\s*/u;

function cleanArabicText(raw: string, surahNumber: number, ayahNumberInSurah: number): string {
  let text = raw.replace(/\uFEFF/g, '').trim();
  if (surahNumber !== 1 && surahNumber !== 9 && ayahNumberInSurah === 1) {
    text = text.replace(BISMILLAH_PREFIX_REGEX, '').trim();
  }
  return text;
}

const FALLBACK_FATIHAH: AyahData[] = [
  {
    number: 1,
    numberInSurah: 1,
    arabicText: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    banglaPronunciation: getBanglaPronunciation(1, 1, ''),
    banglaTranslation: 'শুরু করছি আল্লাহর নামে যিনি পরম করুণাময়, অতি দয়ালু।',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',
    juz: 1,
    page: 1,
    ruku: 1,
    sajda: false,
  },
  {
    number: 2,
    numberInSurah: 2,
    arabicText: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
    banglaPronunciation: getBanglaPronunciation(1, 2, ''),
    banglaTranslation: 'যাবতীয় প্রশংসা আল্লাহ তাআলার যিনি সকল সৃষ্টি জগতের পালনকর্তা।',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2.mp3',
    juz: 1,
    page: 1,
    ruku: 1,
    sajda: false,
  },
  {
    number: 3,
    numberInSurah: 3,
    arabicText: 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    banglaPronunciation: getBanglaPronunciation(1, 3, ''),
    banglaTranslation: 'যিনি নিতান্ত মেহেরবান ও দয়ালু।',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/3.mp3',
    juz: 1,
    page: 1,
    ruku: 1,
    sajda: false,
  },
  {
    number: 4,
    numberInSurah: 4,
    arabicText: 'مَٰلِكِ يَوْمِ ٱلدِّينِ',
    banglaPronunciation: getBanglaPronunciation(1, 4, ''),
    banglaTranslation: 'যিনি বিচার দিনের মালিক।',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/4.mp3',
    juz: 1,
    page: 1,
    ruku: 1,
    sajda: false,
  },
  {
    number: 5,
    numberInSurah: 5,
    arabicText: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    banglaPronunciation: getBanglaPronunciation(1, 5, ''),
    banglaTranslation: 'আমরা একমাত্র তোমারই ইবাদত করি এবং শুধুমাত্র তোমারই সাহায্য প্রার্থনা করি।',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/5.mp3',
    juz: 1,
    page: 1,
    ruku: 1,
    sajda: false,
  },
  {
    number: 6,
    numberInSurah: 6,
    arabicText: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
    banglaPronunciation: getBanglaPronunciation(1, 6, ''),
    banglaTranslation: 'আমাদেরকে সরল পথ দেখাও,',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6.mp3',
    juz: 1,
    page: 1,
    ruku: 1,
    sajda: false,
  },
  {
    number: 7,
    numberInSurah: 7,
    arabicText: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
    banglaPronunciation: getBanglaPronunciation(1, 7, ''),
    banglaTranslation:
      'সে সমস্ত লোকের পথ, যাদেরকে তুমি নেয়ামত দান করেছ। তাদের পথ নয়, যাদের প্রতি তোমার গজব নাযিল হয়েছে এবং যারা পথভ্রষ্ট হয়েছে।',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/7.mp3',
    juz: 1,
    page: 1,
    ruku: 1,
    sajda: false,
  },
];

export async function fetchSurahContent(
  surahNumber: number,
  translationId = 'bn.bengali',
  reciterId = 'ar.alafasy',
  signal?: AbortSignal
): Promise<SurahContent> {
  const cacheKey = `${surahNumber}:${translationId}:${reciterId}`;
  const cached = SURAH_CACHE.get(cacheKey);
  if (cached) {
    return cached;
  }

  const meta = SURAHS.find((s) => s.number === surahNumber) ?? SURAHS[0];

  try {
    const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,${translationId},en.transliteration,${reciterId}`;
    const response = await fetch(url, { signal });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const blocks: ApiEditionBlock[] = payload?.data;

    if (!Array.isArray(blocks) || blocks.length < 4) {
      throw new Error('অসম্পূর্ণ কুরআন ডেটা পাওয়া গেছে।');
    }

    const arabicBlock = blocks.find((b) => b.edition.identifier === 'quran-uthmani') ?? blocks[0];
    const translationBlock = blocks.find((b) => b.edition.identifier === translationId) ?? blocks[1];
    const translitBlock = blocks.find((b) => b.edition.identifier === 'en.transliteration') ?? blocks[2];
    const audioBlock = blocks.find((b) => b.edition.identifier === reciterId) ?? blocks[3];

    const ayahs: AyahData[] = arabicBlock.ayahs.map((arAyah, idx) => {
      const trAyah = translationBlock.ayahs[idx];
      const latAyah = translitBlock.ayahs[idx];
      const auAyah = audioBlock.ayahs[idx];

      const primaryAudio =
        auAyah?.audio ||
        `https://cdn.islamic.network/quran/audio/128/${reciterId}/${arAyah.number}.mp3`;

      return {
        number: arAyah.number,
        numberInSurah: arAyah.numberInSurah,
        arabicText: cleanArabicText(arAyah.text, surahNumber, arAyah.numberInSurah),
        banglaPronunciation: getBanglaPronunciation(
          surahNumber,
          arAyah.numberInSurah,
          latAyah?.text ?? ''
        ),
        banglaTranslation: (trAyah?.text ?? '').trim(),
        audioUrl: primaryAudio,
        audioSecondaryUrl: auAyah?.audioSecondary?.[0],
        juz: arAyah.juz,
        page: arAyah.page,
        ruku: arAyah.ruku,
        sajda: Boolean(arAyah.sajda),
      };
    });

    const result: SurahContent = {
      meta,
      ayahs,
      translationId,
      reciterId,
    };

    SURAH_CACHE.set(cacheKey, result);
    return result;
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') {
      throw error;
    }
    if (surahNumber === 1) {
      return {
        meta,
        ayahs: FALLBACK_FATIHAH,
        translationId,
        reciterId,
      };
    }
    throw error;
  }
}

const BENGALI_DIGITS: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

export function toBengaliDigits(input: number | string): string {
  return String(input).replace(/[0-9]/g, (d) => BENGALI_DIGITS[d] ?? d);
}

export function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '০:০০';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${toBengaliDigits(mins)}:${toBengaliDigits(secs.toString().padStart(2, '0'))}`;
}

/**
 * Curated, standard Bangladeshi Quranic Bengali pronunciations for frequently recited Surahs & Ayahs.
 */
const VERIFIED_BANGLA_PRONUNCIATIONS: Record<string, string> = {
  // Surah 1: Al-Fatihah
  '1:1': 'বিসমিল্লা-হির রাহমা-নির রাহীম',
  '1:2': 'আলহামদু লিল্লা-হি রাব্বিল ‘আ-লামীন',
  '1:3': 'আর-রাহমা-নির-রাহীম',
  '1:4': 'মা-লিকি ইয়াওমিদ্-দীন',
  '1:5': 'ইয়্যা-কা না‘বুদু ওয়া ইয়্যা-কা নাস্তা‘ঈন',
  '1:6': 'ইহদিনাস্ স্বিরা-ত্বাল মুস্তাক্বীম',
  '1:7': 'স্বিরা-ত্বাল্লাযীনা আন‘আমতা ‘আলাইহিম গাইরিল মাগদূবি ‘আলাইহিম ওয়ালাদ্-দা-ল্লীন',

  // Surah 2:255 (Ayat al-Kursi)
  '2:255':
    'আল্লা-হু লা ইলা-হা ইল্লা হুওয়াল হাইয়্যুল ক্বাইয়্যূম; লা তা’খুযুহু সিনাতুও ওয়ালা নাউম; লাহু মা- ফিস্ সামা-ওয়া-তি ওয়ামা- ফিল আরদ্ব; মান যাল্লাযী ইয়াশফা‘উ ‘ইনদাহু ইল্লা বিইযনিহ; ইয়া‘লামু মা- বাইনা আইদীহিম ওয়ামা- খালফাহুম; ওয়ালা ইয়ুহীতূনা বিশাইয়িম মিন ‘ইলমিহী ইল্লা বিমা- শা-আ; ওয়াসি‘আ কুরসিয়্যুহুস্ সামা-ওয়া-তি ওয়াল আরদ্ব; ওয়ালা ইয়াউদুহু হিফযুহুমা- ওয়া হুওয়াল ‘আলিয়্যুল ‘আযীম।',

  // Surah 103: Al-Asr
  '103:1': 'ওয়াল ‘আস্বর',
  '103:2': 'ইন্নাল ইনসা-না লাফী খুসর',
  '103:3': 'ইল্লাল্লাযীনা আ-মানূ ওয়া ‘আমিলুস্ স্বা-লিহা-তি ওয়া তাওয়া-স্বাও বিলহাক্কি ওয়া তাওয়া-স্বাও বিস্-স্বাবর',

  // Surah 105: Al-Fil
  '105:1': 'আলাম তারা কাইফা ফা‘আলা রাব্বুকা বিআস্বহা-বিল ফীল',
  '105:2': 'আলাম ইয়াজ‘আল কাইদাহুম ফী তাদ্বলীল',
  '105:3': 'ওয়া আরসালা ‘আলাইহিম ত্বাইরান আবা-বীল',
  '105:4': 'তারমীহিম বিহিজা-রাতিম মিন সিজ্জীল',
  '105:5': 'ফাজা‘আলাহুম কা‘আস্বফিম মা’কূল',

  // Surah 106: Quraysh
  '106:1': 'লিঈলা-ফি ক্বুরাইশ',
  '106:2': 'ঈলা-ফিহিম রিহলাতাশ্ শিতা-ই ওয়াস্ স্বাইফ',
  '106:3': 'ফালইয়া‘বুদূ রাব্বা হা-যাল বাইত',
  '106:4': 'আল্লাযী আত্ব‘আমাহুম মিন জূ‘ইও ওয়া আ-মানাহুম মিন খাওফ',

  // Surah 107: Al-Ma'un
  '107:1': 'আরাআইতাল্লাযী ইয়ুকাযযিবু বিদ্-দীন',
  '107:2': 'ফাযা-লিকাল্লাযী ইয়াদু‘‘উল ইয়াতীম',
  '107:3': 'ওয়ালা ইয়াহুদ্দু ‘আলা ত্বা‘আ-মিল মিসকীন',
  '107:4': 'ফাওয়াইলুল লিলমুস্বাল্লীন',
  '107:5': 'আল্লাযীনা হুম ‘আন স্বলা-তিহিম সা-হূন',
  '107:6': 'আল্লাযীনা হুম ইয়ুরা-ঊন',
  '107:7': 'ওয়া ইয়ামনা‘ঊনাল মা-‘ঊন',

  // Surah 108: Al-Kawthar
  '108:1': 'ইন্না আ‘ত্বাইনা-কাল কাওসার',
  '108:2': 'ফাস্বাল্লি লিরাব্বিকা ওয়ানহার',
  '108:3': 'ইন্না শা-নিআকা হুওয়াল আবতার',

  // Surah 109: Al-Kafirun
  '109:1': 'ক্বুল ইয়া আইয়্যুহাল কা-ফিরূন',
  '109:2': 'লা আ‘বুদু মা- তা‘বুদূন',
  '109:3': 'ওয়ালা আনতুম ‘আ-বিদূনা মা- আ‘বুদ',
  '109:4': 'ওয়ালা আনা ‘আ-বিদুম মা- ‘আবাদতুম',
  '109:5': 'ওয়ালা আনতুম ‘আ-বিদূনা মা- আ‘বুদ',
  '109:6': 'লাকুম দীনুকুম ওয়ালিয়া দীন',

  // Surah 110: An-Nasr
  '110:1': 'ইযা- জা-আ নাস্বরুল্লা-হি ওয়াল ফাতহ',
  '110:2': 'ওয়া রাআইতান্ না-সা ইয়াদখুলূনা ফী দীনিল্লা-হি আফওয়া-জা-',
  '110:3': 'ফাসাব্বিহ বিহামদি রাব্বিকা ওয়াস্তাগফিরহু ইন্নাহু কা-না তাওওয়া-বা-',

  // Surah 111: Al-Masad
  '111:1': 'তাব্বাত ইয়াদা- আবী লাহাবিও ওয়া তাব্ব',
  '111:2': 'মা- আগনা- ‘আনহু মা-লুহু ওয়ামা- কাসাব',
  '111:3': 'সাইয়াস্বলা- না-রান যা-তা লাহাব',
  '111:4': 'ওয়ামরাআতুহু হাম্মা-লাতাল হাত্বাব',
  '111:5': 'ফী জীদিহা- হাবলুম মিম মাসাদ',

  // Surah 112: Al-Ikhlas
  '112:1': 'ক্বুল হুওয়াল্লা-হু আহাদ',
  '112:2': 'আল্লা-হুস্ স্বামাদ',
  '112:3': 'লাম ইয়ালিদ ওয়া লাম ইঊলাদ',
  '112:4': 'ওয়া লাম ইয়াকুল্লাহু কুফুওয়ান আহাদ',

  // Surah 113: Al-Falaq
  '113:1': 'ক্বুল আ‘ঊযু বিরাব্বিল ফালাক্ব',
  '113:2': 'মিন শাররি মা- খালাক্ব',
  '113:3': 'ওয়া মিন শাররি গা-সিক্বিন ইযা- ওয়াক্বাব',
  '113:4': 'ওয়া মিন শাররিন নাফফা-সা-তি ফিল ‘উক্বাদ',
  '113:5': 'ওয়া মিন শাররি হা-সিদিন ইযা- হাসাদ',

  // Surah 114: An-Nas
  '114:1': 'ক্বুল আ‘ঊযু বিরাব্বিন্ না-স',
  '114:2': 'মালিকিন্ না-স',
  '114:3': 'ইলা-হিন্ না-স',
  '114:4': 'মিন শাররিল ওয়াসওয়া-সিল খান্না-স',
  '114:5': 'আল্লাযী ইয়ুওয়াসউইসু ফী সুদূরিন্ না-স',
  '114:6': 'মিনাল জিন্নাতি ওয়ান্ না-স',
};

const CONSONANT_MAP: Array<[string, string]> = [
  ['kh', 'খ'],
  ['gh', 'গ'],
  ['sh', 'শ'],
  ['th', 'ছ'],
  ['dh', 'য'],
  ['zh', 'য'],
  ['ch', 'চ'],
  ['b', 'ব'],
  ['t', 'ত'],
  ['j', 'জ'],
  ['h', 'হ'],
  ['d', 'দ'],
  ['r', 'র'],
  ['z', 'য'],
  ['s', 'স'],
  ['f', 'ফ'],
  ['q', 'ক্ব'],
  ['k', 'ক'],
  ['l', 'ল'],
  ['m', 'ম'],
  ['n', 'ন'],
  ['w', 'ও'],
  ['y', 'ইয়'],
  ['p', 'প'],
];

const STANDALONE_VOWEL: Array<[string, string]> = [
  ['aaa', 'আ-'],
  ['aa', 'আ-'],
  ['ee', 'ঈ'],
  ['oo', 'ঊ'],
  ['ai', 'আই'],
  ['ay', 'আই'],
  ['aw', 'আও'],
  ['au', 'আও'],
  ['a', 'আ'],
  ['i', 'ই'],
  ['e', 'এ'],
  ['u', 'উ'],
  ['o', 'ও'],
];

const MATRA_VOWEL: Array<[string, string]> = [
  ['aaa', 'া-'],
  ['aa', 'া-'],
  ['ee', 'ী'],
  ['oo', 'ূ'],
  ['ai', 'াই'],
  ['ay', 'াই'],
  ['aw', 'াও'],
  ['au', 'াও'],
  ['a', 'া'],
  ['i', 'ি'],
  ['e', 'ে'],
  ['u', 'ু'],
  ['o', 'ো'],
];

function transliterateWordToBangla(rawWord: string): string {
  // Normalize known OCR quirks in public Quran transliteration datasets
  let word = rawWord
    .replace(/^lyyaaka$/i, 'Iyyaaka')
    .replace(/['’`]/g, '‘')
    .toLowerCase();

  // Preserve leading/trailing punctuation
  const leadingMatch = word.match(/^[^a-z‘-]+/);
  const trailingMatch = word.match(/[^a-z‘-]+$/);
  const leading = leadingMatch ? leadingMatch[0] : '';
  const trailing = trailingMatch ? trailingMatch[0] : '';
  word = word.slice(leading.length, word.length - trailing.length);

  if (!word) return rawWord;

  // Handle hyphenated segments recursively for crisp rhythm
  if (word.includes('-')) {
    const parts = word.split('-').map((part) => (part ? transliterateWordToBangla(part) : ''));
    return leading + parts.join('-') + trailing;
  }

  // Common exact Quranic particles / Allah forms
  const exactMap: Record<string, string> = {
    allah: 'আল্লা-হ',
    allaah: 'আল্লা-হ',
    allahu: 'আল্লা-হু',
    allaahu: 'আল্লা-হু',
    allaha: 'আল্লা-হা',
    allaaha: 'আল্লা-হা',
    allahi: 'আল্লা-হি',
    allaahi: 'আল্লা-হি',
    lillaahi: 'লিল্লা-হি',
    lillahi: 'লিল্লা-হি',
    bismillaahir: 'বিসমিল্লা-হির',
    bismillahi: 'বিসমিল্লা-হি',
    wa: 'ওয়া',
    wal: 'ওয়াল',
    waal: 'ওয়াল',
    fil: 'ফিল',
    fee: 'ফী',
    fi: 'ফী',
    min: 'মিন',
    mim: 'মিম',
    ila: 'ইলা-',
    ilaa: 'ইলা-',
    '‘ala': '‘আলা-',
    '‘alaa': '‘আলা-',
    ala: '‘আলা-',
    alaa: '‘আলা-',
    huwa: 'হুওয়া',
    hum: 'হুম',
    inna: 'ইন্না',
    innal: 'ইন্নাল',
    innama: 'ইন্নামা-',
    qul: 'ক্বুল',
    la: 'লা-',
    laa: 'লা-',
    lam: 'লাম',
    lan: 'লান',
    ma: 'মা-',
    maa: 'মা-',
    man: 'মান',
    ya: 'ইয়া-',
    yaa: 'ইয়া-',
    rabb: 'রাব্ব',
    rabbi: 'রাব্বি',
    rabbil: 'রাব্বিল',
    rabbika: 'রাব্বিকা',
    rahmaanir: 'রাহমা-নির',
    raheem: 'রাহীম',
    alhamdu: 'আলহামদু',
  };

  if (exactMap[word]) {
    return leading + exactMap[word] + trailing;
  }

  let out = '';
  let i = 0;
  let prevWasConsonant = false;

  while (i < word.length) {
    const rest = word.slice(i);

    if (rest[0] === '‘') {
      out += '‘';
      prevWasConsonant = false;
      i += 1;
      continue;
    }

    // Check special geminated 'yy' (e.g. iyyaaka -> ইয়্যা-কা)
    if (rest.startsWith('yy')) {
      out += prevWasConsonant ? '্য' : 'য়্য';
      prevWasConsonant = true;
      i += 2;
      continue;
    }

    // Check consonant clusters / double consonants (e.g. ll, mm, nn, rr, ss, tt, dd)
    const doubleCons = rest.match(/^([bcdfghjklmnpqrstvwyz])\1/);
    if (doubleCons && !['oo', 'ee', 'aa'].includes(doubleCons[0])) {
      const ch = doubleCons[1];
      const mapped = CONSONANT_MAP.find(([k]) => k === ch)?.[1];
      if (mapped && !['খ', 'গ', 'শ', 'ছ', 'য', 'চ'].includes(mapped)) {
        if (ch === 'w') {
          out += 'ওও';
        } else {
          out += mapped + '্' + mapped;
        }
        prevWasConsonant = true;
        i += 2;
        continue;
      }
    }

    // Match consonant
    const consMatch = CONSONANT_MAP.find(([k]) => rest.startsWith(k));
    if (consMatch) {
      const [key, bnCons] = consMatch;

      // Special handling for 'y' after vowel or consonant
      if (key === 'y') {
        const nextChar = rest[1] ?? '';
        if (prevWasConsonant) {
          // e.g. 'sy' or 'ry' -> ইয়
          out += 'ইয়';
        } else if ('aeiou'.includes(nextChar)) {
          out += 'ইয়';
        } else {
          out += 'য়';
        }
        prevWasConsonant = true;
        i += 1;
        continue;
      }

      // Special handling for 'w' followed by vowel -> ওয় (like 'wa' -> ওয়া, 'huwa' -> হুওয়া)
      if (key === 'w') {
        const nextChar = rest[1] ?? '';
        if ('aeiou'.includes(nextChar)) {
          out += prevWasConsonant ? 'ওয়' : 'ওয়';
          prevWasConsonant = true;
          i += 1;
          continue;
        }
        out += 'ও';
        prevWasConsonant = false;
        i += 1;
        continue;
      }

      out += bnCons;
      prevWasConsonant = true;
      i += key.length;
      continue;
    }

    // Match vowels
    if (prevWasConsonant) {
      const matraMatch = MATRA_VOWEL.find(([k]) => rest.startsWith(k));
      if (matraMatch) {
        const [key, matra] = matraMatch;
        // In Bengali, short 'a' after a consonant is often inherent unless it's 'aa' or needed for clarity;
        // for Arabic pronunciation clarity in Bengali, 'া' is used for fatha-like 'a' except word-ending silent or short syllable,
        // actually standard Bangla Quranic uccharon writes 'া' or inherent carefully:
        // e.g., 'ka' -> 'কা', 'ma' -> 'মা', 'ta' -> 'তা', 'bi' -> 'বি', 'hu' -> 'হু'
        // Wait: 'alhamdu' -> a-l-ha-m-du -> আল-হাম-দু (not আলহামাদু!). Notice 'al' has no vowel after 'l', 'ham' has 'a' after 'h' -> হা, 'm' has no vowel after 'm' -> ম!
        // Look how clean that is: 'a' ALWAYS means fatha (া or inherent), and if there is NO vowel letter in Latin, it has sukun (no vowel)!
        // Wait: in Bengali, 'হা' = h+a, whereas 'হাম' = h+a+m (where m has NO vowel, and 'হাম' is pronounced 'ham' not 'haam' if short, though in Bengali script 'হা' represents 'ha' and 'হ' represents 'ho'!).
        // Yes! In Bengali script, 'হ' alone sounds like 'ho', whereas 'হা' sounds like 'ha' (fatha)! That's why Bangla Quranic pronunciation writes 'হাম' (with া), 'লাম' (লা+ম), 'রাব্ব' (র+ব্ব -> 'র' has inherent 'o/a' sound in Rab, or 'রা'!).
        out += matra;
        prevWasConsonant = false;
        i += key.length;
        continue;
      }
    } else {
      const standMatch = STANDALONE_VOWEL.find(([k]) => rest.startsWith(k));
      if (standMatch) {
        const [key, vowel] = standMatch;
        out += vowel;
        prevWasConsonant = false;
        i += key.length;
        continue;
      }
    }

    // Fallback for any unhandled character
    out += rest[0];
    prevWasConsonant = false;
    i += 1;
  }

  return leading + out + trailing;
}

export function getBanglaPronunciation(
  surahNumber: number,
  ayahNumberInSurah: number,
  latinTransliteration: string
): string {
  const key = `${surahNumber}:${ayahNumberInSurah}`;
  if (VERIFIED_BANGLA_PRONUNCIATIONS[key]) {
    return VERIFIED_BANGLA_PRONUNCIATIONS[key];
  }

  if (!latinTransliteration || !latinTransliteration.trim()) {
    return '';
  }

  return latinTransliteration
    .trim()
    .split(/\s+/)
    .map(transliterateWordToBangla)
    .join(' ');
}

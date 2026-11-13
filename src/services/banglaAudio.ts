import { BanglaVoiceName } from '../types/quran';

const CLIENT_AUDIO_URL_CACHE = new Map<string, string>();
const IN_FLIGHT_REQUESTS = new Map<string, Promise<string>>();

export async function fetchBanglaMeaningAudioUrl(
  text: string,
  voiceName: BanglaVoiceName = 'Charon'
): Promise<string> {
  const cleanText = text.trim();
  if (!cleanText) {
    throw new Error('বাংলা অর্থের কোনো টেক্সট পাওয়া যায়নি।');
  }

  const key = `${voiceName}:${cleanText}`;
  const cached = CLIENT_AUDIO_URL_CACHE.get(key);
  if (cached) {
    return cached;
  }

  const existing = IN_FLIGHT_REQUESTS.get(key);
  if (existing) {
    return existing;
  }

  const promise = (async () => {
    const response = await fetch('/api/tts/bangla', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText, voiceName }),
    });

    if (!response.ok) {
      let errMsg = 'বাংলা অর্থের অডিও লোড করা সম্ভব হয়নি।';
      try {
        const data = await response.json();
        if (data?.error) errMsg = data.error;
      } catch {
        // Ignore JSON parse failure
      }
      throw new Error(errMsg);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    CLIENT_AUDIO_URL_CACHE.set(key, objectUrl);
    return objectUrl;
  })();

  IN_FLIGHT_REQUESTS.set(key, promise);
  try {
    return await promise;
  } finally {
    IN_FLIGHT_REQUESTS.delete(key);
  }
}

export function prefetchBanglaMeaningAudio(
  text: string,
  voiceName: BanglaVoiceName = 'Charon'
): void {
  const cleanText = text.trim();
  if (!cleanText) return;
  const key = `${voiceName}:${cleanText}`;
  if (CLIENT_AUDIO_URL_CACHE.has(key) || IN_FLIGHT_REQUESTS.has(key)) {
    return;
  }
  fetchBanglaMeaningAudioUrl(cleanText, voiceName).catch(() => {
    // Silent prefetch failure; active playback will surface errors if needed
  });
}

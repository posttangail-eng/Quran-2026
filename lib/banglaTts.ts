import { GoogleGenAI } from '@google/genai';

const MAX_CACHE_ENTRIES = 300;
const ttsCache = new Map<string, Buffer>();

export type SupportedBanglaVoice = 'Charon' | 'Kore';

export class TtsRequestError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new TtsRequestError(
      'GEMINI_API_KEY পরিবেশ ভ্যারিয়েবল সেট করা নেই।',
      500
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function generateBanglaTtsWav(
  rawTextInput: unknown,
  voiceInput: unknown
): Promise<Buffer> {
  const rawText = typeof rawTextInput === 'string' ? rawTextInput.trim() : '';
  const voiceName: SupportedBanglaVoice =
    voiceInput === 'Kore' || voiceInput === 'Charon' ? voiceInput : 'Charon';

  if (!rawText) {
    throw new TtsRequestError(
      'অডিও তৈরির জন্য বাংলা অর্থের টেক্সট পাওয়া যায়নি।',
      400
    );
  }

  if (rawText.length > 2500) {
    throw new TtsRequestError('টেক্সটটি নির্ধারিত সীমার চেয়ে বড়।', 400);
  }

  const cacheKey = `${voiceName}:${rawText}`;
  const cached = ttsCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: rawText,
              speechMetadata: {
                style:
                  'Calm, clear, reverent, and natural Bengali narrator reading the translation of the Holy Quran.',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new TtsRequestError('বাংলা অডিও তৈরি করা সম্ভব হয়নি।', 502);
    }

    const wavBuffer = Buffer.from(base64Audio, 'base64');

    if (ttsCache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = ttsCache.keys().next().value;
      if (oldestKey) ttsCache.delete(oldestKey);
    }
    ttsCache.set(cacheKey, wavBuffer);

    return wavBuffer;
  } catch (error) {
    if (error instanceof TtsRequestError) {
      throw error;
    }
    const message =
      error instanceof Error ? error.message : 'অডিও জেনারেট করতে সমস্যা হয়েছে।';
    const status =
      message.includes('PERMISSION_DENIED') || message.includes('API_KEY')
        ? 403
        : message.includes('RESOURCE_EXHAUSTED')
          ? 429
          : 500;
    throw new TtsRequestError(message, status);
  }
}

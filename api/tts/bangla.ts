import { GoogleGenAI } from '@google/genai';

interface VercelReq {
  method?: string;
  body?: unknown;
}

interface VercelRes {
  status: (code: number) => VercelRes;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
  send: (body: Buffer | string) => void;
}

const MAX_CACHE_ENTRIES = 100;
const ttsCache = new Map<string, Buffer>();

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  let parsedBody: { text?: unknown; voiceName?: unknown } = {};
  try {
    if (typeof req.body === 'string') {
      parsedBody = JSON.parse(req.body || '{}');
    } else if (req.body && typeof req.body === 'object') {
      parsedBody = req.body as { text?: unknown; voiceName?: unknown };
    }
  } catch {
    res.status(400).json({ error: 'অবৈধ JSON রিকোয়েস্ট।' });
    return;
  }

  const rawText =
    typeof parsedBody.text === 'string' ? parsedBody.text.trim() : '';
  const voiceName =
    parsedBody.voiceName === 'Kore' || parsedBody.voiceName === 'Charon'
      ? parsedBody.voiceName
      : 'Charon';

  if (!rawText) {
    res
      .status(400)
      .json({ error: 'অডিও তৈরির জন্য বাংলা অর্থের টেক্সট পাওয়া যায়নি।' });
    return;
  }

  if (rawText.length > 2500) {
    res.status(400).json({ error: 'টেক্সটটি নির্ধারিত সীমার চেয়ে বড়।' });
    return;
  }

  const cacheKey = `${voiceName}:${rawText}`;
  const cached = ttsCache.get(cacheKey);
  if (cached) {
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(cached);
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error:
        'Vercel Environment Variables-এ GEMINI_API_KEY সেট করা নেই।',
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

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
      res.status(502).json({ error: 'বাংলা অডিও তৈরি করা সম্ভব হয়নি।' });
      return;
    }

    const wavBuffer = Buffer.from(base64Audio, 'base64');

    if (ttsCache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = ttsCache.keys().next().value;
      if (oldestKey) ttsCache.delete(oldestKey);
    }
    ttsCache.set(cacheKey, wavBuffer);

    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(wavBuffer);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'অডিও জেনারেট করতে সমস্যা হয়েছে।';
    const status =
      message.includes('PERMISSION_DENIED') || message.includes('API_KEY')
        ? 403
        : message.includes('RESOURCE_EXHAUSTED')
          ? 429
          : 500;
    res.status(status).json({ error: message });
  }
}

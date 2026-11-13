import { generateBanglaTtsWav, TtsRequestError } from '../../lib/banglaTts';

interface VercelReq {
  method?: string;
  body?: {
    text?: unknown;
    voiceName?: unknown;
  };
}

interface VercelRes {
  status: (code: number) => VercelRes;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
  send: (body: Buffer | string) => void;
}

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const wavBuffer = await generateBanglaTtsWav(
      req.body?.text,
      req.body?.voiceName
    );
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(wavBuffer);
  } catch (error) {
    if (error instanceof TtsRequestError) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'অডিও জেনারেট করতে সমস্যা হয়েছে।',
    });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';

const DEFAULT_BASE_URL = 'https://ark.ap-southeast.bytepluses.com/api/v3';

const resolveBaseUrl = (baseUrl?: string) => {
  const trimmed = baseUrl?.trim();
  if (!trimmed) return DEFAULT_BASE_URL;
  return trimmed.replace(/\/$/, '');
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, aspectRatio = '1:1', apiKey, baseUrl } = req.body || {};
    const promptTrimmed = (prompt || '').trim();
    if (!promptTrimmed) {
      return res.status(400).json({ error: 'prompt is required' });
    }
    const key = (apiKey || process.env.SEED_DREAM_API_KEY || '').trim();
    if (!key) {
      return res.status(400).json({ error: 'Seed Dream API key is missing' });
    }

    const url = `${resolveBaseUrl(baseUrl)}/images/generate`;
    const payload = {
      model: 'seedream-4-5-251128',
      prompt: promptTrimmed,
      size: aspectRatio === '16:9' ? '2K' : '1K',
      response_format: 'b64_json',
      watermark: false,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let message = `Seed Dream error ${response.status}`;
      try {
        const err = await response.json();
        message = err.error || err.message || message;
      } catch (e) {}
      return res.status(response.status).json({ error: message });
    }

    const data = await response.json();
    const base64 = data?.data?.[0]?.b64_json || data?.image;
    if (!base64) {
      return res.status(500).json({ error: 'Seed Dream: no image returned' });
    }
    const dataUrl = String(base64).startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;

    return res.status(200).json({ result: dataUrl });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
}

// Seed Dream 4.5 image generation service with configurable base URL
// Default to BytePlus ModelArk endpoint
const defaultBaseUrl = 'https://ark.ap-southeast.bytepluses.com/api/v3';

const resolveBaseUrl = (baseUrl?: string) => {
  const trimmed = baseUrl?.trim();
  if (!trimmed) return defaultBaseUrl;
  return trimmed.replace(/\/$/, '');
};

export const generateSeedDreamImage = async (
  apiKey: string,
  prompt: string,
  aspectRatio: string = '1:1',
  baseUrl?: string
): Promise<string> => {
  const url = `${resolveBaseUrl(baseUrl)}/images/generate`;
  const payload = {
    model: 'seedream-4-5-251128',
    prompt,
    size: aspectRatio === '16:9' ? '2K' : '1K',
    response_format: 'b64_json',
    watermark: false,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = `Seed Dream error ${response.status}`;
    try {
      const err = await response.json();
      message = err.error || err.message || message;
    } catch (e) {}
    throw new Error(message);
  }

  const data = await response.json();
  // Expect ModelArk images.generate response: data: [{ b64_json: string }]
  const base64 = data?.data?.[0]?.b64_json || data?.image;
  if (!base64) throw new Error('Seed Dream: no image returned');
  if (String(base64).startsWith('data:')) return base64;
  return `data:image/png;base64,${base64}`;
};

// Currently unsupported without official remix endpoint; surface clear error
export const remixSeedDreamImage = async (): Promise<string> => {
  throw new Error('Seed Dream remix is not supported by the current integration');
};

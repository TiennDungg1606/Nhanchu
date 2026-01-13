// Seed Dream 4.5 image generation service with configurable base URL
// Default to BytePlus ModelArk endpoint
const defaultBaseUrl = 'https://ark.ap-southeast.bytepluses.com/api/v3';


export const generateSeedDreamImage = async (
  apiKey: string,
  prompt: string,
  aspectRatio: string = '1:1',
  baseUrl?: string
): Promise<string> => {

  const response = await fetch('/api/seed-dream-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, aspectRatio, apiKey, baseUrl }),
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
  if (!data?.result) throw new Error('Seed Dream: no image returned');
  return data.result;
};

// Currently unsupported without official remix endpoint; surface clear error
export const remixSeedDreamImage = async (): Promise<string> => {
  throw new Error('Seed Dream remix is not supported by the current integration');
};

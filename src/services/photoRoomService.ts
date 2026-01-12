
// Helper function to convert a base64 data URL to a Blob
const base64ToBlob = (dataUrl: string): Blob => {
  const parts = dataUrl.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
};

export const removeBackground = async (apiKey: string, imageBase64: string): Promise<string> => {
  // Gọi qua Vercel Serverless Function Proxy (bắt buộc, không fallback trực tiếp để tránh CORS)
  const vercelProxyResponse = await fetch('/api/remove-bg', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, apiKey })
  });

  if (!vercelProxyResponse.ok) {
    let message = `Vercel Proxy error (${vercelProxyResponse.status})`;
    try {
      const errorData = await vercelProxyResponse.json();
      message = errorData.error || message;
    } catch (e) {
      // ignore parse error
    }
    throw new Error(message);
  }

  const data = await vercelProxyResponse.json();
  if (!data?.result) {
    throw new Error('No result returned from remove-bg proxy');
  }

  return data.result;
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

export async function generateText(promptText: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    GEMINI_MODEL
  )}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: promptText }],
        },
      ],
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`Gemini API error (${response.status}): ${JSON.stringify(data)?.slice(0, 300)}`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text || typeof text !== 'string') {
    throw new Error(`Gemini empty response: ${JSON.stringify(data)?.slice(0, 300)}`);
  }

  return text.trim();
}

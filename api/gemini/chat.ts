import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

function handleGeminiError(error: any, res: VercelResponse) {
  console.error('Gemini Error:', error);
  if (error.message?.includes('429') || error.status === 'RESOURCE_EXHAUSTED' || error.status === 429) {
    return res.status(429).json({
      error: 'Quota Exceeded',
      message: "You've exceeded the Gemini API free tier quota.",
      isQuotaError: true
    });
  }
  if (error.message?.includes('403') || error.message?.includes('PERMISSION_DENIED') || error.message?.includes('API_KEY_INVALID')) {
    return res.status(403).json({ error: 'Invalid API Key', message: 'Access denied. Please check your API key.' });
  }
  return res.status(500).json({ error: error.message || 'An unexpected error occurred.' });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { messages, systemInstruction } = req.body || {};

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: messages.map((m: any) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.text }]
      })),
      config: { systemInstruction }
    });

    return res.json({ text: response.text });
  } catch (error: any) {
    return handleGeminiError(error, res);
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

const resultCache = new Map<string, { result: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60;

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
    const { model, contents, config } = req.body || {};
    const cacheKey = `generate:${JSON.stringify(req.body)}`;

    const cached = resultCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json(cached.result);
    }

    const response = await ai.models.generateContent({
      model: model || 'gemini-3-flash-preview',
      contents,
      config
    });

    const finalResult = { text: response.text };
    resultCache.set(cacheKey, { result: finalResult, timestamp: Date.now() });
    return res.json(finalResult);
  } catch (error: any) {
    return handleGeminiError(error, res);
  }
}

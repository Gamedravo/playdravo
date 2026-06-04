import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

app.use(express.json({ limit: '10mb' }));
app.use(cors());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Simple in-memory cache
const resultCache = new Map<string, { result: any, timestamp: number }>();
const pendingRequests = new Map<string, Promise<any>>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

const getCacheKey = (type: string, data: any) => {
  return `${type}:${JSON.stringify(data)}`;
};

// Rate limiting state
const lastRequestTime = new Map<string, number>();
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests from same client (simple)

// Helper for error handling
const handleGeminiError = (error: any, res: express.Response) => {
  console.error("Gemini Error:", error);
  
  if (error.message?.includes('429') || error.status === 'RESOURCE_EXHAUSTED' || error.status === 429) {
    return res.status(429).json({
      error: "Quota Exceeded",
      message: "You've exceeded the Gemini API free tier quota. Upgrading to a paid tier increases your quota. You can select a billing-enabled API key in the Settings > Secrets panel.",
      isQuotaError: true
    });
  }

  if (error.message?.includes('403') || error.message?.includes('PERMISSION_DENIED') || error.message?.includes('API_KEY_INVALID')) {
    return res.status(403).json({
      error: "Invalid API Key",
      message: "Access denied. Please check your API key in the Settings > Secrets panel."
    });
  }

  res.status(500).json({ error: error.message || "An unexpected error occurred with the AI server." });
};

// Check Embed Compatibility Route
app.post("/api/check-embed", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "Missing URL" });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const checkRes = await fetch(url, { 
      method: "HEAD",
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;'
      }
    });
    
    clearTimeout(timeout);

    const xFrameOptions = checkRes.headers.get("x-frame-options")?.toLowerCase();
    const csp = checkRes.headers.get("content-security-policy")?.toLowerCase();
    
    let isBlocked = false;
    let reason = "";

    if (xFrameOptions === "deny" || xFrameOptions === "sameorigin") {
      isBlocked = true;
      reason = `Blocked by X-Frame-Options: ${xFrameOptions}`;
    } else if (csp && (csp.includes("frame-ancestors 'none'") || csp.includes("frame-ancestors 'self'"))) {
      isBlocked = true;
      reason = "Blocked by Content-Security-Policy: frame-ancestors";
    }

    res.json({
      embeddable: !isBlocked,
      reason,
      status: checkRes.status
    });
  } catch (error: any) {
    // If we can't even fetch the headers, it might be a DNS or purely client-side routing issue.
    // However, for proxy checks, we return false here as a precaution, or true assuming the firewall blocked our Node server.
    // Let's assume it's embeddable to prevent false negatives from the Node server being firewalled, 
    // unless we get a definitive block header.
    console.warn("Embed check failed:", error.message);
    res.json({
      embeddable: true,
      reason: error.message,
      error: true
    });
  }
});

// Generic Gemini Generate Route
app.post("/api/gemini/generate", async (req, res) => {
  const cacheKey = getCacheKey('generate', req.body);
  
  // Check cache
  const cached = resultCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.json(cached.result);
  }

  // Check pending
  if (pendingRequests.has(cacheKey)) {
    try {
      const result = await pendingRequests.get(cacheKey);
      return res.json(result);
    } catch (error) {
      return handleGeminiError(error, res);
    }
  }

  const requestPromise = (async () => {
    const { model, contents, config } = req.body;
    
    // Use ai.models.generateContent directly
    const response = await ai.models.generateContent({
      model: model || "gemini-3-flash-preview",
      contents: contents,
      config: config
    });
    
    const finalResult = { text: response.text };
    resultCache.set(cacheKey, { result: finalResult, timestamp: Date.now() });
    return finalResult;
  })();

  pendingRequests.set(cacheKey, requestPromise);

  try {
    const result = await requestPromise;
    res.json(result);
  } catch (error: any) {
    handleGeminiError(error, res);
  } finally {
    pendingRequests.delete(cacheKey);
  }
});

// Chat Route
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages, systemInstruction } = req.body;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: messages.map((m: any) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.text }]
      })),
      config: {
        systemInstruction: systemInstruction
      }
    });
    
    res.json({ text: response.text });
  } catch (error: any) {
    handleGeminiError(error, res);
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    // Force canonical host in production (non-www -> www).
    app.use((req, res, next) => {
      const host = String(req.headers.host || '').toLowerCase();
      if (host === 'gamedravo.com' || host.startsWith('gamedravo.com:')) {
        const target = `https://www.gamedravo.com${req.originalUrl || '/'}`;
        return res.redirect(301, target);
      }
      return next();
    });

    // Ensure correct content-types for SEO-critical static files (avoid SPA fallback).
    app.get('/sitemap.xml', (_req, res) => {
      res.type('application/xml');
      const distFile = path.join(distPath, 'sitemap.xml');
      const publicFile = path.join(process.cwd(), 'public', 'sitemap.xml');
      const filePath = fs.existsSync(distFile) ? distFile : publicFile;
      return res.sendFile(filePath);
    });
    app.get('/robots.txt', (_req, res) => {
      res.type('text/plain');
      const distFile = path.join(distPath, 'robots.txt');
      const publicFile = path.join(process.cwd(), 'public', 'robots.txt');
      const filePath = fs.existsSync(distFile) ? distFile : publicFile;
      return res.sendFile(filePath);
    });
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

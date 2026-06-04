import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ error: 'Missing URL' });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const checkRes = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;'
      }
    });

    clearTimeout(timeout);

    const xFrameOptions = checkRes.headers.get('x-frame-options')?.toLowerCase();
    const csp = checkRes.headers.get('content-security-policy')?.toLowerCase();

    let isBlocked = false;
    let reason = '';

    if (xFrameOptions === 'deny' || xFrameOptions === 'sameorigin') {
      isBlocked = true;
      reason = `Blocked by X-Frame-Options: ${xFrameOptions}`;
    } else if (csp && (csp.includes("frame-ancestors 'none'") || csp.includes("frame-ancestors 'self'"))) {
      isBlocked = true;
      reason = "Blocked by Content-Security-Policy: frame-ancestors";
    }

    return res.json({ embeddable: !isBlocked, reason, status: checkRes.status });
  } catch (error: any) {
    console.warn('Embed check failed:', error.message);
    return res.json({ embeddable: true, reason: error.message, error: true });
  }
}

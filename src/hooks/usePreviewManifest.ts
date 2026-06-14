import { useState, useEffect } from 'react';

export interface PreviewEntry {
  url: string;
  kind: 'mp4' | 'webm' | 'gif';
  source: 'scraped' | 'manual' | 'local';
  capturedAt: string;
  gameTitle?: string;
}

export type PreviewManifest = Record<string, PreviewEntry>;

let cached: PreviewManifest | null = null;
let inflightPromise: Promise<PreviewManifest> | null = null;

export async function fetchPreviewManifest(): Promise<PreviewManifest> {
  if (cached) return cached;
  if (inflightPromise) return inflightPromise;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  inflightPromise = fetch('/api/previews/manifest', { signal: controller.signal })
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}))
    .finally(() => clearTimeout(timer))
    .then((data: PreviewManifest) => {
      cached = data;
      inflightPromise = null;
      return data;
    });

  return inflightPromise;
}

export function invalidatePreviewManifest() {
  cached = null;
  inflightPromise = null;
}

export function usePreviewManifest(): PreviewManifest {
  const [manifest, setManifest] = useState<PreviewManifest>(cached ?? {});

  useEffect(() => {
    let alive = true;
    fetchPreviewManifest().then((m) => {
      if (alive) setManifest(m);
    });
    return () => { alive = false; };
  }, []);

  return manifest;
}

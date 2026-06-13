import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

interface HtmlSitemapPageProps {
  isDarkMode: boolean;
  t: (key: string) => string;
}

function toLabel(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function HtmlSitemapPage({ isDarkMode }: HtmlSitemapPageProps) {
  const [gameUrls, setGameUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/sitemap.xml')
      .then((r) => r.text())
      .then((xml) => {
        const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
        const games = matches.filter((u) => u.includes('/games/'));
        setGameUrls(games);
      })
      .catch(() => setGameUrls([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SEO
        title="Game Index | GameDravo"
        description="Browse the complete GameDravo game index — every free browser game available on our platform, listed alphabetically."
        canonicalUrl="/html-sitemap"
      />
      <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Game Index</h1>
          <p className="mb-6 text-sm opacity-60">
            Complete list of all {gameUrls.length > 0 ? gameUrls.length : '800+'} free browser games on GameDravo. No download required.
          </p>

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Quick Links</h2>
            <div className="flex flex-wrap gap-3 text-sm">
              {['/', '/about', '/contact', '/privacy', '/terms', '/cookies'].map((path) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-3 py-1 rounded-full border ${isDarkMode ? 'border-gray-700 hover:border-accent' : 'border-gray-300 hover:border-blue-500'} transition-colors`}
                >
                  {path === '/' ? 'Home' : path.replace('/', '').replace(/\b\w/g, (c) => c.toUpperCase())}
                </Link>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="opacity-50">Loading game list…</p>
          ) : (
            <div>
              <h2 className="text-lg font-semibold mb-4">All Games ({gameUrls.length})</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 text-sm">
                {gameUrls.map((url) => {
                  const slug = url.replace('https://gamedravo.com/games/', '');
                  return (
                    <li key={slug}>
                      <Link
                        to={`/games/${slug}`}
                        className={`block px-2 py-1 rounded hover:underline ${isDarkMode ? 'hover:text-accent' : 'hover:text-blue-600'} truncate`}
                        title={toLabel(slug)}
                      >
                        {toLabel(slug)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

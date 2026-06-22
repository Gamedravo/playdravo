import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

interface HtmlSitemapPageProps {
  isDarkMode: boolean;
  t: (key: string) => string;
}

function toLabel(path: string): string {
  if (path === '/') return 'Home';
  return path
    .split('/')
    .filter(Boolean)
    .pop()!
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function toPath(url: string): string {
  return url.replace(/^https?:\/\/[^/]+/, '') || '/';
}

export function HtmlSitemapPage({ isDarkMode }: HtmlSitemapPageProps) {
  const [urls, setUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/sitemap.xml')
      .then((response) => response.text())
      .then((xml) => {
        const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => toPath(match[1]));
        setUrls(paths);
      })
      .catch(() => setUrls([]))
      .finally(() => setLoading(false));
  }, []);

  const categoryUrls = urls.filter((url) => url.startsWith('/category/'));
  const pageUrls = urls.filter((url) => !url.startsWith('/category/'));

  const linkClass = `block px-2 py-1 rounded hover:underline ${isDarkMode ? 'hover:text-accent' : 'hover:text-blue-600'} truncate`;

  return (
    <>
      <SEO
        title="Site Index | GameDravo"
        description="Browse the GameDravo site index — key pages and game categories available on our free browser gaming platform."
        canonicalUrl="/html-sitemap"
      />
      <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">GameDravo Site Index</h1>
          <p className="mb-6 text-sm opacity-60">
            Browse canonical GameDravo pages and category hubs included in the XML sitemap.
          </p>

          {loading ? (
            <p className="opacity-50">Loading site index…</p>
          ) : (
            <div className="space-y-8">
              <section>
                <h2 className="text-lg font-semibold mb-4">Site Pages ({pageUrls.length})</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 text-sm">
                  {pageUrls.map((path) => (
                    <li key={path}>
                      <Link to={path} className={linkClass} title={toLabel(path)}>
                        {toLabel(path)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-4">Game Categories ({categoryUrls.length})</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 text-sm">
                  {categoryUrls.map((path) => (
                    <li key={path}>
                      <Link to={path} className={linkClass} title={toLabel(path)}>
                        {toLabel(path)} Games
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

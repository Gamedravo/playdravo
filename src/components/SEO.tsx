import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  canonicalUrl?: string;
  /** JSON-LD structured data (object or array). */
  structuredData?: unknown;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  canonicalUrl,
  structuredData,
}) => {
  const siteName = 'GameDravo';
  const fullTitle = title.includes(siteName) ? title : `${title} – ${siteName}`;

  const normalizeCanonical = (value: string) => {
    try {
      const u = new URL(value);
      u.hash = '';
      // Strip tracking params for canonical.
      const toDelete: string[] = [];
      u.searchParams.forEach((_v, k) => {
        if (
          k.startsWith('utm_') ||
          k === 'gclid' ||
          k === 'fbclid' ||
          k === 'mc_cid' ||
          k === 'mc_eid'
        ) {
          toDelete.push(k);
        }
      });
      toDelete.forEach((k) => u.searchParams.delete(k));
      // Keep origin + pathname + remaining params (if any).
      return u.toString();
    } catch {
      return value;
    }
  };

  const canonical = canonicalUrl
    ? normalizeCanonical(canonicalUrl)
    : url
      ? normalizeCanonical(url)
      : undefined;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} /> }
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      {canonical && <meta property="og:url" content={canonical} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

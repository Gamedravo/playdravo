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

const SITE_NAME = 'GameDravo';
const LEGACY_SITE_NAME = 'GameDravo';
const DEFAULT_IMAGE = '/logo.svg';
const DEFAULT_KEYWORDS = 'free online games, lightweight browser games, no download games, instant play games, HTML5 games, mobile games, arcade games, puzzle games, action games';

function normalizeCanonical(value: string) {
  try {
    const u = new URL(value, window.location.origin);
    u.hash = '';
    const trackingParams: string[] = [];
    u.searchParams.forEach((_value, key) => {
      if (
        key.startsWith('utm_') ||
        key === 'gclid' ||
        key === 'fbclid' ||
        key === 'mc_cid' ||
        key === 'mc_eid'
      ) {
        trackingParams.push(key);
      }
    });
    trackingParams.forEach((key) => u.searchParams.delete(key));
    return u.toString();
  } catch {
    return value;
  }
}

function absoluteUrl(value: string) {
  try {
    return new URL(value, window.location.origin).toString();
  } catch {
    return value;
  }
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image = DEFAULT_IMAGE,
  url,
  canonicalUrl,
  structuredData,
}) => {
  const hasBrand = title.includes(SITE_NAME) || title.includes(LEGACY_SITE_NAME);
  const fullTitle = hasBrand ? title.replaceAll(LEGACY_SITE_NAME, SITE_NAME) : `${title} – ${SITE_NAME}`;
  const canonical = normalizeCanonical(canonicalUrl || url || window.location.href);
  const imageUrl = absoluteUrl(image);
  const mergedKeywords = keywords ? `${keywords}, ${DEFAULT_KEYWORDS}` : DEFAULT_KEYWORDS;

  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    alternateName: LEGACY_SITE_NAME,
    url: window.location.origin,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires a modern web browser',
    description: 'A lightweight futuristic portal for instant no-download browser games.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  const jsonLd = structuredData
    ? Array.isArray(structuredData)
      ? [baseStructuredData, ...structuredData]
      : [baseStructuredData, structuredData]
    : baseStructuredData;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={mergedKeywords} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="application-name" content={SITE_NAME} />
      <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
      <meta name="theme-color" content="#070A16" />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
};

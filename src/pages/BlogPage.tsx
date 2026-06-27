import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, ChevronRight, ArrowRight, Tag } from 'lucide-react';
import { SEO } from '../components/SEO';
import { BLOG_POSTS } from '../lib/blogContent';

interface BlogPageProps {
  isDarkMode: boolean;
}

export function BlogPage({ isDarkMode }: BlogPageProps) {
  const categories = Array.from(new Set(BLOG_POSTS.map(p => p.category)));

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <SEO
        title="GameDravo Blog – Browser Gaming Guides, Tips & Top Lists"
        description="Read expert browser gaming guides, top game lists, strategy tips, and the latest in HTML5 gaming on the GameDravo blog. Free games, no download required."
        keywords="browser gaming blog, HTML5 games guide, free games tips, browser game strategy, online gaming articles"
        canonicalUrl="https://gamedravo.com/blog"
        url="https://gamedravo.com/blog"
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'GameDravo Blog',
            description: 'Expert browser gaming guides, tips, top game lists, and HTML5 gaming coverage.',
            url: 'https://gamedravo.com/blog',
            publisher: {
              '@type': 'Organization',
              name: 'GameDravo',
              url: 'https://gamedravo.com',
            },
            blogPost: BLOG_POSTS.map(post => ({
              '@type': 'BlogPosting',
              headline: post.title,
              description: post.description,
              url: `https://gamedravo.com/blog/${post.slug}`,
              datePublished: post.publishedAt,
              dateModified: post.updatedAt,
              author: { '@type': 'Organization', name: 'GameDravo' },
            })),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gamedravo.com' },
              { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://gamedravo.com/blog' },
            ],
          },
        ]}
      />

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-[10px] font-semibold tracking-wide">
          <li>
            <Link to="/" className={`transition-colors hover:text-accent ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
              Home
            </Link>
          </li>
          <li aria-hidden="true"><ChevronRight className={`w-3 h-3 ${isDarkMode ? 'text-white/30' : 'text-black/30'}`} /></li>
          <li aria-current="page" className="text-accent">Blog</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-accent" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-accent">GameDravo Blog</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
          Gaming Guides &amp; Top Lists
        </h1>
        <p className={`text-base max-w-2xl leading-relaxed ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
          Expert tips, game recommendations, strategy guides, and everything you need to get the most out of browser gaming — all free, no download required.
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map(cat => (
          <span
            key={cat}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide border ${
              isDarkMode ? 'bg-white/5 border-white/10 text-white/60' : 'bg-black/5 border-black/10 text-black/60'
            }`}
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Featured post */}
      {BLOG_POSTS[0] && (
        <Link
          to={`/blog/${BLOG_POSTS[0].slug}`}
          className={`block group mb-10 rounded-2xl border overflow-hidden transition-all hover:border-accent/40 ${
            isDarkMode ? 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04]' : 'bg-black/[0.01] border-black/10 hover:bg-black/[0.03]'
          }`}
        >
          <div className="p-8 md:p-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{BLOG_POSTS[0].heroEmoji}</span>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                isDarkMode ? 'bg-accent/10 border-accent/25 text-accent' : 'bg-accent/10 border-accent/20 text-accent'
              }`}>
                Featured
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                {BLOG_POSTS[0].category}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-3 group-hover:text-accent transition-colors">
              {BLOG_POSTS[0].title}
            </h2>
            <p className={`text-sm leading-relaxed mb-6 max-w-3xl ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
              {BLOG_POSTS[0].description}
            </p>
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-4 text-[11px] font-semibold ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {BLOG_POSTS[0].readTime}
                </span>
                <span>{BLOG_POSTS[0].publishedAt}</span>
              </div>
              <span className="flex items-center gap-1.5 text-accent text-xs font-bold group-hover:gap-2.5 transition-all">
                Read Article <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Post grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {BLOG_POSTS.slice(1).map(post => (
          <Link
            key={post.slug}
            to={`/blog/${post.slug}`}
            className={`group rounded-2xl border p-6 transition-all hover:border-accent/40 flex flex-col gap-4 ${
              isDarkMode ? 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04]' : 'bg-black/[0.01] border-black/10 hover:bg-black/[0.02]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{post.heroEmoji}</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                  {post.category}
                </span>
              </div>
              <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                <Clock className="w-3.5 h-3.5" />
                {post.readTime}
              </div>
            </div>

            <div className="flex-1">
              <h2 className={`text-lg font-black tracking-tight mb-2 group-hover:text-accent transition-colors leading-snug`}>
                {post.title}
              </h2>
              <p className={`text-sm leading-relaxed line-clamp-3 ${isDarkMode ? 'text-white/55' : 'text-black/55'}`}>
                {post.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {post.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wide border ${
                      isDarkMode ? 'bg-white/[0.03] border-white/[0.07] text-white/35' : 'bg-black/[0.03] border-black/[0.07] text-black/35'
                    }`}
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
              <span className={`text-[10px] font-semibold ${isDarkMode ? 'text-white/35' : 'text-black/35'}`}>
                {post.publishedAt}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className={`mt-16 rounded-2xl border p-8 text-center ${isDarkMode ? 'bg-accent/[0.05] border-accent/20' : 'bg-accent/[0.04] border-accent/15'}`}>
        <h2 className="text-xl font-black tracking-tight mb-2">Ready to Play?</h2>
        <p className={`text-sm mb-6 ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
          1,000+ free browser games — no download, no sign-up. Instant play on any device.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
        >
          Browse All Games <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

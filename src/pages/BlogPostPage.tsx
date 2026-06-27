import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Clock, ChevronRight, ArrowLeft, ArrowRight, Tag, ExternalLink, BookOpen } from 'lucide-react';
import { SEO } from '../components/SEO';
import { getBlogPost, getRelatedPosts, type BlogSection } from '../lib/blogContent';

interface BlogPostPageProps {
  isDarkMode: boolean;
}

function renderSection(section: BlogSection, idx: number, isDarkMode: boolean) {
  const prose = isDarkMode ? 'text-white/75' : 'text-black/70';
  const heading = isDarkMode ? 'text-white' : 'text-black';

  switch (section.type) {
    case 'h2':
      return (
        <h2 key={idx} className={`text-2xl font-black tracking-tight mt-10 mb-4 ${heading}`}>
          {section.text}
        </h2>
      );
    case 'h3':
      return (
        <h3 key={idx} className={`text-lg font-bold tracking-tight mt-8 mb-3 ${heading}`}>
          {section.text}
        </h3>
      );
    case 'p':
      return (
        <p key={idx} className={`text-[15px] leading-relaxed mb-5 ${prose}`}>
          {section.text}
        </p>
      );
    case 'ul':
      return (
        <ul key={idx} className={`mb-5 space-y-2 pl-1 ${prose}`}>
          {section.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[15px] leading-relaxed">
              <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
              {item}
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol key={idx} className={`mb-5 space-y-2 ${prose}`}>
          {section.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[15px] leading-relaxed">
              <span className="shrink-0 w-6 h-6 rounded-full bg-accent/15 border border-accent/25 text-accent text-[11px] font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      );
    case 'tip':
      return (
        <div key={idx} className={`my-6 p-5 rounded-2xl border-l-4 border-accent ${isDarkMode ? 'bg-accent/[0.07] border border-accent/20' : 'bg-accent/[0.05] border border-accent/15'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-accent text-[10px] font-extrabold uppercase tracking-widest">💡 Pro Tip</span>
          </div>
          <p className={`text-sm leading-relaxed ${prose}`}>{section.text}</p>
        </div>
      );
    case 'cta':
      return (
        <div key={idx} className={`my-8 p-6 rounded-2xl border text-center ${isDarkMode ? 'bg-accent/[0.06] border-accent/20' : 'bg-accent/[0.04] border-accent/15'}`}>
          <p className={`text-sm font-semibold mb-4 ${prose}`}>{section.text}</p>
          {section.link && (
            <Link
              to={section.link.href}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
            >
              {section.link.text} <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      );
    default:
      return null;
  }
}

export function BlogPostPage({ isDarkMode }: BlogPostPageProps) {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPost(slug) : undefined;

  if (!post) return <Navigate to="/blog" replace />;

  const relatedPosts = getRelatedPosts(post);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <SEO
        title={`${post.title} | GameDravo Blog`}
        description={post.description}
        keywords={post.tags.join(', ')}
        canonicalUrl={`https://gamedravo.com/blog/${post.slug}`}
        url={`https://gamedravo.com/blog/${post.slug}`}
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.description,
            url: `https://gamedravo.com/blog/${post.slug}`,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            author: {
              '@type': 'Organization',
              name: 'GameDravo',
              url: 'https://gamedravo.com',
            },
            publisher: {
              '@type': 'Organization',
              name: 'GameDravo',
              url: 'https://gamedravo.com',
            },
            keywords: post.tags.join(', '),
            articleSection: post.category,
            wordCount: post.content.reduce((acc, s) => acc + (s.text?.split(' ').length || 0) + (s.items?.join(' ').split(' ').length || 0), 0),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gamedravo.com' },
              { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://gamedravo.com/blog' },
              { '@type': 'ListItem', position: 3, name: post.title, item: `https://gamedravo.com/blog/${post.slug}` },
            ],
          },
        ]}
      />

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-[10px] font-semibold tracking-wide flex-wrap">
          <li>
            <Link to="/" className={`transition-colors hover:text-accent ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
              Home
            </Link>
          </li>
          <li aria-hidden="true"><ChevronRight className={`w-3 h-3 ${isDarkMode ? 'text-white/30' : 'text-black/30'}`} /></li>
          <li>
            <Link to="/blog" className={`transition-colors hover:text-accent ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
              Blog
            </Link>
          </li>
          <li aria-hidden="true"><ChevronRight className={`w-3 h-3 ${isDarkMode ? 'text-white/30' : 'text-black/30'}`} /></li>
          <li aria-current="page" className={`truncate max-w-[200px] ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>{post.title}</li>
        </ol>
      </nav>

      {/* Article header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-5xl">{post.heroEmoji}</span>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
              isDarkMode ? 'bg-accent/10 border-accent/25 text-accent' : 'bg-accent/10 border-accent/20 text-accent'
            }`}>
              {post.category}
            </span>
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4 leading-tight">
          {post.title}
        </h1>
        <p className={`text-base leading-relaxed mb-6 max-w-3xl ${isDarkMode ? 'text-white/65' : 'text-black/65'}`}>
          {post.description}
        </p>
        <div className={`flex flex-wrap items-center gap-4 text-[11px] font-semibold border-b pb-6 ${isDarkMode ? 'text-white/40 border-white/10' : 'text-black/40 border-black/10'}`}>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {post.readTime}
          </span>
          <span>Published {post.publishedAt}</span>
          {post.updatedAt !== post.publishedAt && <span>Updated {post.updatedAt}</span>}
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            GameDravo Editorial
          </span>
        </div>
      </header>

      {/* Article content */}
      <article className="mb-14">
        {post.content.map((section, idx) => renderSection(section, idx, isDarkMode))}
      </article>

      {/* Tags */}
      <div className={`pt-6 border-t mb-12 ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
        <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
          Topics Covered
        </h3>
        <div className="flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <span
              key={tag}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border ${
                isDarkMode ? 'bg-white/[0.04] border-white/10 text-white/55' : 'bg-black/[0.03] border-black/10 text-black/55'
              }`}
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Related categories */}
      {post.relatedCategories.length > 0 && (
        <div className={`p-6 rounded-2xl border mb-12 ${isDarkMode ? 'bg-white/[0.02] border-white/10' : 'bg-black/[0.01] border-black/10'}`}>
          <h3 className="text-sm font-bold tracking-tight mb-4">Explore Related Games</h3>
          <div className="flex flex-wrap gap-3">
            {post.relatedCategories.map(slug => (
              <Link
                key={slug}
                to={`/category/${slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-accent/30 text-accent bg-accent/[0.08] hover:bg-accent/[0.15] transition-colors"
              >
                {slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Games
                <ExternalLink className="w-3 h-3" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section>
          <h2 className="text-xl font-black tracking-tight mb-6">More Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedPosts.map(related => (
              <Link
                key={related.slug}
                to={`/blog/${related.slug}`}
                className={`group rounded-2xl border p-5 transition-all hover:border-accent/40 flex flex-col gap-3 ${
                  isDarkMode ? 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04]' : 'bg-black/[0.01] border-black/10 hover:bg-black/[0.02]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{related.heroEmoji}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                    {related.category}
                  </span>
                  <span className={`ml-auto flex items-center gap-1 text-[10px] font-semibold ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>
                    <Clock className="w-3 h-3" />
                    {related.readTime}
                  </span>
                </div>
                <h3 className="text-sm font-bold tracking-tight leading-snug group-hover:text-accent transition-colors">
                  {related.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back nav */}
      <div className="mt-10 flex items-center justify-between">
        <Link
          to="/blog"
          className={`flex items-center gap-2 text-sm font-bold transition-colors hover:text-accent ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}
        >
          <ArrowLeft className="w-4 h-4" />
          All Articles
        </Link>
        <Link
          to="/"
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
        >
          Browse Games <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

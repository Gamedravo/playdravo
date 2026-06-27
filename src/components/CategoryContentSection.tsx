import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Lightbulb, HelpCircle, ArrowRight } from 'lucide-react';
import { getCategoryContent } from '../lib/categoryContent';

interface Props {
  slug: string;
  isDarkMode: boolean;
  categoryLabel: string;
  categoryColor: string;
}

export function CategoryContentSection({ slug, isDarkMode, categoryLabel, categoryColor }: Props) {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [introExpanded, setIntroExpanded] = useState(false);

  const content = getCategoryContent(slug);
  if (!content) return null;

  const prose = isDarkMode ? 'text-white/70' : 'text-black/65';
  const cardBg = isDarkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-black/[0.01] border-black/[0.06]';

  const introParagraphs = content.intro.split('\n\n').filter(Boolean);
  const expectParagraphs = content.whatToExpect.split('\n\n').filter(Boolean);
  const whyParagraphs = content.whyPlayersLoveIt.split('\n\n').filter(Boolean);

  return (
    <section aria-label={`About ${categoryLabel} Games`} className="mt-20 space-y-12">
      <hr className={`border-t ${isDarkMode ? 'border-white/10' : 'border-black/10'}`} />

      {/* About the genre */}
      <div>
        <h2 className="text-2xl font-black tracking-tight mb-5">
          About{' '}
          <span style={{ color: categoryColor }}>{categoryLabel} Games</span>
        </h2>
        <div className={`space-y-4 ${prose}`}>
          {introParagraphs.slice(0, introExpanded ? undefined : 1).map((p, i) => (
            <p key={i} className="text-sm leading-relaxed">{p}</p>
          ))}
          {introParagraphs.length > 1 && !introExpanded && (
            <p className={`text-sm leading-relaxed line-clamp-3 ${prose}`}>{introParagraphs[1]}</p>
          )}
          {introExpanded && introParagraphs.slice(1).map((p, i) => (
            <p key={`exp-${i}`} className="text-sm leading-relaxed">{p}</p>
          ))}
        </div>
        {introParagraphs.length > 1 && (
          <button
            onClick={() => setIntroExpanded(v => !v)}
            className="mt-3 flex items-center gap-1.5 text-accent text-[11px] font-bold uppercase tracking-wide hover:underline"
          >
            {introExpanded ? <><ChevronUp className="w-3.5 h-3.5" />Read less</> : <><ChevronDown className="w-3.5 h-3.5" />Read more</>}
          </button>
        )}
      </div>

      {/* Two-column: What to Expect + Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What to expect */}
        <div className={`rounded-2xl border p-6 space-y-3 ${cardBg}`}>
          <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
            <span style={{ color: categoryColor }}>▶</span>
            What to Expect
          </h3>
          {expectParagraphs.map((p, i) => (
            <p key={i} className={`text-sm leading-relaxed ${prose}`}>{p}</p>
          ))}
        </div>

        {/* Tips */}
        <div className={`rounded-2xl border p-6 space-y-3 ${cardBg}`}>
          <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            Tips for New Players
          </h3>
          <ul className="space-y-2.5">
            {content.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className="shrink-0 mt-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                  style={{ background: `${categoryColor}20`, color: categoryColor }}
                >
                  {i + 1}
                </span>
                <span className={`text-sm leading-relaxed ${prose}`}>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Why players love it */}
      <div className={`rounded-2xl border p-6 space-y-3 ${cardBg}`} style={{ borderColor: `${categoryColor}20` }}>
        <h3 className="text-base font-bold tracking-tight" style={{ color: categoryColor }}>
          Why Players Love {categoryLabel} Games
        </h3>
        {whyParagraphs.map((p, i) => (
          <p key={i} className={`text-sm leading-relaxed ${prose}`}>{p}</p>
        ))}
      </div>

      {/* Related genres */}
      {content.relatedGenres.length > 0 && (
        <div>
          <h3 className="text-sm font-bold tracking-tight mb-4 opacity-70 uppercase text-[11px] tracking-widest">
            Related Genres
          </h3>
          <div className="flex flex-wrap gap-3">
            {content.relatedGenres.map(genre => (
              <Link
                key={genre.slug}
                to={`/category/${genre.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:scale-105"
                style={{
                  borderColor: `${categoryColor}35`,
                  color: categoryColor,
                  background: `${categoryColor}10`,
                }}
              >
                {genre.label}
                <ArrowRight className="w-3 h-3" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      {content.faq.length > 0 && (
        <div>
          <h2 className="text-xl font-black tracking-tight mb-5 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-accent" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {content.faq.map((item, i) => (
              <div
                key={i}
                className={`rounded-2xl border overflow-hidden transition-all ${cardBg}`}
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left gap-4"
                >
                  <span className="text-sm font-bold tracking-tight">{item.q}</span>
                  {faqOpen === i
                    ? <ChevronUp className="w-4 h-4 text-accent shrink-0" />
                    : <ChevronDown className={`w-4 h-4 shrink-0 ${isDarkMode ? 'text-white/40' : 'text-black/40'}`} />
                  }
                </button>
                {faqOpen === i && (
                  <div className={`px-5 pb-5 text-sm leading-relaxed ${prose}`}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blog CTA */}
      <div className={`rounded-2xl border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isDarkMode ? 'bg-white/[0.02] border-white/10' : 'bg-black/[0.01] border-black/10'}`}>
        <div>
          <p className="text-sm font-bold tracking-tight mb-1">
            Want to get better at {categoryLabel} games?
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
            Read our expert guides and tips on the GameDravo blog.
          </p>
        </div>
        <Link
          to="/blog"
          className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border transition-all hover:scale-105"
          style={{ borderColor: `${categoryColor}40`, color: categoryColor, background: `${categoryColor}12` }}
        >
          Read Gaming Guides <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}

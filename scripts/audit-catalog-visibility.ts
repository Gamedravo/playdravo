/**
 * Catalog visibility audit:
 * - totals in the static catalog
 * - disabled games (unsafe embeds)
 * - reachability checks (category route + direct game route)
 *
 * Run:
 *   npx tsx scripts/audit-catalog-visibility.ts
 *
 * Output:
 *   docs/catalog-visibility-audit.json
 *   docs/catalog-visibility-audit.md
 */
import fs from 'node:fs';
import path from 'node:path';
import { GAMES } from '../src/games';
import { withSafetyMetadata } from '../src/lib/adsInjection';
import { getCategoryPath } from '../src/utils/categoryRoutes';

function run() {
  const catalog = GAMES.map((g) => withSafetyMetadata(g));

  const invalid = catalog.filter((g) => !g.id || !g.title || !g.url || !g.category);
  const disabled = catalog.filter((g) => g.adsInjected || g.popupRisk || g.redirectRisk);

  const byCategory = catalog.reduce<Record<string, number>>((acc, g) => {
    acc[g.category] = (acc[g.category] ?? 0) + 1;
    return acc;
  }, {});

  const unreachableByCategory = catalog.filter((g) => {
    const p = getCategoryPath(g.category);
    return typeof p !== 'string' || !p.startsWith('/');
  });

  const outJson = path.join(process.cwd(), 'docs', 'catalog-visibility-audit.json');
  const outMd = path.join(process.cwd(), 'docs', 'catalog-visibility-audit.md');

  fs.mkdirSync(path.dirname(outJson), { recursive: true });
  fs.writeFileSync(
    outJson,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totals: {
          catalog: catalog.length,
          visible: catalog.length, // discoverable lists include all catalog games
          disabled: disabled.length,
          invalid: invalid.length,
        },
        categories: Object.entries(byCategory)
          .sort((a, b) => b[1] - a[1])
          .map(([category, count]) => ({
            category,
            count,
            categoryPath: getCategoryPath(category),
          })),
        disabledGames: disabled.map((g) => ({
          id: g.id,
          title: g.title,
          category: g.category,
          url: g.url,
          adsInjected: !!g.adsInjected,
          popupRisk: !!g.popupRisk,
          redirectRisk: !!g.redirectRisk,
        })),
        invalidGames: invalid.map((g) => ({ id: g.id, title: g.title, category: g.category, url: g.url })),
        notes: {
          unreachableByCategory: unreachableByCategory.length,
        },
      },
      null,
      2
    ),
    'utf8'
  );

  const md =
    `# Catalog Visibility Audit\n\n` +
    `Generated: ${new Date().toISOString()}\n\n` +
    `## Totals\n\n` +
    `- Total games in catalog: **${catalog.length}**\n` +
    `- Total visible/listed games: **${catalog.length}**\n` +
    `- Disabled (unsafe embed): **${disabled.length}**\n` +
    `- Invalid records: **${invalid.length}**\n\n` +
    `## Categories\n\n` +
    `| Category | Count | Route |\n|---|---:|---|\n` +
    Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, count]) => `| ${cat} | ${count} | ${getCategoryPath(cat)} |`)
      .join('\n') +
    `\n\n` +
    `## Disabled games (unsafe embed)\n\n` +
    (disabled.length
      ? `| Game | Flags | URL |\n|---|---|---|\n` +
        disabled
          .map((g) => {
            const flags = [
              g.adsInjected ? 'adsInjected' : null,
              g.popupRisk ? 'popupRisk' : null,
              g.redirectRisk ? 'redirectRisk' : null,
            ]
              .filter(Boolean)
              .join(', ');
            return `| ${g.title} (\`${g.id}\`) | ${flags} | ${g.url} |`;
          })
          .join('\n') +
        `\n`
      : `No games are disabled.\n`);

  fs.writeFileSync(outMd, md, 'utf8');

  console.log(`Wrote: ${outJson}`);
  console.log(`Wrote: ${outMd}`);
  console.log(`Catalog: ${catalog.length}, Disabled: ${disabled.length}, Invalid: ${invalid.length}`);
}

run();

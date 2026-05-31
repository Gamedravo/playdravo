# External Games Import Report

**Date:** 2026-05-31  
**Pipeline:** `scripts/import-external-games.ts`  
**Catalog:** `src/games.ts` (+279 games total after import)

## Summary

| Metric | Count |
|--------|------:|
| Candidates validated | 11 |
| **Imported** | **9** |
| Rejected | 2 |
| Duplicates | 0 |
| Mobile issues (blocked import) | 0 |

---

## Imported Games (9)

All entries passed: embed HTTP 200, iframe embeddability (no blocking X-Frame-Options/CSP), verified thumbnail, mobile-friendly signals, and duplicate check against OnlineGames.io catalog.

| # | Title | Slug | Embed | Thumbnail source |
|---|-------|------|-------|------------------|
| 1 | Slope | `slope` | [y8.com/embed/slope](https://y8.com/embed/slope) | Y8 official artwork |
| 2 | Wordle | `wordle` | [cdn.bubbleshooter.net/games/wordle/](https://cdn.bubbleshooter.net/games/wordle/) | Bubble Shooter official |
| 3 | Tetris Cube | `tetris-cube` | [cdn.bubbleshooter.net/games/tetris-cube/](https://cdn.bubbleshooter.net/games/tetris-cube/) | Bubble Shooter official |
| 4 | Flappy Bird | `flappy-bird` | [funhtml5games.com?embed=flappy](https://funhtml5games.com?embed=flappy) | Wikipedia official app icon |
| 5 | Clicker Heroes | `clicker-heroes` | [cdn.clickerheroes.com/gamebuild/index.php](https://cdn.clickerheroes.com/gamebuild/index.php) | Playsaurus/Grindcraft CDN |
| 6 | Mr.Mine | `mr-mine` | [mrmine.com/game/](https://mrmine.com/game/) | Mr.Mine official square art |
| 7 | Poker Quest | `poker-quest` | [playsaurus.com/kongPokerQuest63/](https://playsaurus.com/kongPokerQuest63/) | Playsaurus official |
| 8 | Grindcraft | `grindcraft` | [grindcraft.com/game.php](https://grindcraft.com/game.php) | Grindcraft official logo |
| 9 | Fray Fight | `fray-fight` | [frayfight.com/game/](https://frayfight.com/game/) | Fray Fight og:image |

### New tags added to `TAGS_LIST`

`Block`, `Clicker`, `Crafting`, `Endless Runner`, `Fighting`, `Mining`, `Roguelike`, `Tetris`, `Tycoon`, `Word`

### Homepage integration

- Search: automatic via `GAMES` catalog (title, category, tags, description)
- Shelves: automatic via `buildHomepageShelves`, `buildCuratedHomepageBlocks`, `buildTagShelves`
- Browse by Genre: new **Word** chip; **Racing** chip now matches Endless Runner
- Thumbnail overrides: added to `src/lib/embedThumbnailSources.ts`

---

## Rejected Games (2)

| Title | Reason |
|-------|--------|
| **Fireboy and Watergirl** | No self-hosted wrapper at `public/games/fireboy-and-watergirl/`. User noted Ruffle Flash implementation but no assets were present in the repo. |
| **Hole.io** | No self-hosted wrapper at `public/games/hole-io/`. User noted Unity WebGL implementation but no build files were present. External marketing pages (`hole-io.com/play`) are YouTube trailers, not playable embeds. |

**To import these:** Add playable wrapper HTML under `public/games/<slug>/index.html` and re-run `npm run import:external:apply`.

---

## Duplicate Games (0)

No title or embed URL collisions with existing OnlineGames.io catalog.  
Note: `fire-and-water` exists as a separate inspired title — not the official Fireboy and Watergirl.

---

## Mobile Issues (0 blocked)

All 9 imported games reported mobile-friendly (touch tags, viewport meta, or explicit `touch-friendly` optimization).

---

## Fullscreen Issues (7 noted, not blocking)

These games embed successfully but did not expose fullscreen API signals in embed HTML. They still play in iframe; native fullscreen may be limited by the host:

- Slope
- Wordle
- Flappy Bird
- Mr.Mine
- Poker Quest
- Grindcraft
- Fray Fight

**Fullscreen confirmed in embed HTML:** Tetris Cube, Clicker Heroes

---

## Thumbnail Issues (2 rejected only)

| Title | Issue |
|-------|-------|
| Fireboy and Watergirl | No wrapper — thumbnail not resolved |
| Hole.io | No wrapper — thumbnail not resolved |

Flappy Bird initially failed (404 on wrong Wikimedia URL); resolved using verified official icon at `upload.wikimedia.org/wikipedia/en/0/0a/Flappy_Bird_icon.png`.

---

## Validation methodology

For each candidate the pipeline:

1. Fetches embed URL (HTTP status, content)
2. Checks `X-Frame-Options` / CSP `frame-ancestors` for iframe compatibility
3. Resolves thumbnail via manual verified URLs → canonical og:image → page meta (rejects favicons/weak assets)
4. Detects mobile viewport / touch signals
5. Detects fullscreen API usage in embed HTML
6. Compares slug, title, and URL against existing `GAMES` array

---

## Re-run commands

```bash
# Validate only (writes docs/external-games-import-report.json)
npm run import:external

# Validate and append to catalog
npm run import:external:apply
```

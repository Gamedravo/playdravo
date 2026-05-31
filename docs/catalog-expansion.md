# Catalog expansion status

## Primary source

**URL:** `https://www.onlinegames.io/media/plugins/genGames/embed.json`

| Metric | Value |
|--------|-------|
| Total entries in source | **259** |
| Valid after embed + thumbnail HTTP check | **259** (as of last import) |
| PlayDravo catalog | **259** |

The public OnlineGames.io embed feed currently exposes **259 games**. PlayDravo already imports every entry that passes validation. A target of **300–500** games is **not achievable from this feed alone** without additional licensed sources.

## Quality bar (unchanged)

Each imported game must:

- Return HTTP OK for embed URL
- Return HTTP OK for thumbnail URL
- Have title, embed, and image fields
- Deduplicate by embed URL and slug

## Thumbnails

Import and runtime resolution upgrade `-xs` responsive assets to `-md` for sharper cards.

## Future expansion options

1. Partner / license a second embed provider (Poki-style syndication)
2. Negotiate extended feed from OnlineGames.io if a larger JSON exists off-catalog
3. Curated manual additions with verified embeds (small batches only)

Re-run import: `npm run import:catalog`

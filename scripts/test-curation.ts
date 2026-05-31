import { GAMES } from '../src/games';
import { buildHomepageShelves } from '../src/utils/recommendations';
import { buildTagShelves } from '../src/lib/tagShelves';
import { buildCuratedHomepageBlocks, densifyShelf } from '../src/lib/homepageCuration';

const shelves = buildHomepageShelves(GAMES);
console.log('categoryShelves keys:', Object.keys(shelves.categoryShelves));

for (const key of ['Action', 'Puzzle', 'Racing', 'Simulator'] as const) {
  const shelf = shelves.categoryShelves[key];
  console.log(key, Array.isArray(shelf) ? shelf.length : shelf);
}

try {
  const blocks = buildCuratedHomepageBlocks(shelves, buildTagShelves(GAMES), GAMES, 4);
  console.log('curated blocks:', blocks.length);
  for (const block of blocks) {
    if (!Array.isArray(block.games)) throw new Error(`block ${block.id} games not array`);
    for (const g of block.games) {
      if (!g?.id) throw new Error(`block ${block.id} has invalid game`);
    }
  }
  console.log('all blocks valid');
} catch (e) {
  console.error('buildCuratedHomepageBlocks failed:', e);
  process.exit(1);
}

const empty = densifyShelf(undefined, GAMES);
console.log('densifyShelf(undefined) returns safe array, length:', empty.length);

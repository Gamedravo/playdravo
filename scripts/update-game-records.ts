import fs from 'fs';
import path from 'path';

const gamesFilePath = path.resolve(process.cwd(), 'src', 'games.ts');

if (!fs.existsSync(gamesFilePath)) {
  console.error("Could not find src/games.ts");
  process.exit(1);
}

let code = fs.readFileSync(gamesFilePath, 'utf8');

// We can parse the block containing GAMES list and replace the hotlinked thumbnail values.
// Each game is block-shaped with "id": "something" and "thumbnail": "url".
// Let's parse game objects more safely with a cleaner regex, or split by ids.
// Alternatively, since GAMES array is written inline, we can parse it and replace "thumbnail": "..." with "thumbnail": "/images/games/<id>.svg" where <id> matches the game's actual ID.

const gameBlockRegex = /\{\r?\n\s+"id":\s+"([^"]+)",[\s\S]*?\}/g;

let matchesCount = 0;
const updatedCode = code.replace(gameBlockRegex, (gameBlock, id) => {
  // Find the thumbnail line inside this exact block
  const thumbnailRegex = /("thumbnail":\s+")[^"]+(")/;
  if (thumbnailRegex.test(gameBlock)) {
    matchesCount++;
    return gameBlock.replace(thumbnailRegex, `$1/images/games/${id}.svg$2`);
  }
  return gameBlock;
});

if (matchesCount > 0) {
  fs.writeFileSync(gamesFilePath, updatedCode, 'utf8');
  console.log(`Successfully updated ${matchesCount} game thumbnail records inside src/games.ts!`);
} else {
  console.log("No matching game blocks found for update.");
}

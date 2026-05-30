const fs = require('fs');

let content = fs.readFileSync('src/lib/translations.ts', 'utf8');

// A simple approach: we'll match block by block
// e.g. en: { ... }, pt: { ... }
const langs = ['en:', 'pt:', 'es:', 'fr:', 'de:', 'it:'];

let newContent = content;

langs.forEach(lang => {
  const match = new RegExp(`(${lang}\\s*\\{[\\s\\S]*?)(\\n\\s*\\})`, 'g');
  newContent = newContent.replace(match, (m, p1, p2) => {
    // Collect all lines, find keys, keep first occurrence only
    const lines = p1.split('\\n');
    const seen = new Set();
    const newLines = [];
    
    // We only want to deduplicate property definitions like `    key: "value",`
    for (const line of lines) {
      // Find potential keys in this line (could be multiple if they share a line)
      const keyMatches = line.matchAll(/([a-zA-Z0-9_]+)\\s*:/g);
      
      let isDuplicate = false;
      let firstKey = null;
      for (const km of keyMatches) {
        firstKey = km[1];
        if (seen.has(km[1])) {
          isDuplicate = true;
          break;
        }
        seen.add(km[1]);
      }
      
      if (!isDuplicate) {
         newLines.push(line);
      }
    }
    
    return newLines.join('\\n') + p2;
  });
});

fs.writeFileSync('src/lib/translations.ts', newContent);

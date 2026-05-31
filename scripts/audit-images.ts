import { GAMES } from '../src/games.js';

interface AuditResult {
  total: number;
  working: number;
  broken: number;
  missing: number;
  status403: number;
  status404: number;
  duplicates: number;
  external: number;
  details: Array<{
    id: string;
    title: string;
    category: string;
    url: string;
    status: string;
    error?: string;
  }>;
}

async function runAudit() {
  console.log("Starting full thumbnail audit of all " + GAMES.length + " games...");
  
  const results: AuditResult = {
    total: GAMES.length,
    working: 0,
    broken: 0,
    missing: 0,
    status403: 0,
    status404: 0,
    duplicates: 0,
    external: 0,
    details: []
  };

  const seenUrls = new Set<string>();

  // Process thumbnails sequentially or with reasonable concurrency to avoid rate-limiting
  const concurrency = 5;
  for (let i = 0; i < GAMES.length; i += concurrency) {
    const chunk = GAMES.slice(i, i + concurrency);
    const promises = chunk.map(async (game) => {
      const url = game.thumbnail;
      const gameRef = { id: game.id, title: game.title, category: game.category, url: url };

      if (!url) {
        results.missing++;
        results.details.push({ ...gameRef, status: "Missing URL/Asset" });
        return;
      }

      // Check for duplicates
      if (seenUrls.has(url)) {
        results.duplicates++;
      } else {
        seenUrls.add(url);
      }

      // Check external vs internal
      const isExternal = url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//");
      if (isExternal) {
        results.external++;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'Referer': 'https://google.com'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (response.status === 200) {
          results.working++;
        } else if (response.status === 403) {
          results.status403++;
          results.details.push({ ...gameRef, status: "403 Forbidden" });
        } else if (response.status === 404) {
          results.status404++;
          results.details.push({ ...gameRef, status: "404 Not Found" });
        } else {
          results.broken++;
          results.details.push({ ...gameRef, status: "Status Code " + response.status });
        }
      } catch (err: any) {
        results.broken++;
        results.details.push({ ...gameRef, status: "Network Failed/Timeout", error: err.message || String(err) });
      }
    });

    await Promise.all(promises);
  }

  // Print summary report
  console.log("\n=== GAME THUMBNAIL AUDIT REPORT ===");
  console.log("Total Games: " + results.total);
  console.log("Working: " + results.working);
  console.log("Broken Other: " + results.broken);
  console.log("Missing: " + results.missing);
  console.log("403 Forbidden: " + results.status403);
  console.log("404 Not Found: " + results.status404);
  console.log("Duplicate URLs: " + results.duplicates);
  console.log("Games with External URLs: " + results.external);
  console.log("===================================\n");

  console.log("FAILED THUMBNAIL DETAIL LIST:");
  results.details.forEach((det) => {
    console.log(`- [${det.category}] ${det.title} (${det.id}): status=${det.status}, url="${det.url}" ${det.error ? `(error: ${det.error})` : ''}`);
  });
}

runAudit().catch(err => {
  console.error("Audit failed to run:", err);
});

const games = [
  { title: 'Basketball io', postId: '302', slug: 'basketball-io' },
  { title: 'Snake Wars', postId: '638', slug: 'snake-wars' },
  { title: '8 Ball Pool', postId: '442', slug: '8-ball-pool-billiard' },
];

const patterns = (postId, slug, base) => [
  `${base}/preview.mp4`,
  `${base}/gameplay.mp4`,
  `${base}/video.mp4`,
  `https://www.onlinegames.io/media/posts/${postId}/preview.mp4`,
  `https://www.onlinegames.io/media/posts/${postId}/${slug}-preview.mp4`,
  `https://www.onlinegames.io/media/posts/${postId}/responsive/${slug}-preview.mp4`,
  `https://www.onlinegames.io/media/cache/preview/${slug}.mp4`,
  `https://www.onlinegames.io/media/cache/preview/${slug}.gif`,
  `https://cdn.onlinegames.io/preview/${slug}.mp4`,
];

async function head(url) {
  try {
    const r = await fetch(url, {
      method: 'HEAD',
      headers: { Referer: 'https://www.onlinegames.io/', 'User-Agent': 'Mozilla/5.0' },
    });
    return r.status;
  } catch (e) {
    return `err:${e.message}`;
  }
}

for (const g of games) {
  const base = `https://www.onlinegames.io/games/2022/unity3/${g.slug}`.replace(
    /unity3\/snake-wars/,
    'unity/snake-wars',
  );
  const actualBase =
    g.slug === 'snake-wars'
      ? 'https://www.onlinegames.io/games/2024/unity/snake-wars'
      : `https://www.onlinegames.io/games/2022/unity3/${g.slug}`;

  console.log(`\n=== ${g.title} ===`);
  for (const url of patterns(g.postId, g.slug, actualBase)) {
    const status = await head(url);
    if (status === 200) console.log('OK', status, url);
    else if (status !== 403 && status !== 404) console.log('??', status, url);
  }
}

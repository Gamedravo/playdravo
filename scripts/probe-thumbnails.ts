const UA = 'Mozilla/5.0 PlayDravo/1.0';

const urls = [
  'https://funhtml5games.com/',
  'https://funhtml5games.com/games/flappy',
  'https://funhtml5games.com/games/flappybird',
  'https://game.hole-io.com/',
  'https://hole-io.io/',
  'https://hole-io.io/play',
  'https://www.crazygames.com/game/hole-io',
  'https://poki.com/en/g/hole-io',
];

for (const url of urls) {
  try {
    const r = await fetch(url, { method: 'GET', headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(12000) });
    const xfo = r.headers.get('x-frame-options');
    const html = (await r.text()).slice(0, 5000);
    const embeddable = !(xfo?.toLowerCase() === 'deny' || xfo?.toLowerCase() === 'sameorigin');
    const unity = /createUnityInstance|UnityLoader|\.wasm/.test(html);
    const imgs = [...html.matchAll(/https?:[^\"'\s>]+\.(png|jpg|webp)/gi)].slice(0, 5).map((m) => m[0]);
    console.log('\n', url, r.status, 'embed', embeddable, 'unity', unity);
    imgs.forEach((i) => console.log(' ', i));
  } catch (e) {
    console.log('\n', url, 'ERR');
  }
}

// Fireboy ruffle search - check if any public SWF embed exists
const fbUrls = [
  'https://www.miniplay.com/embed/fireboy-and-watergirl-1-forest-temple',
  'https://www.addictinggames.com/game/fireboy-and-watergirl-in-the-forest-temple',
];
for (const url of fbUrls) {
  try {
    const r = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': UA }, redirect: 'follow' });
    console.log('\nfireboy', url, r.status, r.headers.get('x-frame-options'));
  } catch {
    console.log('\nfireboy ERR', url);
  }
}

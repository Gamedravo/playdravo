import { Game } from '../types';

const CATEGORY_VERBS: Record<string, [string, string]> = {
  Action:     ['battle',   'survive'],
  Adventure:  ['explore',  'discover'],
  Arcade:     ['score',    'chain combos'],
  Puzzle:     ['solve',    'figure out'],
  Racing:     ['race',     'drift'],
  Sports:     ['compete',  'master'],
  Strategy:   ['plan',     'conquer'],
  Shooter:    ['aim',      'eliminate'],
  Casual:     ['relax',    'enjoy'],
  Multiplayer:['team up',  'challenge friends'],
  Fighting:   ['fight',    'dominate'],
  Horror:     ['survive',  'escape'],
  Idle:       ['build',    'upgrade'],
  Simulator:  ['simulate', 'manage'],
};

const MOBILE_COPY: Record<string, string> = {
  'touch-friendly': 'fully optimized for mobile and touch screens',
  'responsive':     'playable on both mobile and desktop',
  'desktop-only':   'best experienced on a desktop or laptop',
};

export function generateGameOverview(game: Game): string {
  const parts: string[] = [];

  if (game.description && game.description.trim().length > 40) {
    parts.push(game.description.trim());
  } else {
    const cat = game.category.toLowerCase();
    const [v1, v2] = CATEGORY_VERBS[game.category] ?? ['play', 'enjoy'];
    parts.push(
      `${game.title} is a free ${cat} game you can play instantly on GameDravo — no download or sign-up needed.`,
      `${v1.charAt(0).toUpperCase() + v1.slice(1)} your way through exciting levels and ${v2} your skills to top the charts.`
    );
  }

  if (game.tags && game.tags.length > 0) {
    const tagSample = game.tags.slice(0, 4).join(', ');
    parts.push(`Fans of ${tagSample} will feel right at home.`);
  }

  if (game.mobileOptimization) {
    const copy = MOBILE_COPY[game.mobileOptimization];
    if (copy) parts.push(`${game.title} is ${copy}.`);
  }

  if (game.developer && game.developer !== 'GameDravo') {
    parts.push(`Developed by ${game.developer}, this game brings polished ${game.category.toLowerCase()} gameplay straight to your browser.`);
  }

  if (game.plays > 1000) {
    parts.push(`With over ${Number(game.plays).toLocaleString()} plays, it's one of the most popular ${game.category.toLowerCase()} games on GameDravo.`);
  }

  return parts.join(' ');
}

const DEFAULT_STEPS: Record<string, string[]> = {
  action:     ['Click Play to launch', 'Move with arrow keys or WASD', 'Press Space or click to attack/jump', 'Collect power-ups and avoid hazards', 'Beat your high score each round'],
  adventure:  ['Click Play to start your adventure', 'Move and explore with arrow keys or click', 'Interact with objects using Enter or Click', 'Complete quests and collect items', 'Reach checkpoints to save progress'],
  puzzle:     ['Click Play to begin', 'Read the level goal at the top', 'Click or drag pieces to solve', 'Use hints if stuck (limited)', 'Clear each puzzle to unlock the next'],
  racing:     ['Click Play to enter the race', 'Steer with arrow keys or WASD', 'Hold Up/W to accelerate, Down/S to brake', 'Dodge obstacles and opponents', 'Finish first to unlock new tracks'],
  sports:     ['Click Play to start the match', 'Control your player with arrow keys or WASD', 'Press Space or click to perform actions', 'Score more than your opponent to win', 'Improve your skills to unlock tournaments'],
  arcade:     ['Click Play to launch', 'Control your character with arrow keys or WASD', 'Collect items and dodge obstacles', 'Chain combos for higher scores', 'Beat your best score to climb the leaderboard'],
  shooter:    ['Click Play to begin', 'Move with WASD or arrow keys', 'Aim with the mouse and click to shoot', 'Take cover to avoid enemy fire', 'Complete objectives to progress'],
  strategy:   ['Click Play to start', 'Survey your resources and map', 'Build structures and train units', 'Expand territory carefully', 'Defeat opponents to win the campaign'],
  casual:     ['Click Play to start', 'Follow the on-screen instructions', 'Click or tap to interact', 'Complete goals to earn rewards', 'Relax and enjoy at your own pace'],
};

export function generateHowToPlay(game: Game): { steps: string[]; note?: string } {
  const raw = (game.howToPlay || game.instructions || game.controls || '').trim();
  if (raw.length > 10) {
    const steps = raw
      .split(/\n+/)
      .map(s => s.replace(/^[-•*\d.]+\s*/, '').trim())
      .filter(s => s.length > 5)
      .slice(0, 6);
    if (steps.length >= 2) return { steps };
  }

  const key = game.category.toLowerCase().replace(/\s+/g, '');
  const steps =
    DEFAULT_STEPS[key] ??
    DEFAULT_STEPS['action'];

  return { steps, note: 'No download or installation needed — starts instantly in your browser.' };
}

export function generateFeatures(game: Game): string[] {
  const features: string[] = ['Free to play — no download required', 'Runs in all modern browsers'];

  if (game.mobileOptimization === 'touch-friendly') {
    features.push('Mobile and touch screen optimized');
  } else if (game.mobileOptimization === 'responsive') {
    features.push('Responsive layout for desktop and mobile');
  }

  if (game.fullscreenSupport) features.push('Full-screen mode supported');

  const meaningfulTags = (game.tags ?? [])
    .filter(t => t.length > 3 && !t.toLowerCase().includes(game.category.toLowerCase()))
    .slice(0, 3);
  meaningfulTags.forEach(tag => features.push(`${tag.charAt(0).toUpperCase() + tag.slice(1)} gameplay`));

  if (game.plays > 5000) features.push(`${Number(game.plays).toLocaleString()}+ total plays`);
  if (game.rating >= 4.0 && (game.ratingCount ?? 0) >= 5) features.push(`${game.rating.toFixed(1)}/5 star rating`);
  if (game.developer && game.developer !== 'GameDravo') features.push(`Developed by ${game.developer}`);

  return features.slice(0, 6);
}

export function generateFAQSchema(game: Game): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Is ${game.title} free to play?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes, ${game.title} is completely free on GameDravo. No payment, account, or subscription required.`,
        },
      },
      {
        '@type': 'Question',
        name: `Do I need to download ${game.title}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `No download needed. ${game.title} runs directly in your web browser — click Play and it starts immediately.`,
        },
      },
      {
        '@type': 'Question',
        name: `Can I play ${game.title} on my phone?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            game.mobileOptimization === 'touch-friendly'
              ? `Yes! ${game.title} is fully optimized for mobile and touch screens.`
              : game.mobileOptimization === 'desktop-only'
              ? `${game.title} is designed for desktop and works best with a keyboard and mouse.`
              : `${game.title} is playable on both desktop and mobile browsers.`,
        },
      },
      {
        '@type': 'Question',
        name: `What kind of game is ${game.title}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${game.title} is a ${game.category} game. ${
            game.description
              ? game.description.split('.')[0] + '.'
              : `It's a free instant-play browser game available on GameDravo.`
          }`,
        },
      },
    ],
  };
}

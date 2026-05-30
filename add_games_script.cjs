const fs = require('fs');

const extraUrls = [
  'https://gabrielecirulli.github.io/2048/',
  'https://hextris.io/',
  'https://duckhunt.js.org/',
  'https://nebezb.com/floppybird/',
  'https://raw.githack.com/jakesgordon/javascript-racer/master/v4.final.html',
  'https://raw.githack.com/jakesgordon/javascript-tiny-platformer/master/index.html',
  'https://pacman.platzh1rsch.ch/',
  'https://playcanv.as/p/2OlkUaxF/'
];

// Let's create an array of rich game templates!
const bases = [
  { c: 'Puzzle', t: ['Sudoku Classic', 'Block Puzzle', 'Jewel Magic', 'Merge 10', 'Word Search', 'Minesweeper Pro', 'Tic Tac Toe', 'Brain Trainer', 'Memory Match', 'Tile Master'], tags: ['Logic', 'Brain Training', 'Singleplayer', 'Casual'] },
  { c: 'Arcade', t: ['Fruit Smasher', 'Bubble Shooter', 'Neon Blaster', 'Geometry Rush', 'Space Invaders', 'Tap Tap Dash', 'Pinball FX', 'Snake Xenzia', 'Pong 3D', 'Brick Breaker'], tags: ['Fast-Paced', 'Reflex', 'Retro', 'Highscore'] },
  { c: 'Racing', t: ['Nitro Drift', 'Highway Rider', 'Moto X3M', 'Hill Climb', 'Kart Racing', 'Rally Fury', 'Traffic Racer', 'Drag Racing', 'BMX Stunts', 'Hovercraft Racing'], tags: ['Vehicles', 'Driving', 'Competitive', '3D'] },
  { c: 'Sports', t: ['Basketball Stars', 'Soccer Hero', 'Tennis Clash', 'Golf Battles', 'Pool Billiards', 'Bowling King', 'Archery Master', 'Table Tennis', 'Volleyball', 'Darts Pro'], tags: ['Competitive', 'Simulation', 'Ball Game', 'Multiplayer'] },
  { c: 'Action', t: ['Gunblood', 'Stickman Fighter', 'Zombie Sniper', 'Tank Wars', 'Ninja Slash', 'Mech Battles', 'Alien Shooter', 'Mafia City', 'Boss Fight', 'Rogue Knight'], tags: ['Combat', 'Shooter', 'Intense', 'Survival'] },
  { c: 'Strategy', t: ['Tower Defense', 'Chess Grandmaster', 'Clash of Orcs', 'Empire Builder', 'Ant Colony', 'Space Command', 'Civilization Mini', 'Card Battles', 'Auto Chess', 'Defend The Castle'], tags: ['Tactical', 'Thinking', 'Management', 'Multiplayer'] },
  { c: 'Multiplayer', t: ['Snake.io', 'Agar.io Clone', 'Krunker Lite', 'Shell Shockers', 'Smash Karts', 'Hole.io', 'Diep.io Classic', 'Paper.io', 'Surviv.io Battle', 'Wings.io'], tags: ['IO Game', 'Online', 'Competitive', 'Action'] },
  { c: 'Adventure', t: ['Pixel Quest', 'Dungeon Crawler', 'Lost Temple', 'Island Survival', 'Galaxy Explorer', 'Magic Forest', 'Treasure Hunter', 'Hero Journey', 'Dark Caves', 'Sky Kingdom'], tags: ['Exploration', 'RPG', 'Story', 'Fantasy'] }
];

const thumbs = [
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1528652395648-5c4d0ec5bb7b?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1588636734063-e5b15276bd8e?w=400&h=400&fit=crop'
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const allGames = [];
let idCounter = 1;

for (const base of bases) {
  for (let i = 0; i < base.t.length; i++) {
    const title = base.t[i];
    
    allGames.push({
      id: "game-" + idCounter++,
      title: title,
      category: base.c,
      url: getRandom(extraUrls),
      thumbnail: getRandom(thumbs),
      description: "Immerse yourself in " + title + ", one of the best " + base.c + " games available! Whether you're looking for a quick break or a deep session, this game offers endless entertainment. With stunning graphics and smooth gameplay, " + title + " is designed to keep you engaged for hours. Overcome challenges, beat high scores, and discover new strategies as you master this incredible " + base.c + " experience.",
      instructions: "The objective of " + title + " is straightforward: master the environment and outplay your competition. Depending on the mode, you'll need to utilize sharp reflexes and strategic thinking. Progress through increasingly difficult levels as you hone your skills.",
      howToPlay: "Start the game and choose your initial difficulty. The first few levels act as a tutorial to ease you into the mechanics. Focus on timing and resource management to survive the later stages.",
      controls: "Desktop: Use W, A, S, D or Arrow Keys for movement. Spacebar to jump or perform primary action. Mouse to aim and left-click to interact.\\nMobile: Use the on-screen virtual joystick and action buttons on the right.",
      tipsAndTricks: "1. Don't rush; timing is more important than speed.\\n2. Collect power-ups located at the corners of the map.\\n3. Keep an eye on your stamina bar before making big moves.\\n4. Practice in the tutorial mode to refine your strategies.",
      whyYoullLikeIt: "If you enjoy challenging yourself and love polished aesthetics, " + title + " is going to be your next obsession. The rewarding progression system and smooth learning curve make it highly addictive!",
      tags: [...base.tags, base.c, 'Addictive', 'Hot'],
      developer: 'Vanguard Studios',
      publisher: 'Nexus Games',
      mobileOptimization: getRandom(['touch-friendly', 'responsive']),
      fullscreenSupport: true,
      orientation: getRandom(['landscape', 'portrait', 'any']),
      rating: +(3.5 + Math.random() * 1.5).toFixed(1),
      ratingCount: Math.floor(Math.random() * 10000) + 100,
      totalRating: 5,
      plays: Math.floor(Math.random() * 500000) + 5000,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      isHot: Math.random() > 0.8,
      isTop: Math.random() > 0.8
    });
  }
}

// Add the real ones on top to make sure they're solid
const specificGames = [
    { 
      id: '2048', 
      title: '2048', 
      category: 'Puzzle', 
      url: 'https://gabrielecirulli.github.io/2048/', 
      thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/2048_logo.svg/512px-2048_logo.svg.png',
      description: "Join identical numbers to merge them and reach the legendary 2048 tile. A simple yet incredibly logical puzzle game that challenges your spatial reasoning.",
      instructions: "Use your keyboard Arrow Keys or swipe on touch displays to move all tiles in that direction. When two tiles with the same value touch, they merge into a single tile with double the value! Plan ahead to keep your grid organized.",
      howToPlay: "The game starts with two tiles on a 4x4 grid. Swipe in any direction to move all tiles. When two tiles of the same number collide, they merge into one tile with double the value (e.g., two 2s become a 4). Reach the 2048 tile to win, but you can keep playing for a higher score!",
      controls: "Desktop: Arrow keys (Up, Down, Left, Right). Mobile: Swipe in the direction you want to move.",
      tipsAndTricks: "1. Keep your highest tile in a corner.\\n2. Keep your tiles organized by size.\\n3. Think a few steps ahead.\\n4. Never move your tiles in a direction that pulls your highest tile out of its corner.",
      whyYoullLikeIt: "It's elegantly simple to learn but incredibly hard to master. The satisfaction of combining blocks to reach higher numbers is unparalleled and creates that 'just one more game' feeling.",
      tags: ['Puzzle', 'Brain Training', 'Math', 'Singleplayer', 'Retro'],
      developer: 'Gabriele Cirulli',
      publisher: 'Play2048',
      mobileOptimization: 'touch-friendly',
      fullscreenSupport: true,
      orientation: 'portrait',
      rating: 4.8,
      ratingCount: 52140,
      plays: 1540000,
      createdAt: new Date().toISOString(),
      isHot: true,
      isTop: true
    },
    { 
      id: 'hextris', 
      title: 'Hextris', 
      category: 'Puzzle', 
      url: 'https://hextris.io/', 
      thumbnail: 'https://hextris.io/images/og_image.png',
      description: "An upbeat, fast-paced puzzle game inspired by Tetris. Rotate the central hexagon to catch falling colored bars and stack them dynamically before your stacks extend past the gray boundary limit.",
      instructions: "Use Left and Right Arrow keys or tap the left/right side of your screen to rotate the hexagon. Stack 3 or more blocks of the same color adjacently to clear them and maintain combo streaks.",
      howToPlay: "Blocks of various colors fall towards the center hexagon from all edges of the screen. Rotate the hexagon to catch these blocks. If three or more blocks of the same color connect, they disappear, earning you points and clearing space.",
      controls: "Desktop: Left/Right Arrow keys or A/D keys. Mobile: Tap the left or right side of the screen.",
      tipsAndTricks: "1. Prioritize clearing the highest stacks first.\\n2. Keep an eye on incoming colors to plan your rotations.\\n3. Maintain combos by making rapid clears to multiply your score.",
      whyYoullLikeIt: "The pulsating music and vibrant colors combine with fast-paced reflex-puzzle gameplay to create a truly hypnotic and addictive experience.",
      tags: ['Puzzle', 'Arcade', 'Fast-Paced', 'Singleplayer', 'Reflex'],
      developer: 'Logan Gabriel',
      publisher: 'Hextris',
      mobileOptimization: 'touch-friendly',
      fullscreenSupport: true,
      orientation: 'any',
      rating: 4.6,
      ratingCount: 18200,
      plays: 890000,
      createdAt: new Date().toISOString(),
      isHot: true,
      isTop: false
    },
    { 
      id: 'duckhunt', 
      title: 'Browser Duck Hunt', 
      category: 'Arcade', 
      url: 'https://duckhunt.js.org/', 
      thumbnail: 'https://duckhunt.js.org/assets/images/screenshot.png',
      description: "A faithful HTML5 adaptation of the legendary classic light-gun arcade game. Test your focus and reflex accuracy by clearing flying ducks out of the field.",
      instructions: "Move your cursor and click (or tap directly on touch screens) to target and shoot flying ducks before they escape. You have 3 rounds per duck.",
      howToPlay: "Ducks will fly out from the grass one or two at a time. You have three bullets in your shotgun per sequence. Click or tap to shoot the ducks before they fly away. The dog will laugh at you if you miss!",
      controls: "Desktop: Mouse to aim and Left Click to shoot. Mobile: Tap directly on the ducks to shoot.",
      tipsAndTricks: "1. Take a breath and aim, don't just spam clicks.\\n2. Watch the flight patterns; ducks often pause or change direction sharply.\\n3. In later rounds, ducks fly significantly faster, so lead your targets slightly.",
      whyYoullLikeIt: "The pure nostalgia factor combined with responsive precise controls provides a satisfying blast from the past right in your browser.",
      tags: ['Arcade', 'Retro', 'Shooter', 'Pixel Art', 'Singleplayer'],
      developer: 'Matt Surabian',
      publisher: 'JS Classics',
      mobileOptimization: 'touch-friendly',
      fullscreenSupport: true,
      orientation: 'landscape',
      rating: 4.5,
      ratingCount: 12050,
      plays: 670000,
      createdAt: new Date().toISOString(),
      isHot: false,
      isTop: true
    }
];

allGames.unshift(...specificGames);

// Add missing categories in TAGS
const tags = [...new Set(['Trending', 'Recommended', 'Casual', 'Action', 'Puzzle', 'Simulator', 'Obby', 'Adventure', 'Sports', 'Strategy', 'Multiplayer', 'Arcade', 'Horror', '2 Player', '3 Player', '4 Player', ...bases.map(b=>b.c), ...bases.flatMap(b=>b.tags)])];
const categories = ['Action', 'Puzzle', 'Adventure', 'Sports', 'Strategy', 'Multiplayer', 'Arcade', 'Racing'];

const fileContent = 
"import { Game } from './types';\\n\\n" +
"export const CATEGORY_LIST = " + JSON.stringify(categories) + ";\\n" +
"export const TAGS_LIST = " + JSON.stringify(tags) + ";\\n\\n" +
"export const GAMES: Game[] = " + JSON.stringify(allGames, null, 2) + ";\\n";

fs.writeFileSync('src/games.ts', fileContent);
console.log('src/games.ts generated with ' + allGames.length + ' games.');

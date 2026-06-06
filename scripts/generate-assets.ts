import fs from 'fs';
import path from 'path';
import { GAMES } from '../src/games.js';

// Setup directories
const publicDir = path.resolve(process.cwd(), 'public');
const gamesDir = path.join(publicDir, 'images', 'games');
const categoriesDir = path.join(publicDir, 'images', 'categories');

// Create directories recursively 
fs.mkdirSync(gamesDir, { recursive: true });
fs.mkdirSync(categoriesDir, { recursive: true });

// Premium color palettes for procedural styling
const PALETTES = [
  { from: "#ec4899", to: "#8b5cf6", name: "Synthwave Pink-Purple" },
  { from: "#06b6d4", to: "#4f46e5", name: "Deep Cyber-Indigo" },
  { from: "#10b981", to: "#06b6d4", name: "Emerald Cyberpunk" },
  { from: "#f97316", to: "#ef4444", name: "Electric Ember" },
  { from: "#f59e0b", to: "#7c3aed", name: "Royal Gold-Violet" },
  { from: "#8b5cf6", to: "#f43f5e", name: "Sunset Dream" },
  { from: "#2563eb", to: "#06b6d4", name: "Arctic Blizzard" },
  { from: "#eab308", to: "#ea580c", name: "Solar Flare" }
];

// Helper to hash string to a deterministic positive number
function getHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// Custom vector artwork drawer for every single game to guarantee unique, gorgeous arcade tiles
function getArtworkMarkup(id: string, palette: typeof PALETTES[0], hash: number): { grid: string, art: string } {
  let gridMarkup = '';
  let artMarkup = '';

  switch (id) {
    case '2048-original':
      gridMarkup = `
        <pattern id="grid-2048" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="none" stroke="#ffffff" stroke-width="1" stroke-opacity="0.04" />
        </pattern>
        <rect width="512" height="512" fill="url(#grid-2048)" />
      `;
      artMarkup = `
        <g transform="translate(256, 210)">
          <!-- Retro 2048 Grid Board -->
          <rect x="-140" y="-140" width="280" height="280" rx="20" fill="#bbada0" />
          <!-- Layered tiles with increasing values -->
          <rect x="-125" y="-125" width="115" height="115" rx="10" fill="#eee4da" />
          <text x="-67" y="-60" fill="#776e65" font-family="system-ui, sans-serif" font-weight="900" font-size="44" text-anchor="middle" dominant-baseline="central">2</text>
          
          <rect x="10" y="-125" width="115" height="115" rx="10" fill="#ede0c8" />
          <text x="68" y="-60" fill="#776e65" font-family="system-ui, sans-serif" font-weight="900" font-size="44" text-anchor="middle" dominant-baseline="central">4</text>
          
          <rect x="-125" y="10" width="115" height="115" rx="10" fill="#f2b179" />
          <text x="-67" y="68" fill="#f9f6f2" font-family="system-ui, sans-serif" font-weight="900" font-size="44" text-anchor="middle" dominant-baseline="central">8</text>
          
          <!-- Ultimate glowing Golden title piece popping out -->
          <g filter="drop-shadow(0px 8px 16px rgba(237, 194, 46, 0.55))">
            <rect x="5" y="5" width="120" height="120" rx="14" fill="#edc22e" stroke="#ffffff" stroke-width="3" />
            <text x="65" y="65" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="34" text-anchor="middle" dominant-baseline="central">2048</text>
            <circle cx="115" cy="15" r="5" fill="#ffffff" />
          </g>
        </g>
      `;
      break;

    case 'hextris-io':
      gridMarkup = `
        <circle cx="256" cy="230" r="190" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.05" />
        <circle cx="256" cy="230" r="140" fill="none" stroke="#ffffff" stroke-dasharray="6,8" stroke-width="1.5" stroke-opacity="0.04" />
      `;
      artMarkup = `
        <g transform="translate(256, 215)">
          <!-- Core Central Hexagon -->
          <polygon points="0,-75 65,-37 65,37 0,75 -65,37 -65,-37" fill="#1e1e38" stroke="#ffffff" stroke-width="4.5" />
          <!-- Colorful falling segment layers -->
          <path d="M 0,-110 L 95,-55 L 80,-30 L 0,-75 Z" fill="#ef4444" opacity="0.9" />
          <path d="M 0,110 L -95,55 L -80,30 L 0,75 Z" fill="#06b6d4" opacity="0.9" />
          <path d="M 95,55 L 95,-55 L 70,-40 L 70,40 Z" fill="#f59e0b" opacity="0.95" />
          <path d="M -95,-55 L -95,55 L -70,40 L -70,-40 Z" fill="#a855f7" opacity="0.85" />
          <polygon points="0,-10 8,-5 8,5 0,10 -8,5 -8,-5" fill="#ffffff" />
        </g>
      `;
      break;

    case 'duckhunt-js':
      gridMarkup = `
        <!-- Retro sky backdrop and ground foliage -->
        <rect x="25" y="25" width="462" height="320" fill="#64b5f6" rx="14" />
        <rect x="25" y="320" width="462" height="150" fill="#4caf50" rx="12" />
      `;
      artMarkup = `
        <g transform="translate(256, 200)">
          <!-- Pixel-style Marsh Trees -->
          <rect x="-180" y="70" width="40" height="90" fill="#3e2723" />
          <rect x="-210" y="20" width="100" height="60" fill="#2e7d32" rx="10" />
          <rect x="140" y="50" width="30" height="110" fill="#3e2723" />
          <rect x="110" y="-10" width="90" height="70" fill="#2e7d32" rx="10" />

          <!-- Pixel style floating duck -->
          <g transform="translate(-15, -40) scale(1.4)">
            <!-- Head -->
            <rect x="10" y="-30" width="30" height="25" fill="#2e7d32" />
            <rect x="30" y="-20" width="15" height="10" fill="#ffb300" /> <!-- Beak -->
            <rect x="18" y="-24" width="6" height="6" fill="#ffffff" />
            <rect x="20" y="-24" width="3" height="3" fill="#000000" />
            <!-- Body -->
            <rect x="-20" y="-10" width="45" height="25" fill="#5d4037" rx="4" />
            <rect x="-10" y="-5" width="25" height="15" fill="#ffffff" rx="2" />
            <!-- Flapping Wing -->
            <polygon points="-8,-10 -25,-35 -5,-25" fill="#ffb300" />
            <polygon points="-5,-5 -18,15 0,8" fill="#ffb300" />
          </g>

          <!-- Vibrant glowing red crosshair targeting the duck -->
          <g transform="translate(35, -20)" stroke="#ff1744" stroke-width="4.5" fill="none">
            <circle cx="0" cy="0" r="42" stroke-dasharray="14,10" />
            <circle cx="0" cy="0" r="14" />
            <line x1="-60" y1="0" x2="60" y2="0" />
            <line x1="0" y1="-60" x2="0" y2="60" />
            <circle cx="0" cy="0" r="3.5" fill="#ff1744" />
          </g>
        </g>
      `;
      break;

    case 'floppy-bird':
      gridMarkup = `
        <!-- Scenic sunset canvas -->
        <rect x="20" y="20" width="472" height="472" rx="26" fill="url(#floppy-back)" />
        <defs>
          <linearGradient id="floppy-back" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#4fc3f7" />
            <stop offset="60%" stop-color="#fff176" />
            <stop offset="100%" stop-color="#ffb74d" />
          </linearGradient>
        </defs>
      `;
      artMarkup = `
        <g transform="translate(256, 210)">
          <!-- Classic green piping obstacles -->
          <g transform="translate(-110, 0)">
            <rect x="-28" y="-240" width="56" height="160" fill="#2e7d32" stroke="#1b5e20" stroke-width="4" rx="4" />
            <rect x="-34" y="-95" width="68" height="25" fill="#4caf50" stroke="#1b5e20" stroke-width="4" rx="2" />
            <rect x="-28" y="70" width="56" height="200" fill="#2e7d32" stroke="#1b5e20" stroke-width="4" rx="4" />
            <rect x="-34" y="55" width="68" height="25" fill="#4caf50" stroke="#1b5e20" stroke-width="4" rx="2" />
          </g>
          
          <g transform="translate(130, 0)">
            <rect x="-28" y="-240" width="56" height="110" fill="#2e7d32" stroke="#1b5e20" stroke-width="4" rx="4" />
            <rect x="-34" y="-145" width="68" height="25" fill="#4caf50" stroke="#1b5e20" stroke-width="4" rx="2" />
            <rect x="-28" y="20" width="56" height="200" fill="#2e7d32" stroke="#1b5e20" stroke-width="4" rx="4" />
            <rect x="-34" y="5" width="68" height="25" fill="#4caf50" stroke="#1b5e20" stroke-width="4" rx="2" />
          </g>

          <!-- Sassy flapping yellow bird -->
          <g transform="translate(0, -25) scale(1.65)" stroke="#000000" stroke-width="2.5">
            <!-- Body -->
            <ellipse cx="0" cy="0" rx="19" ry="15" fill="#ffeb3b" />
            <!-- Big white eye -->
            <circle cx="8" cy="-5" r="6" fill="#ffffff" />
            <circle cx="9" cy="-5" r="2.5" fill="#000000" />
            <!-- Huge orange lips/beak -->
            <path d="M 14,-2 L 26,-4 Q 28,0 23,3 L 14,2 Z" fill="#ff5722" />
            <!-- Flittering Wing -->
            <path d="M -10,-2 C -18,-15 -2,-18 -4,-2 Z" fill="#ff9800" />
            <!-- Red tail feathers -->
            <path d="M -18,1 L -25,-4 L -21,-8 Z" fill="#e53935" />
          </g>
          
          <!-- Speed action indicators -->
          <path d="M -65,-25 H -45 M -85,-10 H -55 M -70,5 H -50" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.8" />
        </g>
      `;
      break;

    case 'pacman-js':
      gridMarkup = `
        <!-- Blueprint retro neon labyrinth walls -->
        <g stroke="#2563eb" stroke-width="5" fill="none" opacity="0.6" stroke-linecap="round" stroke-linejoin="round">
          <rect x="35" y="35" width="442" height="380" rx="16" />
          <path d="M 120,35 V 150 H 220 V 90" />
          <path d="M 392,35 V 150 H 292 V 90" />
          <path d="M 120,415 V 280 H 220 V 330" />
          <path d="M 392,415 V 280 H 292 V 330" />
          <path d="M 35,210 H 140 H 140" />
          <path d="M 477,210 H 372 H 372" />
        </g>
        <!-- Pac dots -->
        <g fill="#ffffff" opacity="0.85">
          <circle cx="80" cy="120" r="4.5" />
          <circle cx="80" cy="165" r="4.5" />
          <circle cx="80" cy="255" r="4.5" />
          <circle cx="80" cy="300" r="4.5" />
          <circle cx="432" cy="120" r="4.5" />
          <circle cx="432" cy="165" r="4.5" />
          <circle cx="432" cy="255" r="4.5" />
          <circle cx="432" cy="300" r="4.5" />
        </g>
      `;
      artMarkup = `
        <g transform="translate(256, 210)">
          <!-- Mouth wide open Pac-man -->
          <g transform="translate(50, 0)">
            <circle cx="0" cy="0" r="62" fill="#ffd600" />
            <polygon points="0,0 64,-42 64,42" fill="#0c0c1e" />
            <circle cx="10" cy="-34" r="7.5" fill="#000000" />
          </g>

          <!-- Glowing giant Energizer food orb -->
          <circle cx="165" cy="0" r="12" fill="#ffffff" opacity="0.95" filter="drop-shadow(0 0 8px #ffffff)" />

          <!-- Cute pink ghost chasing close behind -->
          <g transform="translate(-110, 5)">
            <path d="M -45,45 C -45,-45 45,-45 45,45 L 30,30 L 15,45 L 0,30 L -15,45 L -30,30 Z" fill="#ff4081" />
            <!-- Googly eyes -->
            <circle cx="-16" cy="5" r="10" fill="#ffffff" />
            <circle cx="-12" cy="5" r="4" fill="#2563eb" />
            <circle cx="16" cy="5" r="10" fill="#ffffff" />
            <circle cx="20" cy="5" r="4" fill="#2563eb" />
          </g>
        </g>
      `;
      break;

    case 'js-tiny-platformer':
      gridMarkup = `
        <!-- Pixels of sky and rocky hill templates -->
        <rect x="20" y="20" width="472" height="472" fill="#1b1b22" rx="24" />
        <path d="M 20,380 Q 150,330 280,360 T 492,340 L 492,492 L 20,492 Z" fill="#3e2723" opacity="0.9" />
        <path d="M 20,410 Q 180,370 320,400 T 492,390 L 492,492 L 20,492 Z" fill="#271510" />
      `;
      artMarkup = `
        <g transform="translate(256, 190)">
          <!-- Modular game ledges -->
          <rect x="-180" y="30" width="130" height="30" fill="#795548" stroke="#3e2723" stroke-width="4.5" rx="4" />
          <rect x="50" y="-30" width="150" height="30" fill="#795548" stroke="#3e2723" stroke-width="4.5" rx="4" />
          <!-- Neon Green Grassy Caps -->
          <rect x="-180" y="20" width="130" height="10" fill="#8bc34a" rx="2" />
          <rect x="50" y="-40" width="150" height="10" fill="#8bc34a" rx="2" />

          <!-- Super cute running platform character with a blue helmet jumping -->
          <g transform="translate(-115, -34)">
            <rect x="-16" y="-32" width="32" height="46" rx="10" fill="#29b6f6" stroke="#01579b" stroke-width="3" />
            <!-- Visor/Face -->
            <rect x="2" y="-24" width="16" height="15" rx="3" fill="#ffffff" />
            <rect x="10" y="-20" width="4" height="6" fill="#ec4899" />
            <!-- Shoes/Arms -->
            <circle cx="-10" cy="18" r="7.5" fill="#ff7043" />
            <circle cx="10" cy="18" r="7.5" fill="#ff7043" />
            <path d="M 12,-10 L 26,-2" stroke="#01579b" stroke-width="4" stroke-linecap="round" />
          </g>

          <!-- Golden glowing collectible coin -->
          <g transform="translate(130, -95)">
            <circle cx="0" cy="0" r="17" fill="#ffd54f" stroke="#ff8f00" stroke-width="2.5" />
            <text x="0" y="1" fill="#ff8f00" font-family="'Courier New', Courier, monospace" font-weight="900" font-size="20" text-anchor="middle" dominant-baseline="central">$</text>
            <circle cx="4" cy="-5" r="2.5" fill="#ffffff" opacity="0.8" />
          </g>

          <!-- Red glowing geometric floor spike obstacles -->
          <polygon points="-10,120 0,90 10,120" fill="#f44336" stroke="#b71c1c" stroke-width="2" />
          <polygon points="10,120 20,95 30,120" fill="#f44336" stroke="#b71c1c" stroke-width="2" />
        </g>
      `;
      break;

    case 'js-racer':
      gridMarkup = `
        <!-- Speed radial motion beams -->
        <g stroke="#ffffff" stroke-width="2.5" opacity="0.14" stroke-dasharray="20,15">
          <line x1="256" y1="120" x2="-50" y2="280" />
          <line x1="256" y1="120" x2="562" y2="280" />
          <line x1="256" y1="120" x2="256" y2="562" />
        </g>
      `;
      artMarkup = `
        <!-- Curved F1-style raceway track layout -->
        <path d="M 210,140 L 50,440 L 462,440 L 302,140 Z" fill="#2d3748" />
        <!-- Striped track border curbstones -->
        <path d="M 210,140 L 50,440" stroke="#e53e3e" stroke-width="12" stroke-dasharray="25,25" />
        <path d="M 302,140 L 462,440" stroke="#ffffff" stroke-width="12" stroke-dasharray="25,25" />

        <!-- High speed red racing formula car screaming downhill toward camera -->
        <g transform="translate(256, 305)">
          <!-- Giant black track tires -->
          <rect x="-105" y="15" width="38" height="65" rx="8" fill="#1a202c" stroke="#ffffff" stroke-width="1.5" />
          <rect x="67" y="15" width="38" height="65" rx="8" fill="#1a202c" stroke="#ffffff" stroke-width="1.5" />
          <!-- Car chassis aerofoil elements -->
          <rect x="-85" y="45" width="170" height="28" rx="6" fill="#e53e3e" stroke="#742a2a" stroke-width="3" />
          <path d="M -45,45 L -20,-35 L 20,-35 L 45,45 Z" fill="#ff1744" stroke="#9bff44" stroke-width="1.5" />
          <!-- Formula Spoiler wing -->
          <rect x="-95" y="-12" width="190" height="15" rx="3" fill="#111" />
          <line x1="-95" y1="3" x2="-95" y2="45" stroke="#111" stroke-width="5" />
          <line x1="95" y1="3" x2="95" y2="45" stroke="#111" stroke-width="5" />
          <!-- Golden engine exhaust fire sparks -->
          <circle cx="0" cy="52" r="11" fill="#ffeb3b" opacity="0.9" />
          <!-- Driver white helmet -->
          <circle cx="0" cy="-5" r="14" fill="#ffffff" />
          <rect x="-7" y="-10" width="14" height="8" fill="#1a202c" rx="1.5" />
        </g>
      `;
      break;

    case 'hexgl':
      gridMarkup = `
        <pattern id="hex-cyber-racer" width="40" height="69.28" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 20 11.54 L 0 0 L 0 23.09 L 20 34.64 L 40 23.09 Z M 20 34.64 L 0 46.18 L 0 69.28 L 20 57.73 Q 40 69.28 40 69.28 L 40 46.18 Z" fill="none" stroke="#6366f1" stroke-width="1.2" stroke-opacity="0.08" />
        </pattern>
        <rect width="512" height="512" fill="url(#hex-cyber-racer)" />
      `;
      artMarkup = `
        <g transform="translate(256, 210)">
          <!-- Techno neon tube visual guides -->
          <path d="M -180,110 L -40,-120 L 40,-120 L 180,110" fill="none" stroke="${palette.from}" stroke-width="4.5" stroke-opacity="0.5" />
          <path d="M -150,110 L -20,-120 L 20,-120 L 150,110" fill="none" stroke="${palette.to}" stroke-width="2" stroke-dasharray="14,10" stroke-opacity="0.4" />

          <!-- Futuristic sleek anti-gravity racer capsule (hexa style) -->
          <g transform="translate(0, 20)">
            <!-- Double wings -->
            <polygon points="-110,35 -20,-15 0,-40 20,-15 110,35 0,10" fill="${palette.from}" fill-opacity="0.25" stroke="${palette.from}" stroke-width="4" />
            <!-- Floating fuselage cockpit -->
            <polygon points="-24,10 0,-75 24,10 0,32" fill="#ffffff" stroke="${palette.to}" stroke-width="4" />
            <polygon points="-12,-15 0,-55 12,-15" fill="#06b6d4" />
            <!-- Dual Cyan thrust flames glowing neon -->
            <polygon points="-24,20 -14,48 -34,48" fill="#00f0ff" opacity="0.85" />
            <polygon points="24,20 14,48 34,48" fill="#00f0ff" opacity="0.85" />
          </g>
        </g>
      `;
      break;

    case 'swooop-playcanvas':
      gridMarkup = `
        <!-- Fluffy cumulus cloud circles layout -->
        <g fill="#ffffff" opacity="0.06">
          <circle cx="90" cy="110" r="45" />
          <circle cx="130" cy="120" r="35" />
          <circle cx="390" cy="280" r="55" />
          <circle cx="430" cy="290" r="45" />
        </g>
      `;
      artMarkup = `
        <g transform="translate(256, 210)">
          <!-- Flying loop trail representing the propeller trajectory -->
          <path d="M -160,80 C -120,-140 120,-140 160,80 C 180,140 -180,140 -160,80" fill="none" stroke="#ffffff" stroke-width="4" stroke-dasharray="10,12" opacity="0.65" />

          <!-- Red and gold custom propeller airplane swooping high -->
          <g transform="translate(20, -25) rotate(-16)">
            <!-- Fuselage -->
            <ellipse cx="0" cy="0" rx="42" ry="16" fill="#e53e3e" stroke="#2d3748" stroke-width="3" />
            <!-- Yellow Tail wing -->
            <path d="M -34,-12 L -46,-32 L -28,-14" fill="#ecc94b" stroke="#2d3748" stroke-width="2.5" />
            <!-- Double wings -->
            <rect x="-12" y="-55" width="22" height="110" rx="6" fill="#ecc94b" stroke="#2d3748" stroke-width="3" />
            <!-- Propeller spinner and shiny chrome hub -->
            <rect x="38" y="-14" width="8" height="28" fill="#1a202c" />
            <line x1="42" y1="-44" x2="42" y2="44" stroke="#ffffff" stroke-width="3.5" />
            <circle cx="42" cy="0" r="7.5" fill="#e2e8f0" stroke="#1a202c" stroke-width="2" />
          </g>

          <!-- Shiny gold stars around plane representing coins -->
          <g transform="translate(-110, -65)" stroke="#ecc94b" stroke-width="2.5" fill="#f6e05e">
             <polygon points="0,-12 3,-3 12,-3 5,3 8,12 0,6 -8,12 -5,3 -12,-3 -3,-3" />
          </g>
          <g transform="translate(130, 90)" stroke="#ecc94b" stroke-width="2.5" fill="#f6e05e" scale="0.8">
             <polygon points="0,-12 3,-3 12,-3 5,3 8,12 0,6 -8,12 -5,3 -12,-3 -3,-3" />
          </g>
        </g>
      `;
      break;

    case 'spider-solitaire':
      gridMarkup = `
        <!-- High-contrast felt casino layout -->
        <rect x="15" y="15" width="482" height="482" fill="#1b5e20" rx="30" />
        <rect x="25" y="25" width="462" height="462" fill="none" stroke="#2e7d32" stroke-width="8" rx="22" />
      `;
      artMarkup = `
        <g transform="translate(256, 210)">
          <!-- Layered stacks of cascade card sheets -->
          <g transform="translate(-85, -45) rotate(-8)">
            <rect x="-55" y="-85" width="110" height="170" rx="8" fill="#ffffff" stroke="#111" stroke-width="3" />
            <!-- Suit symbol (Black spade) -->
            <path d="M 0,-30 C -12,-16 0,0 0,16 C 0,0 12,-16 0,-30" fill="#1a202c" />
            <path d="M -5,14 L 5,14 L 2,30 L -2,30 Z" fill="#1a202c" />
            <!-- Large stylish Rank letter -->
            <text x="-34" y="-55" fill="#1a202c" font-family="'Times New Roman', Times, serif" font-weight="900" font-size="28" text-anchor="middle">A</text>
          </g>

          <g transform="translate(30, -15) rotate(5)">
            <!-- Gorgeous crimson Back graphic representing stacked decks -->
            <rect x="-55" y="-85" width="110" height="170" rx="8" fill="#f44336" stroke="#ffffff" stroke-width="3" filter="drop-shadow(0px 6px 12px rgba(0,0,0,0.45))" />
            <rect x="-45" y="-75" width="90" height="150" fill="none" stroke="#ffebee" stroke-width="4" stroke-dasharray="8,6" />
            <circle cx="0" cy="0" r="24" fill="none" stroke="#ffebee" stroke-width="3.5" />
            <polygon points="0,-16 6,-2 18,-2 10,6 14,18 0,10 -14,18 -10,6 -18,-2 -6,-2" fill="#ffebee" />
          </g>
          
          <g transform="translate(105, 30) rotate(14)">
            <rect x="-55" y="-85" width="110" height="170" rx="8" fill="#ffffff" stroke="#111" stroke-width="3" filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.5))" />
            <!-- King card face representation -->
            <text x="-32" y="-55" fill="#e53e3e" font-family="'Times New Roman', Times, serif" font-weight="900" font-size="28" text-anchor="middle">K</text>
            <!-- Red heart suit icon -->
            <path d="M 0,-15 C -15,-30 -30,-5 0,22 C 30,-5 15,-30 0,-15 Z" fill="#e53e3e" transform="scale(0.85)" />
          </g>
        </g>
      `;
      break;

    case 'taxi-drift':
      gridMarkup = `
        <!-- Outrun synthesizer background -->
        <rect x="20" y="20" width="472" height="472" rx="24" fill="#0f051d" />
        <!-- Neon Sunset Radial backdrop -->
        <circle cx="256" cy="220" r="130" fill="url(#pink-sunset)" />
        <defs>
          <linearGradient id="pink-sunset" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ff007f" />
            <stop offset="60%" stop-color="#ff7b00" />
            <stop offset="100%" stop-color="#ff007f" stop-opacity="0" />
          </linearGradient>
        </defs>
      `;
      artMarkup = `
        <!-- Isometric perspective laser grid -->
        <g stroke="#ff00aa" stroke-width="1.5" stroke-opacity="0.25">
          <line x1="256" y1="220" x2="-20" y2="440" />
          <line x1="256" y1="220" x2="110" y2="440" />
          <line x1="256" y1="220" x2="256" y2="440" />
          <line x1="256" y1="220" x2="402" y2="440" />
          <line x1="256" y1="220" x2="532" y2="440" />
          <line x1="0" y1="360" x2="512" y2="360" />
          <line x1="0" y1="410" x2="512" y2="410" />
        </g>

        <g transform="translate(256, 300)">
          <!-- Double tyre smoke billows -->
          <circle cx="-90" cy="50" r="30" fill="#ffffff" fill-opacity="0.16" />
          <circle cx="-60" cy="65" r="42" fill="#ffffff" fill-opacity="0.22" />
          <!-- Thick parallel black tire track skids -->
          <path d="M -90,45 A 110,110 0 0,0 80,68" stroke="#111" stroke-width="10" stroke-linecap="round" fill="none" opacity="0.85" />
          
          <!-- Yellow Retro Sedan Taxi drifting horizontally -->
          <g transform="translate(10, 15) rotate(-26)">
            <!-- Base shadow -->
            <rect x="-85" y="-12" width="165" height="55" rx="14" fill="#000000" fill-opacity="0.5" />
            <!-- Yellow metal body shell -->
            <rect x="-80" y="-18" width="155" height="48" rx="10" fill="#ffd600" stroke="#111" stroke-width="3" />
            <rect x="-15" y="-38" width="70" height="25" rx="5" fill="#ffd600" stroke="#111" stroke-width="3" />
            <!-- Windshield/Windows -->
            <rect x="-5" y="-33" width="55" height="15" fill="#00f3ff" opacity="0.8" />
            <!-- Retro checker livery along the fender -->
            <path d="M -75,0 H 70" stroke="#111" stroke-dasharray="10,10" stroke-width="6" />
            <!-- High-shine alloy wheels -->
            <circle cx="-45" cy="27" r="13" fill="#1a202c" stroke="#ffffff" stroke-width="2.5" />
            <circle cx="45" cy="27" r="13" fill="#1a202c" stroke="#ffffff" stroke-width="2.5" />
            <!-- Sassy taxi top roof sign light -->
            <rect x="10" y="-49" width="34" height="13" rx="2" fill="#ff7c00" stroke="#111" stroke-width="2" />
            <text x="27" y="-42" fill="#111" font-family="'Impact', sans-serif" font-weight="900" font-size="9" text-anchor="middle">TAXI</text>
          </g>
        </g>
      `;
      break;

    case 'astray-playkeepsafe':
      gridMarkup = `
        <pattern id="maze-mesh" width="30" height="30" patternUnits="userSpaceOnUse">
          <rect width="30" height="30" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.04" />
        </pattern>
        <rect width="512" height="512" fill="url(#maze-mesh)" />
      `;
      artMarkup = `
        <g transform="translate(256, 210)">
          <!-- Glowing high-walled red perspective isometric labyrinth puzzle -->
          <g stroke="#ec4899" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.88">
            <path d="M -150,-110 H 150 V 110 H -150 Z" />
            <path d="M -90,-110 V 20 H -10 V -50 H 70 V 70" />
            <path d="M -150,-20 H -90" />
            <path d="M -10,20 V 70 H 110" />
            <path d="M 70,-110 V -50" />
            <path d="M 150,-20 H 70" />
          </g>

          <!-- Shiny turquoise player orb sphere rolling in the corridors -->
          <g transform="translate(30, -10)" filter="drop-shadow(0 4px 12px #06b6d4)">
            <circle cx="0" cy="0" r="26" fill="url(#turquoise-metallic)" />
            <!-- Metallic specular highlight -->
            <circle cx="-8" cy="-8" r="9" fill="#ffffff" fill-opacity="0.5" filter="blur(2px)" />
            <circle cx="-10" cy="-10" r="4" fill="#ffffff" />
          </g>
        </g>
        <defs>
          <radialGradient id="turquoise-metallic" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="40%" stop-color="#06b6d4" />
            <stop offset="100%" stop-color="#083344" />
          </radialGradient>
        </defs>
      `;
      break;

    case 'master-archer':
      gridMarkup = `
        <!-- Standard concentric bullseye target radial grid lines -->
        <circle cx="256" cy="230" r="220" fill="none" stroke="#ffffff" stroke-width="1" stroke-opacity="0.04" />
        <circle cx="256" cy="230" r="160" fill="none" stroke="#ffffff" stroke-width="1" stroke-opacity="0.06" />
      `;
      artMarkup = `
        <g transform="translate(256, 210)">
          <!-- Isometric Archery Straw Butt Shield -->
          <circle cx="0" cy="0" r="115" fill="#f59e0b" stroke="#78350f" stroke-width="6" />
          <!-- Circular score rings matching Olympic standard specs -->
          <circle cx="0" cy="0" r="90" fill="#3b82f6" />
          <circle cx="0" cy="0" r="65" fill="#ef4444" />
          <circle cx="0" cy="0" r="35" fill="#facc15" />
          <circle cx="0" cy="0" r="11" fill="#ca8a04" />
          
          <!-- Crosshair focus coordinates overlaid -->
          <g stroke="#ffffff" stroke-width="2" opacity="0.45" fill="none">
             <line x1="-150" y1="0" x2="150" y2="0" />
             <line x1="0" y1="-150" x2="0" y2="150" />
          </g>

          <!-- Steel-tipped wooden arrow pierced directly into the yellow bullseye -->
          <g transform="translate(-15, -15) rotate(-35)">
             <line x1="-190" y1="0" x2="80" y2="0" stroke="#78350f" stroke-width="5" />
             <!-- Arrowhead inserted in target -->
             <polygon points="80,-9 98,0 80,9" fill="#94a3b8" />
             <!-- Feather flights at the rear end -->
             <polygon points="-170,0 -195,-13 -175,-13" fill="#ffffff" />
             <polygon points="-170,0 -195,13 -175,13" fill="#ffffff" />
             <polygon points="-160,0 -185,-13 -168,-13" fill="#ef4444" opacity="0.9" />
             <polygon points="-160,0 -185,13 -168,13" fill="#ef4444" opacity="0.9" />
          </g>
        </g>
      `;
      break;

    case 'mini-golf-13k':
      gridMarkup = `
        <!-- Soft green grassy fairways grid -->
        <rect x="25" y="25" width="462" height="462" fill="#1b5e20" rx="30" />
      `;
      artMarkup = `
        <g transform="translate(256, 210)">
          <!-- Isometric Sandbox bunker hazard -->
          <path d="M -145,-105 Q -85,-145 0,-105 Q 120,-85 20,-25 Q -80,20 -145,-105 Z" fill="#eed9b2" stroke="#ca8a04" stroke-width="3" />
          <!-- Blue Water pond hazard -->
          <path d="M 65,45 Q 125,15 180,55 Q 190,115 125,135 Q 25,115 65,45 Z" fill="#29b6f6" stroke="#0288d1" stroke-width="3" />

          <!-- Circular Green Putting Cup hole with white inner casing -->
          <circle cx="-50" cy="55" r="19" fill="#111" stroke="#ffffff" stroke-width="2" />
          <!-- Solid red golf flag stick standing in the hole -->
          <g transform="translate(-50, 55)">
             <line x1="0" y1="0" x2="0" y2="-125" stroke="#e2e8f0" stroke-width="4.5" />
             <!-- Triangular flying Red flag -->
             <polygon points="0,-125 55,-105 0,-85" fill="#f44336" />
          </g>

          <!-- Pristine white dimpled golf ball close to the hole -->
          <g transform="translate(10, 40)">
             <!-- Shadow -->
             <circle cx="2" cy="11" r="10" fill="#000000" fill-opacity="0.32" />
             <circle cx="0" cy="0" r="12" fill="#ffffff" />
             <!-- Dimple shader layout simple dot pattern -->
             <circle cx="-3" cy="-3" r="1.5" fill="#cbd5e1" />
             <circle cx="3" cy="-3" r="1.5" fill="#cbd5e1" />
             <circle cx="-3" cy="3" r="1.5" fill="#cbd5e1" />
             <circle cx="3" cy="3" r="1.5" fill="#cbd5e1" />
             <circle cx="0" cy="5" r="1" fill="#cbd5e1" />
          </g>
        </g>
      `;
      break;

    case 'js-snake':
      gridMarkup = `
        <pattern id="snake-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <rect width="24" height="24" fill="none" stroke="#22c55e" stroke-width="1.2" stroke-opacity="0.04" />
        </pattern>
        <rect width="512" height="512" fill="url(#snake-grid)" />
      `;
      artMarkup = `
        <g transform="translate(256, 210)">
          <!-- Retro blocky green snake forming modular loop tracks -->
          <g stroke="#22c55e" stroke-width="19" stroke-linecap="square" stroke-linejoin="miter" fill="none">
            <path d="M -130,90 H -30 V -90 H 80 V 30" />
            <!-- Head piece at terminal -->
            <path d="M 80,30 V 55" stroke="#4ade80" stroke-width="21" />
          </g>
          <!-- Snake cute blinking beads (eyes) on head segment -->
          <circle cx="320" cy="265" r="3" fill="#000000" />
          <circle cx="352" cy="265" r="3" fill="#000000" />

          <!-- Super glossy bright red apple with a tiny green leaf -->
          <g transform="translate(-130, -50)">
            <circle cx="0" cy="4" r="19" fill="#ef4444" filter="drop-shadow(0 4px 8px rgba(239, 68, 68, 0.5))" />
            <!-- Apple indention -->
            <path d="M -6,-14 Q 0,-6 6,-14" fill="none" stroke="#7f1d1d" stroke-width="2.5" />
            <!-- Brown stem -->
            <path d="M 0,-14 Q 5,-28 14,-26" fill="none" stroke="#78350f" stroke-width="3" />
            <!-- Leaf -->
            <path d="M 7,-24 Q 18,-30 19,-18 Q 8,-16 7,-24 Z" fill="#22c55e" />
          </g>
        </g>
      `;
      break;

    case 'js-tetris':
      gridMarkup = `
        <pattern id="tetris-mesh" width="30" height="30" patternUnits="userSpaceOnUse">
          <rect width="30" height="30" fill="none" stroke="#ffffff" stroke-width="1" stroke-opacity="0.03" />
        </pattern>
        <rect width="512" height="512" fill="url(#tetris-mesh)" />
      `;
      artMarkup = `
        <g transform="translate(256, 210)">
          <!-- Neon colored Tetromino block structures locking in cascade -->
          <!-- Orange L piece -->
          <g transform="translate(-105, 55)">
            <rect x="0" y="0" width="36" height="36" rx="4" fill="#f97316" stroke="#ffffff" stroke-width="2" />
            <rect x="36" y="0" width="36" height="36" rx="4" fill="#f97316" stroke="#ffffff" stroke-width="2" />
            <rect x="72" y="0" width="36" height="36" rx="4" fill="#f97316" stroke="#ffffff" stroke-width="2" />
            <rect x="72" y="-36" width="36" height="36" rx="4" fill="#f97316" stroke="#ffffff" stroke-width="2" />
          </g>
          
          <!-- Cyan I piece lying flat -->
          <g transform="translate(-105, 91)">
            <rect x="0" y="0" width="36" height="36" rx="4" fill="#06b6d4" stroke="#ffffff" stroke-width="2" />
            <rect x="36" y="0" width="36" height="36" rx="4" fill="#06b6d4" stroke="#ffffff" stroke-width="2" />
            <rect x="72" y="0" width="36" height="36" rx="4" fill="#06b6d4" stroke="#ffffff" stroke-width="2" />
            <rect x="108" y="0" width="36" height="36" rx="4" fill="#06b6d4" stroke="#ffffff" stroke-width="2" />
          </g>

          <!-- Yellow O Square piece -->
          <g transform="translate(39, 55)">
            <rect x="0" y="0" width="36" height="36" rx="4" fill="#eab308" stroke="#ffffff" stroke-width="2" />
            <rect x="36" y="0" width="36" height="36" rx="4" fill="#eab308" stroke="#ffffff" stroke-width="2" />
            <rect x="0" y="36" width="36" height="36" rx="4" fill="#eab308" stroke="#ffffff" stroke-width="2" />
            <rect x="36" y="36" width="36" height="36" rx="4" fill="#eab308" stroke="#ffffff" stroke-width="2" />
          </g>

          <!-- Purple T piece falling down -->
          <g transform="translate(-32, -65) rotate(15)">
            <rect x="-18" y="-18" width="36" height="36" rx="4" fill="#a855f7" stroke="#ffffff" stroke-width="2" />
            <rect x="-54" y="-18" width="36" height="36" rx="4" fill="#a855f7" stroke="#ffffff" stroke-width="2" />
            <rect x="18" y="-18" width="36" height="36" rx="4" fill="#a855f7" stroke="#ffffff" stroke-width="2" />
            <rect x="-18" y="18" width="36" height="36" rx="4" fill="#a855f7" stroke="#ffffff" stroke-width="2" />
            <!-- Action speed vectors on falling block -->
            <path d="M -18,-50 V -28 M 18,-50 V -28" stroke="#ffffff" stroke-width="2.5" opacity="0.75" />
          </g>
        </g>
      `;
      break;

    case 'game-of-life':
      gridMarkup = `
        <pattern id="conway-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="none" stroke="#22c55e" stroke-width="1" stroke-opacity="0.05" />
        </pattern>
        <rect width="512" height="512" fill="url(#conway-grid)" />
      `;
      artMarkup = `
        <g transform="translate(256, 210)">
          <!-- Cyber pixel glider units and pulsar outlines of John Conway's cellular automata -->
          <!-- Glider 1 -->
          <g fill="#22c55e" stroke="#166534" stroke-width="1">
            <rect x="-100" y="-100" width="18" height="18" rx="2" fill-opacity="0.9" />
            <rect x="-80" y="-80" width="18" height="18" rx="2" fill-opacity="0.9" />
            <rect x="-120" y="-60" width="18" height="18" rx="2" fill-opacity="0.9" />
            <rect x="-100" y="-60" width="18" height="18" rx="2" fill-opacity="0.9" />
            <rect x="-80" y="-60" width="18" height="18" rx="2" fill-opacity="0.9" />
          </g>

          <!-- Pentadecathlon oscillator core in green -->
          <g fill="#4ade80" stroke="#166534" stroke-width="1.5">
            <rect x="-10" y="-50" width="18" height="18" rx="3" />
            <rect x="-10" y="-30" width="18" height="18" rx="3" />
            <rect x="-10" y="-10" width="18" height="18" rx="3" fill="#ffffff" />
            <rect x="-10" y="10" width="18" height="18" rx="3" fill="#ffffff" />
            <rect x="-10" y="30" width="18" height="18" rx="3" />
            <rect x="-10" y="50" width="18" height="18" rx="3" />
            <rect x="-10" y="70" width="18" height="18" rx="3" />
            <rect x="-10" y="90" width="18" height="18" rx="3" />
          </g>

          <g fill="#10b981" opacity="0.6">
            <rect x="80" y="40" width="18" height="18" rx="2" />
            <rect x="100" y="40" width="18" height="18" rx="2" />
            <rect x="80" y="60" width="18" height="18" rx="2" />
            <rect x="100" y="60" width="18" height="18" rx="2" />
          </g>
        </g>
      `;
      break;

    case 'keepy-up':
      gridMarkup = `
        <!-- Sports Stadium lights and grass checker layout -->
        <rect x="25" y="25" width="462" height="422" fill="#22c55e" rx="16" />
        <g opacity="0.12" fill="#15803d">
           <rect x="25" y="25" width="231" height="422" />
           <rect x="25" y="223" width="462" height="110" />
        </g>
        <!-- Radiant lens flares -->
        <line x1="45" y1="45" x2="256" y2="200" stroke="#ffffff" stroke-width="2" opacity="0.4" />
        <line x1="467" y1="45" x2="256" y2="200" stroke="#ffffff" stroke-width="2" opacity="0.4" />
      `;
      artMarkup = `
        <g transform="translate(256, 195)">
          <!-- Concentric kicking momentum soundwaves -->
          <circle cx="0" cy="0" r="110" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-dasharray="10 14" opacity="0.75" />

          <!-- Super high-fidelity soccer/football ball floating with speed segments -->
          <g transform="translate(0, -5) rotate(18)">
            <!-- Ball sphere -->
            <circle cx="0" cy="0" r="56" fill="#ffffff" stroke="#121212" stroke-width="4" filter="drop-shadow(0 12px 24px rgba(0,0,0,0.4))" />
            <!-- Football pentagon shapes -->
            <polygon points="0,-18 17,-6 10,14 -10,14 -17,-6" fill="#111" />
            <!-- Connection lines to outer sphere -->
            <line x1="0" y1="-18" x2="0" y2="-56" stroke="#111" stroke-width="4" />
            <line x1="17" y1="-6" x2="48" y2="-28" stroke="#111" stroke-width="4" />
            <line x1="-17" y1="-6" x2="-48" y2="-28" stroke="#111" stroke-width="4" />
            <line x1="10" y1="14" x2="33" y2="45" stroke="#111" stroke-width="4" />
            <line x1="-10" y1="14" x2="-33" y2="45" stroke="#111" stroke-width="4" />
          </g>

          <!-- Red soccer cleat boot kicking from the corner -->
          <g transform="translate(-110, 105) rotate(22)">
             <path d="M -50,-10 L 10,-40 C 25,-48 45,-10 32,25 L -45,35 Z" fill="#ef4444" stroke="#7f1d1d" stroke-width="3" />
             <!-- White stripes and cleats -->
             <path d="M -10,-24 Q 0,0 -20,22 M -18,-26 Q -10,2 -28,24" stroke="#ffffff" stroke-width="3.5" fill="none" />
             <rect x="-35" y="32" width="12" height="8" fill="#ffffff" />
             <rect x="-10" y="34" width="12" height="8" fill="#ffffff" />
          </g>
        </g>
      `;
      break;

    case 'spaceport-manager':
      gridMarkup = `
        <!-- Cyber Radar Rings & Holographic grid lines -->
        <circle cx="256" cy="210" r="190" fill="none" stroke="#22d3ee" stroke-width="1.5" stroke-opacity="0.25" />
        <circle cx="256" cy="210" r="120" fill="none" stroke="#22d3ee" stroke-width="1" stroke-opacity="0.15" />
        <circle cx="256" cy="210" r="60" fill="none" stroke="#22d3ee" stroke-width="1" stroke-dasharray="4,6" stroke-opacity="0.2" />
        <line x1="66" y1="210" x2="446" y2="210" stroke="#22d3ee" stroke-width="1" stroke-opacity="0.1" />
        <line x1="256" y1="20" x2="256" y2="400" stroke="#22d3ee" stroke-width="1" stroke-opacity="0.1" />
        <!-- Radar Sweep effect -->
        <path d="M 256,210 L 360,110 A 190,190 0 0,0 256,20 Z" fill="url(#spaceport-radar-sweep-${id})" />
        <defs>
          <radialGradient id="spaceport-radar-sweep-${id}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.15" />
            <stop offset="100%" stop-color="#22d3ee" stop-opacity="0" />
          </radialGradient>
        </defs>
      `;
      artMarkup = `
        <g transform="translate(256, 210)">
          <!-- Core Spaceport Station structure (hologram blue & white) -->
          <circle cx="0" cy="0" r="45" fill="#1e293b" stroke="#38bdf8" stroke-width="4" filter="drop-shadow(0 0 12px #06b6d4)" />
          <circle cx="0" cy="0" r="30" fill="${palette.from}" fill-opacity="0.4" stroke="#ffffff" stroke-width="2" />
          
          <!-- Outer Solar Array / Shield Docks extending out -->
          <g stroke="#38bdf8" stroke-width="3" fill="none">
            <!-- Dock 1 -->
            <line x1="0" y1="-45" x2="0" y2="-110" />
            <rect x="-18" y="-120" width="36" height="15" rx="2" fill="#0f172a" stroke="#ffffff" stroke-width="2" />
            <text x="0" y="-112" fill="#38bdf8" font-family="monospace" font-weight="bold" font-size="8" text-anchor="middle">01</text>
            
            <!-- Dock 2 -->
            <line x1="39" y1="22" x2="95" y2="55" />
            <rect x="80" y="45" width="28" height="28" rx="4" fill="#0f172a" stroke="#cbd5e1" stroke-width="2" transform="rotate(30 94 59)" />
            <text x="96" y="58" fill="#a855f7" font-family="monospace" font-weight="bold" font-size="8" text-anchor="middle">02</text>

            <!-- Dock 3 -->
            <line x1="-39" y1="22" x2="-95" y2="55" />
            <rect x="-108" y="45" width="28" height="28" rx="4" fill="#0f172a" stroke="#cbd5e1" stroke-width="2" transform="rotate(-30 -94 59)" />
            <text x="-96" y="58" fill="#22c55e" font-family="monospace" font-weight="bold" font-size="8" text-anchor="middle">03</text>
          </g>
          
          <!-- Spaceships coming isometrically to dock -->
          <!-- Ship A (Cargo cruiser in orange) -->
          <g transform="translate(110, -80) rotate(-15)">
            <polygon points="0,-18 10,12 0,6 -10,12" fill="#f97316" stroke="#ffffff" stroke-width="1.5" />
            <!-- Jet thrust trail -->
            <line x1="0" y1="6" x2="0" y2="22" stroke="#ea580c" stroke-width="3.5" stroke-linecap="round" />
            <circle cx="0" cy="22" r="5" fill="#facc15" opacity="0.8" />
          </g>

          <!-- Ship B (Sleek starfighter in white/cyan) -->
          <g transform="translate(-110, -50) rotate(60)">
            <polygon points="0,-15 8,10 0,5 -8,10" fill="#ffffff" stroke="#06b6d4" stroke-width="1.5" />
            <line x1="0" y1="5" x2="0" y2="17" stroke="#06b6d4" stroke-width="2" />
          </g>

          <!-- Ship C (Heavy shuttle docking at Bay 1) -->
          <g transform="translate(0, -78)">
            <polygon points="0,-12 12,12 -12,12" fill="#e2e8f0" stroke="#334155" stroke-width="1.5" />
            <rect x="-6" y="12" width="12" height="4" fill="#64748b" />
          </g>

          <!-- UI HUD/Telemetry details -->
          <text x="-160" y="-120" fill="#22d3ee" font-family="monospace" font-weight="bold" font-size="10" opacity="0.8">SYS: SYS_OK</text>
          <text x="-160" y="-105" fill="#22d3ee" font-family="monospace" font-weight="bold" font-size="10" opacity="0.8">LOAD: 72%</text>
          <text x="110" y="145" fill="#f43f5e" font-family="monospace" font-weight="black" font-size="10" opacity="0.9">DANGERZONE</text>
          
          <!-- Direction vectors arrows -->
          <path d="M 100,-60 L 50,-30" fill="none" stroke="#22d3ee" stroke-width="1.5" stroke-dasharray="3,3" stroke-linecap="round" />
          <polygon points="50,-30 58,-34 52,-26" fill="#22d3ee" />
        </g>
      `;
      break;

    case 'defender-13k':
      gridMarkup = `
        <!-- Epic Combat Tactical Grid -->
        <pattern id="grid-defender" width="32" height="32" patternUnits="userSpaceOnUse">
          <rect width="32" height="32" fill="none" stroke="#6366f1" stroke-width="1" stroke-opacity="0.08" />
        </pattern>
        <rect width="512" height="512" fill="url(#grid-defender)" />
        <circle cx="256" cy="210" r="160" fill="none" stroke="#a855f7" stroke-dasharray="8,6" stroke-width="1.5" stroke-opacity="0.2" />
        <circle cx="256" cy="210" r="230" fill="none" stroke="#a855f7" stroke-width="1" stroke-opacity="0.1" />
      `;
      artMarkup = `
        <g transform="translate(256, 210)">
          <!-- Core Central Glowing Base under protection -->
          <g filter="drop-shadow(0 0 16px #415fff)">
            <ellipse cx="0" cy="0" rx="35" ry="35" fill="none" stroke="#ffffff" stroke-width="4" />
            <circle cx="0" cy="0" r="24" fill="#4f46e5" />
            <polygon points="0,-16 13,-6 8,10 -8,10 -13,-6" fill="#00f3ff" />
          </g>
          
          <!-- Glowing Hexagonal Shield Boundary protecting core -->
          <polygon points="0,-70 60,-35 60,35 0,70 -60,35 -60,-35" fill="none" stroke="#22d3ee" stroke-width="2.5" stroke-dasharray="10,8" opacity="0.8" filter="drop-shadow(0 0 8px #22d3ee)" />

          <!-- Powerful Defense Turrets strategically placed -->
          <!-- Turret 1 (Laser Cannon firing up right) -->
          <g transform="translate(-75, -75) rotate(-45)">
            <rect x="-12" y="-12" width="24" height="24" rx="4" fill="#1e1e38" stroke="#f43f5e" stroke-width="3" />
            <!-- Cannon barrels -->
            <rect x="-7" y="-28" width="5" height="18" fill="#f43f5e" />
            <rect x="2" y="-28" width="5" height="18" fill="#f43f5e" />
            <!-- Fire muzzle flash -->
            <polygon points="-8,-28 0,-42 8,-28" fill="#facc15" />
            <!-- Giant red laser beam striking an enemy -->
            <line x1="0" y1="-28" x2="0" y2="-130" stroke="#f43f5e" stroke-width="4" stroke-linecap="round" filter="drop-shadow(0 0 6px #f43f5e)" />
          </g>

          <!-- Turret 2 (Flak Railgun firing up left) -->
          <g transform="translate(85, -60) rotate(35)">
            <rect x="-14" y="-10" width="28" height="20" rx="3" fill="#1e1e38" stroke="#10b981" stroke-width="3" />
            <line x1="0" y1="-10" x2="0" y2="-32" stroke="#10b981" stroke-width="6" />
            <!-- Cyan energy burst ray -->
            <line x1="0" y1="-32" x2="0" y2="-150" stroke="#00ffff" stroke-dasharray="25,15" stroke-width="3" filter="drop-shadow(0 0 6px #00ffff)" />
          </g>

          <!-- Enemies (Magenta alien virus crawlers trying to breach the wall) -->
          <!-- Enemy 1 (About to be roasted by target laser) -->
          <g transform="translate(-160, -160)">
            <polygon points="0,-14 12,6 -12,6" fill="#d946ef" stroke="#ffffff" stroke-width="1.5" />
            <circle cx="0" cy="0" r="16" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,3" />
            <!-- Disintegration sparks -->
            <circle cx="-12" cy="-12" r="3" fill="#facc15" />
            <circle cx="15" cy="10" r="2.5" fill="#facc15" />
          </g>

          <!-- Enemy 2 (A heavy armored geometric grid monster) -->
          <g transform="translate(150, -115)">
            <rect x="-12" y="-12" width="24" height="24" fill="#a855f7" stroke="#ffffff" stroke-width="2" />
            <!-- Multiple legs -->
            <line x1="-12" y1="-12" x2="-22" y2="-18" stroke="#a855f7" stroke-width="2" />
            <line x1="12" y1="-12" x2="22" y2="-18" stroke="#a855f7" stroke-width="2" />
            <line x1="-12" y1="12" x2="-22" y2="18" stroke="#a855f7" stroke-width="2" />
            <line x1="12" y1="12" x2="22" y2="18" stroke="#a855f7" stroke-width="2" />
          </g>

          <!-- Enemy 3 (Fast scout virus approaching bottom) -->
          <g transform="translate(-110, 80)">
            <polygon points="-12,0 0,-12 12,0 0,12" fill="#ec4899" />
          </g>

          <!-- Combat HUD Details overlay -->
          <text x="-160" y="130" fill="#10b981" font-family="monospace" font-weight="black" font-size="11">WAVE 13</text>
          <text x="-160" y="145" fill="#38bdf8" font-family="monospace" font-weight="bold" font-size="9">SCORE 48,220</text>
          <text x="60" y="140" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="10" opacity="0.75">[DEFEND_SECURE]</text>
        </g>
      `;
      break;

    case 'z-typer':
      gridMarkup = `
        <!-- Modern matrix text console coordinate system -->
        <line x1="0" y1="360" x2="512" y2="360" stroke="#10b981" stroke-width="1.5" stroke-opacity="0.3" />
        <pattern id="matrix-typer" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="none" stroke="#10b981" stroke-width="1" stroke-opacity="0.04" />
        </pattern>
        <rect width="512" height="512" fill="url(#matrix-typer)" />
      `;
      artMarkup = `
        <g transform="translate(0, 0)">
          <!-- Falling Hostile Spaceship Words -->
          <!-- Word 1: "EXPLODE" in magenta capsule at the top -->
          <g transform="translate(140, 100)">
            <rect x="-56" y="-18" width="112" height="32" rx="8" fill="#1e1b4b" stroke="#ec4899" stroke-width="2.5" />
            <text x="0" y="-1" fill="#ec4899" font-family="monospace" font-weight="black" font-size="15" tracking="widester" text-anchor="middle" dominant-baseline="central">EXPLODE</text>
            <!-- Threat indicator arrow -->
            <polygon points="-75,0 -65,-8 -65,8" fill="#ec4899" />
          </g>

          <!-- Word 2: "ATTACK" in hot-pink capsule being blasted -->
          <g transform="translate(360, 150)">
            <!-- Highlighted/Typed letters: "A-T-T" typed in neon green, rest "A-C-K" in cyan -->
            <rect x="-50" y="-18" width="100" height="32" rx="8" fill="#0f172a" stroke="#00ffff" stroke-width="2.5" filter="drop-shadow(0 0 8px #00ffff)" />
            <!-- Typed part -->
            <text x="-15" y="-1" fill="#10b981" font-family="monospace" font-weight="black" font-size="15" text-anchor="middle" dominant-baseline="central">ATT</text>
            <!-- Remainder part -->
            <text x="22" y="-1" fill="#ffffff" font-family="monospace" font-weight="black" font-size="15" text-anchor="middle" dominant-baseline="central">ACK</text>
            <circle cx="-38" cy="0" r="4.5" fill="#10b981" />
          </g>

          <!-- Word 3: "LASER" getting completely vaporized -->
          <g transform="translate(256, 250)">
            <rect x="-42" y="-18" width="84" height="32" rx="8" fill="#111827" stroke="#10b981" stroke-width="3" filter="drop-shadow(0 0 12px #10b981)" />
            <text x="0" y="-1" fill="#ffffff" font-family="monospace" font-weight="black" font-size="16" letter-spacing="4" text-anchor="middle" dominant-baseline="central">LASER</text>
            <!-- Spark explosions around word -->
            <circle cx="-50" cy="-22" r="3" fill="#eab308" />
            <circle cx="55" cy="18" r="4" fill="#eab308" />
            <circle cx="45" cy="-25" r="2.5" fill="#f43f5e" />
          </g>

          <!-- Player's central tactical keyboard/laser vessel at the bottom -->
          <g transform="translate(256, 420)">
            <!-- Thruster wings shape -->
            <polygon points="-45,28 0,-32 45,28 0,16" fill="#1f2937" stroke="#10b981" stroke-width="3.5" />
            <polygon points="-20,12 0,-20 20,12" fill="#10b981" fill-opacity="0.8" />
            <circle cx="0" cy="5" r="8" fill="#ffffff" />
            
            <!-- Dual neon green shooting beams hitting "LASER" directly -->
            <line x1="-15" y1="-10" x2="0" y2="-152" stroke="#10b981" stroke-width="4" filter="drop-shadow(0 0 8px #10b981)" />
            <line x1="15" y1="-10" x2="0" y2="-152" stroke="#10b981" stroke-width="4" filter="drop-shadow(0 0 8px #10b981)" />

            <!-- Engine plasma jet -->
            <polygon points="-10,26 0,48 10,26" fill="#ea580c" />
            <polygon points="-5,26 0,38 5,26" fill="#facc15" />
          </g>

          <!-- Cyberpunk overlay HUD elements -->
          <text x="35" y="475" fill="#10b981" font-family="monospace" font-weight="black" font-size="12" opacity="0.85">WPM: 82</text>
          <text x="400" y="475" fill="#10b981" font-family="monospace" font-weight="bold" font-size="12" opacity="0.85">ACC: 98%</text>
          <rect x="120" y="465" width="220" height="12" rx="4" fill="#111827" stroke="#10b981" stroke-width="1.2" stroke-opacity="0.5" />
          <rect x="122" y="467" width="168" height="8" rx="2.5" fill="#10b981" />
        </g>
      `;
      break;

    default:
      // CATEGORY-SPECIFIC & INTELLIGENT KEYWORD FALLBACK CLASSIFIER
      // This builds distinct illustrations dynamically for the remaining 50 games!
      const lowerId = id.toLowerCase();
      const lowerTitle = id.replace(/-/g, ' ');

      if (lowerId.includes('racer') || lowerId.includes('racing') || lowerId.includes('drift') || lowerId.includes('highway') || lowerId.includes('drive') || lowerId.includes('rally')) {
        // RACING THEME: Neon high-end sports drift wheel, speed curves
        gridMarkup = `
          <g stroke="#ffffff" stroke-width="2" stroke-opacity="0.06">
            <line x1="0" y1="210" x2="512" y2="210" />
            <line x1="256" y1="0" x2="256" y2="512" />
          </g>
        `;
        artMarkup = `
          <g transform="translate(256, 210)">
            <!-- Formula tyre rim wireframe -->
            <circle cx="0" cy="0" r="115" fill="none" stroke="${palette.to}" stroke-width="8" stroke-opacity="0.4" />
            <circle cx="0" cy="0" r="80" fill="none" stroke="#ffffff" stroke-width="3.5" />
            <!-- Racing rim spokes -->
            <g stroke="#ffffff" stroke-width="5" opacity="0.85">
               <line x1="0" y1="-80" x2="0" y2="80" />
               <line x1="-80" y1="0" x2="80" y2="0" />
               <line x1="-56" y1="-56" x2="56" y2="56" />
               <line x1="56" y1="-56" x2="-56" y2="56" />
            </g>
            <circle cx="0" cy="0" r="18" fill="${palette.from}" />

            <!-- Drift smoke curves wrapping wheel -->
            <path d="M -145,55 Q -40,115 110,65" fill="none" stroke="#22d3ee" stroke-width="7.5" stroke-linecap="round" filter="drop-shadow(0 0 4px #22d3ee)" />
            <path d="M -125,85 Q -30,135 90,95" fill="none" stroke="${palette.from}" stroke-width="4.5" stroke-linecap="round" />
          </g>
        `;
      }
      else if (lowerId.includes('space') || lowerId.includes('sky') || lowerId.includes('alien') || lowerId.includes('star') || lowerId.includes('asteroid') || lowerId.includes('galaxy') || lowerId.includes('defender')) {
        // SCI-FI & SPACE SYSTEM: concentric galaxy planet with ring, mini ships
        let stars = '';
        for (let i = 0; i < 9; i++) {
          const sx = ((hash + i * 59) % 320) - 160;
          const sy = ((hash * i + 101) % 300) - 150;
          stars += `<circle cx="${sx}" cy="${sy}" r="${(i % 2) + 1}" fill="#ffffff" fill-opacity="0.8" />`;
        }
        gridMarkup = `
          <g transform="translate(256, 210)">${stars}</g>
        `;
        artMarkup = `
          <g transform="translate(256, 215)">
            <!-- Space Gas Planet -->
            <circle cx="-10" cy="-10" r="58" fill="url(#planet-grad-${id})" />
            
            <!-- Planetary dust belt rings -->
            <ellipse cx="-10" cy="-10" rx="115" ry="24" fill="none" stroke="${palette.from}" stroke-width="7" stroke-opacity="0.8" transform="rotate(-15)" />
            <ellipse cx="-10" cy="-10" rx="95" ry="16" fill="none" stroke="#ffffff" stroke-width="2" stroke-opacity="0.9" transform="rotate(-15)" />

            <!-- Sleek starfighter flying outwards -->
            <g transform="translate(45, 35) rotate(45)">
               <polygon points="0,-32 12,12 0,4 -12,12" fill="#ffffff" stroke="${palette.to}" stroke-width="2" />
               <line x1="0" y1="4" x2="0" y2="24" stroke="#ef4444" stroke-width="3" />
            </g>
          </g>
          <defs>
             <radialGradient id="planet-grad-${id}" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="65%" stop-color="${palette.to}" />
                <stop offset="100%" stop-color="#020617" />
             </radialGradient>
          </defs>
        `;
      }
      else if (lowerId.includes('shoot') || lowerId.includes('gun') || lowerId.includes('shot') || lowerId.includes('death') || lowerId.includes('raid') || lowerId.includes('combat') || lowerId.includes('fighter') || lowerId.includes('clash') || lowerId.includes('war')) {
        // COMBAT & ACTION THEME: Sleek shield emblem, neon crossed lasers
        gridMarkup = `
          <pattern id="combat-grid-${id}" width="40" height="40" patternUnits="userSpaceOnUse">
             <line x1="0" y1="0" x2="40" y2="40" stroke="#f43f5e" stroke-width="1.2" stroke-opacity="0.04" />
          </pattern>
          <rect width="512" height="512" fill="url(#combat-grid-${id})" />
        `;
        artMarkup = `
          <g transform="translate(256, 210)">
            <!-- Laser vectors crossed -->
            <line x1="-125" y1="-125" x2="125" y2="125" stroke="#f43f5e" stroke-width="5" filter="drop-shadow(0 0 4px #f43f5e)" />
            <line x1="125" y1="-125" x2="-125" y2="125" stroke="#00f5ff" stroke-width="5" filter="drop-shadow(0 0 4px #00f5ff)" />
            
            <!-- Metallic cyber shield center -->
            <polygon points="0,-68 46,-32 46,36 0,72 -46,36 -46,-32" fill="#1e1b4b" stroke="#ffffff" stroke-width="4.5" />
            
            <!-- Radiant star logo -->
            <polygon points="0,-32 8,-8 32,-8 12,6 18,28 0,14 -18,28 -12,6 -32,-8 -8,-8" fill="${palette.from}" />
          </g>
        `;
      }
      else if (lowerId.includes('puzzle') || lowerId.includes('brick') || lowerId.includes('block') || lowerId.includes('solit') || lowerId.includes('board') || lowerId.includes('card') || lowerId.includes('match') || lowerId.includes('alchemy') || lowerId.includes('elements')) {
        // PUZZLE THEME: Intersecting glossy puzzle loops, geometric links
        gridMarkup = `
          <pattern id="puz-dot-${id}" width="20" height="20" patternUnits="userSpaceOnUse">
             <circle cx="10" cy="10" r="1.3" fill="#ffffff" fill-opacity="0.06" />
          </pattern>
          <rect width="512" height="512" fill="url(#puz-dot-${id})" />
        `;
        artMarkup = `
          <g transform="translate(256, 205)">
            <!-- Interleaved colored transparent gears / blocks -->
            <rect x="-85" y="-85" width="110" height="110" rx="20" fill="${palette.from}" fill-opacity="0.4" stroke="${palette.from}" stroke-width="4" />
            <rect x="-25" y="-25" width="110" height="110" rx="20" fill="${palette.to}" fill-opacity="0.5" stroke="${palette.to}" stroke-width="4" />
            
            <!-- Connecting circuit tracks -->
            <g stroke="#ffffff" stroke-width="2.5" opacity="0.75" fill="none" stroke-linecap="round">
               <path d="M -85,-85 L 85,85" stroke-dasharray="8,6" />
               <circle cx="-85" cy="-85" r="8" fill="#ffffff" />
               <circle cx="85" cy="85" r="8" fill="${palette.from}" />
            </g>
          </g>
        `;
      }
      else if (lowerId.includes('knight') || lowerId.includes('wizard') || lowerId.includes('adventure') || lowerId.includes('conquest') || lowerId.includes('kingdom') || lowerId.includes('dante')) {
        // MEDIEVAL & STRATEGY EMPIRE: Gold crown, glowing gemstone jewel
        gridMarkup = `
          <pattern id="empire-hex-${id}" width="28" height="48.5" patternUnits="userSpaceOnUse">
             <path d="M 14 0 L 28 8.08 L 28 24.25 L 14 32.33 L 0 24.25 L 0 8.08 Z" fill="none" stroke="#fbbf24" stroke-width="1" stroke-opacity="0.04" />
          </pattern>
          <rect width="512" height="512" fill="url(#empire-hex-${id})" />
        `;
        artMarkup = `
          <g transform="translate(256, 210)">
            <!-- Ancient ritual circle -->
            <circle cx="0" cy="0" r="105" fill="none" stroke="${palette.from}" stroke-dasharray="14,10" stroke-width="3" opacity="0.65" />
            
            <!-- Radiant magical crystal amulet -->
            <polygon points="0,-82 42,0 0,82 -42,0" fill="${palette.to}" fill-opacity="0.4" stroke="#ffffff" stroke-width="4" />
            <polygon points="0,-48 24,0 0,48 -24,0" fill="#ffffff" opacity="0.85" />
            <circle cx="0" cy="0" r="14" fill="${palette.from}" />
          </g>
        `;
      }
      else if (lowerId.includes('edu') || lowerId.includes('type') || lowerId.includes('method') || lowerId.includes('kern') || lowerId.includes('life') || lowerId.includes('word') || lowerId.includes('math')) {
        // EDUCATIONAL & TYPING: Vector typography glyph guides, stylus pen
        gridMarkup = `
          <line x1="20" y1="210" x2="492" y2="210" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.2" />
          <line x1="20" y1="280" x2="492" y2="280" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.08" />
          <line x1="20" y1="140" x2="492" y2="140" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.08" />
        `;
        artMarkup = `
          <g transform="translate(256, 210)">
            <!-- Stylized serif letter vector blueprint drawing -->
            <text x="-15" y="45" fill="none" stroke="${palette.from}" stroke-width="3.5" font-family="'Times New Roman', Times, serif" font-weight="900" font-size="145" text-anchor="middle">A</text>
            <text x="-15" y="45" fill="#ffffff" font-family="'Times New Roman', Times, serif" font-weight="900" font-size="145" text-anchor="middle" opacity="0.4">A</text>
            
            <!-- Bezier tangent lines -->
            <g stroke="#38bdf8" stroke-width="2" fill="none">
               <line x1="-80" y1="-50" x2="-20" y2="-50" />
               <circle cx="-80" cy="-50" r="5" fill="#38bdf8" />
               <circle cx="-20" cy="-50" r="5" fill="#ffffff" />
            </g>
          </g>
        `;
      }
      else {
        // GENERAL ARCADE, MASHUP & RETRO CASUAL DEFAULT: Gaming retro arcade cabinet controller unit
        gridMarkup = `
          <pattern id="arc-dots-${id}" width="28" height="28" patternUnits="userSpaceOnUse">
             <circle cx="14" cy="14" r="1.5" fill="#ffffff" fill-opacity="0.08" />
          </pattern>
          <rect width="512" height="512" fill="url(#arc-dots-${id})" />
        `;
        artMarkup = `
          <g transform="translate(256, 210)">
             <!-- Retro joystick sphere -->
             <circle cx="-45" cy="-35" r="34" fill="#ef4444" filter="drop-shadow(0 6px 12px rgba(239, 68, 68, 0.45))" />
             <!-- Joystick shaft -->
             <line x1="-45" y1="-5" x2="-20" y2="45" stroke="#94a3b8" stroke-width="12" stroke-linecap="round" />
             <!-- Joystick base -->
             <ellipse cx="-20" cy="48" rx="34" ry="14" fill="#334155" />

             <!-- Neon fire-buttons action pads -->
             <circle cx="55" cy="5" r="16" fill="#eab308" stroke="#ffffff" stroke-width="2.5" />
             <circle cx="95" cy="35" r="13" fill="#06b6d4" stroke="#ffffff" stroke-width="2" />
          </g>
        `;
      }
      break;
  }

  return { grid: gridMarkup, art: artMarkup };
}

// Generative illustration compiler
function generateSVG(title: string, category: string, id: string): string {
  const hash = getHash(id);
  const paletteIndex = hash % PALETTES.length;
  const palette = PALETTES[paletteIndex];
  
  const { grid, art } = getArtworkMarkup(id, palette, hash);

  // Generate finalized premium arcade store layout
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg-grad-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070712" />
      <stop offset="50%" stop-color="#0f0e21" />
      <stop offset="100%" stop-color="#04040a" />
    </linearGradient>
    <linearGradient id="glow-grad-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.from}" stop-opacity="0.35" />
      <stop offset="100%" stop-color="${palette.to}" stop-opacity="0.0" />
    </linearGradient>
  </defs>

  <!-- Deep Velvet Space Background -->
  <rect width="512" height="512" fill="url(#bg-grad-${id})" />

  <!-- Radial lighting corona -->
  <circle cx="256" cy="220" r="230" fill="url(#glow-grad-${id})" filter="blur(36px)" />
  <circle cx="256" cy="220" r="115" fill="${palette.to}" fill-opacity="0.18" filter="blur(48px)" />

  <!-- Dedicated Procedural Grid Background -->
  ${grid}

  <!-- Extremely fine, premium border frames -->
  <rect x="18" y="18" width="476" height="476" rx="34" fill="none" stroke="${palette.from}" stroke-width="2.5" stroke-opacity="0.18" />
  <rect x="22" y="22" width="468" height="468" rx="30" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.06" />

  <!-- Detached High-Fidelity Custom Theme Art Core -->
  ${art}

  <!-- Ambient Bottom Shadow Blend to maximize overlaying HTML text readabilities -->
  <rect x="18" y="290" width="476" height="204" fill="url(#vignette-${id})" rx="34" style="mix-blend-mode: multiply;" />
  <defs>
    <linearGradient id="vignette-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0" />
      <stop offset="50%" stop-color="#000000" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.98" />
    </linearGradient>
  </defs>
</svg>`;
}

// Generate the 10 categories 
const requiredCategories = [
  "Puzzle", "Action", "Arcade", "Racing", "Adventure", 
  "Strategy", "Sports", "Platformer", "Multiplayer", "Educational"
];

console.log("Generating 10 custom category fallback assets...");
requiredCategories.forEach((cat) => {
  const filePath = path.join(categoriesDir, `${cat.toLowerCase()}.svg`);
  const svgContent = generateSVG(`${cat} Hub`, cat, `cat-${cat.toLowerCase()}`);
  fs.writeFileSync(filePath, svgContent, 'utf8');
});

// Generate game-specific local thumbnails
console.log("Generating " + GAMES.length + " high-fidelity localized game vector assets...");
GAMES.forEach((game) => {
  const filename = `${game.id}.svg`;
  const filePath = path.join(gamesDir, filename);
  const svgContent = generateSVG(game.title, game.category || "Arcade", game.id);
  fs.writeFileSync(filePath, svgContent, 'utf8');
});

console.log("Migration Successful! All 70 vector files have been generated at public/images/ categories and games folders.");

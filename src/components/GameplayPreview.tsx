import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface GameplayPreviewProps {
  category: string;
  isDarkMode: boolean;
  gameTitle?: string;
}

export function GameplayPreview({ category, isDarkMode, gameTitle = 'Game' }: GameplayPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = canvas.offsetWidth || 300;
    let height = canvas.height = canvas.offsetHeight || 375;

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = canvas.offsetWidth || 300;
        height = canvas.height = canvas.offsetHeight || 375;
      }
    };
    
    // Resize Observer for fluid responsiveness
    const resizeObserver = new ResizeObserver(() => handleResize());
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Generic variables for simulations
    let frame = 0;
    const lowerCategory = category.toLowerCase();

    // Setup Category-Specific Simulation State Variables
    // 1. RUNNER / ARCADE SIMULATOR
    const runnerState = {
      playerY: height * 0.7,
      playerTargetY: height * 0.7,
      isJumping: false,
      score: 0,
      obstacles: [] as { x: number; size: number; speed: number }[],
      coins: [] as { x: number; y: number; active: boolean }[],
      stars: [] as { x: number; y: number; size: number; speed: number }[]
    };

    // Initialize runner stars
    for (let i = 0; i < 15; i++) {
      runnerState.stars.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.6,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 1.5 + 0.5
      });
    }

    // 2. ACTION / SHOOTER SIMULATOR
    const actionState = {
      playerX: width / 2,
      playerDir: 1,
      lasers: [] as { x: number; y: number; speed: number }[],
      invaders: [] as { x: number; y: number; size: number; id: number; color: string; alive: boolean }[],
      particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
      score: 0
    };

    // Populate action invaders
    const initActionInvaders = () => {
      actionState.invaders = [];
      const cols = 4;
      const rows = 3;
      const spacingX = width / (cols + 1);
      const spacingY = 25;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const hue = (c * 60 + r * 30) % 360;
          actionState.invaders.push({
            x: spacingX * (c + 1),
            y: 40 + r * spacingY,
            size: 10,
            id: r * cols + c,
            color: `hsla(${hue}, 85%, 60%, 0.8)`,
            alive: true
          });
        }
      }
    };
    initActionInvaders();

    // 3. PUZZLE / STRATEGY
    const puzzleState = {
      blocks: [] as { r: number; c: number; value: number; currentX: number; currentY: number; targetX: number; targetY: number; scale: number }[],
      gridSize: 3,
      moveTimer: 0
    };

    // Populate puzzle blocks
    const initPuzzleBlocks = () => {
      puzzleState.blocks = [];
      const cellSize = Math.min(width, height) / 4.5;
      const startX = (width - cellSize * 3) / 2;
      const startY = (height - cellSize * 3) / 2;

      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (Math.random() > 0.3) {
            const x = startX + c * cellSize + cellSize / 2;
            const y = startY + r * cellSize + cellSize / 2;
            puzzleState.blocks.push({
              r,
              c,
              value: Math.pow(2, Math.floor(Math.random() * 4) + 1),
              currentX: x,
              currentY: y,
              targetX: x,
              targetY: y,
              scale: 1
            });
          }
        }
      }
    };
    initPuzzleBlocks();

    // 4. RACING / DRIVING SIMULATOR
    const racingState = {
      carX: width / 2,
      carTargetX: width / 2,
      roadOffset: 0,
      curves: [] as number[],
      speed: 4
    };

    // Math curve points for driving
    for (let i = 0; i < 100; i++) {
      racingState.curves.push(Math.sin(i * 0.1) * 40);
    }

    // 5. SPORTS / CASUAL / OBBY SIMULATOR
    const sportsState = {
      ballX: width / 2,
      ballY: height / 3,
      vx: 3,
      vy: 0,
      gravity: 0.15,
      bounce: -0.75,
      hoopX: width - 40,
      hoopY: height * 0.4,
      hoopWidth: 24,
      points: 0,
      trail: [] as { x: number; y: number; alpha: number }[]
    };

    // Master Animation Loop
    const draw = () => {
      frame++;
      
      // Clear with specialized theme overlay
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = isDarkMode ? '#0b0b16' : '#fafafa';
      ctx.fillRect(0, 0, width, height);

      // Render aesthetic Cyber Grid background lines
      ctx.strokeStyle = isDarkMode ? 'rgba(157, 92, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 20;
      for (let x = frame % gridSize; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // SELECTOR BASED ON CATEGORY
      if (lowerCategory.includes('puzzle') || lowerCategory.includes('strategy') || lowerCategory.includes('board')) {
        // PUZZLE ANIMATOR
        const cellSize = Math.min(width, height) / 4.5;
        const startX = (width - cellSize * 3) / 2;
        const startY = (height - cellSize * 3) / 2;

        // Draw background layout
        ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0,0,0,0.03)';
        ctx.fillRect(startX - 10, startY - 10, cellSize * 3 + 20, cellSize * 3 + 20);

        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0,0,0,0.05)';
            ctx.fillRect(startX + c * cellSize + 4, startY + r * cellSize + 4, cellSize - 8, cellSize - 8);
          }
        }

        // Move simulation periodically
        puzzleState.moveTimer++;
        if (puzzleState.moveTimer % 90 === 0) {
          // Shuffle or spawn
          puzzleState.blocks.forEach(b => {
            const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            const d = dirs[Math.floor(Math.random() * dirs.length)];
            b.r = Math.max(0, Math.min(2, b.r + d[0]));
            b.c = Math.max(0, Math.min(2, b.c + d[1]));
            b.targetX = startX + b.c * cellSize + cellSize / 2;
            b.targetY = startY + b.r * cellSize + cellSize / 2;
            b.scale = 1.25;
          });
        }

        // Update blocks and render
        puzzleState.blocks.forEach(b => {
          b.currentX += (b.targetX - b.currentX) * 0.15;
          b.currentY += (b.targetY - b.currentY) * 0.15;
          b.scale += (1 - b.scale) * 0.1;

          const size = (cellSize - 12) * b.scale;
          const x = b.currentX - size / 2;
          const y = b.currentY - size / 2;

          // Color palette mapped from value
          const hue = (Math.log2(b.value) * 45) % 360;
          ctx.fillStyle = `hsla(${hue}, 80%, 55%, 0.85)`;
          ctx.beginPath();
          ctx.roundRect?.(x, y, size, size, 8);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(b.value), b.currentX, b.currentY);
        });

      } else if (lowerCategory.includes('action') || lowerCategory.includes('adventure') || lowerCategory.includes('arcade') || lowerCategory.includes('multiplayer')) {
        // ACTION / SHOOTER ANIMATOR
        // Move player spaceship back and forth
        actionState.playerX += actionState.playerDir * 1.5;
        if (actionState.playerX > width - 30) {
          actionState.playerDir = -1;
        } else if (actionState.playerX < 30) {
          actionState.playerDir = 1;
        }

        // Periodically shoot lasers
        if (frame % 25 === 0) {
          actionState.lasers.push({
            x: actionState.playerX,
            y: height - 40,
            speed: 5
          });
        }

        // Draw player spaceship
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.moveTo(actionState.playerX, height - 35);
        ctx.lineTo(actionState.playerX - 10, height - 20);
        ctx.lineTo(actionState.playerX + 10, height - 20);
        ctx.closePath();
        ctx.fill();

        // Draw propulsion flare flame
        ctx.fillStyle = '#ff6b35';
        ctx.beginPath();
        ctx.moveTo(actionState.playerX - 4, height - 20);
        ctx.lineTo(actionState.playerX, height - 12 - (frame % 6));
        ctx.lineTo(actionState.playerX + 4, height - 20);
        ctx.closePath();
        ctx.fill();

        // Update & draw lasers
        actionState.lasers.forEach((l, index) => {
          l.y -= l.speed;
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#0284c7';
          ctx.shadowBlur = 8;
          ctx.fillRect(l.x - 1.5, l.y, 3, 10);
          ctx.shadowBlur = 0; // reset

          // Laser hit checking
          actionState.invaders.forEach(inv => {
            if (inv.alive && Math.hypot(l.x - inv.x, l.y - inv.y) < inv.size + 4) {
              inv.alive = false;
              l.y = -999; // destroy laser
              actionState.score += 10;

              // Spawn particles explosion
              for (let p = 0; p < 8; p++) {
                actionState.particles.push({
                  x: inv.x,
                  y: inv.y,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  life: 20 + Math.random() * 10,
                  color: inv.color
                });
              }
            }
          });

          // Prune spent lasers
          if (l.y < 0) {
            actionState.lasers.splice(index, 1);
          }
        });

        // Update & draw action invaders
        let anyAlive = false;
        actionState.invaders.forEach(inv => {
          if (!inv.alive) return;
          anyAlive = true;

          // Tiny organic sway movement
          const swayX = Math.sin(frame * 0.05 + inv.id) * 4;
          const drawX = inv.x + swayX;

          ctx.fillStyle = inv.color;
          ctx.beginPath();
          ctx.arc(drawX, inv.y, inv.size, 0, Math.PI * 2);
          ctx.fill();

          // Tiny alien eyes
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(drawX - 3, inv.y - 2, 2, 2);
          ctx.fillRect(drawX + 1, inv.y - 2, 2, 2);
        });

        if (!anyAlive) {
          initActionInvaders();
        }

        // Draw particle explosions
        actionState.particles.forEach((p, idx) => {
          p.x += p.vx;
          p.y += p.vy;
          p.life--;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life / 30;
          ctx.fillRect(p.x, p.y, 2, 2);
          ctx.globalAlpha = 1.0;

          if (p.life <= 0) {
            actionState.particles.splice(idx, 1);
          }
        });

      } else if (lowerCategory.includes('rac') || lowerCategory.includes('drive')) {
        // RACING / DRIVING ROAD SIMULATOR
        const roadY = height * 0.45;
        const horizonX = width / 2;

        // Draw neon sunset/horizon line
        ctx.fillStyle = isDarkMode ? 'rgba(157, 92, 255, 0.1)' : 'rgba(0,0,0,0.05)';
        ctx.fillRect(0, 0, width, roadY);

        // Draw scrolling road perspective grids
        ctx.fillStyle = isDarkMode ? '#111022' : '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(horizonX - 10, roadY);
        ctx.lineTo(horizonX + 10, roadY);
        ctx.lineTo(width * 0.9, height);
        ctx.lineTo(width * 0.1, height);
        ctx.closePath();
        ctx.fill();

        // Curb colors toggling
        ctx.lineWidth = 4;
        const segmentCount = 10;
        for (let i = 0; i < segmentCount; i++) {
          const depth = (i + (frame * 0.3) % 1) / segmentCount;
          const currY = roadY + (height - roadY) * depth;
          const prevY = roadY + (height - roadY) * (i / segmentCount);
          const currW = 20 + (width * 0.72) * depth;
          const prevW = 20 + (width * 0.72) * (i / segmentCount);

          const isEven = (i + Math.floor(frame * 0.3)) % 2 === 0;
          ctx.strokeStyle = isEven ? '#ef4444' : '#ffffff';
          
          // Left Curb
          ctx.beginPath();
          ctx.moveTo(horizonX - prevW / 2, prevY);
          ctx.lineTo(horizonX - currW / 2, currY);
          ctx.stroke();

          // Right Curb
          ctx.beginPath();
          ctx.moveTo(horizonX + prevW / 2, prevY);
          ctx.lineTo(horizonX + currW / 2, currY);
          ctx.stroke();
        }

        // Formula racecar slide animation
        racingState.carTargetX = width / 2 + Math.sin(frame * 0.03) * (width * 0.2);
        racingState.carX += (racingState.carTargetX - racingState.carX) * 0.1;

        // Draw modern racer car back chassis
        const carY = height - 40;
        ctx.fillStyle = '#3b82f6'; // neon blue machine
        ctx.fillRect(racingState.carX - 15, carY, 30, 15);

        // Spoiler
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(racingState.carX - 18, carY - 4, 36, 4);

        // Tires
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(racingState.carX - 19, carY + 8, 5, 8);
        ctx.fillRect(racingState.carX + 14, carY + 8, 5, 8);

        // Glowing Brake Taillight bar
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 6;
        ctx.fillRect(racingState.carX - 12, carY + 1, 24, 3);
        ctx.shadowBlur = 0;

      } else {
        // FLATFORMER / RUNNER / CHILL SIMULATOR (Dfault for generic/sports/others)
        // Background elements scrolling
        ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0,0,0,0.04)';
        runnerState.stars.forEach(s => {
          s.x -= s.speed;
          if (s.x < 0) s.x = width;
          ctx.fillRect(s.x, s.y, s.size, s.size);
        });

        // Bouncing platform physics
        const floorY = height * 0.75;
        ctx.strokeStyle = isDarkMode ? '#1e1b4b' : '#cbd5e1';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, floorY);
        ctx.lineTo(width, floorY);
        ctx.stroke();

        // Runner obstacle mechanics
        if (frame % 100 === 0) {
          runnerState.obstacles.push({
            x: width + 20,
            size: 12 + Math.random() * 8,
            speed: 2.2
          });
        }

        runnerState.obstacles.forEach((obs, index) => {
          obs.x -= obs.speed;
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(obs.x, floorY);
          ctx.lineTo(obs.x - obs.size / 2, floorY - obs.size);
          ctx.lineTo(obs.x + obs.size / 2, floorY - obs.size);
          ctx.closePath();
          ctx.fill();

          // Collision checking for jumping trigger animation
          if (obs.x < width * 0.35 && obs.x > width * 0.15 && !runnerState.isJumping) {
            runnerState.isJumping = true;
            runnerState.playerTargetY = floorY - 60;
          }

          if (obs.x < -30) {
            runnerState.obstacles.splice(index, 1);
          }
        });

        // Coins floating
        if (frame % 80 === 0) {
          runnerState.coins.push({
            x: width + 10,
            y: floorY - 35 - Math.random() * 20,
            active: true
          });
        }

        runnerState.coins.forEach((c, index) => {
          c.x -= 2.2;
          if (c.active) {
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
            ctx.fill();

            // Gold aura
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(c.x, c.y, 6 + Math.sin(frame * 0.1) * 2, 0, Math.PI * 2);
            ctx.stroke();

            // Collect mechanics
            if (c.x < width * 0.28 && c.x > width * 0.20) {
              c.active = false;
              runnerState.score++;
            }
          }

          if (c.x < -10) {
            runnerState.coins.splice(index, 1);
          }
        });

        // Update jumping player
        if (runnerState.isJumping) {
          runnerState.playerY += (runnerState.playerTargetY - runnerState.playerY) * 0.15;
          if (Math.abs(runnerState.playerY - runnerState.playerTargetY) < 3) {
            if (runnerState.playerTargetY < floorY) {
              runnerState.playerTargetY = floorY; // begin descent
            } else {
              runnerState.isJumping = false;
            }
          }
        } else {
          runnerState.playerY += (floorY - runnerState.playerY) * 0.15;
        }

        // Draw runner character cube
        const drawPlayerY = runnerState.playerY - 14;
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.roundRect?.(width * 0.24 - 7, drawPlayerY, 14, 14, 3);
        ctx.fill();

        // Neon eyes representing face direction
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(width * 0.24 + 1, drawPlayerY + 3, 3, 2);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [category, isDarkMode]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-20 overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-cover rounded-xl md:rounded-2xl transition-all duration-300"
      />
      
      {/* Immersive Retro Scanning Overlays */}
      <div className="absolute inset-0 bg-scanlines mix-blend-overlay opacity-5 pointer-events-none" />
      <div className="absolute top-2.5 left-2.5 bg-accent/90 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-widest text-[#0b0b16] shadow-sm z-30 flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
        Gameplay Preview
      </div>
    </div>
  );
}

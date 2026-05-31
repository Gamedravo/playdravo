# Mobile Gameplay Audit

Generated: 2026-05-31T14:38:37.366Z

## Summary

| Metric | Value |
|--------|-------|
| Catalog size | 259 |
| Sample probed (embed HTTP) | 37 |
| Sample embed reachable | 37/37 |
| Touch risk (sample heuristic) | low 7, medium 28, high 2 |

## Root cause (portal — fixed)

- Removed touch-action: none (Tailwind touch-none) from game iframe
- Stopped setting document/body touchAction:none during theater mode
- touchmove preventDefault now skips events targeting iframe/player shell
- Pseudo-fullscreen top bar title no longer captures pointer events
- Mobile play no longer auto-enters theater mode (use fullscreen button)
- iframe allowFullScreen + touch-manipulation enabled

The iframe used `touch-none` (`touch-action: none`), which blocks touch delivery to embedded games on iOS/Android. Theater mode also set `touch-action: none` on `document.body` and called `preventDefault()` on all `touchmove` events, which interfered with in-game drags.

## Embed engines (catalog)

- **construct**: 56
- **unknown**: 97
- **unity-webgl**: 66
- **construct-cloud**: 40

## Sample probe (37 games)

| Game | Engine | Embed | Touch risk |
|------|--------|-------|------------|
| 2 Player Crazy Racer | unknown | OK | medium |
| Alien Sky Invasion | unknown | OK | medium |
| Army Driver | construct | OK | medium |
| Basketball King | construct | OK | medium |
| Burnout Drift Hunter | unknown | OK | medium |
| Checkout Frenzy | unity-webgl | OK | medium |
| Crazy Ball Adventures | unknown | OK | medium |
| Crazy Parking Fury | unknown | OK | medium |
| CubeCraft Survival | construct-cloud | OK | medium |
| Dockyard Tank Parking | unity-webgl | OK | medium |
| Drift Fury | unity-webgl | OK | medium |
| Egg Car Racing | construct | OK | low |
| Fast Food Manager | construct-cloud | OK | medium |
| Football King | construct | OK | low |
| Futuristic Racer | construct-cloud | OK | medium |
| Get On Top | unknown | OK | medium |
| Head Soccer Football | unity-webgl | OK | medium |
| Highway Traffic | unity-webgl | OK | medium |
| Jacks Village | unity-webgl | OK | medium |
| Kick the Alien | construct-cloud | OK | low |
| Legendary Sniper | unknown | OK | high |
| Mafia Getaway Cars | construct | OK | medium |
| Mob City | unknown | OK | medium |
| Moto Trials | unity-webgl | OK | medium |
| Nova Craft | construct-cloud | OK | medium |
| Pets Beauty Salon | unknown | OK | medium |
| Poop Clicker | construct | OK | low |
| Racing Cars 2 | unknown | OK | low |
| Run FreezeNova | unity-webgl | OK | medium |
| Snake Wars | unity-webgl | OK | medium |
| Speed Drift Racing | construct | OK | low |
| Stickman Destruction | unknown | OK | low |
| Super Car Driving | construct-cloud | OK | medium |
| Tank Arena | construct | OK | medium |
| Tractor Farming Simulator | unity-webgl | OK | medium |
| Unicorn Beauty Salon | unknown | OK | medium |
| Wasteland Shooters | unknown | OK | high |

## Working vs issues (honest scope)

**Portal layer:** After fixes, touch events should reach the iframe. Fullscreen remains available via the action bar.

**Per-game:** Many OnlineGames.io titles support tap (per their docs). Unity/Construct games vary. **Loading the embed does not prove touch works** — device QA is required for each engine class.

**Likely desktop-first (tag heuristic):** 20 titles flagged — see JSON for list.

## Device test checklist

1. Open game on phone → tap Play → tap inside game (not chrome UI)
2. Verify virtual buttons / drag / tap-to-jump
3. Tap fullscreen → confirm controls still work
4. Rotate device if game is landscape-first

Full data: `docs/mobile-gameplay-audit.json`

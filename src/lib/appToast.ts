import { toast as sonnerToast, type ExternalToast } from 'sonner';

let gameMode = false;
let lastToastAt = 0;
const MIN_TOAST_GAP_MS = 1500;
const QUEUE: Array<() => void> = [];
let draining = false;

export function setToastGameMode(enabled: boolean) {
  gameMode = enabled;
}

export function isToastGameMode() {
  return gameMode;
}

function drainQueue() {
  if (draining || QUEUE.length === 0) return;
  draining = true;
  const run = QUEUE.shift();
  if (run) {
    run();
    window.setTimeout(() => {
      draining = false;
      drainQueue();
    }, MIN_TOAST_GAP_MS);
  } else {
    draining = false;
  }
}

function enqueueToast(fn: () => void) {
  QUEUE.push(fn);
  // Limit queue size - drop oldest if too many pending
  if (QUEUE.length > 3) QUEUE.splice(0, QUEUE.length - 3);
  drainQueue();
}

function baseOptions(overrides?: ExternalToast): ExternalToast {
  const now = Date.now();
  lastToastAt = now;

  const isMobile = window.innerWidth < 768;

  return {
    duration: gameMode ? 2500 : (isMobile ? 3000 : 5000),
    classNames: {
      toast: gameMode 
        ? 'app-toast app-toast--game' 
        : (isMobile ? 'app-toast app-toast--mobile' : 'app-toast'),
      title: gameMode 
        ? 'app-toast-title app-toast-title--game' 
        : (isMobile ? 'app-toast-title app-toast-title--mobile' : 'app-toast-title'),
      description: gameMode 
        ? 'app-toast-desc app-toast-desc--game' 
        : (isMobile ? 'app-toast-desc app-toast-desc--mobile' : 'app-toast-desc'),
    },
    ...overrides,
  };
}

export const appToast = {
  message(title: string, overrides?: ExternalToast) {
    enqueueToast(() => sonnerToast(title, baseOptions(overrides)));
  },
  success(title: string, overrides?: ExternalToast) {
    enqueueToast(() => sonnerToast.success(title, baseOptions(overrides)));
  },
  info(title: string, overrides?: ExternalToast) {
    enqueueToast(() => sonnerToast.info(title, baseOptions(overrides)));
  },
  error(title: string, overrides?: ExternalToast) {
    enqueueToast(() => sonnerToast.error(title, baseOptions({ duration: 5000, ...overrides })));
  },
  /** Compact achievement toast - always shows at bottom, never covers gameplay */
  achievement(title: string, points?: number) {
    if (gameMode && QUEUE.length > 1) return; // Skip if queue is full during gameplay
    enqueueToast(() =>
      sonnerToast(title, baseOptions({
        description: points ? `+${points} XP` : undefined,
        duration: 3000,
        classNames: {
          toast: 'app-toast app-toast--achievement',
          title: 'app-toast-title app-toast-title--achievement',
          description: 'app-toast-desc app-toast-desc--achievement',
        },
      }))
    );
  },
  /** Drop low-priority toasts while playing */
  game(title: string, description?: string) {
    if (gameMode && QUEUE.length > 1) return;
    enqueueToast(() =>
      sonnerToast(title, baseOptions({
        description,
        duration: 2500,
        classNames: {
          toast: 'app-toast app-toast--game',
          title: 'app-toast-title app-toast-title--game',
          description: 'app-toast-desc app-toast-desc--game',
        },
      }))
    );
  },
};

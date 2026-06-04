import { toast as sonnerToast, type ExternalToast } from 'sonner';

let gameMode = false;
let lastToastAt = 0;
const MIN_TOAST_GAP_MS = 1200;
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
  if (QUEUE.length > 6) QUEUE.splice(0, QUEUE.length - 6);
  drainQueue();
}

function baseOptions(overrides?: ExternalToast): ExternalToast {
  const now = Date.now();
  if (now - lastToastAt < MIN_TOAST_GAP_MS && !overrides?.id) {
    /* spacing handled by queue */
  }
  lastToastAt = now;

  const isMobile = window.innerWidth < 768;

  return {
    duration: gameMode ? 3000 : (isMobile ? 4000 : 7500),
    position: gameMode ? 'bottom-center' : (isMobile ? 'top-center' : 'top-right'),
    classNames: {
      toast: gameMode ? 'app-toast app-toast--game' : (isMobile ? 'app-toast app-toast--mobile' : 'app-toast'),
      title: gameMode ? 'app-toast-title app-toast-title--game' : (isMobile ? 'app-toast-title app-toast-title--mobile' : 'app-toast-title'),
      description: gameMode ? 'app-toast-desc app-toast-desc--game' : (isMobile ? 'app-toast-desc app-toast-desc--mobile' : 'app-toast-desc'),
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
    enqueueToast(() => sonnerToast.error(title, baseOptions({ duration: 8000, ...overrides })));
  },
  /** Compact achievement toast - positioned at bottom during gameplay to avoid covering content */
  achievement(title: string, xp?: number, overrides?: ExternalToast) {
    enqueueToast(() =>
      sonnerToast(title, baseOptions({
        duration: 3500,
        position: 'bottom-center',
        classNames: {
          toast: 'app-toast app-toast--achievement',
          title: 'app-toast-title app-toast-title--achievement',
          description: 'app-toast-desc app-toast-desc--achievement',
        },
        description: xp ? `+${xp} XP` : undefined,
        ...overrides,
      }))
    );
  },
  /** Drop low-priority toasts while playing */
  game(title: string, description?: string) {
    if (gameMode && QUEUE.length > 2) return;
    enqueueToast(() =>
      sonnerToast(title, baseOptions({
        description,
        duration: 3000,
        position: 'bottom-center',
        classNames: {
          toast: 'app-toast app-toast--game',
          title: 'app-toast-title app-toast-title--game',
          description: 'app-toast-desc app-toast-desc--game',
        },
      }))
    );
  },
};

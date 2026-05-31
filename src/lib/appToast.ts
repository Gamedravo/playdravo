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

  return {
    duration: gameMode ? 5000 : 7500,
    classNames: {
      toast: gameMode ? 'app-toast app-toast--game' : 'app-toast',
      title: gameMode ? 'app-toast-title app-toast-title--game' : 'app-toast-title',
      description: gameMode ? 'app-toast-desc app-toast-desc--game' : 'app-toast-desc',
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
  /** Drop low-priority toasts while playing */
  game(title: string, description?: string) {
    if (gameMode && QUEUE.length > 2) return;
    enqueueToast(() =>
      sonnerToast(title, baseOptions({
        description,
        duration: 4500,
        classNames: {
          toast: 'app-toast app-toast--game',
          title: 'app-toast-title app-toast-title--game',
          description: 'app-toast-desc app-toast-desc--game',
        },
      }))
    );
  },
};

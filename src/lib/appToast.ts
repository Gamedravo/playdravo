let gameMode = false;

type ToastOptions = Record<string, unknown>;

export function setToastGameMode(enabled: boolean) {
  gameMode = enabled;
}

export function isToastGameMode() {
  return gameMode;
}

const noop = () => {
  // App toast popups are disabled by request.
};

export const appToast = {
  message(_title: string, _overrides?: ToastOptions) {
    noop();
  },
  success(_title: string, _overrides?: ToastOptions) {
    noop();
  },
  info(_title: string, _overrides?: ToastOptions) {
    noop();
  },
  error(_title: string, _overrides?: ToastOptions) {
    noop();
  },
  achievement(_title: string, _xp?: number, _overrides?: ToastOptions) {
    noop();
  },
  game(_title: string, _description?: string) {
    noop();
  },
};

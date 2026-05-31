import {
  signInWithPopup,
  type Auth,
  type AuthProvider,
  type UserCredential,
} from 'firebase/auth';

const OAUTH_TIMEOUT_MS = 90_000;
const POPUP_FOCUS_CANCEL_MS = 600;

export class AuthCancelledError extends Error {
  code = 'auth/popup-closed-by-user';
  constructor(message = 'Sign-in was cancelled.') {
    super(message);
    this.name = 'AuthCancelledError';
  }
}

function isBenignCancel(code?: string): boolean {
  return (
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request' ||
    code === 'auth/user-cancelled' ||
    code === 'auth/web-context-cancelled'
  );
}

export function isAuthCancelError(error: unknown): boolean {
  const code = (error as { code?: string })?.code;
  return isBenignCancel(code) || error instanceof AuthCancelledError;
}

/**
 * Popup OAuth — no redirect fallback (redirect never resolves in-place).
 * Detects popup dismiss via Firebase errors, focus return, and timeout.
 */
export async function signInWithOAuthPopup(
  auth: Auth,
  provider: AuthProvider
): Promise<UserCredential> {
  const uidBefore = auth.currentUser?.uid ?? null;
  let settled = false;
  let focusTimer: ReturnType<typeof setTimeout> | undefined;
  let onFocusHandler: (() => void) | undefined;

  const popupPromise = signInWithPopup(auth, provider);

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new AuthCancelledError('Sign-in timed out.')), OAUTH_TIMEOUT_MS);
  });

  const focusCancelPromise = new Promise<never>((_, reject) => {
    onFocusHandler = () => {
      if (focusTimer) clearTimeout(focusTimer);
      focusTimer = setTimeout(() => {
        if (settled) return;
        const uidAfter = auth.currentUser?.uid ?? null;
        if (uidAfter === uidBefore) {
          reject(new AuthCancelledError());
        }
      }, POPUP_FOCUS_CANCEL_MS);
    };
    window.addEventListener('focus', onFocusHandler);
  });

  try {
    const result = await Promise.race([popupPromise, timeoutPromise, focusCancelPromise]);
    settled = true;
    return result;
  } catch (error: unknown) {
    settled = true;
    if (isAuthCancelError(error)) {
      throw new AuthCancelledError();
    }
    throw error;
  } finally {
    if (focusTimer) clearTimeout(focusTimer);
    if (onFocusHandler) window.removeEventListener('focus', onFocusHandler);
  }
}

import {
  signInWithPopup,
  type Auth,
  type AuthProvider,
  type UserCredential,
} from 'firebase/auth';

const OAUTH_TIMEOUT_MS = 90_000;

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
 * Detects popup dismiss via Firebase errors and timeout.
 *
 * NOTE:
 * We intentionally avoid "focus-return" cancellation heuristics here because they can
 * falsely reject successful sign-ins on slower devices/networks, causing the UI to
 * appear logged-out until a manual refresh.
 *
 * IMPORTANT: After successful OAuth, Firebase's onAuthStateChanged should trigger
 * immediately. If it doesn't, the UI may appear logged-out until refresh.
 */
export async function signInWithOAuthPopup(
  auth: Auth,
  provider: AuthProvider
): Promise<UserCredential> {
  const popupPromise = signInWithPopup(auth, provider);

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new AuthCancelledError('Sign-in timed out.')), OAUTH_TIMEOUT_MS);
  });

  try {
    const result = await Promise.race([popupPromise, timeoutPromise]);
    // Force auth state to be current by checking currentUser
    // This helps ensure onAuthStateChanged triggers immediately
    if (auth.currentUser) {
      console.log('[OAuth] Auth state updated immediately, user:', auth.currentUser.uid);
    }
    return result;
  } catch (error: unknown) {
    if (isAuthCancelError(error)) {
      throw new AuthCancelledError();
    }
    throw error;
  }
}

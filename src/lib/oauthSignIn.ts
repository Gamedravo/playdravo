import {
  signInWithPopup,
  signInWithRedirect,
  type Auth,
  type AuthProvider,
  type UserCredential,
} from 'firebase/auth';

export class AuthCancelledError extends Error {
  code = 'auth/popup-closed-by-user';
  constructor(message = 'Sign-in was cancelled.') {
    super(message);
    this.name = 'AuthCancelledError';
  }
}

export function isAuthCancelError(error: unknown): boolean {
  const code = (error as { code?: string })?.code;
  return (
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request' ||
    code === 'auth/user-cancelled' ||
    code === 'auth/web-context-cancelled' ||
    error instanceof AuthCancelledError
  );
}

function shouldFallbackToRedirect(error: unknown): boolean {
  const code = (error as { code?: string })?.code;
  // Only redirect for popup-blocked errors. Do NOT redirect for auth/unauthorized-domain
  // because the redirect flow is also blocked when the domain isn't authorized.
  return (
    code === 'auth/popup-blocked' ||
    code === 'auth/operation-not-supported-in-this-environment' ||
    code === 'auth/cross-origin-anonymous-model' ||
    code === 'auth/web-storage-unsupported'
  );
}

export async function signInWithOAuthPopup(
  auth: Auth,
  provider: AuthProvider
): Promise<UserCredential> {
  try {
    return await signInWithPopup(auth, provider);
  } catch (error) {
    if (!shouldFallbackToRedirect(error)) {
      throw error;
    }

    await signInWithRedirect(auth, provider);
    return new Promise(() => {});
  }
}

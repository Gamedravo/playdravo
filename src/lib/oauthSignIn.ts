import {
  signInWithRedirect,
  type Auth,
  type AuthProvider,
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

/**
 * Triggers a full-page redirect to the OAuth provider.
 * The page navigates away — this promise never resolves.
 * Call getRedirectResult(auth) on the next page load to get the credential.
 */
export async function signInWithOAuthPopup(
  auth: Auth,
  provider: AuthProvider
): Promise<never> {
  await signInWithRedirect(auth, provider);
  return new Promise(() => {});
}

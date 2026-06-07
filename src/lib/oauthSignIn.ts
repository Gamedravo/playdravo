export class AuthCancelledError extends Error {
  code = 'auth/popup-closed-by-user';
  constructor(message = 'Sign-in was cancelled.') {
    super(message);
    this.name = 'AuthCancelledError';
  }
}

export function isAuthCancelError(error: unknown): boolean {
  return error instanceof AuthCancelledError;
}

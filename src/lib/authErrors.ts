import { toast } from 'sonner';
import { auth } from '../firebase';
import { isAuthCancelError } from './oauthSignIn';
import { SUPPORT_EMAIL } from './brandContact';

const PROVIDER_LABELS: Record<string, string> = {
  google: 'Google',
  microsoft: 'Microsoft',
  github: 'GitHub',
  email: 'Email',
};

const AUTH_ERROR_TITLES: Record<string, string> = {
  'auth/email-already-in-use': 'Email already in use',
  'auth/user-not-found': 'Account not found',
  'auth/wrong-password': 'Incorrect password',
  'auth/invalid-email': 'Invalid email address',
  'auth/too-many-requests': 'Too many attempts',
  'auth/requires-recent-login': 'Please re-authenticate',
  'auth/account-exists-with-different-credential': 'Account exists with a different sign-in method',
  'auth/popup-blocked': 'Popup blocked by browser',
  'auth/unauthorized-domain': 'Unauthorized domain',
  'auth/operation-not-allowed': 'Sign-in method not enabled',
};

function authErrorDescription(code: string, message: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account already exists with this email. Try signing in instead, or use "Forgot password?".';
    case 'auth/user-not-found':
      return 'No account exists for this email. Double-check the address or create a new account.';
    case 'auth/wrong-password':
      return 'That password is incorrect. Try again or use "Forgot password?" to reset it.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address (example: name@gamedravo.com).';
    case 'auth/too-many-requests':
      return 'We\u2019ve temporarily blocked requests from this device due to too many attempts. Please wait a few minutes and try again.';
    case 'auth/requires-recent-login':
      return 'For security, please sign in again and retry this action.';
    case 'auth/account-exists-with-different-credential':
      return 'This email is already linked to a different provider. Use the original method (Google/Microsoft/GitHub/Email) and then link accounts if needed.';
    case 'auth/popup-blocked':
      return 'Please allow popups, or open the app in a new tab to continue.';
    case 'auth/unauthorized-domain':
      return message;
    case 'auth/operation-not-allowed':
      return `${message}\n\nEnable this provider in Firebase Console (Authentication \u2192 Sign-in method).`;
    default:
      return message;
  }
}

export function handleAuthError(
  error: unknown,
  provider?: string,
  t?: (key: string) => string
): void {
  const err = error as { code?: string; message?: string };
  const code = err.code ?? 'unknown';
  const message = err.message ?? String(error);
  const label = provider ? PROVIDER_LABELS[provider] ?? provider : 'Authentication';
  const projectId = auth.app.options.projectId ?? 'unknown';

  if (code === 'auth/operation-not-allowed') {
    toast.error(`${label} login is not enabled.`, {
      description: `${code}: ${message}\n\nEnable this provider in Firebase Console (Authentication \u2192 Sign-in method).`,
      duration: 7000,
    });
    return;
  }

  if (code === 'auth/popup-blocked') {
    toast.error('Popup blocked by browser.', {
      description: 'Please allow popups or open the app in a new tab to log in.',
      duration: 6000,
    });
    return;
  }

  if (code === 'auth/unauthorized-domain') {
    toast.error('Unauthorized domain.', {
      description: `${code}: ${message}\n\nAdd ${window.location.hostname} to Firebase Authorized domains (include gamedravo.com). Project: ${projectId}`,
      duration: 6000,
    });
    return;
  }

  if (code === 'auth/web-storage-unsupported' || message?.includes('cookie')) {
    toast.error('Cookies Blocked', {
      description:
        'Your browser is blocking cookies. Please open the app in a new tab or enable cookies to log in.',
      duration: 8000,
    });
    return;
  }

  if (isAuthCancelError(error)) {
    return;
  }

  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return;
  }

  if (code === 'auth/account-exists-with-different-credential') {
    toast.error('An account already exists with this email using a different sign-in method.');
    return;
  }

  const title = AUTH_ERROR_TITLES[code] ?? (message || t?.('loginError') || 'Authentication failed.');
  const description = authErrorDescription(code, message);

  toast.error(title, {
    description:
      code !== 'unknown'
        ? `${code}\n\n${description}\n\nNeed help? Contact ${SUPPORT_EMAIL}`
        : `${description}\n\nNeed help? Contact ${SUPPORT_EMAIL}`,
    duration: 7000,
  });
}

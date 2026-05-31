import { toast } from 'sonner';
import { isAuthCancelError } from './oauthSignIn';

const PROVIDER_LABELS: Record<string, string> = {
  google: 'Google',
  microsoft: 'Microsoft',
  github: 'GitHub',
  phone: 'Phone',
  email: 'Email',
};

export function handleAuthError(
  error: unknown,
  provider?: string,
  t?: (key: string) => string
): void {
  const err = error as { code?: string; message?: string };
  const label = provider ? PROVIDER_LABELS[provider] ?? provider : 'Authentication';

  if (err.code === 'auth/operation-not-allowed') {
    toast.error(`${label} login is not enabled.`, {
      description:
        'Please enable this provider in Firebase Console (Authentication > Sign-in method).',
      duration: 6000,
    });
    return;
  }

  if (err.code === 'auth/popup-blocked') {
    toast.error('Popup blocked by browser.', {
      description: 'Please allow popups or open the app in a new tab to log in.',
      duration: 6000,
    });
    return;
  }

  if (err.code === 'auth/unauthorized-domain') {
    toast.error('Unauthorized domain.', {
      description: 'Please add this URL to your Firebase Authorized Domains.',
      duration: 6000,
    });
    return;
  }

  if (err.code === 'auth/web-storage-unsupported' || err.message?.includes('cookie')) {
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

  if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
    return;
  }

  if (err.code === 'auth/account-exists-with-different-credential') {
    toast.error('An account already exists with this email using a different sign-in method.');
    return;
  }

  toast.error(err.message || t?.('loginError') || 'Authentication failed.');
}

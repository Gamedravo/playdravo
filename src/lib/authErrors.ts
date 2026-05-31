import { toast } from 'sonner';
import { auth } from '../firebase';
import { isAuthCancelError } from './oauthSignIn';
import { isPhoneAuthDebugEnabled, phoneAuthLog } from './phoneAuth';
import { formatPhoneAuthErrorHint } from './phoneAuthDiagnostics';
import { SUPPORT_EMAIL } from './brandContact';

const PROVIDER_LABELS: Record<string, string> = {
  google: 'Google',
  microsoft: 'Microsoft',
  github: 'GitHub',
  phone: 'Phone',
  email: 'Email',
};

/** Short titles only — description always includes Firebase code + message for phone. */
const PHONE_ERROR_TITLES: Record<string, string> = {
  'auth/invalid-phone-number': 'Invalid phone number',
  'auth/missing-phone-number': 'Phone number is required',
  'auth/captcha-check-failed': 'reCAPTCHA verification failed',
  'auth/quota-exceeded': 'SMS quota exceeded',
  'auth/too-many-requests': 'Too many attempts',
  'auth/invalid-verification-code': 'Invalid verification code',
  'auth/code-expired': 'Verification code expired',
  'auth/recaptcha-container-missing': 'reCAPTCHA could not load',
  'auth/operation-not-allowed': 'Phone sign-in blocked',
  'auth/invalid-app-credential': 'Invalid app credential',
  'auth/configuration-not-found': 'Auth configuration not found',
  'auth/unauthorized-continue-uri': 'Unauthorized continue URL',
  'auth/missing-client-identifier': 'reCAPTCHA not ready',
  'auth/unauthorized-domain': 'Unauthorized domain',
};

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

  if (provider === 'phone') {
    phoneAuthLog('firebase', `handleAuthError: ${code}`, { message });

    const title = PHONE_ERROR_TITLES[code] ?? `Phone auth failed (${code})`;
    const hint = formatPhoneAuthErrorHint(code, projectId);
    const description = [code !== 'unknown' ? `${code}: ${message}` : message, hint]
      .filter(Boolean)
      .join('\n\n');

    toast.error(title, { description, duration: 9000 });
    return;
  }

  if (code === 'auth/operation-not-allowed') {
    toast.error(`${label} login is not enabled.`, {
      description: `${code}: ${message}\n\nEnable this provider in Firebase Console (Authentication → Sign-in method).`,
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
      description: isPhoneAuthDebugEnabled()
        ? `${code}: ${message}\n\nAdd ${window.location.hostname} to Firebase Authorized domains (include gamedravo.com). Project: ${projectId}`
        : `${code}: ${message}`,
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

  toast.error(message || t?.('loginError') || 'Authentication failed.', {
    description: code !== 'unknown' ? `${code}\n\nNeed help? Contact ${SUPPORT_EMAIL}` : `Need help? Contact ${SUPPORT_EMAIL}`,
    duration: 7000,
  });
}

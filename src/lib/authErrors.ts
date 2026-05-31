import { toast } from 'sonner';
import { isAuthCancelError } from './oauthSignIn';
import { isPhoneAuthDebugEnabled, phoneAuthLog } from './phoneAuth';
import { SUPPORT_EMAIL } from './brandContact';

const PROVIDER_LABELS: Record<string, string> = {
  google: 'Google',
  microsoft: 'Microsoft',
  github: 'GitHub',
  phone: 'Phone',
  email: 'Email',
};

const PHONE_ERROR_MESSAGES: Record<string, { title: string; description?: string }> = {
  'auth/invalid-phone-number': {
    title: 'Invalid phone number.',
    description: 'Use international format, e.g. +351912345678.',
  },
  'auth/missing-phone-number': {
    title: 'Phone number is required.',
  },
  'auth/captcha-check-failed': {
    title: 'reCAPTCHA verification failed.',
    description: 'Refresh the page and try again. Ensure gamedravo.com is in Firebase Authorized domains.',
  },
  'auth/quota-exceeded': {
    title: 'SMS quota exceeded.',
    description: 'Try again later or use a Firebase test phone number during QA.',
  },
  'auth/too-many-requests': {
    title: 'Too many attempts.',
    description: 'Wait a few minutes before requesting another code.',
  },
  'auth/invalid-verification-code': {
    title: 'Invalid verification code.',
    description: 'Check the SMS code and try again.',
  },
  'auth/code-expired': {
    title: 'Verification code expired.',
    description: 'Request a new OTP.',
  },
  'auth/recaptcha-container-missing': {
    title: 'reCAPTCHA could not load.',
    description: 'Close and reopen the login modal, then try phone sign-in again.',
  },
  'auth/operation-not-allowed': {
    title: 'Phone sign-in is not enabled.',
    description: 'Enable Phone provider in Firebase Console → Authentication → Sign-in method.',
  },
};

export function handleAuthError(
  error: unknown,
  provider?: string,
  t?: (key: string) => string
): void {
  const err = error as { code?: string; message?: string };
  const label = provider ? PROVIDER_LABELS[provider] ?? provider : 'Authentication';

  if (provider === 'phone') {
    phoneAuthLog('firebase', `handleAuthError: ${err.code ?? 'no-code'}`, {
      message: err.message,
    });
  }

  const phoneMsg = err.code ? PHONE_ERROR_MESSAGES[err.code] : undefined;
  if (provider === 'phone' && phoneMsg) {
    toast.error(phoneMsg.title, {
      description: phoneMsg.description,
      duration: 7000,
    });
    return;
  }

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
      description: isPhoneAuthDebugEnabled()
        ? `Add ${window.location.hostname} to Firebase Console → Authentication → Settings → Authorized domains (include gamedravo.com).`
        : 'Please add this URL to your Firebase Authorized Domains.',
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

  if (provider === 'phone' && err.code) {
    toast.error(`Phone auth failed (${err.code})`, {
      description: err.message,
      duration: 8000,
    });
    return;
  }

  toast.error(err.message || t?.('loginError') || 'Authentication failed.', {
    description: `Need help? Contact ${SUPPORT_EMAIL}`,
    duration: 7000,
  });
}

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import { auth } from '../firebase';

const RECAPTCHA_CONTAINER_ID = 'recaptcha-container';
const DEFAULT_COUNTRY_CODE = '351'; // Portugal (+351)

export type RecaptchaState =
  | 'idle'
  | 'container-missing'
  | 'initializing'
  | 'rendered'
  | 'render-failed'
  | 'cleared';

export type PhoneAuthState =
  | 'idle'
  | 'normalizing'
  | 'sending-otp'
  | 'otp-sent'
  | 'verifying-otp'
  | 'success'
  | 'error';

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | null;
    __playdravoRecaptchaWidgetId?: number;
  }
}

/** Enable via DevTools: localStorage.setItem('playdravo_phone_auth_debug', '1') */
export function isPhoneAuthDebugEnabled(): boolean {
  return (
    import.meta.env.DEV ||
    (typeof localStorage !== 'undefined' &&
      localStorage.getItem('playdravo_phone_auth_debug') === '1')
  );
}

export function phoneAuthLog(
  phase: 'recaptcha' | 'phone' | 'firebase',
  message: string,
  data?: Record<string, unknown>
): void {
  if (!isPhoneAuthDebugEnabled()) return;
  const prefix = `[PlayDravo Phone Auth · ${phase}]`;
  if (data) {
    console.log(prefix, message, data);
  } else {
    console.log(prefix, message);
  }
}

export function logFirebasePhoneError(error: unknown): string {
  const err = error as { code?: string; message?: string; name?: string };
  const code = err.code ?? 'unknown';
  const message = err.message ?? String(error);
  console.error('[PlayDravo Phone Auth · firebase] signInWithPhoneNumber failed', {
    code,
    message,
    name: err.name,
  });
  phoneAuthLog('firebase', `Error code: ${code}`, { message });
  return code;
}

/**
 * Normalize user input to E.164 (e.g. +351912345678).
 * Defaults bare Portuguese mobiles (9xxxxxxxx) to +351.
 */
export function toE164(raw: string, defaultCountryCode = DEFAULT_COUNTRY_CODE): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  let normalized = trimmed.replace(/[\s\-().]/g, '');

  if (normalized.startsWith('+')) {
    return normalized;
  }

  if (normalized.startsWith('00')) {
    normalized = normalized.slice(2);
  }

  if (normalized.startsWith(defaultCountryCode)) {
    return `+${normalized}`;
  }

  // Portuguese mobile: 9xxxxxxxx (9 digits)
  if (/^9\d{8}$/.test(normalized)) {
    return `+${defaultCountryCode}${normalized}`;
  }

  // US/CA 10-digit
  if (/^\d{10}$/.test(normalized)) {
    return `+1${normalized}`;
  }

  if (/^\d{6,15}$/.test(normalized)) {
    return `+${defaultCountryCode}${normalized}`;
  }

  return normalized.startsWith('+') ? normalized : `+${normalized}`;
}

export function assertRecaptchaContainer(): HTMLElement {
  const el = document.getElementById(RECAPTCHA_CONTAINER_ID);
  if (!el) {
    phoneAuthLog('recaptcha', 'Container missing from DOM', { id: RECAPTCHA_CONTAINER_ID });
    throw Object.assign(new Error('reCAPTCHA container not found in DOM.'), {
      code: 'auth/recaptcha-container-missing',
    });
  }
  return el;
}

/** Clears the singleton verifier. Safe to call multiple times. */
export function clearRecaptchaVerifier(): RecaptchaState {
  if (!window.recaptchaVerifier) {
    phoneAuthLog('recaptcha', 'clear() skipped — no instance');
    return 'idle';
  }
  try {
    window.recaptchaVerifier.clear();
    phoneAuthLog('recaptcha', 'clear() succeeded');
  } catch (e) {
    console.warn('[PlayDravo Phone Auth · recaptcha] clear() failed', e);
  }
  window.recaptchaVerifier = null;
  window.__playdravoRecaptchaWidgetId = undefined;
  return 'cleared';
}

/**
 * Returns the single app-wide RecaptchaVerifier.
 * Calls render() before signInWithPhoneNumber (required by Firebase).
 */
export async function getRecaptchaVerifier(): Promise<RecaptchaVerifier> {
  assertRecaptchaContainer();

  if (window.recaptchaVerifier) {
    phoneAuthLog('recaptcha', 'Reusing existing singleton instance');
    return window.recaptchaVerifier;
  }

  phoneAuthLog('recaptcha', 'Creating new RecaptchaVerifier (invisible)');

  const verifier = new RecaptchaVerifier(auth, RECAPTCHA_CONTAINER_ID, {
    size: 'invisible',
    callback: () => {
      phoneAuthLog('recaptcha', 'Invisible challenge callback fired');
    },
    'expired-callback': () => {
      phoneAuthLog('recaptcha', 'Challenge expired — clearing verifier');
      clearRecaptchaVerifier();
    },
  });

  window.recaptchaVerifier = verifier;

  try {
    const widgetId = await verifier.render();
    window.__playdravoRecaptchaWidgetId = widgetId;
    phoneAuthLog('recaptcha', 'render() succeeded', { widgetId });
    return verifier;
  } catch (error) {
    logFirebasePhoneError(error);
    clearRecaptchaVerifier();
    throw error;
  }
}

export async function sendPhoneOtp(
  rawPhone: string,
  onState?: (state: PhoneAuthState, detail?: string) => void
): Promise<{ confirmation: ConfirmationResult; e164: string }> {
  onState?.('normalizing');
  const e164 = toE164(rawPhone);

  phoneAuthLog('phone', 'Normalized to E.164', { raw: rawPhone, e164 });

  if (!/^\+\d{8,15}$/.test(e164)) {
    const err = Object.assign(new Error(`Invalid E.164 phone number: ${e164}`), {
      code: 'auth/invalid-phone-number',
    });
    logFirebasePhoneError(err);
    onState?.('error', 'invalid-e164');
    throw err;
  }

  onState?.('sending-otp');
  await getRecaptchaVerifier();

  phoneAuthLog('phone', 'Calling signInWithPhoneNumber', { e164 });

  try {
    const confirmation = await signInWithPhoneNumber(auth, e164, window.recaptchaVerifier!);
    phoneAuthLog('phone', 'signInWithPhoneNumber succeeded — OTP dispatched');
    onState?.('otp-sent', e164);
    return { confirmation, e164 };
  } catch (error) {
    logFirebasePhoneError(error);
    onState?.('error', (error as { code?: string }).code);
    throw error;
  }
}

export async function verifyPhoneOtp(
  confirmation: ConfirmationResult,
  otp: string,
  onState?: (state: PhoneAuthState) => void
): Promise<void> {
  onState?.('verifying-otp');
  phoneAuthLog('phone', 'Confirming OTP');
  try {
    await confirmation.confirm(otp.trim());
    phoneAuthLog('phone', 'OTP verified successfully');
    onState?.('success');
  } catch (error) {
    logFirebasePhoneError(error);
    onState?.('error');
    throw error;
  }
}

/** Pre-warm reCAPTCHA when user opens phone sign-in (optional, reduces submit latency). */
export async function prewarmRecaptcha(): Promise<RecaptchaState> {
  try {
    assertRecaptchaContainer();
    await getRecaptchaVerifier();
    return 'rendered';
  } catch {
    return 'render-failed';
  }
}

export const AUTHORIZED_DOMAIN_CHECKLIST = [
  'gamedravo.com',
  'www.gamedravo.com',
  'playdravo.com',
  'www.playdravo.com',
  'localhost',
  '127.0.0.1',
  'gen-lang-client-0866749554.firebaseapp.com',
];

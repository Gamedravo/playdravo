import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import { auth } from '../firebase';
import { logFirebaseAuthContext, verifyAuthorizedDomain } from './phoneAuthDiagnostics';

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
  console.error('[PlayDravo Phone Auth · firebase] Error', {
    code,
    message,
    name: err.name,
  });
  if (isPhoneAuthDebugEnabled()) {
    console.log('[PlayDravo Phone Auth] Firebase Error Code:', code);
    console.log('[PlayDravo Phone Auth] Firebase Error Message:', message);
  }
  phoneAuthLog('firebase', 'Firebase Error Code', { code, message });
  return code;
}

/** Body-level mount — must NOT live inside overflow:hidden modals. */
export function ensureRecaptchaContainer(): HTMLElement {
  let el = document.getElementById(RECAPTCHA_CONTAINER_ID);
  if (!el) {
    el = document.createElement('div');
    el.id = RECAPTCHA_CONTAINER_ID;
    el.setAttribute('aria-hidden', 'true');
    Object.assign(el.style, {
      position: 'fixed',
      bottom: '0',
      left: '0',
      width: '1px',
      height: '1px',
      overflow: 'visible',
      opacity: '0',
      pointerEvents: 'none',
      zIndex: '9999',
    });
    document.body.appendChild(el);
    phoneAuthLog('recaptcha', 'Created body-level reCAPTCHA container');
  }
  return el;
}

export function assertRecaptchaContainer(): HTMLElement {
  return ensureRecaptchaContainer();
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

  if (/^9\d{8}$/.test(normalized)) {
    return `+${defaultCountryCode}${normalized}`;
  }

  if (/^\d{10}$/.test(normalized)) {
    return `+1${normalized}`;
  }

  if (/^\d{6,15}$/.test(normalized)) {
    return `+${defaultCountryCode}${normalized}`;
  }

  return normalized.startsWith('+') ? normalized : `+${normalized}`;
}

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

export async function getRecaptchaVerifier(): Promise<RecaptchaVerifier> {
  const container = ensureRecaptchaContainer();

  if (window.recaptchaVerifier) {
    phoneAuthLog('recaptcha', 'Reusing existing singleton instance');
    return window.recaptchaVerifier;
  }

  phoneAuthLog('recaptcha', 'Creating new RecaptchaVerifier (invisible)');
  console.log('[PlayDravo Phone Auth] reCAPTCHA Initialized');

  const verifier = new RecaptchaVerifier(auth, container, {
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
    console.log('[PlayDravo Phone Auth] reCAPTCHA Initialization Failed');
    logFirebasePhoneError(error);
    clearRecaptchaVerifier();
    throw error;
  }
}

export async function sendPhoneOtp(
  rawPhone: string,
  onState?: (state: PhoneAuthState, detail?: string) => void
): Promise<{ confirmation: ConfirmationResult; e164: string }> {
  console.log('[PlayDravo Phone Auth] Phone Auth Started');
  logFirebaseAuthContext();

  const domainCheck = await verifyAuthorizedDomain();
  if (!domainCheck.ok) {
    phoneAuthLog('firebase', 'Domain not authorized', domainCheck);
  }

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

  try {
    await getRecaptchaVerifier();
  } catch (error) {
    onState?.('error', (error as { code?: string }).code ?? 'recaptcha-failed');
    throw error;
  }

  phoneAuthLog('phone', 'Calling signInWithPhoneNumber', { e164 });
  console.log('[PlayDravo Phone Auth] OTP Request Sent', { e164 });

  try {
    const confirmation = await signInWithPhoneNumber(auth, e164, window.recaptchaVerifier!);
    console.log('[PlayDravo Phone Auth] OTP Request Sent — success');
    phoneAuthLog('phone', 'signInWithPhoneNumber succeeded — OTP dispatched');
    onState?.('otp-sent', e164);
    return { confirmation, e164 };
  } catch (error) {
    console.log('[PlayDravo Phone Auth] OTP Request Failed');
    logFirebasePhoneError(error);
    clearRecaptchaVerifier();
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

export async function prewarmRecaptcha(): Promise<RecaptchaState> {
  try {
    ensureRecaptchaContainer();
    await getRecaptchaVerifier();
    return 'rendered';
  } catch (error) {
    logFirebasePhoneError(error);
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

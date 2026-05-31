import { auth } from '../firebase';
import { isPhoneAuthDebugEnabled, phoneAuthLog } from './phoneAuth';

export interface FirebaseAuthContext {
  projectId: string;
  authDomain: string;
  apiKey: string;
  hostname: string;
}

export interface AuthorizedDomainCheck {
  ok: boolean;
  hostname: string;
  domains: string[];
  projectId: string;
}

/** Log active Firebase project — call at phone auth start for production verification. */
export function logFirebaseAuthContext(): FirebaseAuthContext {
  const ctx: FirebaseAuthContext = {
    projectId: auth.app.options.projectId ?? 'unknown',
    authDomain: auth.app.options.authDomain ?? 'unknown',
    apiKey: auth.app.options.apiKey ?? 'unknown',
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
  };

  console.log('Firebase Project ID:', ctx.projectId);
  console.log('Auth Domain:', ctx.authDomain);
  phoneAuthLog('firebase', 'Active Firebase project', ctx);

  return ctx;
}

/** Runtime check: is current hostname in Firebase Authorized Domains? */
export async function verifyAuthorizedDomain(): Promise<AuthorizedDomainCheck> {
  const projectId = auth.app.options.projectId ?? 'unknown';
  const hostname = window.location.hostname;
  const apiKey = auth.app.options.apiKey;

  if (!apiKey) {
    return { ok: false, hostname, domains: [], projectId };
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=${encodeURIComponent(apiKey)}`
    );
    const data = (await res.json()) as { authorizedDomains?: string[] };
    const domains = data.authorizedDomains ?? [];
    const ok =
      domains.includes(hostname) ||
      domains.some((d) => hostname === d || hostname.endsWith(`.${d.replace(/^\./, '')}`));

    phoneAuthLog('firebase', 'Authorized domain check', { ok, hostname, domains, projectId });

    if (!ok) {
      console.warn('[PlayDravo Phone Auth] Current hostname is NOT in Firebase Authorized Domains', {
        hostname,
        domains,
        projectId,
      });
    }

    return { ok, hostname, domains, projectId };
  } catch (error) {
    phoneAuthLog('firebase', 'Authorized domain check failed', {
      message: error instanceof Error ? error.message : String(error),
    });
    return { ok: true, hostname, domains: [], projectId };
  }
}

export function formatPhoneAuthErrorHint(code: string, projectId: string): string | undefined {
  switch (code) {
    case 'auth/operation-not-allowed':
      return (
        `Firebase project "${projectId}": enable Phone in Authentication → Sign-in method, ` +
        'upgrade to Blaze for production SMS, and allow your country in Authentication → Settings → SMS region policy.'
      );
    case 'auth/invalid-app-credential':
      return 'reCAPTCHA app credential invalid. Confirm authorized domains and that reCAPTCHA loaded (check browser console).';
    case 'auth/configuration-not-found':
      return `Firebase Auth config missing for project "${projectId}". Verify firebase-applet-config.json matches production.`;
    case 'auth/captcha-check-failed':
      return 'reCAPTCHA failed. Refresh, disable ad blockers, and confirm gamedravo.com is authorized.';
    case 'auth/unauthorized-continue-uri':
      return 'Action URL not authorized. Add gamedravo.com to Authorized domains.';
    case 'auth/missing-client-identifier':
      return 'Missing reCAPTCHA client. Wait for reCAPTCHA to initialize before sending OTP.';
    default:
      return undefined;
  }
}

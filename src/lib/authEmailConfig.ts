import type { ActionCodeSettings } from 'firebase/auth';
import { AUTH_DOMAIN } from './brandContact';

/**
 * Firebase Auth email action settings for @gamedravo.com templates.
 * Configure matching templates in Firebase Console → Authentication → Templates:
 * - Email address verification
 * - Password reset
 * - Email address change
 */
const AUTH_CONTINUE_URL =
  typeof window !== 'undefined'
    ? `${window.location.origin}/`
    : `https://${AUTH_DOMAIN}/`;

export function getAuthActionCodeSettings(path = '/'): ActionCodeSettings {
  const url = path.startsWith('http') ? path : `${AUTH_CONTINUE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  return {
    url,
    handleCodeInApp: true,
  };
}

/** Firebase Console → Authentication → Templates — recommended sender display name. */
export const AUTH_EMAIL_TEMPLATE_HINTS = {
  fromName: 'GameDravo',
  fromDomain: AUTH_DOMAIN,
  replyTo: 'support@gamedravo.com',
  verificationSubject: 'Verify your GameDravo account',
  passwordResetSubject: 'Reset your GameDravo password',
  recoverySubject: 'Recover your GameDravo account',
} as const;

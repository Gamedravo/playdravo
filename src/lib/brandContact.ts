/** Public-facing support & brand contact (production). */
export const SUPPORT_EMAIL = 'support@gamedravo.com';
export const PARTNERS_EMAIL = 'partners@gamedravo.com';
export const LEGAL_EMAIL = 'legal@gamedravo.com';
export const AUTH_FROM_EMAIL = 'noreply@gamedravo.com';
export const AUTH_DOMAIN = 'gamedravo.com';

/** Internal admin allowlist — not shown in public UI. */
export const ADMIN_EMAILS: readonly string[] = ['ssimarpreet271@gmail.com'];

export function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email && ADMIN_EMAILS.includes(email));
}

export function supportMailto(subject?: string): string {
  return subject
    ? `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`
    : `mailto:${SUPPORT_EMAIL}`;
}

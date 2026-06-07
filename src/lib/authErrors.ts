import { toast } from 'sonner';
import { SUPPORT_EMAIL } from './brandContact';

export function handleAuthError(
  error: unknown,
  provider?: string,
  t?: (key: string) => string
): void {
  const err = error as { code?: string; message?: string };
  const message = err.message ?? String(error);

  toast.error(t?.('loginError') || 'Authentication failed.', {
    description: `${message}\n\nNeed help? Contact ${SUPPORT_EMAIL}`,
    duration: 7000,
  });
}

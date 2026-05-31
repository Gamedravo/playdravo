import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Loader2, Mail, Smartphone } from 'lucide-react';

export type OAuthProviderId = 'google' | 'microsoft' | 'github' | 'apple';
export type AuthMethodId = OAuthProviderId | 'phone' | 'email';

interface AuthProviderButtonsProps {
  isDarkMode: boolean;
  loadingProvider: AuthMethodId | null;
  activeMethod: 'email' | 'phone' | null;
  onOAuth: (provider: OAuthProviderId) => void;
  onPhone: () => void;
  onEmail: () => void;
}

const PROVIDERS: Array<{
  id: AuthMethodId;
  label: string;
  icon: ReactNode;
}> = [
  {
    id: 'google',
    label: 'Continue with Google',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    ),
  },
  {
    id: 'microsoft',
    label: 'Continue with Microsoft',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
        <path fill="#F25022" d="M1 1h10v10H1z" />
        <path fill="#7FBA00" d="M13 1h10v10H13z" />
        <path fill="#00A4EF" d="M1 13h10v10H1z" />
        <path fill="#FFB900" d="M13 13h10v10H13z" />
      </svg>
    ),
  },
  {
    id: 'github',
    label: 'Continue with GitHub',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.395-.135-.345-.72-1.395-1.23-1.665-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    id: 'apple',
    label: 'Continue with Apple',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
    ),
  },
  {
    id: 'phone',
    label: 'Continue with Phone',
    icon: <Smartphone className="w-5 h-5" aria-hidden />,
  },
  {
    id: 'email',
    label: 'Continue with Email',
    icon: <Mail className="w-5 h-5" aria-hidden />,
  },
];

export function AuthProviderButtons({
  isDarkMode,
  loadingProvider,
  activeMethod,
  onOAuth,
  onPhone,
  onEmail,
}: AuthProviderButtonsProps) {
  const cardBase = isDarkMode
    ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-accent/40'
    : 'bg-black/[0.03] border-black/10 hover:bg-black/[0.06] hover:border-accent/40';

  const iconWrap = isDarkMode
    ? 'bg-white/10 border-white/10 group-hover:border-accent/30'
    : 'bg-white border-black/10 group-hover:border-accent/30 shadow-sm';

  const handleClick = (id: AuthMethodId) => {
    if (loadingProvider) return;
    if (id === 'phone') onPhone();
    else if (id === 'email') onEmail();
    else onOAuth(id);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {PROVIDERS.map(({ id, label, icon }) => {
        const isLoading = loadingProvider === id;
        const isActive =
          (id === 'phone' && activeMethod === 'phone') ||
          (id === 'email' && activeMethod === 'email');
        const disabled = Boolean(loadingProvider && !isLoading);

        return (
          <motion.button
            key={id}
            type="button"
            whileHover={disabled ? {} : { scale: 1.01, y: -1 }}
            whileTap={disabled ? {} : { scale: 0.99 }}
            onClick={() => handleClick(id)}
            disabled={disabled}
            aria-busy={isLoading}
            className={`auth-provider-card group w-full py-3 px-4 rounded-xl md:rounded-2xl border flex items-center gap-3 transition-all ${cardBase} ${
              isActive ? 'border-accent/50 ring-1 ring-accent/20' : ''
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div
              className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border transition-all ${iconWrap}`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-accent" aria-hidden />
              ) : (
                icon
              )}
            </div>
            <span className="text-sm font-semibold tracking-tight text-left flex-1">{label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

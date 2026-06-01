import { Loader2 } from 'lucide-react';
import { AUTH_PROVIDER_CARDS, type AuthProviderId } from '../lib/authProviders';

export type OAuthProviderId = Exclude<AuthProviderId, 'email'>;
export type AuthMethodId = AuthProviderId;

interface AuthProviderButtonsProps {
  isDarkMode: boolean;
  loadingProvider: AuthMethodId | null;
  activeMethod: 'email' | null;
  onOAuth: (provider: OAuthProviderId) => void;
  onEmail: () => void;
}

const PROVIDERS = AUTH_PROVIDER_CARDS;

export function AuthProviderButtons({
  isDarkMode,
  loadingProvider,
  activeMethod,
  onOAuth,
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
    if (id === 'email') onEmail();
    else onOAuth(id);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {PROVIDERS.map(({ id, label, icon }) => {
        const isLoading = loadingProvider === id;
        const isActive =
          (id === 'email' && activeMethod === 'email');
        const disabled = Boolean(loadingProvider && !isLoading);

        return (
          <button
            key={id}
            type="button"
            onClick={() => handleClick(id)}
            disabled={disabled}
            aria-busy={isLoading}
            className={`auth-provider-card group w-full py-3 px-4 rounded-xl md:rounded-2xl border flex items-center gap-3 transition-colors duration-75 ${cardBase} ${
              isActive ? 'border-accent/50 ring-1 ring-accent/20' : ''
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div
              className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border ${iconWrap}`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-accent" aria-hidden />
              ) : (
                icon
              )}
            </div>
            <span className="text-sm font-semibold tracking-tight text-left flex-1">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

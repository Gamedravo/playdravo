import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, CheckCircle2, XCircle, ExternalLink, RefreshCw, KeyRound, Copy, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface OAuthStatusResult {
  clientId: boolean;
  clientSecret: boolean;
}

interface OAuthStatus {
  google: OAuthStatusResult;
  github: OAuthStatusResult;
  microsoft: OAuthStatusResult;
}

interface OAuthSetupPageProps {
  isDarkMode: boolean;
}

const PROVIDERS = [
  {
    key: 'google' as const,
    name: 'Google',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    secrets: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    callbackPath: '/api/auth/google/callback',
    consoleUrl: 'https://console.cloud.google.com/apis/credentials',
    consoleName: 'Google Cloud Console',
    steps: [
      'Open the Google Cloud Console and select or create a project.',
      'Go to APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID.',
      'Set Application type to "Web application".',
      'Add the callback URL below to Authorised redirect URIs.',
      'Copy the Client ID and Client Secret, then add them as Cloudflare Worker secrets.',
    ],
  },
  {
    key: 'github' as const,
    name: 'GitHub',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    secrets: ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'],
    callbackPath: '/api/auth/github/callback',
    consoleUrl: 'https://github.com/settings/developers',
    consoleName: 'GitHub Developer Settings',
    steps: [
      'Open GitHub Developer Settings → OAuth Apps → New OAuth App.',
      'Set Homepage URL to https://gamedravo.com.',
      'Set Authorization callback URL to the callback URL below.',
      'Register the application, then copy the Client ID.',
      'Generate a new Client Secret and add both as Cloudflare Worker secrets.',
    ],
  },
  {
    key: 'microsoft' as const,
    name: 'Microsoft',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    secrets: ['MICROSOFT_CLIENT_ID', 'MICROSOFT_CLIENT_SECRET'],
    callbackPath: '/api/auth/microsoft/callback',
    consoleUrl: 'https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade',
    consoleName: 'Azure App Registrations',
    steps: [
      'Open Azure Portal → App registrations → New registration.',
      'Set Supported account types to "Accounts in any organizational directory and personal Microsoft accounts".',
      'Add the callback URL below as a Web Redirect URI.',
      'Copy the Application (client) ID.',
      'Go to Certificates & secrets → New client secret, then add both as Cloudflare Worker secrets.',
    ],
  },
] as const;

const SITE = 'https://gamedravo.com';

export const OAuthSetupPage: React.FC<OAuthSetupPageProps> = ({ isDarkMode }) => {
  const [status, setStatus] = useState<OAuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/oauth-status');
      if (res.ok) setStatus(await res.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchStatus(); }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const providerConfigured = (key: keyof OAuthStatus) =>
    status ? status[key].clientId && status[key].clientSecret : false;

  const configuredCount = status
    ? PROVIDERS.filter(p => providerConfigured(p.key)).length
    : 0;

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className={`p-3 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:bg-black/10'}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-none mb-2">
                Admin <span className="text-accent">OAuth Setup</span>
              </h1>
              <p className={`text-[11px] font-bold uppercase tracking-[0.3em] ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                {loading ? 'Checking secrets…' : `${configuredCount} / ${PROVIDERS.length} Providers Configured`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <Link to="/admin/bug-reports" className={`px-6 py-3 rounded-xl text-[10px] font-semibold tracking-wide transition-all ${isDarkMode ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-black/5 text-black/60 hover:bg-black/10'}`}>Bug Reports</Link>
            <Link to="/admin/game-requests" className={`px-6 py-3 rounded-xl text-[10px] font-semibold tracking-wide transition-all ${isDarkMode ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-black/5 text-black/60 hover:bg-black/10'}`}>Game Requests</Link>
            <Link to="/admin/support-tickets" className={`px-6 py-3 rounded-xl text-[10px] font-semibold tracking-wide transition-all ${isDarkMode ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-black/5 text-black/60 hover:bg-black/10'}`}>Support Tickets</Link>
            <span className={`px-6 py-3 rounded-xl text-[10px] font-semibold tracking-wide bg-accent text-bg-dark`}>OAuth Setup</span>
            <button
              onClick={fetchStatus}
              disabled={loading}
              className={`p-3 rounded-xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:bg-black/10'}`}
              title="Refresh status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-accent' : ''}`} />
            </button>
          </div>
        </div>

        <div className={`mb-8 p-6 rounded-[2rem] border ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.02] border-black/5'}`}>
          <div className="flex items-start gap-4">
            <KeyRound className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            <div>
              <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>
                How to add secrets to Cloudflare
              </p>
              <p className={`text-xs font-medium leading-relaxed ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                In the Cloudflare dashboard → Workers &amp; Pages → <strong>gamedravo</strong> → Settings → Variables &amp; Secrets, add each secret below. Alternatively run{' '}
                <code className="px-1.5 py-0.5 rounded bg-accent/10 text-accent font-mono text-[11px]">wrangler secret put SECRET_NAME</code>{' '}
                in your terminal for each one.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {PROVIDERS.map((provider, idx) => {
            const configured = providerConfigured(provider.key);
            const providerStatus = status?.[provider.key];
            const callbackUrl = `${SITE}${provider.callbackPath}`;

            return (
              <motion.div
                key={provider.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`rounded-[2.5rem] border overflow-hidden ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.02] border-black/5'}`}
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${provider.bg} ${provider.border}`}>
                        <span className={`text-lg font-black ${provider.color}`}>{provider.name[0]}</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight">{provider.name}</h2>
                        <p className={`text-[10px] font-bold uppercase tracking-[0.25em] mt-0.5 ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>
                          OAuth 2.0
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {loading ? (
                        <div className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wide ${isDarkMode ? 'bg-white/5 text-white/30' : 'bg-black/5 text-black/30'}`}>
                          Checking…
                        </div>
                      ) : configured ? (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/20">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-400">Configured</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/20">
                          <XCircle className="w-4 h-4 text-amber-400" />
                          <span className="text-[10px] font-bold uppercase tracking-wide text-amber-400">Missing Secrets</span>
                        </div>
                      )}
                      <a
                        href={provider.consoleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all border ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white/60' : 'bg-black/5 border-black/10 hover:bg-black/10 text-black/60'}`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {provider.consoleName}
                      </a>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-[0.25em] mb-3 ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>
                        Required Secrets
                      </p>
                      <div className="space-y-2">
                        {provider.secrets.map(secret => {
                          const isSet = providerStatus
                            ? (secret.includes('SECRET') ? providerStatus.clientSecret : providerStatus.clientId)
                            : false;
                          return (
                            <div
                              key={secret}
                              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border ${
                                loading
                                  ? (isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.02] border-black/5')
                                  : isSet
                                    ? 'bg-emerald-500/[0.06] border-emerald-500/15'
                                    : 'bg-amber-500/[0.06] border-amber-500/15'
                              }`}
                            >
                              <code className={`font-mono text-xs font-bold ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>
                                {secret}
                              </code>
                              {!loading && (
                                isSet
                                  ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                  : <XCircle className="w-4 h-4 text-amber-400 shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <p className={`text-[10px] font-bold uppercase tracking-[0.25em] mb-3 mt-6 ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>
                        Callback URL
                      </p>
                      <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl border ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.02] border-black/5'}`}>
                        <code className={`font-mono text-xs flex-1 truncate ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
                          {callbackUrl}
                        </code>
                        <button
                          onClick={() => copyToClipboard(callbackUrl, provider.key)}
                          className={`shrink-0 p-1.5 rounded-lg transition-all ${isDarkMode ? 'hover:bg-white/10 text-white/30 hover:text-white/70' : 'hover:bg-black/10 text-black/30 hover:text-black/70'}`}
                          title="Copy callback URL"
                        >
                          {copied === provider.key
                            ? <Check className="w-3.5 h-3.5 text-accent" />
                            : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-[0.25em] mb-3 ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>
                        Setup Steps
                      </p>
                      <ol className="space-y-3">
                        {provider.steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black mt-0.5 ${provider.bg} ${provider.color}`}>
                              {i + 1}
                            </span>
                            <p className={`text-xs font-medium leading-relaxed ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
                              {step}
                            </p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

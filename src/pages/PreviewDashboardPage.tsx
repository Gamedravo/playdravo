import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Video,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
  Play,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  Zap,
  BarChart2,
  Globe,
  HardDrive,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import type { Game } from '../types';
import { fetchPreviewManifest, invalidatePreviewManifest, type PreviewManifest, type PreviewEntry } from '../hooks/usePreviewManifest';

interface Props {
  games: Game[];
}

interface ScrapedCandidate {
  url: string;
  kind: 'mp4' | 'webm' | 'gif';
}

interface ProbeResult {
  gameId: string;
  candidates: ScrapedCandidate[];
  error?: string;
}

type ProbeStatus = 'idle' | 'probing' | 'done' | 'error';

interface GameRow {
  game: Game;
  probeStatus: ProbeStatus;
  probeResult?: ProbeResult;
  saving: boolean;
  expanded: boolean;
}

const KIND_BADGE: Record<string, string> = {
  mp4: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  webm: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  gif: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

const SOURCE_BADGE: Record<string, string> = {
  scraped: 'bg-green-500/20 text-green-300',
  local: 'bg-blue-500/20 text-blue-300',
  manual: 'bg-amber-500/20 text-amber-300',
};

async function probeGame(gameId: string, gameUrl: string, gameTitle: string): Promise<ProbeResult> {
  const res = await fetch('/api/previews/probe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, gameUrl, gameTitle }),
  });
  const data = await res.json();
  if (!res.ok) return { gameId, candidates: [], error: data.error };
  return { gameId, candidates: data.candidates ?? [], error: data.error };
}

async function savePreview(
  gameId: string,
  url: string,
  kind: string,
  gameTitle: string,
  local: boolean,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const res = await fetch('/api/previews/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, url, kind, gameTitle, local }),
  });
  return res.json();
}

async function deletePreview(gameId: string): Promise<boolean> {
  const res = await fetch(`/api/previews/${encodeURIComponent(gameId)}`, { method: 'DELETE' });
  return res.ok;
}

export function PreviewDashboardPage({ games }: Props) {
  const [manifest, setManifest] = useState<PreviewManifest>({});
  const [rows, setRows] = useState<GameRow[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'plays' | 'title' | 'status'>('plays');
  const [filterBy, setFilterBy] = useState<'all' | 'with' | 'without'>('all');
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkTotal, setBulkTotal] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const abortRef = useRef(false);

  const refreshManifest = useCallback(async () => {
    invalidatePreviewManifest();
    const m = await fetchPreviewManifest();
    setManifest(m);
  }, []);

  useEffect(() => {
    refreshManifest();
  }, [refreshManifest]);

  useEffect(() => {
    setRows(
      games.map((g) => ({
        game: g,
        probeStatus: 'idle',
        saving: false,
        expanded: false,
      })),
    );
  }, [games]);

  const updateRow = useCallback((gameId: string, patch: Partial<GameRow>) => {
    setRows((prev) => prev.map((r) => (r.game.id === gameId ? { ...r, ...patch } : r)));
  }, []);

  const handleProbe = useCallback(
    async (gameId: string, gameUrl: string, gameTitle: string) => {
      updateRow(gameId, { probeStatus: 'probing', probeResult: undefined, expanded: true });
      try {
        const result = await probeGame(gameId, gameUrl, gameTitle);
        updateRow(gameId, {
          probeStatus: result.error ? 'error' : 'done',
          probeResult: result,
          expanded: true,
        });
      } catch (err: any) {
        updateRow(gameId, {
          probeStatus: 'error',
          probeResult: { gameId, candidates: [], error: err.message },
          expanded: true,
        });
      }
    },
    [updateRow],
  );

  const handleSave = useCallback(
    async (gameId: string, url: string, kind: string, gameTitle: string, local = false) => {
      updateRow(gameId, { saving: true });
      const result = await savePreview(gameId, url, kind, gameTitle, local);
      await refreshManifest();
      updateRow(gameId, { saving: false, expanded: !result.ok });
    },
    [updateRow, refreshManifest],
  );

  const handleDelete = useCallback(
    async (gameId: string) => {
      await deletePreview(gameId);
      await refreshManifest();
    },
    [refreshManifest],
  );

  const handleBulkProbe = useCallback(
    async (count: number) => {
      abortRef.current = false;
      setBulkRunning(true);

      const targets = [...rows]
        .filter((r) => !manifest[r.game.id])
        .sort((a, b) => (b.game.plays ?? 0) - (a.game.plays ?? 0))
        .slice(0, count);

      setBulkTotal(targets.length);
      setBulkProgress(0);

      for (let i = 0; i < targets.length; i++) {
        if (abortRef.current) break;
        const { game } = targets[i];
        await handleProbe(game.id, game.url, game.title);
        setBulkProgress(i + 1);
        await new Promise((r) => setTimeout(r, 400));
      }

      setBulkRunning(false);
    },
    [rows, manifest, handleProbe],
  );

  const filtered = rows
    .filter((r) => {
      const q = search.toLowerCase();
      if (q && !r.game.title.toLowerCase().includes(q) && !r.game.id.includes(q)) return false;
      if (filterBy === 'with') return !!manifest[r.game.id];
      if (filterBy === 'without') return !manifest[r.game.id];
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'plays') return (b.game.plays ?? 0) - (a.game.plays ?? 0);
      if (sortBy === 'title') return a.game.title.localeCompare(b.game.title);
      if (sortBy === 'status') {
        const ha = !!manifest[a.game.id];
        const hb = !!manifest[b.game.id];
        return Number(hb) - Number(ha);
      }
      return 0;
    });

  const withCount = Object.keys(manifest).length;
  const coverage = games.length > 0 ? Math.round((withCount / games.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[var(--color-bg-dark)] text-white px-4 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30">
            <Video className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Preview Dashboard</h1>
        </div>
        <p className="text-sm text-white/50">
          Automatically discover and store hover preview videos / GIFs for game cards.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Games', value: games.length, icon: <BarChart2 className="w-4 h-4" />, color: 'text-white/70' },
          { label: 'With Preview', value: withCount, icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-400' },
          { label: 'Coverage', value: `${coverage}%`, icon: <Zap className="w-4 h-4" />, color: 'text-purple-400' },
          { label: 'Missing', value: games.length - withCount, icon: <XCircle className="w-4 h-4" />, color: 'text-amber-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className={`flex items-center gap-2 text-xs font-medium mb-1 ${s.color}`}>
              {s.icon}
              {s.label}
            </div>
            <div className="text-2xl font-black">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-purple-500/60"
            placeholder="Search games…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
        >
          <option value="plays">Sort: Plays</option>
          <option value="title">Sort: Title</option>
          <option value="status">Sort: Status</option>
        </select>

        <select
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none"
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value as typeof filterBy)}
        >
          <option value="all">All Games</option>
          <option value="with">Has Preview</option>
          <option value="without">No Preview</option>
        </select>

        <button
          onClick={refreshManifest}
          className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm hover:bg-white/10 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>

        <button
          disabled={bulkRunning}
          onClick={() => handleBulkProbe(50)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl text-sm font-semibold transition-colors"
        >
          {bulkRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {bulkProgress}/{bulkTotal}
              <button
                onClick={(e) => { e.stopPropagation(); abortRef.current = true; }}
                className="ml-1 text-xs underline text-white/70"
              >
                Stop
              </button>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" /> Probe Top 50
            </>
          )}
        </button>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setPreviewUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#0d1025] border border-white/10 rounded-2xl overflow-hidden max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-3 border-b border-white/10">
                <span className="text-sm font-semibold text-white/70">Preview</span>
                <button onClick={() => setPreviewUrl(null)} className="text-white/40 hover:text-white">✕</button>
              </div>
              {previewUrl.endsWith('.gif') ? (
                <img src={previewUrl} alt="preview" className="w-full max-h-96 object-contain" />
              ) : (
                <video src={previewUrl} autoPlay muted loop playsInline className="w-full max-h-96 object-contain" />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Table */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-white/30 text-sm">No games match your filters.</div>
        )}

        {filtered.map(({ game, probeStatus, probeResult, saving, expanded }) => {
          const entry: PreviewEntry | undefined = manifest[game.id];
          const hasPreview = !!entry;

          return (
            <div
              key={game.id}
              className={`border rounded-xl overflow-hidden transition-colors ${
                hasPreview ? 'border-green-500/20 bg-green-500/5' : 'border-white/8 bg-white/3'
              }`}
            >
              {/* Row */}
              <div className="flex items-center gap-3 p-3">
                {/* Thumbnail */}
                <img
                  src={game.thumbnail}
                  alt={game.title}
                  className="w-12 h-9 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />

                {/* Title + meta */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{game.title}</div>
                  <div className="text-xs text-white/40 flex items-center gap-2 mt-0.5">
                    <span>{game.category}</span>
                    <span>·</span>
                    <span>{(game.plays ?? 0).toLocaleString()} plays</span>
                    {hasPreview && (
                      <>
                        <span>·</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${SOURCE_BADGE[entry.source]}`}>
                          {entry.source}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase ${KIND_BADGE[entry.kind] ?? ''}`}>
                          {entry.kind}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status + actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {hasPreview ? (
                    <>
                      <span className="text-green-400 flex items-center gap-1 text-xs">
                        <CheckCircle className="w-3.5 h-3.5" /> Preview
                      </span>
                      <button
                        onClick={() => setPreviewUrl(entry.url)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                        title="Preview"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(game.id)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <span className="text-white/30 text-xs flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> None
                    </span>
                  )}

                  <button
                    disabled={probeStatus === 'probing'}
                    onClick={() =>
                      probeStatus === 'probing'
                        ? null
                        : handleProbe(game.id, game.url, game.title)
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/30 border border-purple-500/30 hover:bg-purple-600/50 text-purple-300 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {probeStatus === 'probing' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    Probe
                  </button>

                  <button
                    onClick={() => setRows((prev) => prev.map((r) => r.game.id === game.id ? { ...r, expanded: !r.expanded } : r))}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  >
                    {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Expanded panel */}
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-white/10 p-3 bg-white/3">
                      {probeStatus === 'probing' && (
                        <div className="flex items-center gap-2 text-xs text-white/50 py-2">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                          Scraping game page for video / GIF URLs…
                        </div>
                      )}

                      {probeStatus === 'error' && (
                        <div className="flex items-center gap-2 text-xs text-red-400 py-2">
                          <AlertTriangle className="w-4 h-4" />
                          {probeResult?.error ?? 'Probe failed'}
                        </div>
                      )}

                      {probeStatus === 'done' && (
                        <>
                          {probeResult?.candidates.length === 0 ? (
                            <p className="text-xs text-white/40 py-2">No video/GIF URLs found on this game's page.</p>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-xs text-white/50 mb-2">
                                Found <strong className="text-white">{probeResult?.candidates.length}</strong> media candidate(s):
                              </p>
                              {probeResult?.candidates.map((c, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-2"
                                >
                                  <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase ${KIND_BADGE[c.kind] ?? ''}`}>
                                    {c.kind}
                                  </span>
                                  <span className="flex-1 text-xs text-white/60 truncate font-mono">{c.url}</span>
                                  <button
                                    onClick={() => setPreviewUrl(c.url)}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors flex-shrink-0"
                                    title="Preview"
                                  >
                                    <Play className="w-3.5 h-3.5" />
                                  </button>
                                  <a
                                    href={c.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors flex-shrink-0"
                                    title="Open"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                  <button
                                    disabled={saving}
                                    onClick={() => handleSave(game.id, c.url, c.kind, game.title, false)}
                                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-green-600/30 border border-green-500/30 hover:bg-green-600/50 text-green-300 text-xs font-semibold transition-colors disabled:opacity-50 flex-shrink-0"
                                    title="Save remote URL"
                                  >
                                    <Globe className="w-3 h-3" /> Use
                                  </button>
                                  <button
                                    disabled={saving}
                                    onClick={() => handleSave(game.id, c.url, c.kind, game.title, true)}
                                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-blue-600/30 border border-blue-500/30 hover:bg-blue-600/50 text-blue-300 text-xs font-semibold transition-colors disabled:opacity-50 flex-shrink-0"
                                    title="Download locally"
                                  >
                                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                                    Save
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      {hasPreview && probeStatus === 'idle' && (
                        <div className="text-xs text-white/40">
                          Current preview: <span className="font-mono text-purple-300">{entry.url}</span>{' '}
                          <span className="text-white/30">
                            — saved {new Date(entry.capturedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {!hasPreview && probeStatus === 'idle' && (
                        <p className="text-xs text-white/30">Click Probe to scan this game's page for video/GIF preview URLs.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {filtered.length > 0 && (
        <p className="text-center text-xs text-white/30 mt-6">
          Showing {filtered.length} of {games.length} games
        </p>
      )}
    </div>
  );
}

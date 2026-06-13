const apiFetch = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    const err = isJson ? await res.json().catch(() => ({ message: res.statusText })) : { message: res.statusText };
    throw new Error(err.message || 'Request failed');
  }

  if (!isJson) {
    throw new Error(`Expected JSON from ${url}, received ${contentType || 'unknown content type'}`);
  }

  return res.json();
};

export const api = {

  // User profile
  updateProfile: (data: Record<string, any>) =>
    apiFetch('/api/user/profile', { method: 'PATCH', body: JSON.stringify(data) }),

  // Game stats
  incrementPlays: (gameId: string) =>
    apiFetch(`/api/games/${gameId}/play`, { method: 'POST' }),
  getGameStats: () =>
    apiFetch('/api/games/stats'),

  // Ratings
  getUserRating: (gameId: string) =>
    apiFetch(`/api/games/${gameId}/rating`),
  rateGame: (gameId: string, value: number) =>
    apiFetch(`/api/games/${gameId}/rate`, { method: 'POST', body: JSON.stringify({ value }) }),

  // Mods
  getGameMods: (gameId: string) =>
    apiFetch(`/api/games/${gameId}/mods`),
  submitMod: (gameId: string, data: { title: string; description: string; version: string }) =>
    apiFetch(`/api/games/${gameId}/mods`, { method: 'POST', body: JSON.stringify(data) }),

  // Game requests
  getGameRequests: () =>
    apiFetch('/api/game-requests'),
  submitGameRequest: (data: { gameName: string; description?: string; link?: string }) =>
    apiFetch('/api/game-requests', { method: 'POST', body: JSON.stringify(data) }),
  voteGameRequest: (id: string) =>
    apiFetch(`/api/game-requests/${id}/vote`, { method: 'POST' }),
  updateGameRequest: (id: string, data: Record<string, any>) =>
    apiFetch(`/api/game-requests/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteGameRequest: (id: string) =>
    apiFetch(`/api/game-requests/${id}`, { method: 'DELETE' }),

  // Bug reports
  submitBugReport: (data: { gameName?: string; description: string; email?: string }) =>
    apiFetch('/api/bug-reports', { method: 'POST', body: JSON.stringify(data) }),
  getBugReports: () =>
    apiFetch('/api/bug-reports'),
  updateBugReport: (id: string, data: Record<string, any>) =>
    apiFetch(`/api/bug-reports/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteBugReport: (id: string) =>
    apiFetch(`/api/bug-reports/${id}`, { method: 'DELETE' }),

  // Contact messages
  submitContactMessage: (data: { subject: string; message: string; email?: string }) =>
    apiFetch('/api/contact-messages', { method: 'POST', body: JSON.stringify(data) }),
  getContactMessages: () =>
    apiFetch('/api/contact-messages'),
  updateContactMessage: (id: string, data: Record<string, any>) =>
    apiFetch(`/api/contact-messages/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteContactMessage: (id: string) =>
    apiFetch(`/api/contact-messages/${id}`, { method: 'DELETE' }),

  // Game reports
  submitGameReport: (data: { gameId: string; gameTitle?: string; reason: string }) =>
    apiFetch('/api/game-reports', { method: 'POST', body: JSON.stringify(data) }),

  // Chat
  getChatMessages: () =>
    apiFetch('/api/chat'),
  sendChatMessage: (text: string) =>
    apiFetch('/api/chat', { method: 'POST', body: JSON.stringify({ text }) }),
};

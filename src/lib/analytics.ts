export const Analytics = {
  logEvent: (eventName: string, eventParams?: Record<string, any>) => {
    // In production, this would route to Google Analytics, PostHog, or Mixpanel.
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${eventName}`, eventParams || '');
    } else {
      // Mock production logging
      console.debug(`[Analytics] ${eventName}`, eventParams || '');
    }
  },
  
  trackGameOpen: (gameId: string, gameTitle: string) => {
    Analytics.logEvent('game_open', { game_id: gameId, game_title: gameTitle });
  },

  trackGamePlay: (gameId: string, gameTitle: string) => {
    Analytics.logEvent('game_play', { game_id: gameId, game_title: gameTitle });
  },

  trackCategoryVisit: (category: string) => {
    Analytics.logEvent('category_visit', { category });
  },

  trackSearch: (searchQuery: string, resultCount: number) => {
    Analytics.logEvent('search', { query: searchQuery, results: resultCount });
  },

  trackFavorite: (gameId: string, action: 'add' | 'remove') => {
    Analytics.logEvent('favorite_toggle', { game_id: gameId, action });
  },

  trackShare: (gameId: string) => {
    Analytics.logEvent('share', { game_id: gameId });
  }
};

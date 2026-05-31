import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { setToastGameMode } from '../lib/appToast';

/** Syncs compact toast mode when user is on a game route. */
export function ToastGameModeSync() {
  const { pathname } = useLocation();

  useEffect(() => {
    setToastGameMode(/^\/games\/[^/]+/.test(pathname));
  }, [pathname]);

  return null;
}

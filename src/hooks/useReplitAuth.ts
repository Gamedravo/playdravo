import { useState, useEffect } from 'react';
import { onAuthStateChanged, getRedirectResult, type User } from 'firebase/auth';
import { auth, logout as firebaseLogout, persistencePromise } from '../firebase';

export interface ReplitUser {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  username?: string | null;
  role?: string | null;
}

interface UseReplitAuthReturn {
  user: ReplitUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

function toAppUser(firebaseUser: typeof auth.currentUser): ReplitUser | null {
  if (!firebaseUser) return null;

  const [firstName, ...lastNameParts] = (firebaseUser.displayName || '').split(' ').filter(Boolean);

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    firstName: firstName || null,
    lastName: lastNameParts.join(' ') || null,
    profileImageUrl: firebaseUser.photoURL,
    username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || null,
  };
}

export function useReplitAuth(): UseReplitAuthReturn {
  const [user, setUser] = useState<ReplitUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let redirectUser: User | null = null;
    let unsubscribe: (() => void) | undefined;

    const finishLoading = (firebaseUser: User | null) => {
      if (!isMounted) return;
      setUser(toAppUser(firebaseUser));
      setIsLoading(false);
    };

    const startAuthListener = async () => {
      await persistencePromise;
      if (!isMounted) return;

      const redirectPromise = getRedirectResult(auth)
        .then((result) => {
          redirectUser = result?.user ?? null;
          if (redirectUser) {
            console.log('[OAuth] Redirect sign-in successful:', redirectUser.uid);
          }
        })
        .catch((error: { code?: string; message?: string }) => {
          if (error.code === 'auth/unauthorized-domain') {
            console.error(
              '[OAuth] This domain is not authorized in Firebase Console.\n' +
              'Go to Firebase Console → Authentication → Settings → Authorized domains\n' +
              'and add: ' + window.location.hostname
            );
          } else if (error.code && error.code !== 'auth/no-auth-event') {
            console.error('[OAuth] Redirect error:', error.code, error.message);
          }
        });

      let firstCall = true;

      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firstCall && !firebaseUser) {
          firstCall = false;
          redirectPromise.then(() => {
            finishLoading(auth.currentUser ?? redirectUser);
          });
          return;
        }

        firstCall = false;
        finishLoading(firebaseUser ?? redirectUser);
      });
    };

    startAuthListener();

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, []);

  const login = () => {
    window.dispatchEvent(new CustomEvent('open-login-modal'));
  };

  const logout = () => {
    firebaseLogout().catch(console.error);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}

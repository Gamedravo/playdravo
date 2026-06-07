import { useState, useEffect } from 'react';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { auth, logout as firebaseLogout } from '../firebase';

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
    // Process redirect result BEFORE letting onAuthStateChanged settle.
    // Without this, onAuthStateChanged fires with null on the first call
    // (before the redirect token is consumed), causing a flash of the Login button.
    const redirectPromise = getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log('[OAuth] Redirect sign-in successful:', result.user.uid);
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

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firstCall && !firebaseUser) {
        // First call with no user — may still be processing a redirect.
        // Wait for the redirect promise to resolve, then read the actual current user.
        firstCall = false;
        redirectPromise.then(() => {
          setUser(toAppUser(auth.currentUser));
          setIsLoading(false);
        });
      } else {
        firstCall = false;
        setUser(toAppUser(firebaseUser));
        setIsLoading(false);
      }
    });

    return unsubscribe;
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

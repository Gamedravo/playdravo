import { useState, useEffect } from 'react';

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

function readLocalFirebaseUser(): ReplitUser | null {
  try {
    const user = JSON.parse(localStorage.getItem('gamedravo:firebaseUser') || 'null');
    return user?.id ? user : null;
  } catch {
    return null;
  }
}

export function useReplitAuth(): UseReplitAuthReturn {
  const [user, setUser] = useState<ReplitUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadUser = () => {
      fetch('/api/auth/user')
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((data) => {
          if (cancelled) return;
          if (data && data.id) {
            setUser({
              id: data.id,
              email: data.email ?? null,
              firstName: data.firstName ?? null,
              lastName: data.lastName ?? null,
              profileImageUrl: data.profileImageUrl ?? null,
              username: data.username ?? null,
              role: data.role ?? null,
            });
          } else {
            setUser(readLocalFirebaseUser());
          }
        })
        .catch(() => {
          if (!cancelled) setUser(readLocalFirebaseUser());
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    };

    loadUser();
    window.addEventListener('gamedravo:auth-updated', loadUser);

    return () => {
      cancelled = true;
      window.removeEventListener('gamedravo:auth-updated', loadUser);
    };
  }, []);

  const login = () => {
    window.location.href = '/api/login';
  };

  const logout = () => {
    localStorage.removeItem('gamedravo:firebaseUser');
    window.location.href = '/api/logout';
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}

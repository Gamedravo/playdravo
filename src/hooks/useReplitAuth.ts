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

export function useReplitAuth(): UseReplitAuthReturn {
  const [user, setUser] = useState<ReplitUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/user')
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
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
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = () => {
    window.location.href = '/api/login';
  };

  const logout = () => {
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

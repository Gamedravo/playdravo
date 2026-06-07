import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
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
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(toAppUser(firebaseUser));
      setIsLoading(false);
    });
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

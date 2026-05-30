import React, { createContext, useContext, useState, useEffect } from 'react';
import { onSnapshot, doc, Timestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface EconomyContextType {
  coins: number;
  lastClaim: Timestamp | null;
  noAdsUntil: Timestamp | null;
  isLoading: boolean;
  isNoAdsActive: boolean;
}

const EconomyContext = createContext<EconomyContextType | undefined>(undefined);

export const EconomyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coins, setCoins] = useState(0);
  const [lastClaim, setLastClaim] = useState<Timestamp | null>(null);
  const [noAdsUntil, setNoAdsUntil] = useState<Timestamp | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNoAdsActive, setIsNoAdsActive] = useState(false);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Clear any previous snapshot listener
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (user) {
        const userRef = doc(db, 'users', user.uid);
        unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setCoins(data.coins || 0);
            setLastClaim(data.lastClaim || null);
            setNoAdsUntil(data.noAdsUntil || null);
            
            const until = data.noAdsUntil as Timestamp | undefined;
            if (until && until.toDate() > new Date()) {
              setIsNoAdsActive(true);
            } else {
              setIsNoAdsActive(false);
            }
          }
          setIsLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          setIsLoading(false);
        });
      } else {
        setCoins(0);
        setLastClaim(null);
        setNoAdsUntil(null);
        setIsNoAdsActive(false);
        setIsLoading(false);
      }
    });

    return () => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
      unsubscribeAuth();
    };
  }, []);

  return (
    <EconomyContext.Provider value={{ coins, lastClaim, noAdsUntil, isLoading, isNoAdsActive }}>
      {children}
    </EconomyContext.Provider>
  );
};

export const useEconomy = () => {
  const context = useContext(EconomyContext);
  if (context === undefined) {
    throw new Error('useEconomy must be used within an EconomyProvider');
  }
  return context;
};

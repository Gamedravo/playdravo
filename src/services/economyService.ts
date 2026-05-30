import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  Timestamp,
  increment,
  setDoc,
  runTransaction
} from 'firebase/firestore';
import { db } from '../firebase';

export interface UserEconomy {
  coins: number;
  lastClaim: Timestamp | null;
  noAdsUntil: Timestamp | null;
}

export const getUserEconomy = async (uid: string): Promise<UserEconomy | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      coins: data.coins || 0,
      lastClaim: data.lastClaim || null,
      noAdsUntil: data.noAdsUntil || null,
    };
  }
  return null;
};

export const claimDailyReward = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  
  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    
    if (!userDoc.exists()) {
      // Initialize user if they don't exist
      transaction.set(userRef, {
        uid,
        coins: 300,
        lastClaim: serverTimestamp(),
        createdAt: serverTimestamp(),
        displayName: 'Player', // Fallback
        email: '', // Fallback
        role: 'user'
      }, { merge: true });
      return;
    }

    const data = userDoc.data();
    const lastClaim = data.lastClaim as Timestamp | undefined;
    
    if (lastClaim) {
      const now = new Date();
      const lastClaimDate = lastClaim.toDate();
      const diffHours = (now.getTime() - lastClaimDate.getTime()) / (1000 * 60 * 60);
      
      if (diffHours < 24) {
        throw new Error('Daily reward already claimed. Please wait.');
      }
    }

    transaction.update(userRef, {
      coins: increment(300),
      lastClaim: serverTimestamp()
    });
  });
};

export interface NoAdsOption {
  id: string;
  durationDays: number;
  cost: number;
  label: string;
}

export const NO_ADS_OPTIONS: NoAdsOption[] = [
  { id: '24h', durationDays: 1, cost: 3000, label: '24 Hours' },
  { id: '3d', durationDays: 3, cost: 8000, label: '3 Days' },
  { id: '7d', durationDays: 7, cost: 15000, label: '7 Days' },
  { id: '14d', durationDays: 14, cost: 25000, label: '14 Days' },
  { id: '30d', durationDays: 30, cost: 45000, label: '30 Days' },
];

export const purchaseNoAds = async (uid: string, option: NoAdsOption) => {
  const userRef = doc(db, 'users', uid);
  
  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    
    if (!userDoc.exists()) throw new Error('User not found');
    
    const data = userDoc.data();
    const currentCoins = data.coins || 0;
    
    if (currentCoins < option.cost) {
      throw new Error('Insufficient coins');
    }

    const currentNoAdsUntil = data.noAdsUntil as Timestamp | undefined;
    let newUntilDate = new Date();
    
    if (currentNoAdsUntil && currentNoAdsUntil.toDate() > new Date()) {
      // Extend existing
      newUntilDate = new Date(currentNoAdsUntil.toDate().getTime() + option.durationDays * 24 * 60 * 60 * 1000);
    } else {
      // Start new
      newUntilDate = new Date(newUntilDate.getTime() + option.durationDays * 24 * 60 * 60 * 1000);
    }

    transaction.update(userRef, {
      coins: increment(-option.cost),
      noAdsUntil: Timestamp.fromDate(newUntilDate)
    });
  });
};

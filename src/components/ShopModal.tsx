import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Coins, Zap, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useEconomy } from './EconomyProvider';
import { claimDailyReward, purchaseNoAds, NO_ADS_OPTIONS, NoAdsOption } from '../services/economyService';
import { auth } from '../firebase';
import { toast } from 'sonner';
import { useNotifications } from './NotificationsProvider';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onLoginClick: () => void;
  isLoginOpen?: boolean;
}

export const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose, isDarkMode, onLoginClick, isLoginOpen }) => {
  const { coins, lastClaim, noAdsUntil, isNoAdsActive, isLoading } = useEconomy();
  const { addNotification } = useNotifications();
  const [isClaiming, setIsClaiming] = useState(false);
  const isClaimingRef = useRef(false);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const isPurchasingRef = useRef<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (lastClaim) {
        const now = new Date();
        const nextClaim = new Date(lastClaim.toDate().getTime() + 24 * 60 * 60 * 1000);
        const diff = nextClaim.getTime() - now.getTime();
        
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft('');
        }
      } else {
        setTimeLeft('');
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Then set interval
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [lastClaim]);

  const handleClaim = async () => {
    if (!auth.currentUser) {
      toast.error('Please login to claim rewards');
      onLoginClick();
      return;
    }
    
    if (isClaimingRef.current) return;
    
    isClaimingRef.current = true;
    setIsClaiming(true);
    try {
      await claimDailyReward(auth.currentUser.uid);
      toast.success('Daily reward claimed! +300 coins');
      addNotification({
        title: 'Daily Reward Claimed! 🪙',
        description: 'You claimed your daily free reward and received +300 coins!',
        type: 'coins'
      });
    } catch (error: any) {
      if (error.message && error.message.includes('already claimed')) {
        toast.error('Daily reward already claimed. Please wait.');
      } else {
        toast.error(error.message || 'Failed to claim reward');
      }
    } finally {
      setIsClaiming(false);
      isClaimingRef.current = false;
    }
  };

  const handlePurchase = async (option: NoAdsOption) => {
    if (!auth.currentUser) {
      toast.error('Please login to make purchases');
      onLoginClick();
      return;
    }
    
    if (coins < option.cost) {
      toast.error('Insufficient coins');
      return;
    }

    if (isPurchasingRef.current) return;

    isPurchasingRef.current = true;
    setIsPurchasing(option.id);
    try {
      await purchaseNoAds(auth.currentUser.uid, option);
      toast.success(`Successfully purchased ${option.label} No Ads!`);
      addNotification({
        title: 'Item Purchased! 🎉',
        description: `Successfully unlocked ${option.label} Ad-Free pass for ${option.cost} coins.`,
        type: 'coins'
      });
    } catch (error: any) {
      toast.error(error.message || 'Purchase failed');
    } finally {
      setIsPurchasing(null);
      isPurchasingRef.current = false;
    }
  };

  const canClaim = !isLoading && !timeLeft;

  return (
    <AnimatePresence initial={false}>
      <div className={`fixed inset-0 z-[1000] flex items-start justify-center p-4 pt-8 md:pt-12 ${isLoginOpen ? 'pointer-events-none opacity-50' : ''} transition-[visibility,pointer-events] duration-200 ${isOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}`}>
        <motion.div
          key="shop-modal-overlay"
          initial={false}
          animate={isOpen ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          key="shop-modal-container"
          initial={false}
          animate={isOpen ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className={`relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden ${
            isDarkMode ? 'bg-[#1a1a1a] border border-white/10' : 'bg-white border border-black/10'
          }`}
        >
            {/* Header */}
            <div className={`p-6 border-b flex items-center justify-between ${
              isDarkMode ? 'border-white/5' : 'border-black/5'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                  <Coins className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>Coin Shop</h2>
                  <p className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>Earn rewards and remove ads</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-colors ${
                  isDarkMode ? 'hover:bg-white/5 text-white/40' : 'hover:bg-black/5 text-black/40'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">
              {/* Daily Reward Section */}
              <section className="space-y-4">
                <h3 className={`text-sm font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                  Daily Rewards
                </h3>
                <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-6 ${
                  isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center border border-accent/20">
                      <Zap className="w-8 h-8 text-accent" />
                    </div>
                    <div>
                      <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>Daily Bonus</h4>
                      <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>Claim 300 free coins every day!</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center md:items-end gap-2">
                    <button
                      onClick={handleClaim}
                      disabled={!canClaim || isClaiming}
                      className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                        canClaim 
                          ? 'bg-accent text-bg-dark hover:scale-105 active:scale-95 shadow-lg shadow-accent/20' 
                          : 'bg-white/5 text-white/20 cursor-not-allowed'
                      }`}
                    >
                      {isClaiming ? 'Claiming...' : canClaim ? 'Claim +300' : 'Claimed'}
                    </button>
                    {timeLeft && (
                      <div className="flex items-center gap-1.5 text-xs text-accent">
                        <Clock className="w-3 h-3" />
                        <span>Next claim in: {timeLeft}</span>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* No Ads Shop Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                    No Ads Shop
                  </h3>
                  {isNoAdsActive && noAdsUntil && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold border border-green-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Active until: {noAdsUntil.toDate().toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {NO_ADS_OPTIONS.map((option) => (
                    <div
                      key={option.id}
                      className={`p-5 rounded-2xl border flex flex-col gap-4 transition-all ${
                        isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                          {option.label}
                        </span>
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <Zap className="w-4 h-4 text-accent" />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-accent" />
                        <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                          {option.cost.toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => handlePurchase(option)}
                        disabled={coins < option.cost || isPurchasing === option.id}
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                          coins >= option.cost
                            ? 'bg-white/10 text-white hover:bg-accent hover:text-bg-dark'
                            : 'bg-white/5 text-white/20 cursor-not-allowed'
                        }`}
                      >
                        {isPurchasing === option.id ? 'Processing...' : coins >= option.cost ? 'Purchase' : 'Need More Coins'}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className={`p-6 border-t flex items-center justify-center gap-2 ${
              isDarkMode ? 'border-white/5 bg-white/5' : 'border-black/5 bg-black/5'
            }`}>
              <AlertCircle className="w-4 h-4 text-accent" />
              <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                Purchases are non-refundable • Coins earned through daily rewards
              </p>
            </div>
          </motion.div>
      </div>
    </AnimatePresence>
  );
};

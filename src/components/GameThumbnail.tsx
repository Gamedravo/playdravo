import { useState, useEffect, useRef, memo } from 'react';
import { Gamepad2, Brain, Zap, Target, Trophy, Compass, Swords, Users, BookOpen } from 'lucide-react';
import { resolveGameThumbnail } from '../utils/gameUtils';

interface GameThumbnailProps {
  src: string;
  alt: string;
  className?: string;
  category?: string;
  title?: string;
  gameId?: string;
  priority?: boolean;
  referrerPolicy?: "no-referrer" | "origin" | "no-referrer-when-downgrade" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url";
}

export const GameThumbnail = memo(function GameThumbnail({ 
  src, 
  alt, 
  className = "w-full h-full object-cover", 
  category = "Arcade",
  title = "",
  gameId = "",
  priority = false,
  referrerPolicy = "no-referrer" 
}: GameThumbnailProps) {
  const resolvedSrc = resolveGameThumbnail(gameId, src);
  const [currentSrc, setCurrentSrc] = useState(resolvedSrc);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const next = resolveGameThumbnail(gameId, src);
    setCurrentSrc(next);
    setIsLoaded(false);
    setHasError(false);
  }, [src, gameId]);

  // Try category-specific fallback, then default fallback.
  const handleError = () => {
    const fallback = resolveGameThumbnail(gameId, '');
    if (fallback && fallback !== currentSrc) {
      setCurrentSrc(fallback);
      setHasError(false);
      setIsLoaded(false);
      return;
    }
    setHasError(true);
    setIsLoaded(false);
  };

  // Generate a beautiful premium seeded visual cover if artwork fails to find
  const renderCategoryFallback = () => {
    let IconComponent = Gamepad2;

    const lowerCat = (category || 'Arcade').toLowerCase();
    if (lowerCat.includes('puzzle')) IconComponent = Brain;
    else if (lowerCat.includes('action')) IconComponent = Zap;
    else if (lowerCat.includes('racing') || lowerCat.includes('car')) IconComponent = Trophy;
    else if (lowerCat.includes('adventure')) IconComponent = Compass;
    else if (lowerCat.includes('strategy')) IconComponent = Swords;
    else if (lowerCat.includes('sports')) IconComponent = Target;
    else if (lowerCat.includes('multiplayer') || lowerCat.includes('2 player') || lowerCat.includes('3 player') || lowerCat.includes('4 player')) IconComponent = Users;
    else if (lowerCat.includes('educational')) IconComponent = BookOpen;

    // Premium modern gradients to select from
    const gradients = [
      'from-[#141527] to-[#8031e8]', // Royal Neon Blue
      'from-[#110e24] to-[#ef4444]', // Crimson Horizon
      'from-[#160b24] to-[#ec4899]', // Cyber Pink Velvet
      'from-[#051c14] to-[#10b981]', // Matrix Mint
      'from-[#101424] to-[#f59e0b]', // Golden Horizon/Sunset
      'from-[#0c1824] to-[#06b6d4]', // Deep Cyan Speed
      'from-[#19192b] to-[#a855f7]', // Velvet Cosmic
      'from-[#1d1b33] to-[#ff6b35]', // Lava Pulse
    ];

    // Simple deterministic string parser seed generator
    const seedStr = gameId || title || alt || category;
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const gradientClass = gradients[Math.abs(hash) % gradients.length];
    const displayTitle = title || alt.replace(/Play | game online free/g, '').trim();

    return (
      <div className={`absolute inset-0 flex flex-col items-center justify-between p-4 bg-gradient-to-br ${gradientClass} border border-white/5 overflow-hidden w-full h-full`}>
        {/* Futuristic layout grids */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none" />
        
        <div className="w-full flex justify-end z-10 opacity-80">
          <span className="text-[8px] font-bold tracking-wide bg-white/10 px-1.5 py-0.5 rounded text-white/90 border border-white/10 uppercase">
            {category}
          </span>
        </div>

        {/* Big styled Icon */}
        <div className="relative my-auto flex flex-col items-center justify-center z-10 w-full">
          <div className="p-3 bg-white/5 border border-white/10 rounded-full shadow-inner mb-2 group-hover:scale-115 transition-transform duration-300">
            <IconComponent className="w-8 h-8 text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] animate-pulse" />
          </div>
          <span className="text-center text-xs font-black text-white/90 tracking-wide uppercase px-2 line-clamp-2 max-w-[85%] leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] font-sans">
            {displayTitle}
          </span>
        </div>

      </div>
    );
  };

  // Direct element assignment listener to solve synthetic React onLoad caching issues
  const imgRefCallback = (img: HTMLImageElement | null) => {
    imgRef.current = img;
    if (img) {
      if (img.complete) {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          setIsLoaded(true);
          setHasError(false);
        } else {
          handleError();
        }
      }
    }
  };

  return (
    <div className="relative overflow-hidden w-full h-full bg-[#0c0c18]">
      {(hasError || !currentSrc || !isLoaded) && (
        <div className={`absolute inset-0 z-0 transition-opacity duration-300 ${isLoaded && !hasError ? 'opacity-0' : 'opacity-100'}`}>
          {renderCategoryFallback()}
        </div>
      )}

      {/* Shimmer effect while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-white/[0.03] shimmer-overlay z-10 pointer-events-none" />
      )}

      {/* Actual Thumbnail Image */}
      {!hasError && currentSrc && (
        <img 
          ref={imgRefCallback}
          src={currentSrc} 
          alt={alt} 
          className={`${className} absolute inset-0 w-full h-full object-cover transition-[opacity,transform] duration-500 z-10 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          referrerPolicy={referrerPolicy}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onError={handleError}
          onLoad={() => {
            if (imgRef.current && imgRef.current.naturalWidth > 0) {
              setIsLoaded(true);
              setHasError(false);
            } else {
              handleError();
            }
          }}
        />
      )}
    </div>
  );
});


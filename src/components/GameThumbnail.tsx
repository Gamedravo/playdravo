import { useState, useEffect, useRef, memo, useMemo } from 'react';
import { buildThumbnailSources } from '../utils/gameUtils';
import { useInViewport } from '../hooks/useInViewport';

interface GameThumbnailProps {
  src: string;
  alt: string;
  className?: string;
  category?: string;
  title?: string;
  gameId?: string;
  priority?: boolean;
  size?: 'md' | 'lg';
  referrerPolicy?: "no-referrer" | "origin" | "no-referrer-when-downgrade" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url";
}

export const GameThumbnail = memo(function GameThumbnail({
  src,
  alt,
  className = 'w-full h-full object-cover object-center',
  gameId = '',
  priority = false,
  size = 'md',
  referrerPolicy = 'no-referrer',
}: GameThumbnailProps) {
  const [containerRef, inView] = useInViewport<HTMLDivElement>({
    rootMargin: '250px 0px',
    once: true,
  });

  const sources = useMemo(
    () => buildThumbnailSources(gameId, src, size),
    [gameId, src, size]
  );

  const shouldLoad = priority || inView;
  const [currentSrc, setCurrentSrc] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!shouldLoad) return;
    setCurrentSrc(sources.src);
    setIsLoaded(false);
    setHasError(false);
  }, [shouldLoad, sources.src]);

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  const imgRefCallback = (img: HTMLImageElement | null) => {
    imgRef.current = img;
    if (img?.complete && img.naturalWidth > 0) {
      setIsLoaded(true);
      setHasError(false);
    }
  };

  const showImage = Boolean(currentSrc) && !hasError && shouldLoad;

  return (
    <div ref={containerRef} className="relative overflow-hidden w-full h-full bg-[#0a0a12]">
      {!isLoaded && (shouldLoad || priority) && (
        <div
          className="absolute inset-0 z-[1] bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent animate-pulse"
          aria-hidden
        />
      )}

      {hasError && (
        <div className="absolute inset-0 z-[2] flex items-end p-2 bg-gradient-to-t from-black/90 via-black/50 to-[#12121e]">
          <span className="text-[10px] font-semibold text-white/70 line-clamp-2">{alt}</span>
        </div>
      )}

      {showImage && (
        <img
          ref={imgRefCallback}
          src={currentSrc}
          srcSet={sources.srcSet}
          sizes={sources.sizes}
          alt={alt}
          className={`${className} absolute inset-0 w-full h-full transition-opacity duration-150 z-[3] ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ imageRendering: 'auto' }}
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

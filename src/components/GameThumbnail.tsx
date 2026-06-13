import { useState, useEffect, useRef, memo, useMemo, useCallback } from 'react';
import { buildThumbnailSources, buildThumbnailFallbackChain } from '../utils/gameUtils';
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
  category,
  gameId = '',
  priority = false,
  size = 'md',
  referrerPolicy = 'no-referrer',
}: GameThumbnailProps) {
  const [containerRef, inView] = useInViewport<HTMLDivElement>({
    rootMargin: '500px 0px',
    once: true,
  });

  const sources = useMemo(
    () => buildThumbnailSources(gameId, src, size),
    [gameId, src, size]
  );

  const fallbackChain = useMemo(
    () => buildThumbnailFallbackChain(gameId, src, size, category),
    [gameId, src, size, category]
  );

  const shouldLoad = priority || inView;
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const currentSrc = fallbackChain[candidateIndex] ?? fallbackChain[fallbackChain.length - 1] ?? '';
  const useResponsive = candidateIndex === 0 && Boolean(sources.srcSet);

  useEffect(() => {
    if (!shouldLoad) return;
    setCandidateIndex(0);
    setIsLoaded(false);
  }, [shouldLoad, sources.src, fallbackChain.join('|')]);

  const advanceFallback = useCallback(() => {
    setIsLoaded(false);
    setCandidateIndex((prev) => {
      const next = prev + 1;
      return next < fallbackChain.length ? next : prev;
    });
  }, [fallbackChain.length]);

  const handleError = () => {
    if (candidateIndex < fallbackChain.length - 1) {
      advanceFallback();
    } else {
      setIsLoaded(true);
    }
  };

  const imgRefCallback = (img: HTMLImageElement | null) => {
    imgRef.current = img;
    if (img?.complete && img.naturalWidth > 0) {
      setIsLoaded(true);
    }
  };

  const showImage = Boolean(currentSrc) && shouldLoad;

  return (
    <div ref={containerRef} className="relative overflow-hidden w-full h-full bg-[#0a0a12]">
      {!isLoaded && shouldLoad && (
        <div
          className="absolute inset-0 z-[1] bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent animate-pulse"
          aria-hidden
        />
      )}

      {showImage && (
        <img
          key={currentSrc}
          ref={imgRefCallback}
          src={currentSrc}
          srcSet={useResponsive ? sources.srcSet : undefined}
          sizes={useResponsive ? sources.sizes : undefined}
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
            } else {
              handleError();
            }
          }}
        />
      )}
    </div>
  );
});

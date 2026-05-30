import { useState } from 'react';
import { Gamepad2 } from 'lucide-react';

interface GameThumbnailProps {
  src: string;
  alt: string;
  className?: string;
  referrerPolicy?: "no-referrer" | "origin" | "no-referrer-when-downgrade" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url";
}

export function GameThumbnail({ src, alt, className = "w-full h-full object-cover", referrerPolicy = "no-referrer" }: GameThumbnailProps) {
  const [error, setError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-accent/10 ${className}`}>
        <Gamepad2 className="w-1/2 h-1/2 text-accent/40" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-white/5 shimmer-overlay z-10" />
      )}
      <img 
        src={src} 
        alt={alt} 
        className={`${className} transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        referrerPolicy={referrerPolicy}
        loading="lazy"
        decoding="async"
        onError={() => setError(true)}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}

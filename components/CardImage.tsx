"use client";

import { useState } from "react";

type CardImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
};

/**
 * Shared card image component used across search and portfolio.
 * Shows the image when it loads, and falls back to a soft placeholder if
 * the URL is missing or fails to load.
 */
export function CardImage({ src, alt, className = "" }: CardImageProps) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-md bg-surface-soft ${className}`}
      aria-label={alt}
      role="img"
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="max-h-full max-w-full object-contain"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center px-2 text-xs font-medium leading-snug text-text-muted text-center">
          Image not available
        </div>
      )}
    </div>
  );
}


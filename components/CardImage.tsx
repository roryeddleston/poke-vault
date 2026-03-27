"use client";

import Image from "next/image";
import { useState } from "react";

type CardImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  unoptimized?: boolean;
};

/**
 * Shared card image component used across search and portfolio.
 * Shows the image when it loads, and falls back to a soft placeholder if
 * the URL is missing or fails to load.
 */
export function CardImage({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "80px",
  unoptimized = false,
}: CardImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const hasValidSrc = isValidImageSrc(src);
  const showImage = hasValidSrc && !failed;
  const effectiveSrc = hasValidSrc ? src : null;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-md bg-surface-soft ${className}`}
      aria-label={alt}
      role="img"
    >
      {showImage ? (
        <Image
          key={effectiveSrc ?? "no-src"}
          src={effectiveSrc as string}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={unoptimized}
          className={`object-contain transition-opacity duration-200 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
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

function isValidImageSrc(src?: string | null): src is string {
  if (!src) return false;
  if (src.includes("undefined")) return false;

  try {
    const url = new URL(src);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}


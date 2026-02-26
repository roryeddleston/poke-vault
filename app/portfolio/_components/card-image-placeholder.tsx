/**
 * Placeholder for card image until image URLs are available. Uses first letter for a11y.
 */
type CardImagePlaceholderProps = {
  name: string;
  className?: string;
};

export function CardImagePlaceholder({
  name,
  className = "",
}: CardImagePlaceholderProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={`flex aspect-2/3 w-12 items-center justify-center rounded-lg bg-surface-soft text-lg font-semibold text-text-muted sm:w-14 ${className}`}
      role="img"
      aria-label={`Card: ${name}`}
    >
      {initial}
    </div>
  );
}

/** Official-style "Built for Shopify" badge — light-blue pill + cyan diamond.
 *  `compact` shrinks it so it can sit inline alongside the app icon. */
export function BuiltForShopifyBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-lg bg-[#d5ecf6] font-semibold text-neutral-900 ${
        compact ? "gap-1 px-1.5 py-0.5 text-[10px]" : "gap-1.5 px-3 py-1.5 text-[13px]"
      }`}
    >
      <svg viewBox="0 0 24 24" className={`shrink-0 ${compact ? "size-3" : "size-4"}`} aria-hidden>
        <path d="M8 3 L4 8 L9 8 Z" fill="#9fe3f2" />
        <path d="M16 3 L20 8 L15 8 Z" fill="#9fe3f2" />
        <path d="M8 3 L16 3 L15 8 L9 8 Z" fill="#6fd3ea" />
        <path d="M4 8 L9 8 L12 21 Z" fill="#3fb4d6" />
        <path d="M9 8 L15 8 L12 21 Z" fill="#4bbfe0" />
        <path d="M15 8 L20 8 L12 21 Z" fill="#3fb4d6" />
      </svg>
      Built for Shopify
    </span>
  );
}

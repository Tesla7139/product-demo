"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Deterministic hue from a string, so each product tile is distinct but stable. */
function hueFrom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}

/** First letters of the product name for the monogram (e.g. "Best Seller" -> "BS"). */
function monogram(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "•";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Product image that always renders something. If the store has no image, or the
 * remote URL fails to load (e.g. non-Shopify stores that fall back to the sample
 * catalog), it shows a designed monogram tile — a soft, per-product gradient with
 * the product's initials — so the demo never looks broken for any URL.
 */
export function DemoImg({
  src,
  alt = "",
  className,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
}) {
  const [ok, setOk] = useState(true);
  if (src && ok) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote product images from any store
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setOk(false)}
      />
    );
  }

  const hue = hueFrom(alt || "product");
  return (
    <div
      aria-hidden
      className={cn("flex items-center justify-center overflow-hidden", className)}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 55% 94%) 0%, hsl(${(hue + 40) % 360} 50% 86%) 100%)`,
      }}
    >
      <span
        className="select-none font-semibold tracking-tight"
        style={{ color: `hsl(${hue} 45% 42%)`, fontSize: "clamp(1rem, 34%, 2rem)" }}
      >
        {monogram(alt)}
      </span>
    </div>
  );
}

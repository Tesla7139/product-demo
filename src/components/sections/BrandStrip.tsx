"use client";

import { Marquee } from "@/components/primitives/Marquee";
import { customerLogos, extraReviewLogos } from "@/lib/site";

// Every brand logo we have — the curated strip logos + the /reviews-only extras,
// deduped by file so a brand never appears twice.
const ALL_LOGOS = (() => {
  const seen = new Set<string>();
  const out: { name: string; src: string }[] = [];
  for (const c of customerLogos) {
    if (c.src && !seen.has(c.src)) {
      seen.add(c.src);
      out.push({ name: c.name, src: c.src });
    }
  }
  for (const [name, src] of Object.entries(extraReviewLogos)) {
    if (!seen.has(src)) {
      seen.add(src);
      out.push({ name, src });
    }
  }
  return out;
})();

/** Full-width marquee of every customer brand logo. Used atop the Wall of Love. */
export function BrandStrip() {
  const items = ALL_LOGOS.map((l) => (
    <span key={l.src} className="flex h-14 w-40 items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- local customer logo assets */}
      <img
        src={l.src}
        alt={l.name}
        className="max-h-9 max-w-[140px] object-contain opacity-60 transition-opacity duration-300 hover:opacity-100"
        style={{ filter: "brightness(0)" }}
      />
    </span>
  ));

  return <Marquee items={items} duration={55} />;
}

"use client";

import { Star } from "lucide-react";
import { Marquee } from "@/components/primitives/Marquee";
import { reviews } from "@/lib/reviews";

// 25 real reviews from the Shopify App Store export for the moving strip.
const STRIP_REVIEWS = reviews.slice(0, 25);

function ReviewChip({ name, content }: { name: string; content: string }) {
  return (
    <div className="flex h-[132px] w-[320px] shrink-0 flex-col justify-between rounded-2xl border border-border bg-white p-4 shadow-soft-md">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="line-clamp-3 text-[13px] leading-snug text-foreground">
        &ldquo;{content.replace(/\s*\n\s*/g, " ")}&rdquo;
      </p>
      <div className="truncate text-[12px] font-semibold text-muted-foreground">
        {name} · Verified Shopify review
      </div>
    </div>
  );
}

/** A strip of 25 real reviews that scrolls in the opposite direction to the brand strip. */
export function ReviewMarquee() {
  const items = STRIP_REVIEWS.map((r) => <ReviewChip key={r.id} name={r.name} content={r.content} />);
  return <Marquee items={items} duration={70} reverse className="py-1" />;
}

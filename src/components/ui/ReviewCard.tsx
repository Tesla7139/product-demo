import { Star } from "lucide-react";
import { Review } from "@/lib/reviews";
import { customerLogos, extraReviewLogos } from "@/lib/site";

// Brand logos, keyed by lowercase name: the strip logos + the /reviews-only extras.
const LOGOS = [
  ...customerLogos.filter((c) => c.src).map((c) => ({ name: c.name.toLowerCase(), src: c.src as string })),
  ...Object.entries(extraReviewLogos).map(([name, src]) => ({ name: name.toLowerCase(), src })),
];

/**
 * Find a logo for a review's store name — EXACT match only.
 * Loose/substring matching made different brands (e.g. "Westside" vs
 * "Westside Global") share one logo, so it looked like the same brand
 * repeated. If there's no exact logo, the card falls back to the text name.
 */
function findLogo(name: string): string | undefined {
  const n = name.toLowerCase().trim();
  return LOGOS.find((l) => l.name === n)?.src;
}

export function ReviewCard({ review }: { review: Review }) {
  const { name, date, content } = review;
  const logo = findLogo(name);

  return (
    <div className="w-full rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
      {/* 5-star rating */}
      <div className="mb-3 flex items-center gap-0.5 text-amber-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="size-4 fill-current stroke-current" />
        ))}
      </div>

      {/* review text */}
      <p className="text-[15px] font-medium leading-relaxed text-black/80">{content}</p>

      {/* footer: brand (logo when available) + date */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-black/5 pt-3">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- local customer logo assets
          <img src={logo} alt={name} className="max-h-5 max-w-[110px] object-contain object-left brightness-0" />
        ) : (
          <span className="text-[13px] font-bold text-black">{name}</span>
        )}
        <span className="shrink-0 text-[12.5px] font-medium text-black/40">{date}</span>
      </div>
    </div>
  );
}

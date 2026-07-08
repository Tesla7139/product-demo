import { Star } from "lucide-react";
import { Review } from "@/lib/reviews";
import { customerLogos } from "@/lib/site";

// Brand logos from the strip, keyed by lowercase name (only those with an image).
const LOGOS = customerLogos
  .filter((c) => c.src)
  .map((c) => ({ name: c.name.toLowerCase(), src: c.src as string }));

/** Find a strip logo for a review's store name (exact, then a safe loose match). */
function findLogo(name: string): string | undefined {
  const n = name.toLowerCase().trim();
  const exact = LOGOS.find((l) => l.name === n);
  if (exact) return exact.src;
  const loose = LOGOS.find((l) => n.length >= 5 && (l.name.includes(n) || n.includes(l.name)));
  return loose?.src;
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
          <img src={logo} alt={name} className="max-h-6 max-w-[140px] object-contain brightness-0" />
        ) : (
          <span className="text-[13px] font-bold text-black">{name}</span>
        )}
        <span className="shrink-0 text-[12.5px] font-medium text-black/40">{date}</span>
      </div>
    </div>
  );
}

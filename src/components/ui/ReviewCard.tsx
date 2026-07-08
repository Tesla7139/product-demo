import { Star } from "lucide-react";
import { Review } from "@/lib/reviews";

export function ReviewCard({ review }: { review: Review }) {
  const { name, date, content } = review;

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

      {/* footer: brand + date */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-black/5 pt-3">
        <span className="text-[13px] font-bold text-black">{name}</span>
        <span className="shrink-0 text-[12.5px] font-medium text-black/40">{date}</span>
      </div>
    </div>
  );
}

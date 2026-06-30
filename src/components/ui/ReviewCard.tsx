import { Review } from "@/lib/reviews";
import { cn } from "@/lib/utils";

export function ReviewCard({ review }: { review: Review }) {
  const { name, date, content, color, font } = review;
  const isLight = color === "white";

  return (
    <div className="group relative w-full select-none transition-transform duration-300 hover:scale-[1.01]">
      {/* Card body */}
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl px-6 pb-5 pt-5 text-black shadow-sm",
          color === "orange" && "bg-[#F47C2E]",
          color === "blue" && "bg-[#3FB7E8]",
          color === "green" && "bg-[#16C257]",
          isLight && "border border-black/15 bg-[#FAF9F6]"
        )}
        style={{ clipPath: "polygon(20px 0, 100% 0, 100% 100%, 0 100%, 0 20px)" }}
      >
        {/* Text frame: top + left + bottom lines (right side open) */}
        <div className="relative border-b border-l border-t border-black/55 pb-6 pl-5 pr-3 pt-7">
          {/* punch-hole dots sitting on the top line */}
          <div className="absolute -top-[5px] left-3 flex gap-2" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="size-1.5 rounded-full bg-black/70" />
            ))}
          </div>
          <div className="absolute -top-[5px] right-3 flex gap-2" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className="size-1.5 rounded-full bg-black/70" />
            ))}
          </div>

          <p
            className={cn(
              "text-[15px] leading-relaxed text-black/90",
              font === "serif" ? "font-serif font-normal" : "font-sans font-medium"
            )}
          >
            {content}
          </p>
        </div>

        {/* Footer band (below the bottom line) */}
        <div className="mt-4 flex items-start justify-between gap-3 pl-1 font-mono text-[12px] font-bold uppercase tracking-[0.14em] text-black">
          <span className="leading-snug">{name}</span>
          <span className="shrink-0 text-right leading-snug">{date}</span>
        </div>
      </div>

      {/* Notch tick + drafting node over the cut corner (sibling so it isn't clipped) */}
      <svg
        className="pointer-events-none absolute -left-px -top-px size-12 overflow-visible"
        aria-hidden="true"
      >
        <line x1="6" y1="6" x2="26" y2="26" className="stroke-black/55 stroke-[1.5px]" />
        <rect x="1.5" y="1.5" width="6" height="6" className="fill-none stroke-black/55 stroke-[1.5px]" />
      </svg>
    </div>
  );
}

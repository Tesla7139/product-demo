"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Container } from "@/components/primitives/Container";
import { ReviewCard } from "@/components/ui/ReviewCard";
import { reviews, type Review } from "@/lib/reviews";
import { Button } from "@/components/ui/button";

const INITIAL_COUNT = 12;
const INCREMENT_COUNT = 12;
const MAX_REVIEWS_COUNT = 51;

// Re-colored: mostly orange/green/blue, white only occasionally.
// Deterministic pattern (no random) so SSR and client match.
const PALETTE: Review["color"][] = [
  "orange",
  "green",
  "blue",
  "green",
  "orange",
  "blue",
  "orange",
  "green",
  "blue",
  "white",
  "green",
  "orange",
  "blue",
  "green",
  "orange",
];

// ---- Review ranking --------------------------------------------------------
// Rank by (1) store size / notability, (2) quantified impact, (3) detail.
// Then a diversity pass surfaces a review for each *different reason* the app
// helped, so the top rows aren't all the same story.

// Notable / larger brands in the export (bumped to the top tier).
const BIG_STORES = new Set([
  "V-Guard Industries Limited",
  "Mars By GHC",
  "MyBorosil",
  "Westside",
  "Westside Global",
  "Samoh by TATA",
  "Samoh International",
  "Starquik",
  "Bacca Bucci",
  "Amrutam",
  "Wellbeing Nutrition",
  "Doonails",
  "Renue By Science",
  "World of Asaya",
  "HoneyVeda",
  "GHAR SOAPS",
  "Paradyes",
]);

// Does the review cite a measurable / quantified outcome?
function isQuantified(text: string) {
  return (
    /\b\d+\s*(%|percent|hours?|hrs?|tickets?|orders?|days?|weeks?|months?|x)\b/i.test(text) ||
    /\$\s?\d/.test(text) ||
    /\b(reduc|cut|sav(e|ed|ing)|fewer|drastically|increas|boost|extra revenue|less\s|streamlin)/i.test(
      text
    )
  );
}

// Which "reason it helped" does this review primarily speak to?
function reasonOf(text: string) {
  const t = text.toLowerCase();
  if (/(ticket|support inbox|queries|customer service|cs team|support request)/.test(t))
    return "tickets";
  if (/(upsell|aov|average order|revenue|cross[- ]?sell|incremental)/.test(t)) return "revenue";
  if (/address/.test(t)) return "address";
  if (/(cancel|refund)/.test(t)) return "cancellations";
  if (/(time|hours|manual|streamlin|efficien)/.test(t)) return "time";
  if (/(support team|helpful|responsive|onboard|set ?up|easy|integrat|smooth|quick to)/.test(t))
    return "support";
  if (/(customer experience|customers love|flexibilit|self[- ]?serv|post[- ]?purchase|empower)/.test(t))
    return "experience";
  return "general";
}

function scoreReview(r: Review) {
  let s = 0;
  if (BIG_STORES.has(r.name)) s += 100;
  if (isQuantified(r.content)) s += 40;
  s += Math.min(r.content.length, 320) / 30; // reward a bit of detail
  return s;
}

const rankedReviews: Review[] = (() => {
  const sorted = [...reviews].sort((a, b) => scoreReview(b) - scoreReview(a));
  // Diversity pass: pull the best review for each distinct reason to the front.
  const seen = new Set<string>();
  const top: Review[] = [];
  const rest: Review[] = [];
  for (const r of sorted) {
    const reason = reasonOf(r.content);
    if (!seen.has(reason)) {
      seen.add(reason);
      top.push(r);
    } else {
      rest.push(r);
    }
  }
  return [...top, ...rest];
})();

const displayedReviews: Review[] = rankedReviews
  .slice(0, MAX_REVIEWS_COUNT)
  .map((r, i) => ({ ...r, color: PALETTE[i % PALETTE.length] }));

export default function ReviewsPage() {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  const visible = displayedReviews.slice(0, visibleCount);

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + INCREMENT_COUNT, displayedReviews.length));
  };

  const hasMore = visibleCount < displayedReviews.length;

  return (
    <div className="bg-[#FAF9F6] text-black min-h-screen pt-2 pb-16">
      {/* 1. Header Section */}
      <section className="relative overflow-hidden pb-2 pt-6 md:pt-8">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1
              className="font-serif font-normal tracking-tight text-black"
              style={{ fontSize: "clamp(2.25rem,5vw,3.25rem)", lineHeight: 1.05 }}
            >
              Love Gallery
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base md:text-lg text-black/70 leading-relaxed font-medium">
              See what real store owners are saying about using Clickpost Order Editing to
              streamline their post-purchase experience. 50+ reviews from the
              Shopify App Store.
            </p>

            {/* Star Rating Badge */}
            <div className="mt-7 flex items-center justify-center gap-2.5">
              <div className="flex items-center gap-1 text-yellow-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-6 fill-current stroke-current" />
                ))}
              </div>
              <span className="text-base md:text-lg font-bold text-black/80">
                5.0 on Shopify App Store
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Wall of Love Section */}
      <section className="mt-10 md:mt-16 pt-10 md:pt-14 pb-6 border-t border-black/5">
        <Container>
          {/* Section Subheading */}
          <div className="mb-4">
            <h2
              className="font-sans font-extrabold tracking-tight text-black"
              style={{ fontSize: "clamp(2.25rem,5vw,3.25rem)", lineHeight: 1.05 }}
            >
              Wall of love
            </h2>
            <p className="mt-2 text-sm text-black/50 font-medium">
              {displayedReviews.length} five-star merchant reviews — synced from our public App Store listing.
            </p>
          </div>

          {/* Masonry: content-sized cards packed tightly (browser-balanced columns) */}
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
            {visible.map((review) => (
              <div key={review.id} className="mb-6 break-inside-avoid">
                <ReviewCard review={review} />
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-16 flex justify-center">
              <Button
                onClick={handleShowMore}
                size="lg"
                className="rounded-full bg-black text-white hover:bg-black/90 px-8 py-6 text-sm font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Show more reviews
              </Button>
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}

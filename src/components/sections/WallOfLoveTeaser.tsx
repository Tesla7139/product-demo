import { Container } from "@/components/primitives/Container";
import { ReviewCard } from "@/components/ui/ReviewCard";
import { reviews } from "@/lib/reviews";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function WallOfLoveTeaser() {
  // Six featured reviews (two rows), each given a distinct color (the raw data
  // color is uniform, so we assign them here to mirror the varied Love Gallery look).
  const palette = ["orange", "green", "blue", "green", "blue", "orange"] as const;
  const featured = reviews.slice(0, 6).map((r, i) => ({ ...r, color: palette[i] }));

  return (
    <section className="py-20 md:py-28 border-t border-black/5 bg-[#FAF9F6]">
      <Container>
        <div className="mx-auto max-w-3xl text-center mb-14">
          <span className="font-semibold uppercase tracking-[0.12em] text-primary text-sm md:text-base">
            Wall of Love
          </span>
          <h2
            className="mt-3 font-serif font-normal tracking-tight text-black"
            style={{ fontSize: "clamp(1.875rem,4vw,2.75rem)", lineHeight: 1.1 }}
          >
            Loved by fast-growing brands
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-black/60 font-medium">
            See how merchants use Clickpost Order Editing to automate customer service and recover
            cart revenue.
          </p>
        </div>

        {/* 3-column teaser grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {featured.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* Call to Action to dedicated gallery */}
        <div className="mt-12 flex justify-center">
          <Button asChild size="lg" className="rounded-full bg-black text-white hover:bg-black/90 px-8 py-6 text-sm font-semibold shadow-md active:scale-95 transition-all cursor-pointer">
            <Link href="/reviews">
              See all 51 reviews in our Love Gallery →
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}

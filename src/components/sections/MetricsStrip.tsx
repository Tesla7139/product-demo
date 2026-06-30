"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/primitives/Container";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

const RESULTS = [
  {
    stat: "42%",
    heading: "Fewer support tickets",
    body: "Customers correct addresses, swap sizes, and cancel on their own — the problems that used to stack up in your inbox resolve themselves.",
  },
  {
    stat: "+18%",
    heading: "Higher average order value",
    body: "The thank-you page becomes your best upsell moment. Shoppers add with one tap, no re-checkout, charged to the card already on file.",
  },
  {
    stat: "5.0 ★",
    heading: "Rated on Shopify",
    body: "51 merchant reviews, no paid placement. The highest-rated order editing app on the App Store, start to finish.",
  },
];

export function MetricsStrip() {
  return (
    <section id="metrics" className="py-20 md:py-24">
      <Container>
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-0 divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0"
        >
          {RESULTS.map((r, i) => (
            <motion.div
              key={r.stat}
              variants={fadeUp}
              className={`flex flex-col gap-3 py-8 md:py-0 ${
                i === 0 ? "md:pr-10" : i === 1 ? "md:px-10" : "md:pl-10"
              }`}
            >
              <div
                className="font-serif text-[2rem] font-bold leading-none tracking-tight text-foreground"
                style={{ letterSpacing: "-0.025em" }}
              >
                {r.stat}
              </div>
              <div className="text-[0.9rem] font-semibold text-foreground">{r.heading}</div>
              <p className="text-sm leading-relaxed text-muted-foreground">{r.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}

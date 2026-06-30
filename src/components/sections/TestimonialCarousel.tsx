"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Container } from "@/components/primitives/Container";

// Placeholder testimonials — original sample copy, replace with real ones.
const testimonials = [
  {
    quote:
      "Our support team stopped drowning in address-change emails. Shoppers just fix it themselves now.",
    name: "Sample Customer",
    role: "Head of CX · Placeholder Brand",
  },
  {
    quote:
      "Post-purchase upsells added a real bump to AOV without touching our checkout flow.",
    name: "Sample Customer",
    role: "Founder · Placeholder Co.",
  },
  {
    quote:
      "Edits sync straight to our 3PL, so the warehouse always ships the corrected order. No more chaos.",
    name: "Sample Customer",
    role: "Ops Lead · Placeholder Goods",
  },
];

export function TestimonialCarousel() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);

  const go = useCallback(
    (next: number) => {
      setDir(next > i || (i === testimonials.length - 1 && next === 0) ? 1 : -1);
      setI((next + testimonials.length) % testimonials.length);
    },
    [i]
  );

  useEffect(() => {
    const id = setInterval(() => {
      setDir(1);
      setI((v) => (v + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const t = testimonials[i];

  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="mx-auto max-w-3xl">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-soft-md md:p-12">
            <Quote className="size-10 text-primary/20" />
            <div className="relative mt-4 min-h-[7rem]">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.blockquote
                  key={i}
                  custom={dir}
                  initial={{ opacity: 0, x: dir * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -40 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className="text-balance text-xl font-medium leading-relaxed text-foreground md:text-2xl">
                    “{t.quote}”
                  </p>
                  <footer className="mt-6 flex items-center gap-3">
                    {/* placeholder avatar */}
                    <div className="size-11 rounded-full bg-background-muted" aria-hidden />
                    <div>
                      <div className="text-sm font-semibold text-foreground">{t.name}</div>
                      <div className="text-sm text-muted-foreground">{t.role}</div>
                    </div>
                  </footer>
                </motion.blockquote>
              </AnimatePresence>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div className="flex gap-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => go(idx)}
                    aria-label={`Go to testimonial ${idx + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      idx === i ? "w-6 bg-primary" : "w-2 bg-border"
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => go(i - 1)}
                  aria-label="Previous"
                  className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  onClick={() => go(i + 1)}
                  aria-label="Next"
                  className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

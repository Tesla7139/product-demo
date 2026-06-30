"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin } from "lucide-react";
import { Container } from "@/components/primitives/Container";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { globeEvents } from "@/lib/site";

/** Live-ticking counters that read as the product working across the globe. */
function LiveCounter({
  base,
  prefix = "",
  suffix = "",
  label,
  rate,
}: {
  base: number;
  prefix?: string;
  suffix?: string;
  label: string;
  rate: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [n, setN] = useState(base);

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setN((v) => v + Math.ceil(Math.random() * rate)), 1800);
    return () => clearInterval(id);
  }, [inView, rate]);

  return (
    <div ref={ref} className="flex flex-col gap-1">
      <span className="text-h2 tabular-nums" style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)" }}>
        {prefix}
        {n.toLocaleString("en-US")}
        {suffix}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

function EventTicker() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % globeEvents.length), 2400);
    return () => clearInterval(id);
  }, []);
  const e = globeEvents[i];
  return (
    <div className="flex h-7 items-center gap-2 text-sm">
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-primary" />
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="flex items-center gap-1.5 text-muted-foreground"
        >
          <span className="font-medium text-foreground">{e.label}</span>
          <MapPin className="size-3.5" />
          {e.city}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export function GlobalReach() {
  return (
    <section className="relative py-24 md:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center text-scrim rounded-3xl p-4">
          <SectionHeading
            eyebrow="Every region, every order"
            title="Orders getting saved around the world"
            subtitle="Each ping is a shopper self-serving instead of opening a ticket."
          />
          <div className="mt-6 flex justify-center">
            <EventTicker />
          </div>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-10 sm:grid-cols-3">
          <LiveCounter base={128430} label="Edits handled" rate={4} />
          <LiveCounter base={742900} prefix="$" label="Upsell revenue" rate={120} />
          <LiveCounter base={31280} label="Cancellations recovered" rate={2} />
        </div>
      </Container>
    </section>
  );
}

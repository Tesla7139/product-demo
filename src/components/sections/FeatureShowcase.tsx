"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Container } from "@/components/primitives/Container";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { features, type Feature } from "@/lib/site";
import { fadeUp, viewportOnce, transitions } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Placeholder product visual. Shaped to the real screenshot; swap later. */
function FeaturePlaceholder({ icon: Icon, flip }: { icon: Feature["icon"]; flip: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: flip ? -28 : 28 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={viewportOnce}
      transition={transitions.enter}
      className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-card shadow-soft-xl"
    >
      {/* TODO: replace placeholder with real product screenshot */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,var(--accent-soft),transparent_60%)]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-9" />
        </div>
      </div>
      {/* faux UI chrome */}
      <div className="absolute left-4 right-4 top-4 flex gap-1.5">
        <span className="size-2 rounded-full bg-border" />
        <span className="size-2 rounded-full bg-border" />
        <span className="size-2 rounded-full bg-border" />
      </div>
      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        <div className="h-2.5 w-2/3 rounded bg-background-muted" />
        <div className="h-2.5 w-1/2 rounded bg-background-muted" />
      </div>
      <span className="absolute bottom-2 right-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/50">
        Placeholder
      </span>
    </motion.div>
  );
}

function FeatureRow({ feature, index }: { feature: Feature; index: number }) {
  const flip = index % 2 === 1;
  return (
    <div className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        className={cn("flex flex-col gap-4", flip && "md:order-2")}
      >
        <motion.span variants={fadeUp} className="text-eyebrow text-primary">
          {feature.eyebrow}
        </motion.span>
        <motion.h3 variants={fadeUp} className="text-h2" style={{ fontSize: "clamp(1.6rem,2.6vw,2.25rem)" }}>
          {feature.title}
        </motion.h3>
        <motion.p variants={fadeUp} className="max-w-md text-muted-foreground">
          {feature.blurb}
        </motion.p>
        <motion.ul variants={fadeUp} className="mt-1 flex flex-col gap-2.5">
          {feature.bullets.map((b) => (
            <li key={b} className="flex items-center gap-2.5 text-sm text-foreground/90">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Check className="size-3" />
              </span>
              {b}
            </li>
          ))}
        </motion.ul>
      </motion.div>
      <div className={cn(flip && "md:order-1")}>
        <FeaturePlaceholder icon={feature.icon} flip={flip} />
      </div>
    </div>
  );
}

export function FeatureShowcase() {
  return (
    <section id="features" className="py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="The platform"
          title="Everything shoppers need to fix an order"
          subtitle="Six capabilities that turn post-purchase chaos into self-service."
        />
        <div className="mt-16 flex flex-col gap-20 md:gap-28">
          {features.map((f, i) => (
            <FeatureRow key={f.title} feature={f} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}

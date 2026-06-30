"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Container } from "@/components/primitives/Container";
import { SetupPanel } from "./demo/SetupPanel";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

export function SetupSection() {
  return (
    <section id="setup" className="py-20 md:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: copy */}
          <motion.div
            variants={staggerContainer(0.09)}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
          >
            <motion.span variants={fadeUp} className="text-eyebrow text-primary">
              Setup
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-h2 mt-3 text-balance">
              You stay in control of the rules
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 max-w-md text-muted-foreground">
              Decide how long shoppers can edit, and exactly what they’re allowed to change — no
              code, live in minutes.
            </motion.p>
            <motion.ul variants={fadeUp} className="mt-7 flex flex-col gap-3.5">
              {[
                "Set an editing window by time or until fulfilled",
                "Toggle each action on or off",
                "Changes sync straight to your fulfillment stack",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm text-foreground/90">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="size-3.5" />
                  </span>
                  {t}
                </li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Right: interactive setup box (shared with the product demo) */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mx-auto"
          >
            <SetupPanel />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

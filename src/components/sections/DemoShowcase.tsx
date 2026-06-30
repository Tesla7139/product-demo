"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/primitives/Container";
import { HeroPhone } from "./HeroPhone";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function DemoShowcase() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* LEFT — context */}
          <motion.div
            variants={staggerContainer(0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            <motion.p variants={fadeUp} className="text-eyebrow mb-4 text-primary">
              See it in action
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-h2 max-w-md text-balance text-foreground">
              Self-serve order editing, start to finish
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 max-w-md text-muted-foreground">
              Customers fix their own addresses, swap items, and accept upsells — right on your
              branded confirmation page. Every change syncs to your 3PL in real time, so orders ship
              right the first time and your team never touches a ticket.
            </motion.p>
          </motion.div>

          {/* RIGHT — browser-window demo */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <HeroPhone />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

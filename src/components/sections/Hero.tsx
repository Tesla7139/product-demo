"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Container } from "@/components/primitives/Container";
import { DemoUrlInput } from "./demo/DemoUrlInput";
import { DemoExperience } from "./demo/DemoExperience";
import { CustomerLogos } from "./CustomerLogos";
import { useDemoData } from "@/hooks/useDemoData";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function Hero() {
  const { status, store, generate, reset } = useDemoData();
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || status === "loading") return;
    setOpen(true);
    await generate(url.trim());
  };

  const close = () => {
    setOpen(false);
    reset();
    setUrl("");
  };

  return (
    <section
      id="demo"
      className="relative flex min-h-[calc(100svh-170px)] flex-col overflow-hidden pb-8 pt-2 md:pt-3"
    >
      <Container className="flex flex-1 items-center py-4">
        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          animate="show"
          className="mx-auto flex w-full max-w-4xl flex-col items-center text-center animate-fade-in"
        >
          <motion.h1
            variants={fadeUp}
            className="text-balance font-serif font-bold tracking-tight text-foreground"
            style={{ fontSize: "clamp(2.25rem, 4.4vw, 3.75rem)", lineHeight: 1.04, letterSpacing: "-0.025em" }}
          >
            Eliminate your customer service tickets and make six figures in upsell revenue
          </motion.h1>

          <motion.a
            variants={fadeUp}
            href="https://apps.shopify.com/clickpost-order-edit-cancel"
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-6 inline-flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- official Shopify app-store icon */}
            <img src="/shopify-icon.png" alt="Shopify" className="size-5 object-contain" />
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <span className="text-[0.9rem] font-medium tracking-tight text-foreground">5.0</span>
            <span className="text-[0.9rem] font-normal tracking-tight text-muted-foreground">
              (51) Shopify Reviews
            </span>
          </motion.a>

          <motion.p variants={fadeUp} className="mt-7 text-sm text-muted-foreground">
            Drop your URL and see how order editing would work on your store.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-3 w-full max-w-xl">
            <DemoUrlInput
              url={url}
              setUrl={setUrl}
              onSubmit={onSubmit}
              loading={status === "loading"}
              align="center"
            />
          </motion.div>
        </motion.div>
      </Container>

      {/* customer logos pinned to the bottom of the first viewport */}
      <CustomerLogos embedded />

      {/* full-screen brand preview experience */}
      <DemoExperience open={open} status={status} store={store} onClose={close} />
    </section>
  );
}

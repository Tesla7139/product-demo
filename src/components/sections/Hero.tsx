"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/primitives/Container";
import { DemoUrlInput } from "./demo/DemoUrlInput";
import { DemoExperience } from "./demo/DemoExperience";
import { CustomerLogos } from "./CustomerLogos";
import { useDemoData } from "@/hooks/useDemoData";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function Hero() {
  const { status, store, submittedUrl, generate, reset } = useDemoData();
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);
  const [shake, setShake] = useState(0);

  // the "Product Tour" nav link fires this to nudge the store-URL input
  useEffect(() => {
    const onShake = () => setShake((n) => n + 1);
    window.addEventListener("demo:shake", onShake);
    if (window.location.hash === "#demo") onShake();
    return () => window.removeEventListener("demo:shake", onShake);
  }, []);

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
            className="text-balance font-bold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-fraunces), serif", fontSize: "clamp(2.4rem, 4.7vw, 4rem)", lineHeight: 1.03, letterSpacing: "-0.02em" }}
          >
            Reduce Support Tickets and Add Thousands in Upsell Revenue
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 text-lg text-muted-foreground md:text-xl">
            Enter your store URL to have a personalized demo tailored to your store.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-6 w-full max-w-xl">
            <DemoUrlInput
              url={url}
              setUrl={setUrl}
              onSubmit={onSubmit}
              loading={status === "loading"}
              align="center"
              shake={shake}
            />
          </motion.div>
        </motion.div>
      </Container>

      {/* customer logos pinned to the bottom of the first viewport */}
      <CustomerLogos embedded />

      {/* full-screen brand preview experience */}
      <DemoExperience open={open} status={status} store={store} submittedUrl={submittedUrl} onClose={close} />
    </section>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, MapPin, Pencil, Sparkles, Tag, UserRound, X } from "lucide-react";
import type { DemoStore } from "@/lib/site";
import { DemoMock } from "./DemoMock";
import { OneTapUpsellMock } from "./OneTapUpsellMock";

const ACCENT = "#155FFF";

type Section = "contact" | "shipping" | "order" | "discount" | "cancel";

const INFO: Record<
  Section,
  {
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    title: string;
    desc: string;
  }
> = {
  shipping: {
    icon: MapPin,
    title: "Update shipping address",
    desc: "Shoppers correct a wrong address themselves — the #1 cause of failed deliveries — before the order ships.",
  },
  order: {
    icon: Pencil,
    title: "Add or swap products",
    desc: "Change quantities, swap a size, or add an item to the same order — no new checkout, no duplicate shipment.",
  },
  contact: {
    icon: UserRound,
    title: "Change contact info",
    desc: "Fix a mistyped email or phone so shipping and delivery updates actually reach the customer.",
  },
  discount: {
    icon: Tag,
    title: "Apply a discount",
    desc: "Customers add a code they forgot at checkout — recovered instead of a support ticket.",
  },
  cancel: {
    icon: X,
    title: "Cancel & refund",
    desc: "Self-serve cancellation within your edit window auto-issues the refund — zero back-and-forth.",
  },
};

const PILLS: { key: Section; label: string }[] = [
  { key: "shipping", label: "Edit address" },
  { key: "order", label: "Update order" },
  { key: "contact", label: "Contact" },
  { key: "discount", label: "Discount" },
  { key: "cancel", label: "Cancel" },
];

const MARS_LINES = [
  { text: "↓ 67% fewer order-related tickets", color: "#86efac" },
  { text: "↑ 23% higher average order value", color: "#93c5fd" },
  { text: "↑ 94% edit completion rate, zero agents", color: "#c4b5fd" },
];

function TypewriterLine({
  text,
  color,
  delay,
}: {
  text: string;
  color: string;
  delay: number;
}) {
  const [shown, setShown] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (shown >= text.length) return;
    const id = setTimeout(() => setShown((s) => s + 1), 28);
    return () => clearTimeout(id);
  }, [started, shown, text.length]);

  const done = shown >= text.length;
  return (
    <div className="flex items-center gap-2 font-mono text-[12.5px]">
      <span className="size-1.5 shrink-0 rounded-full" style={{ background: color }} />
      <span style={{ color }}>
        {text.slice(0, shown)}
        {!done && started && (
          <span className="ml-px inline-block h-3 w-px animate-pulse align-middle" style={{ background: color }} />
        )}
      </span>
    </div>
  );
}

type Phase = "upsell" | "editing";

export function GuidedEditor({ store }: { store: DemoStore }) {
  const [phase, setPhase] = useState<Phase>("upsell");
  const [section, setSection] = useState<Section | null>("shipping");
  const [tourMode, setTourMode] = useState(false);
  const current = section ? INFO[section] : null;

  return (
    <div>
      <AnimatePresence mode="wait">
        {phase === "editing" ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="grid items-center gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-10"
          >
            {/* LEFT — order editing copy */}
            <div>
              <div className="inline-flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-full border-2" style={{ borderColor: ACCENT, color: ACCENT }}>
                  <Pencil className="size-4" />
                </span>
                <span className="text-sm font-semibold tracking-tight text-foreground">Order Editing</span>
              </div>

              <h2
                className="mt-5 font-sans font-extrabold uppercase tracking-tight text-foreground"
                style={{ fontSize: "clamp(2rem, 3.6vw, 3.25rem)", lineHeight: 0.98 }}
              >
                Let shoppers fix their own orders
              </h2>

              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                Change the shipping address, add or swap products, apply a discount, or cancel — right on
                your branded confirmation page, with no support ticket required.
              </p>

              {/* live explanation card */}
              <div className="relative mt-6 min-h-[96px] overflow-hidden rounded-2xl border border-border bg-card">
                <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT}00, ${ACCENT}, ${ACCENT}00)` }} />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={section ?? "none"}
                    initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="p-4"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      {current ? (
                        <>
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-lg" style={{ background: `${ACCENT}18` }}>
                            <current.icon className="size-3.5" style={{ color: ACCENT }} />
                          </span>
                          {current.title}
                        </>
                      ) : "Self-serve order editing"}
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                      {current ? current.desc : "Click any feature pill or open an option in the live window — the explanation follows."}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Mars By GHC card */}
              <div className="mt-5 overflow-hidden rounded-2xl" style={{ background: "linear-gradient(155deg, #0a1535 0%, #0f1e50 100%)" }}>
                <div className="px-5 py-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/35">Real results</span>
                    <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-amber-300">9-figure brand</span>
                  </div>
                  <div className="text-[15px] font-bold text-white">Mars By GHC</div>
                  <div className="mt-3 flex flex-col gap-2">
                    {MARS_LINES.map((l, i) => (
                      <TypewriterLine key={l.text} text={l.text} color={l.color} delay={300 + i * 900} />
                    ))}
                  </div>
                  <a
                    href="https://apps.shopify.com/clickpost-order-edit-cancel#reviews"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-blue-400 transition-colors hover:text-blue-300"
                  >
                    Read their review <ArrowUpRight className="size-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* RIGHT — live editing window */}
            <div className="relative flex min-h-[640px] w-full flex-col gap-4 overflow-hidden rounded-[1.75rem] p-4 shadow-soft-xl sm:p-5">
              <div className="absolute inset-0 -z-0" style={{ background: "linear-gradient(135deg, #cdddff 0%, #6f9bff 48%, #2f5bff 100%)" }} />
              <div className="pointer-events-none absolute -right-16 -top-16 h-3/4 w-3/4 rounded-full bg-white/35 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-16 h-3/4 w-3/4 rounded-full bg-[#bcd4ff]/45 blur-3xl" />
              <div className="pointer-events-none absolute right-1/4 top-1/3 h-1/2 w-1/2 -rotate-12 rounded-full bg-white/25 blur-2xl" />

              <div className="relative z-10 flex flex-wrap justify-center gap-2">
                {PILLS.map((p) => {
                  const on = p.key === section;
                  return (
                    <button
                      key={p.key}
                      onClick={() => setSection(p.key)}
                      className={
                        on
                          ? "rounded-full bg-white px-3.5 py-1.5 text-[12px] font-semibold text-neutral-900 shadow-md"
                          : "rounded-full bg-white/15 px-3.5 py-1.5 text-[12px] font-medium text-white ring-1 ring-white/30 backdrop-blur transition-colors hover:bg-white/25"
                      }
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              <div className="relative z-10 w-full">
                <DemoMock
                  store={store}
                  initialOpen="shipping"
                  forceOpen={section}
                  onOpenChange={setSection}
                  maxHeight={560}
                  tourMode={tourMode}
                  onTourEnd={() => setTourMode(false)}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upsell"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="grid items-center gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-10"
          >
            {/* LEFT — upsell copy */}
            <div>
              <div className="inline-flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-full border-2" style={{ borderColor: "#7c3aed", color: "#7c3aed" }}>
                  <Sparkles className="size-4" />
                </span>
                <span className="text-sm font-semibold tracking-tight text-foreground">One Tap Upsell</span>
              </div>

              <h2
                className="mt-5 font-sans font-extrabold uppercase tracking-tight text-foreground"
                style={{ fontSize: "clamp(2rem, 3.6vw, 3.25rem)", lineHeight: 0.98 }}
              >
                Turn the thank-you page into revenue
              </h2>

              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                Right after checkout, show an exclusive offer customers accept with a single tap — charged to the card they just used. No new cart, no re-entering details.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                {[
                  { icon: "⚡", title: "One tap, no re-checkout", desc: "Customers add the offer instantly — charged to the card already on file." },
                  { icon: "⏱", title: "Countdown urgency", desc: "A live timer makes the offer feel limited without being pushy." },
                  { icon: "🎯", title: "You set the rules", desc: "Choose the product, discount depth, and which orders qualify." },
                ].map((b) => (
                  <div key={b.title} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                    <span className="mt-0.5 text-xl leading-none">{b.icon}</span>
                    <div>
                      <div className="text-[13px] font-semibold text-foreground">{b.title}</div>
                      <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-[13px] text-muted-foreground">
                <span className="font-semibold text-foreground">Add or skip the offer</span> in the demo to see the order editing experience that comes next.
              </p>
            </div>

            {/* RIGHT — same blue aurora panel as editing window */}
            <div className="relative flex min-h-[640px] w-full flex-col gap-4 overflow-hidden rounded-[1.75rem] p-4 shadow-soft-xl sm:p-5">
              <div className="absolute inset-0 -z-0" style={{ background: "linear-gradient(135deg, #cdddff 0%, #6f9bff 48%, #2f5bff 100%)" }} />
              <div className="pointer-events-none absolute -right-16 -top-16 h-3/4 w-3/4 rounded-full bg-white/35 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-16 h-3/4 w-3/4 rounded-full bg-[#bcd4ff]/45 blur-3xl" />
              <div className="pointer-events-none absolute right-1/4 top-1/3 h-1/2 w-1/2 -rotate-12 rounded-full bg-white/25 blur-2xl" />

              <div className="relative z-10 flex justify-center">
                <span className="rounded-full bg-white/15 px-3.5 py-1.5 text-[12px] font-semibold text-white ring-1 ring-white/30 backdrop-blur">
                  One Tap Upsell — live preview
                </span>
              </div>

              <div className="relative z-10 w-full">
                <OneTapUpsellMock store={store} onComplete={() => { setPhase("editing"); setTourMode(true); }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MapPin, Pencil, RotateCcw, Sparkles, X } from "lucide-react";
import type { DemoStore } from "@/lib/site";
import { GuidedEditor } from "./GuidedEditor";
import { OneTapUpsell } from "./OneTapUpsell";

type Status = "idle" | "loading" | "ready";
type Step = "welcome" | "explore" | "editing" | "upsell";

const ACCENT = "#155FFF"; // Clickpost brand accent for the experience chrome

// Sample support tickets (illustrative — the "tickets that shouldn't exist")
const TICKETS = [
  { subject: "Ordered wrong size, too late to switch?", email: "tom.baker@gmail.com", ago: "28m ago", dot: "#9ca3af" },
  { subject: "Typed my email wrong on checkout", email: "nina.s@yahoo.com", ago: "31m ago", dot: "#9ca3af" },
  { subject: "Can I upgrade to express shipping?", email: "chris.lee@gmail.com", ago: "34m ago", dot: "#f59e0b" },
  { subject: "Wrong address on order #4291", email: "amir.k@gmail.com", ago: "41m ago", dot: "#ef4444" },
  { subject: "Need to add one more item", email: "sara.m@gmail.com", ago: "47m ago", dot: "#9ca3af" },
  { subject: "Please cancel my order", email: "dan.w@outlook.com", ago: "52m ago", dot: "#ef4444" },
  { subject: "Can I change the delivery date?", email: "priya.r@gmail.com", ago: "1h ago", dot: "#f59e0b" },
  { subject: "Forgot to apply my discount code", email: "leo.f@gmail.com", ago: "1h ago", dot: "#9ca3af" },
];

export function DemoExperience({
  open,
  status,
  store,
  onClose,
}: {
  open: boolean;
  status: Status;
  store: DemoStore | null;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>("welcome");

  // reset to welcome whenever a new preview starts
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset step when a new preview opens
    if (open) setStep("welcome");
  }, [open, store]);

  // lock background scroll while the experience is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const brand = store?.brandColor || ACCENT;
  const name = store?.brandName || "Your store";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] overflow-y-auto bg-background"
        >
          {/* close */}
          <button
            onClick={onClose}
            aria-label="Close preview"
            className="fixed right-5 top-5 z-[120] flex size-10 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-soft-md transition-colors hover:bg-neutral-50"
          >
            <X className="size-5" />
          </button>

          {/* LOADING */}
          {status === "loading" && <LoadingView name={name} />}

          {/* READY */}
          {status === "ready" && store && (
            <AnimatePresence mode="wait">
              {step === "welcome" && (
                <WelcomeView
                  key="welcome"
                  store={store}
                  brand={brand}
                  name={name}
                  onExplore={() => setStep("explore")}
                />
              )}
              {step === "explore" && (
                <ExploreView key="explore" onContinue={() => setStep("editing")} />
              )}
              {step === "editing" && (
                <EditingView
                  key="editing"
                  store={store}
                  onBack={() => setStep("explore")}
                  onUpsell={() => setStep("upsell")}
                />
              )}
              {step === "upsell" && (
                <UpsellView
                  key="upsell"
                  store={store}
                  name={name}
                  onDone={() => setStep("explore")}
                />
              )}
            </AnimatePresence>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------- Loading ------------------------------- */
function LoadingView({ name }: { name: string }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6">
      <span
        className="mb-5 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold"
        style={{ background: `${ACCENT}1a`, color: ACCENT }}
      >
        <span className="size-2 animate-pulse rounded-full" style={{ background: ACCENT }} />
        Finalizing brand details
      </span>
      <h2 className="font-serif text-4xl text-foreground md:text-5xl">Building {name}</h2>
      <p className="mt-3 text-muted-foreground">
        We can open the experience now and keep settling in the remaining brand details in the
        background.
      </p>
      {/* progress */}
      <div className="mt-7 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <motion.div
          initial={{ width: "8%" }}
          animate={{ width: "92%" }}
          transition={{ duration: 2.2, ease: "easeInOut" }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${ACCENT}55, ${ACCENT})` }}
        />
      </div>
      {/* skeleton rows */}
      <div className="mt-8 flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl border border-border p-4">
            <div className="size-16 animate-pulse rounded-xl bg-background-muted" />
            <div className="flex-1 space-y-2.5">
              <div className="h-3 w-2/3 animate-pulse rounded bg-background-muted" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-background-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------- Welcome ------------------------------- */
function WelcomeView({
  store,
  brand,
  name,
  onExplore,
}: {
  store: DemoStore;
  brand: string;
  name: string;
  onExplore: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-screen flex-col"
    >
      <button
        onClick={onExplore}
        className="relative flex flex-1 cursor-pointer items-center justify-center overflow-hidden"
      >
        {/* giant blurred brand initial / logo */}
        <span
          aria-hidden
          className="pointer-events-none absolute select-none font-extrabold blur-[6px] opacity-80"
          style={{ color: brand, fontSize: "min(60vh, 60vw)", lineHeight: 1 }}
        >
          {store.logo ? "" : name.charAt(0).toUpperCase()}
        </span>
        {store.logo && (
          // eslint-disable-next-line @next/next/no-img-element -- remote logo, any domain
          <img
            src={store.logo}
            alt=""
            aria-hidden
            className="pointer-events-none absolute max-h-[55vh] max-w-[70vw] object-contain opacity-70 blur-[5px]"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        )}
        <div className="relative z-10 flex flex-col items-center text-center text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.35)]">
          <span className="font-serif text-2xl font-light tracking-wide opacity-90">Welcome</span>
          <span className="font-serif text-5xl font-bold tracking-tight md:text-6xl" style={{ letterSpacing: "-0.02em" }}>{name}</span>
          <span className="mt-1 font-serif text-xl font-light tracking-wide opacity-90">to your brand preview</span>
          <span
            className="mt-8 rounded-full px-7 py-3.5 text-base font-semibold text-white shadow-lg"
            style={{ background: ACCENT }}
          >
            Click anywhere to explore
          </span>
        </div>
      </button>
    </motion.div>
  );
}

const EXPLORE_PRODUCTS = [
  {
    label: "Order Editing",
    icon: Pencil,
    desc: "Edit, swap & update",
    active: true,
    tooltip: "",
  },
  {
    label: "Post-Purchase Upsell",
    icon: Sparkles,
    desc: "One-tap add-ons",
    tooltip: "Show a targeted offer right after checkout. One tap to add — no re-entering payment, no new cart.",
  },
  {
    label: "Address Validation",
    icon: MapPin,
    desc: "Stop failed deliveries",
    tooltip: "Validate addresses in real time before fulfillment. Catch typos before the label prints.",
  },
  {
    label: "Cancellations & Refunds",
    icon: RotateCcw,
    desc: "Self-serve, no tickets",
    tooltip: "Customers cancel within your window and get refunded automatically. Zero back-and-forth with your team.",
  },
];

/* ------------------------------- Explore ------------------------------- */
function ExploreView({ onContinue }: { onContinue: () => void }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-screen flex-col overflow-hidden"
      style={{ background: "linear-gradient(155deg, #0b1740 0%, #1433b8 100%)" }}
    >
      {/* radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 65% 40%, rgba(80,130,255,0.2) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-1 gap-5 overflow-hidden px-6 py-8 lg:px-10 lg:py-10">
        {/* sidebar — frosted glass, full height */}
        <aside className="flex w-full shrink-0 flex-col rounded-2xl border border-white/10 bg-white/[0.07] p-3 backdrop-blur-xl md:w-[280px]">
          <div className="px-2 pb-3 pt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white/35">
            Products
          </div>
          <div className="flex flex-col gap-1">
            {EXPLORE_PRODUCTS.map((p) => {
              const Icon = p.icon;
              const isHovered = hovered === p.label;
              return (
                <div
                  key={p.label}
                  onMouseEnter={() => !p.active && setHovered(p.label)}
                  onMouseLeave={() => setHovered(null)}
                  aria-current={p.active ? "true" : undefined}
                  className={
                    p.active
                      ? "rounded-xl px-3.5 py-3 shadow-lg"
                      : "cursor-default rounded-xl px-3.5 py-3 transition-colors hover:bg-white/10"
                  }
                  style={p.active ? { background: ACCENT } : undefined}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={
                        p.active
                          ? "flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/20"
                          : "flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10"
                      }
                    >
                      <Icon
                        className="size-4"
                        style={{ color: p.active ? "#fff" : "rgba(255,255,255,0.6)" }}
                      />
                    </span>
                    <div className="min-w-0">
                      <div
                        className="text-[15px] font-semibold leading-tight"
                        style={{ color: p.active ? "#fff" : "rgba(255,255,255,0.8)" }}
                      >
                        {p.label}
                      </div>
                      <div
                        className="mt-0.5 text-[12px]"
                        style={{
                          color: p.active ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.4)",
                        }}
                      >
                        {p.desc}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isHovered && p.tooltip && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p
                          className="mt-2.5 pl-[52px] text-[12px] leading-relaxed"
                          style={{ color: "rgba(255,255,255,0.55)" }}
                        >
                          {p.tooltip}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </aside>

        {/* main — white card, fills remaining height */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_48px_96px_-24px_rgba(0,0,0,0.55)]">
          <div className="flex min-h-0 flex-1 flex-col px-10 py-10 md:px-16 md:py-12">
            <div className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col text-center">
              <h2
                className="shrink-0 font-serif font-bold text-balance text-foreground"
                style={{
                  fontSize: "clamp(1.8rem, 2.8vw, 2.5rem)",
                  lineHeight: 1.06,
                  letterSpacing: "-0.025em",
                }}
              >
                Most of your support tickets shouldn’t exist.
              </h2>
              <p className="mx-auto mt-4 max-w-md shrink-0 text-[15px] leading-relaxed text-muted-foreground">
                Your inbox is full of problems customers can fix themselves in seconds — if you let
                them.
              </p>

              <div
                className="relative mt-8 min-h-0 flex-1 overflow-hidden text-left"
                style={{
                  maskImage:
                    "linear-gradient(to bottom, transparent, black 10%, black 88%, transparent)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, transparent, black 10%, black 88%, transparent)",
                }}
              >
                <motion.div
                  className="flex flex-col gap-2.5"
                  animate={{ y: ["0%", "-50%"] }}
                  transition={{ duration: 20, ease: "linear", repeat: Infinity }}
                >
                  {[...TICKETS, ...TICKETS].map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-4 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3.5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{ background: t.dot }}
                        />
                        <div className="min-w-0">
                          <div className="truncate text-[13.5px] font-semibold text-neutral-800">
                            {t.subject}
                          </div>
                          <div className="truncate text-[11.5px] text-neutral-400">{t.email}</div>
                        </div>
                      </div>
                      <span className="shrink-0 text-[11.5px] tabular-nums text-neutral-400">
                        {t.ago}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </div>

              <button
                onClick={onContinue}
                className="group mt-6 inline-flex shrink-0 items-center gap-2.5 self-center rounded-full px-8 py-4 text-[15px] font-semibold text-white shadow-lg transition-all hover:brightness-110 hover:shadow-xl"
                style={{ background: ACCENT }}
              >
                See how Order Editing works
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------- Editing ------------------------------- */
function EditingView({
  store,
  onBack,
  onUpsell,
}: {
  store: DemoStore;
  onBack: () => void;
  onUpsell: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="min-h-screen bg-background-muted/40"
    >
      <div className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="size-4 rotate-180" />
            Back
          </button>

          <button
            onClick={onUpsell}
            className="group inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-semibold text-white shadow-md transition-all hover:brightness-110"
            style={{ background: ACCENT }}
          >
            <Sparkles className="size-3.5" />
            Also see: One-tap upsell
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <GuidedEditor store={store} />
      </div>
    </motion.div>
  );
}

/* ------------------------------- Upsell ------------------------------- */
function UpsellView({
  store,
  name,
  onDone,
}: {
  store: DemoStore;
  name: string;
  onDone: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
    >
      <div className="mx-auto max-w-7xl px-5 py-8">
        <button
          onClick={onDone}
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="size-4 rotate-180" />
          Back
        </button>
      </div>
      <OneTapUpsell store={store} name={name} onAdd={onDone} onSkip={onDone} />
    </motion.div>
  );
}


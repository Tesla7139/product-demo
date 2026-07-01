"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Check, ExternalLink, Sparkles,
} from "lucide-react";
import type { DemoStore } from "@/lib/site";
import type { Addr } from "./DemoMock";
import { DemoMock } from "./DemoMock";
import { OneTapUpsellMock } from "./OneTapUpsellMock";
import { TourOverlay, type TourRect } from "./TourOverlay";

const ACCENT = "#155FFF";

type Tab = "editing" | "upsell" | "address" | "cancel";
type Section = "contact" | "shipping" | "order" | "discount" | "cancel";

/** Address the guided tour drops into the form to demonstrate an edit. */
const CORRECTED_ADDRESS: Partial<Addr> = { line1: "1820 Seacrest Blvd", city: "Carlsbad", zip: "92008" };

const FEATURE_CARDS: {
  key: Tab;
  title: string;
  desc: string;
  capLabel: string;
  points: string[];
  stats: { value: string; label: string }[];
}[] = [
  {
    key: "editing",
    title: "Order editing",
    desc: "Shoppers fix their own order before it ships.",
    capLabel: "What customers can change",
    points: [
      "Shipping address & contact details",
      "Items, variants & quantities",
      "Discount codes, cancel & auto-refund",
    ],
    stats: [
      { value: "~40%", label: "fewer support tickets" },
      { value: "94%", label: "of edits completed self-serve" },
    ],
  },
  {
    key: "upsell",
    title: "Post-purchase upsell",
    desc: "A one-tap offer right after checkout.",
    capLabel: "What you can configure",
    points: [
      "Offer on the thank-you page or post-checkout",
      "You set the product, discount & timing",
    ],
    stats: [
      { value: "+3-4%", label: "AOV from one-tap upsell" },
      { value: "+2-3%", label: "AOV from on-page upsell" },
    ],
  },
  {
    key: "address",
    title: "Address validation",
    desc: "Stop undeliverable orders before fulfillment.",
    capLabel: "What it checks",
    points: [
      "Live autocomplete & correction suggestions",
      "Flags risky & blocks undeliverable addresses",
    ],
    stats: [
      { value: "~30%", label: "fewer failed deliveries" },
    ],
  },
];

/** Contextual social proof, keyed to the selected feature. Real customers from site.ts. */
type ProofKey = "editing" | "upsell";
const PROOF: Record<ProofKey, {
  brand: string;
  badge: string;
  logoSrc: string | null;
  stats: { value: string; label: string }[];
  sub: string;
  reviewHref: string;
}> = {
  editing: {
    brand: "Doonails",
    badge: "7-figure brand",
    logoSrc: "/customers/doonails.svg",
    stats: [
      { value: "58%", label: "fewer tickets" },
      { value: "18%", label: "higher AOV" },
      { value: "$12K", label: "in upsell" },
    ],
    sub: "with self-serve order editing",
    reviewHref: "/reviews",
  },
  upsell: {
    brand: "Mars by GHC",
    badge: "7-figure brand",
    logoSrc: null,
    stats: [
      { value: "+23%", label: "higher AOV" },
      { value: "$18K", label: "in upsell" },
      { value: "2.4x", label: "offer ROI" },
    ],
    sub: "with one-tap post-purchase offers",
    reviewHref: "/reviews",
  },
};

type ActionPill = {
  key: "tour" | Section;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  section?: Section;
};

const EDITING_PILLS: ActionPill[] = [
  { key: "tour", label: "Take a tour", icon: Sparkles },
  { key: "shipping", label: "Edit address", section: "shipping" },
  { key: "order", label: "Update order", section: "order" },
  { key: "contact", label: "Contact", section: "contact" },
  { key: "discount", label: "Discount", section: "discount" },
  { key: "cancel", label: "Cancel", section: "cancel" },
];

/* ----------------------------- tour step defs ----------------------------- */
type TourStepDef = {
  id: string;
  title: string;
  desc: string;
  cta: string;
  measureDelayMs?: number;
  clickThrough?: boolean;
  /** show the red "tap here" dot — only on steps where you tap the highlighted element */
  tapTarget?: boolean;
  /** element to spotlight (defaults to `id`) */
  spotlightId?: string;
  /** element the red dot points at (defaults to the spotlight) */
  dotId?: string;
  /** hide the tooltip card (let the highlighted element speak for itself) */
  hideCard?: boolean;
  /** hide the Next button (the user advances by tapping the highlighted element) */
  hideCta?: boolean;
};

const EDITING_TOUR_STEPS: TourStepDef[] = [
  {
    id: "window",
    title: "Your edit window",
    desc: "Customers can edit for as long as you allow. You set it.",
    cta: "Next",
  },
  {
    id: "addr-row",
    title: "Self-serve edits",
    desc: "Change address, swap items, update contact info, and more in seconds.",
    cta: "Next",
    measureDelayMs: 420,
    tapTarget: true,
    hideCta: true, // tap the address to change it
  },
  {
    id: "addr-save",
    title: "Save in one tap",
    desc: "The fix syncs to your store instantly.",
    cta: "Next",
    measureDelayMs: 1450, // wait for the address to finish auto-filling before the dot moves to Save
    clickThrough: true,
    tapTarget: true,
    spotlightId: "shipping-box", // keep the whole (highlighted) address visible
    dotId: "addr-save",          // but point the dot at the Save button
    hideCard: true,              // no tooltip — the highlighted address + Save dot say it all
  },
  {
    id: "order-row",
    title: "Add or change items",
    desc: "Add one more, swap, or remove — the total updates live.",
    cta: "Next",
    measureDelayMs: 300,
    tapTarget: true,
    hideCta: true, // tap the order to add one more
    dotId: "order-plus", // point the dot at the + button, not delete
  },
  {
    id: "order-save",
    title: "Update the order",
    desc: "One tap applies the change.",
    cta: "Next",
    measureDelayMs: 700, // wait for the quantity bump before the dot moves to Update
    clickThrough: true,
    tapTarget: true,
    spotlightId: "order-row", // keep the whole (highlighted) item list visible
    dotId: "order-btn",       // dot on the Update your order button
    hideCard: true,
  },
  {
    id: "pay",
    title: "Confirm and pay",
    desc: "Pay the difference to lock in the changes.",
    cta: "Next",
    measureDelayMs: 360,
    clickThrough: true,
    tapTarget: true,
    spotlightId: "pay-panel", // highlight the balance-due panel (with the ask)
    dotId: "pay-btn",         // dot on the Pay button
    hideCard: true,
  },
  {
    id: "to-upsell",
    title: "Now the upsell",
    desc: "Same moment, extra revenue.",
    cta: "Next",
    measureDelayMs: 360, // let the editing sections finish collapsing first
    tapTarget: true,
    hideCard: true, // just the highlighted card + dot, no tooltip
  },
];

const UPSELL_TOUR_STEPS: TourStepDef[] = [
  {
    id: "upsell-toggle",
    title: "Two ways to upsell",
    desc: "One tap right after the order is confirmed, or on the order status page.",
    cta: "Next",
    measureDelayMs: 280,
  },
  {
    id: "upsell-offer",
    title: "An irresistible offer",
    desc: "A one-time deal shown the instant they pay. Pick the product, discount and timer.",
    cta: "Next",
    measureDelayMs: 320,
    spotlightId: "upsell-offer",
  },
  {
    id: "upsell-add",
    title: "One tap to add",
    desc: "No re-checkout, charged to the card on file.",
    cta: "Next",
    measureDelayMs: 320,
    clickThrough: true,
    tapTarget: true,
    hideCard: true,
    spotlightId: "upsell-offer", // keep the whole offer visible
    dotId: "upsell-add",         // dot on the Add to order button
  },
  {
    id: "ty-show",
    title: "Order status page upsell",
    desc: "Recommend add-ons right on the order status page, above the edit options.",
    cta: "Next",
    measureDelayMs: 380,
    spotlightId: "ty-grid",
  },
  {
    id: "ty-add",
    title: "One tap to add",
    desc: "Charged to the card on file. No re-checkout.",
    cta: "Finish",
    measureDelayMs: 320,
    clickThrough: true,
    tapTarget: true,
    hideCard: true,
    spotlightId: "ty-grid",
    dotId: "ty-add",
  },
];

/* ----------------------------- features rail ----------------------------- */
function FeaturesRail({
  tab,
  onSelect,
  upsellCardRef,
}: {
  tab: Tab;
  onSelect: (t: Tab) => void;
  upsellCardRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const proofKey: ProofKey = tab === "upsell" ? "upsell" : "editing";
  const proof = PROOF[proofKey];

  return (
    <div className="flex h-full w-full flex-col lg:max-w-[340px]">
      {/* heading */}
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
          Try the experience
        </p>
        <h3 className="mt-3 font-sans text-[2.1rem] font-extrabold leading-[1.04] tracking-tight text-foreground">
          Click a feature to run it live.
        </h3>
      </div>

      {/* feature cards — single-select toggle, glass + hover tooltip */}
      <div className="mt-4 flex flex-col gap-3">
        {FEATURE_CARDS.map((f) => {
          const active = tab === f.key;
          return (
            <div key={f.key} className="group relative">
              <button
                ref={f.key === "upsell" ? upsellCardRef : undefined}
                aria-pressed={active}
                onClick={() => onSelect(f.key)}
                className={`relative flex w-full cursor-pointer items-center justify-between gap-3 overflow-hidden rounded-2xl border-2 px-5 py-4 text-left backdrop-blur-md transition-all duration-200 ${
                  active
                    ? "text-white shadow-[0_8px_24px_-6px_rgba(21,95,255,0.55)]"
                    : "border-neutral-200/90 bg-white/55 text-neutral-800 shadow-[0_4px_16px_-8px_rgba(15,15,25,0.18)] hover:-translate-y-0.5 hover:border-[#155FFF]/60 hover:bg-white hover:shadow-[0_12px_30px_-10px_rgba(21,95,255,0.4)]"
                }`}
                style={active ? { background: `linear-gradient(135deg, #3b7cff 0%, ${ACCENT} 100%)`, borderColor: "#2f6bff" } : undefined}
              >
                {/* glass sheen */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-2xl"
                  style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 100%)", opacity: active ? 0.5 : 0.7 }}
                />
                <span className="relative flex flex-col">
                  <span className="font-sans text-[17px] font-bold tracking-tight">{f.title}</span>
                  <span className={`text-[11.5px] font-semibold ${active ? "text-blue-100" : "text-[#155FFF]"}`}>
                    {active ? "Running live" : "Run it live"}
                  </span>
                </span>
                {/* clickable affordance */}
                <span
                  className={`relative flex size-8 shrink-0 items-center justify-center rounded-full transition-all ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-[#155FFF]/10 text-[#155FFF] group-hover:bg-[#155FFF] group-hover:text-white"
                  }`}
                >
                  {active ? <Check className="size-4" strokeWidth={3} /> : <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />}
                </span>
              </button>

              {/* hover tooltip — capabilities */}
              <div className="pointer-events-none absolute left-full top-1/2 z-40 ml-4 hidden w-[18rem] -translate-y-1/2 group-hover:block">
                <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-soft-xl">
                  <div className="px-4 py-3.5" style={{ background: `linear-gradient(135deg, ${ACCENT}0d, transparent)` }}>
                    <p className="text-[14px] font-bold tracking-tight text-neutral-900">{f.title}</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-neutral-500">{f.desc}</p>
                  </div>
                  <div className="h-px bg-neutral-100" />
                  <div className="px-4 py-3.5">
                    <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                      {f.capLabel}
                    </p>
                    <ul className="grid gap-2">
                      {f.points.map((c) => (
                        <li key={c} className="flex items-start gap-2.5 text-[12.5px] font-medium leading-snug text-neutral-700">
                          <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full" style={{ background: `${ACCENT}1a` }}>
                            <Check className="size-2.5" strokeWidth={3.5} style={{ color: ACCENT }} />
                          </span>
                          {c}
                        </li>
                      ))}
                    </ul>

                    {/* quantified impact */}
                    <div className="mt-3 grid gap-1.5 border-t border-neutral-100 pt-3">
                      {f.stats.map((s) => (
                        <div key={s.label} className="flex items-baseline gap-1.5 text-[12px] leading-snug text-neutral-500">
                          <span className="font-bold text-emerald-600">{s.value}</span>
                          <span>{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-[7px] border-transparent border-r-white drop-shadow-[-1px_0_0_rgba(0,0,0,0.04)]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* proof card — contextual, colorful; pinned to the bottom */}
      <div className="relative mt-6 overflow-hidden rounded-2xl bg-[#0d1b3e] p-5 shadow-lg lg:mt-auto">
        <div className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-[#155FFF]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-10 size-28 rounded-full bg-emerald-500/20 blur-3xl" />

        <AnimatePresence mode="wait">
          <motion.div
            key={proofKey}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* logo chip (or wordmark) + brand */}
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 items-center justify-center rounded-lg bg-white px-2.5 shadow-sm">
                {proof.logoSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element -- brand logo from /public
                  <img
                    src={proof.logoSrc}
                    alt={proof.brand}
                    className="h-4 w-auto max-w-[84px] object-contain"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <span className="text-[12px] font-extrabold tracking-tight text-neutral-900">{proof.brand}</span>
                )}
              </span>
              {proof.logoSrc && <span className="text-[14px] font-semibold text-white">{proof.brand}</span>}
              <span className="ml-auto shrink-0 rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                {proof.badge}
              </span>
            </div>

            {/* three-stat outcome row */}
            <div className="mt-4 flex items-stretch">
              {proof.stats.map((s, i) => (
                <div key={s.label} className={`flex-1 ${i === 0 ? "pr-3" : "border-l border-white/10 px-3"}`}>
                  <div className="text-[24px] font-extrabold leading-none tracking-tight text-emerald-400">{s.value}</div>
                  <div className="mt-1.5 text-[11px] leading-tight text-white/55">{s.label}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[12.5px] leading-snug text-white/55">
              {proof.sub}
            </p>

            {/* two CTAs */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                href={proof.reviewHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-white/10 px-3 py-2.5 text-[12.5px] font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/15"
              >
                Read review
                <ExternalLink className="size-3.5" />
              </Link>
              <Link
                href="/#contact"
                className="flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[12.5px] font-semibold text-white shadow-md transition-all hover:brightness-110"
                style={{ background: ACCENT }}
              >
                Book a demo
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* the glowing "Take a tour" CTA, shown on every feature window */
function TourButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      animate={{
        scale: [1, 1.05, 1],
        boxShadow: [
          "0 4px 14px -2px rgba(255,255,255,0.35), 0 0 0 0 rgba(255,255,255,0.0)",
          "0 8px 22px -2px rgba(255,255,255,0.6), 0 0 0 8px rgba(255,255,255,0.18)",
          "0 4px 14px -2px rgba(255,255,255,0.35), 0 0 0 0 rgba(255,255,255,0.0)",
        ],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      whileHover={{ scale: 1.08 }}
      className="group relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-full bg-white px-5 py-2 text-[13px] font-extrabold ring-1 ring-white/70"
      style={{ color: ACCENT }}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12"
        style={{ background: "linear-gradient(90deg, transparent, rgba(21,95,255,0.22), transparent)" }}
        initial={{ x: "-160%" }}
        animate={{ x: "360%" }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" }}
      />
      <motion.span
        aria-hidden
        animate={{ rotate: [0, 18, -12, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="relative flex"
      >
        <Sparkles className="size-4" />
      </motion.span>
      <span className="relative">Take a tour</span>
      <ArrowRight className="relative size-3.5 transition-transform group-hover:translate-x-0.5" />
    </motion.button>
  );
}

/* ----------------------------- guided editor ----------------------------- */
export function GuidedEditor({ store, onUpsell }: { store: DemoStore; onUpsell?: () => void }) {
  const [tab, setTab] = useState<Tab>("editing");
  const [activePill, setActivePill] = useState<ActionPill["key"]>("tour");
  const [upsellView, setUpsellView] = useState<"thankyou" | "onetap">("onetap");

  // lifted tour state
  const [activeTour, setActiveTour] = useState<"editing" | "upsell" | null>(null);
  const [tourStep, setTourStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<TourRect | null>(null);
  const [dotRect, setDotRect] = useState<TourRect | null>(null); // where the red dot points (may differ from spotlight)
  const [measuredStep, setMeasuredStep] = useState(-1); // which step the current rect belongs to
  const [pendingUpsellTour, setPendingUpsellTour] = useState(false);
  const [pendingEditingTour, setPendingEditingTour] = useState(false);

  // controlled bits during the tour
  const [tourForcedOpen, setTourForcedOpen] = useState<Section | null>(null);
  const [addrOverride, setAddrOverride] = useState<Partial<Addr> | undefined>(undefined);
  const [qtyBump, setQtyBump] = useState(0); // tour: add one more of the first item
  const [demoResetKey, setDemoResetKey] = useState(0); // bump to remount the demo fresh

  // start the editing tour from a clean demo (original 2-item order, fresh timer, nothing highlighted)
  function resetDemo() {
    setAddrOverride(undefined);
    setQtyBump(0);
    setTourForcedOpen(null);
    setDemoResetKey((k) => k + 1);
  }

  const rootRef = useRef<HTMLDivElement>(null);

  // tour ref registry
  const countdownRef = useRef<HTMLDivElement>(null);
  const shippingRowRef = useRef<HTMLDivElement>(null);
  const addressFormRef = useRef<HTMLDivElement>(null);
  const saveBtnRef = useRef<HTMLDivElement>(null);
  const orderRowRef = useRef<HTMLDivElement>(null);
  const orderBtnRef = useRef<HTMLDivElement>(null);
  const orderPlusBtnRef = useRef<HTMLButtonElement>(null);
  const payPanelRef = useRef<HTMLDivElement>(null);
  const payBtnRef = useRef<HTMLButtonElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);
  const upsellCardRef = useRef<HTMLButtonElement>(null);
  const upsellToggleRef = useRef<HTMLDivElement>(null);
  const upsellOfferRef = useRef<HTMLDivElement>(null);
  const upsellAddBtnRef = useRef<HTMLButtonElement>(null);
  const tyGridRef = useRef<HTMLDivElement>(null);
  const tyAddBtnRef = useRef<HTMLButtonElement>(null);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPill = EDITING_PILLS.find((p) => p.key === activePill) ?? EDITING_PILLS[0];

  const steps = activeTour === "editing" ? EDITING_TOUR_STEPS : activeTour === "upsell" ? UPSELL_TOUR_STEPS : [];
  const curStep = activeTour ? steps[tourStep] : null;

  // resolve a step's spotlight target — called only from effects/handlers, never render
  function getStepTarget(id: string): HTMLElement | null {
    switch (id) {
      case "window": return countdownRef.current;
      case "addr-row": return addressFormRef.current;
      case "addr-save": return saveBtnRef.current;
      case "shipping-box": return shippingRowRef.current;
      case "order-row": return orderRowRef.current;
      case "order-btn": return orderBtnRef.current;
      case "order-plus": return orderPlusBtnRef.current;
      case "pay-panel": return payPanelRef.current;
      case "pay-btn": return payBtnRef.current;
      case "others": return sectionsRef.current;
      case "to-upsell": return upsellCardRef.current;
      case "upsell-toggle": return upsellToggleRef.current;
      case "upsell-offer": return upsellOfferRef.current;
      case "upsell-add": return upsellAddBtnRef.current;
      case "ty-grid": return tyGridRef.current;
      case "ty-add": return tyAddBtnRef.current;
      default: return null;
    }
  }

  // perform a step's side effects, then move to it
  function enterStep(tourId: "editing" | "upsell", idx: number) {
    const list = tourId === "editing" ? EDITING_TOUR_STEPS : UPSELL_TOUR_STEPS;
    const s = list[idx];
    if (!s) return;
    switch (s.id) {
      case "window":
        setTourForcedOpen(null);
        break;
      case "addr-row":
        // open the shipping box with the ORIGINAL address (no highlight yet)
        setTourForcedOpen("shipping");
        break;
      case "addr-save":
        // box stays open; now auto-fill the corrected address (highlighted)
        setTourForcedOpen("shipping");
        setAddrOverride(CORRECTED_ADDRESS);
        break;
      case "order-row":
        // open the order box with the original quantities
        setTourForcedOpen("order");
        break;
      case "order-save":
        // box stays open; add one more of the first item (highlighted)
        setTourForcedOpen("order");
        setQtyBump((b) => b + 1);
        break;
      case "pay":
        // collapse the editing sections so the balance-due panel is the focus
        setTourForcedOpen(null);
        break;
      case "to-upsell":
        // close every editing section before handing off to the upsell
        setTourForcedOpen(null);
        break;
      case "upsell-toggle":
      case "upsell-offer":
      case "upsell-add":
        setUpsellView("onetap");
        break;
      case "ty-show":
      case "ty-add":
        setUpsellView("thankyou");
        break;
      default:
        setTourForcedOpen(null);
    }
    setTourStep(idx);
  }

  function startEditingTour() {
    setActivePill("tour");
    setActiveTour("editing");
    enterStep("editing", 0);
  }

  // "Take a tour" from any window: refresh the demo to its starting state, then run the full tour
  function launchTour() {
    resetDemo(); // fresh 2-item order + fresh timer before we begin
    if (tab === "editing") {
      startEditingTour();
    } else {
      setActiveTour(null);
      setSpotlightRect(null);
      setTab("editing");
      setPendingEditingTour(true);
    }
  }

  function finishEditingTour() {
    setActiveTour(null);
    setSpotlightRect(null);
    setTab("upsell");
    setUpsellView("onetap");
    setPendingUpsellTour(true);
  }

  // Bring a target into view by scrolling ONLY its nearest inner scroll container
  // (the demo window / offer panel) — never the outer modal, so the top bar isn't cut.
  function scrollInnerIntoView(el: HTMLElement) {
    const root = rootRef.current;
    // only consider scroll containers INSIDE the demo (between el and root);
    // the outer modal is an ancestor of root, so it's never scrolled.
    let c: HTMLElement | null = el.parentElement;
    while (c && c !== root) {
      const oy = getComputedStyle(c).overflowY;
      if ((oy === "auto" || oy === "scroll") && c.scrollHeight > c.clientHeight + 1) {
        const cRect = c.getBoundingClientRect();
        const eRect = el.getBoundingClientRect();
        const delta = (eRect.top - cRect.top) - (c.clientHeight - eRect.height) / 2;
        c.scrollTop += delta; // instant: target is at its final position for measuring
        return;
      }
      c = c.parentElement;
    }
  }

  function scrollDemoTop() {
    const el = rootRef.current;
    if (!el) return;
    // reset every actually-scrolled ancestor (the full-screen demo modal lives among them)
    let p: HTMLElement | null = el.parentElement;
    while (p) {
      if (p.scrollTop > 0) p.scrollTop = 0;
      p = p.parentElement;
    }
    if (window.scrollY > 0) window.scrollTo(0, 0);
  }

  function advanceTour() {
    if (!activeTour) return;
    const list = activeTour === "editing" ? EDITING_TOUR_STEPS : UPSELL_TOUR_STEPS;
    if (tourStep >= list.length - 1) {
      if (activeTour === "editing") finishEditingTour();
      else { setActiveTour(null); setSpotlightRect(null); scrollDemoTop(); }
    } else {
      enterStep(activeTour, tourStep + 1);
    }
  }

  // hide the overlay for ~2s so the "saved / updated" confirmation is visible, then advance
  function advanceAfterPause() {
    setSpotlightRect(null);
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    pauseTimer.current = setTimeout(() => advanceTour(), 2000);
  }

  function closeTour() {
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    setActiveTour(null);
    setSpotlightRect(null);
    setPendingUpsellTour(false);
    scrollDemoTop();
  }

  function selectFeature(k: Tab) {
    // during the editing tour, the upsell card is the handoff
    if (activeTour === "editing" && k === "upsell") {
      finishEditingTour();
      return;
    }
    setActiveTour(null);
    setSpotlightRect(null);
    setActivePill("tour");
    setTourForcedOpen(null);
    setTab(k);
  }

  // start the upsell tour once the tab swap has mounted its targets
  useEffect(() => {
    if (!(tab === "upsell" && pendingUpsellTour)) return;
    const t = setTimeout(() => {
      setPendingUpsellTour(false);
      setActiveTour("upsell");
      enterStep("upsell", 0);
    }, 320);
    return () => clearTimeout(t);
  }, [tab, pendingUpsellTour]);

  // start the editing tour once the editing tab has mounted (after a "Take a tour" from another window)
  useEffect(() => {
    if (!(tab === "editing" && pendingEditingTour)) return;
    const t = setTimeout(() => {
      setPendingEditingTour(false);
      startEditingTour();
    }, 360);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, pendingEditingTour]);

  // measure the spotlight for the active step — retries until the target(s) mount
  useEffect(() => {
    if (!activeTour) return;
    const list = activeTour === "editing" ? EDITING_TOUR_STEPS : UPSELL_TOUR_STEPS;
    const s = list[tourStep];
    if (!s) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = (attempt: number) => {
      if (cancelled) return;
      const el = getStepTarget(s.spotlightId ?? s.id);
      if (!el) {
        if (attempt < 8) timers.push(setTimeout(() => run(attempt + 1), 120));
        return;
      }
      scrollInnerIntoView(el); // scroll the inner screen only, never the outer modal
      const r = el.getBoundingClientRect();
      setSpotlightRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      // the dot may point at a different element than the spotlight (e.g. the + or Save inside the box)
      const dotEl = getStepTarget(s.dotId ?? s.spotlightId ?? s.id);
      if (!dotEl && s.dotId && attempt < 8) {
        // dot target not mounted yet — keep the spotlight, retry until it appears
        timers.push(setTimeout(() => run(attempt + 1), 120));
        return;
      }
      const dr = (dotEl ?? el).getBoundingClientRect();
      setDotRect({ top: dr.top, left: dr.left, width: dr.width, height: dr.height });
      setMeasuredStep(tourStep);
    };
    timers.push(setTimeout(() => run(0), s.measureDelayMs ?? 80));
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [activeTour, tourStep]);

  // editing-window open state: tour-controlled during the tour, pill-controlled otherwise
  const editingForceOpen: Section | null =
    activeTour === "editing"
      ? tourForcedOpen
      : activePill !== "tour"
        ? currentPill.section ?? null
        : null;

  return (
    <div ref={rootRef} className="scroll-mt-6">
      {/* two-column */}
      <div className="grid items-stretch gap-8 lg:grid-cols-[0.52fr_1.48fr] lg:gap-10">
        {/* ---- LEFT: features rail ---- */}
        <FeaturesRail tab={tab} onSelect={selectFeature} upsellCardRef={upsellCardRef} />

        {/* ---- RIGHT: aurora frame ---- */}
        <div className="relative flex w-full flex-col gap-3 overflow-hidden rounded-[1.75rem] p-4 shadow-soft-xl sm:p-5">
          <div className="absolute inset-0 -z-0" style={{ background: "linear-gradient(135deg, #cdddff 0%, #6f9bff 48%, #2f5bff 100%)" }} />
          <div className="pointer-events-none absolute -right-16 -top-16 h-3/4 w-3/4 rounded-full bg-white/35 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-3/4 w-3/4 rounded-full bg-[#bcd4ff]/45 blur-3xl" />
          <div className="pointer-events-none absolute right-1/4 top-1/3 h-1/2 w-1/2 -rotate-12 rounded-full bg-white/25 blur-2xl" />

          {/* top bar — "Take a tour" on every window, plus tab-specific controls */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <TourButton onClick={launchTour} />

            {tab === "editing" && onUpsell && (
              <div className="relative">
                {/* "new feature" flag */}
                <motion.span
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-1 -top-2 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-1.5 py-[2px] text-[9px] font-bold uppercase tracking-wide text-white shadow-md"
                >
                  <span className="size-1.5 rounded-full bg-white" />
                  New
                </motion.span>
                <button
                  onClick={onUpsell}
                  className="group inline-flex items-center gap-1.5 rounded-full border-2 bg-white px-3.5 py-1.5 text-[12px] font-semibold shadow-md transition-all hover:bg-blue-50"
                  style={{ borderColor: ACCENT, color: ACCENT }}
                >
                  <Sparkles className="size-3" />
                  One-tap upsell
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            )}

            {tab === "upsell" && (
              <div ref={upsellToggleRef} className="flex items-center gap-2">
                {([["onetap", "One tap upsell"], ["thankyou", "Order status page"]] as const).map(([key, label]) => {
                  const active = upsellView === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setUpsellView(key)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-semibold transition-colors ${
                        active
                          ? "bg-white text-neutral-900 shadow-md"
                          : "bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/25"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}

            {tab === "address" && (
              <span className="rounded-full bg-white/15 px-3.5 py-1.5 text-[12px] font-semibold text-white ring-1 ring-white/30 backdrop-blur">
                Address Validation — live preview
              </span>
            )}
          </div>

          {/* body */}
          <div className="relative z-10 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab === "upsell" ? `upsell-${upsellView}` : tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {tab === "editing" && (
                  <DemoMock
                    key={`demo-${demoResetKey}`}
                    store={store}
                    initialOpen={null}
                    forceOpen={editingForceOpen}
                    maxHeight={560}
                    tourRefs={{ countdown: countdownRef, shippingRow: shippingRowRef, addressForm: addressFormRef, saveBtn: saveBtnRef, orderRow: orderRowRef, orderBtn: orderBtnRef, orderPlusBtn: orderPlusBtnRef, payPanel: payPanelRef, payBtn: payBtnRef, sections: sectionsRef }}
                    addressOverride={addrOverride}
                    onShippingSaved={() => { if (curStep?.id === "addr-save") advanceAfterPause(); }}
                    qtyBump={qtyBump}
                    onOrderUpdated={() => { if (curStep?.id === "order-save") advanceAfterPause(); }}
                    onPaid={() => { if (curStep?.id === "pay") advanceAfterPause(); }}
                  />
                )}
                {tab === "upsell" && (
                  upsellView === "thankyou" ? (
                    <DemoMock
                      key="ty-demo"
                      store={store}
                      initialOpen={null}
                      maxHeight={560}
                      upsellFirst
                      tourRefs={{ upsellRow: tyGridRef, upsellAddBtn: tyAddBtnRef }}
                      onUpsellAdded={() => { if (curStep?.id === "ty-add") advanceAfterPause(); }}
                    />
                  ) : (
                    <OneTapUpsellMock
                      store={store}
                      addBtnRef={upsellAddBtnRef}
                      offerRef={upsellOfferRef}
                      onAdded={() => { if (curStep?.id === "upsell-add") advanceAfterPause(); }}
                    />
                  )
                )}
                {tab === "address" && (
                  <DemoMock store={store} initialOpen="shipping" forceOpen="shipping" maxHeight={560} />
                )}
                {tab === "cancel" && (
                  <DemoMock store={store} initialOpen="cancel" forceOpen="cancel" maxHeight={560} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* lifted guided-tour overlay (portals to body; can target any element) */}
      {activeTour && curStep && spotlightRect && (
        <TourOverlay
          step={tourStep}
          total={steps.length}
          rect={spotlightRect}
          title={curStep.title}
          desc={curStep.desc}
          cta={curStep.cta}
          clickThrough={curStep.clickThrough}
          showDot={!!curStep.tapTarget && measuredStep === tourStep}
          dotRect={dotRect}
          hideCard={curStep.hideCard}
          hideCta={curStep.hideCta}
          onAdvance={advanceTour}
          onClose={closeTour}
        />
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, Check, Sparkles, Star, CalendarDays,
} from "lucide-react";
import type { DemoStore } from "@/lib/site";
import type { Addr } from "./DemoMock";
import { DemoMock } from "./DemoMock";
import { OneTapUpsellMock } from "./OneTapUpsellMock";
import { AddressValidationMock } from "./AddressValidationMock";
import { EUWithdrawalMock } from "./EUWithdrawalMock";
import { TourOverlay, type TourRect } from "./TourOverlay";

const ACCENT = "#155FFF";
const APP_URL = "https://apps.shopify.com/clickpost-order-edit-cancel";

type Tab = "editing" | "upsell" | "address" | "cancel" | "eu-withdrawal";
type Tour = "editing" | "upsell" | "address" | "eu-withdrawal";
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
    desc: "Every edit is an upsell opportunity — lift your AOV.",
    capLabel: "What you can configure",
    points: [
      "Turn every edit & checkout into extra revenue",
      "One-tap add-ons on the thank-you page or post-checkout",
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
  {
    key: "eu-withdrawal",
    title: "EU Withdrawal",
    desc: "Give EU shoppers a compliant one-tap withdrawal function.",
    capLabel: "What it handles",
    points: [
      "Clearly-labeled 'Withdraw Contract' on the order status page",
      "Available through the 14-day cooling-off period",
      "Holds the order & cancels before it hits your WMS / 3PL",
      "Routes requests to your team via Shopify Flow & fulfillment stack",
    ],
    stats: [
      { value: "Jun 19, 2026", label: "EU rule — ready out of the box" },
    ],
  },
];

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
  /** keep the current scroll position (don't scroll the target into view) */
  noScroll?: boolean;
  /** end-of-feature conversion step: blurred backdrop + centered CTA linking to the app */
  outcome?: boolean;
  outcomeHeadline?: string;
  outcomeButton?: string;
  /** rail card highlighted on this outcome step + tour to start on advance ("null" = finish) */
  nextTour?: Tour | null;
  /** label shown after "up next:" on the outcome card */
  nextLabel?: string;
  /** final step of the whole chain */
  finalStep?: boolean;
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
    noScroll: true,              // stay put — the form + button are already framed from the last step
    spotlightId: "addr-block",   // highlight the form AND the Update button as one block
    dotId: "addr-save",          // point the dot at the Update button
    hideCard: true,              // no tooltip — the highlighted address + Save dot say it all
  },
  {
    id: "order-row",
    title: "Add or change items",
    desc: "Add one more, swap, or remove — the total updates live.",
    cta: "Next",
    measureDelayMs: 600, // let the shipping section collapse + order section expand fully first
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
    title: "Fewer support tickets, automatically",
    desc: "Every self-serve edit is a ticket your team never has to touch.",
    cta: "Next",
    measureDelayMs: 360, // let the editing sections finish collapsing first
    outcome: true,
    outcomeHeadline: "Fewer support tickets",
    outcomeButton: "Reduce my store's support tickets now",
    nextTour: "upsell",
    nextLabel: "Post-purchase upsell",
  },
];

const UPSELL_TOUR_STEPS: TourStepDef[] = [
  {
    id: "upsell-toggle",
    title: "Every edit is an upsell opportunity",
    desc: "Turn every edit and checkout into extra revenue — lift your AOV with one-tap add-ons, right after the order or on the order status page.",
    cta: "Show me",
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
    cta: "Next",
    measureDelayMs: 320,
    clickThrough: true,
    tapTarget: true,
    hideCard: true,
    spotlightId: "ty-grid",
    dotId: "ty-add",
  },
  {
    id: "to-address",
    title: "More revenue per order",
    desc: "One-tap add-ons at the perfect moment lift your average order value.",
    cta: "Next",
    measureDelayMs: 360,
    outcome: true,
    outcomeHeadline: "Higher average order value",
    outcomeButton: "Increase my store's AOV now",
    nextTour: "address",
    nextLabel: "Address validation",
  },
];

const ADDRESS_TOUR_STEPS: TourStepDef[] = [
  {
    id: "addr-validate",
    title: "Customer saves an address",
    desc: "Every address is checked the moment it's saved — before the order ships.",
    cta: "Next",
    measureDelayMs: 320,
    clickThrough: true,
    tapTarget: true,
    hideCta: true,
    spotlightId: "addr-validate",
    dotId: "addr-validate",
  },
  {
    id: "addr-flagged",
    title: "We catch bad addresses",
    desc: "Undeliverable or incomplete addresses are flagged before the order ships.",
    cta: "Next",
    measureDelayMs: 420,
    spotlightId: "addr-flagged",
  },
  {
    id: "addr-recommended",
    title: "A verified suggestion",
    desc: "We propose the corrected, deliverable address from the postal database.",
    cta: "Next",
    measureDelayMs: 300,
    spotlightId: "addr-recommended",
  },
  {
    id: "addr-confirm",
    title: "Confirm in one tap",
    desc: "The customer accepts the fix and the order is safe to ship.",
    cta: "Next",
    measureDelayMs: 300,
    clickThrough: true,
    tapTarget: true,
    hideCard: true,
    spotlightId: "addr-confirm",
    dotId: "addr-confirm",
  },
  {
    id: "addr-finish",
    title: "No more wrong-address returns",
    desc: "Every address is validated up front, so fewer parcels come back.",
    cta: "Finish",
    measureDelayMs: 360,
    outcome: true,
    outcomeHeadline: "Zero wrong-address orders",
    outcomeButton: "Prevent wrong-address orders for my store now",
    nextTour: null,
    finalStep: true,
  },
];

const EU_WITHDRAWAL_TOUR_STEPS: TourStepDef[] = [
  {
    id: "eu-card",
    title: "EU withdrawal, built in",
    desc: "From 19 June 2026, EU shoppers need a clear withdrawal function — not a hidden support email.",
    cta: "Next",
    measureDelayMs: 320,
    spotlightId: "eu-card",
  },
  {
    id: "eu-open",
    title: "A clearly labeled path",
    desc: "'Withdraw from contract' sits right on the order status page, through the 14-day cooling-off period.",
    cta: "Next",
    measureDelayMs: 320,
    tapTarget: true,
    hideCta: true,
    clickThrough: true,
    spotlightId: "eu-withdraw-row",
    dotId: "eu-withdraw-row",
  },
  {
    id: "eu-submit",
    title: "Two-step submission",
    desc: "Complete the request, then confirm with one clearly-labeled button — acknowledged instantly by email.",
    cta: "Next",
    measureDelayMs: 420,
    clickThrough: true,
    tapTarget: true,
    hideCard: true,
    spotlightId: "eu-withdraw-btn",
    dotId: "eu-withdraw-btn",
  },
  {
    id: "eu-finish",
    title: "EU-ready withdrawal",
    desc: "A compliant, well-routed withdrawal flow that holds the order and keeps your team in control.",
    cta: "Finish",
    measureDelayMs: 320,
    outcome: true,
    outcomeHeadline: "EU-ready withdrawal",
    outcomeButton: "Get the EU withdrawal function for my store now",
    nextTour: null,
    finalStep: true,
  },
];

const TOUR_STEPS: Record<Tour, TourStepDef[]> = {
  editing: EDITING_TOUR_STEPS,
  upsell: UPSELL_TOUR_STEPS,
  address: ADDRESS_TOUR_STEPS,
  "eu-withdrawal": EU_WITHDRAWAL_TOUR_STEPS,
};

/** Clickpost "Order Edit & Cancel" app icon — vector recreation (crisp at any size). */
function ClickpostMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Clickpost" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="22" fill="#1668FF" />
      <g fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        {/* package cube */}
        <path d="M42 33 L20 45 L20 71 L42 83 L64 71 L64 45 Z" />
        <path d="M20 45 L42 57 L64 45" />
        <path d="M42 57 L42 83" />
        {/* pencil (edit) */}
        <path d="M48 86 L77 57" strokeWidth="6" />
        {/* magnifier + X (cancel) */}
        <circle cx="71" cy="30" r="13" fill="#1668FF" />
        <path d="M80 39 L88 47" />
        <path d="M66 25 L76 35 M76 25 L66 35" strokeWidth="3" />
      </g>
    </svg>
  );
}

/** Brand-result notes that type out and interchange in the CTA's top line. */
type BrandNote = { name: string; stat: string };
const RESULT_NOTES: BrandNote[] = [
  { name: "Mars by GHC", stat: "lifted AOV 23% and added $18K in upsell this month using CP Order Editing." },
  { name: "Doonails", stat: "deflected 58% of tickets and saved $12K this month using CP Order Editing." },
  { name: "Haute Sauce", stat: "grew AOV by 15% and added $7K in upsell this month using CP Order Editing." },
];

function RotatingNote({ notes }: { notes: BrandNote[] }) {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"type" | "hold" | "delete">("type");
  useEffect(() => {
    const full = notes[i].stat;
    let t: ReturnType<typeof setTimeout>;
    if (phase === "type") {
      if (text.length < full.length) t = setTimeout(() => setText(full.slice(0, text.length + 1)), 30);
      else t = setTimeout(() => setPhase("hold"), 1900);
    } else if (phase === "hold") {
      t = setTimeout(() => setPhase("delete"), 100);
    } else {
      if (text.length > 0) t = setTimeout(() => setText(text.slice(0, -1)), 14);
      else { t = setTimeout(() => { setI((n) => (n + 1) % notes.length); setPhase("type"); }, 250); }
    }
    return () => clearTimeout(t);
  }, [text, phase, i, notes]);
  return (
    <span>
      <span className="font-sans text-[15px] font-extrabold not-italic tracking-tight text-neutral-900">{notes[i].name}</span>{" "}
      {text}
      <span className="ml-px inline-block w-[2px] animate-pulse text-[#155FFF]">▍</span>
    </span>
  );
}

/* ----------------------------- features rail ----------------------------- */
function FeaturesRail({
  tab,
  onSelect,
  cardRefs,
}: {
  tab: Tab;
  onSelect: (t: Tab) => void;
  cardRefs: Partial<Record<Tab, React.RefObject<HTMLButtonElement | null>>>;
}) {
  return (
    <div className="flex h-full w-full flex-col lg:max-w-[340px]">
      {/* heading */}
      <h3 className="font-serif text-[1.3rem] font-bold italic leading-tight tracking-tight text-foreground lg:whitespace-nowrap">
        Click a feature to run it live.
      </h3>

      {/* feature cards — single-select toggle, glass + hover tooltip */}
      <div className="mt-3 flex flex-col gap-2">
        {FEATURE_CARDS.map((f) => {
          const active = tab === f.key;
          return (
            <div key={f.key} className="group relative">
              <button
                ref={cardRefs[f.key]}
                aria-pressed={active}
                onClick={() => onSelect(f.key)}
                className={`relative flex w-full cursor-pointer items-center justify-between gap-3 overflow-hidden rounded-2xl border-2 px-5 py-3 text-left backdrop-blur-md transition-all duration-200 ${
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
                <span className="relative font-sans text-[17px] font-bold tracking-tight">{f.title}</span>
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

      {/* install CTA — bottom-aligned with the demo window */}
      <div className="relative mt-4 flex flex-col justify-center gap-4 overflow-hidden rounded-2xl border border-neutral-200/90 bg-white/70 p-5 text-center shadow-[0_4px_16px_-8px_rgba(15,15,25,0.18)] backdrop-blur-md lg:flex-1">
        {/* headline + rotating brand-result note */}
        <div>
          <h3 className="mx-auto max-w-[15rem] font-sans text-[19px] font-extrabold leading-[1.15] tracking-tight text-foreground">
            Ready to try it on your Shopify store?
          </h3>
          <p className="mx-auto mt-2 flex min-h-[3.2em] max-w-[17rem] items-center justify-center font-serif text-[13px] font-medium italic leading-snug text-neutral-600">
            <RotatingNote notes={RESULT_NOTES} />
          </p>
        </div>

        {/* app listing — the whole card links to the Shopify App Store */}
        <a
          href={APP_URL}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-3 rounded-xl border border-neutral-200 bg-white/80 p-3 text-left transition-all hover:border-[#155FFF]/50 hover:shadow-md"
        >
          <ClickpostMark className="size-10 shrink-0 rounded-[9px] shadow-sm" />
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-extrabold leading-tight tracking-tight text-neutral-900">CP Order Editing &amp; Upsell</div>
            <div className="mt-1 flex items-center gap-1.5 text-[12px] text-neutral-500">
              {/* eslint-disable-next-line @next/next/no-img-element -- Shopify icon from /public */}
              <img src="/shopify-icon.png" alt="Shopify" className="size-4 object-contain" />
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-neutral-900">5.0</span>
              <span>· 50+ reviews</span>
            </div>
          </div>
          <ArrowUpRight className="size-4 shrink-0 text-neutral-400 transition-colors group-hover:text-[#155FFF]" />
        </a>

        {/* single CTA */}
        <Link
          href="/#contact"
          className="flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-md transition-all hover:brightness-110 active:scale-[0.99]"
          style={{ background: ACCENT }}
        >
          <CalendarDays className="size-4 shrink-0" /> Book a free demo
        </Link>
      </div>
    </div>
  );
}

/* the glowing "Take a tour" CTA, shown on every feature window */
function TourButton({ onClick, label = "Take a tour" }: { onClick: () => void; label?: string }) {
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
      <span className="relative">{label}</span>
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
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const [tourStep, setTourStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<TourRect | null>(null);
  const [dotRect, setDotRect] = useState<TourRect | null>(null); // where the red dot points (may differ from spotlight)
  const [measuredStep, setMeasuredStep] = useState(-1); // which step the current rect belongs to
  const [demoRect, setDemoRect] = useState<TourRect | null>(null); // editing-window bounds (blurred on outcome steps)
  const [pendingTour, setPendingTour] = useState<Tour | null>(null); // start this tour once its tab mounts
  const [singleTourMode, setSingleTourMode] = useState(false); // true = don't chain to the next feature's tour

  // controlled bits during the tour
  const [tourForcedOpen, setTourForcedOpen] = useState<Section | null>(null);
  const [addrOverride, setAddrOverride] = useState<Partial<Addr> | undefined>(undefined);
  const [qtyBump, setQtyBump] = useState(0); // tour: add one more of the first item
  const [demoResetKey, setDemoResetKey] = useState(0); // bump to remount the demo fresh
  const [euResetKey, setEuResetKey] = useState(0); // bump to remount the EU withdrawal page fresh
  const [addrResetKey, setAddrResetKey] = useState(0); // bump to remount the address-validation window fresh
  const [upsellResetKey, setUpsellResetKey] = useState(0); // bump to remount the upsell windows fresh

  // start the editing tour from a clean demo (original 2-item order, fresh timer, nothing highlighted)
  function resetDemo() {
    setAddrOverride(undefined);
    setQtyBump(0);
    setTourForcedOpen(null);
    setDemoResetKey((k) => k + 1);
  }

  const rootRef = useRef<HTMLDivElement>(null);
  const demoFrameRef = useRef<HTMLDivElement>(null); // the editing/demo window (blurred on outcome steps)

  // tour ref registry
  const countdownRef = useRef<HTMLDivElement>(null);
  const shippingRowRef = useRef<HTMLDivElement>(null);
  const addressFormRef = useRef<HTMLDivElement>(null);
  const addressBlockRef = useRef<HTMLDivElement>(null);
  const saveBtnRef = useRef<HTMLDivElement>(null);
  const orderRowRef = useRef<HTMLDivElement>(null);
  const orderBtnRef = useRef<HTMLDivElement>(null);
  const orderPlusBtnRef = useRef<HTMLButtonElement>(null);
  const payPanelRef = useRef<HTMLDivElement>(null);
  const payBtnRef = useRef<HTMLButtonElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);
  const upsellToggleRef = useRef<HTMLDivElement>(null);
  const upsellOfferRef = useRef<HTMLDivElement>(null);
  const upsellAddBtnRef = useRef<HTMLButtonElement>(null);
  const tyGridRef = useRef<HTMLDivElement>(null);
  const tyAddBtnRef = useRef<HTMLButtonElement>(null);
  // address-validation tour targets
  const addrSaveBtnRef = useRef<HTMLButtonElement>(null);
  const addrFlaggedRef = useRef<HTMLDivElement>(null);
  const addrRecommendedRef = useRef<HTMLButtonElement>(null);
  const addrConfirmRef = useRef<HTMLButtonElement>(null);
  // EU-withdrawal tour targets
  const euCardRef = useRef<HTMLDivElement>(null);
  const euWithdrawRowRef = useRef<HTMLDivElement>(null);
  const euWithdrawBtnRef = useRef<HTMLButtonElement>(null);
  // rail feature-card refs (for highlighting the "next" feature on outcome steps)
  const editingCardRef = useRef<HTMLButtonElement>(null);
  const upsellCardRef = useRef<HTMLButtonElement>(null);
  const addressCardRef = useRef<HTMLButtonElement>(null);
  const euWithdrawalCardRef = useRef<HTMLButtonElement>(null);
  const cardRefs: Partial<Record<Tab, React.RefObject<HTMLButtonElement | null>>> = {
    editing: editingCardRef, upsell: upsellCardRef, address: addressCardRef, "eu-withdrawal": euWithdrawalCardRef,
  };
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPill = EDITING_PILLS.find((p) => p.key === activePill) ?? EDITING_PILLS[0];

  const steps = activeTour ? TOUR_STEPS[activeTour] : [];
  const curStep = activeTour ? steps[tourStep] : null;

  // resolve a step's spotlight target — called only from effects/handlers, never render
  function getStepTarget(id: string): HTMLElement | null {
    switch (id) {
      case "window": return countdownRef.current;
      case "addr-row": return addressFormRef.current;
      case "addr-save": return saveBtnRef.current;
      case "addr-block": return addressBlockRef.current;
      case "shipping-box": return shippingRowRef.current;
      case "order-row": return orderRowRef.current;
      case "order-btn": return orderBtnRef.current;
      case "order-plus": return orderPlusBtnRef.current;
      case "pay-panel": return payPanelRef.current;
      case "pay-btn": return payBtnRef.current;
      case "others": return sectionsRef.current;
      case "to-upsell": return upsellCardRef.current;
      case "to-address": return addressCardRef.current;
      case "upsell-toggle": return upsellToggleRef.current;
      case "upsell-offer": return upsellOfferRef.current;
      case "upsell-add": return upsellAddBtnRef.current;
      case "ty-grid": return tyGridRef.current;
      case "ty-add": return tyAddBtnRef.current;
      case "addr-validate": return addrSaveBtnRef.current;
      case "addr-flagged": return addrFlaggedRef.current;
      case "addr-recommended": return addrRecommendedRef.current;
      case "addr-confirm": return addrConfirmRef.current;
      case "eu-card": return euCardRef.current;
      case "eu-withdraw-row": return euWithdrawRowRef.current;
      case "eu-withdraw-btn": return euWithdrawBtnRef.current;
      default: return null;
    }
  }

  // perform a step's side effects, then move to it
  function enterStep(tourId: Tour, idx: number) {
    const list = TOUR_STEPS[tourId];
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
      case "to-address":
        setUpsellView("thankyou");
        break;
      default:
        // address steps + outcome steps: nothing to pre-open
        break;
    }
    setTourStep(idx);
  }

  function startEditingTour() {
    setActivePill("tour");
    setActiveTour("editing");
    enterStep("editing", 0);
  }

  // "Complete tour" — chains all features: editing → upsell → address → EU withdrawal
  function launchTour() {
    setSingleTourMode(false);
    resetDemo(); // fresh 2-item order + fresh timer before we begin
    if (tab === "editing") {
      startEditingTour();
    } else {
      setActiveTour(null);
      setSpotlightRect(null);
      setTab("editing");
      setPendingTour("editing");
    }
  }

  // Individual tour for just the current feature (no chaining to next)
  function launchSingleTour(tour: Tour) {
    setSingleTourMode(true);
    setActiveTour(null);
    setSpotlightRect(null);
    setActivePill("tour");
    if (tour === "editing") {
      resetDemo();
      if (tab === "editing") { startEditingTour(); return; }
      setTab("editing");
      setPendingTour("editing");
    } else if (tour === "eu-withdrawal") {
      setEuResetKey((k) => k + 1);
      setTab("eu-withdrawal");
      setPendingTour("eu-withdrawal");
    } else {
      if (tour === "upsell") setUpsellView("onetap");
      if (tour === "address") setAddrResetKey((k) => k + 1); // fresh address window each run
      setTab(tour);
      setPendingTour(tour);
    }
  }

  // (re)start the EU withdrawal mini-tour from a fresh order-status page
  function startEuTour() {
    setSingleTourMode(true);
    setActiveTour(null);
    setSpotlightRect(null);
    setActivePill("tour");
    setEuResetKey((k) => k + 1);
    setTab("eu-withdrawal");
    setPendingTour("eu-withdrawal");
  }

  // hand off from one feature's tour to the next: switch tabs, then start once mounted
  function goToTour(next: Tour) {
    setActiveTour(null);
    setSpotlightRect(null);
    if (next === "upsell") setUpsellView("onetap");
    if (next === "address") setAddrResetKey((k) => k + 1); // fresh address window on handoff
    setTab(next);
    setPendingTour(next);
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

  // reset the currently-shown feature window back to its fresh, pre-tour state
  function resetActiveFeature() {
    if (tab === "editing") resetDemo();
    else if (tab === "address") setAddrResetKey((k) => k + 1);
    else if (tab === "eu-withdrawal") setEuResetKey((k) => k + 1);
    else if (tab === "upsell") { setUpsellView("onetap"); setUpsellResetKey((k) => k + 1); }
  }

  function advanceTour() {
    if (!activeTour) return;
    const list = TOUR_STEPS[activeTour];
    const cur = list[tourStep];
    // an outcome step is the end of a feature's tour
    if (cur?.outcome) {
      // In single-tour mode, always finish here (don't chain to next feature)
      if (singleTourMode || !cur.nextTour) { if (singleTourMode) resetActiveFeature(); closeTour(); return; }
      // In complete-tour mode, hand off to the next feature
      goToTour(cur.nextTour);
      return;
    }
    // Individual (single-feature) tours finish WITHOUT the white finale screen —
    // that's reserved for the end of the complete tour. Reset the feature back to
    // its default state and close, instead of rendering the outcome step.
    const next = list[tourStep + 1];
    if (singleTourMode && next?.outcome) { resetActiveFeature(); closeTour(); return; }
    if (tourStep >= list.length - 1) {
      setActiveTour(null); setSpotlightRect(null); scrollDemoTop();
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
    setPendingTour(null);
    scrollDemoTop();
  }

  function selectFeature(k: Tab) {
    // on an outcome step, clicking the highlighted "next" card advances the chain
    if (activeTour && curStep?.outcome && curStep.nextTour === k) {
      goToTour(k as Tour);
      return;
    }
    setActiveTour(null);
    setSpotlightRect(null);
    setPendingTour(null);
    setActivePill("tour");
    setTourForcedOpen(null);
    setTab(k);
  }

  // start a pending tour once its tab swap has mounted the targets
  useEffect(() => {
    if (!pendingTour || tab !== pendingTour) return;
    const next = pendingTour;
    const t = setTimeout(() => {
      setPendingTour(null);
      if (next === "editing") { startEditingTour(); return; }
      setActivePill("tour");
      setActiveTour(next);
      enterStep(next, 0);
    }, 340);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, pendingTour]);

  // measure the spotlight for the active step — retries until the target(s) mount
  useEffect(() => {
    if (!activeTour) return;
    const list = TOUR_STEPS[activeTour];
    const s = list[tourStep];
    if (!s) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    // capture the spotlight + dot rects from the (now-settled) DOM
    const measureDemo = () => {
      if (!s.outcome || !demoFrameRef.current) return;
      const d = demoFrameRef.current.getBoundingClientRect();
      setDemoRect({ top: d.top, left: d.left, width: d.width, height: d.height });
    };
    const capture = (doScroll: boolean) => {
      if (cancelled) return;
      const el = getStepTarget(s.spotlightId ?? s.id);
      const dotEl = getStepTarget(s.dotId ?? s.spotlightId ?? s.id);
      if (!el || (s.dotId && !dotEl)) return;
      if (doScroll && !s.noScroll) scrollInnerIntoView(dotEl ?? el);
      const r = el.getBoundingClientRect();
      setSpotlightRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      const dr = (dotEl ?? el).getBoundingClientRect();
      setDotRect({ top: dr.top, left: dr.left, width: dr.width, height: dr.height });
      measureDemo();
      setMeasuredStep(tourStep);
    };
    const run = (attempt: number) => {
      if (cancelled) return;
      const el = getStepTarget(s.spotlightId ?? s.id);
      const dotEl = getStepTarget(s.dotId ?? s.spotlightId ?? s.id);
      // wait until both the spotlight and (if any) the dot target have mounted
      if (!el || (s.dotId && !dotEl)) {
        // an outcome step with no card to highlight → full-screen blurred CTA
        if (s.outcome) { setSpotlightRect(null); measureDemo(); setMeasuredStep(tourStep); return; }
        if (attempt < 10) timers.push(setTimeout(() => run(attempt + 1), 120));
        return;
      }
      capture(true);
      // accordions open/close over ~250ms; re-measure after they settle so the
      // spotlight + dot lock onto the target's FINAL position (no re-scroll jump).
      timers.push(setTimeout(() => capture(false), 300));
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
        <FeaturesRail tab={tab} onSelect={selectFeature} cardRefs={cardRefs} />

        {/* ---- RIGHT: aurora frame ---- */}
        <div ref={demoFrameRef} className="relative flex w-full flex-col gap-3 overflow-hidden rounded-[1.75rem] p-4 shadow-soft-xl sm:p-5">
          <div className="absolute inset-0 -z-0" style={{ background: "linear-gradient(135deg, #cdddff 0%, #6f9bff 48%, #2f5bff 100%)" }} />
          <div className="pointer-events-none absolute -right-16 -top-16 h-3/4 w-3/4 rounded-full bg-white/35 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-3/4 w-3/4 rounded-full bg-[#bcd4ff]/45 blur-3xl" />
          <div className="pointer-events-none absolute right-1/4 top-1/3 h-1/2 w-1/2 -rotate-12 rounded-full bg-white/25 blur-2xl" />

          {/* top bar — "Complete tour" + contextual individual tour button */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TourButton onClick={launchTour} label="Complete tour" />
              <button
                onClick={() => launchSingleTour(tab === "cancel" ? "editing" : tab as Tour)}
                className="group inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/20 px-4 py-2 text-[12px] font-bold text-white ring-1 ring-white/30 backdrop-blur-sm transition-all hover:bg-white/35 hover:ring-white/50"
              >
                <Sparkles className="size-3.5" />
                {tab === "editing" && "Order Editing Tour"}
                {tab === "upsell" && "Upsell Tour"}
                {tab === "address" && "Address Tour"}
                {tab === "eu-withdrawal" && "EU Withdrawal Tour"}
                {tab === "cancel" && "Order Editing Tour"}
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

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
                    tourRefs={{ countdown: countdownRef, shippingRow: shippingRowRef, addressForm: addressFormRef, addressBlock: addressBlockRef, saveBtn: saveBtnRef, orderRow: orderRowRef, orderBtn: orderBtnRef, orderPlusBtn: orderPlusBtnRef, payPanel: payPanelRef, payBtn: payBtnRef, sections: sectionsRef }}
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
                      key={`ty-demo-${upsellResetKey}`}
                      store={store}
                      initialOpen={null}
                      maxHeight={560}
                      upsellFirst
                      tourRefs={{ upsellRow: tyGridRef, upsellAddBtn: tyAddBtnRef }}
                      onUpsellAdded={() => { if (curStep?.id === "ty-add") advanceAfterPause(); }}
                    />
                  ) : (
                    <OneTapUpsellMock
                      key={`onetap-${upsellResetKey}`}
                      store={store}
                      addBtnRef={upsellAddBtnRef}
                      offerRef={upsellOfferRef}
                      onAdded={() => { if (curStep?.id === "upsell-add") advanceAfterPause(); }}
                    />
                  )
                )}
                {tab === "address" && (
                  <AddressValidationMock
                    key={`addr-${addrResetKey}`}
                    store={store}
                    tourRefs={{ saveBtn: addrSaveBtnRef, flaggedAddr: addrFlaggedRef, recommended: addrRecommendedRef, confirmBtn: addrConfirmRef }}
                    onValidated={() => { if (curStep?.id === "addr-validate") advanceAfterPause(); }}
                    onConfirmed={() => { if (curStep?.id === "addr-confirm") advanceAfterPause(); }}
                  />
                )}
                {tab === "eu-withdrawal" && (
                  <EUWithdrawalMock
                    key={`eu-${euResetKey}`}
                    store={store}
                    tourRefs={{ euCard: euCardRef, withdrawRow: euWithdrawRowRef, withdrawBtn: euWithdrawBtnRef }}
                    onWithdrawOpened={() => { if (curStep?.id === "eu-open") advanceAfterPause(); }}
                    onWithdrawn={() => { if (curStep?.id === "eu-submit") advanceAfterPause(); }}
                  />
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
      {activeTour && curStep && (curStep.outcome || spotlightRect) && (
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
          outcome={curStep.outcome}
          outcomeHeadline={curStep.outcomeHeadline}
          outcomeButton={curStep.outcomeButton}
          outcomeHref={APP_URL}
          nextLabel={curStep.nextLabel}
          finalStep={curStep.finalStep}
          blurRect={demoRect}
          onAdvance={advanceTour}
          onClose={closeTour}
        />
      )}
    </div>
  );
}

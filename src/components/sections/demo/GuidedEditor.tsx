"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ChevronRight, Globe, MapPin, Pencil, Play, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import type { DemoStore, DemoProduct } from "@/lib/site";
import type { Addr } from "./DemoMock";
import { DemoMock } from "./DemoMock";
import { OneTapUpsellMock } from "./OneTapUpsellMock";
import { EUWithdrawalMock } from "./EUWithdrawalMock";
import { TourOverlay, type TourRect } from "./TourOverlay";

const APP_URL = "https://apps.shopify.com/clickpost-order-edit-cancel";

type Tab = "editing" | "upsell" | "address" | "cancel" | "eu-withdrawal";
type Tour = "editing" | "upsell" | "address" | "eu-withdrawal";
type Section = "contact" | "shipping" | "order" | "discount" | "cancel";

/** Address the guided tour drops into the form to demonstrate an edit. */
const CORRECTED_ADDRESS: Partial<Addr> = { line1: "1820 Seacrest Blvd", city: "Carlsbad", zip: "92008" };

/** Left-rail features, each with an icon. */
const NAV_FEATURES: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "editing", label: "Order editing", icon: Pencil },
  { key: "upsell", label: "Post-purchase upsell", icon: TrendingUp },
  { key: "address", label: "Address validation", icon: MapPin },
  { key: "eu-withdrawal", label: "EU withdrawal", icon: ShieldCheck },
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
  /** force the callout card above the spotlight (for steps where below covers content) */
  cardAbove?: boolean;
  /** id of an element to programmatically "click" on step-enter so its animation
   *  plays automatically (Next-driven tour — no tapping required) */
  autoClickId?: string;
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
    desc: "Customers can edit their order for a window you control — no support ticket needed.",
    cta: "Next",
  },
  // ---- Address: ONE box explains it; the whole address section (incl. the
  // Update button) is spotlighted; the red dot points at the address as it
  // auto-fills, then (no new box) moves to the Update button. ----
  {
    id: "addr-show",
    title: "Self-serve edits",
    desc: "Change address, swap items, update contact info — all in seconds. Watch the shopper fix a wrong address, then tap Update to sync it.",
    cta: "Next",
    measureDelayMs: 520,
    spotlightId: "shipping-box", // whole address section, including the Update button
    dotId: "addr-block", // point at the address strip as it fills in
  },
  {
    id: "addr-update",
    title: "",
    desc: "",
    cta: "Next",
    measureDelayMs: 1250, // let the address finish auto-filling before pointing at Update
    noScroll: true,
    hideCard: true, // no new box — the dot just moves to the Update button
    spotlightId: "shipping-box",
    dotId: "addr-save",
    autoClickId: "addr-save",
  },
  // ---- Order: ONE box; dot on + then (no new box) on Update your order. ----
  {
    id: "order-add",
    title: "Add or change items",
    desc: "Add one more, swap, or remove. Tap + to bump the quantity, then Update your order to apply it — the new total is instant.",
    cta: "Next",
    measureDelayMs: 640,
    spotlightId: "order-row", // whole order section, including the Update button
    dotId: "order-plus",
    autoClickId: "order-plus",
  },
  {
    id: "order-apply",
    title: "",
    desc: "",
    cta: "Next",
    measureDelayMs: 340,
    hideCard: true,
    spotlightId: "order-row",
    dotId: "order-btn",
    autoClickId: "order-btn",
  },
  {
    id: "pay",
    title: "",
    desc: "",
    cta: "Next",
    measureDelayMs: 360,
    hideCard: true, // the balance-due panel explains itself — just point at Pay
    spotlightId: "pay-panel",
    dotId: "pay-btn",
    autoClickId: "pay-btn",
  },
  {
    // transition: highlight the Upsell feature button (screen stays on editing);
    // tapping it opens the upsell screen and continues the tour there.
    id: "to-upsell",
    title: "Every edit is an upsell opportunity",
    desc: "Turn every edit into extra revenue with one-tap add-ons. Tap Post-purchase upsell to see it.",
    cta: "Next",
    measureDelayMs: 260,
    spotlightId: "feature-upsell",
    dotId: "feature-upsell",
    nextTour: "upsell",
    nextLabel: "Post-purchase upsell",
  },
];

const UPSELL_TOUR_STEPS: TourStepDef[] = [
  {
    id: "upsell-offer",
    title: "One tap to add",
    desc: "A one-time deal the instant they pay — tap Add and it's charged to the card on file, no re-checkout.",
    cta: "Next",
    measureDelayMs: 320,
    spotlightId: "upsell-offer",
    dotId: "upsell-add",
    autoClickId: "upsell-add", // tap Add → adds the offer
  },
  {
    id: "ty-show",
    title: "And again on the order status page",
    desc: "Recommend add-ons above the edit options — tap Add and it's charged to the card on file.",
    cta: "Next",
    measureDelayMs: 380,
    spotlightId: "ty-grid",
    dotId: "ty-add",
    autoClickId: "ty-add", // tap Add → adds the item
    cardAbove: true, // below covers the "Explore all products" button
  },
  {
    // transition: highlight the Address feature button; tap to open it
    id: "to-address",
    title: "Catch bad addresses",
    desc: "Stop undeliverable orders before they ship. Tap Address validation to see it.",
    cta: "Next",
    measureDelayMs: 260,
    spotlightId: "feature-address",
    dotId: "feature-address",
    nextTour: "address",
    nextLabel: "Address validation",
  },
];

const ADDRESS_TOUR_STEPS: TourStepDef[] = [
  {
    id: "addr-flagged",
    title: "We catch bad addresses",
    desc: "Undeliverable or incomplete addresses are flagged before the order ships — the shopper accepts the corrected, deliverable address in one tap.",
    cta: "Next",
    measureDelayMs: 420,
    spotlightId: "addr-flagged",
  },
  {
    id: "addr-validate",
    title: "",
    desc: "",
    cta: "Next",
    measureDelayMs: 320,
    hideCard: true, // no new box — the dot just moves to the validate button
    spotlightId: "addr-flagged",
    dotId: "addr-validate",
    autoClickId: "addr-validate", // click Update → the address is validated (turns green)
  },
  {
    // transition to the last feature — EU withdrawal
    id: "to-eu",
    title: "One more: EU withdrawal",
    desc: "New EU rules require a clear withdrawal function. Tap EU withdrawal to see it.",
    cta: "Next",
    measureDelayMs: 260,
    spotlightId: "feature-eu",
    dotId: "feature-eu",
    nextTour: "eu-withdrawal",
    nextLabel: "EU withdrawal",
  },
];

const EU_WITHDRAWAL_TOUR_STEPS: TourStepDef[] = [
  {
    id: "eu-card",
    title: "EU withdrawal, built in",
    desc: "From 19 June 2026, EU shoppers need a clear withdrawal function. 'Withdraw from contract' sits right on the order status page — tap it, then confirm, and it's acknowledged by email instantly.",
    cta: "Next",
    measureDelayMs: 320,
    spotlightId: "eu-card",
  },
  {
    id: "eu-open",
    title: "",
    desc: "",
    cta: "Next",
    measureDelayMs: 320,
    hideCard: true, // no new box — dot points at the withdrawal row
    spotlightId: "eu-withdraw-row",
    dotId: "eu-withdraw-row",
    autoClickId: "eu-withdraw-row", // open the withdrawal form
  },
  {
    id: "eu-submit",
    title: "",
    desc: "",
    cta: "Next",
    measureDelayMs: 520,
    hideCard: true, // no new box — dot moves to the submit button
    spotlightId: "eu-withdraw-row", // the form area — stays framed as it becomes the confirmation
    dotId: "eu-withdraw-btn",
    autoClickId: "eu-withdraw-btn", // submit the request
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

/** Clickpost "Order Edit & Cancel" app icon — official logo from /public. */
function ClickpostMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- local brand asset
    <img src="/clickpost-app-logo.svg" alt="CP Order Editing" className={className} />
  );
}

/** Per-feature CTA copy: a store-specific headline verb + one real brand proof point. */
const FINALE: Record<Tab, { action: string; brand: string; stat: string }> = {
  editing: {
    action: "cut support tickets",
    brand: "Doonails",
    stat: "deflected 58% of “where’s my order” tickets and saved $12K a month.",
  },
  upsell: {
    action: "boost AOV",
    brand: "Mars by GHC",
    stat: "lifted AOV 23% and added $18K in post-purchase upsell this month.",
  },
  address: {
    action: "stop failed deliveries",
    brand: "World of Asaya",
    stat: "cut RTO by 25% by fixing wrong addresses before they shipped.",
  },
  "eu-withdrawal": {
    action: "stay EU-compliant",
    brand: "French Accent",
    stat: "automated EU withdrawal requests and stayed compliant with zero extra work.",
  },
  cancel: {
    action: "handle cancellations",
    brand: "Gladful",
    stat: "saw far fewer cancelled orders once shoppers could self-edit instead.",
  },
};

/** Official-style "Built for Shopify" badge — light-blue pill + cyan diamond. */
function BuiltForShopifyBadge() {
  return (
    <div className="flex justify-center">
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#d5ecf6] px-3 py-1.5 text-[13px] font-semibold text-neutral-900">
        <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden>
          <path d="M8 3 L4 8 L9 8 Z" fill="#9fe3f2" />
          <path d="M16 3 L20 8 L15 8 Z" fill="#9fe3f2" />
          <path d="M8 3 L16 3 L15 8 L9 8 Z" fill="#6fd3ea" />
          <path d="M4 8 L9 8 L12 21 Z" fill="#3fb4d6" />
          <path d="M9 8 L15 8 L12 21 Z" fill="#4bbfe0" />
          <path d="M15 8 L20 8 L12 21 Z" fill="#3fb4d6" />
        </svg>
        Built for Shopify
      </span>
    </div>
  );
}


/* ----------------------------- guided editor ----------------------------- */
export function GuidedEditor({ store }: { store: DemoStore }) {
  const domain = `${(store.brandName || "yourstore").toLowerCase().replace(/[^a-z0-9]+/g, "")}.com`;
  const [tab, setTab] = useState<Tab>("editing");
  const [activePill, setActivePill] = useState<ActionPill["key"]>("tour");
  const [upsellView, setUpsellView] = useState<"thankyou" | "onetap">("onetap");
  const [editView, setEditView] = useState<"thankyou" | "orderstatus">("thankyou"); // order-edit surface
  const [upsellExtras, setUpsellExtras] = useState<DemoProduct[]>([]); // offers accepted on the one-tap page

  // lifted tour state
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const [tourStep, setTourStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<TourRect | null>(null);
  const [dotRect, setDotRect] = useState<TourRect | null>(null); // where the red dot points (may differ from spotlight)
  const [measuredStep, setMeasuredStep] = useState(-1); // which step the current rect belongs to
  const [demoRect, setDemoRect] = useState<TourRect | null>(null); // editing-window bounds (blurred on outcome steps)
  const [pendingTour, setPendingTour] = useState<Tour | null>(null); // start this tour once its tab mounts
  const [singleTourMode, setSingleTourMode] = useState(false); // true = don't chain to the next feature's tour
  const [revealScreen, setRevealScreen] = useState(false); // after an action tap: drop the highlight to show the clean screen + toast

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
  const addrShippingRowRef = useRef<HTMLDivElement>(null);
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
      case "feature-upsell": return upsellCardRef.current;
      case "feature-address": return addressCardRef.current;
      case "feature-eu": return euWithdrawalCardRef.current;
      case "upsell-toggle": return upsellToggleRef.current;
      case "upsell-offer": return upsellOfferRef.current;
      case "upsell-add": return upsellAddBtnRef.current;
      case "ty-grid": return tyGridRef.current;
      case "ty-add": return tyAddBtnRef.current;
      case "addr-validate": return addrSaveBtnRef.current;
      case "addr-flagged": return addrFlaggedRef.current;
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
      case "addr-show":
        // open the shipping section and auto-fill the corrected address while the box explains
        setTourForcedOpen("shipping");
        setAddrOverride(CORRECTED_ADDRESS);
        break;
      case "addr-update":
        // stay open; the address is filled — dot moves to the Update button (no box)
        setTourForcedOpen("shipping");
        break;
      case "order-add":
        // open the order section with the original quantities
        setTourForcedOpen("order");
        break;
      case "order-apply":
        // stay open; dot moves to Update your order (no box)
        setTourForcedOpen("order");
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

  // hand off from one feature's tour to the next: switch tabs, then start once mounted
  function goToTour(next: Tour) {
    setActiveTour(null);
    setSpotlightRect(null);
    if (next === "upsell") { setUpsellView("onetap"); setUpsellExtras([]); }
    if (next === "address") setAddrResetKey((k) => k + 1); // fresh address window on handoff
    if (next === "eu-withdrawal") setEuResetKey((k) => k + 1); // fresh EU page on handoff
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

  function advanceTour() {
    if (!activeTour) return;
    const list = TOUR_STEPS[activeTour];
    const cur = list[tourStep];
    // finale step (end of the whole chain) — just close
    if (cur?.outcome) { closeTour(); return; }
    // transition step: the next-feature button is highlighted; tapping it opens
    // that feature NOW (the screen only switches on this tap).
    if (cur?.nextTour) {
      if (singleTourMode) { closeTour(); return; }
      goToTour(cur.nextTour);
      return;
    }
    // Single-feature tours stop before the transition/finale step.
    const next = list[tourStep + 1];
    if (singleTourMode && (next?.nextTour || next?.outcome)) { closeTour(); return; }
    if (tourStep >= list.length - 1) {
      setActiveTour(null); setSpotlightRect(null); scrollDemoTop();
    } else {
      enterStep(activeTour, tourStep + 1);
    }
  }


  function closeTour() {
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    setActiveTour(null);
    setSpotlightRect(null);
    setPendingTour(null);
    setRevealScreen(false);
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
    // tapping the Upsell feature always opens the One-tap view first
    if (k === "upsell") { setUpsellView("onetap"); setUpsellExtras([]); }
    setTab(k);
  }

  // Esc exits the tour
  useEffect(() => {
    if (!activeTour) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeTour(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTour]);

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
      // the red dot points at the actionable element: an explicit dotId, else the
      // button the step taps (autoClickId), else the spotlight.
      const dotEl = getStepTarget(s.dotId ?? s.autoClickId ?? s.spotlightId ?? s.id);
      if (!el || (s.dotId && !dotEl)) return;
      if (doScroll && !s.noScroll) scrollInnerIntoView(dotEl ?? el);
      const r = el.getBoundingClientRect();
      setSpotlightRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      const dr = (dotEl ?? el).getBoundingClientRect();
      setDotRect({ top: dr.top, left: dr.left, width: dr.width, height: dr.height });
      measureDemo();
      setMeasuredStep(tourStep);
      setRevealScreen(false); // next step is framed → bring the highlight back
    };
    const run = (attempt: number) => {
      if (cancelled) return;
      const el = getStepTarget(s.spotlightId ?? s.id);
      const dotEl = getStepTarget(s.dotId ?? s.spotlightId ?? s.id);
      // wait until both the spotlight and (if any) the dot target have mounted
      if (!el || (s.dotId && !dotEl)) {
        // an outcome step with no card to highlight → full-screen blurred CTA
        if (s.outcome) { setSpotlightRect(null); measureDemo(); setMeasuredStep(tourStep); setRevealScreen(false); return; }
        if (attempt < 10) timers.push(setTimeout(() => run(attempt + 1), 120));
        return;
      }
      capture(true);
      // accordions open/close over ~250ms; re-measure after they settle so the
      // spotlight + dot lock onto the target's FINAL position (no re-scroll jump).
      timers.push(setTimeout(() => capture(false), 300));
    };
    timers.push(setTimeout(() => run(0), s.measureDelayMs ?? 80));

    // Interactive: the presenter actually TAPS the highlighted action button. We
    // detect the tap at the document level (robust to re-renders) by checking the
    // click lands within the action element's box. Its real onClick still fires
    // (the action + toast); then we drop the highlight and advance after a beat.
    let cleanupClick: (() => void) | null = null;
    let advanced = false;
    if (s.autoClickId && !s.outcome) {
      const onDocClick = (e: MouseEvent) => {
        if (advanced || cancelled) return;
        const host = getStepTarget(s.autoClickId!) ?? getStepTarget(s.spotlightId ?? s.id);
        if (!host) return;
        const r = host.getBoundingClientRect();
        const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        if (!inside) return;
        advanced = true;
        setRevealScreen(true); // highlight off → clean screen + toast
        timers.push(setTimeout(() => { if (!cancelled) advanceTour(); }, 1400));
      };
      document.addEventListener("click", onDocClick, true);
      cleanupClick = () => document.removeEventListener("click", onDocClick, true);
    }

    return () => { cancelled = true; timers.forEach(clearTimeout); cleanupClick?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTour, tourStep]);

  // editing-window open state: tour-controlled during the tour, pill-controlled otherwise
  const editingForceOpen: Section | null =
    activeTour === "editing"
      ? tourForcedOpen
      : activePill !== "tour"
        ? currentPill.section ?? null
        : null;

  return (
    <div ref={rootRef} className="demo-scale-root scroll-mt-6">
      {/* During the tour, the left rail slides away and the demo centers so the
          typewriter callouts have clean space to the side. Closing the tour
          (cross / Esc → activeTour = null) restores the normal two-column view. */}
      <div className="demo-scale-grid grid grid-cols-1 items-stretch gap-6 lg:min-h-[100svh] lg:grid-cols-[minmax(0,0.52fr)_minmax(0,1.48fr)] lg:gap-0">
        {/* LEFT: feature buttons + the "ready to try" box */}
        <div className="relative z-10 flex flex-col gap-6 px-3 pb-6 lg:items-center lg:justify-start lg:pl-0 lg:pr-8 lg:pt-8 lg:pb-12">
          {/* heading + feature buttons */}
          <div className="w-full max-w-sm">
            <div className="mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- brand wordmark from clickpost.ai */}
              <img src="/clickpost-wordmark.png" alt="Clickpost" className="h-6 w-auto" />
            </div>
            <h3 className="mb-5 font-serif text-[1.3rem] font-bold italic leading-tight tracking-tight text-foreground">
              Click a feature to run it live.
            </h3>
            <div className="flex flex-col gap-3">
            {NAV_FEATURES.map((n) => {
              const active = tab === n.key;
              return (
                <button
                  key={n.key}
                  ref={cardRefs[n.key]}
                  onClick={() => selectFeature(n.key)}
                  style={active ? { background: "linear-gradient(160deg, #eaf2ff 0%, #cfe0ff 55%, #bcd6ff 100%)" } : undefined}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-5 py-3 text-left text-[15px] font-semibold transition-all ${
                    active
                      ? "text-neutral-900 ring-1 ring-[#9cc0ff] shadow-[0_10px_24px_-14px_rgba(21,95,255,0.45)]"
                      : "bg-white text-neutral-800 ring-1 ring-neutral-200 hover:-translate-y-0.5 hover:ring-neutral-300 hover:shadow-md"
                  }`}
                >
                  <span className="flex-1">{n.label}</span>
                  <ChevronRight
                    className={`size-4 shrink-0 transition-transform ${
                      active ? "text-[#155FFF]" : "text-neutral-300 group-hover:translate-x-0.5 group-hover:text-[#155FFF]"
                    }`}
                  />
                </button>
              );
            })}
            </div>
          </div>

          {/* the "ready to try" box — rotating result + app listing + Book a free demo */}
          <div className="relative flex w-full max-w-sm flex-col gap-5 overflow-hidden rounded-2xl border border-neutral-200/90 bg-white/70 p-6 text-center shadow-[0_4px_16px_-8px_rgba(15,15,25,0.18)] backdrop-blur-md">
            <div>
              <h3 className="font-sans text-[22px] font-extrabold leading-[1.15] tracking-tight text-foreground">
                Ready to {FINALE[tab].action} on{" "}
                <span className="text-[#155FFF]">your store</span>?
              </h3>
            </div>
            <div className="flex items-center justify-center gap-3">
              <ClickpostMark className="size-10 shrink-0 rounded-[9px] shadow-sm" />
              <div className="text-left">
                <div className="whitespace-nowrap text-[15px] font-extrabold leading-tight tracking-tight text-neutral-900">CP Order Editing &amp; Upsell</div>
                <div className="mt-1 flex items-center gap-1 text-[13px] text-neutral-900">
                  <span className="font-bold">5.0</span>
                  <span aria-hidden>★</span>
                  <span className="underline">(52)</span>
                </div>
              </div>
            </div>
            <BuiltForShopifyBadge />
            <a
              href={APP_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-md transition-all hover:brightness-110 active:scale-[0.99]"
              style={{ background: "#155FFF" }}
            >
              Start free trial <ArrowUpRight className="size-4 shrink-0" />
            </a>
          </div>
        </div>

        {/* RIGHT: full-bleed blue demo stage — top pill nav + paired sub-row + sliding window */}
        <div
          ref={demoFrameRef}
          className="relative flex w-full flex-col justify-center gap-4 lg:justify-start lg:gap-5 lg:px-10 lg:pt-8 lg:pb-12 xl:px-16"
        >
          {/* blue backdrop (desktop only) */}
          <div aria-hidden className="absolute inset-0 z-0 hidden lg:block" style={{ background: "linear-gradient(160deg, #eaf2ff 0%, #cfe0ff 42%, #a8c8ff 100%)" }} />

          {/* bar over the editing window — Start tour (left) · brand URL (center) · Start free trial (right) */}
          <div className="relative z-10 flex items-center justify-between gap-3">
            {/* Start tour — with a shine sweep */}
            <button
              onClick={launchTour}
              className="group relative hidden shrink-0 items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full bg-white px-4 py-2.5 text-[12.5px] font-semibold text-neutral-800 shadow-soft-md ring-1 ring-neutral-200 transition-all hover:bg-neutral-50 lg:inline-flex"
            >
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ background: "linear-gradient(100deg, transparent 38%, rgba(21,95,255,0.28) 50%, transparent 62%)" }}
                initial={{ x: "-140%" }}
                animate={{ x: "140%" }}
                transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.2 }}
              />
              <Play className="relative z-10 size-3 fill-current" />
              <span className="relative z-10">Start tour</span>
            </button>

            {/* Order-edit sub-tabs — Thank you page / Order status page */}
            {tab === "editing" && (
              <div className="flex shrink-0 items-center gap-1 rounded-full bg-white/70 p-1 shadow-soft-md ring-1 ring-neutral-200">
                {([["thankyou", "Thank you page"], ["orderstatus", "Order status page"]] as const).map(([key, label]) => {
                  const active = editView === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setEditView(key)}
                      className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[12px] font-semibold transition-colors ${
                        active ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Upsell sub-tabs — in the top bar (Upsell feature only) */}
            {tab === "upsell" && (
              <div ref={upsellToggleRef} className="flex shrink-0 items-center gap-1 rounded-full bg-white/70 p-1 shadow-soft-md ring-1 ring-neutral-200">
                {([["onetap", "One tap upsell"], ["thankyou", "Order status page"]] as const).map(([key, label]) => {
                  const active = upsellView === key;
                  return (
                    <button
                      key={key}
                      onClick={() => { setUpsellView(key); if (key === "onetap") setUpsellExtras([]); }}
                      className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[12px] font-semibold transition-colors ${
                        active ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}

            <a
              href={APP_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-5 py-2.5 text-[13px] font-bold text-white shadow-md transition-all hover:brightness-110"
              style={{ background: "#155FFF" }}
            >
              Start free trial
            </a>
          </div>

          {/* sub-row — mobile-only Start tour (desktop has everything in the top bar) */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 lg:hidden">
            <button
              onClick={launchTour}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-[12px] font-semibold text-neutral-700 shadow-sm ring-1 ring-neutral-200 transition-all hover:bg-neutral-50"
            >
              <Play className="size-3.5 fill-current" />
              Start tour
            </button>
          </div>

          {/* body — the editing window: browser bezel (store URL) + sliding mock */}
          <div className="relative z-10 w-full overflow-hidden rounded-2xl bg-white shadow-soft-xl" style={{ border: "1.5px solid #1f2430" }}>
            {/* browser bezel with the store URL */}
            <div className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-4 py-2.5">
              {/* store logo — in place of the traffic-light dots */}
              {store.logo ? (
                // eslint-disable-next-line @next/next/no-img-element -- store favicon/logo
                <img src={store.logo} alt="" className="size-9 shrink-0 rounded-md object-contain" referrerPolicy="no-referrer" onError={(e) => (e.currentTarget.style.display = "none")} />
              ) : (
                <Globe className="size-9 shrink-0 text-neutral-400" />
              )}
              <div className="mx-auto flex items-center gap-2 rounded-md bg-white px-4 py-1.5 text-[15px] font-extrabold text-neutral-900 ring-1 ring-neutral-200">
                {domain}
              </div>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab === "upsell" ? `upsell-${upsellView}` : tab === "editing" ? `editing-${editView}` : tab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
              >
                {tab === "editing" && (
                  <DemoMock
                    key={`demo-${demoResetKey}-${editView}`}
                    store={store}
                    initialOpen={null}
                    forceOpen={editingForceOpen}
                    pageContext={editView}
                    maxHeight={560}
                    tourRefs={{ countdown: countdownRef, shippingRow: shippingRowRef, addressForm: addressFormRef, addressBlock: addressBlockRef, saveBtn: saveBtnRef, orderRow: orderRowRef, orderBtn: orderBtnRef, orderPlusBtn: orderPlusBtnRef, payPanel: payPanelRef, payBtn: payBtnRef, sections: sectionsRef }}
                    addressOverride={addrOverride}
                    qtyBump={qtyBump}
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
                      extraItems={upsellExtras}
                      tourRefs={{ upsellRow: tyGridRef, upsellAddBtn: tyAddBtnRef }}
                    />
                  ) : (
                    <OneTapUpsellMock
                      key={`onetap-${upsellResetKey}`}
                      store={store}
                      addBtnRef={upsellAddBtnRef}
                      offerRef={upsellOfferRef}
                      onComplete={(added) => { setUpsellExtras(added); setUpsellView("thankyou"); }}
                      onViewOrder={() => { setUpsellExtras([]); setUpsellView("thankyou"); }}
                    />
                  )
                )}
                {tab === "address" && (
                  <DemoMock
                    key={`addr-${addrResetKey}`}
                    store={store}
                    initialOpen="shipping"
                    forceOpen="shipping"
                    maxHeight={560}
                    addressValidation
                    tourRefs={{ shippingRow: addrShippingRowRef, addressBlock: addrFlaggedRef, addrSaveBtn: addrSaveBtnRef }}
                  />
                )}
                {tab === "eu-withdrawal" && (
                  <EUWithdrawalMock
                    key={`eu-${euResetKey}`}
                    store={store}
                    tourRefs={{ euCard: euCardRef, withdrawRow: euWithdrawRowRef, withdrawBtn: euWithdrawBtnRef }}
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
      {activeTour && curStep && !revealScreen && (curStep.outcome || spotlightRect) && (
        <TourOverlay
          step={tourStep}
          total={steps.length}
          rect={spotlightRect}
          title={curStep.title}
          desc={curStep.desc}
          cta={curStep.cta}
          clickThrough={!!curStep.clickThrough || !!curStep.autoClickId}
          showDot={!curStep.outcome && measuredStep === tourStep}
          showFinger={tourStep === 0 && !curStep.outcome}
          dotRect={dotRect}
          hideCard={curStep.hideCard}
          hideCta={curStep.hideCta}
          cardAbove={curStep.cardAbove}
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

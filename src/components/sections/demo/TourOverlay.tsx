"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ShopifyAppStoreBadge } from "./ShopifyAppStoreBadge";
import { BuiltForShopifyBadge } from "./BuiltForShopifyBadge";

const TOUR_ACCENT = "#155FFF";

/** Types `text` out character by character; restarts whenever `text` changes. */
function Typewriter({ text, className }: { text: string; className?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) clearInterval(id);
    }, 26);
    return () => clearInterval(id);
  }, [text]);
  const done = n >= text.length;
  return (
    <p className={className}>
      {text.slice(0, n)}
      {!done && <span className="ml-px inline-block animate-pulse">▍</span>}
    </p>
  );
}

export type TourRect = { top: number; left: number; width: number; height: number };

/**
 * Full-screen guided-tour overlay: dark scrim with a spotlight cutout over `rect`,
 * a pulsing ring, a bouncing 👆, and a tooltip card. Rendered via a portal to
 * document.body using viewport coordinates, so it can spotlight an element in ANY
 * component. Step content (title/desc/cta) is passed in by the controller.
 */
export function TourOverlay({
  step,
  total,
  rect,
  title,
  desc,
  clickThrough = false,
  showDot = false,
  showFinger = false,
  dotRect,
  hideCard = false,
  cardAbove = false,
  outcome = false,
  outcomeHref,
  outcomeHeadline,
  finalStep = false,
  blurRect,
  displayStep,
  displayTotal,
  nextFeatureLabel,
  onNextFeature,
  onAdvance,
  onClose,
}: {
  step: number;
  total: number;
  /** Progress shown in the card ("X/Y" + dots) — counts only steps that show a box. */
  displayStep?: number;
  displayTotal?: number;
  rect: TourRect | null;
  title: string;
  desc: string;
  cta: string;
  /** When true, the spotlight zone lets clicks fall through to the real element. */
  clickThrough?: boolean;
  /** Show the red "tap here" ripple dot (only on steps you tap the element). */
  showDot?: boolean;
  /** Show a 👆 finger next to the dot (first step, to teach tap-to-continue). */
  showFinger?: boolean;
  /** Where the dot points (defaults to the spotlight rect). */
  dotRect?: TourRect | null;
  /** Hide the tooltip card (e.g. when the highlighted element is self-explanatory). */
  hideCard?: boolean;
  /** Force the card above the spotlight (steps where below would cover content). */
  cardAbove?: boolean;
  /** Hide the Next button (user advances by tapping the highlighted element). */
  hideCta?: boolean;
  /** Render the end-of-feature conversion overlay: blurred backdrop + centered CTA. */
  outcome?: boolean;
  outcomeHeadline?: string;
  outcomeButton?: string;
  outcomeHref?: string;
  /** "Up next: …" hint on outcome steps (omit on the final step). */
  nextLabel?: string;
  /** Final step of the whole chain — the advance affordance reads "Finish" and closes. */
  finalStep?: boolean;
  /** The editing/demo window rect — outcome steps blur only this region. */
  blurRect?: TourRect | null;
  /** Label of the next feature — when set, the finale shows a "Watch next" CTA. */
  nextFeatureLabel?: string;
  /** Jump to the next feature and auto-start its tour. */
  onNextFeature?: () => void;
  onAdvance: () => void;
  onClose: () => void;
}) {
  // measure the tooltip's real height so positioning never overlaps/overflows —
  // a ResizeObserver keeps it accurate as the typewriter grows the card.
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardH, setCardH] = useState(240);
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    setCardH(el.offsetHeight);
    const ro = new ResizeObserver(() => setCardH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [step]);

  if (typeof window === "undefined") return null;

  // ---- Outcome overlay ----
  // Only the final step shows a card (the full conversion box). In-between feature
  // hops are skipped by the controller — it hands straight off to the next feature.
  if (outcome) {
    const headline = finalStep
      ? "Ready to reduce support tickets and boost AOV using CP Order Editing?"
      : outcomeHeadline ?? "You've seen it in action — start your free trial now.";

    return createPortal(
      <div className="pointer-events-none fixed inset-0 z-[500]">
        {/* near-solid backdrop — everything behind disappears; tap it (or the cross) to close */}
        <div
          className="pointer-events-auto absolute inset-0 bg-[rgba(9,14,32,0.96)]"
          onClick={onClose}
        />

        {/* conversion box — the SAME box on in-between hops and the final step */}
        <motion.div
          key={`outcome-${step}`}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 sm:p-8"
        >
           {/* thick light-blue frame (~1cm) + pulsing side glow — compact, squarish card */}
           <motion.div
             className="pointer-events-auto flex max-h-full w-full max-w-md rounded-[22px] bg-gradient-to-br from-[#dcebff] via-[#bcd6ff] to-[#9cc0ff] p-2.5 sm:rounded-[28px] sm:p-4"
             animate={{ boxShadow: [
               "0 0 44px -6px rgba(156,192,255,0.50), 0 0 100px -12px rgba(21,95,255,0.20)",
               "0 0 78px -4px rgba(156,192,255,0.72), 0 0 150px -8px rgba(21,95,255,0.34)",
               "0 0 44px -6px rgba(156,192,255,0.50), 0 0 100px -12px rgba(21,95,255,0.20)",
             ] }}
             transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
           >
            <div className="relative flex max-h-full w-full flex-col overflow-hidden rounded-[14px] bg-[#faf8f4]">
             {/* close cross */}
             <button
               onClick={onClose}
               aria-label="Close"
               className="absolute right-3 top-3 z-10 flex size-7 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-200/70 hover:text-neutral-700"
             >
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
             </button>
             <div className="flex flex-col items-center overflow-y-auto px-5 py-6 text-center sm:px-6 sm:py-7">
              {/* top text — eyebrow */}
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#155FFF]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#155FFF]">
                <span className="size-1.5 rounded-full bg-[#155FFF]" />
                You&apos;ve seen it in action
              </div>

              {/* headline */}
              <h2 className="max-w-xs font-sans text-[17px] font-extrabold leading-[1.15] tracking-tight text-neutral-900">
                {headline}
              </h2>

              {/* Built for Shopify */}
              <div className="mt-4">
                <BuiltForShopifyBadge />
              </div>

              {/* Available on Shopify App Store */}
              {outcomeHref && <ShopifyAppStoreBadge href={outcomeHref} className="mt-3 w-full max-w-[280px]" />}

              {/* Watch next feature — auto-opens the next feature and starts its tour */}
              {nextFeatureLabel && onNextFeature && (
                <button
                  onClick={onNextFeature}
                  className="mt-3 flex w-full max-w-[280px] items-center justify-center gap-2 rounded-xl border-2 border-[#155FFF] bg-white px-4 py-2.5 text-[13px] font-bold text-[#155FFF] transition-colors hover:bg-[#155FFF]/5 active:scale-[0.99]"
                >
                  Watch next: {nextFeatureLabel}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </button>
              )}

            </div>
            </div>
           </motion.div>
          </motion.div>
      </div>,
      document.body
    );
  }

  if (!rect) return null;
  const PAD = 10;
  const GAP = 14;
  const sl = { top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 };
  const cardW = Math.min(280, window.innerWidth - 24);
  const clampTop = (t: number) => Math.min(Math.max(t, 8), Math.max(8, window.innerHeight - cardH - 8));

  // Keep the card OFF the demo window: place it to the LEFT of the window (the
  // rail area) so it never covers the content it's pointing at. Only when there's
  // no room there (mobile / full-width window) fall back to below/above.
  const leftSlot = blurRect ? blurRect.left - cardW - GAP : -1;
  // On transition steps the spotlight is a feature card in the LEFT rail — placing
  // the card to the left would cover the rail (and the feature you must tap), so
  // put it to the RIGHT of the spotlight instead.
  const spotlightLeftOfDemo = blurRect != null && sl.left + sl.width <= blurRect.left + 8;
  let tooltipLeft: number;
  let tooltipTop: number;
  let tooltipBelow = true;
  // Prefer the card to the LEFT of the window (beside it, off the content),
  // vertically centered on the spotlight. Only fall back to below/above when
  // there's genuinely no room to the left (very narrow / full-width window).
  if (spotlightLeftOfDemo) {
    tooltipLeft = Math.min(sl.left + sl.width + GAP, window.innerWidth - cardW - 12);
    tooltipTop = clampTop(sl.top + sl.height / 2 - cardH / 2);
    tooltipBelow = false;
  } else if (leftSlot >= 12) {
    tooltipLeft = leftSlot;
    tooltipTop = clampTop(sl.top + sl.height / 2 - cardH / 2);
    tooltipBelow = false;
  } else {
    const spaceBelow = window.innerHeight - (sl.top + sl.height);
    const spaceAbove = sl.top;
    tooltipBelow = cardAbove ? false : spaceBelow >= cardH + GAP || spaceAbove < cardH + GAP;
    tooltipTop = clampTop(tooltipBelow ? sl.top + sl.height + GAP : sl.top - cardH - GAP);
    tooltipLeft = Math.min(Math.max(sl.left, 12), window.innerWidth - cardW - 12);
  }

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[500]">
      {/* Dark overlay with spotlight cutout */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <mask id={`tsp-${step}`}>
            <rect width="100%" height="100%" fill="white" />
            <rect x={sl.left} y={sl.top} width={sl.width} height={sl.height} rx="10" fill="black" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(4,9,30,0.72)" mask={`url(#tsp-${step})`} />
      </svg>

      {/* Interaction blockers — swallow every tap / swipe / click OUTSIDE the spotlight,
          so only the highlighted element stays usable during the tour. */}
      {(() => {
        const swallow = (e: React.SyntheticEvent) => { e.preventDefault(); e.stopPropagation(); };
        const block = "pointer-events-auto absolute";
        const s = { touchAction: "none" as const };
        return (
          <div aria-hidden onClickCapture={swallow} onPointerDownCapture={swallow} onTouchStartCapture={swallow}>
            <div className={block} style={{ ...s, top: 0, left: 0, width: "100%", height: Math.max(0, sl.top) }} />
            <div className={block} style={{ ...s, top: sl.top + sl.height, left: 0, right: 0, bottom: 0 }} />
            <div className={block} style={{ ...s, top: sl.top, left: 0, width: Math.max(0, sl.left), height: sl.height }} />
            <div className={block} style={{ ...s, top: sl.top, left: sl.left + sl.width, right: 0, height: sl.height }} />
          </div>
        );
      })()}

      {/* Pulsing ring */}
      <div
        className="pointer-events-none absolute animate-pulse rounded-[10px]"
        style={{ top: sl.top, left: sl.left, width: sl.width, height: sl.height, boxShadow: "0 0 0 2px rgba(255,255,255,0.9), 0 0 0 6px rgba(255,255,255,0.18)" }}
      />

      {/* Clickable spotlight zone (or click-through to the real element) */}
      <div
        className={`absolute rounded-[10px] ${clickThrough ? "pointer-events-none" : "pointer-events-auto cursor-pointer"}`}
        style={{ top: sl.top, left: sl.left, width: sl.width, height: sl.height }}
        onClick={clickThrough ? undefined : onAdvance}
      />

      {/* Red ripple tap indicator — only on steps you tap the highlighted element */}
      {showDot && (
        <div
          className="pointer-events-none absolute"
          style={
            dotRect
              ? { top: dotRect.top + dotRect.height / 2 - 8, left: dotRect.left + dotRect.width - 34 }
              : { top: sl.top + sl.height / 2 - 8, left: sl.left + sl.width - 34 }
          }
          aria-label="tap here"
        >
          <span className="relative flex size-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex size-4 rounded-full bg-red-500 ring-2 ring-white" />
          </span>
          {showFinger && (
            <span
              className="pointer-events-none absolute left-3 top-4 animate-bounce select-none text-2xl"
              style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))" }}
              aria-hidden
            >
              👆
            </span>
          )}
        </div>
      )}

      {/* Tooltip card */}
      {!hideCard && (
      <motion.div
        key={`card-${step}`}
        ref={cardRef}
        initial={{ opacity: 0, y: tooltipBelow ? 10 : -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto absolute w-[min(280px,calc(100vw-24px))] overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{ top: tooltipTop, left: tooltipLeft, transition: "top 0.15s ease-out, left 0.15s ease-out" }}
      >
        <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${TOUR_ACCENT}, #7c3aed)` }} />
        <div className="p-5">
          {/* dot navigation — counts only the steps that show a box */}
          {(() => {
            const dStep = displayStep ?? step;
            const dTotal = displayTotal ?? total;
            return (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[11px] font-semibold tabular-nums text-neutral-400">{dStep + 1}/{dTotal}</span>
            <div className="ml-auto flex items-center gap-1.5">
              {Array.from({ length: dTotal }).map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{ width: i === dStep ? 18 : 6, background: i === dStep ? TOUR_ACCENT : "#dbe3f0" }}
                />
              ))}
            </div>
            </div>
            );
          })()}
          <div className="font-serif text-[19px] font-bold leading-tight tracking-tight text-neutral-900">{title}</div>
          <Typewriter key={`tw-${step}`} text={desc} className="mt-2 min-h-[2.6em] text-[13.5px] font-medium leading-relaxed text-neutral-500" />
        </div>
      </motion.div>
      )}

      {/* Skip */}
      <button
        onClick={onClose}
        className="group pointer-events-auto absolute right-5 top-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-bold text-neutral-700 shadow-[0_6px_20px_-6px_rgba(15,23,42,0.5)] ring-1 ring-black/5 backdrop-blur-md transition-all hover:bg-white hover:text-neutral-900 active:scale-95"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="transition-transform group-hover:rotate-90"><path d="M6 6l12 12M18 6L6 18" /></svg>
        Close tour
      </button>
    </div>,
    document.body
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion } from "framer-motion";

const TOUR_ACCENT = "#155FFF";

/** Clickpost app icon (vector). */
function ClickpostMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Clickpost" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="22" fill="#1668FF" />
      <g fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M42 33 L20 45 L20 71 L42 83 L64 71 L64 45 Z" />
        <path d="M20 45 L42 57 L64 45" />
        <path d="M42 57 L42 83" />
        <path d="M48 86 L77 57" strokeWidth="6" />
        <circle cx="71" cy="30" r="13" fill="#1668FF" />
        <path d="M80 39 L88 47" />
        <path d="M66 25 L76 35 M76 25 L66 35" strokeWidth="3" />
      </g>
    </svg>
  );
}

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
  cta,
  clickThrough = false,
  showDot = false,
  dotRect,
  hideCard = false,
  hideCta = false,
  outcome = false,
  outcomeHref,
  outcomeHeadline,
  nextLabel,
  finalStep = false,
  blurRect,
  tapAt,
  onAdvance,
  onClose,
}: {
  step: number;
  total: number;
  rect: TourRect | null;
  title: string;
  desc: string;
  cta: string;
  /** When true, the spotlight zone lets clicks fall through to the real element. */
  clickThrough?: boolean;
  /** Show the red "tap here" ripple dot (only on steps you tap the element). */
  showDot?: boolean;
  /** Where the dot points (defaults to the spotlight rect). */
  dotRect?: TourRect | null;
  /** Hide the tooltip card (e.g. when the highlighted element is self-explanatory). */
  hideCard?: boolean;
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
  /** Viewport point where the tour just auto-tapped a button — shows a ripple. */
  tapAt?: { top: number; left: number } | null;
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
  // In-between hops: a minimal "result → continue" card (no logo/reviews/CTA).
  // The full conversion box (with Start free trial) shows ONLY on the final step.
  if (outcome && !finalStep) {
    const swallow = (e: React.SyntheticEvent) => { e.preventDefault(); e.stopPropagation(); };
    return createPortal(
      <div className="pointer-events-none fixed inset-0 z-[500]">
        <div
          className="pointer-events-auto absolute inset-0 bg-[rgba(15,23,42,0.28)] backdrop-blur-[2px]"
          onClickCapture={swallow}
          onPointerDownCapture={swallow}
          onTouchStartCapture={swallow}
        />
        <motion.div
          key={`hop-${step}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center p-4"
        >
          <div className="pointer-events-auto relative w-full max-w-xs rounded-2xl border border-neutral-200 bg-[#faf8f4] px-6 py-6 text-center shadow-2xl">
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-200/70 hover:text-neutral-700"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
            <span className="mx-auto mb-3 flex size-9 items-center justify-center rounded-full bg-[#155FFF]/10 text-[#155FFF]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
            </span>
            <h2 className="font-sans text-[18px] font-extrabold leading-tight tracking-tight text-neutral-900">
              {outcomeHeadline ?? "You've seen it in action"}
            </h2>
            <button
              onClick={onAdvance}
              className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-lg py-3 text-[14px] font-bold text-white transition-all hover:brightness-110 active:scale-[0.99]"
              style={{ background: "linear-gradient(135deg, #3b7cff, #155FFF 55%, #7c3aed)" }}
            >
              Continue to {nextLabel ?? "next"}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
        </motion.div>
      </div>,
      document.body
    );
  }

  // Final step (end of the chain): the full centered conversion window.
  if (outcome) {
    const swallow = (e: React.SyntheticEvent) => { e.preventDefault(); e.stopPropagation(); };
    const headline = finalStep
      ? "Ready to reduce support tickets and boost AOV using CP Order Editing?"
      : outcomeHeadline ?? "You've seen it in action — start your free trial now.";

    return createPortal(
      <div className="pointer-events-none fixed inset-0 z-[500]">
        {/* dim + blur backdrop — no feature highlight */}
        <div
          className="pointer-events-auto absolute inset-0 bg-[rgba(15,23,42,0.30)] backdrop-blur-[3px]"
          onClickCapture={swallow}
          onPointerDownCapture={swallow}
          onTouchStartCapture={swallow}
        />

        {/* conversion box — the SAME box on in-between hops and the final step */}
        <motion.div
          key={`outcome-${step}`}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center p-3 sm:p-7"
        >
           {/* thick blue→purple frame (~1cm) + pulsing side glow — compact, squarish card */}
           <motion.div
             className="pointer-events-auto flex max-h-full w-full max-w-md rounded-[22px] bg-gradient-to-br from-[#4c86ff] via-[#155FFF] to-[#7c3aed] p-2.5 sm:rounded-[28px] sm:p-4"
             animate={{ boxShadow: [
               "0 0 44px -6px rgba(21,95,255,0.45), 0 0 100px -12px rgba(124,58,237,0.30)",
               "0 0 78px -4px rgba(21,95,255,0.68), 0 0 150px -8px rgba(124,58,237,0.48)",
               "0 0 44px -6px rgba(21,95,255,0.45), 0 0 100px -12px rgba(124,58,237,0.30)",
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
              {/* app logo + name */}
              <div className="flex flex-col items-center gap-2">
                <ClickpostMark className="size-11 rounded-[10px] shadow-sm" />
                <span className="text-[22px] font-extrabold leading-none tracking-tight text-neutral-900">CP Order Editing</span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-neutral-500">
                {/* eslint-disable-next-line @next/next/no-img-element -- Shopify icon from /public */}
                <img src="/shopify-icon.png" alt="Shopify" className="size-3.5 object-contain" />
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24"><path d="M12 2l3 6.5 7 .6-5.3 4.6 1.6 6.8L12 17.3 5.7 20.5l1.6-6.8L2 9.1l7-.6z" /></svg>
                <span className="font-bold text-neutral-900">5.0</span>
                <span>· 50+ reviews</span>
              </div>

              {/* headline */}
              <h2 className="mt-4 max-w-xs font-sans text-[17px] font-extrabold leading-[1.15] tracking-tight text-neutral-900">
                {headline}
              </h2>

              {/* buttons — Continue (hops) / Book a demo (final) + the main free-trial CTA */}
              <div className="mt-5 flex w-full flex-col gap-2.5 sm:flex-row">
                {!finalStep && (
                  <button
                    onClick={onAdvance}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-[#155FFF] bg-white py-2.5 text-[13px] font-bold text-[#155FFF] transition-colors hover:bg-[#155FFF]/5"
                  >
                    Continue to {nextLabel ?? "next"}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </button>
                )}
                <a
                  href={outcomeHref}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative flex flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-lg py-2.5 text-[13px] font-bold text-white transition-all hover:brightness-110 active:scale-[0.99]"
                  style={{ background: "linear-gradient(135deg, #3b7cff, #155FFF 55%, #7c3aed)", boxShadow: "0 10px 26px -8px rgba(21,95,255,0.7)" }}
                >
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-white/25"
                    initial={{ x: "-180%" }}
                    animate={{ x: "460%" }}
                    transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.4, ease: "easeInOut" }}
                  />
                  <span className="relative">Start free trial</span>
                  <svg className="relative" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17 17 7M9 7h8v8" /></svg>
                </a>
                {finalStep && (
                  <Link
                    href="/#contact"
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white py-2.5 text-[13px] font-semibold text-neutral-800 transition-colors hover:bg-neutral-50"
                  >
                    Book a demo
                  </Link>
                )}
              </div>

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
  let tooltipLeft: number;
  let tooltipTop: number;
  let tooltipBelow = true;
  if (leftSlot >= 10) {
    tooltipLeft = leftSlot;
    tooltipTop = clampTop(sl.top + sl.height / 2 - cardH / 2);
    tooltipBelow = false;
  } else {
    const spaceBelow = window.innerHeight - (sl.top + sl.height);
    const spaceAbove = sl.top;
    const fitsBelow = spaceBelow >= cardH + GAP;
    const fitsAbove = spaceAbove >= cardH + GAP;
    tooltipBelow = fitsBelow || !fitsAbove;
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

      {/* Tap ripple — shown when the tour auto-taps a button (Next-driven action) */}
      {tapAt && (
        <span className="pointer-events-none absolute z-10" style={{ top: tapAt.top, left: tapAt.left }} aria-hidden>
          <span className="relative flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full" style={{ background: "rgba(21,95,255,0.55)" }} />
            <span className="relative inline-flex size-5 rounded-full ring-2 ring-white" style={{ background: TOUR_ACCENT }} />
          </span>
        </span>
      )}

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
          {/* dot navigation */}
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[11px] font-semibold tabular-nums text-neutral-400">{step + 1}/{total}</span>
            <div className="ml-auto flex items-center gap-1.5">
              {Array.from({ length: total }).map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{ width: i === step ? 18 : 6, background: i === step ? TOUR_ACCENT : "#dbe3f0" }}
                />
              ))}
            </div>
          </div>
          <div className="font-serif text-[19px] font-bold leading-tight tracking-tight text-neutral-900">{title}</div>
          <Typewriter key={`tw-${step}`} text={desc} className="mt-2 min-h-[2.6em] text-[13.5px] font-medium leading-relaxed text-neutral-500" />
          {!hideCta && (
            <button
              onClick={onAdvance}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold text-white transition-all hover:brightness-110"
              style={{ background: TOUR_ACCENT }}
            >
              {cta}
              {cta !== "Finish" && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </button>
          )}
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

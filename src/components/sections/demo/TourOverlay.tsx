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

// brands shown as a static collage at the bottom of the final window
const FINAL_BRAND_LOGOS = [
  "/customers/doonails.svg",
  "/customers/hautesauce.png",
  "/customers/curlwarehouse.png",
  "/customers/modomu.png",
  "/customers/mateina.png",
];

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
  nextLabel,
  finalStep = false,
  blurRect,
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
  // In-between hops: light blur over the demo window only + a small "Explore next" callout.
  // Final step (end of the chain): a bigger centered conversion window with the app name.
  if (outcome) {
    const swallow = (e: React.SyntheticEvent) => { e.preventDefault(); e.stopPropagation(); };
    // light dim/blur limited to the editing window (fallback: whole screen, still light)
    const dim = blurRect
      ? { top: blurRect.top, left: blurRect.left, width: blurRect.width, height: blurRect.height }
      : null;
    const dimClass = "pointer-events-auto absolute bg-[rgba(15,23,42,0.16)] backdrop-blur-[3px]";

    // small callout anchored beside the highlighted next-feature card
    const calloutTop = rect ? Math.max(12, Math.min(rect.top, window.innerHeight - 130)) : 0;
    const calloutLeft = rect ? Math.min(rect.left + rect.width + 14, window.innerWidth - 236) : 0;

    return createPortal(
      <div className="pointer-events-none fixed inset-0 z-[500]">
        {/* light blur over the editing window */}
        {dim ? (
          <div className={`${dimClass} rounded-[1.75rem]`} style={{ top: dim.top, left: dim.left, width: dim.width, height: dim.height }} onClickCapture={swallow} onPointerDownCapture={swallow} onTouchStartCapture={swallow} />
        ) : (
          <div className={`${dimClass} inset-0`} onClickCapture={swallow} onPointerDownCapture={swallow} onTouchStartCapture={swallow} />
        )}

        {finalStep ? (
          /* ---- final conversion card — floats over the blurred demo window; rail stays visible ---- */
          <motion.div
            key={`outcome-${step}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute flex items-center justify-center p-3 sm:p-7"
            style={dim ? { top: dim.top, left: dim.left, width: dim.width, height: dim.height } : { inset: 0 }}
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
                Ready to reduce support tickets and boost AOV using CP Order Editing?
              </h2>

              {/* two CTAs side by side */}
              <div className="mt-5 flex w-full flex-col gap-2.5 sm:flex-row">
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
                  <span className="relative">Start 14-day free trial</span>
                  <svg className="relative" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17 17 7M9 7h8v8" /></svg>
                </a>
                <Link
                  href="/#contact"
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white py-2.5 text-[13px] font-semibold text-neutral-800 transition-colors hover:bg-neutral-50"
                >
                  Book a demo
                </Link>
              </div>

              {/* review button → wall of love */}
              <Link href="/reviews" className="group mt-3.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#155FFF] transition-colors hover:text-[#0d47cc]">
                Read our wall of love — 50+ five-star reviews
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-0.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>

              {/* static brand collage */}
              <div className="mt-6 w-full border-t border-neutral-200/80 pt-4">
                <p className="mb-3 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-neutral-400">Trusted by fast-growing brands</p>
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                  {FINAL_BRAND_LOGOS.map((src) => (
                    // eslint-disable-next-line @next/next/no-img-element -- brand logo from /public
                    <img key={src} src={src} alt="" className="h-5 w-auto max-w-[74px] object-contain opacity-55 brightness-0" />
                  ))}
                </div>
              </div>
            </div>
            </div>
           </motion.div>
          </motion.div>
        ) : rect ? (
          /* ---- in-between hop: highlight next card + small explore callout ---- */
          <>
            <motion.div
              className="pointer-events-none absolute rounded-2xl"
              style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }}
              animate={{ boxShadow: ["0 0 0 2px rgba(21,95,255,0.85), 0 0 20px 2px rgba(21,95,255,0.3)", "0 0 0 3px rgba(21,95,255,1), 0 0 34px 5px rgba(21,95,255,0.5)", "0 0 0 2px rgba(21,95,255,0.85), 0 0 20px 2px rgba(21,95,255,0.3)"] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              key={`callout-${step}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto absolute w-[220px] rounded-2xl bg-white p-4 shadow-2xl"
              style={{ top: calloutTop, left: calloutLeft }}
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">Up next</div>
              <button
                onClick={onAdvance}
                className="mt-1.5 flex w-full items-center justify-between gap-2 text-left text-[15px] font-extrabold tracking-tight text-neutral-900 transition-colors hover:text-[#155FFF]"
              >
                Explore {nextLabel ?? "the next feature"}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TOUR_ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </motion.div>
          </>
        ) : null}

        {/* Skip — for the in-between hop; the final card has its own close cross */}
        {!finalStep && (
          <button
            onClick={onClose}
            className="pointer-events-auto absolute right-5 top-5 rounded-full bg-neutral-900/80 px-4 py-2 text-[12px] font-medium text-white ring-1 ring-white/20 transition-colors hover:bg-neutral-900"
          >
            Exit tour
          </button>
        )}
      </div>,
      document.body
    );
  }

  if (!rect) return null;
  const PAD = 10;
  const GAP = 14;
  const sl = { top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 };
  const spaceBelow = window.innerHeight - (sl.top + sl.height);
  const spaceAbove = sl.top;
  // place below if it fits; else above if that fits; measured height keeps the
  // clamp from pulling the card up into the spotlight (which caused overlap).
  const fitsBelow = spaceBelow >= cardH + GAP;
  const fitsAbove = spaceAbove >= cardH + GAP;
  const tooltipBelow = fitsBelow || !fitsAbove;
  const rawTop = tooltipBelow ? sl.top + sl.height + GAP : sl.top - cardH - GAP;
  const clampedTop = Math.min(Math.max(rawTop, 8), Math.max(8, window.innerHeight - cardH - 8));
  const tooltipLeft = Math.min(Math.max(sl.left, 12), window.innerWidth - 296);

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
        style={{ top: clampedTop, left: tooltipLeft, transition: "top 0.15s ease-out" }}
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
        className="pointer-events-auto absolute right-5 top-5 rounded-full bg-white/10 px-4 py-2 text-[12px] font-medium text-white backdrop-blur-sm ring-1 ring-white/20 transition-colors hover:bg-white/20"
      >
        Exit tour
      </button>
    </div>,
    document.body
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

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
  cta,
  clickThrough = false,
  showDot = false,
  dotRect,
  hideCard = false,
  hideCta = false,
  outcome = false,
  outcomeHeadline,
  outcomeButton,
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
  // measure the tooltip's real height so positioning never overlaps the spotlight
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardH, setCardH] = useState(240);
  useEffect(() => {
    if (cardRef.current) setCardH(cardRef.current.offsetHeight);
  }, [step, title, desc]);

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
    const dimClass = "pointer-events-auto absolute bg-[rgba(15,23,42,0.14)] backdrop-blur-[3px]";

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
          /* ---- final centered conversion window ---- */
          <motion.div
            key={`outcome-${step}`}
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto absolute left-1/2 top-1/2 w-[min(93vw,420px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="h-[4px] w-full" style={{ background: `linear-gradient(90deg, ${TOUR_ACCENT}, #7c3aed)` }} />
            <div className="px-8 py-8 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-neutral-500">
                CP Order Editing &amp; Upsell
              </div>
              <h3 className="mt-4 font-serif text-[25px] font-bold leading-tight tracking-tight text-neutral-900">
                Ready to do this on your store?
              </h3>
              <p className="mx-auto mt-2 max-w-[20rem] text-[14px] font-medium leading-relaxed text-neutral-500">
                {outcomeHeadline ?? desc}
              </p>
              <a
                href={outcomeHref}
                target="_blank"
                rel="noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-bold text-white shadow-md transition-all hover:brightness-110 active:scale-[0.99]"
                style={{ background: TOUR_ACCENT, boxShadow: `0 8px 24px -6px ${TOUR_ACCENT}88` }}
              >
                {outcomeButton ?? "Get started"}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </a>
              <button onClick={onAdvance} className="mt-3 text-[13px] font-semibold text-neutral-500 transition-colors hover:text-neutral-800">
                Finish tour
              </button>
            </div>
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

        {/* Skip — always available */}
        <button
          onClick={onClose}
          className="pointer-events-auto absolute right-5 top-5 rounded-full bg-neutral-900/80 px-4 py-2 text-[12px] font-medium text-white ring-1 ring-white/20 transition-colors hover:bg-neutral-900"
        >
          Exit tour
        </button>
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
        className="pointer-events-auto absolute w-[280px] overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{ top: clampedTop, left: tooltipLeft }}
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

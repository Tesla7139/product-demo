"use client";

import { useEffect, useState } from "react";
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
  onAdvance: () => void;
  onClose: () => void;
}) {
  if (typeof window === "undefined") return null;

  // ---- Outcome overlay: blurred backdrop (next card stays crisp) + centered CTA ----
  if (outcome) {
    const OPAD = 8;
    const hole = rect
      ? { top: rect.top - OPAD, left: rect.left - OPAD, width: rect.width + OPAD * 2, height: rect.height + OPAD * 2 }
      : null;
    const strip = "pointer-events-auto absolute bg-[rgba(4,9,30,0.55)] backdrop-blur-md";
    return createPortal(
      <div className="pointer-events-none fixed inset-0 z-[500]">
        {hole ? (
          <>
            {/* four blurred strips around the highlighted card so it stays sharp */}
            <div className={strip} style={{ top: 0, left: 0, width: "100%", height: hole.top }} />
            <div className={strip} style={{ top: hole.top + hole.height, left: 0, width: "100%", bottom: 0 }} />
            <div className={strip} style={{ top: hole.top, left: 0, width: hole.left, height: hole.height }} />
            <div className={strip} style={{ top: hole.top, left: hole.left + hole.width, right: 0, height: hole.height }} />
            {/* glowing ring around the highlighted (crisp) card */}
            <motion.div
              className="pointer-events-none absolute rounded-2xl"
              style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }}
              animate={{ boxShadow: ["0 0 0 2px rgba(21,95,255,0.9), 0 0 24px 2px rgba(21,95,255,0.35)", "0 0 0 3px rgba(21,95,255,1), 0 0 40px 6px rgba(21,95,255,0.55)", "0 0 0 2px rgba(21,95,255,0.9), 0 0 24px 2px rgba(21,95,255,0.35)"] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        ) : (
          <div className="pointer-events-auto absolute inset-0 bg-[rgba(4,9,30,0.6)] backdrop-blur-md" />
        )}

        {/* centered conversion card */}
        <motion.div
          key={`outcome-${step}`}
          initial={{ opacity: 0, scale: 0.94, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto absolute left-1/2 top-1/2 w-[min(92vw,380px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          <div className="h-[4px] w-full" style={{ background: `linear-gradient(90deg, ${TOUR_ACCENT}, #7c3aed)` }} />
          <div className="px-7 py-7 text-center">
            <span
              className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl"
              style={{ background: `${TOUR_ACCENT}14`, color: TOUR_ACCENT }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
              </svg>
            </span>
            <div className="font-serif text-[22px] font-bold leading-tight tracking-tight text-neutral-900">
              {outcomeHeadline ?? title}
            </div>
            <p className="mx-auto mt-2 max-w-[19rem] text-[13.5px] font-medium leading-relaxed text-neutral-500">{desc}</p>
            <a
              href={outcomeHref}
              target="_blank"
              rel="noreferrer"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-bold text-white shadow-md transition-all hover:brightness-110 active:scale-[0.99]"
              style={{ background: TOUR_ACCENT, boxShadow: `0 8px 24px -6px ${TOUR_ACCENT}88` }}
            >
              {outcomeButton ?? "Get started"}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </a>
            <button
              onClick={onAdvance}
              className="mt-3 flex w-full items-center justify-center gap-1.5 text-[13px] font-semibold text-neutral-500 transition-colors hover:text-neutral-800"
            >
              {finalStep ? "Finish tour" : nextLabel ? `Continue — up next: ${nextLabel}` : "Continue tour"}
              {!finalStep && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </motion.div>

        {/* Skip — always available */}
        <button
          onClick={onClose}
          className="pointer-events-auto absolute right-5 top-5 rounded-full bg-white/10 px-4 py-2 text-[12px] font-medium text-white backdrop-blur-sm ring-1 ring-white/20 transition-colors hover:bg-white/20"
        >
          Skip tour
        </button>
      </div>,
      document.body
    );
  }

  if (!rect) return null;
  const PAD = 10;
  const TOOLTIP_H = 300; // generous estimate so we never clip the button
  const sl = { top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 };
  const spaceBelow = window.innerHeight - (sl.top + sl.height);
  const spaceAbove = sl.top;
  // prefer below unless it would clip; fall back to above; last resort: clamp
  const tooltipBelow = spaceBelow >= TOOLTIP_H + 14 || spaceBelow >= spaceAbove;
  const rawTop = tooltipBelow ? sl.top + sl.height + 14 : sl.top - TOOLTIP_H - 14;
  const clampedTop = Math.min(Math.max(rawTop, 8), window.innerHeight - TOOLTIP_H - 8);
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
        Skip tour
      </button>
    </div>,
    document.body
  );
}

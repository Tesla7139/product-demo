"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Marquee } from "@/components/primitives/Marquee";
import { reviews } from "@/lib/reviews";

// Brands featured in this second strip — deliberately different from the logo
// row above. Each label is matched to its real review in reviews.ts.
const FEATURED: { match: string; label: string }[] = [
  { match: "Mars By GHC", label: "Mars by GHC" },
  { match: "Westside", label: "Westside" },
  { match: "MyBorosil", label: "MyBorosil" },
  { match: "Wellbeing Nutrition", label: "Wellbeing Nutrition" },
  { match: "Amrutam", label: "Amrutam" },
  { match: "Bacca Bucci", label: "Bacca Bucci" },
  { match: "HoneyVeda", label: "HoneyVeda" },
  { match: "GHAR SOAPS", label: "Ghar Soaps" },
  { match: "World of Asaya", label: "World of Asaya" },
  { match: "Gladful", label: "Gladful" },
  { match: "Paradyes", label: "Paradyes" },
  { match: "MIRAGGIO", label: "Miraggio" },
  { match: "Starquik", label: "Starquik" },
  { match: "VanillaPura", label: "VanillaPura" },
];

type Brand = { label: string; review: string | null };
const BRANDS: Brand[] = FEATURED.map(({ match, label }) => ({
  label,
  review: reviews.find((r) => r.name === match)?.content ?? null,
}));

type Popover = { brand: Brand; x: number; y: number };

/** A second social-proof strip: brand wordmarks scrolling in reverse, each
 *  revealing its review on hover. Sourced from the Shopify review export. */
export function ReviewNamesMarquee({ embedded = false }: { embedded?: boolean }) {
  const [popover, setPopover] = useState<Popover | null>(null);
  const dwellTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const hovered = useRef<{ brand: Brand; el: HTMLElement } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPopover(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const clearDwell = () => { if (dwellTimer.current) { window.clearTimeout(dwellTimer.current); dwellTimer.current = null; } };
  const clearClose = () => { if (closeTimer.current) { window.clearTimeout(closeTimer.current); closeTimer.current = null; } };
  const scheduleClose = () => { clearClose(); closeTimer.current = window.setTimeout(() => setPopover(null), 160); };
  const openPopover = (brand: Brand, el: HTMLElement) => {
    clearClose();
    const r = el.getBoundingClientRect();
    setPopover({ brand, x: r.left + r.width / 2, y: r.top });
  };

  const onStripEnter = () => {
    clearClose();
    if (dwellTimer.current) return;
    dwellTimer.current = window.setTimeout(() => {
      dwellTimer.current = null;
      if (hovered.current) openPopover(hovered.current.brand, hovered.current.el);
    }, 1000);
  };
  const onStripLeave = () => { clearDwell(); scheduleClose(); };

  const items = BRANDS.map((brand) => (
    <button
      key={brand.label}
      onMouseEnter={(e) => {
        hovered.current = { brand, el: e.currentTarget };
        if (popover) openPopover(brand, e.currentTarget);
      }}
      onClick={(e) => {
        clearDwell();
        hovered.current = { brand, el: e.currentTarget };
        openPopover(brand, e.currentTarget);
      }}
      className="group flex flex-col items-center"
    >
      <span className="flex h-16 items-center justify-center px-2 text-[22px] font-extrabold tracking-tight text-foreground/85 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-foreground">
        {brand.label}
      </span>
      <span className="mt-1.5 text-[13px] font-normal text-muted-foreground/80 transition-colors group-hover:text-foreground">
        Read review
      </span>
    </button>
  ));

  const Wrapper = embedded ? "div" : "section";

  return (
    <Wrapper
      aria-label="More brands using Clickpost"
      className={embedded ? "w-full pt-2 pb-2" : "pb-12"}
    >
      <div onMouseEnter={onStripEnter} onMouseLeave={onStripLeave}>
        <Marquee items={items} duration={44} reverse paused={!!popover} />
      </div>

      <AnimatePresence>
        {popover && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none fixed z-[91]"
            style={{ left: popover.x, top: popover.y }}
            role="dialog"
          >
            <div className="-mt-4 w-[21rem] max-w-[88vw] -translate-x-1/2 -translate-y-full rounded-2xl border border-border bg-white p-6 text-left shadow-soft-xl">
              <div className="border-l-2 border-border pl-4">
                {popover.brand.review ? (
                  <p className="text-[15px] italic leading-relaxed text-foreground">“{popover.brand.review}”</p>
                ) : (
                  <p className="text-[15px] italic leading-relaxed text-muted-foreground">Verified Clickpost customer — review coming soon.</p>
                )}
              </div>
              <div className="mt-4 font-bold text-foreground">{popover.brand.label}</div>
              <div className="absolute left-1/2 top-full size-0 -translate-x-1/2 border-x-8 border-t-8 border-x-transparent border-t-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Wrapper>
  );
}

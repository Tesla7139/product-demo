"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Marquee } from "@/components/primitives/Marquee";
import { customerLogos, type CustomerLogo } from "@/lib/site";

type Popover = { logo: CustomerLogo; x: number; y: number };

export function CustomerLogos({ embedded = false }: { embedded?: boolean }) {
  const [popover, setPopover] = useState<Popover | null>(null);
  const dwellTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const hovered = useRef<{ logo: CustomerLogo; el: HTMLElement } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPopover(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const clearDwell = () => {
    if (dwellTimer.current) {
      window.clearTimeout(dwellTimer.current);
      dwellTimer.current = null;
    }
  };
  const clearClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    clearClose();
    closeTimer.current = window.setTimeout(() => setPopover(null), 160);
  };
  const openPopover = (logo: CustomerLogo, el: HTMLElement) => {
    clearClose();
    const r = el.getBoundingClientRect();
    setPopover({ logo, x: r.left + r.width / 2, y: r.top });
  };

  // mouse enters the strip → keep moving, then pause + reveal after ~1s dwell
  const onStripEnter = () => {
    clearClose();
    if (dwellTimer.current) return;
    dwellTimer.current = window.setTimeout(() => {
      dwellTimer.current = null;
      if (hovered.current) openPopover(hovered.current.logo, hovered.current.el);
    }, 1000);
  };
  const onStripLeave = () => {
    clearDwell();
    scheduleClose();
  };

  const items = customerLogos.map((logo) => (
    <button
      key={logo.src ?? logo.name}
      onMouseEnter={(e) => {
        hovered.current = { logo, el: e.currentTarget };
        // if already paused/open, switch instantly to this brand
        if (popover) openPopover(logo, e.currentTarget);
      }}
      onClick={(e) => {
        clearDwell();
        hovered.current = { logo, el: e.currentTarget };
        openPopover(logo, e.currentTarget);
      }}
      className="group flex flex-col items-center"
    >
      <span className="flex h-16 w-44 items-center justify-center transition-transform duration-300 group-hover:-translate-y-0.5">
        {logo.src ? (
          // eslint-disable-next-line @next/next/no-img-element -- local customer logo assets
          <img
            src={logo.src}
            alt={logo.name}
            className={`object-contain brightness-0 ${logo.big ? "max-h-16 max-w-[210px]" : "max-h-12 max-w-[150px]"}`}
          />
        ) : (
          <span className="max-w-[170px] text-center text-[15px] font-extrabold uppercase leading-tight tracking-tight text-foreground">
            {logo.name}
          </span>
        )}
      </span>
      <span className="mt-1.5 text-[13px] font-normal text-muted-foreground/80 transition-colors group-hover:text-foreground">
        Read review
      </span>
      {logo.badge && (
        <span className="mt-2 rounded-full bg-primary/10 px-3 py-0.5 text-[11px] font-semibold text-primary">
          {logo.badge}
        </span>
      )}
    </button>
  ));

  const Wrapper = embedded ? "div" : "section";

  return (
    <Wrapper
      aria-label="Brands working with us"
      className={embedded ? "w-full border-t border-border/60 pt-10 pb-2" : "py-12"}
    >
      <div onMouseEnter={onStripEnter} onMouseLeave={onStripLeave}>
        <Marquee items={items} duration={40} paused={!!popover} />
      </div>

      {/* Review popover (anchored to the active logo; switches as you move) */}
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
                {popover.logo.review ? (
                  <p className="text-[15px] italic leading-relaxed text-foreground">
                    “{popover.logo.review}”
                  </p>
                ) : (
                  <p className="text-[15px] italic leading-relaxed text-muted-foreground">
                    Verified Clickpost customer — review coming soon.
                  </p>
                )}
              </div>
              <div className="mt-4">
                <div className="font-bold text-foreground">{popover.logo.reviewer}</div>
                <div className="text-sm text-muted-foreground">{popover.logo.role}</div>
              </div>
              <div className="absolute left-1/2 top-full size-0 -translate-x-1/2 border-x-8 border-t-8 border-x-transparent border-t-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Wrapper>
  );
}

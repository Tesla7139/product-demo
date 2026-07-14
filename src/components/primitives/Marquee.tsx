"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Infinite horizontal marquee. Renders arbitrary nodes (logos, chips, etc.) twice
 * and scrolls the track left, wrapping seamlessly. Driven by requestAnimationFrame
 * (not a CSS keyframe) so the speed can ease smoothly — hovering can either fully
 * pause (default) or slow to a fraction of full speed via `hoverSlow`.
 */
export function Marquee({
  items,
  duration = 32,
  className,
  paused = false,
  reverse = false,
  hoverSlow,
}: {
  items: React.ReactNode[];
  /** seconds for one full loop at full speed */
  duration?: number;
  className?: string;
  /** hard-stop the scroll */
  paused?: boolean;
  reverse?: boolean;
  /** 0..1 — on hover, ease to this fraction of full speed instead of stopping. */
  hoverSlow?: number;
}) {
  // Repeat the items enough to overflow wide viewports, then duplicate that
  // group so wrapping by one half-width loops seamlessly with no visible gap.
  const reps = Math.max(2, Math.ceil(16 / Math.max(items.length, 1)));
  const half = Array.from({ length: reps }, () => items).flat();
  const track = [...half, ...half];

  const trackRef = useRef<HTMLDivElement>(null);
  const offset = useRef(0); // px scrolled, kept in [0, halfWidth)
  const speed = useRef(0); // px/s, eased toward target each frame
  const [hover, setHover] = useState(false);

  // live config the rAF loop reads without needing to restart
  const cfg = useRef({ duration, paused, reverse, hoverSlow, hover });
  cfg.current = { duration, paused, reverse, hoverSlow, hover };

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const step = (t: number) => {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0; // clamp tab-away gaps
      last = t;
      const el = trackRef.current;
      if (el) {
        const halfW = el.scrollWidth / 2 || 1;
        const c = cfg.current;
        const base = halfW / Math.max(1, c.duration); // full-speed px/s
        let target = base;
        if (c.paused) target = 0;
        else if (c.hover) target = c.hoverSlow != null ? base * c.hoverSlow : 0;
        // ease current speed toward the target for a smooth slow-down / speed-up
        speed.current += (target - speed.current) * Math.min(1, dt * 6);
        let o = offset.current + speed.current * dt * (c.reverse ? -1 : 1);
        o = ((o % halfW) + halfW) % halfW; // wrap both directions
        offset.current = o;
        el.style.transform = `translateX(${-o}px)`;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={cn("marquee-group relative w-full overflow-hidden", className)}
      style={
        {
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        } as React.CSSProperties
      }
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        ref={trackRef}
        className="flex w-max shrink-0 items-center gap-8 pr-8"
        style={{ willChange: "transform" }}
      >
        {track.map((item, i) => (
          <div key={i} aria-hidden={i >= half.length} className="shrink-0">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

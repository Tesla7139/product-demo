"use client";

import { cn } from "@/lib/utils";

/**
 * Infinite horizontal marquee. Renders arbitrary nodes (logos, chips, etc.)
 * twice and translates -50% for a seamless loop. Pauses on hover.
 * (See .marquee-group / .animate-marquee in globals.css.)
 */
export function Marquee({
  items,
  duration = 32,
  className,
  paused = false,
}: {
  items: React.ReactNode[];
  duration?: number;
  className?: string;
  paused?: boolean;
}) {
  // Repeat the items enough to overflow wide viewports, then duplicate that
  // group so translateX(-50%) loops seamlessly with no visible end/gap.
  const reps = Math.max(2, Math.ceil(16 / Math.max(items.length, 1)));
  const half = Array.from({ length: reps }, () => items).flat();
  const track = [...half, ...half];

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
    >
      <div
        className="animate-marquee flex w-max shrink-0 items-center gap-8 pr-8"
        style={
          {
            "--marquee-duration": `${duration}s`,
            animationPlayState: paused ? "paused" : undefined,
          } as React.CSSProperties
        }
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

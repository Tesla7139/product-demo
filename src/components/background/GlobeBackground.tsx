"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const GlobeScene = dynamic(() => import("./GlobeScene"), { ssr: false });

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch {
    return false;
  }
}

/**
 * Signature scroll-driven globe (BUILD_SPEC §4.4). Decorative only.
 * Falls back to a static CSS glow on reduced-motion / small screens / no-WebGL.
 */
export function GlobeBackground() {
  const [enabled, setEnabled] = useState(false);
  const scrollRef = useRef(0);
  const firstPageScrollRef = useRef(0);

  useEffect(() => {
    const ok =
      !prefersReducedMotion() &&
      window.innerWidth >= 768 &&
      supportsWebGL();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time capability check on mount
    setEnabled(ok);

    const onScroll = () => {
      const scrollY = window.scrollY;
      const height = window.innerHeight;
      const max = document.documentElement.scrollHeight - height;
      
      scrollRef.current = max > 0 ? Math.min(1, scrollY / max) : 0;
      firstPageScrollRef.current = height > 0 ? Math.min(1, scrollY / height) : 0;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* ambient brand glow (also the fallback when WebGL is off) — lower-right */}
      <div
        className="absolute left-[74%] top-[82%] h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--primary) 22%, transparent) 0%, transparent 65%)",
        }}
      />
      {enabled && (
        // pushed down + right so the globe sits behind the hero visual (redo-style)
        <div className="absolute inset-0 translate-x-[10%] translate-y-[14%]">
          <GlobeScene scrollRef={scrollRef} firstPageScrollRef={firstPageScrollRef} />
        </div>
      )}
    </div>
  );
}

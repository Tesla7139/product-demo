"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const ok =
      !prefersReducedMotion() &&
      window.innerWidth >= 768 &&
      supportsWebGL();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time capability check on mount
    setEnabled(ok);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* ambient brand glow (also the fallback when WebGL is off) — bottom center */}
      <div
        className="absolute left-1/2 top-[88%] h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--primary) 22%, transparent) 0%, transparent 65%)",
        }}
      />
      {enabled && (
        // centered; the globe rises from the middle-bottom of the hero
        <div className="absolute inset-0 translate-y-[6%]">
          <GlobeScene />
        </div>
      )}
    </div>
  );
}

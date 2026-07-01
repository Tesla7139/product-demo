"use client";

import { useCallback, useState } from "react";
import { mockStore, type DemoProduct, type DemoStore } from "@/lib/site";

type Status = "idle" | "loading" | "ready";

type BrandingResponse = {
  brandName: string | null;
  brandColor: string | null;
  logo: string | null;
  currency: string | null;
  products: DemoProduct[];
};

/**
 * Data seam for the live demo (BUILD_SPEC §4.5).
 * Personalized mode: POST /api/demo { url } to fetch the store's real branding
 * (name + color + logo), then render it on the sample order/edit/upsell mock.
 * Any failure falls back to a derived/sample brand so it never breaks.
 */
export function useDemoData() {
  const [status, setStatus] = useState<Status>("idle");
  const [store, setStore] = useState<DemoStore | null>(null);
  const [submittedUrl, setSubmittedUrl] = useState("");

  const generate = useCallback(async (url: string) => {
    setSubmittedUrl(url);
    setStatus("loading");

    const started = Date.now();
    let branding: BrandingResponse | null = null;
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (res.ok) branding = (await res.json()) as BrandingResponse;
    } catch {
      branding = null;
    }

    // keep the reveal feeling crafted (min ~4s even if the fetch is instant) so the
    // "Building <brand>" loading screen + scrolling tickets are clearly seen first
    const elapsed = Date.now() - started;
    if (elapsed < 4000) await new Promise((r) => setTimeout(r, 4000 - elapsed));

    setStore({
      ...mockStore,
      brandName: branding?.brandName || deriveBrandName(url) || mockStore.brandName,
      brandColor: branding?.brandColor || mockStore.brandColor,
      logo: branding?.logo || null,
      currency: branding?.currency || "USD",
      products:
        branding?.products && branding.products.length > 0
          ? branding.products
          : mockStore.products,
    });
    setStatus("ready");
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setStore(null);
    setSubmittedUrl("");
  }, []);

  return { status, store, submittedUrl, generate, reset };
}

function deriveBrandName(url: string): string | null {
  try {
    const clean = url.replace(/^https?:\/\//, "").replace(/^www\./, "");
    const host = clean.split("/")[0];
    const base = host.split(".")[0];
    if (!base) return null;
    return base.charAt(0).toUpperCase() + base.slice(1);
  } catch {
    return null;
  }
}

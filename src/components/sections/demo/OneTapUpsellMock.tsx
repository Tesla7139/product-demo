"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import type { DemoStore } from "@/lib/site";

const money = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

export function OneTapUpsellMock({ store, onComplete, accentColor }: { store: DemoStore; onComplete?: (wasAdded: boolean) => void; accentColor?: string }) {
  const brand = accentColor ?? "#155FFF";
  const currency = store.currency || "USD";
  const fmt = (n: number) => money(n, currency);
  const offer = store.products[1] ?? store.products[0];
  const full = offer?.price ?? 12;
  const deal = Math.round(full * 0.5 * 100) / 100;

  const [secs, setSecs] = useState(9 * 60 + 54);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const timer = `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, "0")}`;

  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => onComplete?.(true), 1600);
  };

  const handleSkip = () => onComplete?.(false);

  const slug = (store.brandName || "yourstore").toLowerCase().replace(/\s+/g, "-");
  const url = `${slug}.myshopify.com/checkouts/post-purchase`;

  return (
    <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-white shadow-soft-xl">
      {/* browser chrome */}
      <div className="flex items-center gap-3 border-b border-border bg-neutral-50 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-1.5 rounded-md bg-white px-3 py-1 text-[11px] text-neutral-500 ring-1 ring-neutral-200">
            <span className="size-2.5 rounded-full bg-green-500/80" />
            {url}
          </div>
        </div>
      </div>

      {/* page body */}
      <div className="max-h-[520px] overflow-y-auto no-scrollbar">
        {/* store header */}
        <div className="border-b border-border px-8 py-5">
          <div className="text-[13px] font-semibold text-neutral-800">{slug}</div>
          <div className="mt-1 flex items-start gap-2.5">
            <span
              className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2"
              style={{ borderColor: brand, color: brand }}
            >
              <Check className="size-3" strokeWidth={3} />
            </span>
            <div>
              <div className="text-[12px] text-neutral-500">Confirmation #0WP59XCW8</div>
              <div className="text-[15px] font-bold text-neutral-900">You&apos;ve paid for your order.</div>
              <button className="mt-0.5 text-[12px]" style={{ color: brand }}>
                View order confirmation &rsaquo;
              </button>
            </div>
          </div>
        </div>

        {/* before-you-go header */}
        <div className="border-b border-border px-8 py-5 text-center">
          <div className="text-[18px] font-bold text-neutral-900">Tucker, before you go!</div>
          <div className="mt-2 text-[13px] text-neutral-600">
            Your order is confirmed but you can still add the following for a limited time{" "}
            <span className="font-bold tabular-nums text-red-500">{timer}</span>
          </div>
        </div>

        {/* offer */}
        {added ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center px-8 py-16 text-center"
          >
            <span
              className="mb-4 flex size-14 items-center justify-center rounded-full border-4"
              style={{ borderColor: brand, color: brand }}
            >
              <Check className="size-7" strokeWidth={2.5} />
            </span>
            <div className="text-[18px] font-bold text-neutral-900">Added to your order!</div>
            <p className="mt-2 text-[13px] text-neutral-500">
              {offer?.title} has been added. No re-checkout needed.
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2">
            {/* product image */}
            <div className="flex items-center justify-center bg-neutral-50 p-8">
              {offer?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="max-h-[280px] w-full object-contain"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <div className="flex h-[240px] w-full items-center justify-center rounded-xl bg-neutral-200">
                  <span className="text-4xl">📦</span>
                </div>
              )}
            </div>

            {/* offer details */}
            <div className="flex flex-col justify-between p-8">
              <div>
                <div className="text-[12px] text-neutral-400">Offer 1 of 1</div>
                <h3 className="mt-1 text-[22px] font-bold leading-tight text-neutral-900">
                  {offer?.title ?? "Add-on product"}
                </h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-[16px] text-neutral-400 line-through">{fmt(full)}</span>
                  <span className="text-[22px] font-bold text-red-500">{fmt(deal)}</span>
                </div>
                <p className="mt-1 text-[12px] text-neutral-500">
                  Don&apos;t miss out on this offer... it expires after you leave this page!
                </p>

                {/* mock variant selector */}
                <div className="mt-4 flex items-center justify-between rounded-lg border border-neutral-300 px-4 py-2.5 text-[13px] text-neutral-700">
                  <div>
                    <div className="text-[10px] text-neutral-400">Size</div>
                    <div className="font-medium">{offer?.variant ?? "Default"} — {fmt(deal)}</div>
                  </div>
                  <ChevronDown className="size-4 text-neutral-400" />
                </div>

                <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-[13px]">
                  <div className="flex justify-between text-neutral-600">
                    <span>Shipping</span>
                    <span className="font-semibold text-neutral-900">Free</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Taxes</span>
                    <span className="font-semibold text-neutral-900">Free</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={handleAdd}
                  className="w-full rounded-lg py-3.5 text-[14px] font-semibold text-white shadow-md transition-all hover:brightness-110 active:scale-[0.99]"
                  style={{ background: brand }}
                >
                  Add to order · {fmt(deal)} USD
                </button>
                <button
                  onClick={handleSkip}
                  className="w-full rounded-lg py-2.5 text-[13px] font-semibold transition-colors hover:bg-neutral-50"
                  style={{ color: brand }}
                >
                  Skip Offer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

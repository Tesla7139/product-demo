"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import type { DemoStore } from "@/lib/site";
import { readableBrand } from "@/lib/utils";
import { DemoImg } from "./DemoImg";

const money = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

function Pic({ src }: { src?: string | null }) {
  return <DemoImg src={src} className="size-10 shrink-0 rounded-lg border border-border object-cover" />;
}

export function OneTapUpsellMock({ store, onComplete, onViewOrder, accentColor, addBtnRef, offerRef, onAdded }: { store: DemoStore; onComplete?: (wasAdded: boolean) => void; onViewOrder?: () => void; accentColor?: string; addBtnRef?: React.RefObject<HTMLButtonElement | null>; offerRef?: React.RefObject<HTMLDivElement | null>; onAdded?: () => void }) {
  const brand = readableBrand(store.brandColor || accentColor);
  const currency = store.currency || "USD";
  const fmt = (n: number) => money(n, currency);
  const priced = store.products.filter((p) => (p.price ?? 0) > 0);
  const pool = priced.length ? priced : store.products;
  const purchased = pool[0];
  const offer = pool[1] ?? pool[0];

  // variant picker
  const variantList = offer?.variants && offer.variants.length > 0
    ? offer.variants
    : offer?.variant ? [{ title: offer.variant, price: offer?.price ?? 0 }] : [];
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showSizes, setShowSizes] = useState(false);
  const selectedVariant = variantList[selectedIdx] ?? variantList[0];
  const full = selectedVariant?.price ?? offer?.price ?? 0;
  const deal = Math.round(full * 0.5);

  const [secs, setSecs] = useState(9 * 60 + 54);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const timer = `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, "0")}`;

  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    setAdded(true);
    onAdded?.();
    setTimeout(() => onComplete?.(true), 1600);
  };

  const handleSkip = () => onComplete?.(false);

  return (
    <div className="mx-auto w-full bg-white">
      {/* page body */}
      <div className="lg:h-[560px] lg:overflow-y-auto lg:no-scrollbar">
        {/* confirmation header — matches order editing */}
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-full border-2"
              style={{ borderColor: brand, color: brand }}
            >
              <Check className="size-4" strokeWidth={3} />
            </span>
            <div>
              <div className="text-xs text-neutral-500">Confirmation #0WP59XCW8</div>
              <div className="text-lg font-bold text-neutral-900">Thank you, Tucker!</div>
            </div>
          </div>
          <button onClick={onViewOrder} className="mt-2 text-[12px] font-medium" style={{ color: brand }}>
            View order confirmation &rsaquo;
          </button>
        </div>

        {/* before-you-go header */}
        <div className="border-b border-border px-6 py-2.5 text-center">
          <div className="text-[16px] font-bold text-neutral-900">Tucker, before you go!</div>
          <div className="mt-1 text-[12.5px] text-neutral-600">
            Your order is confirmed but you can still add the following for a limited time{" "}
            <span className="font-bold tabular-nums text-red-500">{timer}</span>
          </div>
        </div>

        {/* offer */}
        {added ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-8 py-8"
          >
            <div className="flex flex-col items-center text-center">
              <span
                className="mb-3 flex size-14 items-center justify-center rounded-full border-4"
                style={{ borderColor: brand, color: brand }}
              >
                <Check className="size-7" strokeWidth={2.5} />
              </span>
              <div className="text-[18px] font-bold text-neutral-900">Added to your order!</div>
              <p className="mt-1.5 text-[13px] text-neutral-500">
                No re-checkout, charged to the card already on file.
              </p>
            </div>

            {/* order summary with the added item */}
            <div className="mx-auto mt-6 max-w-md rounded-xl border border-border p-4">
              <div className="text-[11px] font-bold uppercase tracking-wide text-neutral-400">Your order</div>
              {purchased && (
                <div className="mt-3 flex items-center gap-3">
                  <Pic src={purchased.image} />
                  <div className="min-w-0 flex-1 truncate text-[13px] font-medium text-neutral-800">{purchased.title}</div>
                  <div className="text-[13px] font-semibold text-neutral-900">{fmt(purchased.price)}</div>
                </div>
              )}
              <div className="mt-2 flex items-center gap-3">
                <Pic src={offer?.image} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-neutral-800">{offer?.title}</div>
                  <div className="text-[11px] font-semibold" style={{ color: brand }}>Just added · post-purchase</div>
                </div>
                <div className="text-right text-[13px]">
                  <span className="block text-neutral-400 line-through">{fmt(full)}</span>
                  <span className="font-semibold text-neutral-900">{fmt(deal)}</span>
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
                <span className="text-[14px] font-bold text-neutral-900">Total</span>
                <span className="text-[16px] font-bold text-neutral-900">{fmt((purchased?.price ?? 0) + deal)}</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div ref={offerRef} className="grid grid-cols-1 md:grid-cols-2">
            {/* product image */}
            <div className="flex items-center justify-center bg-neutral-50 p-3">
              <DemoImg src={offer?.image} alt={offer?.title ?? ""} className="h-[150px] w-full object-contain" />
            </div>

            {/* offer details */}
            <div className="flex flex-col justify-between px-5 py-4">
              <div>
                <div className="text-[12px] text-neutral-400">Offer 1 of 1</div>
                <h3 className="mt-1 text-[20px] font-bold leading-tight text-neutral-900">
                  {offer?.title ?? "Add-on product"}
                </h3>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-[15px] text-neutral-400 line-through">{fmt(full)}</span>
                  <span className="text-[20px] font-bold text-red-500">{fmt(deal)}</span>
                </div>
                <p className="mt-1 text-[12px] text-neutral-500">
                  Don&apos;t miss out on this offer... it expires after you leave this page!
                </p>

                {/* interactive variant selector */}
                {variantList.length > 0 && (
                  <div className="relative mt-3">
                    <button
                      onClick={() => setShowSizes((v) => !v)}
                      className="flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-[13px] text-neutral-700 transition-colors"
                      style={{ borderColor: showSizes ? brand : "#d1d5db" }}
                    >
                      <div className="text-left">
                        <div className="text-[10px] text-neutral-400">Size</div>
                        <div className="font-medium">{selectedVariant?.title} — {fmt(selectedVariant?.price ?? deal)}</div>
                      </div>
                      <ChevronDown className={`size-4 text-neutral-400 transition-transform ${showSizes ? "rotate-180" : ""}`} />
                    </button>
                    {showSizes && (
                      <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg">
                        {variantList.map((v, i) => (
                          <button
                            key={i}
                            onClick={() => { setSelectedIdx(i); setShowSizes(false); }}
                            className={`flex w-full items-center justify-between px-4 py-2.5 text-[13px] transition-colors hover:bg-neutral-50 ${i === selectedIdx ? "font-semibold" : "text-neutral-600"}`}
                            style={i === selectedIdx ? { color: brand } : undefined}
                          >
                            <span>{v.title}</span>
                            <span>{fmt(v.price)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-3 space-y-1 border-t border-border pt-3 text-[13px]">
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

              <div className="mt-3 space-y-1.5">
                <button
                  ref={addBtnRef}
                  onClick={handleAdd}
                  className="w-full rounded-lg py-3 text-[14px] font-semibold text-white shadow-md transition-all hover:brightness-125 active:scale-[0.99]"
                  style={{ background: "#111827" }}
                >
                  Add to order · {fmt(deal)}
                </button>
                <button
                  onClick={handleSkip}
                  className="w-full rounded-lg py-2 text-[13px] font-semibold transition-colors hover:bg-neutral-50"
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

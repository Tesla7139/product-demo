"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown, Clock, RefreshCw, Star, Truck } from "lucide-react";
import type { DemoStore, DemoProduct } from "@/lib/site";
import { readableBrand, dedupeExactTitle, dedupeByTitle } from "@/lib/utils";
import { DemoImg } from "./DemoImg";

const money = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

export function OneTapUpsellMock({ store, onComplete, onViewOrder, accentColor, addBtnRef, offerRef, onAdded }: { store: DemoStore; onComplete?: (added: DemoProduct[]) => void; onViewOrder?: () => void; accentColor?: string; addBtnRef?: React.RefObject<HTMLButtonElement | null>; offerRef?: React.RefObject<HTMLDivElement | null>; onAdded?: () => void }) {
  const brand = readableBrand(store.brandColor || accentColor);
  const currency = store.currency || "USD";
  const fmt = (n: number) => money(n, currency);
  const priced = store.products.filter((p) => (p.price ?? 0) > 0);
  // keep colour variants so there's enough variety for 3 distinct offers
  const pool = dedupeExactTitle(priced.length ? priced : store.products);
  // Offer 1 is a subscription on the first item the shopper just bought — the same
  // pick DemoMock uses for the first line of the order, so the two always agree.
  const subProduct = dedupeByTitle(priced.length ? priced : store.products)[0];
  // Then up to 2 one-time offers. Skip the first 2 products (those show as the
  // "purchased" order on the status page) so an added offer never duplicates a cart item.
  const afterCart = pool.slice(2);
  const offers = (afterCart.length ? afterCart : pool.slice(1).length ? pool.slice(1) : pool).slice(0, 2);

  const [offerIdx, setOfferIdx] = useState(0);
  const hasSub = !!subProduct;
  const total = offers.length + (hasSub ? 1 : 0);
  const isLast = offerIdx >= total - 1;
  const isSub = hasSub && offerIdx === 0;
  const offer = offers[offerIdx - (hasSub ? 1 : 0)] ?? offers[0];

  // variant picker (per offer)
  const variantList =
    offer?.variants && offer.variants.length > 0
      ? offer.variants
      : offer?.variant
      ? [{ title: offer.variant, price: offer?.price ?? 0 }]
      : [];
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

  const [justAdded, setJustAdded] = useState(false);
  const addedRef = useRef<DemoProduct[]>([]); // offers the shopper accepted (charged to the order)

  const goNext = () => {
    setJustAdded(false);
    setSelectedIdx(0);
    setShowSizes(false);
    setOfferIdx((i) => i + 1);
  };
  const handleAdd = () => {
    onAdded?.();
    // a subscription bills from its first delivery, so nothing is added to today's order
    if (offer && !isSub) {
      addedRef.current = [
        ...addedRef.current,
        { ...offer, price: deal, qty: 1, variant: selectedVariant?.title ?? offer.variant ?? "" },
      ];
    }
    setJustAdded(true);
    setTimeout(() => {
      if (!isLast) goNext();
      else onComplete?.(addedRef.current);
    }, 950);
  };
  const handleDecline = () => {
    if (!isLast) goNext();
    else onComplete?.(addedRef.current);
  };
  const declineLabel = "Skip Offer";

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
          <button onClick={onViewOrder} className="mt-2 text-[12px] font-medium text-neutral-900">
            View order confirmation &rsaquo;
          </button>
        </div>

        {/* before-you-go header */}
        {isSub ? (
          <div className="border-b border-border px-6 py-2.5 text-center">
            <div className="text-[16px] font-bold text-neutral-900">Tucker, one thing before you go</div>
            <div className="mt-1 flex items-center justify-center gap-1.5 text-[12.5px] text-neutral-600">
              <Clock className="size-3.5" />
              Held for you on this page · <span className="font-bold tabular-nums text-neutral-900">{timer}</span>
            </div>
          </div>
        ) : (
          <div className="border-b border-border px-6 py-2.5 text-center">
            <div className="text-[16px] font-bold text-neutral-900">Tucker, before you go!</div>
            <div className="mt-1 text-[12.5px] text-neutral-600">
              Your order is confirmed but you can still add the following for a limited time{" "}
              <span className="font-bold tabular-nums text-red-500">{timer}</span>
            </div>
          </div>
        )}

        {isSub && subProduct ? (
          <motion.div
            key="sub"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            ref={offerRef}
          >
            <SubscriptionOffer
              product={subProduct}
              currency={currency}
              total={total}
              addBtnRef={addBtnRef}
              started={justAdded}
              onStart={handleAdd}
              onSkip={handleDecline}
            />
          </motion.div>
        ) : (
        // one-time offers (cycle after the subscription)
        <motion.div
          key={offerIdx}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          ref={offerRef}
          className="grid grid-cols-1 md:grid-cols-2"
        >
          {/* product image — with the urgency line on top */}
          <div className="flex flex-col items-center justify-center gap-2 bg-neutral-50 p-3">
            <p className="text-center font-serif text-[13px] font-semibold italic leading-snug text-red-500">
              Don&apos;t miss out — this offer expires when you leave this page!
            </p>
            <DemoImg src={offer?.image} alt={offer?.title ?? ""} className="h-[150px] w-full object-contain" />
          </div>

          {/* offer details */}
          <div className="flex flex-col justify-between px-5 py-4">
            <div>
              <div className="text-[12px] text-neutral-400">Offer {offerIdx + 1} of {total}</div>
              <h3 className="mt-1 text-[20px] font-bold leading-tight text-neutral-900">
                {offer?.title ?? "Add-on product"}
              </h3>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-[15px] text-neutral-400 line-through">{fmt(full)}</span>
                <span className="text-[20px] font-bold text-red-500">{fmt(deal)}</span>
              </div>

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
                disabled={justAdded}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg py-3 text-[14px] font-semibold text-white shadow-md transition-all hover:brightness-125 active:scale-[0.99]"
                style={{ background: "#111827" }}
              >
                {justAdded ? (
                  <><Check className="size-4" strokeWidth={3} /> Added to your order</>
                ) : (
                  <>Add to order · {fmt(deal)}</>
                )}
              </button>
              <button
                onClick={handleDecline}
                className="w-full rounded-lg py-2 text-[13px] font-semibold transition-colors hover:bg-neutral-50"
                style={{ color: brand }}
              >
                {declineLabel}
              </button>
            </div>
          </div>
        </motion.div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- subscription offer ----------------------------- */

const SUB_DISCOUNT = 0.2; // this offer: 20% off each delivery…
const STANDARD_SUB_DISCOUNT = 0.1; // …vs the store's usual 10% subscriber discount
const DELIVERIES_PER_YEAR = 13; // every 4 weeks
const SUB_INTERVAL_DAYS = 28;

/** Offer 1: turn the item just bought into a "subscribe & save" plan. */
function SubscriptionOffer({
  product,
  currency,
  total,
  addBtnRef,
  started,
  onStart,
  onSkip,
}: {
  product: DemoProduct;
  currency: string;
  total: number;
  addBtnRef?: React.RefObject<HTMLButtonElement | null>;
  started: boolean;
  onStart: () => void;
  onSkip: () => void;
}) {
  // per-delivery prices need cents ($15.20); yearly roll-ups read better rounded ($198)
  const fmtCents = (n: number) =>
    new Intl.NumberFormat("en", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const fmt = (n: number) => money(n, currency);

  const options = (product.variants ?? []).filter((v) => v.title && v.title !== "Default");
  const [sel, setSel] = useState(() => {
    const i = options.findIndex((v) => v.title === product.variant && v.available !== false);
    return i >= 0 ? i : Math.max(0, options.findIndex((v) => v.available !== false));
  });
  const chosen = options[sel];

  const full = chosen?.price || product.price || 0;
  const each = Math.round(full * (1 - SUB_DISCOUNT) * 100) / 100;
  const yearly = each * DELIVERIES_PER_YEAR;
  const saved = (full - each) * DELIVERIES_PER_YEAR;
  const vsStandard = saved - full * STANDARD_SUB_DISCOUNT * DELIVERIES_PER_YEAR;
  const [firstShip] = useState(() =>
    new Date(Date.now() + SUB_INTERVAL_DAYS * 864e5).toLocaleDateString("en-US", { month: "long", day: "numeric" })
  );
  const image = chosen?.image || product.image;

  return (
    <div className="grid grid-cols-1 gap-5 px-5 py-4 md:grid-cols-2">
      {/* product + reassurance */}
      <div>
        <div className="flex h-[230px] items-center justify-center overflow-hidden rounded-xl border border-border bg-neutral-50">
          <DemoImg src={image} alt={product.title} className="size-full object-contain p-4" />
        </div>
        <ul className="mt-3 space-y-2 text-[12.5px] text-neutral-700">
          <li className="flex items-start gap-2"><Truck className="mt-0.5 size-3.5 shrink-0" /> Free shipping on every subscription delivery</li>
          <li className="flex items-start gap-2"><RefreshCw className="mt-0.5 size-3.5 shrink-0" /> Skip, reschedule or cancel from your account — anytime</li>
          <li className="flex items-start gap-2"><Star className="mt-0.5 size-3.5 shrink-0" /> 201 reviews · 97% five stars on {product.title}</li>
        </ul>
      </div>

      {/* offer details */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12px] text-neutral-400">Offer 1 of {total}</span>
          <span className="rounded-full bg-[#111827] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            20% off — double the usual
          </span>
        </div>
        <h3 className="mt-1.5 text-[20px] font-bold leading-tight text-neutral-900">Keep the {product.title} coming</h3>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
          <span className="text-[15px] text-neutral-400 line-through">{fmtCents(full)}</span>
          <span className="text-[22px] font-bold text-neutral-900">{fmtCents(each)}</span>
          <span className="text-[12.5px] text-neutral-600">per delivery, every 4 weeks</span>
        </div>

        {options.length > 1 && (
          <div className="mt-3">
            <div className="text-[12px] font-semibold text-neutral-900">{product.optionName || "Option"}</div>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {options.map((v, i) => {
                const soldOut = v.available === false;
                const active = i === sel;
                return (
                  <button
                    key={v.title}
                    disabled={soldOut}
                    onClick={() => setSel(i)}
                    className={`rounded-lg border px-3 py-1.5 text-[12.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      active ? "border-[#111827] bg-[#111827] text-white" : "border-border text-neutral-800 hover:border-neutral-400"
                    }`}
                  >
                    {v.title}{soldOut ? " · Sold out" : ""}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-3 rounded-lg border border-border bg-neutral-50 px-3 text-[12.5px]">
          <div className="flex justify-between border-b border-border py-2 text-neutral-600">
            <span>Each delivery, instead of {fmtCents(full)}</span>
            <span className="font-semibold text-neutral-900">{fmtCents(each)}</span>
          </div>
          <div className="flex justify-between border-b border-border py-2 text-neutral-600">
            <span>{DELIVERIES_PER_YEAR} deliveries a year</span>
            <span className="font-semibold text-neutral-900">{fmt(yearly)}</span>
          </div>
          <div className="py-2">
            <div className="flex justify-between">
              <span className="font-semibold text-neutral-900">You save in year one</span>
              <span className="font-semibold text-emerald-600">{fmt(saved)} saved</span>
            </div>
            <p className="mt-0.5 text-[11px] text-neutral-500">
              That&apos;s {fmt(vsStandard)} more than the standard 10% subscriber discount.
            </p>
          </div>
        </div>

        <button
          ref={addBtnRef}
          onClick={onStart}
          disabled={started}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-3 text-[14px] font-semibold text-white shadow-md transition-all hover:brightness-125 active:scale-[0.99]"
          style={{ background: "#111827" }}
        >
          {started ? (
            <><Check className="size-4" strokeWidth={3} /> Subscription started</>
          ) : (
            <>Start subscription · {fmtCents(each)} every 4 weeks</>
          )}
        </button>
        <button onClick={onSkip} className="mt-1.5 w-full py-1.5 text-[13px] font-semibold text-neutral-700 underline underline-offset-2 hover:text-neutral-900">
          Skip offer
        </button>
        <p className="mt-2 text-[11px] leading-snug text-neutral-500">
          First delivery ships {firstShip}, charged when it ships to the card you just used. Nothing changes about the order you already placed.
        </p>
      </div>
    </div>
  );
}

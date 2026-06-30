"use client";

import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronDown,
  Loader2,
  Pencil,
  Tag,
  TriangleAlert,
  UserRound,
  MapPin,
  X,
} from "lucide-react";
import type { DemoStore, DemoProduct } from "@/lib/site";

type LineItem = DemoProduct & { uid: string };
type Section = "contact" | "shipping" | "order" | "discount" | "cancel";

const money = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

let counter = 0;
const uid = () => `li-${counter++}`;

/** Personalized recreation of the Clickpost order-editing window. */
export function DemoMock({
  store,
  initialOpen = null,
  onOpenChange,
  forceOpen,
  maxHeight,
  tourMode = false,
  onTourEnd,
  forceOneTap = false,
  extraItem,
}: {
  store: DemoStore;
  initialOpen?: Section | null;
  onOpenChange?: (s: Section | null) => void;
  forceOpen?: Section | null;
  maxHeight?: number;
  tourMode?: boolean;
  onTourEnd?: () => void;
  forceOneTap?: boolean;
  extraItem?: DemoProduct;
}) {
  const brand = store.brandColor || "#1652f0";
  const fmt = (n: number) => money(n, store.currency || "USD");

  // First product is the "purchased" item; the rest become upsell suggestions.
  const purchased = store.products[0];
  const upsellPool = store.products.slice(1).length ? store.products.slice(1) : store.products;

  const [items, setItems] = useState<LineItem[]>(() => {
    const base = purchased ? [purchased] : store.products;
    const all = extraItem ? [...base, extraItem] : base;
    return all.map((p) => ({ ...p, uid: uid() }));
  });
  const [open, setOpen] = useState<Section | null>(initialOpen);
  const [cancelled, setCancelled] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // tour refs
  const countdownRef = useRef<HTMLDivElement>(null);
  const shippingRowRef = useRef<HTMLDivElement>(null);
  const saveBtnDivRef = useRef<HTMLDivElement>(null);
  const upsellRowRef = useRef<HTMLDivElement>(null);
  const oneTapAddBtnRef = useRef<HTMLButtonElement>(null);

  // tour state
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  // switches the left panel between "editing UI" and "one tap upsell UI"
  const [demoMode, setDemoMode] = useState<"edit" | "onetap">(forceOneTap ? "onetap" : "edit");

  useEffect(() => {
    if (!tourActive) setDemoMode(forceOneTap ? "onetap" : "edit");
  }, [forceOneTap, tourActive]);

  // editable field state (sample-prefilled — this is a UI demo)
  const [email, setEmail] = useState("your_email@gmail.com");
  const [phone, setPhone] = useState("+1 760-637-2644");
  const [addr, setAddr] = useState({ first: "Tucker", last: "Briggs", line1: "4563 Coronado Dr", city: "Oceanside", state: "California", zip: "92057" });
  const [discount, setDiscount] = useState("");

  // report which section is open (so an outer panel can explain it)
  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  // let an outer control (top pills) open a section (suspended during tour)
  useEffect(() => {
    if (tourActive) return;
    if (forceOpen === undefined) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- controlled open from parent pills
    setOpen(forceOpen);
  }, [forceOpen, tourActive]);

  // activate tour when prop flips on
  useEffect(() => {
    if (tourMode) {
      setTourStep(0);
      setOpen(null);
      setDemoMode("edit");
      setTourActive(true);
    } else {
      setTourActive(false);
      setDemoMode("edit");
    }
  }, [tourMode]);

  // manage demo state + measure spotlight position per step
  useEffect(() => {
    if (!tourActive) return;
    if (tourStep === 0 || tourStep === 1) { setOpen(null); setDemoMode("edit"); }
    if (tourStep === 2) {
      setDemoMode("edit"); setOpen("shipping");
      setTimeout(() => saveBtnDivRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 120);
    }
    if (tourStep === 3) {
      setDemoMode("edit");
      setOpen(null);
      setTimeout(() => upsellRowRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
    }
    if (tourStep === 4) {
      setDemoMode("onetap");
    }
    const TOUR_REFS = [countdownRef, shippingRowRef, saveBtnDivRef, upsellRowRef, oneTapAddBtnRef];
    // step 2 needs accordion animation to finish; step 4 needs demoMode switch to render
    const delay = tourStep === 2 ? 520 : tourStep === 4 ? 180 : 80;
    const t = setTimeout(() => {
      const el = TOUR_REFS[tourStep]?.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setSpotlightRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    }, delay);
    return () => clearTimeout(t);
  }, [tourStep, tourActive]);

  // live editing-window countdown (default 15 minutes), ticking every second
  const [secondsLeft, setSecondsLeft] = useState(15 * 60 - 1);
  useEffect(() => {
    const id = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const countdown = `${mins} minute${mins === 1 ? "" : "s"} and ${secs
    .toString()
    .padStart(2, "0")} seconds`;

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);

  const toggle = (s: Section) => setOpen((cur) => (cur === s ? null : s));

  const flash = (msg: string) => {
    setToast(msg);
    window.clearTimeout((flash as unknown as { _t?: number })._t);
    (flash as unknown as { _t?: number })._t = window.setTimeout(() => setToast(null), 2200);
  };

  const setQty = (id: string, delta: number) =>
    setItems((prev) =>
      prev.map((i) => (i.uid === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
    );

  const addUpsell = (p: DemoProduct) => {
    setProcessing("Syncing with your order…");
    window.setTimeout(() => {
      setItems((prev) => [...prev, { ...p, uid: uid(), qty: 1 }]);
      setProcessing(null);
      flash(`Added ${p.title.split(" ").slice(0, 3).join(" ")}`);
    }, 1300);
  };

  const advanceTour = () => {
    if (tourStep >= TOUR_STEPS_DATA.length - 1) {
      setTourActive(false);
      setDemoMode("edit");
      onTourEnd?.();
    } else {
      setTourStep((s) => s + 1);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-3xl text-left">
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft-xl">
        <div
          className={`grid lg:grid-cols-[minmax(0,1fr)_270px] ${maxHeight ? "no-scrollbar overflow-y-auto" : ""}`}
          style={maxHeight ? { maxHeight } : undefined}
        >
          {/* LEFT: confirmation + editing panel OR one-tap upsell panel */}
          <div className="border-border p-4 lg:border-r">
            {demoMode === "onetap" ? (
              <OneTapPanel store={store} brand={brand} addBtnRef={oneTapAddBtnRef} />
            ) : (
            <>
            {/* confirmation header */}
            <div className="mb-3 flex items-center gap-3">
              <span
                className="flex size-8 items-center justify-center rounded-full border-2"
                style={{ borderColor: brand, color: brand }}
              >
                <Check className="size-4" strokeWidth={3} />
              </span>
              <div>
                <div className="text-xs text-neutral-500">Confirmation #JDTNH5Z6N</div>
                <div className="text-base font-bold text-neutral-900">Thank you, Tucker!</div>
              </div>
            </div>

            {cancelled ? (
              <div className="rounded-xl border border-border p-6 text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-neutral-100">
                  <X className="size-6 text-neutral-500" />
                </div>
                <p className="font-semibold text-neutral-900">Order cancelled</p>
                <p className="mt-1 text-sm text-neutral-500">
                  A refund of {fmt(subtotal)} has been issued.
                </p>
                <button
                  onClick={() => setCancelled(false)}
                  className="mt-3 text-sm font-semibold"
                  style={{ color: brand }}
                >
                  Undo
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-border p-3">
                <h3 className="mb-2 text-base font-bold text-neutral-900">
                  Make changes to your order
                </h3>

                {/* edit window banner */}
                <div ref={countdownRef} className="mb-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-neutral-700">
                  <TriangleAlert className="size-4 shrink-0 text-amber-500" />
                  <span>
                    You can make changes to order for another{" "}
                    <span className="font-semibold text-red-500 tabular-nums">{countdown}</span>
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <AccordionRow icon={UserRound} label="Change Contact Information" isOpen={open === "contact"} onClick={() => toggle("contact")}>
                    <Field label="Email" value={email} onChange={setEmail} />
                    <Field label="Phone" value={phone} onChange={setPhone} />
                    <CheckboxRow brand={brand} label="Update Profile" />
                    <PrimaryButton brand={brand} onClick={() => { flash("Contact information updated"); setOpen(null); }}>
                      Change Contact Information
                    </PrimaryButton>
                  </AccordionRow>

                  <div ref={shippingRowRef}>
                    <AccordionRow icon={MapPin} label="Edit Shipping Address" isOpen={open === "shipping"} onClick={() => toggle("shipping")}>
                      <SelectField label="Country" value="United States" />
                      <div className="grid grid-cols-2 gap-2.5">
                        <Field label="First Name" value={addr.first} onChange={(v) => setAddr({ ...addr, first: v })} />
                        <Field label="Last Name" value={addr.last} onChange={(v) => setAddr({ ...addr, last: v })} />
                      </div>
                      <Field label="Address 1" value={addr.line1} onChange={(v) => setAddr({ ...addr, line1: v })} />
                      <Field label="Address 2" value="" onChange={() => {}} />
                      <div className="grid grid-cols-3 gap-2.5">
                        <Field label="City" value={addr.city} onChange={(v) => setAddr({ ...addr, city: v })} />
                        <SelectField label="Province / State" value={addr.state} />
                        <Field label="Postal Code" value={addr.zip} onChange={(v) => setAddr({ ...addr, zip: v })} />
                      </div>
                      <div ref={saveBtnDivRef}>
                        <PrimaryButton brand={brand} onClick={() => { flash("Shipping address updated"); setOpen(null); }}>
                          Update Shipping Address
                        </PrimaryButton>
                      </div>
                    </AccordionRow>
                  </div>

                  <AccordionRow icon={Pencil} label="Update your order" isOpen={open === "order"} onClick={() => toggle("order")}>
                    <div className="flex flex-col divide-y divide-border">
                      {items.map((item) => (
                        <div key={item.uid} className="flex items-center gap-3 py-2.5">
                          <Thumb src={item.image} alt={item.title} />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-neutral-800">{item.title}</div>
                            <div className="text-xs text-neutral-500">{fmt(item.price)}</div>
                          </div>
                          <Stepper qty={item.qty} onDec={() => setQty(item.uid, -1)} onInc={() => setQty(item.uid, 1)} />
                        </div>
                      ))}
                    </div>
                    <PrimaryButton brand={brand} onClick={() => { flash("Order updated"); setOpen(null); }}>
                      Update your order
                    </PrimaryButton>
                  </AccordionRow>

                  <AccordionRow icon={Tag} label="Apply Discount Code" isOpen={open === "discount"} onClick={() => toggle("discount")}>
                    <div className="flex gap-2">
                      <input
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        placeholder="Discount code"
                        className="h-11 flex-1 rounded-md border border-border px-3 text-sm focus:outline-none"
                      />
                      <button
                        onClick={() => discount && flash("Discount applied")}
                        className="h-11 rounded-md border border-border bg-neutral-100 px-5 text-sm font-medium text-neutral-500"
                      >
                        Apply
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-neutral-500">
                      Enter a valid discount code to apply savings to your order.
                    </p>
                  </AccordionRow>

                  <AccordionRow icon={X} label="Cancel Your Order" isOpen={open === "cancel"} onClick={() => toggle("cancel")}>
                    <p className="text-sm text-neutral-600">
                      Cancelling will refund {fmt(subtotal)} to your original payment method.
                    </p>
                    <button
                      onClick={() => { setCancelled(true); setOpen(null); flash("Order cancelled"); }}
                      className="mt-3 w-full rounded-md border border-red-200 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
                    >
                      Cancel my order
                    </button>
                  </AccordionRow>
                </div>
              </div>
            )}

            {/* In-page cross-sell row */}
            {!cancelled && (
              <div ref={upsellRowRef} className="mt-3 rounded-xl border border-border p-3">
                <h4 className="mb-2 text-sm font-bold text-neutral-900">
                  You may also like these products
                </h4>
                <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
                  {upsellPool.map((p, i) => (
                    <div key={i} className="w-28 shrink-0">
                      <div className="aspect-square w-full overflow-hidden rounded-lg border border-border bg-neutral-50">
                        <Thumb src={p.image} alt={p.title} full />
                      </div>
                      <div className="mt-1.5 line-clamp-2 text-xs font-medium text-neutral-800">{p.title}</div>
                      <div className="text-xs text-neutral-500">{fmt(p.price)}</div>
                      <button
                        onClick={() => addUpsell(p)}
                        className="mt-1.5 w-full rounded-md py-1.5 text-xs font-semibold text-white"
                        style={{ background: brand }}
                      >
                        Add to order
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </>
            )}
          </div>

          {/* RIGHT: order summary */}
          <aside className="bg-neutral-50 p-4">
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.uid} className="flex items-center gap-3">
                  <div className="relative">
                    <Thumb src={item.image} alt={item.title} />
                    <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white">
                      {item.qty}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 text-xs font-medium text-neutral-800">{item.title}</div>
                  <div className="text-xs font-semibold text-neutral-900">{fmt(item.price * item.qty)}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-1.5 border-t border-border pt-4 text-sm">
              <Row label="Subtotal" value={fmt(subtotal)} />
              <Row label="Shipping" value="FREE" />
            </div>
            <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
              <span className="font-bold text-neutral-900">Total</span>
              <span className="text-lg font-bold text-neutral-900">
                <span className="mr-1 text-xs font-normal text-neutral-400">USD</span>
                {fmt(cancelled ? 0 : subtotal)}
              </span>
            </div>
          </aside>
        </div>
      </div>

      {/* Processing modal */}
      <AnimatePresence>
        {processing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-neutral-900/20 backdrop-blur-[2px]"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="relative w-[80%] max-w-sm rounded-xl bg-white p-8 text-center shadow-soft-xl"
            >
              <p className="mb-4 text-left text-lg font-bold text-neutral-900">Processing…</p>
              <Loader2 className="mx-auto size-9 animate-spin" style={{ color: brand }} />
              <p className="mt-4 text-sm text-neutral-600">{processing}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white shadow-soft-md"
          >
            <Check className="size-3.5" style={{ color: "#6ee7b7" }} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {tourActive && spotlightRect && (
        <TourOverlay
          step={tourStep}
          total={TOUR_STEPS_DATA.length}
          rect={spotlightRect}
          onAdvance={advanceTour}
          onClose={() => { setTourActive(false); onTourEnd?.(); }}
        />
      )}
    </div>
  );
}

/* ----------------------------- sub-components ----------------------------- */

function AccordionRow({
  icon: Icon,
  label,
  isOpen,
  onClick,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <button
        onClick={onClick}
        className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-neutral-50"
        aria-expanded={isOpen}
      >
        <Icon className="size-4 shrink-0 text-neutral-600" />
        <span className="flex-1 text-sm font-semibold text-neutral-900">{label}</span>
        <ChevronDown className={`size-4 text-neutral-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2.5 px-3.5 pb-4 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="relative block rounded-md border border-border px-3 pt-5 pb-1.5 focus-within:border-neutral-400">
      <span className="pointer-events-none absolute left-3 top-1.5 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm text-neutral-800 focus:outline-none"
      />
    </label>
  );
}

function SelectField({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative rounded-md border border-border px-3 pt-5 pb-1.5">
      <span className="pointer-events-none absolute left-3 top-1.5 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </span>
      <div className="flex items-center justify-between text-sm text-neutral-800">
        {value}
        <ChevronDown className="size-4 text-neutral-400" />
      </div>
    </div>
  );
}

function CheckboxRow({ label, brand }: { label: string; brand: string }) {
  const [on, setOn] = useState(true);
  return (
    <button onClick={() => setOn((v) => !v)} className="flex items-center gap-2 text-sm text-neutral-700">
      <span
        className="flex size-5 items-center justify-center rounded border"
        style={on ? { background: brand, borderColor: brand } : { borderColor: "#cbd0d8" }}
      >
        {on && <Check className="size-3.5 text-white" strokeWidth={3} />}
      </span>
      {label}
    </button>
  );
}

function PrimaryButton({ brand, onClick, children }: { brand: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="mt-1 w-full rounded-md py-3 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.99]"
      style={{ background: brand }}
    >
      {children}
    </button>
  );
}

function Stepper({ qty, onDec, onInc }: { qty: number; onDec: () => void; onInc: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={onDec} className="flex size-7 items-center justify-center rounded-md border border-border text-neutral-500 hover:text-neutral-900">
        −
      </button>
      <span className="w-5 text-center text-sm font-medium">{qty}</span>
      <button onClick={onInc} className="flex size-7 items-center justify-center rounded-md border border-border text-neutral-500 hover:text-neutral-900">
        +
      </button>
    </div>
  );
}

function Thumb({ src, alt, full }: { src?: string | null; alt: string; full?: boolean }) {
  const cls = full ? "size-full object-cover" : "size-11 shrink-0 rounded-lg border border-border object-cover";
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- remote product images from any store
    return <img src={src} alt={alt} className={cls} onError={(e) => (e.currentTarget.style.visibility = "hidden")} />;
  }
  return <div className={full ? "size-full bg-neutral-100" : "size-11 shrink-0 rounded-lg bg-neutral-100"} aria-hidden />;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-neutral-600">
      <span>{label}</span>
      <span className="font-medium text-neutral-900">{value}</span>
    </div>
  );
}

/* ----------------------------- one-tap upsell panel ----------------------------- */

function OneTapPanel({
  store,
  brand,
  addBtnRef,
}: {
  store: DemoStore;
  brand: string;
  addBtnRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const offer = store.products[1] ?? store.products[0];
  const full = offer?.price ?? 12;
  const deal = Math.max(1, Math.round(full * 0.5 * 100) / 100);
  const [secs, setSecs] = useState(9 * 60 + 54);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const timer = `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, "0")}`;
  const moneyFmt = (n: number) => `$${n.toFixed(2)}`;

  return (
    <div className="flex flex-col gap-3">
      {/* confirmation header */}
      <div className="flex items-center gap-2 text-sm">
        <span className="flex size-6 items-center justify-center rounded-full border-2" style={{ borderColor: brand, color: brand }}>
          <Check className="size-3.5" strokeWidth={3} />
        </span>
        <span className="font-semibold text-neutral-900">Confirmation #0WPS9KCW8</span>
        <span className="text-neutral-400">· You&apos;ve paid</span>
      </div>

      {/* "before you go" banner */}
      <div className="flex items-center gap-3 rounded-lg bg-neutral-50 py-2.5 text-center text-[13px] text-neutral-700">
        <span className="flex-1 text-center font-semibold">Tucker, before you go!</span>
        <span className="mr-3 font-semibold tabular-nums text-red-500">{timer}</span>
      </div>

      {/* offer card */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-neutral-50">
          {offer?.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote product image
            <img src={offer.image} alt={offer?.title ?? ""} className="size-full object-contain p-4" onError={(e) => (e.currentTarget.style.display = "none")} />
          ) : (
            <div className="size-2/3 rounded-lg bg-neutral-200" aria-hidden />
          )}
        </div>

        <div className="flex flex-col justify-between py-1">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">Offer 1 of 1</div>
            <div className="mt-1 text-[14px] font-semibold leading-snug text-neutral-900">
              {offer?.title ?? "Add-on product"}
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-[12px] text-neutral-400 line-through">{moneyFmt(full)}</span>
              <span className="text-[15px] font-bold text-red-500">{moneyFmt(deal)}</span>
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <button
              ref={addBtnRef}
              className="w-full rounded-lg py-2.5 text-[13px] font-semibold text-white shadow-md transition-all hover:brightness-110"
              style={{ background: brand }}
            >
              Add to order · {moneyFmt(deal)}
            </button>
            <button className="w-full py-1.5 text-[12px] font-medium text-neutral-400 hover:text-neutral-600">
              Skip offer
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-[11px] text-neutral-400">
        One tap to add — no card or re-checkout needed.
      </p>
    </div>
  );
}

/* ----------------------------- product tour ----------------------------- */

const TOUR_ACCENT = "#155FFF";

const TOUR_STEPS_DATA = [
  {
    title: "Your edit window",
    desc: "Customers can make changes for this long after checkout. You set the duration — every second here is a support ticket that never gets opened.",
    cta: "Show me editing",
  },
  {
    title: "Fix a wrong address",
    desc: "Typed the wrong street? Tap this row and customers correct it themselves — no email, no agent, no ticket.",
    cta: "Tap to open it",
  },
  {
    title: "One tap to save",
    desc: "The update syncs instantly to your store. The label prints with the right address — zero back-and-forth.",
    cta: "Tap Save to continue",
  },
  {
    title: "In-page cross-sell",
    desc: "Product recommendations shown right on the editing page — customers add items to the same order with zero new checkout.",
    cta: "Now see the upsell",
  },
  {
    title: "One Tap Upsell",
    desc: "A separate dedicated offer shown right after purchase, before any editing. One tap to add, charged to the card already on file — no re-checkout, no friction.",
    cta: "Done — finish tour",
  },
];

function TourOverlay({
  step,
  total,
  rect,
  onAdvance,
  onClose,
}: {
  step: number;
  total: number;
  rect: { top: number; left: number; width: number; height: number };
  onAdvance: () => void;
  onClose: () => void;
}) {
  if (typeof window === "undefined") return null;
  const PAD = 10;
  const sl = { top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 };
  const stepData = TOUR_STEPS_DATA[step];
  const spaceBelow = window.innerHeight - (sl.top + sl.height);
  const tooltipBelow = spaceBelow >= 196;
  const tooltipLeft = Math.min(Math.max(sl.left, 12), window.innerWidth - 296);

  return createPortal(
    <div className="fixed inset-0 z-[500]">
      {/* Dark overlay with spotlight cutout */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <mask id={`tsp-${step}`}>
            <rect width="100%" height="100%" fill="white" />
            <rect x={sl.left} y={sl.top} width={sl.width} height={sl.height} rx="10" fill="black" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(4,9,30,0.72)" mask={`url(#tsp-${step})`} />
      </svg>

      {/* Pulsing ring */}
      <div
        className="pointer-events-none absolute animate-pulse rounded-[10px]"
        style={{ top: sl.top, left: sl.left, width: sl.width, height: sl.height, boxShadow: "0 0 0 2px rgba(255,255,255,0.9), 0 0 0 6px rgba(255,255,255,0.18)" }}
      />

      {/* Clickable spotlight zone */}
      <div
        className="absolute cursor-pointer rounded-[10px]"
        style={{ top: sl.top, left: sl.left, width: sl.width, height: sl.height }}
        onClick={onAdvance}
      />

      {/* Bouncing tap indicator */}
      <motion.div
        key={`tap-${step}`}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25 }}
        className="pointer-events-none absolute"
        style={{ top: sl.top + sl.height / 2 - 14, left: sl.left + sl.width - 52 }}
      >
        <motion.span
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          className="text-[26px]"
          role="img"
          aria-label="tap here"
        >
          👆
        </motion.span>
      </motion.div>

      {/* Tooltip card */}
      <motion.div
        key={`card-${step}`}
        initial={{ opacity: 0, y: tooltipBelow ? 10 : -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="absolute w-[280px] overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={
          tooltipBelow
            ? { top: sl.top + sl.height + 14, left: tooltipLeft }
            : { bottom: window.innerHeight - sl.top + 14, left: tooltipLeft }
        }
      >
        <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${TOUR_ACCENT}, #7c3aed)` }} />
        <div className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Step {step + 1} of {total}
            </span>
            <div className="ml-auto flex gap-1.5">
              {Array.from({ length: total }).map((_, i) => (
                <div
                  key={i}
                  className="size-1.5 rounded-full transition-colors"
                  style={{ background: i === step ? TOUR_ACCENT : "#e2e8f0" }}
                />
              ))}
            </div>
          </div>
          <div className="text-[15px] font-bold leading-snug text-neutral-900">{stepData.title}</div>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-neutral-500">{stepData.desc}</p>
          <button
            onClick={onAdvance}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold text-white transition-all hover:brightness-110"
            style={{ background: TOUR_ACCENT }}
          >
            {stepData.cta}
            {step < total - 1 && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
      </motion.div>

      {/* Skip */}
      <button
        onClick={onClose}
        className="absolute right-5 top-5 rounded-full bg-white/10 px-4 py-2 text-[12px] font-medium text-white backdrop-blur-sm ring-1 ring-white/20 transition-colors hover:bg-white/20"
      >
        Skip tour
      </button>
    </div>,
    document.body
  );
}

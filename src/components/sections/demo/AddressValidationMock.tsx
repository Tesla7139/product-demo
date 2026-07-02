"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, TriangleAlert } from "lucide-react";
import type { DemoStore } from "@/lib/site";

const GOOGLE_BLUE = "#1a73e8";

type AddrFields = { name: string; line1: string; line2: string; city: string; state: string; zip: string; country: string };
const ENTERED_ADDR: AddrFields = { name: "Tucker Albright", line1: "Main Street", line2: "Apt 4B", city: "Flushing", state: "New York", zip: "10444", country: "United States" };
const RECOMMENDED_ADDR: AddrFields = { name: "Tucker Albright", line1: "10444 Main St", line2: "Apt 4B", city: "Flushing", state: "NY", zip: "11367", country: "USA" };

/** Boxed, input-style field with a floating label (matches the order-editing windows). */
function Field({ label, value, changed }: { label: string; value: string; changed?: boolean }) {
  return (
    <div
      className="relative rounded-md border bg-white px-3 pt-5 pb-1.5 transition-colors"
      style={{ borderColor: changed ? "#6ee7b7" : "#e5e7eb" }}
    >
      <span className="pointer-events-none absolute left-3 top-1.5 text-[10px] font-medium uppercase tracking-wide text-neutral-400">{label}</span>
      <div className={`text-sm leading-snug ${changed ? "font-semibold text-neutral-900" : "text-neutral-800"}`}>{value}</div>
    </div>
  );
}

/** The four-colour Google "G". */
function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

/** Google Maps app tile: stylized map with a red location pin. */
function GoogleMapsMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Google Maps" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#E8EAED" />
      <path d="M0 30 L18 48 L0 48 Z" fill="#A8DAB5" />
      <path d="M34 0 L48 0 L48 13 Z" fill="#AECBFA" />
      <path d="M-4 17 L21 42 L16 47 L-9 22 Z" fill="#FBBC04" />
      <path d="M6 -2 L44 36" stroke="#fff" strokeWidth="3" fill="none" />
      <path d="M0 39 L28 48" stroke="#fff" strokeWidth="2.4" fill="none" />
      <path d="M24 8.5c-5.4 0-9.8 4.4-9.8 9.8 0 7.2 9.8 17.2 9.8 17.2s9.8-10 9.8-17.2c0-5.4-4.4-9.8-9.8-9.8z" fill="#EA4335" />
      <circle cx="24" cy="18" r="3.5" fill="#A50E0E" />
    </svg>
  );
}

type AddrTourRefs = {
  flaggedAddr?: React.RefObject<HTMLDivElement | null>;
  recommended?: React.RefObject<HTMLButtonElement | null>;
  confirmBtn?: React.RefObject<HTMLButtonElement | null>;
  saveBtn?: React.RefObject<HTMLButtonElement | null>;
};

/** Address validation: save an address → it's flagged → accept the recommended fix → verified. */
export function AddressValidationMock({ store, tourRefs, onValidated, onConfirmed }: { store: DemoStore; tourRefs?: AddrTourRefs; onValidated?: () => void; onConfirmed?: () => void }) {
  const [step, setStep] = useState<"edit" | "review" | "done">("edit");
  const flagged = step === "review";
  const verified = step === "done";
  const fields = verified ? RECOMMENDED_ADDR : ENTERED_ADDR;
  const name = store.brandName || "Checkout";
  const boxBorder = verified ? "#6ee7b7" : flagged ? "#fca5a5" : "#e5e7eb";
  const boxBg = verified ? "#ecfdf5" : flagged ? "#fef2f2" : "#ffffff";

  return (
    <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-white shadow-soft-xl">
      <div className="max-h-[560px] overflow-y-auto no-scrollbar">
        {/* header */}
        <div className="border-b border-border px-6 py-4">
          <div className="text-[13px] font-semibold text-neutral-800">{name} · Delivery</div>
          <div className="text-[12px] text-neutral-500">Every address is checked before the order ships.</div>
        </div>

        <div className="p-6">
          <div className="grid gap-5 md:grid-cols-2">
            {/* left column: status banner + flagged address */}
            <div className="space-y-3">
              {/* status banner — only after saving (red flagged / green verified) */}
              {verified && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[13px] font-semibold text-emerald-700">
                  <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white"><Check className="size-3" strokeWidth={3} /></span>
                  Address verified &amp; deliverable
                </div>
              )}
              {flagged && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] font-semibold text-red-600">
                  <TriangleAlert className="size-4 shrink-0" />
                  We couldn&apos;t validate this address
                </div>
              )}

              {/* address, boxed fields */}
              <div className="mb-0 text-[11px] font-medium uppercase tracking-wide text-neutral-400">Delivery address</div>
              <motion.div
                ref={tourRefs?.flaggedAddr}
                className="space-y-2.5 rounded-xl border-2 p-3 transition-colors"
                style={{ borderColor: boxBorder, background: boxBg }}
                animate={flagged ? { x: [0, -9, 9, -7, 7, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <Field label="Full name" value={fields.name} />
                <Field label="Address" value={fields.line1} changed={verified} />
                <Field label="Apartment, suite, etc." value={fields.line2} />
                <div className="grid grid-cols-3 gap-2.5">
                  <Field label="City" value={fields.city} />
                  <Field label="State" value={fields.state} changed={verified} />
                  <Field label="ZIP code" value={fields.zip} changed={verified} />
                </div>
                <Field label="Country" value={fields.country} changed={verified} />
              </motion.div>

              {/* Save address — only before validation */}
              {step === "edit" && (
                <button
                  ref={tourRefs?.saveBtn}
                  onClick={() => { setStep("review"); onValidated?.(); }}
                  className="w-full rounded-lg py-3 text-[14px] font-semibold text-white shadow-md transition-all hover:brightness-125 active:scale-[0.99]"
                  style={{ background: "#111827" }}
                >
                  Save address
                </button>
              )}
            </div>

            {/* right: recommended address confirm (only after saving) */}
            <AnimatePresence mode="wait">
              {flagged && (
                <motion.div
                  key="popup"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="relative self-start rounded-2xl bg-neutral-50 p-7 ring-1 ring-neutral-200"
                >
                  {/* Google Maps badge */}
                  <div className="absolute -right-3 -top-3 size-12 overflow-hidden rounded-xl shadow-md ring-1 ring-black/5">
                    <GoogleMapsMark className="size-full" />
                    <span className="absolute left-[3px] top-[3px] flex size-4 items-center justify-center rounded-md bg-white shadow-sm ring-1 ring-black/5">
                      <GoogleG className="size-[11px]" />
                    </span>
                  </div>
                  <h4 className="pr-8 text-[19px] font-bold leading-tight text-neutral-900">Confirm your delivery address</h4>
                  <p className="mt-1 text-[13px] text-neutral-500">Use the corrected, deliverable address we found.</p>

                  <button
                    ref={tourRefs?.recommended}
                    className="mt-4 flex w-full items-start gap-3 rounded-xl border-2 bg-white p-4 text-left"
                    style={{ borderColor: GOOGLE_BLUE }}
                  >
                    <span className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border-2" style={{ borderColor: GOOGLE_BLUE }}>
                      <span className="size-2 rounded-full" style={{ background: GOOGLE_BLUE }} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[17px] font-bold text-neutral-900">Recommended</span>
                      <span className="mt-1.5 block space-y-0.5 text-[14px] leading-relaxed text-neutral-700">
                        <span className="block font-medium text-neutral-900">{RECOMMENDED_ADDR.name}</span>
                        <span className="block">{RECOMMENDED_ADDR.line1}, {RECOMMENDED_ADDR.line2}</span>
                        <span className="block">{RECOMMENDED_ADDR.city}, {RECOMMENDED_ADDR.state} {RECOMMENDED_ADDR.zip}</span>
                        <span className="block">{RECOMMENDED_ADDR.country}</span>
                      </span>
                    </span>
                  </button>

                  <button
                    ref={tourRefs?.confirmBtn}
                    onClick={() => { setStep("done"); onConfirmed?.(); }}
                    className="mt-5 w-full rounded-full py-3 text-[14px] font-semibold text-white transition-all hover:brightness-110"
                    style={{ background: GOOGLE_BLUE }}
                  >
                    Use this address
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

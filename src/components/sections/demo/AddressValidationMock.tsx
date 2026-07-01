"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, TriangleAlert } from "lucide-react";
import type { DemoStore } from "@/lib/site";

const GOOGLE_BLUE = "#1a73e8";
const ENTERED = "Main Street, Flushing, New York 10444, United States";
const RECOMMENDED = "10444 Main St, Flushing, NY 11367, USA";

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
      {/* map base */}
      <rect width="48" height="48" fill="#E8EAED" />
      {/* parkland */}
      <path d="M0 30 L18 48 L0 48 Z" fill="#A8DAB5" />
      {/* water */}
      <path d="M34 0 L48 0 L48 13 Z" fill="#AECBFA" />
      {/* yellow highway */}
      <path d="M-4 17 L21 42 L16 47 L-9 22 Z" fill="#FBBC04" />
      {/* white roads */}
      <path d="M6 -2 L44 36" stroke="#fff" strokeWidth="3" fill="none" />
      <path d="M0 39 L28 48" stroke="#fff" strokeWidth="2.4" fill="none" />
      {/* red location pin */}
      <path d="M24 8.5c-5.4 0-9.8 4.4-9.8 9.8 0 7.2 9.8 17.2 9.8 17.2s9.8-10 9.8-17.2c0-5.4-4.4-9.8-9.8-9.8z" fill="#EA4335" />
      <circle cx="24" cy="18" r="3.5" fill="#A50E0E" />
    </svg>
  );
}

function RadioCard({ label, value, selected, onClick, innerRef }: { label: string; value: string; selected: boolean; onClick: () => void; innerRef?: React.RefObject<HTMLButtonElement | null> }) {
  return (
    <button
      ref={innerRef}
      onClick={onClick}
      className="flex w-full items-start gap-2.5 rounded-xl border-2 bg-white p-3 text-left transition-colors"
      style={{ borderColor: selected ? GOOGLE_BLUE : "#e5e7eb" }}
    >
      <span
        className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2"
        style={{ borderColor: selected ? GOOGLE_BLUE : "#cbd5e1" }}
      >
        {selected && <span className="size-2 rounded-full" style={{ background: GOOGLE_BLUE }} />}
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-neutral-900">{label}</span>
        <span className="mt-0.5 block text-[12px] leading-snug text-neutral-500">{value}</span>
      </span>
    </button>
  );
}

type AddrTourRefs = {
  flaggedAddr?: React.RefObject<HTMLDivElement | null>;
  recommended?: React.RefObject<HTMLButtonElement | null>;
  confirmBtn?: React.RefObject<HTMLButtonElement | null>;
};

/** Address validation: an unverified address + a Google-style confirm popup. */
export function AddressValidationMock({ store, tourRefs, onConfirmed }: { store: DemoStore; tourRefs?: AddrTourRefs; onConfirmed?: () => void }) {
  const [step, setStep] = useState<"review" | "done">("review");
  const [choice, setChoice] = useState<"entered" | "recommended">("recommended");
  const verified = step === "done" && choice === "recommended";
  const applied = choice === "recommended" ? RECOMMENDED : ENTERED;
  const name = store.brandName || "Checkout";

  return (
    <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-white shadow-soft-xl">
      {/* header */}
      <div className="border-b border-border px-6 py-4">
        <div className="text-[13px] font-semibold text-neutral-800">{name} · Delivery</div>
        <div className="text-[12px] text-neutral-500">Every address is checked before the order ships.</div>
      </div>

      <div className="grid gap-5 p-6 md:grid-cols-2">
        {/* left: the address field */}
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">Delivery address</div>
          <div
            ref={tourRefs?.flaggedAddr}
            className="mt-1.5 rounded-lg border-2 px-4 py-3 text-[14px] leading-snug text-neutral-800 transition-colors"
            style={{
              borderColor: step === "done" ? (verified ? "#6ee7b7" : "#fcd34d") : "#fca5a5",
              background: step === "done" ? (verified ? "#ecfdf5" : "#fffbeb") : "#fef2f2",
            }}
          >
            {step === "done" ? applied : ENTERED}
          </div>
          {step === "review" ? (
            <p className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-red-500">
              <TriangleAlert className="size-3.5" /> We couldn&apos;t verify this address
            </p>
          ) : verified ? (
            <p className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-emerald-600">
              <Check className="size-3.5" strokeWidth={3} /> Verified &amp; deliverable
            </p>
          ) : (
            <p className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-amber-600">
              <TriangleAlert className="size-3.5" /> Using your address — delivery not guaranteed
            </p>
          )}
          {step === "done" && (
            <button
              onClick={() => { setStep("review"); setChoice("recommended"); }}
              className="mt-3 text-[12px] font-semibold"
              style={{ color: GOOGLE_BLUE }}
            >
              Run validation again
            </button>
          )}
        </div>

        {/* right: confirm popup */}
        <AnimatePresence mode="wait">
          {step === "review" && (
            <motion.div
              key="popup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-2xl bg-neutral-50 p-5 ring-1 ring-neutral-200"
            >
              {/* Google Maps badge */}
              <div className="absolute -right-3 -top-3 size-11 overflow-hidden rounded-xl shadow-md ring-1 ring-black/5">
                <GoogleMapsMark className="size-full" />
                <span className="absolute left-[3px] top-[3px] flex size-[15px] items-center justify-center rounded-md bg-white shadow-sm ring-1 ring-black/5">
                  <GoogleG className="size-[10px]" />
                </span>
              </div>
              <h4 className="pr-8 text-[16px] font-bold leading-tight text-neutral-900">Confirm your delivery address</h4>
              <p className="mt-0.5 text-[12px] text-neutral-500">Review the recommended changes</p>
              <div className="mt-3 space-y-2">
                <RadioCard label="What you entered" value={ENTERED} selected={choice === "entered"} onClick={() => setChoice("entered")} />
                <RadioCard innerRef={tourRefs?.recommended} label="Recommended" value={RECOMMENDED} selected={choice === "recommended"} onClick={() => setChoice("recommended")} />
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => { setChoice("entered"); setStep("done"); }}
                  className="flex-1 rounded-full border border-neutral-300 py-2.5 text-[13px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-100"
                >
                  Back
                </button>
                <button
                  ref={tourRefs?.confirmBtn}
                  onClick={() => { setStep("done"); onConfirmed?.(); }}
                  className="flex-1 rounded-full py-2.5 text-[13px] font-semibold text-white transition-all hover:brightness-110"
                  style={{ background: GOOGLE_BLUE }}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

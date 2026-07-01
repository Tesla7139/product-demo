"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, MapPin, TriangleAlert } from "lucide-react";
import type { DemoStore } from "@/lib/site";

const GOOGLE_BLUE = "#1a73e8";
const ENTERED = "Main Street, Flushing, New York 10444, United States";
const RECOMMENDED = "10444 Main St, Flushing, NY 11367, USA";

function RadioCard({ label, value, selected, onClick }: { label: string; value: string; selected: boolean; onClick: () => void }) {
  return (
    <button
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

/** Address validation: an unverified address + a Google-style confirm popup. */
export function AddressValidationMock({ store }: { store: DemoStore }) {
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
              {/* maps badge */}
              <div className="absolute -right-3 -top-3 flex size-9 items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-neutral-200">
                <MapPin className="size-5" style={{ color: "#ea4335" }} />
              </div>
              <h4 className="pr-8 text-[16px] font-bold leading-tight text-neutral-900">Confirm your delivery address</h4>
              <p className="mt-0.5 text-[12px] text-neutral-500">Review the recommended changes</p>
              <div className="mt-3 space-y-2">
                <RadioCard label="What you entered" value={ENTERED} selected={choice === "entered"} onClick={() => setChoice("entered")} />
                <RadioCard label="Recommended" value={RECOMMENDED} selected={choice === "recommended"} onClick={() => setChoice("recommended")} />
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => { setChoice("entered"); setStep("done"); }}
                  className="flex-1 rounded-full border border-neutral-300 py-2.5 text-[13px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-100"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep("done")}
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

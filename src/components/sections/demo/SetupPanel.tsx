"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronsUpDown } from "lucide-react";

const TIME_OPTIONS = [
  "15 Minute",
  "30 Minute",
  "1 Hour",
  "2 Hour",
  "4 Hour",
  "6 Hour",
  "12 Hour",
  "1 day",
];

const TABS = ["Time Limit", "Until Fulfilled", "Custom"] as const;

const EDIT_OPTIONS = [
  { key: "shipping", label: "Shipping Address" },
  { key: "contact", label: "Change Contact Information" },
  { key: "order", label: "Update Your Order" },
  { key: "discount", label: "Discount Codes" },
  { key: "cancel", label: "Cancellation" },
] as const;

/** Merchant "enable order editing" setup card (default window: 15 minutes). */
export function SetupPanel({
  onBack,
  onSkip,
  onNext,
  className,
}: {
  onBack?: () => void;
  onSkip?: () => void;
  onNext?: () => void;
  className?: string;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Time Limit");
  const [timeLimit, setTimeLimit] = useState("15 Minute");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [allowed, setAllowed] = useState<Record<string, boolean>>({
    shipping: true,
    contact: true,
    order: true,
    discount: false,
    cancel: false,
  });

  return (
    <div
      className={`w-full max-w-md rounded-2xl border border-border bg-white p-6 text-left shadow-soft-xl ${className ?? ""}`}
    >
      <h3 className="text-base font-bold text-neutral-900">
        Let customers edit their orders after checkout
      </h3>

      <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-3 text-sm font-medium text-emerald-800">
        <Check className="size-4" strokeWidth={3} />
        Order editing is now enabled for customers.
      </div>

      <h4 className="mt-6 text-sm font-bold text-neutral-900">
        Select the time limit for customers to edit their orders
      </h4>
      <div className="mt-3 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md border px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t
                ? "border-neutral-300 bg-neutral-200 text-neutral-900"
                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence initial={false}>
        {tab === "Time Limit" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-visible"
          >
            <div className="mt-4">
              <span className="text-sm text-neutral-500">Select Time Limit</span>
              <div className="relative mt-1.5">
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className={`flex w-full items-center justify-between rounded-md border bg-neutral-50 px-4 py-2.5 text-sm text-neutral-800 ${
                    dropdownOpen ? "border-blue-500 ring-2 ring-blue-500/30" : "border-border"
                  }`}
                >
                  {timeLimit}
                  <ChevronsUpDown className="size-4 text-neutral-500" />
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.ul
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-neutral-300 bg-white py-1 shadow-soft-xl"
                    >
                      {TIME_OPTIONS.map((opt) => (
                        <li key={opt}>
                          <button
                            onClick={() => {
                              setTimeLimit(opt);
                              setDropdownOpen(false);
                            }}
                            className={`block w-full px-4 py-2 text-left text-sm transition-colors ${
                              opt === timeLimit
                                ? "bg-blue-600 text-white"
                                : "text-neutral-800 hover:bg-neutral-100"
                            }`}
                          >
                            {opt}
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <h4 className="mt-6 text-sm font-bold text-neutral-900">Allow customers to edit:</h4>
      <div className="mt-3 flex flex-col gap-3">
        {EDIT_OPTIONS.map((o) => {
          const on = allowed[o.key];
          return (
            <button
              key={o.key}
              onClick={() => setAllowed((p) => ({ ...p, [o.key]: !p[o.key] }))}
              className="flex items-center gap-3 text-left text-sm text-neutral-800"
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
                  on ? "border-neutral-900 bg-neutral-900" : "border-neutral-300 bg-white"
                }`}
              >
                {on && <Check className="size-4 text-white" strokeWidth={3} />}
              </span>
              {o.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
        <button
          onClick={onBack}
          className="rounded-md px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={onSkip ?? onNext}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Skip for now
          </button>
          <button
            onClick={onNext}
            className="rounded-md bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-neutral-800 active:scale-[0.98]"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

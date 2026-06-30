"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Pencil, RotateCcw, Sparkles } from "lucide-react";
import type { DemoStore, DemoProduct } from "@/lib/site";
import { DemoMock } from "./DemoMock";
import { OneTapUpsellMock } from "./OneTapUpsellMock";

const ACCENT = "#155FFF";

type Tab = "editing" | "upsell" | "address" | "cancel";

const TABS: { key: Tab; label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; desc: string }[] = [
  { key: "editing",  label: "Order Editing",           icon: Pencil,    desc: "Edit, swap & update" },
  { key: "upsell",   label: "Post-Purchase Upsell",    icon: Sparkles,  desc: "One-tap add-ons" },
  { key: "address",  label: "Address Validation",      icon: MapPin,    desc: "Stop failed deliveries" },
  { key: "cancel",   label: "Cancellations & Refunds", icon: RotateCcw, desc: "Self-serve, no tickets" },
];

export function GuidedEditor({ store }: { store: DemoStore }) {
  const [tab, setTab] = useState<Tab>("editing");
  const [tourMode, setTourMode] = useState(false);
  const [upsellItem, setUpsellItem] = useState<DemoProduct | null>(null);

  return (
    <div
      className="relative flex h-[720px] gap-5 overflow-hidden rounded-3xl p-5"
      style={{ background: "linear-gradient(155deg, #0b1740 0%, #1433b8 100%)" }}
    >
      {/* radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 60% at 65% 40%, rgba(80,130,255,0.2) 0%, transparent 70%)" }}
      />

      {/* left sidebar */}
      <aside className="relative z-10 flex w-[260px] shrink-0 flex-col rounded-2xl border border-white/10 bg-white/[0.07] p-3 backdrop-blur-xl">
        <div className="px-2 pb-3 pt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white/35">
          Products
        </div>
        <div className="flex flex-col gap-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-xl px-3.5 py-3 text-left transition-colors ${active ? "shadow-lg" : "hover:bg-white/10"}`}
                style={active ? { background: ACCENT } : undefined}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${active ? "bg-white/20" : "bg-white/10"}`}
                  >
                    <Icon className="size-4" style={{ color: active ? "#fff" : "rgba(255,255,255,0.6)" }} />
                  </span>
                  <div className="min-w-0">
                    <div
                      className="text-[15px] font-semibold leading-tight"
                      style={{ color: active ? "#fff" : "rgba(255,255,255,0.8)" }}
                    >
                      {t.label}
                    </div>
                    <div
                      className="mt-0.5 text-[12px]"
                      style={{ color: active ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.4)" }}
                    >
                      {t.desc}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* right panel — white card */}
      <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden rounded-2xl bg-white shadow-[0_48px_96px_-24px_rgba(0,0,0,0.55)]">
        <AnimatePresence mode="wait">
          {tab === "upsell" && (
            <motion.div
              key="upsell"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="w-full overflow-y-auto no-scrollbar"
            >
              <OneTapUpsellMock
                store={store}
                onComplete={(wasAdded) => {
                  if (wasAdded) setUpsellItem(store.products[1] ?? store.products[0]);
                  setTab("editing");
                  setTourMode(true);
                }}
              />
            </motion.div>
          )}

          {tab === "editing" && (
            <motion.div
              key="editing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="w-full overflow-y-auto p-4 no-scrollbar"
            >
              <DemoMock
                store={store}
                initialOpen="shipping"
                maxHeight={660}
                tourMode={tourMode}
                onTourEnd={() => setTourMode(false)}
                extraItem={upsellItem ?? undefined}
              />
            </motion.div>
          )}

          {tab === "address" && (
            <motion.div
              key="address"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="w-full overflow-y-auto p-4 no-scrollbar"
            >
              <DemoMock
                store={store}
                initialOpen="shipping"
                forceOpen="shipping"
                maxHeight={660}
              />
            </motion.div>
          )}

          {tab === "cancel" && (
            <motion.div
              key="cancel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="w-full overflow-y-auto p-4 no-scrollbar"
            >
              <DemoMock
                store={store}
                initialOpen="cancel"
                forceOpen="cancel"
                maxHeight={660}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

const LOADING_STEPS = ["Reading your store…", "Pulling your products…", "Building your demo…"];

export function DemoSkeleton({ step }: { step: number }) {
  return (
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl border border-border bg-card p-5 shadow-soft-xl">
      <div className="flex items-center gap-3">
        <div className="size-9 animate-pulse rounded-lg bg-background-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 animate-pulse rounded bg-background-muted" />
          <div className="h-2.5 w-1/4 animate-pulse rounded bg-background-muted" />
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="size-12 animate-pulse rounded-lg bg-background-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-2/3 animate-pulse rounded bg-background-muted" />
              <div className="h-2.5 w-1/3 animate-pulse rounded bg-background-muted" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-primary">
        <Loader2 className="size-4 animate-spin" />
        <AnimatePresence mode="wait">
          <motion.span
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            {LOADING_STEPS[step]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

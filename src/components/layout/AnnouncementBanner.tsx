"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "lucide-react";

export function AnnouncementBanner() {
  const [open, setOpen] = useState(true);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-50 overflow-hidden bg-foreground text-background"
        >
          <div className="mx-auto flex max-w-[1240px] items-center justify-center gap-3 px-6 py-2.5 text-sm">
            <span className="font-medium">
              New: post-purchase upsells now live in CP: Order Editing
            </span>
            <a
              href="#demo"
              className="group inline-flex items-center gap-1 font-semibold text-background underline-offset-4 hover:underline"
            >
              Try a demo
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Dismiss announcement"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded p-1 text-background/70 transition-colors hover:text-background"
            >
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

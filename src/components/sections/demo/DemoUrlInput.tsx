"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function DemoUrlInput({
  url,
  setUrl,
  onSubmit,
  loading,
  align = "left",
}: {
  url: string;
  setUrl: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("w-full", align === "center" && "mx-auto max-w-xl")}>
      <form onSubmit={onSubmit} className="w-full">
        <label htmlFor="store-url" className="sr-only">
          Your store URL
        </label>
        <div className="group relative flex w-full items-center rounded-full border bg-white/95 p-2 shadow-[0_10px_40px_-12px_rgba(15,15,25,0.18)] backdrop-blur-xl transition-all border-border/60 focus-within:border-primary/50 focus-within:shadow-[0_14px_50px_-12px_rgba(47,91,255,0.3)]">
          <input
            id="store-url"
            type="text"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="yourstore.com"
            className="h-12 flex-1 bg-transparent pl-5 pr-2 text-[0.95rem] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus-visible:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="flex h-12 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-primary px-5 text-[0.9rem] font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Generating
              </>
            ) : (
              <>
                See it on my store <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Quote } from "lucide-react";
import { Container } from "@/components/primitives/Container";
import { Marquee } from "@/components/primitives/Marquee";
import { Button } from "@/components/ui/button";
import { reviews, type Review } from "@/lib/reviews";

// Real brand logos (same assets as the customer brand strip) — matched by name.
const CUSTOMER_LOGOS: Record<string, string> = {
  alkalinegoddess: "/customers/alkalinegoddess.png",
  bluntcases: "/customers/bluntcases.png",
  curlwarehouse: "/customers/curlwarehouse.png",
  doonails: "/customers/doonails.svg",
  eternalperfumeoils: "/customers/eternalperfumeoils.png",
  hautesauce: "/customers/hautesauce.png",
  mateina: "/customers/mateina.png",
  modomu: "/customers/modomu.png",
  onebone: "/customers/onebone.png",
  rareform: "/customers/rareform.png",
  renuebyscience: "/customers/renuebyscience.svg",
  vegogarden: "/customers/vegogarden.png",
};
function logoFor(name: string): string | null {
  const key = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
  return CUSTOMER_LOGOS[key] ?? null;
}
function tidyName(name: string) {
  return name.replace(/[-_]/g, " ").split(" ").map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w)).join(" ");
}
function initials(name: string) {
  const parts = name.replace(/[^a-zA-Z0-9 ]/g, " ").trim().split(/\s+/).slice(0, 2);
  return (parts.map((p) => p.charAt(0).toUpperCase()).join("") || "★").slice(0, 2);
}
// soft pastel avatar tiles (bg + text), picked deterministically per brand
const AVATARS = [
  { bg: "#ede9fe", fg: "#7c3aed" },
  { bg: "#fef9c3", fg: "#a16207" },
  { bg: "#dbeafe", fg: "#1d4ed8" },
  { bg: "#dcfce7", fg: "#15803d" },
  { bg: "#ffe4e6", fg: "#be123c" },
  { bg: "#cffafe", fg: "#0e7490" },
];
function avatarFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATARS[h % AVATARS.length];
}

/* ------------------------- professional review card ------------------------ */
function ReviewMarqueeCard({ review }: { review: Review }) {
  const name = tidyName(review.name);
  const logo = logoFor(review.name);
  const av = avatarFor(review.name);
  return (
    <div className="flex h-[252px] w-[360px] shrink-0 flex-col overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_6px_28px_-14px_rgba(15,23,42,0.35)] transition-transform duration-300 hover:-translate-y-1">
      <div className="flex-1 px-6 pt-6">
        <Quote className="size-6 text-black/15" fill="currentColor" strokeWidth={0} aria-hidden />
        <p className="mt-3 overflow-hidden text-[14.5px] font-medium leading-relaxed text-neutral-700 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:5]">
          {review.content}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-black/[0.06] bg-neutral-50/70 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full text-[14px] font-bold" style={{ background: av.bg, color: av.fg }}>
            {initials(name)}
          </span>
          <div className="min-w-0">
            <div className="truncate text-[14px] font-bold tracking-tight text-neutral-900">{name}</div>
            <div className="truncate text-[12px] text-neutral-500">{review.date}</div>
          </div>
        </div>
        {logo && (
          // eslint-disable-next-line @next/next/no-img-element -- brand logo from /public
          <img src={logo} alt={name} className="h-7 w-auto max-w-[92px] shrink-0 object-contain" />
        )}
      </div>
    </div>
  );
}

/* ------------------------- compact card for the folder fan ------------------ */
function MiniCard({ review }: { review: Review }) {
  const name = tidyName(review.name);
  const av = avatarFor(review.name);
  return (
    <div className="w-full overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_12px_30px_-8px_rgba(0,0,0,0.5)]">
      <div className="px-3 pt-3">
        <Quote className="size-3 text-black/15" fill="currentColor" strokeWidth={0} aria-hidden />
        <p className="mt-1 overflow-hidden text-[10px] leading-snug text-neutral-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
          {review.content}
        </p>
      </div>
      <div className="mt-2 flex items-center gap-1.5 border-t border-black/[0.06] bg-neutral-50/70 px-3 py-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full text-[8px] font-bold" style={{ background: av.bg, color: av.fg }}>
          {initials(name)}
        </span>
        <div className="min-w-0">
          <div className="truncate text-[10px] font-bold text-neutral-900">{name}</div>
          <div className="truncate text-[8px] text-neutral-400">{review.date}</div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- one marquee row ----------------------------- */
function ReviewRow({ items, reverse, play }: { items: Review[]; reverse?: boolean; play: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <Marquee
        duration={52}
        reverse={reverse}
        paused={!play || hover}
        items={items.map((r) => (
          <ReviewMarqueeCard key={r.id} review={r} />
        ))}
      />
    </div>
  );
}

/* --------------------------------- section --------------------------------- */
export function WallOfLoveTeaser() {
  const stageRef = useRef<HTMLDivElement>(null);
  // toggles as the stage scrolls in/out of view → cards fan out, then pack back in
  const open = useInView(stageRef, { amount: 0.45 });

  const pool = reviews.filter((r) => r.content.length > 40).slice(0, 16);
  const rowA = pool.filter((_, i) => i % 2 === 0);
  const rowB = pool.filter((_, i) => i % 2 === 1);
  const fan = pool.slice(0, 5);

  return (
    <section className="overflow-hidden border-t border-black/5 bg-[#FAF9F6] py-20 md:py-28">
      <Container>
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.12em] text-primary md:text-base">Wall of Love</span>
          <h2 className="mt-3 font-serif font-normal tracking-tight text-black" style={{ fontSize: "clamp(1.875rem,4vw,2.75rem)", lineHeight: 1.1 }}>
            Loved by fast-growing brands
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base font-medium text-black/60">
            See how merchants use Clickpost Order Editing to automate customer service and recover cart revenue.
          </p>
        </div>
      </Container>

      {/* stage: folder (closed) → two moving rows (open) */}
      <div ref={stageRef} className="relative min-h-[560px]">
        {/* the two marquee rows */}
        <motion.div
          className="flex flex-col gap-5"
          initial={false}
          animate={{ opacity: open ? 1 : 0, y: open ? 0 : 28 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: open ? 0.35 : 0 }}
        >
          <ReviewRow items={rowA} play={open} />
          <ReviewRow items={rowB} reverse play={open} />
        </motion.div>

        {/* the folder holder + fanned cards (fades out once open) */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
          initial={false}
          animate={{ opacity: open ? 0 : 1, scale: open ? 0.86 : 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative h-[240px] w-[340px]">
            {/* folder back panel */}
            <div className="absolute bottom-0 left-0 h-[150px] w-full rounded-2xl border border-white/10 bg-gradient-to-b from-[#2b2b2b] to-[#0b0b0b] shadow-[0_40px_70px_-25px_rgba(0,0,0,0.65)]" />

            {/* fanned cards — fly up + out in sequence as it opens, pack back in on scroll up */}
            {fan.map((r, i) => {
              const off = i - 2;
              return (
                <motion.div
                  key={r.id}
                  className="absolute bottom-[70px] left-1/2 w-[150px] origin-bottom"
                  initial={false}
                  animate={
                    open
                      ? { x: off * 120, y: -240 - i * 24, rotate: off * 10, opacity: 0, scale: 1.06 }
                      : { x: off * 24, y: -22, rotate: off * 6, opacity: 1, scale: 1 }
                  }
                  transition={{ type: "spring", stiffness: 240, damping: 26, delay: (open ? i : fan.length - 1 - i) * 0.06 }}
                  style={{ marginLeft: -75 }}
                >
                  <MiniCard review={r} />
                </motion.div>
              );
            })}

            {/* folder front lip + label */}
            <div className="absolute bottom-0 left-0 flex h-[104px] w-full items-end justify-center rounded-2xl border border-white/15 bg-gradient-to-b from-[#343434] to-[#141414] pb-5 shadow-[inset_0_2px_10px_rgba(255,255,255,0.08)]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <div className="rounded-lg border border-white/10 bg-black px-4 py-2 text-[13px] font-medium tracking-wide text-white/90 backdrop-blur">
                Wall of Love
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Container>
        <div className="mt-12 flex justify-center">
          <Button asChild size="lg" className="cursor-pointer rounded-full bg-black px-8 py-6 text-sm font-semibold text-white shadow-md transition-all hover:bg-black/90 active:scale-95">
            <Link href="/reviews">See all 51 reviews in our Love Gallery →</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}

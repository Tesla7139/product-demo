"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Eyebrow + title + optional subtitle. Visual-first: keep copy short. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <motion.div
      variants={staggerContainer(0.08)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow && (
        <motion.span variants={fadeUp} className="text-eyebrow text-primary">
          {eyebrow}
        </motion.span>
      )}
      <motion.h2 variants={fadeUp} className="text-h2 max-w-2xl text-balance">
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          variants={fadeUp}
          className="max-w-xl text-base text-muted-foreground md:text-lg"
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}

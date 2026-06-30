"use client";

import * as React from "react";
import { motion, useInView, type Variants } from "framer-motion";

type TimelineContentProps = {
  children: React.ReactNode;
  animationNum: number;
  timelineRef: React.RefObject<HTMLElement | null>;
  customVariants: Variants;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  once?: boolean;
};

/**
 * Reveals children with a per-index (animationNum) staggered variant once
 * `timelineRef` scrolls into view. Used by the pricing section.
 */
export function TimelineContent({
  children,
  animationNum,
  timelineRef,
  customVariants,
  className,
  as = "div",
  once = true,
}: TimelineContentProps) {
  const isInView = useInView(timelineRef, { once, margin: "0px 0px -80px 0px" });
  const MotionComponent = (motion as unknown as Record<string, React.ElementType>)[as as string];

  return React.createElement(
    MotionComponent,
    {
      custom: animationNum,
      initial: "hidden",
      animate: isInView ? "visible" : "hidden",
      variants: customVariants,
      className,
    },
    children
  );
}

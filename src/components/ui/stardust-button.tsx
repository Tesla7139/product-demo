"use client";

import React from "react";

interface StardustButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  /** sm = compact nav pill, md = medium CTA, lg = large hero CTA (default) */
  size?: "sm" | "md" | "lg";
  /** false = dimmed inactive state (for tab navigation) */
  active?: boolean;
}

const SIZES = {
  sm: { fontSize: "13px", fontWeight: 600, padding: "11px 20px", borderRadius: "14px" },
  md: { fontSize: "18px", fontWeight: 500, padding: "22px 36px", borderRadius: "60px" },
  lg: { fontSize: "25px", fontWeight: 500, padding: "32px 45px", borderRadius: "100px" },
};

export function StardustButton({
  children = "Launching Soon",
  className = "",
  size = "lg",
  active = true,
  style: styleProp,
  ...props
}: StardustButtonProps) {
  const s = SIZES[size];

  const buttonStyle: React.CSSProperties = {
    outline: "none",
    cursor: "pointer",
    border: 0,
    position: "relative",
    borderRadius: s.borderRadius,
    backgroundColor: "#0a1929",
    transition: "all 0.2s ease",
    opacity: active ? 1 : 0.5,
    boxShadow: active
      ? `inset 0 0.3rem 0.9rem rgba(255,255,255,0.3),
         inset 0 -0.1rem 0.3rem rgba(0,0,0,0.7),
         inset 0 -0.4rem 0.9rem rgba(255,255,255,0.5),
         0 3rem 3rem rgba(0,0,0,0.3),
         0 1rem 1rem -0.6rem rgba(0,0,0,0.8)`
      : `inset 0 0.2rem 0.5rem rgba(255,255,255,0.1),
         inset 0 -0.1rem 0.3rem rgba(0,0,0,0.6),
         0 0.5rem 1rem rgba(0,0,0,0.3)`,
    ...styleProp,
  };

  const wrapStyle: React.CSSProperties = {
    fontSize: s.fontSize,
    fontWeight: s.fontWeight,
    color: active ? "rgba(129,216,255,0.9)" : "rgba(129,216,255,0.55)",
    padding: s.padding,
    borderRadius: "inherit",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    width: "100%",
  };

  const pStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: 0,
    transition: "all 0.2s ease",
    transform: "translateY(2%)",
    maskImage: "linear-gradient(to bottom, rgba(129,216,255,1) 40%, transparent)",
    width: "100%",
  };

  return (
    <button
      className={`pearl-button ${className}`}
      style={buttonStyle}
      {...props}
    >
      <div className="wrap" style={wrapStyle}>
        <p style={pStyle}>
          <span className="star-idle">✧</span>
          <span className="star-hover">✦</span>
          {children}
        </p>
      </div>
    </button>
  );
}

export function StardustButtonDemo() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-200 font-sans dark:bg-stone-900">
      <StardustButton onClick={() => alert("Coming soon!")}>
        Launching Soon
      </StardustButton>
    </div>
  );
}

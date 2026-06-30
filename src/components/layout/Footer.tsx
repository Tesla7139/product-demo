"use client";

import { useState } from "react";
import { Share2, Globe, Mail, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";
import { Container } from "@/components/primitives/Container";
import { footerColumns, site } from "@/lib/site";

// Compliance marks. These are official certification badges, so they must be
// your own licensed assets. Two ways to show them (either works):
//   1. Drop the single combined image at  public/badges/compliance.png  (the
//      image you have) — it renders as-is.
//   2. Or drop 4 separate files matching COMPLIANCE[].src below.
// Until a file exists, a clean labeled fallback chip is shown.
const COMPLIANCE = [
  { src: "/badges/soc2.svg", label: "AICPA SOC 2" },
  { src: "/badges/gdpr.svg", label: "GDPR" },
  { src: "/badges/iso-27001.svg", label: "ISO 27001" },
  { src: "/badges/iso-27701.svg", label: "ISO 27701" },
];

function ComplianceBadge({ src, label }: { src: string; label: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-muted-foreground">
        <ShieldCheck className="size-4 text-primary" />
        {label}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- official badge assets dropped in /public/badges
    <img
      src={src}
      alt={label}
      className="h-14 w-auto object-contain"
      onError={() => setErrored(true)}
    />
  );
}

export function Footer() {
  return (
    <footer id="footer" className="relative overflow-hidden border-t border-border bg-background-muted">
      <Container className="relative z-10 pt-16 pb-10 md:pt-20 md:pb-12">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-8">
          {/* Brand column */}
          <div className="col-span-2 flex flex-col gap-5 lg:col-span-2">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Self-service order editing, address validation, and post-purchase upsells for
              modern commerce.
            </p>
            <div className="flex items-center gap-3">
              {[Share2, Globe, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all hover:border-primary hover:text-primary"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Security & compliance — top-aligned column (lines up with the link columns) */}
          <div className="col-span-2 flex flex-col gap-3 lg:col-span-2">
            <h3 className="text-eyebrow text-muted-foreground">Security &amp; compliance</h3>
            <div className="grid w-fit grid-cols-2 gap-x-4 gap-y-3">
              {COMPLIANCE.map((b) => (
                <ComplianceBadge key={b.label} src={b.src} label={b.label} />
              ))}
            </div>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <h3 className="text-eyebrow text-muted-foreground">{col.title}</h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-foreground/80 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {/* year set at build via copyright */}
            <span> 2026 {site.name}. All rights reserved.</span>
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="transition-colors hover:text-foreground">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Privacy
            </a>
          </div>
        </div>
      </Container>

      {/* Giant faded brand wordmark */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative z-0 -mt-6 w-full select-none overflow-hidden"
      >
        <div
          className="translate-y-[6%] bg-gradient-to-b from-foreground/15 to-transparent bg-clip-text text-center font-extrabold leading-[0.78] tracking-tighter text-transparent"
          style={{ fontSize: "clamp(3rem, 15vw, 13rem)" }}
        >
          {site.name.toUpperCase()}
        </div>
      </div>
    </footer>
  );
}

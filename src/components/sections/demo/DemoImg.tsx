"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Product image that always renders something. If the store has no image, or the
 * remote URL fails to load (e.g. non-Shopify stores that fall back to the sample
 * catalog), it shows a neutral branded placeholder instead of an empty box — so
 * the demo never looks broken for any URL.
 */
export function DemoImg({
  src,
  alt = "",
  className,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
}) {
  const [ok, setOk] = useState(true);
  if (src && ok) {
    // eslint-disable-next-line @next/next/no-img-element -- remote product images from any store
    return <img src={src} alt={alt} className={className} onError={() => setOk(false)} />;
  }
  return (
    <div
      aria-hidden
      className={cn(
        "flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 text-neutral-400",
        className
      )}
    >
      <Package className="size-[36%] max-h-10 max-w-10" strokeWidth={1.5} />
    </div>
  );
}

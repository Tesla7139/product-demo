import { cn } from "@/lib/utils";

/** "Available on Shopify App Store" badge — links to the app listing. */
export function ShopifyAppStoreBadge({ href, className }: { href: string; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#1a1a1a] px-4 py-2.5 transition-transform hover:scale-[1.02] active:scale-[0.99]",
        className
      )}
      aria-label="Available on the Shopify App Store"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- local Shopify bag icon, inverted to white */}
      <img
        src="/shopify-icon-black.png"
        alt=""
        className="size-6 shrink-0 object-contain"
        style={{ filter: "invert(1)" }}
      />
      <span className="flex flex-col text-left leading-none">
        <span className="text-[9px] font-medium tracking-wide text-white/80">Available on</span>
        <span className="mt-0.5 text-[15px] font-bold leading-none text-white">Shopify App Store</span>
      </span>
    </a>
  );
}

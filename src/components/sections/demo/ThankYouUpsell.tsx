"use client";

import { Plus } from "lucide-react";
import type { DemoStore, DemoProduct } from "@/lib/site";
import { TooGoodToMiss } from "./TooGoodToMiss";

const money = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

function Img({ src, className }: { src?: string | null; className: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- remote product images from any store
    return <img src={src} alt="" className={className} onError={(e) => (e.currentTarget.style.visibility = "hidden")} />;
  }
  return <div className={`${className} bg-neutral-100`} aria-hidden />;
}

function Stepper() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-1.5 py-1">
      <span className="flex size-6 items-center justify-center rounded text-neutral-400">−</span>
      <span className="text-[13px] font-medium text-neutral-800">1</span>
      <span className="flex size-6 items-center justify-center rounded text-neutral-400">+</span>
    </div>
  );
}

/**
 * Order-status page upsell: an "Add More Items" carousel (qty + Add + Explore all)
 * plus a single discounted "Too good to miss!" featured deal.
 */
export function ThankYouUpsell({
  store,
  brand,
  products,
  onAdd,
  gridRef,
  addBtnRef,
}: {
  store: DemoStore;
  brand: string;
  products: DemoProduct[];
  onAdd: (p: DemoProduct, discounted: boolean) => void;
  gridRef?: React.RefObject<HTMLDivElement | null>;
  addBtnRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  const fmt = (n: number) => money(n, store.currency || "USD");
  const featured = products[products.length - 1] ?? products[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Add More Items */}
      <div ref={gridRef} className="rounded-xl border border-border p-4">
        <div className="mb-3 flex items-center gap-2">
          <Plus className="size-4 text-neutral-500" />
          <h4 className="text-[15px] font-bold text-neutral-900">Add More Items</h4>
        </div>
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
          {products.map((p, i) => (
            <div key={i} className="flex w-40 shrink-0 flex-col rounded-xl border border-border p-3">
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-neutral-50">
                <Img src={p.image} className="size-full object-cover" />
              </div>
              <div className="mt-2 line-clamp-2 text-[12.5px] font-medium" style={{ color: brand }}>{p.title}</div>
              <div className="mt-1 text-[13px] font-bold text-neutral-900">{fmt(p.price)}</div>
              <div className="mt-2"><Stepper /></div>
              <button
                ref={i === 0 ? addBtnRef : undefined}
                onClick={() => onAdd(p, false)}
                className="mt-2 w-full rounded-md py-2 text-[13px] font-semibold text-white transition-all hover:brightness-110"
                style={{ background: brand }}
              >
                Add
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => products[0] && onAdd(products[0], false)}
          className="mt-2 w-full rounded-md py-2.5 text-[13px] font-semibold text-white transition-all hover:brightness-110"
          style={{ background: brand }}
        >
          Explore all products
        </button>
      </div>

      {/* Too good to miss! */}
      {featured && <TooGoodToMiss store={store} brand={brand} product={featured} onAdd={(p) => onAdd(p, true)} />}
    </div>
  );
}

"use client";

/** Styled Shopify-thank-you "shipping map" + order-confirmed block (mock, no real map API). */
export function ThankYouMap({ city, region }: { city: string; region?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {/* faux Google map */}
      <div className="relative h-48 w-full overflow-hidden bg-[#e8edf0]">
        {/* green areas */}
        <div className="absolute -left-10 -top-10 h-44 w-56 rounded-[42%] bg-[#c7e7c9]" />
        <div className="absolute -bottom-8 -right-6 h-40 w-48 rounded-[46%] bg-[#d0e9d1]" />
        {/* roads */}
        <div className="absolute left-0 top-1/3 h-[3px] w-full -rotate-6 bg-white" />
        <div className="absolute left-1/4 top-0 h-full w-[3px] rotate-12 bg-white" />
        <div className="absolute left-[68%] top-0 h-full w-[2px] -rotate-6 bg-white/90" />
        <div className="absolute bottom-7 left-0 h-[2px] w-full rotate-3 bg-white/80" />
        {/* river */}
        <div className="absolute -left-[10%] top-[68%] h-[6px] w-[120%] -rotate-12 bg-[#a9d4f5]" />

        {/* pin */}
        <svg className="absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-full drop-shadow" width="28" height="28" viewBox="0 0 24 24" aria-hidden>
          <path fill="#EA4335" d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8z" />
          <circle cx="12" cy="10" r="3" fill="#A50E0E" />
        </svg>

        {/* shipping address card */}
        <div className="absolute left-1/2 top-5 -translate-x-1/2 rounded-lg bg-white px-6 py-3 text-center shadow-[0_6px_20px_-8px_rgba(0,0,0,0.35)]">
          <div className="text-[12px] text-neutral-500">Shipping address</div>
          <div className="text-[15px] font-bold text-neutral-900">
            {city}{region ? `, ${region}` : ""}
          </div>
        </div>

        {/* Google wordmark */}
        <div className="absolute bottom-1.5 left-2 select-none text-[13px] font-medium tracking-tight" aria-hidden>
          <span className="text-[#4285F4]">G</span>
          <span className="text-[#EA4335]">o</span>
          <span className="text-[#FBBC05]">o</span>
          <span className="text-[#4285F4]">g</span>
          <span className="text-[#34A853]">l</span>
          <span className="text-[#EA4335]">e</span>
        </div>
      </div>

      {/* order confirmed */}
      <div className="p-4">
        <h4 className="text-[16px] font-bold text-neutral-900">Your order is confirmed</h4>
        <p className="mt-1 text-[13.5px] text-neutral-500">You&apos;ll receive a confirmation email soon</p>
        <button className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-[#5a31f4] px-5 py-2.5 text-[13.5px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.99]">
          Download to track with
          <span className="font-extrabold lowercase">shop</span>
        </button>
      </div>
    </div>
  );
}

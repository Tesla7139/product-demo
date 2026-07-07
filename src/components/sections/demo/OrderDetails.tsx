"use client";

import { CreditCard } from "lucide-react";
import type { Addr } from "./DemoMock";

const STATE_ABBR: Record<string, string> = {
  California: "CA", "New York": "NY", Texas: "TX", Florida: "FL", Washington: "WA",
  Illinois: "IL", Massachusetts: "MA", Georgia: "GA", Colorado: "CO", Oregon: "OR",
  Arizona: "AZ", Nevada: "NV", Pennsylvania: "PA", Ohio: "OH", Michigan: "MI",
};
const region = (s: string) => STATE_ABBR[s] ?? s;

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[14px] font-bold text-neutral-900">{label}</div>
      <div className="mt-1.5 space-y-0.5 text-[13.5px] leading-relaxed text-neutral-600">{children}</div>
    </div>
  );
}

/** Shopify-style "Order details" summary (contact, payment, addresses, shipping method). */
export function OrderDetails({
  addr,
  email,
  phone,
  country,
  amount,
}: {
  addr: Addr;
  email: string;
  phone: string;
  country: string;
  amount: string;
}) {
  const lines = [
    `${addr.first} ${addr.last}`,
    addr.line1,
    `${addr.city} ${region(addr.state)} ${addr.zip}`,
    country,
    phone,
  ];

  return (
    <div className="rounded-xl border border-border p-5">
      <h3 className="text-[17px] font-bold text-neutral-900">Order details</h3>
      <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
        <Block label="Contact information">
          <div>{email}</div>
        </Block>
        <Block label="Payment method">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-9 shrink-0 items-center justify-center rounded border border-border bg-neutral-50">
              <CreditCard className="size-4 text-neutral-400" />
            </span>
            <span className="text-neutral-700">•••• 1 · {amount}</span>
          </div>
        </Block>
        <Block label="Shipping address">
          {lines.map((l, i) => <div key={i}>{l}</div>)}
        </Block>
        <Block label="Billing address">
          {lines.map((l, i) => <div key={i}>{l}</div>)}
        </Block>
        <Block label="Shipping method">
          <div>Standard</div>
        </Block>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Logo } from "./Logo";
import { mainNav } from "@/lib/site";
import { cn } from "@/lib/utils";

const SHOPIFY_LISTING = "https://apps.shopify.com/clickpost-order-edit-cancel";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // links to the hero demo (#demo) also shake the store-URL input to prompt a link
  const fireDemoShake = (href: string) => {
    if (href.endsWith("#demo")) window.dispatchEvent(new CustomEvent("demo:shake"));
  };

  return (
    <motion.header className="pointer-events-none sticky top-10 z-40 w-full transition-all duration-300">
      <div className="pointer-events-auto mx-auto flex w-full max-w-[1240px] justify-center px-4 sm:px-6">
        <div
          className={cn(
            "w-fit rounded-full border bg-white/95 px-3 shadow-md backdrop-blur-xl transition-all duration-300 sm:px-4 lg:w-[900px]",
            scrolled
              ? "border-border py-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
              : "border-border/60 py-3.5"
          )}
        >
          <nav className="flex w-full items-center gap-5" aria-label="Primary">
            <div className="pl-1.5">
              <Logo className="h-4" />
            </div>

            {/* Desktop links */}
            <div
              className="hidden items-center gap-1 lg:ml-auto lg:flex"
              onMouseLeave={() => setOpenGroup(null)}
            >
              {mainNav.map((item) =>
                item.items ? (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setOpenGroup(item.label)}
                  >
                    <button
                      className="flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-[0.85rem] font-medium text-foreground/85 transition-colors hover:text-foreground"
                      aria-expanded={openGroup === item.label}
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform duration-200",
                          openGroup === item.label && "rotate-180"
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {openGroup === item.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute left-0 top-full w-64 pt-3"
                        >
                          <div className="overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-soft-xl">
                            {item.items.map((sub) => (
                              <a
                                key={sub.label}
                                href={sub.href}
                                className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-background-muted"
                              >
                                <div className="text-sm font-medium text-foreground">
                                  {sub.label}
                                </div>
                                {sub.desc && (
                                  <div className="text-xs text-muted-foreground">{sub.desc}</div>
                                )}
                              </a>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => fireDemoShake(item.href)}
                    className="whitespace-nowrap rounded-full px-3 py-2 text-[0.85rem] font-medium text-foreground/85 transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </a>
                )
              )}
            </div>

            {/* Right actions */}
            <div className="hidden items-center gap-2.5 lg:flex">
              <Link
                href="/#contact"
                className="whitespace-nowrap rounded-full bg-foreground px-5 py-2.5 text-[0.85rem] font-semibold text-background transition-all hover:bg-foreground/90 active:scale-[0.98]"
              >
                Book a free demo
              </Link>
              <a
                href={SHOPIFY_LISTING}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View on the Shopify App Store"
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#efe9dd] transition-transform hover:scale-105"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- Shopify app-store icon */}
                <img src="/shopify-icon-black.png" alt="Shopify App Store" className="size-5 object-contain" />
              </a>
            </div>

            {/* Mobile trigger */}
            <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
              <Dialog.Trigger asChild>
                <button
                  className="ml-auto rounded-full p-2 text-foreground transition-colors hover:bg-foreground/[0.05] lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="size-6" />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm data-[state=open]:animate-[fadeIn_0.2s_ease]" />
                <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-[88%] max-w-sm flex-col gap-1 overflow-y-auto bg-background p-6 shadow-soft-xl data-[state=open]:animate-[slideIn_0.3s_cubic-bezier(0.16,1,0.3,1)]">
                  <div className="mb-4 flex items-center justify-between">
                    <Logo />
                    <Dialog.Title className="sr-only">Menu</Dialog.Title>
                    <Dialog.Close
                      aria-label="Close menu"
                      className="rounded-full p-2 text-foreground transition-colors hover:bg-foreground/[0.05]"
                    >
                      <X className="size-6" />
                    </Dialog.Close>
                  </div>
                  <div className="flex flex-col gap-1 py-2">
                    {mainNav.map((item) => (
                      <div key={item.label}>
                        <a
                          href={item.href}
                          onClick={() => { setMobileOpen(false); fireDemoShake(item.href); }}
                          className="block rounded-md py-2 text-[1.05rem] font-medium text-foreground"
                        >
                          {item.label}
                        </a>
                        {item.items && (
                          <div className="ml-3 flex flex-col gap-1 border-l border-border pl-3">
                            {item.items.map((sub) => (
                              <a
                                key={sub.label}
                                href={sub.href}
                                onClick={() => setMobileOpen(false)}
                                className="rounded-md py-1.5 text-sm text-muted-foreground"
                              >
                                {sub.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/#contact"
                    onClick={() => setMobileOpen(false)}
                    className="mt-3 rounded-full bg-foreground py-3 text-center font-semibold text-background"
                  >
                    Book a free demo
                  </Link>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </nav>
        </div>
      </div>
    </motion.header>
  );
}

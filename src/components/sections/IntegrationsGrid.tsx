"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { Container } from "@/components/primitives/Container";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { integrations } from "@/lib/site";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "iPaaS", "ERP", "3PL", "WMS", "Shipping", "Tech"];

export function IntegrationsGrid({ withHeading = true }: { withHeading?: boolean }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIntegrations = integrations.filter((item) => {
    const matchesCategory =
      activeCategory === "All" ||
      item.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="bg-[#121314] py-16 text-white md:py-24 border-t border-b border-white/5">
      <Container>
        {withHeading && (
          <div className="mb-12">
            <SectionHeading
              eyebrow="Integrations"
              title="Plugs into your stack"
              subtitle="Connect checkout, fulfillment, and marketing in a few clicks."
            />
          </div>
        )}

        {/* Filter bar: tabs and search */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-white/10 pb-6">
          {/* Categories */}
          <div className="flex flex-wrap gap-2.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer",
                  activeCategory === cat
                    ? "bg-white text-black font-bold shadow-sm"
                    : "border border-white/15 bg-transparent text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-white/15 bg-white/5 py-1.5 pl-10 pr-4 text-xs text-white placeholder-white/40 outline-none transition-colors focus:border-white/30 focus:bg-white/10"
            />
          </div>
        </div>

        {/* Grid of integrations */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredIntegrations.map(({ name, category, desc }, index) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: Math.min(index * 0.04, 0.2),
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative bg-[#2D2D2D]/80 transition-all duration-300 hover:scale-[1.02] hover:bg-primary"
              style={{
                clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%)",
                padding: "1.2px", // Creates a crisp border border
              }}
            >
              {/* Inner White Card */}
              <div
                className="relative flex h-full flex-col bg-white p-6 pb-8 text-black"
                style={{
                  clipPath: "polygon(0 0, calc(100% - 23px) 0, 100% 23px, 100% 100%, 0 100%)",
                }}
              >
                {/* Category Indicator Area */}
                <div className="mb-4 border-b border-black/10 pb-2.5">
                  <span className="text-[9px] font-extrabold tracking-widest text-black/50 uppercase">
                    {category}
                  </span>
                </div>

                {/* Text Contents */}
                <div className="flex-1 pr-6 flex flex-col gap-2">
                  <h3 className="font-serif text-2xl font-bold tracking-tight text-black">
                    {name}
                  </h3>
                  <p className="text-xs text-black/70 font-medium leading-relaxed mt-1">
                    {desc}
                  </p>
                </div>

                {/* Vertical row of Binder Dots on the right edge */}
                <div className="absolute right-3.5 top-4 bottom-4 flex flex-col justify-between items-center w-2 pointer-events-none">
                  {/* Top single dot */}
                  <div className="size-1.5 rounded-full bg-black/85" />
                  
                  {/* Mid group 1 */}
                  <div className="flex flex-col gap-1">
                    <div className="size-1.5 rounded-full bg-black/85" />
                    <div className="size-1.5 rounded-full bg-black/85" />
                  </div>
                  
                  {/* Mid group 2 */}
                  <div className="flex flex-col gap-1">
                    <div className="size-1.5 rounded-full bg-black/85" />
                    <div className="size-1.5 rounded-full bg-black/85" />
                  </div>
                  
                  {/* Bottom single dot */}
                  <div className="size-1.5 rounded-full bg-black/85" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="py-12 text-center text-white/50 text-sm">
            No integrations match your search.
          </div>
        )}
      </Container>
    </section>
  );
}

"use client";

import { Container } from "@/components/primitives/Container";
import { GuidedEditor } from "@/components/sections/demo/GuidedEditor";
import { mockStore } from "@/lib/site";

export function ProductTourSection() {
  return (
    <section id="product-tour" className="py-20 md:py-28">
      <Container>
        {/* section header */}
        <div className="mb-14 text-center">
          <p className="text-eyebrow mb-3 text-primary">Interactive demo</p>
          <h2
            className="font-sans font-extrabold uppercase tracking-tight text-foreground"
            style={{ fontSize: "clamp(2rem, 3.6vw, 3rem)", lineHeight: 0.98 }}
          >
            See every feature live
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Pick any product from the sidebar and interact with a live demo — no sign-up required.
          </p>
        </div>

        <GuidedEditor store={mockStore} />
      </Container>
    </section>
  );
}

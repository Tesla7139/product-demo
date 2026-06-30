"use client";

import { Container } from "@/components/primitives/Container";
import { SectionHeading } from "@/components/primitives/SectionHeading";
import { RevealGroup, RevealChild } from "@/components/primitives/AnimatedReveal";
import { ArrowRight } from "lucide-react";
import { segments } from "@/lib/site";

export function AudienceSegments() {
  return (
    <section id="segments" className="py-20 md:py-28">
      <Container>
        <SectionHeading eyebrow="Who it's for" title="Built for the way you sell" />
        <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3">
          {segments.map(({ icon: Icon, title, blurb }) => (
            <RevealChild key={title}>
              <article className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-soft-xl">
                <div className="flex size-12 items-center justify-center rounded-xl bg-accent-soft text-primary">
                  <Icon className="size-6" />
                </div>
                <h3 className="text-h3">{title}</h3>
                <p className="flex-1 text-sm text-muted-foreground">{blurb}</p>
                <a
                  href="#features"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
                >
                  Learn more
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </a>
              </article>
            </RevealChild>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

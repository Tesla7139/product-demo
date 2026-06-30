import { Hero } from "@/components/sections/Hero";
import { DemoShowcase } from "@/components/sections/DemoShowcase";
import { ProductTourSection } from "@/components/sections/ProductTourSection";
import { MetricsStrip } from "@/components/sections/MetricsStrip";
import { FeatureShowcase } from "@/components/sections/FeatureShowcase";
import { GlobalReach } from "@/components/sections/GlobalReach";
import { AudienceSegments } from "@/components/sections/AudienceSegments";
import { WallOfLoveTeaser } from "@/components/sections/WallOfLoveTeaser";
import { Pricing } from "@/components/sections/Pricing";
import { ResourceCallout } from "@/components/sections/ResourceCallout";
import { ContactForm } from "@/components/sections/ContactForm";
import { FAQ } from "@/components/sections/FAQ";

export default function Home() {
  return (
    <>
      <Hero />
      <DemoShowcase />
      <ProductTourSection />
      <MetricsStrip />
      <FeatureShowcase />
      <GlobalReach />
      <AudienceSegments />
      <WallOfLoveTeaser />
      <Pricing />
      <ResourceCallout />
      <ContactForm />
      <FAQ />
    </>
  );
}

import { Hero } from "@/components/sections/Hero";

// /product-demo/<brand> — renders the hero, which reads the brand from the path
// on mount and auto-opens that store's demo (see Hero.tsx).
export default function ProductDemoPage() {
  return <Hero />;
}

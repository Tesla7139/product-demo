/**
 * Central site configuration: nav, footer, integrations, and the MOCK demo data.
 * All copy here is original (written for CP: Order Editing & Upsell) — nothing
 * is lifted from the reference site or the Shopify listing verbatim.
 */
import type { LucideIcon } from "lucide-react";
import {
  Pencil,
  MapPin,
  XCircle,
  TrendingUp,
  RefreshCw,
  SlidersHorizontal,
  Store,
  Boxes,
  Truck,
  Users,
  GitBranch,
  Mail,
  Package,
} from "lucide-react";
import { reviews } from "./reviews";

/** Exact review text from the Shopify App Store export (reviews.ts), by store name. */
function reviewText(storeName: string): string | null {
  const r = reviews.find((rv) => rv.name === storeName);
  return r ? r.content.replace(/\s*\n\s*/g, " ").trim() : null;
}

export const site = {
  name: "Clickpost", // brand wordmark (logo slot left intentionally empty in UI)
  product: "Order Editing & Upsell",
  tagline: "Let shoppers fix their own orders.",
  phone: "+1 (000) 000-0000", // TODO: replace with real number
  email: "hello@clickpost.ai", // TODO: confirm
};

// ---- Navigation. Flat links with a single dropdown (matches reference). ----
export type NavLink = { label: string; href: string; desc?: string };
export type NavItem = { label: string; href: string; items?: NavLink[] };

export const mainNav: NavItem[] = [
  { label: "Product Tour", href: "/#demo" },
  {
    label: "Customer Love",
    href: "/reviews",
    items: [
      { label: "Love Gallery", href: "/reviews", desc: "51 five-star merchant reviews" },
    ],
  },
];

// ---- Integrations (shown on the dedicated /integrations page) ----
export type Integration = {
  name: string;
  icon: LucideIcon;
  category: string;
  desc: string;
};

export const integrations: Integration[] = [
  {
    name: "Klaviyo",
    icon: Mail,
    category: "Tech",
    desc: "Klaviyo and Order Editing sync customer events for personalized email automation.",
  },
  {
    name: "Gorgias",
    icon: Users,
    category: "Tech",
    desc: "Gorgias integration displays order editing info directly in your support tickets.",
  },
  {
    name: "Zendesk",
    icon: Users,
    category: "Tech",
    desc: "Zendesk integration provides order context within your support platform.",
  },
  {
    name: "AfterSell",
    icon: TrendingUp,
    category: "Tech",
    desc: "AfterSell and Order Editing combine post-purchase upsells with order modifications.",
  },
  {
    name: "AfterShip",
    icon: Truck,
    category: "Tech",
    desc: "AfterShip syncs tracking updates and flags deliveries with issues.",
  },
  {
    name: "Loop Returns",
    icon: RefreshCw,
    category: "Tech",
    desc: "Loop Returns integration lets customers exchange items directly.",
  },
  {
    name: "Rebuy",
    icon: Store,
    category: "Tech",
    desc: "Rebuy powers smart product recommendations in the post-purchase editor.",
  },
  {
    name: "Recharge",
    icon: SlidersHorizontal,
    category: "Tech",
    desc: "Recharge allows customers to edit subscription orders seamlessly.",
  },
  {
    name: "SAP ERP",
    icon: SlidersHorizontal,
    category: "ERP",
    desc: "SAP integration pushes order corrections to your enterprise resource planning system.",
  },
  {
    name: "ShipStation",
    icon: Truck,
    category: "Shipping",
    desc: "ShipStation syncs fulfillment statuses and shipping label adjustments.",
  },
  {
    name: "Shopify Flow",
    icon: GitBranch,
    category: "iPaaS",
    desc: "Trigger workflows automatically when an order is edited or cancelled.",
  },
  {
    name: "Unicommerce",
    icon: Truck,
    category: "WMS",
    desc: "Keep the warehouse in sync so it always ships the corrected order.",
  },
  {
    name: "Easycom",
    icon: Package,
    category: "3PL",
    desc: "Push edited orders straight into your fulfillment pipeline.",
  },
];

// Names only, for any compact contexts
export const integrationNames: string[] = integrations.map((i) => i.name);

// ---- Customer logos (social proof, shown in the hero marquee) ----
// HOW TO ADD REAL LOGOS:
//   1. Drop each logo file into  public/customers/  (SVG preferred; PNG ok).
//   2. Add an entry below: { src: "/customers/<filename>", name: "<Brand>" }.
// Until at least one entry exists, blank placeholder marks are shown instead.
export type CustomerLogo = {
  src?: string; // logo image; when omitted the brand renders as a styled wordmark
  name: string;
  reviewer: string;
  role: string;
  review: string | null; // tap-to-open review (null until the real one is supplied)
  date?: string; // when the review was left (Shopify App Store export)
  badge?: string; // optional pill under the logo, e.g. "9-figure brand"
};

// International brands featured in the hero ribbon — each with a real review
// from the Shopify App Store export (reviews.csv).
export const customerLogos: CustomerLogo[] = [
  {
    src: "/customers/mateina.png",
    name: "Mateina",
    reviewer: "Mateina Team",
    role: "E-commerce",
    review:
      "One of the best order editing apps available that actually works! I've tested about a dozen, and this was by far one of the best. Amazing team and support.",
    date: "Mar 12, 2024",
  },
  {
    src: "/customers/renuebyscience.svg",
    name: "Renue By Science",
    reviewer: "Renue By Science Team",
    role: "E-commerce",
    review:
      "The team at Clickpost are exceptional developers and great people. They listen to feedback and have built genuinely useful tools for Shopify stores.",
    date: "Jan 8, 2024",
  },
  {
    src: "/customers/curlwarehouse.png",
    name: "Curl Warehouse",
    reviewer: "Curl Warehouse Team",
    role: "E-commerce",
    review:
      "This has reduced the number of emails we receive to update orders. It's easy to use and set up, and the developers have been very receptive to changes.",
    date: "Nov 21, 2023",
  },
  {
    src: "/customers/doonails.svg",
    name: "Doonails",
    reviewer: "Doonails Team",
    role: "E-commerce",
    review: "Really helped us quickly to fix all issues.",
    date: "Feb 3, 2024",
  },
  {
    src: "/customers/modomu.png",
    name: "Modomu",
    reviewer: "Modomu Team",
    role: "E-commerce",
    review:
      "Really happy with Clickpost so far. We added it mainly for order edits but ended up using the upsell part too, which brought in a bit of extra revenue.",
    date: "Apr 5, 2024",
  },
  {
    src: "/customers/hautesauce.png",
    name: "Haute Sauce",
    reviewer: "Haute Sauce Team",
    role: "E-commerce",
    review:
      "Installed Clickpost recently and it works great. Customers can edit their orders and even add extra items, which is a nice bonus.",
    date: "May 17, 2024",
  },
  // More brands from the Shopify App Store export. Real brand logos (transparent
  // PNGs pulled from each store) render like the others; V-Guard has no
  // transparent logo available so it falls back to a styled wordmark. Review text
  // is the EXACT content from reviews.ts (pulled by store name, no rewording).
  {
    src: "/customers/westside.png",
    name: "Westside Global",
    reviewer: "Westside Global Team",
    role: "E-commerce",
    review: reviewText("Westside Global"),
    date: "Feb 13, 2026",
  },
  {
    src: "/customers/myborosil.png",
    name: "MyBorosil",
    reviewer: "MyBorosil Team",
    role: "E-commerce",
    review: reviewText("MyBorosil"),
    date: "Oct 14, 2025",
  },
  {
    src: "/customers/wellbeingnutrition.png",
    name: "Wellbeing Nutrition",
    reviewer: "Wellbeing Nutrition Team",
    role: "E-commerce",
    review: reviewText("Wellbeing Nutrition"),
    date: "Sep 17, 2025",
  },
  {
    src: "/customers/marsbyghc.png",
    name: "Mars By GHC",
    reviewer: "Mars By GHC Team",
    role: "E-commerce",
    review: reviewText("Mars By GHC"),
    date: "Jan 8, 2026",
  },
  {
    src: "/customers/amrutam.png",
    name: "Amrutam",
    reviewer: "Amrutam Team",
    role: "E-commerce",
    review: reviewText("Amrutam"),
    date: "Feb 4, 2026",
  },
  {
    name: "V-Guard Industries Limited",
    reviewer: "V-Guard Industries Team",
    role: "E-commerce",
    review: reviewText("V-Guard Industries Limited"),
    date: "Jun 2, 2026",
  },
];

// number of blank placeholder marks to show while `customerLogos` is empty
export const customerLogoCount = 8;

// ---- Feature showcase rows (mapped to the product's own screenshots) ----
export type Feature = {
  eyebrow: string;
  title: string;
  blurb: string;
  bullets: string[];
  icon: LucideIcon;
};

export const features: Feature[] = [
  {
    eyebrow: "Editing",
    title: "Self-service order edits",
    blurb: "Shoppers fix orders on the thank-you and order-status page — no ticket needed.",
    bullets: ["Swap items & variants", "Adjust quantities", "Update contact details"],
    icon: Pencil,
  },
  {
    eyebrow: "Address",
    title: "Address validation, built in",
    blurb: "Catch undeliverable addresses before fulfillment with Maps-powered checks.",
    bullets: ["Live address suggestions", "Flag risky deliveries", "Fewer failed shipments"],
    icon: MapPin,
  },
  {
    eyebrow: "Cancellations",
    title: "Instant cancellations & refunds",
    blurb: "Let customers cancel within your window — refunds and store credit run automatically.",
    bullets: ["Automated refunds", "Store-credit option", "Configurable windows"],
    icon: XCircle,
  },
  {
    eyebrow: "Upsell",
    title: "Post-purchase upsells",
    blurb: "Recommend the right add-on right after checkout and lift average order value.",
    bullets: ["One-tap add-on", "Smart recommendations", "No re-checkout friction"],
    icon: TrendingUp,
  },
  {
    eyebrow: "Sync",
    title: "Stays in sync with fulfillment",
    blurb: "Every edit syncs to your 3PL / WMS so the warehouse always ships the right thing.",
    bullets: ["3PL / WMS sync", "Real-time updates", "No double handling"],
    icon: RefreshCw,
  },
  {
    eyebrow: "Control",
    title: "Full control & audit trail",
    blurb: "Set editing windows, bulk-manage orders, and review a complete log of every change.",
    bullets: ["Editing windows", "Bulk editing", "Complete edit log"],
    icon: SlidersHorizontal,
  },
];

// ---- "Who we serve" segments ----
export const segments = [
  {
    icon: Store,
    title: "D2C & Shopify brands",
    blurb: "Give shoppers control and cut your support load from day one.",
  },
  {
    icon: Boxes,
    title: "High-volume merchants",
    blurb: "Automate thousands of edits a month without growing the support team.",
  },
  {
    icon: Truck,
    title: "Brands using 3PL / WMS",
    blurb: "Edits flow straight to fulfillment, so the warehouse ships what was ordered.",
  },
];

// ---- Metrics (placeholder/illustrative figures) ----
export const metrics = [
  { value: 42, suffix: "%", label: "Fewer support tickets", prefix: "" },
  { value: 18, suffix: "%", label: "Higher average order value", prefix: "+" },
  { value: 5.0, suffix: "★", label: "Rated on Shopify (51 reviews)", prefix: "", decimals: 1 },
];

// ---- Pricing tiers ----
export const pricing = [
  {
    name: "Starter",
    price: "Free",
    detail: "0–500 orders/mo",
    features: ["25 free edits / month", "Then $1 / edit", "Core editing & cancellations"],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$49",
    detail: "per month · 500–5,000 orders/mo",
    features: ["Unlimited edits", "Post-purchase upsells", "Address validation"],
    cta: "Start 14-day trial",
    highlighted: true,
  },
  {
    name: "Scale",
    price: "$129",
    detail: "per month · 5,000–20,000 orders/mo",
    features: ["Everything in Growth", "Dedicated account manager", "Priority support"],
    cta: "Start 14-day trial",
    highlighted: false,
  },
];

// ---- FAQ (original copy) ----
export const faqs = [
  {
    q: "How fast can I go live?",
    a: "Install from the Shopify App Store, enable the app embed, and set your editing window. Most stores are live in minutes — no developer required.",
  },
  {
    q: "What can shoppers edit themselves?",
    a: "Items, variants, quantities, shipping address, and contact details — plus self-service cancellations with automated refunds or store credit, all within the window you define.",
  },
  {
    q: "Does it work with my 3PL or WMS?",
    a: "Yes. Edits sync to your fulfillment stack in real time so the warehouse always ships the correct, updated order.",
  },
  {
    q: "How do post-purchase upsells work?",
    a: "After checkout, the app surfaces a relevant add-on that the shopper can accept in one tap — no re-entering payment — which lifts average order value.",
  },
  {
    q: "How much does it cost?",
    a: "Start free for up to 500 orders/month. Paid plans begin at $49/month with a 14-day free trial. See the pricing section above for details.",
  },
];

// ---- Footer ----
export const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Order Editing", href: "#features" },
      { label: "Address Validation", href: "#features" },
      { label: "Cancellations", href: "#features" },
      { label: "Upsells", href: "#features" },
      { label: "EU Product Withdrawal", href: "#features" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Reduce tickets", href: "#metrics" },
      { label: "Recover revenue", href: "#metrics" },
      { label: "Grow AOV", href: "#metrics" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Live demo", href: "/#demo" },
      { label: "Integrations", href: "/integrations" },
      { label: "Analytics", href: "/analytics" },
      { label: "Pricing", href: "/#pricing" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "#contact" },
      { label: "Careers", href: "#" },
    ],
  },
];

// ============================================================
//  MOCK DEMO DATA  — used by LiveDemoGenerator (build mode: mock)
//  Single data seam: useDemoData() currently returns this; a real
//  /api/demo (Shopify products.json + OG branding) drops in later.
// ============================================================
export type DemoProduct = {
  id: string;
  title: string;
  variant: string;
  price: number;
  qty: number;
  image?: string | null;
  variants?: { title: string; price: number }[];
};

export type DemoStore = {
  brandName: string;
  brandColor: string;
  logo?: string | null; // absolute URL to the store's logo/favicon (when personalized)
  currency?: string | null; // ISO 4217 code, e.g. "INR", "USD", "GBP"
  products: DemoProduct[];
};

// Category-neutral sample catalog — used when a store's real products can't be
// read (non-Shopify sites, blocked endpoints). Generic names + variants read as a
// plausible sample for any vertical (wellness, beauty, food, apparel) instead of
// showing wrong-category apparel for, say, a supplements brand.
export const mockStore: DemoStore = {
  brandName: "Northwind Goods",
  brandColor: "#1f7a5a",
  currency: "USD",
  products: [
    { id: "p1", title: "Signature Bundle", variant: "Full size", price: 89, qty: 1 },
    { id: "p2", title: "Best Seller", variant: "Original", price: 64, qty: 1 },
    { id: "p3", title: "Starter Kit", variant: "3-piece", price: 128, qty: 1 },
    { id: "p4", title: "Refill Pack", variant: "2-month", price: 72, qty: 1 },
    { id: "p5", title: "Travel Size", variant: "Mini", price: 28, qty: 1 },
    { id: "p6", title: "Gift Set", variant: "Deluxe", price: 95, qty: 1 },
  ],
};

// Globe arc events ("orders saved" narrative) — placeholder data
export const globeEvents = [
  { label: "Address corrected", city: "Austin, TX" },
  { label: "Order edited", city: "Lisbon" },
  { label: "Upsell accepted", city: "Berlin" },
  { label: "Cancellation avoided", city: "Mumbai" },
  { label: "Variant swapped", city: "Toronto" },
  { label: "Address corrected", city: "Sydney" },
];

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const SQRT_5000 = Math.sqrt(5000);

type Review = {
  name: string; // brand name (for monogram + alt)
  review: string;
  date: string;
  country: string;
  figure: string; // "7-figure" | "8-figure"
  src?: string; // brand logo (falls back to a monogram)
};

const RAW: Review[] = [
  { name: "Mateina", figure: "8-figure", date: "Mar 12, 2024", country: "United States", src: "/customers/mateina.png",
    review: "One of the best order editing apps available that actually works! I've tested about a dozen, and this was by far one of the best. Amazing team and support." },
  { name: "Renue By Science", figure: "8-figure", date: "Jan 8, 2024", country: "United States", src: "/customers/renuebyscience.svg",
    review: "The team at Clickpost are exceptional developers and great people. They listen to feedback and have built genuinely useful tools for Shopify stores." },
  { name: "Curl Warehouse", figure: "7-figure", date: "Nov 21, 2023", country: "Canada", src: "/customers/curlwarehouse.png",
    review: "This has reduced the number of emails we receive to update orders. It's easy to use and set up, and the developers have been very receptive to changes." },
  { name: "Doonails", figure: "7-figure", date: "Feb 3, 2024", country: "Germany", src: "/customers/doonails.svg",
    review: "Really helped us quickly to fix all issues." },
  { name: "Modomu", figure: "8-figure", date: "Apr 5, 2024", country: "United Kingdom", src: "/customers/modomu.png",
    review: "Really happy with Clickpost so far. We added it mainly for order edits but ended up using the upsell part too, which brought in a bit of extra revenue." },
  { name: "Haute Sauce", figure: "7-figure", date: "May 17, 2024", country: "United States", src: "/customers/hautesauce.png",
    review: "Installed Clickpost recently and it works great. Customers can edit their orders and even add extra items, which is a nice bonus." },
  { name: "Northbound", figure: "7-figure", date: "Jun 2, 2024", country: "United States",
    review: "Support tickets dropped almost overnight — customers just fix their own orders now." },
  { name: "Ridgeline", figure: "8-figure", date: "Jun 18, 2024", country: "United Kingdom",
    review: "The thank-you page upsell paid for the app in the first week. Easy win for us." },
  { name: "Coastal Co", figure: "7-figure", date: "Jul 9, 2024", country: "Australia",
    review: "Address validation alone saved us hundreds in reshipping costs every month." },
  { name: "Loomly", figure: "7-figure", date: "Jul 22, 2024", country: "Canada",
    review: "Setup took ten minutes and it just works. Exactly what we needed." },
  { name: "Verdant", figure: "8-figure", date: "Aug 4, 2024", country: "United States",
    review: "Our CX team finally has time to focus on real issues, not manual order edits." },
  { name: "Payload", figure: "7-figure", date: "Aug 19, 2024", country: "United Kingdom",
    review: "Customers love adding items after checkout — our AOV is noticeably up." },
  { name: "Aurora Goods", figure: "8-figure", date: "Sep 1, 2024", country: "Australia",
    review: "Best order editing app we've tried, and the support is genuinely incredible." },
  { name: "Kite & Co", figure: "7-figure", date: "Sep 15, 2024", country: "Germany",
    review: "The EU withdrawal flow keeps us compliant with zero manual work." },
  { name: "Harbor", figure: "7-figure", date: "Oct 3, 2024", country: "United States",
    review: "Refunds and cancellations are self-serve now. It's a huge time saver." },
  { name: "Meridian", figure: "8-figure", date: "Oct 20, 2024", country: "Canada",
    review: "It quietly makes us money and saves us time. Couldn't ask for more." },
];

const REVIEWS = RAW.map((r, i) => ({ ...r, tempId: i }));

interface TestimonialCardProps {
  position: number;
  review: (typeof REVIEWS)[number];
  handleMove: (steps: number) => void;
  cardSize: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ position, review, handleMove, cardSize }) => {
  const isCenter = position === 0;

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer border-2 p-8 transition-all duration-[350ms] ease-in-out",
        isCenter
          ? "z-10 border-primary bg-primary text-primary-foreground"
          : "z-0 border-border bg-card text-card-foreground hover:border-primary/50"
      )}
      style={{
        width: cardSize,
        height: cardSize,
        clipPath: "polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)",
        transform: `
          translate(-50%, -50%)
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        boxShadow: isCenter ? "0px 8px 0px 4px var(--border)" : "0px 0px 0px 0px transparent",
      }}
    >
      <span
        className="absolute block origin-top-right rotate-45 bg-border"
        style={{ right: -2, top: 48, width: SQRT_5000, height: 2 }}
      />

      {/* brand logo (or a monogram) + 5-star rating */}
      <div className="mb-4 flex items-center justify-between gap-3">
        {review.src ? (
          // eslint-disable-next-line @next/next/no-img-element -- local customer logo assets
          <img
            src={review.src}
            alt={review.name}
            className={cn("max-h-8 max-w-[140px] object-contain", isCenter ? "brightness-0 invert" : "brightness-0")}
          />
        ) : (
          <span className={cn(
            "flex size-9 items-center justify-center rounded-md text-base font-extrabold",
            isCenter ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
          )}>
            {review.name.charAt(0)}
          </span>
        )}
        <div className="flex shrink-0 items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={cn("size-3.5", isCenter ? "fill-amber-300 text-amber-300" : "fill-amber-400 text-amber-400")} />
          ))}
        </div>
      </div>

      <h3 className={cn(
        "text-[15px] font-medium leading-snug sm:text-[17px]",
        isCenter ? "text-primary-foreground" : "text-foreground"
      )}>
        &ldquo;{review.review}&rdquo;
      </h3>

      {/* date · country · figure — no personal attribution */}
      <div className={cn(
        "absolute bottom-8 left-8 right-8 text-[12.5px] font-medium",
        isCenter ? "text-primary-foreground/75" : "text-muted-foreground"
      )}>
        {review.date} · {review.country} · {review.figure} brand
      </div>
    </div>
  );
};

export const StaggerTestimonials: React.FC = () => {
  const [cardSize, setCardSize] = useState(365);
  const [list, setList] = useState(REVIEWS);

  const handleMove = useCallback((steps: number) => {
    setList((prev) => {
      const newList = [...prev];
      if (steps > 0) {
        for (let i = steps; i > 0; i--) {
          const item = newList.shift();
          if (!item) return prev;
          newList.push({ ...item, tempId: Math.random() });
        }
      } else {
        for (let i = steps; i < 0; i++) {
          const item = newList.pop();
          if (!item) return prev;
          newList.unshift({ ...item, tempId: Math.random() });
        }
      }
      return newList;
    });
  }, []);

  // auto-scroll — always running (never pauses on hover), in the same stagger animation
  useEffect(() => {
    const id = setInterval(() => handleMove(1), 2200);
    return () => clearInterval(id);
  }, [handleMove]);

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)");
      setCardSize(matches ? 365 : 290);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-background-muted/40" style={{ height: 600 }}>
      {list.map((review, index) => {
        const position = list.length % 2
          ? index - (list.length + 1) / 2
          : index - list.length / 2;
        return (
          <TestimonialCard
            key={review.tempId}
            review={review}
            handleMove={handleMove}
            position={position}
            cardSize={cardSize}
          />
        );
      })}
    </div>
  );
};

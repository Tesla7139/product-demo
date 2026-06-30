import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Clickpost — home"
      className={cn("flex h-7 shrink-0 items-center", className)}
    >
      {/* intrinsic aspect ratio 2000:281 (~7.1:1); height-constrained, width auto */}
      <Image
        src="/brand/logo.svg"
        alt="Clickpost"
        width={2000}
        height={281}
        priority
        className="h-full w-auto object-contain"
      />
    </Link>
  );
}

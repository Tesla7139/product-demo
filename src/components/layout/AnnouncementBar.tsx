const SHOPIFY_LISTING = "https://apps.shopify.com/clickpost-order-edit-cancel";

export function AnnouncementBar() {
  return (
    <div className="w-full border-b border-border/60 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1240px] items-center justify-center gap-2.5 px-4 py-2.5 text-center text-[0.85rem] sm:px-6">
        <span className="font-semibold tracking-tight text-foreground">
          Comply with the EU directives with Clickpost Order Editing
        </span>
        <a
          href={SHOPIFY_LISTING}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden whitespace-nowrap font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline sm:inline"
        >
          See Shopify app listing
        </a>
      </div>
    </div>
  );
}

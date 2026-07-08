import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileP = promisify(execFile);

export const runtime = "nodejs";
export const maxDuration = 30; // the Jina fallback (Cloudflare bypass) can take a few seconds

type DemoProductOut = {
  id: string;
  title: string;
  variant: string;
  price: number;
  qty: number;
  image: string | null;
  variants: { title: string; price: number }[];
};

type Branding = {
  brandName: string | null;
  brandColor: string | null;
  logo: string | null;
  currency: string | null;
  products: DemoProductOut[];
};

// --- simple in-memory cache (per server instance) ---
const cache = new Map<string, { data: Branding; at: number }>();
const TTL = 1000 * 60 * 30; // 30 min

const FETCH_TIMEOUT = 4500;
const MAX_BYTES = 600_000; // cap HTML we read

// Many stores (Cloudflare/WAF) block generic bot User-Agents — even for the
// public /products.json — so present as a real browser to read public data.
const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
};

/** Reject obviously-internal / non-public hosts (basic SSRF guard). */
function isBlockedHost(host: string) {
  const h = host.toLowerCase();
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal")) return true;
  if (!h.includes(".")) return true; // must look like a real domain
  // raw IP literals -> block private / reserved ranges
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h)) {
    const p = h.split(".").map(Number);
    if (p[0] === 10) return true;
    if (p[0] === 127) return true;
    if (p[0] === 0) return true;
    if (p[0] === 169 && p[1] === 254) return true; // link-local / cloud metadata
    if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return true;
    if (p[0] === 192 && p[1] === 168) return true;
    return false;
  }
  if (h.includes(":")) return true; // IPv6 literal -> block to be safe
  return false;
}

function normalizeUrl(raw: string): URL | null {
  try {
    const trimmed = raw.trim().replace(/^https?:\/\//i, "");
    const url = new URL(`https://${trimmed}`);
    if (url.protocol !== "https:") return null;
    if (isBlockedHost(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

/** True when a response body is a Cloudflare/WAF challenge instead of real content. */
function isChallenge(text: string): boolean {
  return /Just a moment|challenge-platform|cf-browser-verification|Attention Required/i.test(text.slice(0, 2500));
}

/** Read a capped amount of the body (whole for JSON; up to </head> for HTML). */
async function readCapped(res: Response, htmlHead: boolean): Promise<string | null> {
  if (!res.ok || !res.body) return null;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let out = "";
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    out += decoder.decode(value, { stream: true });
    if (total > MAX_BYTES || (htmlHead && /<\/head>/i.test(out))) break;
  }
  reader.cancel().catch(() => {});
  return out;
}

async function tryFetch(url: string, accept: string, htmlHead: boolean): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { ...BROWSER_HEADERS, Accept: accept },
    });
    const text = await readCapped(res, htmlHead);
    if (text && isChallenge(text)) return null; // let curl handle it
    return text;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fallback via the system `curl` — many Shopify stores sit behind Cloudflare,
 * which fingerprints and blocks Node/undici (returns a "Just a moment" 403) but
 * lets curl through, so we can still read the public /products.json + branding.
 */
async function curlFetch(url: string, accept: string): Promise<string | null> {
  try {
    const { stdout } = await execFileP(
      "curl",
      [
        "-sL",
        "--max-redirs", "5",
        "--max-time", String(Math.ceil(FETCH_TIMEOUT / 1000) + 4),
        "-A", BROWSER_HEADERS["User-Agent"],
        "-H", `Accept: ${accept}`,
        "-H", `Accept-Language: ${BROWSER_HEADERS["Accept-Language"]}`,
        url,
      ],
      { maxBuffer: MAX_BYTES + 200_000, timeout: FETCH_TIMEOUT + 6000 }
    );
    if (!stdout || isChallenge(stdout)) return null;
    return stdout;
  } catch {
    return null;
  }
}

/**
 * Fallback via Jina AI Reader (r.jina.ai) — a public reader that fetches with a
 * real headless browser, so it bypasses Cloudflare from ANY server (works on
 * Vercel where `curl` isn't available / the datacenter IP is blocked).
 * `format: "html"` returns raw HTML (for branding); default returns text/markdown
 * (the JSON body is embedded, so callers extract it).
 */
async function jinaFetch(url: string, format?: "html"): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT + 12000);
  try {
    const headers: Record<string, string> = { "User-Agent": BROWSER_HEADERS["User-Agent"] };
    if (format) headers["X-Return-Format"] = format;
    const res = await fetch(`https://r.jina.ai/${url}`, { signal: controller.signal, headers });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || isChallenge(text)) return null;
    return text;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Pull the JSON object out of a raw/wrapped response (Jina embeds it in markdown). */
function extractJson(raw: string): string {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  return start >= 0 && end > start ? raw.slice(start, end + 1) : raw;
}

async function fetchText(url: string): Promise<string | null> {
  return (
    (await tryFetch(url, "text/html,application/xhtml+xml", true)) ??
    (await curlFetch(url, "text/html,application/xhtml+xml")) ??
    (await jinaFetch(url, "html"))
  );
}

async function fetchJson(url: string): Promise<unknown | null> {
  const raw =
    (await tryFetch(url, "application/json", false)) ??
    (await curlFetch(url, "application/json")) ??
    (await jinaFetch(url));
  if (!raw) return null;
  try {
    return JSON.parse(extractJson(raw));
  } catch {
    return null;
  }
}

type ShopifyProduct = {
  id?: number | string;
  handle?: string;
  title?: string;
  variants?: { title?: string; price?: string | number }[];
  images?: { src?: string }[];
};

function parseProducts(json: unknown): DemoProductOut[] {
  const arr =
    json && typeof json === "object" && Array.isArray((json as { products?: unknown }).products)
      ? ((json as { products: ShopifyProduct[] }).products)
      : [];
  return arr
    .slice(0, 8)
    .map((p) => {
      const v = p.variants?.[0];
      const variant = v?.title && v.title !== "Default Title" ? v.title : "";
      const price = Math.round(Number(v?.price ?? 0)) || 0;
      const image = p.images?.[0]?.src ?? null;
      const variants = (p.variants ?? [])
        .map((vv) => ({
          title: vv?.title && vv.title !== "Default Title" ? vv.title : "Default",
          price: Math.round(Number(vv?.price ?? 0)) || price,
        }))
        .filter((vv) => vv.title !== "Default" || (p.variants ?? []).length === 1);
      return {
        id: String(p.id ?? p.handle ?? Math.random()),
        title: String(p.title ?? "Product"),
        variant,
        price,
        qty: 1,
        image,
        variants,
      };
    })
    .filter((p) => p.title && p.title !== "Product");
}

function metaContent(html: string, patterns: RegExp[]): string | null {
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeHtml(m[1].trim());
  }
  return null;
}

function decodeHtml(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function absolutize(href: string | null, base: URL): string | null {
  if (!href) return null;
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function parseBranding(html: string, base: URL): Omit<Branding, "products" | "currency"> {
  const siteName =
    metaContent(html, [
      /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i,
    ]) ||
    metaContent(html, [/<title[^>]*>([^<]+)<\/title>/i])?.split(/[|–—-]/)[0]?.trim() ||
    base.hostname.replace(/^www\./, "").split(".")[0];

  const themeColor = metaContent(html, [
    /<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']theme-color["']/i,
  ]);
  const brandColor = themeColor && /^#?[0-9a-f]{3,8}$/i.test(themeColor.replace("#", ""))
    ? themeColor.startsWith("#")
      ? themeColor
      : `#${themeColor}`
    : null;

  const iconHref =
    metaContent(html, [
      /<link[^>]+rel=["']apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["']/i,
      /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']apple-touch-icon[^"']*["']/i,
    ]) ||
    metaContent(html, [/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i]) ||
    metaContent(html, [
      /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i,
      /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i,
    ]);

  return {
    brandName: siteName ? capitalize(siteName) : null,
    brandColor,
    logo: absolutize(iconHref, base),
  };
}

function capitalize(s: string) {
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function parseCurrency(json: unknown): string | null {
  if (!json || typeof json !== "object") return null;
  const c = (json as Record<string, unknown>).currency;
  if (typeof c === "string" && /^[A-Z]{3}$/.test(c)) return c;
  return null;
}

export async function POST(req: Request) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const url = normalizeUrl(body.url || "");
  if (!url) {
    return NextResponse.json({ error: "Invalid or blocked URL" }, { status: 400 });
  }

  const key = url.hostname;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) {
    return NextResponse.json(hit.data);
  }

  // Fetch branding (homepage <head>), products, and cart currency together.
  const [html, productsJson, cartJson] = await Promise.all([
    fetchText(url.toString()),
    fetchJson(`${url.origin}/products.json?limit=8`),
    fetchJson(`${url.origin}/cart.js`),
  ]);

  const products = parseProducts(productsJson);
  const currency = parseCurrency(cartJson);

  if (!html && products.length === 0) {
    return NextResponse.json({ error: "Could not read store" }, { status: 502 });
  }

  const branding = html
    ? parseBranding(html, url)
    : {
        brandName: capitalize(url.hostname.replace(/^www\./, "").split(".")[0]),
        brandColor: null,
        logo: null,
      };

  const data: Branding = { ...branding, currency, products };
  cache.set(key, { data, at: Date.now() });
  return NextResponse.json(data);
}

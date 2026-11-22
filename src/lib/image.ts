/**
 * Image delivery through Vercel Image Optimization (`/_vercel/image`).
 *
 * Project photos are uploaded to Supabase Storage at full camera resolution
 * (some are 20+ MB). Vercel resizes them to the width a visitor actually needs,
 * converts them to WebP and caches the result on its CDN.
 *
 * Allowed widths/qualities/sources are configured in vercel.json → "images".
 * Keep IMAGE_WIDTHS and IMAGE_QUALITY in sync with that file, otherwise
 * Vercel rejects the request.
 *
 * Safety net: if an optimized URL fails (e.g. on a non-Vercel host such as the
 * Lovable preview), IMAGE_FALLBACK_SCRIPT swaps the image back to the original.
 */

export const IMAGE_WIDTHS = [384, 640, 828, 1200, 1920] as const;
export const IMAGE_QUALITY = 75;

const SUPABASE_STORAGE =
  /^https:\/\/zjvnxolsmfkurrwissru\.supabase\.co\/storage\/v1\/object\/public\//;
const LOCAL_ASSET = /^\/assets\/[^?#]+\.(?:jpe?g|png|webp)$/i;

// Only on production builds; the dev server has no /_vercel/image endpoint.
const ENABLED = import.meta.env.PROD && import.meta.env.VITE_DISABLE_IMAGE_OPTIMIZATION !== "true";

export function canOptimize(src?: string | null): src is string {
  if (!ENABLED || !src) return false;
  return SUPABASE_STORAGE.test(src) || LOCAL_ASSET.test(src);
}

function nearestWidth(width: number): number {
  return IMAGE_WIDTHS.find((w) => w >= width) ?? IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1];
}

/** Optimized URL for `src` at roughly `width` CSS pixels. Returns `src` unchanged if not optimizable. */
export function imgUrl(src: string, width?: number): string;
export function imgUrl(src: string | null | undefined, width?: number): string | undefined;
export function imgUrl(src: string | null | undefined, width = 1200): string | undefined {
  if (!canOptimize(src)) return src ?? undefined;
  return `/_vercel/image?url=${encodeURIComponent(src)}&w=${nearestWidth(width)}&q=${IMAGE_QUALITY}`;
}

/** `srcSet` string up to `maxWidth`, or undefined when the image can't be optimized. */
export function imgSrcSet(src: string | null | undefined, maxWidth = 1920): string | undefined {
  if (!canOptimize(src)) return undefined;
  return IMAGE_WIDTHS.filter((w) => w <= nearestWidth(maxWidth))
    .map((w) => `${imgUrl(src, w)} ${w}w`)
    .join(", ");
}

/**
 * Spread onto an <img>: `<img {...responsiveImg(url, "(min-width: 1024px) 33vw, 100vw")} alt=... />`
 * Adds src, srcSet, sizes and async decoding.
 */
export function responsiveImg(
  src: string | null | undefined,
  sizes = "100vw",
  maxWidth = 1920,
): { src: string | undefined; srcSet?: string; sizes?: string; decoding: "async" } {
  const srcSet = imgSrcSet(src, maxWidth);
  return {
    src: imgUrl(src, Math.min(maxWidth, 1200)),
    ...(srcSet ? { srcSet, sizes } : {}),
    decoding: "async",
  };
}

/**
 * Inline script (runs in <head>, before images load): if an optimized image
 * fails, fall back to the original URL. Uses a capturing listener because
 * image `error` events don't bubble.
 */
export const IMAGE_FALLBACK_SCRIPT = `(function(){function f(i){try{var u=new URL(i.currentSrc||i.src,location.href);if(u.pathname!=="/_vercel/image"||i.dataset.imgFallback)return;var o=u.searchParams.get("url");if(!o)return;i.dataset.imgFallback="1";i.removeAttribute("srcset");i.removeAttribute("sizes");i.src=o}catch(e){}}document.addEventListener("error",function(e){var t=e.target;if(t&&t.tagName==="IMG")f(t)},true);document.addEventListener("DOMContentLoaded",function(){var a=document.images;for(var k=0;k<a.length;k++){if(a[k].complete&&a[k].naturalWidth===0)f(a[k])}})})();`;

/**
 * Loads three.js from a CDN, once per page load.
 *
 * three.js is not an npm dependency here — it is ~600KB that only two views
 * need, so it stays out of the main bundle and arrives from jsDelivr on demand.
 * The cost of that choice is that it can fail (offline, blocked CDN), so every
 * caller must handle rejection and degrade to something readable.
 *
 * The promise is cached at module scope: two components mounting in the same
 * frame get the same in-flight load rather than two script tags racing to
 * assign `window.THREE`.
 */

/* eslint-disable @typescript-eslint/no-explicit-any --
 * three.js is fetched from a CDN rather than installed from npm, so
 * `@types/three` is not present and nothing here can be typed properly.
 * `Three` is the single documented escape hatch; callers import it instead of
 * spelling `any` themselves, which keeps the untyped surface visible in one
 * place. Installing three + its types is what would remove it.
 */

/** The `window.THREE` namespace, untyped. */
export type Three = any;

const THREE_SRC = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js";

let loader: Promise<Three> | null = null;

export function loadThree(): Promise<Three> {
  if (loader) return loader;

  loader = new Promise<Three>((resolve, reject) => {
    // Already present (e.g. the other view loaded it, or an earlier mount).
    if ((window as any).THREE) {
      resolve((window as any).THREE);
      return;
    }

    const script = document.createElement("script");
    script.src = THREE_SRC;
    script.async = true;
    script.addEventListener(
      "load",
      () => {
        const THREE: Three = (window as any).THREE;
        if (THREE) resolve(THREE);
        else reject(new Error("three.js loaded but window.THREE is undefined"));
      },
      { once: true },
    );
    script.addEventListener(
      "error",
      () => {
        // Let a later mount retry rather than caching the failure forever.
        loader = null;
        reject(new Error(`Failed to load ${THREE_SRC}`));
      },
      { once: true },
    );
    document.head.appendChild(script);
  });

  return loader;
}

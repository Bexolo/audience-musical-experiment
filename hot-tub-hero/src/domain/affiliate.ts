/**
 * Amazon affiliate link building.
 *
 * IMPORTANT (compliance): the caller must open the returned URL in the device's
 * DEFAULT browser (e.g. expo-linking `openURL`), NOT an in-app web view. That
 * lets the installed Amazon app take over and preserves Associates attribution,
 * and keeps us within Amazon's app linking policy. See `openProduct` in
 * src/affiliate/openProduct.ts for the enforced call path.
 */

export type AmazonStore = "co.uk" | "com" | "de";

/** Your Associates tracking tags, per storefront. Replace before launch. */
export const AFFILIATE_TAGS: Record<AmazonStore, string> = {
  "co.uk": "hottubhero-21",
  com: "hottubhero-20",
  de: "hottubhero-de-21",
};

/** Default store for the app's primary (UK) audience. */
export const DEFAULT_STORE: AmazonStore = "co.uk";

/**
 * Builds a tagged product URL from an ASIN. Throws on an empty ASIN so a
 * missing catalogue id surfaces in tests rather than sending users to a broken
 * (and untracked) link in production.
 */
export function buildAffiliateUrl(
  asin: string,
  store: AmazonStore = DEFAULT_STORE
): string {
  const trimmed = asin.trim();
  if (!trimmed) {
    throw new Error("buildAffiliateUrl: ASIN is required");
  }
  const tag = AFFILIATE_TAGS[store];
  return `https://www.amazon.${store}/dp/${encodeURIComponent(trimmed)}?tag=${tag}`;
}

/** Required FTC/ASA-style disclosure shown next to affiliate links. */
export const AFFILIATE_DISCLOSURE =
  "As an Amazon Associate, Hot Tub Hero earns from qualifying purchases. " +
  "Links may earn us a commission at no extra cost to you.";

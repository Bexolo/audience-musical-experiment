/**
 * The single sanctioned way to open an affiliate product.
 *
 * Uses expo-linking `openURL`, which hands off to the device's DEFAULT browser
 * (and the installed Amazon app, if present). We deliberately do NOT use
 * expo-web-browser's in-app view here: an in-app web view can break Amazon
 * Associates attribution and falls foul of the app linking policy.
 */
import * as Linking from "expo-linking";
import {
  buildAffiliateUrl,
  DEFAULT_STORE,
  type AmazonStore,
} from "@/domain/affiliate";

export async function openProduct(
  asin: string,
  store: AmazonStore = DEFAULT_STORE
): Promise<void> {
  const url = buildAffiliateUrl(asin, store);
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  }
}

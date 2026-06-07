/**
 * Catalogue item shapes shared by the chemicals and tools guides.
 *
 * Items are tagged with the water-body types they apply to so the guide can be
 * filtered as pools/rigid spas are added later. ASINs are placeholders and must
 * be verified against live Amazon listings before launch.
 */
import type { WaterBodyType } from "@/domain/types";

export interface CatalogueItem {
  id: string;
  name: string;
  /** Short beginner explanation of what it is / why it matters. */
  blurb: string;
  /** Amazon ASIN used to build the affiliate link. */
  asin: string;
  /** Which water-body types this item is relevant to. */
  appliesTo: WaterBodyType[];
}

export interface ChemicalItem extends CatalogueItem {
  /** When a beginner should reach for it. */
  whenToUse: string;
  /** Safety note surfaced prominently. */
  safety: string;
  /** True for the "starter kit" essentials shopping list. */
  essential: boolean;
}

export interface ToolItem extends CatalogueItem {
  essential: boolean;
}

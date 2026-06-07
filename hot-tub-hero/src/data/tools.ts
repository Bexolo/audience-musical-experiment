/**
 * Tools / equipment catalogue (blow-up spa, v1).
 *
 * ASINs are PLACEHOLDERS — verify against live UK Amazon listings before launch.
 */
import type { ToolItem } from "./catalogue";

const SPA: ToolItem["appliesTo"] = ["blowup_spa"];

export const TOOLS: ToolItem[] = [
  {
    id: "floating_dispenser",
    name: "Floating chemical dispenser",
    blurb: "Holds tablets and releases sanitiser slowly so levels stay steady.",
    asin: "B00DISPENS0",
    appliesTo: SPA,
    essential: true,
  },
  {
    id: "spare_filters",
    name: "Spare filter cartridges",
    blurb: "Buy a multipack that matches your tub model so you always have a fresh one.",
    asin: "B00FILTERS0",
    appliesTo: SPA,
    essential: true,
  },
  {
    id: "debris_net",
    name: "Debris net / skimmer",
    blurb: "Scoops out leaves, bugs and hair before they reach the filter.",
    asin: "B00DEBRIS00",
    appliesTo: SPA,
    essential: true,
  },
  {
    id: "insulated_lid",
    name: "Insulated lid & ground mat",
    blurb: "Keeps heat in (cutting running costs) and grit out from underneath.",
    asin: "B00INSULAT0",
    appliesTo: SPA,
    essential: false,
  },
  {
    id: "filter_brush",
    name: "Filter cleaning brush/wand",
    blurb: "Fans the pleats open to blast out trapped grime quickly.",
    asin: "B00FBRUSH00",
    appliesTo: SPA,
    essential: false,
  },
  {
    id: "drain_pump",
    name: "Drain pump / hose adapter",
    blurb: "Empties the tub fast at water-change time instead of waiting on gravity.",
    asin: "B00DRAINPM0",
    appliesTo: SPA,
    essential: false,
  },
  {
    id: "fill_prefilter",
    name: "Fill-hose pre-filter",
    blurb: "Cleans your tap water as you fill, reducing metals and balancing effort.",
    asin: "B00PREFILT0",
    appliesTo: SPA,
    essential: false,
  },
  {
    id: "scale_reducer",
    name: "Magnetic scale reducer",
    blurb: "Clips on the fill hose to cut limescale in hard-water areas.",
    asin: "B00SCALE000",
    appliesTo: SPA,
    essential: false,
  },
];

export const ESSENTIAL_TOOLS = TOOLS.filter((t) => t.essential);

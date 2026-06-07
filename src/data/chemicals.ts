/**
 * Chemical catalogue (blow-up spa, v1).
 *
 * ASINs are PLACEHOLDERS — verify each against a live UK Amazon listing before
 * launch. `appliesTo` is kept on every item so pools can reuse/filter later.
 */
import type { ChemicalItem } from "./catalogue";

const SPA: ChemicalItem["appliesTo"] = ["blowup_spa"];

export const CHEMICALS: ChemicalItem[] = [
  {
    id: "chlorine_granules",
    name: "Chlorine granules",
    blurb: "The most common primary sanitiser — keeps water free of bacteria.",
    whenToUse: "Dose to keep free chlorine at 3–5 ppm. Add after heavy use.",
    safety: "Never mix with other chemicals. Add to water, never water to chemical.",
    asin: "B00CHLORINE0",
    appliesTo: SPA,
    essential: true,
  },
  {
    id: "bromine_tablets",
    name: "Bromine tablets",
    blurb: "A gentler, less smelly sanitiser that copes better with spa heat.",
    whenToUse: "Use in a floating dispenser to hold bromine at 4–6 ppm.",
    safety: "Don't handle tablets with bare wet hands. Store dry and sealed.",
    asin: "B00BROMINE0",
    appliesTo: SPA,
    essential: false,
  },
  {
    id: "ph_minus",
    name: "pH decreaser (pH minus)",
    blurb: "Lowers pH when water turns alkaline and sanitiser stops working well.",
    whenToUse: "Add small doses when pH reads above 7.6, then retest.",
    safety: "Acidic — wear gloves and avoid skin contact.",
    asin: "B00PHMINUS0",
    appliesTo: SPA,
    essential: true,
  },
  {
    id: "ph_plus",
    name: "pH increaser (pH plus)",
    blurb: "Raises pH when water turns acidic and can irritate skin/eyes.",
    whenToUse: "Add small doses when pH reads below 7.2, then retest.",
    safety: "Add gradually — overshooting wastes chemical and clouds water.",
    asin: "B00PHPLUS00",
    appliesTo: SPA,
    essential: true,
  },
  {
    id: "alkalinity_increaser",
    name: "Total alkalinity increaser",
    blurb: "Buffers pH so it stops bouncing around between tests.",
    whenToUse: "Add when alkalinity is below 80 ppm — fix this before pH.",
    safety: "Disperse over the surface with the pump running.",
    asin: "B00ALKALIN0",
    appliesTo: SPA,
    essential: true,
  },
  {
    id: "non_chlorine_shock",
    name: "Non-chlorine shock",
    blurb: "A weekly oxidising 'reset' that clears the gunk sanitiser leaves behind.",
    whenToUse: "Add weekly, and after parties or heavy use, with the pump on.",
    safety: "Let the cover off for ~20 minutes after dosing to let gases escape.",
    asin: "B00SHOCK000",
    appliesTo: SPA,
    essential: true,
  },
  {
    id: "test_strips",
    name: "Test strips (6-in-1)",
    blurb: "Reads sanitiser, pH and alkalinity in seconds — your dashboard for the water.",
    whenToUse: "Dip every 2–3 days and before adjusting any chemical.",
    safety: "Keep the tub away from direct sun while reading for accuracy.",
    asin: "B00TESTSTR0",
    appliesTo: SPA,
    essential: true,
  },
  {
    id: "foam_reducer",
    name: "Foam reducer",
    blurb: "Knocks down foam from lotions, detergents and oils.",
    whenToUse: "Add a capful when foam appears; fix the cause with a water change.",
    safety: "A treatment, not a cure — persistent foam means it's time to refill.",
    asin: "B00FOAM0000",
    appliesTo: SPA,
    essential: false,
  },
  {
    id: "clarifier",
    name: "Clarifier (no more cloudy)",
    blurb: "Clumps tiny particles so the filter can grab them and clear cloudy water.",
    whenToUse: "Add when water looks dull or cloudy but chemistry is balanced.",
    safety: "Run the filter for several hours after dosing.",
    asin: "B00CLARIFY0",
    appliesTo: SPA,
    essential: false,
  },
  {
    id: "filter_cleaner",
    name: "Filter cartridge cleaner",
    blurb: "Soaking solution that strips grease and grime from cartridges.",
    whenToUse: "Use for the fortnightly deep-soak to extend filter life.",
    safety: "Rinse cartridges thoroughly before refitting.",
    asin: "B00FILTERC0",
    appliesTo: SPA,
    essential: false,
  },
];

export const STARTER_KIT = CHEMICALS.filter((c) => c.essential);

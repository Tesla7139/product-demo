// Country + subdivision data for the demo address form, plus the Zippopotam
// country code used for free live postal-code validation (api.zippopotam.us/<zip>).
export type CountryData = {
  name: string;
  zip: string; // zippopotam country code
  regionLabel: string; // "State" / "Province" / "Region"
  zipLen: number; // digits/chars that make a "complete" postal code → trigger auto-detect
  regions: string[];
};

export const COUNTRIES: CountryData[] = [
  {
    name: "United States",
    zip: "us",
    regionLabel: "State",
    zipLen: 5,
    regions: [
      "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
      "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia",
      "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
      "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
      "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
      "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
      "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
      "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
      "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
    ],
  },
  {
    name: "Canada",
    zip: "ca",
    regionLabel: "Province",
    zipLen: 3,
    regions: [
      "Alberta", "British Columbia", "Manitoba", "New Brunswick",
      "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia",
      "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan",
      "Yukon",
    ],
  },
  {
    name: "India",
    zip: "in",
    regionLabel: "State",
    zipLen: 6,
    regions: [
      "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
      "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
      "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
      "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
      "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
      "Andaman and Nicobar Islands", "Chandigarh",
      "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
      "Ladakh", "Lakshadweep", "Puducherry",
    ],
  },
  {
    name: "Germany",
    zip: "de",
    regionLabel: "State",
    zipLen: 5,
    regions: [
      "Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen",
      "Hamburg", "Hesse", "Lower Saxony", "Mecklenburg-Vorpommern",
      "North Rhine-Westphalia", "Rhineland-Palatinate", "Saarland", "Saxony",
      "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia",
    ],
  },
  {
    name: "France",
    zip: "fr",
    regionLabel: "Region",
    zipLen: 5,
    regions: [
      "Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Brittany",
      "Centre-Val de Loire", "Corsica", "Grand Est", "Hauts-de-France",
      "Île-de-France", "Normandy", "Nouvelle-Aquitaine", "Occitanie",
      "Pays de la Loire", "Provence-Alpes-Côte d'Azur",
    ],
  },
];

export const countryByName = (name: string): CountryData =>
  COUNTRIES.find((c) => c.name === name) ?? COUNTRIES[0];

/**
 * Free, key-less live postal-code validation via Zippopotam (pure fetch — no
 * child_process, so it runs anywhere incl. HubSpot). Returns the real city +
 * region for a postal code, or null if the code isn't found / the call fails.
 */
export async function lookupPostal(
  countryName: string,
  postal: string
): Promise<{ city: string; region: string } | null> {
  const c = countryByName(countryName);
  const raw = postal.trim().toUpperCase();
  // Canada validates on the 3-char FSA (e.g. "M5V"); others use the code up to a "-"/space.
  const code = c.zip === "ca" ? raw.replace(/\s/g, "").slice(0, 3) : raw.split(/[-\s]/)[0];
  if (!code) return null;
  try {
    const res = await fetch(`https://api.zippopotam.us/${c.zip}/${encodeURIComponent(code)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { places?: Array<Record<string, string>> };
    const place = data.places?.[0];
    if (!place) return null;
    return { city: place["place name"] ?? "", region: place["state"] ?? "" };
  } catch {
    return null;
  }
}

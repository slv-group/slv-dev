/**
 * Concise, text-only catalog of SLV projects for the AI assistant's system
 * prompt. Kept separate from `src/data/projects.ts` so the chat server route
 * never pulls image asset imports into the server bundle.
 */

export interface CatalogItem {
  name: string;
  slug: string;
  category: string;
  status: string;
  location: string;
  city: string;
  priceFromLakh: number; // ₹ in lakhs
  config: string;
}

export const slvCatalog: CatalogItem[] = [
  {
    name: "SLV Amaravathi Pride",
    slug: "slv-amaravathi-pride",
    category: "Apartment",
    status: "Ongoing",
    location: "Kesarapalli, Gannavaram",
    city: "Vijayawada",
    priceFromLakh: 68,
    config: "2 & 3 BHK",
  },
  {
    name: "SLV Amaravathi Grand III",
    slug: "slv-amaravathi-grand-iii",
    category: "Apartment",
    status: "Ongoing",
    location: "Inner Ring Road, Gunadala",
    city: "Vijayawada",
    priceFromLakh: 81,
    config: "3 & 4 BHK",
  },
  {
    name: "SLV Amaravathi Grand II",
    slug: "slv-amaravathi-grand-ii",
    category: "Apartment",
    status: "Ongoing",
    location: "Gunadala",
    city: "Vijayawada",
    priceFromLakh: 75,
    config: "2 & 3 BHK",
  },
  {
    name: "SLV Amaravathi Grand I",
    slug: "slv-amaravathi-grand-i",
    category: "Apartment",
    status: "Completed",
    location: "Gunadala",
    city: "Vijayawada",
    priceFromLakh: 72,
    config: "2 & 3 BHK",
  },
  {
    name: "SLV Anjani Heights",
    slug: "slv-anjani-heights",
    category: "Apartment",
    status: "Completed",
    location: "Gunadala",
    city: "Vijayawada",
    priceFromLakh: 58,
    config: "2 & 3 BHK",
  },
  {
    name: "SLV Green Meadows",
    slug: "slv-green-meadows",
    category: "Apartment",
    status: "Ongoing",
    location: "Inner Ring Road, Gunadala",
    city: "Vijayawada",
    priceFromLakh: 62,
    config: "2 & 3 BHK",
  },
  {
    name: "SLV Siva Sai Bhadra Gowri Enclave",
    slug: "slv-siva-sai-bhadra-gowri-enclave",
    category: "Villa",
    status: "Completed",
    location: "Penamaluru",
    city: "Vijayawada",
    priceFromLakh: 145,
    config: "3 & 4 BHK villas",
  },
  {
    name: "SLV Green Lands",
    slug: "slv-green-lands",
    category: "Plots",
    status: "Upcoming",
    location: "Guntupalli",
    city: "Vijayawada",
    priceFromLakh: 35,
    config: "Villa plots",
  },
  {
    name: "SLV CBN Nagar",
    slug: "slv-cbn-nagar",
    category: "Plots",
    status: "Ongoing",
    location: "CBN Nagar",
    city: "Vijayawada",
    priceFromLakh: 28,
    config: "Residential plots",
  },
  {
    name: "SLV GSR Layout",
    slug: "slv-gsr-layout",
    category: "Plots",
    status: "Ongoing",
    location: "GSR Layout",
    city: "Vijayawada",
    priceFromLakh: 32,
    config: "Residential plots",
  },
  {
    name: "SLV PNB Apartment",
    slug: "slv-pnb-apartment",
    category: "Apartment",
    status: "Completed",
    location: "Vijayawada",
    city: "Vijayawada",
    priceFromLakh: 45,
    config: "2 & 3 BHK",
  },
  {
    name: "SLV Tummala Complex",
    slug: "slv-tummala-complex",
    category: "Commercial",
    status: "Completed",
    location: "Tummala Complex",
    city: "Vijayawada",
    priceFromLakh: 55,
    config: "Office & retail",
  },
  {
    name: "SLV PNB Commercial-1 & Green Grandeur",
    slug: "slv-pnb-commercial-green-grandeur",
    category: "Commercial",
    status: "Completed",
    location: "Vijayawada",
    city: "Vijayawada",
    priceFromLakh: 60,
    config: "Commercial & retail",
  },
];

export function buildCatalogPrompt(): string {
  const lines = slvCatalog.map(
    (p) =>
      `- ${p.name} (${p.category}, ${p.status}) — ${p.config}, ${p.location}, ${p.city}. From ₹${p.priceFromLakh}L. Link: /projects/${p.slug}`,
  );
  return lines.join("\n");
}

export const SLV_SYSTEM_PROMPT = `You are the SLV Property Assistant — a warm, concise, expert real-estate advisor for SLV Group Pvt Ltd, a trusted developer operating since 2007 across Vijayawada and the Amaravati capital region (19+ years, 20+ residential projects, 5000+ happy families).

Your job: understand what the buyer wants (budget, location, configuration, apartment/villa/plot, ready-to-move vs under-construction, investment vs end-use) and recommend the best-matching SLV projects from the catalog below. Ask at most one short clarifying question only if truly needed — otherwise recommend right away.

RULES:
- Only recommend projects from the catalog below. Never invent projects, prices, or amenities.
- When recommending a project, format it as a markdown link using its Link path, e.g. [SLV Amaravathi Pride](/projects/slv-amaravathi-pride).
- Keep answers tight and scannable: a one-line intro, then a short bullet list of 1–3 matches, each with why it fits (config, location, starting price).
- Prices are "starting from" figures in Indian rupees; be clear these are indicative and to contact the team for current pricing.
- For loan/EMI questions, point users to the EMI calculator at /emi-calculator.
- For site visits or detailed pricing, invite them to /contact or WhatsApp.
- Be friendly and professional. Use ₹ and lakh/crore conventions. Never make up phone numbers or dates.

SLV PROJECT CATALOG:
${buildCatalogPrompt()}`;

import type { Project } from "@/data/projects";

/**
 * Location landing pages (/locations/$slug) — one page per area SLV builds in,
 * targeting searches like "apartments in Vijayawada" or "villa plots in Gannavaram".
 */
export interface LocationPage {
  slug: string;
  name: string;
  /** <title> — keep under ~65 characters */
  title: string;
  /** meta description — keep under ~160 characters */
  description: string;
  h1: string;
  intro: string[];
  /** Lower-case words matched against a project's location + city */
  match: string[];
  /** Words that exclude a project even if `match` hits */
  exclude?: string[];
  faqs: { q: string; a: string }[];
}

export const LOCATION_PAGES: LocationPage[] = [
  {
    slug: "vijayawada",
    name: "Vijayawada",
    title: "Apartments, Villas & Plots in Vijayawada | SLV Group",
    description:
      "Explore SLV Group's apartments, villas, plotted layouts and commercial spaces in Vijayawada — Gunadala, Bhavanipuram, Ramavarappadu, Nidamanuru and more.",
    h1: "Apartments, Villas & Plots in Vijayawada",
    intro: [
      "Vijayawada is where SLV Group is headquartered and where most of our communities stand — from premium 3 & 4 BHK apartments in Gunadala and Bhavanipuram to villa communities and plotted layouts in Ramavarappadu and Nidamanuru.",
      "Every project below lists its configuration, size range and approval details. Visit a project page for floor plans, amenities and the brochure, or book a site visit with our team.",
    ],
    match: [
      "vijayawada",
      "gunadala",
      "bhavanipuram",
      "ramavarappadu",
      "nidamanuru",
      "guntupalli",
      "kesarapalli",
    ],
    faqs: [
      {
        q: "Which areas of Vijayawada does SLV Group build in?",
        a: "SLV Group has projects in Gunadala, Bhavanipuram, Ramavarappadu, Nidamanuru, Guntupalli and Kesarapalli, along with the Gannavaram corridor near the airport.",
      },
      {
        q: "What types of properties does SLV Group offer in Vijayawada?",
        a: "Apartments (2, 3 and 4 BHK), duplex and triplex villas, villa plots and commercial spaces.",
      },
      {
        q: "How do I visit an SLV project in Vijayawada?",
        a: "Book a site visit online or call +91 98595 95939. Our office is at SLV Tummala Complex, Gunadala, Inner Ring Road, Vijayawada.",
      },
    ],
  },
  {
    slug: "amaravati",
    name: "Amaravati",
    title: "Apartments in Amaravati & Mangalagiri | SLV Group",
    description:
      "SLV Group homes in the Amaravati capital region, including SLV Amaravati Pride in Mangalagiri — 2 & 3 BHK apartments close to the capital city.",
    h1: "Homes in the Amaravati Capital Region",
    intro: [
      "The Amaravati capital region, including Mangalagiri, connects Vijayawada and Guntur and is home to SLV Amaravati Pride.",
      "Browse SLV Group's projects in the region below, with configurations, sizes and approval details on each project page.",
    ],
    match: ["amaravati", "mangalagiri"],
    faqs: [
      {
        q: "Does SLV Group have projects in Amaravati?",
        a: "Yes. SLV Amaravati Pride in Mangalagiri, in the Amaravati capital region, offers 2 & 3 BHK apartments.",
      },
      {
        q: "Are the SLV Amaravati Grand projects in Amaravati?",
        a: "SLV Amaravati Grand I, II and III are in Gunadala, Vijayawada. They are listed on the Vijayawada page.",
      },
    ],
  },
  {
    slug: "gannavaram",
    name: "Gannavaram",
    title: "Villa Plots & Apartments in Gannavaram | SLV Group",
    description:
      "SLV Group villa plots and apartments in Gannavaram, Kesarapalli, Vedurupavuluru and Purushothapatnam — near Vijayawada International Airport.",
    h1: "Villa Plots & Apartments in Gannavaram",
    intro: [
      "Gannavaram sits on the national highway near Vijayawada International Airport. SLV Group's layouts and apartments here include SLV Green Horizon, SLV Green Horizon-2, SLV Anjani Heights and the Laila communities in Kesarapalli.",
      "See each project's plot or flat sizes, status and approvals below.",
    ],
    match: ["gannavaram", "kesarapalli", "vedurupavuluru", "purushothapatnam"],
    faqs: [
      {
        q: "What does SLV Group offer in Gannavaram?",
        a: "Villa plots in SLV Green Horizon and SLV Green Horizon-2, and apartments at SLV Anjani Heights and the Laila communities in Kesarapalli.",
      },
    ],
  },
  {
    slug: "bhimavaram",
    name: "Bhimavaram",
    title: "Apartments & Commercial Projects in Bhimavaram | SLV Group",
    description:
      "SLV Group's completed apartment and commercial projects in Bhimavaram, West Godavari — SLV Tower, Gokul Towers, SSBG Enclave, STR Arcade and more.",
    h1: "SLV Group Projects in Bhimavaram",
    intro: [
      "SLV Group has delivered a series of apartment communities and commercial complexes in Bhimavaram, West Godavari. All of them are completed and handed over.",
      "Open any project for its configuration, size range and photos.",
    ],
    match: ["bhimavaram"],
    faqs: [
      {
        q: "Which SLV Group projects are in Bhimavaram?",
        a: "SLV Tower, SLV Gokul Towers, SLV SSBG Enclave, SLV STR Arcade, SLV Syam Enclave, SLV Syam Complex, SLV Rayalam and other completed projects.",
      },
    ],
  },
];

export function getLocationPage(slug: string): LocationPage | undefined {
  return LOCATION_PAGES.find((l) => l.slug === slug);
}

export function projectsForLocation(page: LocationPage, projects: Project[]): Project[] {
  return projects.filter((p) => {
    const hay = `${p.location} ${p.city}`.toLowerCase();
    if (page.exclude?.some((w) => hay.includes(w))) return false;
    return page.match.some((w) => hay.includes(w));
  });
}

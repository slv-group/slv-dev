import { OFFICE_ADDRESS, PRIMARY_PHONE, SECONDARY_PHONE, SOCIAL_PROFILE_URLS } from "@/lib/social";

export const SITE_URL = "https://www.slvgroup.co.in";

/**
 * Sitewide schema.org graph: the business (Organization + RealEstateAgent) and the website.
 * Rendered once in the root layout; other pages reference it via "@id".
 */
export const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "RealEstateAgent"],
      "@id": `${SITE_URL}/#organization`,
      name: "SLV Group",
      alternateName: ["SLV Developers", "SLV Builders"],
      url: SITE_URL,
      logo: `${SITE_URL}/slv-logo.png`,
      image: `${SITE_URL}/slv-logo.png`,
      description:
        "Real estate developer in Andhra Pradesh since 2007, building apartments, villas, gated communities, open plots and commercial spaces across Vijayawada, Amaravati, Gannavaram and Bhimavaram.",
      foundingDate: "2007",
      telephone: PRIMARY_PHONE.href.replace("tel:", ""),
      email: "info@slvgroup.co.in",
      address: {
        "@type": "PostalAddress",
        streetAddress: `${OFFICE_ADDRESS.line1} ${OFFICE_ADDRESS.line2} Inner Ring Road`
          .replace(/,\s*$/, "")
          .replace(/\s+/g, " "),
        addressLocality: OFFICE_ADDRESS.city,
        addressRegion: OFFICE_ADDRESS.state,
        postalCode: OFFICE_ADDRESS.pincode,
        addressCountry: OFFICE_ADDRESS.country,
      },
      contactPoint: [PRIMARY_PHONE, SECONDARY_PHONE].map((p) => ({
        "@type": "ContactPoint",
        telephone: p.href.replace("tel:", ""),
        contactType: "sales",
        areaServed: "IN",
        availableLanguage: ["English", "Telugu", "Hindi"],
      })),
      areaServed: [
        "Vijayawada",
        "Amaravati",
        "Guntur",
        "Gannavaram",
        "Bhimavaram",
        "Andhra Pradesh",
      ].map((name) => ({ "@type": "Place", name })),
      ...(SOCIAL_PROFILE_URLS.length ? { sameAs: SOCIAL_PROFILE_URLS } : {}),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "SLV Group",
      inLanguage: "en-IN",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

/** FAQPage schema from question/answer pairs. */
export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q.replace(/^\d+\.\s*/, ""),
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

/** Serialize JSON-LD safely for a <script> tag (prevents "</script>" breakouts). */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

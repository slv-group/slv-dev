/**
 * Client-side, rule-based SLV Property Assistant.
 * No API keys required — answers are generated from the SLV catalog data.
 */

import { slvCatalog, type CatalogItem } from "./slv-catalog";
import { formatLocationCity } from "./country-codes";

/* ─── helpers ─── */

function lower(s: string) {
  return s.toLowerCase();
}

function extractBudget(text: string): { min?: number; max?: number } {
  const t = lower(text);
  // e.g. "under 80 lakh", "below ₹80L", "within 1 crore"
  const underMatch = t.match(
    /(?:under|below|within|upto|up to|less than|max|budget)[^\d]{0,10}(?:₹|rs\.?|inr)?\s*([\d.]+)\s*(l|lakh|lakhs|cr|crore|crores)?/,
  );
  if (underMatch) {
    let val = parseFloat(underMatch[1]);
    const unit = underMatch[2];
    if (unit && unit.startsWith("cr")) val *= 100; // crore → lakh
    return { max: val };
  }
  // e.g. "80 lakh to 1.2 crore"
  const rangeMatch = t.match(
    /([\d.]+)\s*(l|lakh|lakhs|cr|crore|crores)?\s*(?:to|-)\s*([\d.]+)\s*(l|lakh|lakhs|cr|crore|crores)?/,
  );
  if (rangeMatch) {
    let min = parseFloat(rangeMatch[1]);
    const u1 = rangeMatch[2];
    let max = parseFloat(rangeMatch[3]);
    const u2 = rangeMatch[4];
    if (u1 && u1.startsWith("cr")) min *= 100;
    if (u2 && u2.startsWith("cr")) max *= 100;
    return { min, max };
  }
  // bare number with lakh/crore
  const bareMatch = t.match(/(?:₹|rs\.?|inr)?\s*([\d.]+)\s*(l|lakh|lakhs|cr|crore|crores)/);
  if (bareMatch) {
    let val = parseFloat(bareMatch[1]);
    const unit = bareMatch[2];
    if (unit && unit.startsWith("cr")) val *= 100;
    return { max: val + 15, min: Math.max(0, val - 15) }; // ±15L tolerance
  }
  return {};
}

function detectCategory(text: string): string | null {
  const t = lower(text);
  if (/\bvilla\b/.test(t)) return "Villa";
  if (/\bplot(s)?\b|\bland\b|\blayout\b/.test(t)) return "Plots";
  if (/\bflat(s)?\b|\bapartment(s)?\b|\bbhk\b/.test(t)) return "Apartment";
  if (/\bcommercial\b|\boffice\b|\bretail\b|\bshop\b/.test(t)) return "Commercial";
  return null;
}

function detectStatus(text: string): string | null {
  const t = lower(text);
  if (/\bready\b|\bcompleted?\b|\bmove.?in\b|\bready.?to.?move\b/.test(t)) return "Completed";
  if (/\bongoing\b|\bunder.?construction\b|\bcurrent\b/.test(t)) return "Ongoing";
  if (/\bupcoming\b|\bnew.?launch\b|\bfuture\b/.test(t)) return "Upcoming";
  return null;
}

function detectConfig(text: string): string | null {
  const t = lower(text);
  const m = t.match(/(\d)\s*bhk/);
  return m ? `${m[1]} BHK` : null;
}

const LOCATION_KEYWORDS: Record<string, string[]> = {
  penamaluru: ["penamaluru"],
  gannavaram: ["gannavaram", "kesarapalli"],
  gunadala: ["gunadala", "inner ring road", "ring road"],
  vijayawada: ["vijayawada", "bezawada"],
  guntupalli: ["guntupalli"],
  "cbn nagar": ["cbn nagar", "cbn"],
  "gsr layout": ["gsr layout", "gsr"],
};

function detectLocations(text: string): string[] {
  const t = lower(text);
  const found: string[] = [];
  for (const [_loc, keywords] of Object.entries(LOCATION_KEYWORDS)) {
    if (keywords.some((kw) => t.includes(kw))) {
      found.push(...keywords);
    }
  }
  return found;
}

function matchesLocation(project: CatalogItem, locs: string[]): boolean {
  if (locs.length === 0) return true;
  const pl = lower(project.location) + " " + lower(project.city);
  return locs.some((l) => pl.includes(l));
}

function scoreProject(project: CatalogItem, query: string): number {
  let score = 0;
  const budget = extractBudget(query);
  const category = detectCategory(query);
  const status = detectStatus(query);
  const config = detectConfig(query);
  const locations = detectLocations(query);

  // Budget match
  if (budget.max !== undefined && project.priceFromLakh <= budget.max) score += 30;
  if (budget.min !== undefined && project.priceFromLakh >= budget.min) score += 10;
  if (budget.max !== undefined && project.priceFromLakh > budget.max) score -= 50;

  // Category match
  if (category && lower(project.category) === lower(category)) score += 25;
  if (category && lower(project.category) !== lower(category)) score -= 30;

  // Status match
  if (status && lower(project.status) === lower(status)) score += 20;

  // Config match
  if (config && lower(project.config).includes(lower(config))) score += 20;

  // Location match
  if (locations.length > 0 && matchesLocation(project, locations)) score += 25;
  if (locations.length > 0 && !matchesLocation(project, locations)) score -= 15;

  return score;
}

function searchProjects(query: string): CatalogItem[] {
  const scored = slvCatalog
    .map((p) => ({ project: p, score: scoreProject(p, query) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map((s) => s.project);
}

function formatProjectList(projects: CatalogItem[]): string {
  return projects
    .map(
      (p) =>
        `- **[${p.name}](/projects/${p.slug})** — ${p.config}, ${p.location}. *${p.status}*. Starting from **₹${p.priceFromLakh} Lakh**.`,
    )
    .join("\n");
}

/* ─── intent detection & response ─── */

interface Intent {
  type:
    | "greeting"
    | "project_search"
    | "emi"
    | "contact"
    | "about"
    | "investment"
    | "comparison"
    | "unknown";
}

function detectIntent(text: string): Intent {
  const t = lower(text);
  if (/^(hi|hello|hey|namaste|good\s?(morning|evening|afternoon)|greetings)\b/.test(t))
    return { type: "greeting" };
  if (/\bemi\b|\bloan\b|\binstallment\b|\bmonthly\b|\bfinance\b|\bbank\b/.test(t))
    return { type: "emi" };
  if (
    /\bcontact\b|\bcall\b|\bphone\b|\bvisit\b|\bsite visit\b|\bwhatsapp\b|\bschedule\b|\bappointment\b/.test(
      t,
    )
  )
    return { type: "contact" };
  if (
    /\babout slv\b|\bwho is slv\b|\bcompany\b|\bhistory\b|\bfounded\b|\bhow long\b|\byears\b/.test(
      t,
    )
  )
    return { type: "about" };
  if (/\binvest\b|\binvestment\b|\broi\b|\breturn\b|\bappreciation\b|\brental\b/.test(t))
    return { type: "investment" };
  if (/\bcompare\b|\bvs\b|\bdifference\b|\bbetter\b|\bwhich one\b/.test(t))
    return { type: "comparison" };
  // Default: treat as project search
  return { type: "project_search" };
}

/* ─── specific project name lookup ─── */
function findByName(text: string): CatalogItem | null {
  const t = lower(text);
  return slvCatalog.find((p) => t.includes(lower(p.name))) || null;
}

/* ─── main response generator ─── */

export function generateResponse(userMessage: string): string {
  const intent = detectIntent(userMessage);
  const specificProject = findByName(userMessage);

  // If user asks about a specific project by name
  if (specificProject) {
    return (
      `Here are the details for **${specificProject.name}**:\n\n` +
      `| Detail | Info |\n|---|---|\n` +
      `| **Type** | ${specificProject.category} |\n` +
      `| **Configuration** | ${specificProject.config} |\n` +
      `| **Location** | ${formatLocationCity(specificProject.location, specificProject.city)} |\n` +
      `| **Status** | ${specificProject.status} |\n` +
      `| **Starting Price** | ₹${specificProject.priceFromLakh} Lakh onwards |\n\n` +
      `👉 [View full project details](/projects/${specificProject.slug})\n\n` +
      `*Prices are indicative — contact our team for the latest pricing.*\n` +
      `📞 [Get in touch](/contact) or [Calculate EMI](/emi-calculator)`
    );
  }

  switch (intent.type) {
    case "greeting":
      return "Namaste! 🙏 Welcome to SLV Group.\n\nI can help you find the perfect property. Tell me:\n- Your **budget** (e.g. under ₹80 Lakh)\n- **Area** preference (e.g. Gunadala, Gannavaram)\n- **Type** (apartment, villa, plot)\n\nOr just ask me anything about our projects!";

    case "emi": {
      const projects = searchProjects(userMessage);
      let resp =
        "For EMI and loan calculations, you can use our **[EMI Calculator](/emi-calculator)** — it gives instant monthly payment estimates.\n\n";
      resp +=
        "💡 **Quick tip**: Most banks offer home loans at 8.5–9.5% p.a. for SLV projects with approved builder status.\n\n";
      if (projects.length > 0) {
        resp +=
          "Based on your query, these projects might interest you:\n\n" +
          formatProjectList(projects) +
          "\n\n";
      }
      resp += "For bank tie-up details, [contact our team](/contact).";
      return resp;
    }

    case "contact":
      return (
        "We'd love to assist you personally! 🙏\n\n" +
        "📋 **[Fill out our contact form](/contact)** and our team will reach out within 24 hours.\n\n" +
        "You can also:\n" +
        "- Schedule a **site visit** through the contact page\n" +
        "- Request a **callback** from our property consultants\n\n" +
        "*Our office hours: Mon–Sat, 9:30 AM – 6:30 PM*"
      );

    case "about":
      return (
        "**SLV Group Pvt Ltd** has been a trusted name in Vijayawada real estate since **2007**.\n\n" +
        "🏗️ **20+ years** of experience\n" +
        "🏢 **35+ residential projects** delivered\n" +
        "👨‍👩‍👧‍👦 **5,000+ happy families**\n" +
        "📍 Operating across **Vijayawada & Amaravati capital region**\n\n" +
        "From premium apartments and luxurious villas to investment-ready plots, we craft quality homes with modern amenities.\n\n" +
        "👉 [Learn more about us](/about)"
      );

    case "investment": {
      const plots = slvCatalog.filter((p) => p.category === "Plots");
      const ongoingApts = slvCatalog.filter(
        (p) => p.category === "Apartment" && p.status === "Ongoing",
      );
      let resp = "Great question! 📈 Here are some investment-friendly options:\n\n";
      resp += "**🏗️ Villa Plots** (highest appreciation potential):\n";
      if (plots.length > 0) resp += formatProjectList(plots) + "\n\n";
      resp += "**🏢 Ongoing Apartments** (buy at pre-completion prices):\n";
      if (ongoingApts.length > 0) resp += formatProjectList(ongoingApts.slice(0, 2)) + "\n\n";
      resp +=
        "💡 *Vijayawada & Amaravati region is seeing strong growth due to capital region development.*\n\n";
      resp += "For investment guidance, [talk to our consultants](/contact).";
      return resp;
    }

    case "comparison": {
      const projects = searchProjects(userMessage);
      if (projects.length >= 2) {
        let resp = "Here's a quick comparison:\n\n";
        resp += "| Feature | " + projects.map((p) => `**${p.name}**`).join(" | ") + " |\n";
        resp += "|---|" + projects.map(() => "---").join("|") + "|\n";
        resp += "| Type | " + projects.map((p) => p.category).join(" | ") + " |\n";
        resp += "| Config | " + projects.map((p) => p.config).join(" | ") + " |\n";
        resp += "| Location | " + projects.map((p) => p.location).join(" | ") + " |\n";
        resp += "| Status | " + projects.map((p) => p.status).join(" | ") + " |\n";
        resp += "| From | " + projects.map((p) => `₹${p.priceFromLakh}L`).join(" | ") + " |\n\n";
        resp += projects.map((p) => `👉 [${p.name}](/projects/${p.slug})`).join("  ·  ");
        return resp;
      }
      return 'I\'d be happy to compare projects! Could you tell me which **two projects** or **criteria** you\'d like me to compare? For example:\n- *"Compare apartments in Gunadala vs Gannavaram"*\n- *"Ongoing vs completed projects under ₹80L"*';
    }

    case "project_search": {
      const results = searchProjects(userMessage);
      if (results.length > 0) {
        return (
          "Here are the best matches for you:\n\n" +
          formatProjectList(results) +
          "\n\n" +
          "*Prices are starting-from figures. Contact our team for the latest offers.*\n" +
          "📞 [Schedule a visit](/contact) · 💰 [EMI Calculator](/emi-calculator)"
        );
      }
      // No match — show all categories
      const categories = [...new Set(slvCatalog.map((p) => p.category))];
      return (
        "I couldn't find an exact match for that query. Here's what we currently offer:\n\n" +
        categories
          .map((cat) => {
            const items = slvCatalog.filter((p) => p.category === cat);
            return `**${cat}s** (${items.length} projects): ₹${Math.min(...items.map((i) => i.priceFromLakh))}L – ₹${Math.max(...items.map((i) => i.priceFromLakh))}L`;
          })
          .join("\n") +
        "\n\n" +
        'Try asking with:\n- A **budget** (e.g. *"under ₹80 Lakh"*)\n- A **location** (e.g. *"near Gannavaram"*)\n- A **type** (e.g. *"3 BHK apartment"*)\n\n' +
        "Or [browse all projects](/projects)."
      );
    }

    default:
      return (
        "I'm here to help you find the perfect SLV property! You can ask me about:\n\n" +
        '🏠 **Projects** — *"3 BHK flat under ₹80L in Vijayawada"*\n' +
        '📍 **Locations** — *"Apartments near Gunadala"*\n' +
        '💰 **Budget** — *"Best options under ₹50 Lakh"*\n' +
        '📈 **Investment** — *"Plots for investment"*\n' +
        '🏗️ **Status** — *"Ready to move apartments"*\n\n' +
        "Or [browse all projects](/projects) · [Contact us](/contact)"
      );
  }
}

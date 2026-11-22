import { useEffect, useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { standardizeAmaravati } from "@/data/projects";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  COUNTRY_CODES,
  DEFAULT_COUNTRY_CODE,
  validatePhoneNumber,
  formatInternationalPhone,
  validateOptionalEmail,
} from "@/lib/country-codes";

type ProjectOption = {
  id: string;
  name: string;
  slug?: string;
  category?: string;
  bedrooms?: string;
};

// Fallback project list if offline or while DB loads
const FALLBACK_PROJECTS: ProjectOption[] = [
  { id: "slv-green-grandeur", name: "SLV Green Grandeur", bedrooms: "G+2", category: "Villa" },
  { id: "slv-green-meadows", name: "SLV Green Meadows", bedrooms: "3 & 4 BHK", category: "Villa" },
  {
    id: "slv-amaravati-pride",
    name: "SLV Amaravati Pride",
    bedrooms: "2 & 3 BHK",
    category: "Apartment",
  },
  {
    id: "slv-elite-spaces",
    name: "SLV Elite Spaces",
    bedrooms: "3 & 4 BHK",
    category: "Apartment",
  },
  {
    id: "slv-amaravati-grand-3",
    name: "SLV Amaravati Grand-3",
    bedrooms: "3 & 4 BHK",
    category: "Apartment",
  },
  { id: "slv-pnb-elite", name: "SLV PNB Elite", bedrooms: "2 BHK", category: "Apartment" },
  { id: "slv-green-lands", name: "SLV Green Lands", bedrooms: "Premium Plots", category: "Plots" },
  {
    id: "slv-green-horizon",
    name: "SLV Green Horizon",
    bedrooms: "Villa Plots",
    category: "Plots",
  },
  {
    id: "slv-greenhorizon-2",
    name: "SLV Green Horizon-2",
    bedrooms: "Villa Plots",
    category: "Plots",
  },
  { id: "slv-cbn-nagar", name: "SLV CBN Nagar", bedrooms: "Villa Plots", category: "Plots" },
  {
    id: "slv-tummala-complex",
    name: "SLV Tummala Complex",
    bedrooms: "Commercial",
    category: "Commercial",
  },
  { id: "slv-prime", name: "SLV Prime", bedrooms: "Commercial", category: "Commercial" },
];

const whatsappDirectMessage = encodeURIComponent(
  `Hello SLV Group,\n\nI am interested in your projects and would like more information regarding available properties, pricing, and site visits.\n\nPlease share the details.\n\nThank you.`,
);

export function ContactPopup() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState<ProjectOption[]>(FALLBACK_PROJECTS);

  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [phoneNumber, setPhoneNumber] = useState("");

  // WhatsApp checkbox: Default checked (primary phone is WhatsApp number)
  const [isWhatsAppSame, setIsWhatsAppSame] = useState(true);
  const [whatsappCountryCode, setWhatsappCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // Optional Email
  const [emailAddress, setEmailAddress] = useState("");

  // Interested In (Projects + General Enquiry + Others)
  const [selectedProject, setSelectedProject] = useState("");
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("slv_contact_popup_dismissed")) {
      return;
    }

    const timer = window.setTimeout(() => {
      setOpen(true);
    }, 100);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("id, name, slug, category, bedrooms")
          .eq("is_published", true)
          .eq("status", "Ongoing")
          .order("sort_order", { ascending: true });

        if (!error && data && data.length > 0) {
          setProjects(
            data.map((p) => ({
              ...p,
              name: standardizeAmaravati(p.name || ""),
            })) as ProjectOption[],
          );
        }
      } catch {
        // Retain fallback list
      }
    };

    loadProjects();
  }, []);

  const closePopup = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("slv_contact_popup_dismissed", "true");
    }
    setOpen(false);
  };

  const formatProjectOptionLabel = (p: ProjectOption): string => {
    // Specifically format Green Grandeur with G+2 Villa
    if (p.name.toLowerCase().includes("green grandeur") || p.slug === "slv-green-grandeur") {
      return `${p.name} (G+2 Villa)`;
    }

    // Green Meadows with 3 & 4 BHK
    if (p.name.toLowerCase().includes("green meadows") || p.slug === "slv-green-meadows") {
      return `${p.name} (3 & 4 BHK Villa)`;
    }

    if (p.bedrooms) {
      const cleanBedrooms = p.bedrooms.trim();
      if (p.category === "Villa" && !cleanBedrooms.toLowerCase().includes("villa")) {
        return `${p.name} (${cleanBedrooms} Villa)`;
      }
      return `${p.name} (${cleanBedrooms})`;
    }

    return p.name;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. Validate primary phone number
    const phoneVal = validatePhoneNumber(phoneNumber, countryCode);
    if (!phoneVal.isValid) {
      toast.error(phoneVal.error || "Please enter a valid phone number");
      return;
    }

    // 2. Validate optional email
    const emailVal = validateOptionalEmail(emailAddress);
    if (!emailVal.isValid) {
      toast.error(emailVal.error || "Please enter a valid email address");
      return;
    }

    // 3. Validate optional separate WhatsApp number if unchecked
    if (!isWhatsAppSame && whatsappNumber.trim()) {
      const waVal = validatePhoneNumber(whatsappNumber, whatsappCountryCode);
      if (!waVal.isValid) {
        toast.error(`WhatsApp Number: ${waVal.error || "Please enter a valid WhatsApp number"}`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const formattedPrimaryPhone = formatInternationalPhone(countryCode, phoneNumber);

      let whatsappInfo = "";
      if (isWhatsAppSame) {
        whatsappInfo = `Same as phone (${formattedPrimaryPhone})`;
      } else if (whatsappNumber.trim()) {
        whatsappInfo = formatInternationalPhone(whatsappCountryCode, whatsappNumber);
      } else {
        whatsappInfo = "Not provided";
      }

      // Determine project interest and label
      let projectLabel = "";
      let projectId: string | null = null;

      if (selectedProject === "others") {
        projectLabel = "Others";
      } else if (selectedProject === "general") {
        projectLabel = "General Enquiry";
      } else if (selectedProject) {
        const found = projects.find((p) => p.id === selectedProject || p.slug === selectedProject);
        if (found) {
          projectLabel = formatProjectOptionLabel(found);
          if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(found.id)) {
            projectId = found.id;
          }
        }
      }

      // Build structured message to preserve all metadata cleanly in leads table
      const formattedMessage = [
        selectedProject === "others"
          ? `[Enquiry Type]: Others\n[Interested In]: Others`
          : projectLabel
            ? `[Interested In]: ${projectLabel}`
            : null,
        `[WhatsApp Number]: ${whatsappInfo}`,
        messageText.trim() ? `[Message]:\n${messageText.trim()}` : null,
      ]
        .filter(Boolean)
        .join("\n\n");

      const { error } = await supabase.from("leads").insert({
        name: fullName.trim(),
        phone: formattedPrimaryPhone,
        email: emailAddress.trim() ? emailAddress.trim() : null,
        project_id: projectId,
        message: formattedMessage,
        source: "contact",
        status: "new",
      });

      if (error) throw error;

      toast.success("Thank you! Our relationship team will contact you shortly.");

      // Reset form
      setFullName("");
      setPhoneNumber("");
      setEmailAddress("");
      setWhatsappNumber("");
      setIsWhatsAppSame(true);
      setSelectedProject("");
      setMessageText("");

      closePopup();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit enquiry. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && closePopup()}>
      <DialogContent
        className="
          flex flex-col
          w-[calc(100vw-24px)]
          max-w-[calc(100vw-24px)]
          sm:max-w-xl
          gap-0
          p-0
          overflow-hidden
          rounded-3xl
          border-border/50
          bg-card/95
          shadow-2xl
          backdrop-blur-xl
          max-h-[calc(100vh-24px)]
          max-h-[calc(100dvh-24px)]
          sm:max-h-[min(90vh,780px)]
          box-border
        "
      >
        {/* Fixed Header */}
        <div className="relative shrink-0 border-b border-border/40 px-5 pt-5 pb-4 pr-12 text-left sm:px-8 sm:pt-7 sm:pb-5 sm:pr-14">
          <p className="section-label text-gold">Get in Touch</p>

          <DialogTitle className="mt-1.5 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Let&apos;s Find Your Home
          </DialogTitle>

          <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-muted-foreground break-words">
            Share your details and our relationship team will contact you shortly.
          </p>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-8 sm:py-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Full Name * & Phone Number * with Country Code */}
            <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4">
              <div className="min-w-0">
                <input
                  required
                  placeholder="Full Name *"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="box-border w-full rounded-xl bg-background px-3.5 py-3 text-base text-foreground neu-pressed focus:outline-none focus:ring-2 focus:ring-gold/40 sm:px-4 sm:text-sm"
                />
              </div>

              <div className="flex min-w-0 gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => {
                    setCountryCode(e.target.value);
                    if (isWhatsAppSame) setWhatsappCountryCode(e.target.value);
                  }}
                  aria-label="Country Code"
                  className="w-[84px] shrink-0 rounded-xl bg-background px-2 py-3 text-sm font-medium text-foreground neu-pressed focus:outline-none cursor-pointer sm:w-24 sm:text-xs"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option
                      key={c.code + c.iso}
                      value={c.code}
                      className="bg-background text-foreground"
                    >
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>

                <input
                  required
                  type="tel"
                  placeholder="Phone Number *"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="min-w-0 flex-1 rounded-xl bg-background px-3.5 py-3 text-base text-foreground neu-pressed focus:outline-none focus:ring-2 focus:ring-gold/40 sm:px-4 sm:text-sm"
                />
              </div>
            </div>

            {/* WhatsApp Checkbox: Subtle & Clean */}
            <div className="space-y-2 pt-0.5">
              <label className="flex items-start gap-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isWhatsAppSame}
                  onChange={(e) => setIsWhatsAppSame(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#d4af37] cursor-pointer"
                />
                <span className="leading-snug break-words">
                  Is the above number your WhatsApp number?
                </span>
              </label>

              {!isWhatsAppSame && (
                <div className="flex min-w-0 gap-2 animate-fade-down pt-1">
                  <select
                    value={whatsappCountryCode}
                    onChange={(e) => setWhatsappCountryCode(e.target.value)}
                    aria-label="WhatsApp Country Code"
                    className="w-[84px] shrink-0 rounded-xl bg-background px-2 py-3 text-sm font-medium text-foreground neu-pressed focus:outline-none cursor-pointer sm:w-24 sm:text-xs"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option
                        key={c.code + c.iso}
                        value={c.code}
                        className="bg-background text-foreground"
                      >
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>

                  <input
                    type="tel"
                    placeholder="WhatsApp Number (Optional)"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="min-w-0 flex-1 rounded-xl bg-background px-3.5 py-3 text-base text-foreground neu-pressed focus:outline-none focus:ring-2 focus:ring-gold/40 sm:px-4 sm:text-sm"
                  />
                </div>
              )}
            </div>

            {/* Email Address — OPTIONAL */}
            <input
              type="email"
              placeholder="Email Address (Optional)"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="box-border w-full rounded-xl bg-background px-3.5 py-3 text-base text-foreground neu-pressed focus:outline-none focus:ring-2 focus:ring-gold/40 sm:px-4 sm:text-sm"
            />

            {/* I'm interested in... with Projects + General Enquiry + Others */}
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="box-border w-full rounded-xl bg-background px-3.5 py-3 text-base text-foreground neu-pressed focus:outline-none cursor-pointer sm:px-4 sm:text-sm truncate"
            >
              <option value="">I&apos;m interested in…</option>

              {projects.map((project) => (
                <option
                  key={project.id}
                  value={project.id}
                  className="bg-background text-foreground"
                >
                  {formatProjectOptionLabel(project)}
                </option>
              ))}

              <option value="general" className="bg-background text-foreground">
                General Enquiry
              </option>
              <option value="others" className="bg-background text-foreground">
                Others
              </option>
            </select>

            {/* Message Textarea */}
            <textarea
              rows={3}
              placeholder="Tell us what you're looking for…"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="box-border w-full resize-none rounded-xl bg-background px-3.5 py-3 text-base text-foreground neu-pressed focus:outline-none focus:ring-2 focus:ring-gold/40 sm:px-4 sm:text-sm"
            />

            {/* Submit Buttons */}
            <div className="space-y-2.5 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
              {/* Submit Enquiry Button */}
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold py-3.5 text-sm font-semibold text-gold-foreground transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-lg"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Enquiry
              </button>

              {/* Chat on WhatsApp Button */}
              <a
                href={`https://wa.me/919859595939?text=${whatsappDirectMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-md"
              >
                <MessageCircle className="h-4 w-4" />
                Chat on WhatsApp
              </a>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

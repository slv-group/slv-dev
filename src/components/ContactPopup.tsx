import { useEffect, useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
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
    id: "slv-amaravathi-grand-3",
    name: "SLV Amaravathi Grand-3",
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
          setProjects(data as ProjectOption[]);
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
          w-[calc(100%-2rem)]
          max-w-xl
          overflow-y-auto
          rounded-3xl
          border-border/50
          bg-card/95
          p-5
          shadow-2xl
          backdrop-blur-xl
          sm:p-8
          max-h-[90vh]
        "
      >
        <DialogHeader className="pr-8 text-left">
          <p className="section-label text-gold">Get in Touch</p>

          <DialogTitle className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
            Let&apos;s Find Your Home
          </DialogTitle>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Share your details and our relationship team will contact you shortly.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Row 1: Full Name * & Phone Number * with Country Code */}
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Full Name *"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl bg-background px-4 py-3 text-sm text-foreground neu-pressed focus:outline-none focus:ring-2 focus:ring-gold/40"
            />

            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => {
                  setCountryCode(e.target.value);
                  if (isWhatsAppSame) setWhatsappCountryCode(e.target.value);
                }}
                aria-label="Country Code"
                className="w-24 shrink-0 rounded-xl bg-background px-2 py-3 text-xs font-medium text-foreground neu-pressed focus:outline-none cursor-pointer"
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
                className="flex-1 min-w-0 rounded-xl bg-background px-4 py-3 text-sm text-foreground neu-pressed focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
            </div>
          </div>

          {/* WhatsApp Checkbox: Subtle & Clean */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isWhatsAppSame}
                onChange={(e) => setIsWhatsAppSame(e.target.checked)}
                className="h-4 w-4 rounded accent-[#d4af37] cursor-pointer"
              />
              <span>Is the above number your WhatsApp number?</span>
            </label>

            {!isWhatsAppSame && (
              <div className="flex gap-2 animate-fade-down pt-1">
                <select
                  value={whatsappCountryCode}
                  onChange={(e) => setWhatsappCountryCode(e.target.value)}
                  aria-label="WhatsApp Country Code"
                  className="w-24 shrink-0 rounded-xl bg-background px-2 py-3 text-xs font-medium text-foreground neu-pressed focus:outline-none cursor-pointer"
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
                  className="flex-1 min-w-0 rounded-xl bg-background px-4 py-3 text-sm text-foreground neu-pressed focus:outline-none focus:ring-2 focus:ring-gold/40"
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
            className="w-full rounded-xl bg-background px-4 py-3 text-sm text-foreground neu-pressed focus:outline-none focus:ring-2 focus:ring-gold/40"
          />

          {/* I'm interested in... with Projects + General Enquiry + Others */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full rounded-xl bg-background px-4 py-3 text-sm text-foreground neu-pressed focus:outline-none cursor-pointer"
          >
            <option value="">I&apos;m interested in…</option>

            {projects.map((project) => (
              <option key={project.id} value={project.id} className="bg-background text-foreground">
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
            rows={4}
            placeholder="Tell us what you're looking for…"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="w-full resize-none rounded-xl bg-background px-4 py-3 text-sm text-foreground neu-pressed focus:outline-none focus:ring-2 focus:ring-gold/40"
          />

          {/* Submit Enquiry Button */}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold py-3.5 text-sm font-semibold text-gold-foreground transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit Enquiry
          </button>

          {/* Chat on WhatsApp Button */}
          <a
            href={`https://wa.me/919859595939?text=${whatsappDirectMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.01] cursor-pointer"
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
          </a>
        </form>
      </DialogContent>
    </Dialog>
  );
}

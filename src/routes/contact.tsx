import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Clock, MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  COUNTRY_CODES,
  DEFAULT_COUNTRY_CODE,
  validatePhoneNumber,
  formatInternationalPhone,
  validateOptionalEmail,
} from "@/lib/country-codes";

const message = encodeURIComponent(`Hello SLV Group,

I am interested in your projects and would like more information regarding available properties, pricing, and site visits.
Please share the details.

Thank you.`);

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — SLV Group | Vijayawada & Amaravati" },
      {
        name: "description",
        content:
          "Get in touch with SLV Group. Book a site visit, call +91 98595 95939 or +91 94598 23444, or visit our office at Ground Floor, SLV Tummala Complex, Gunadala, Inner Ring Road, Vijayawada, NTR District, Andhra Pradesh – 520004.",
      },
      { property: "og:site_name", content: "SLV Group" },
      { property: "og:title", content: "Contact SLV Group" },
      {
        property: "og:description",
        content: "Book a site visit or reach our relationship management team.",
      },
      { property: "og:url", content: "https://www.slvgroup.co.in/contact" },
      { property: "og:image", content: "https://www.slvgroup.co.in/slv-logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Contact SLV Group" },
      {
        name: "twitter:description",
        content: "Book a site visit or reach our relationship management team.",
      },
      { name: "twitter:image", content: "https://www.slvgroup.co.in/slv-logo.png" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://www.slvgroup.co.in/contact",
      },
    ],
  }),
  component: ContactPage,
});

const info = [
  {
    icon: MapPin,
    label: "Visit Us",
    value:
      "Ground Floor, SLV Tummala Complex, Opp. SLV PNB Commercial, Gunadala, Inner Ring Road, Vijayawada, NTR District, Andhra Pradesh – 520004.",
  },
  {
    icon: Phone,
    label: "Call Us",
    phones: [
      { value: "+91 98595 95939", href: "tel:+919859595939" },
      { value: "+91 94598 23444", href: "tel:+919459823444" },
    ],
  },
  {
    icon: Mail,
    label: "Email Us",
    value: "info@slvgroup.co.in",
    href: "mailto:info@slvgroup.co.in",
  },
  { icon: Clock, label: "Office Hours", value: "Mon – Sat · 9:30 AM to 7:00 PM" },
];

function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [phoneNumber, setPhoneNumber] = useState("");

  const [isWhatsAppSame, setIsWhatsAppSame] = useState(true);
  const [whatsappCountryCode, setWhatsappCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const [emailAddress, setEmailAddress] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [messageText, setMessageText] = useState("");

  const { data: dbProjects = [] } = useQuery({
    queryKey: ["published-projects-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, slug, bedrooms, category")
        .eq("is_published", true)
        .eq("status", "Ongoing")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const formatProjectName = (p: {
    name: string;
    slug?: string | null;
    bedrooms?: string | null;
    category?: string | null;
  }) => {
    if (p.name.toLowerCase().includes("green grandeur") || p.slug === "slv-green-grandeur") {
      return `${p.name} (G+2 Villa)`;
    }
    if (p.name.toLowerCase().includes("green meadows") || p.slug === "slv-green-meadows") {
      return `${p.name} (3 & 4 BHK Villa)`;
    }
    if (p.bedrooms) {
      const clean = p.bedrooms.trim();
      return `${p.name} (${clean})`;
    }
    return p.name;
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const phoneVal = validatePhoneNumber(phoneNumber, countryCode);
    if (!phoneVal.isValid) {
      toast.error(phoneVal.error || "Please enter a valid phone number");
      return;
    }

    const emailVal = validateOptionalEmail(emailAddress);
    if (!emailVal.isValid) {
      toast.error(emailVal.error || "Please enter a valid email address");
      return;
    }

    if (!isWhatsAppSame && whatsappNumber.trim()) {
      const waVal = validatePhoneNumber(whatsappNumber, whatsappCountryCode);
      if (!waVal.isValid) {
        toast.error(`WhatsApp Number: ${waVal.error || "Please enter a valid WhatsApp number"}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const formattedPhone = formatInternationalPhone(countryCode, phoneNumber);
      let waInfo = "";
      if (isWhatsAppSame) {
        waInfo = `Same as phone (${formattedPhone})`;
      } else if (whatsappNumber.trim()) {
        waInfo = formatInternationalPhone(whatsappCountryCode, whatsappNumber);
      } else {
        waInfo = "Not provided";
      }

      let projectLabel = "";
      let projectId: string | null = null;

      if (selectedProject === "others") {
        projectLabel = "Others";
      } else if (selectedProject === "general") {
        projectLabel = "General Enquiry";
      } else if (selectedProject) {
        const found = dbProjects.find(
          (p) => p.id === selectedProject || p.slug === selectedProject,
        );
        if (found) {
          projectLabel = formatProjectName(found);
          if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(found.id)) {
            projectId = found.id;
          }
        }
      }

      const formattedMessage = [
        selectedProject === "others"
          ? `[Enquiry Type]: Others\n[Interested In]: Others`
          : projectLabel
            ? `[Interested In]: ${projectLabel}`
            : null,
        `[WhatsApp Number]: ${waInfo}`,
        messageText.trim() ? `[Message]:\n${messageText.trim()}` : null,
      ]
        .filter(Boolean)
        .join("\n\n");

      const { error } = await supabase.from("leads").insert({
        name: fullName.trim(),
        phone: formattedPhone,
        email: emailAddress.trim() ? emailAddress.trim() : null,
        project_id: projectId,
        message: formattedMessage,
        source: "contact",
        status: "new",
      });

      if (error) throw error;
      toast.success("Thank you! Our relationship team will contact you shortly.");

      setFullName("");
      setPhoneNumber("");
      setEmailAddress("");
      setWhatsappNumber("");
      setIsWhatsAppSame(true);
      setSelectedProject("");
      setMessageText("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit enquiry. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="section-label text-gold">Get in Touch</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-foreground sm:text-6xl">
            Let's Find Your Home
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Share your details and our relationship team will reach out to schedule a private
            viewing.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          {/* Info + map */}
          <div className="space-y-4">
            {info.map((i) => (
              <div key={i.label} className="flex items-start gap-4 rounded-2xl bg-card p-5 neu-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-gold text-gold-foreground">
                  <i.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {i.label}
                  </p>
                  {"phones" in i && Array.isArray((i as any).phones) ? (
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                      {(i as any).phones.map((phone: { value: string; href: string }, idx: number) => (
                        <span key={phone.href} className="inline-flex items-center">
                          <a
                            href={phone.href}
                            className="font-medium text-foreground hover:text-gold transition-colors"
                          >
                            {phone.value}
                          </a>
                          {idx < (i as any).phones.length - 1 && (
                            <span className="hidden sm:inline mx-1.5 text-muted-foreground">•</span>
                          )}
                        </span>
                      ))}
                    </div>
                  ) : i.href ? (
                    <a
                      href={i.href}
                      className="font-medium text-foreground hover:text-gold transition-colors"
                    >
                      {i.value}
                    </a>
                  ) : (
                    <p className="font-medium text-foreground">{i.value}</p>
                  )}
                </div>
              </div>
            ))}
            <a
              href={`https://wa.me/919859595939?text=${message}`}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-4 text-sm font-semibold text-white"
            >
              <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
            </a>
            <div className="overflow-hidden rounded-3xl neu-sm">
              <iframe
                title="SLV Group Office Location"
                src="https://www.google.com/maps?q=SLV+Tummala+Complex,Gunadala,Vijayawada,Andhra+Pradesh+520004&output=embed"
                className="h-64 w-full border-0"
                loading="lazy"
              />
            </div>
          </div>

          {/* Form */}
          <div className="rounded-3xl bg-card p-8 neu">
            <h2 className="font-display text-2xl font-semibold text-foreground">Send an Enquiry</h2>
            <form className="mt-6 space-y-4" onSubmit={handleContactSubmit}>
              {/* Full Name */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground/80">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl bg-background px-4 py-3 text-sm neu-pressed focus:outline-none text-foreground"
                />
              </div>

              {/* Phone with Country Code */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground/80">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => {
                      setCountryCode(e.target.value);
                      if (isWhatsAppSame) setWhatsappCountryCode(e.target.value);
                    }}
                    aria-label="Country Code"
                    className="w-28 shrink-0 rounded-xl bg-background px-2.5 py-3 text-xs font-medium text-foreground neu-pressed focus:outline-none cursor-pointer"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option
                        key={c.code + c.iso}
                        value={c.code}
                        className="bg-background text-foreground"
                      >
                        {c.flag} {c.code} ({c.iso})
                      </option>
                    ))}
                  </select>
                  <input
                    required
                    type="tel"
                    placeholder={
                      COUNTRY_CODES.find((c) => c.code === countryCode)?.format || "Phone Number"
                    }
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 rounded-xl bg-background px-4 py-3 text-sm neu-pressed focus:outline-none text-foreground"
                  />
                </div>
              </div>

              {/* WhatsApp Checkbox Option */}
              <div className="rounded-xl border border-border/60 bg-background/50 p-3">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-medium text-foreground select-none">
                  <input
                    type="checkbox"
                    checked={isWhatsAppSame}
                    onChange={(e) => setIsWhatsAppSame(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-gold accent-[#d4af37] cursor-pointer"
                  />
                  <span>Is the above number your WhatsApp number?</span>
                </label>

                {!isWhatsAppSame && (
                  <div className="mt-3 pt-3 border-t border-border/40">
                    <label className="mb-1 block text-xs font-semibold text-foreground/80">
                      WhatsApp Number{" "}
                      <span className="text-muted-foreground font-normal">(Optional)</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={whatsappCountryCode}
                        onChange={(e) => setWhatsappCountryCode(e.target.value)}
                        aria-label="WhatsApp Country Code"
                        className="w-28 shrink-0 rounded-xl bg-background px-2.5 py-2.5 text-xs font-medium text-foreground neu-pressed focus:outline-none cursor-pointer"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option
                            key={c.code + c.iso}
                            value={c.code}
                            className="bg-background text-foreground"
                          >
                            {c.flag} {c.code} ({c.iso})
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        placeholder="WhatsApp Number"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="flex-1 rounded-xl bg-background px-4 py-2.5 text-sm text-foreground neu-pressed focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Email Address — OPTIONAL */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground/80">
                  Email Address{" "}
                  <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="Email Address (Optional)"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="w-full rounded-xl bg-background px-4 py-3 text-sm neu-pressed focus:outline-none text-foreground"
                />
              </div>

              {/* Project Selection with Others */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground/80">
                  Interested In
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  aria-label="Interested Project"
                  className="w-full rounded-xl bg-background px-4 py-3 text-sm text-foreground neu-pressed focus:outline-none cursor-pointer"
                >
                  <option value="">I&apos;m interested in…</option>
                  {dbProjects.map((p) => (
                    <option key={p.id} value={p.id} className="text-foreground bg-background">
                      {formatProjectName(p)}
                    </option>
                  ))}
                  <option value="general" className="text-foreground bg-background">
                    General Enquiry
                  </option>
                  <option value="others" className="text-foreground bg-background">
                    Others
                  </option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground/80">
                  Message <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell us what you're looking for…"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full resize-none rounded-xl bg-background px-4 py-3 text-sm neu-pressed focus:outline-none text-foreground"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-gold py-3.5 text-sm font-semibold text-gold-foreground transition-transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Enquiry
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

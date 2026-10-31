import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Clock, MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
          "Get in touch with SLV Group. Book a site visit, call +91 98595 95939, or visit our office in Mangalagiri, Guntur District, Andhra Pradesh.",
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
  { icon: Phone, label: "Call Us", value: "+91 98595 95939", href: "tel:+919859595939" },
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
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [messageText, setMessageText] = useState("");

  const { data: dbProjects = [] } = useQuery({
    queryKey: ["published-projects-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .eq("is_published", true)
        .eq("status", "Ongoing")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

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
                  {i.href ? (
                    <a
                      href={i.href}
                      className="font-medium text-foreground hover:text-gold-foreground"
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
            <form
              className="mt-6 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setSubmitting(true);
                try {
                  const projectId =
                    selectedProject && selectedProject !== "general" ? selectedProject : null;
                  const { error } = await supabase.from("leads").insert({
                    name: fullName,
                    phone: phoneNumber,
                    email: emailAddress,
                    project_id: projectId,
                    message: messageText || null,
                    source: "contact",
                    status: "new",
                  });
                  if (error) throw error;
                  toast.success("Thank you! Our team will contact you shortly.");
                  // Reset form fields
                  setFullName("");
                  setPhoneNumber("");
                  setEmailAddress("");
                  setSelectedProject("");
                  setMessageText("");
                } catch (err) {
                  toast.error(
                    err instanceof Error
                      ? err.message
                      : "Failed to submit enquiry. Please try again.",
                  );
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  required
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded-xl bg-background px-4 py-3 text-sm neu-pressed focus:outline-none text-foreground"
                />
                <input
                  required
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="rounded-xl bg-background px-4 py-3 text-sm neu-pressed focus:outline-none text-foreground"
                />
              </div>
              <input
                required
                type="email"
                placeholder="Email Address"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="w-full rounded-xl bg-background px-4 py-3 text-sm neu-pressed focus:outline-none text-foreground"
              />
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full rounded-xl bg-background px-4 py-3 text-sm text-foreground neu-pressed focus:outline-none"
              >
                <option value="">I'm interested in… (select)</option>
                {dbProjects.map((p) => (
                  <option key={p.id} value={p.id} className="text-foreground bg-background">
                    {p.name}
                  </option>
                ))}
                <option value="general" className="text-foreground bg-background">
                  General Enquiry
                </option>
              </select>
              <textarea
                rows={5}
                placeholder="Tell us what you're looking for…"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full resize-none rounded-xl bg-background px-4 py-3 text-sm neu-pressed focus:outline-none text-foreground"
              />
              <button
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-gold py-3.5 text-sm font-semibold text-gold-foreground transition-transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
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

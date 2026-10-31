import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDown,
  Globe,
  ShieldCheck,
  Home,
  CheckCircle,
  Loader2,
  FileText,
  Search,
  Headphones,
  MapPin as MapPinIcon,
  FileSignature,
  Handshake,
  PhoneCall,
  MessageCircle,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import nriHeroImage from "@/assets/nri/nri-hero.jpg";

export const Route = createFileRoute("/nri-corner")({
  head: () => ({
    meta: [
      { title: "NRI Corner — Real Estate Investments in Andhra Pradesh | SLV Group" },
      {
        name: "description",
        content:
          "Invest with confidence in Andhra Pradesh's growth corridor. Dedicated end-to-end investment assistance, legal due diligence, and property management for Non-Resident Indians.",
      },
      { property: "og:site_name", content: "SLV Group" },
      { property: "og:title", content: "NRI Corner — SLV Group" },
      {
        property: "og:description",
        content: "Dedicated real estate investment support for Non-Resident Indians.",
      },
      { property: "og:url", content: "https://www.slvgroup.co.in/nri-corner" },
      { property: "og:image", content: "https://www.slvgroup.co.in/slv-logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "NRI Corner — SLV Group" },
      {
        name: "twitter:description",
        content: "Dedicated real estate investment support for Non-Resident Indians.",
      },
      { name: "twitter:image", content: "https://www.slvgroup.co.in/slv-logo.png" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://www.slvgroup.co.in/nri-corner",
      },
    ],
  }),
  component: NriCornerPage,
});

const reasonsToChoose = [
  {
    icon: Globe,
    title: "Global Standards",
    desc: "Properties built to international standards with world-class amenities and premium finishes.",
  },
  {
    icon: ShieldCheck,
    title: "100% Transparency",
    desc: "Clear documentation, RERA compliance, and hassle-free remote processes for NRIs.",
  },
  {
    icon: Home,
    title: "Premium Locations",
    desc: "Strategically located properties ensuring high ROI and excellent rental yields.",
  },
  {
    icon: CheckCircle,
    title: "Dedicated Support",
    desc: "End-to-end assistance from our dedicated NRI relationship managers.",
  },
];

const journeySteps = [
  {
    num: "01",
    icon: FileText,
    title: "Share Your Requirement",
    desc: "Tell us about the type of property, location, configuration and budget you are looking for.",
  },
  {
    num: "02",
    icon: Search,
    title: "Explore Our Projects",
    desc: "Our team will share relevant project information, layouts, specifications, pricing and availability.",
  },
  {
    num: "03",
    icon: Headphones,
    title: "Virtual or Personalised Assistance",
    desc: "Can’t visit immediately? Connect with our team remotely and get the information you need to make an informed decision.",
  },
  {
    num: "04",
    icon: MapPinIcon,
    title: "Site Visit",
    desc: "When you are in India, we can help coordinate a project visit based on your schedule.",
  },
  {
    num: "05",
    icon: FileSignature,
    title: "Documentation & Purchase Process",
    desc: "Our team will guide you through the applicable documentation and transaction process.",
  },
  {
    num: "06",
    icon: Handshake,
    title: "Continued Support",
    desc: "We remain available to assist you with relevant post-purchase requirements and communication.",
  },
];

const faqs = [
  {
    q: "Can NRIs buy property in India?",
    a: "Yes, under the Foreign Exchange Management Act (FEMA), NRIs and Persons of Indian Origin (PIOs) can freely purchase residential or commercial properties in India.",
  },
  {
    q: "Are there any restrictions on the number of properties an NRI can own?",
    a: "No, there are no restrictions on the number of residential or commercial properties an NRI can own in India.",
  },
  {
    q: "Do NRIs need RBI permission to buy property?",
    a: "No special permission is required from the Reserve Bank of India (RBI) for purchasing residential or commercial properties.",
  },
  {
    q: "Can I get a home loan in India as an NRI?",
    a: "Yes, leading Indian banks and financial institutions offer home loans to NRIs for purchasing properties in India.",
  },
  {
    q: "Do I need to be present in India to complete the purchase?",
    a: "No, you can execute a Power of Attorney (PoA) favoring a trusted relative or friend in India to complete the property registration process on your behalf.",
  },
];

function NriCornerPage() {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    country: "",
    phone: "",
    email: "",
    projectId: "",
    requirement: "",
    configuration: "",
    budget: "",
    timeline: "",
    message: "",
  });

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { data: dbProjects = [] } = useQuery({
    queryKey: ["published-projects-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .eq("status", "Ongoing")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const detailedMessage = `
NRI Enquiry Details:
Country: ${formData.country}
Property Requirement: ${formData.requirement}
Configuration: ${formData.configuration}
Budget: ${formData.budget}
Investment Timeline: ${formData.timeline}

Message:
${formData.message}
      `.trim();

      const { error } = await supabase.from("leads").insert({
        name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        project_id: formData.projectId || null,
        message: detailedMessage,
        source: "contact", // Using 'contact' until 'nri' is added to the enum
        status: "new",
        notes: "NRI Enquiry",
      });

      if (error) throw error;
      toast.success("Thank you! Our NRI relationship manager will contact you shortly.");
      setFormData({
        fullName: "",
        country: "",
        phone: "",
        email: "",
        projectId: "",
        requirement: "",
        configuration: "",
        budget: "",
        timeline: "",
        message: "",
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit enquiry. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-24 min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative isolate min-h-[620px] overflow-hidden sm:min-h-[680px] lg:min-h-[760px]">
        {/* Hero background image */}
        <img
          src={nriHeroImage}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          style={{ objectPosition: "center 42%" }}
        />

        {/* Dark cinematic overlay */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-b from-black/55 via-black/45 to-black/75"
        />

        {/* Additional side gradient for text readability */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/30 to-black/10"
        />

        {/* Gold ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-10 -z-10 h-72 w-72 rounded-full bg-gold/15 blur-[120px] sm:h-96 sm:w-96"
        />

        <div className="relative z-10 mx-auto flex min-h-[620px] max-w-7xl items-center px-4 py-28 sm:min-h-[680px] sm:px-6 sm:py-32 lg:min-h-[760px] lg:px-8">
          <div className="max-w-4xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-3">
              <span className="section-label text-gold tracking-[0.28em]">
                Welcome Global Indians
              </span>

              <span className="h-px w-10 bg-gradient-gold sm:w-16" />
            </div>

            {/* Main heading */}
            <h1 className="mt-6 max-w-4xl font-display text-4xl font-bold leading-[0.95] tracking-[-0.035em] text-white sm:text-6xl lg:text-8xl">
              <span className="block">Invest in India.</span>

              <span className="mt-2 block text-gradient-gold">Build Your Future</span>

              <span className="mt-2 block text-white">with SLV Group.</span>
            </h1>

            {/* Supporting text */}
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg lg:text-xl">
              Seamless, transparent and rewarding real estate investments back home. Discover
              premium properties with dedicated support designed around the needs of NRIs.
            </p>

            {/* Accent line */}
            <div className="mt-8 flex max-w-xl items-center gap-3">
              <span className="h-px w-12 bg-gradient-gold sm:w-16" />
              <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
              <span className="h-px flex-1 bg-gold/30" />
            </div>

            {/* CTA */}
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#nri-enquiry"
                className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-gradient-gold
            px-6 py-3.5
            text-[10px]
            font-bold
            uppercase
            tracking-[0.18em]
            text-gold-foreground
            shadow-xl
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:shadow-2xl
          "
              >
                Explore Opportunities
                <ArrowDown className="h-3.5 w-3.5" />
              </a>

              <a
                href="#why-slv"
                className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            border border-white/20
            bg-black/20
            px-6 py-3.5
            text-[10px]
            font-bold
            uppercase
            tracking-[0.18em]
            text-white
            backdrop-blur-md
            transition-all
            duration-300
            hover:border-gold/50
            hover:bg-white/10
          "
              >
                Why SLV
              </a>
            </div>

            {/* Small trust indicators */}
            <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-[8px] font-bold uppercase tracking-[0.2em] text-white/50 sm:text-[9px]">
              <span>RERA Approved Projects</span>
              <span className="text-gold/50">•</span>
              <span>Since 2007</span>
              <span className="text-gold/50">•</span>
              <span>Dedicated NRI Assistance</span>
            </div>
          </div>
        </div>

        {/* Bottom scroll cue */}
        <div className="absolute bottom-7 left-1/2 z-20 -translate-x-1/2 sm:bottom-9">
          <a
            href="#why-slv"
            className="group flex flex-col items-center gap-2 text-white/60 transition-colors hover:text-gold"
          >
            <span className="text-[8px] font-semibold uppercase tracking-[0.3em]">Explore</span>

            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/20 backdrop-blur-md transition-all group-hover:border-gold/50 group-hover:bg-gold/10">
              <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
            </span>
          </a>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-slv" className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Why Choose SLV Developers?
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            We understand the unique needs of NRIs and provide specialized services to make your
            investment journey smooth and secure.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 animate-fade-up stagger-1">
          {reasonsToChoose.map((reason, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-3xl bg-card p-8 neu transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-gold/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-gold text-gold-foreground mb-6 shadow-lg shadow-gold/20">
                  <reason.icon className="h-6 w-6" />
                </span>
                <h3 className="mb-3 font-display text-xl font-bold text-foreground">
                  {reason.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{reason.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Journey Section */}
      <section className="mx-auto max-w-7xl px-6 py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/5 to-transparent pointer-events-none -z-10" />
        <div className="text-center mb-16 animate-fade-up">
          <p className="section-label text-gold mb-4 inline-block uppercase tracking-widest text-[0.65rem] font-bold">
            Simple Process
          </p>
          <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl mb-4">
            Your Property Journey,
            <span className="block italic text-gold font-light mt-2">Made Simple.</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            From discovering the right property to finalizing the paperwork, we ensure a seamless
            and transparent experience.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-up stagger-2">
          {journeySteps.map((step, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-[2rem] bg-card border border-border/50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-gold/10 hover:border-gold/30 flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background border border-gold/20 text-gold shadow-inner group-hover:bg-gold/10 transition-colors">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="font-display text-6xl font-black text-foreground/5 group-hover:text-gold/20 transition-colors duration-500">
                  {step.num}
                </span>
              </div>
              <h3 className="mb-4 font-display text-xl font-bold text-foreground group-hover:text-gold transition-colors">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form Section */}
      <section id="nri-enquiry" className="mx-auto max-w-4xl px-6 py-16 relative">
        <div className="absolute inset-0 bg-gold/5 rounded-3xl -z-10 blur-3xl opacity-50" />
        <div className="rounded-[2.5rem] bg-card p-8 sm:p-12 neu border border-gold/10 shadow-2xl animate-fade-up stagger-2">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Looking to Invest in India?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
              Tell us what you’re looking for and our NRI relationship team will get in touch with
              you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name*</label>
                <input
                  required
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl bg-background px-4 py-3.5 text-sm neu-pressed focus:outline-none focus:ring-1 focus:ring-gold/50 text-foreground transition-shadow"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Country of Residence*</label>
                <input
                  required
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Select Country"
                  className="w-full rounded-xl bg-background px-4 py-3.5 text-sm neu-pressed focus:outline-none focus:ring-1 focus:ring-gold/50 text-foreground transition-shadow"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Mobile / WhatsApp Number*
                </label>
                <input
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your number"
                  className="w-full rounded-xl bg-background px-4 py-3.5 text-sm neu-pressed focus:outline-none focus:ring-1 focus:ring-gold/50 text-foreground transition-shadow"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email Address*</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full rounded-xl bg-background px-4 py-3.5 text-sm neu-pressed focus:outline-none focus:ring-1 focus:ring-gold/50 text-foreground transition-shadow"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Preferred Project</label>
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-background px-4 py-3.5 text-sm text-foreground neu-pressed focus:outline-none focus:ring-1 focus:ring-gold/50 transition-shadow"
                >
                  <option value="">Select Project</option>
                  {dbProjects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-background text-foreground">
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Property Requirement</label>
                <select
                  name="requirement"
                  value={formData.requirement}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-background px-4 py-3.5 text-sm text-foreground neu-pressed focus:outline-none focus:ring-1 focus:ring-gold/50 transition-shadow"
                >
                  <option value="">Select Requirement</option>
                  <option value="Apartment" className="bg-background text-foreground">
                    Apartment
                  </option>
                  <option value="Villa" className="bg-background text-foreground">
                    Villa
                  </option>
                  <option value="Plot" className="bg-background text-foreground">
                    Plot
                  </option>
                  <option value="Other" className="bg-background text-foreground">
                    Other
                  </option>
                </select>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Preferred Configuration
                </label>
                <select
                  name="configuration"
                  value={formData.configuration}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-background px-4 py-3.5 text-sm text-foreground neu-pressed focus:outline-none focus:ring-1 focus:ring-gold/50 transition-shadow"
                >
                  <option value="">Select Configuration</option>
                  <option value="2 BHK" className="bg-background text-foreground">
                    2 BHK
                  </option>
                  <option value="3 BHK" className="bg-background text-foreground">
                    3 BHK
                  </option>
                  <option value="4 BHK" className="bg-background text-foreground">
                    4 BHK
                  </option>
                  <option value="Other" className="bg-background text-foreground">
                    Other
                  </option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Approximate Budget</label>
                <select
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-background px-4 py-3.5 text-sm text-foreground neu-pressed focus:outline-none focus:ring-1 focus:ring-gold/50 transition-shadow"
                >
                  <option value="">Select Budget</option>
                  <option value="Below ₹50 Lakhs" className="bg-background text-foreground">
                    Below ₹50 Lakhs
                  </option>
                  <option value="₹50 Lakhs - ₹1 Crore" className="bg-background text-foreground">
                    ₹50 Lakhs - ₹1 Crore
                  </option>
                  <option value="₹1 Crore - ₹2 Crores" className="bg-background text-foreground">
                    ₹1 Crore - ₹2 Crores
                  </option>
                  <option value="Above ₹2 Crores" className="bg-background text-foreground">
                    Above ₹2 Crores
                  </option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                When are you planning to invest?
              </label>
              <select
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
                className="w-full rounded-xl bg-background px-4 py-3.5 text-sm text-foreground neu-pressed focus:outline-none focus:ring-1 focus:ring-gold/50 transition-shadow"
              >
                <option value="">Select Timeline</option>
                <option value="Immediately" className="bg-background text-foreground">
                  Immediately
                </option>
                <option value="1–3 Months" className="bg-background text-foreground">
                  1–3 Months
                </option>
                <option value="3–6 Months" className="bg-background text-foreground">
                  3–6 Months
                </option>
                <option value="6+ Months" className="bg-background text-foreground">
                  6+ Months
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Message / Requirements</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                placeholder="Tell us what you are looking for"
                className="w-full resize-none rounded-xl bg-background px-4 py-3.5 text-sm neu-pressed focus:outline-none focus:ring-1 focus:ring-gold/50 text-foreground transition-shadow"
              />
            </div>

            <button
              disabled={submitting}
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-gold py-4 text-sm font-bold text-gold-foreground transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
              SUBMIT NRI ENQUIRY
            </button>
          </form>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-4xl px-6 py-16 animate-fade-up stagger-3">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-muted-foreground">Common queries from our global investors</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={cn(
                "group overflow-hidden rounded-2xl border transition-all duration-350",
                openFaq === i
                  ? "border-gold/40 bg-card shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                  : "border-border bg-card neu-sm hover:border-gold/30",
              )}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <span
                  className={cn(
                    "font-display text-base font-semibold leading-snug transition-colors duration-200",
                    openFaq === i ? "text-gold" : "text-foreground group-hover:text-foreground/90",
                  )}
                >
                  {faq.q}
                </span>
                <div
                  className={cn(
                    "ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background neu-pressed transition-transform duration-300",
                    openFaq === i && "rotate-180",
                  )}
                >
                  <ArrowDown className="h-4 w-4 text-gold" />
                </div>
              </button>
              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  openFaq === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-6 pt-2">
                    <p className="leading-relaxed text-muted-foreground text-sm">{faq.a}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-20 animate-fade-up stagger-4">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-obsidian p-10 sm:p-16 shadow-2xl">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Premium Divider Header */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-12 sm:w-24 bg-gradient-to-r from-transparent to-gold/50" />
              <Crown className="h-5 w-5 text-gold" />
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-gold whitespace-nowrap">
                Excellence in Every Detail
              </span>
              <Crown className="h-5 w-5 text-gold" />
              <div className="h-px w-12 sm:w-24 bg-gradient-to-l from-transparent to-gold/50" />
            </div>

            <h2 className="font-display text-4xl font-bold text-background sm:text-5xl mt-4">
              Prefer to speak with us?
            </h2>
            <p className="mt-6 max-w-xl text-background/70 text-base sm:text-lg">
              Our team is available to answer your questions and help you understand the next steps
              seamlessly.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 w-full">
              {/* Premium Call Button - Line 1 */}
              <a
                href="tel:+919859595939"
                className="group relative flex w-full sm:w-auto items-center gap-4 rounded-full bg-transparent border border-gold/30 px-6 py-3 transition-all duration-300 hover:bg-gold/10 hover:border-gold/60 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-gold text-gold-foreground shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-gold">
                    Call Us
                  </p>
                  <p className="font-display text-base sm:text-lg font-semibold text-background tracking-wide">
                    +91 98595 95939
                  </p>
                </div>
              </a>

              {/* Premium Call Button - Line 2 */}
              <a
                href="tel:+919459823444"
                className="group relative flex w-full sm:w-auto items-center gap-4 rounded-full bg-transparent border border-gold/30 px-6 py-3 transition-all duration-300 hover:bg-gold/10 hover:border-gold/60 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-gold text-gold-foreground shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-gold">
                    Call Us
                  </p>
                  <p className="font-display text-base sm:text-lg font-semibold text-background tracking-wide">
                    +91 94598 23444
                  </p>
                </div>
              </a>

              {/* Premium WhatsApp Button */}
              <a
                href="https://wa.me/919859595939"
                target="_blank"
                rel="noreferrer"
                className="group relative flex w-full sm:w-auto items-center gap-4 rounded-full bg-transparent border border-[#25D366]/30 px-6 py-3 transition-all duration-300 hover:bg-[#25D366]/10 hover:border-[#25D366]/60 hover:shadow-[0_0_30px_rgba(37,211,102,0.15)]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[#25D366]">
                    Chat With Us
                  </p>
                  <p className="font-display text-lg font-semibold text-background tracking-wide">
                    WhatsApp
                  </p>
                </div>
              </a>
            </div>

            <a
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold/80 transition-colors"
            >
              Or request a callback <ArrowDown className="h-4 w-4 -rotate-90" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

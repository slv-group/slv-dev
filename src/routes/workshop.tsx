/*import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/workshop')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/workshop"!</div>
}
  */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  HardHat,
  Hammer,
  Ruler,
  Compass,
  Wrench,
  Users,
  Calendar,
  MapPin,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/workshop")({
  head: () => ({
    meta: [
      { title: "Technical Workshops & Site Masterclasses — SLV Group" },
      {
        name: "description",
        content:
          "Hands-on workshops from SLV Group — site walkthroughs, design sessions, and industry masterclasses for architects, engineers, and real estate professionals.",
      },
      { property: "og:site_name", content: "SLV Group" },
      { property: "og:title", content: "Technical Workshops — SLV Group" },
      {
        property: "og:description",
        content:
          "Learn on-site with SLV Group. Practical workshops on structural engineering, sustainable architecture, and construction management.",
      },
      { property: "og:url", content: "https://www.slvgroup.co.in/workshop" },
      { property: "og:image", content: "https://www.slvgroup.co.in/slv-logo.png" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Technical Workshops — SLV Group" },
      {
        name: "twitter:description",
        content: "Practical workshops on design, construction, and materials with SLV Group.",
      },
      { name: "twitter:image", content: "https://www.slvgroup.co.in/slv-logo.png" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://www.slvgroup.co.in/workshop",
      },
    ],
  }),
  component: WorkshopPage,
});

const tracks = [
  {
    icon: Compass,
    title: "Design Studio",
    desc: "Space planning, façade language, and material palettes with our in-house architects.",
  },
  {
    icon: HardHat,
    title: "Site Walkthrough",
    desc: "Live construction site tours covering RCC, MEP, and finishing standards.",
  },
  {
    icon: Ruler,
    title: "Precision Detailing",
    desc: "Working drawings, tolerances, and shop-drawing reviews from our engineering desk.",
  },
  {
    icon: Wrench,
    title: "Materials Lab",
    desc: "Hands-on with premium finishes, fixtures, and hardware — sourcing to installation.",
  },
];

const sessions = [
  {
    title: "Modern Residential Facades",
    date: "Sat, 15 Feb",
    location: "SLV Head Office, Vijayawada",
    audience: "Architects & Consultants",
  },
  {
    title: "On-Site Quality Control",
    date: "Sat, 08 Mar",
    location: "SLV Amaravathi Grand Site",
    audience: "Contractors & Site Engineers",
  },
  {
    title: "Vendor Onboarding Clinic",
    date: "Sat, 22 Mar",
    location: "SLV Head Office, Vijayawada",
    audience: "Vendors & Suppliers",
  },
];

const perks = [
  "Certificate of participation",
  "Direct access to SLV design & tech leads",
  "Curated project reference kit",
  "Networking with industry partners",
];

function WorkshopPage() {
  return (
    <div className="pt-32 pb-24">
      {/* Hero */}
      <div className="mx-auto max-w-5xl px-6 text-center">
        <p className="section-label text-gold">Workshop</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-foreground sm:text-6xl">
          Build With <span className="text-gradient-gold">SLV</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Hands-on sessions for architects, consultants, contractors, and vendors — held at our head
          office and live project sites across Andhra Pradesh.
        </p>
      </div>

      {/* Tracks */}
      <div className="mx-auto mt-20 max-w-7xl px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="section-label text-gold">Tracks</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">
              Four disciplines, one philosophy
            </h2>
          </div>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tracks.map((t) => (
            <div key={t.title} className="rounded-3xl bg-card p-7 neu">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-gold text-gold-foreground">
                <t.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-foreground">{t.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming sessions */}
      <div className="mx-auto mt-28 max-w-7xl px-6">
        <p className="section-label text-gold">Calendar</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">
          Upcoming sessions
        </h2>
        <div className="mt-10 space-y-4">
          {sessions.map((s) => (
            <div
              key={s.title}
              className="flex flex-col gap-4 rounded-2xl bg-card p-5 neu-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">{s.title}</h3>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gold" /> {s.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gold" /> {s.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-gold" /> {s.audience}
                  </span>
                </div>
              </div>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-gold px-5 py-2.5 text-sm font-semibold text-gold-foreground transition-transform hover:scale-[1.02]"
              >
                Reserve seat <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* What you get */}
      <div className="mx-auto mt-28 max-w-7xl px-6">
        <div className="grid gap-10 rounded-3xl bg-gradient-obsidian p-10 lg:grid-cols-2 lg:p-14">
          <div>
            <p className="section-label text-gold">What you get</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-background sm:text-4xl">
              More than a classroom
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-background/70">
              Every workshop is anchored on a live SLV project, taught by the same team that designs
              and delivers our developments.
            </p>
          </div>
          <ul className="space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-3 text-background/90">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <span className="text-sm">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto mt-24 max-w-4xl px-6 text-center">
        <Hammer className="mx-auto h-8 w-8 text-gold" />
        <h2 className="mt-4 font-display text-3xl font-semibold text-foreground sm:text-4xl">
          Want a private workshop for your firm?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          We host bespoke sessions for architecture studios, contractor teams, and vendor
          collectives — on your schedule, at our sites.
        </p>
        <Link
          to="/contact"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-gold px-6 py-3 text-sm font-semibold text-gold-foreground transition-transform hover:scale-[1.02]"
        >
          Talk to our team <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

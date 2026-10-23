import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowRight,
  Award,
  Building2,
  Check,
  Clock3,
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

import heroImage from "@/assets/about_slv.jpg";
import chairmanImage from "@/assets/penmetsa_srinivasa_raju.png";
import executiveImage from "@/assets/management/srinivasa-raju-office.png";
import managementImage from "@/assets/management/srinivasa-raju-portrait.png";
import visionImage from "@/assets/concept-to-completion.jpg";

export const Route = createFileRoute("/management")({
  head: () => ({
    meta: [
      {
        title: "Leadership & Management — SLV Group",
      },
      {
        name: "description",
        content:
          "Discover the leadership vision, management philosophy and people behind SLV Group.",
      },
      {
        property: "og:title",
        content: "Leadership & Management — SLV Group",
      },
      {
        property: "og:description",
        content:
          "Discover the leadership vision, management philosophy and values behind SLV Group.",
      },
      {
        property: "og:image",
        content: heroImage,
      },
    ],
  }),
  component: ManagementPage,
});

type Principle = {
  no: string;
  title: string;
  description: string;
  icon: typeof ShieldCheck;
};

const principles: Principle[] = [
  {
    no: "01",
    title: "Customer Trust",
    description:
      "Building lasting relationships through transparency, consistency and a commitment to delivering on promises.",
    icon: HeartHandshake,
  },
  {
    no: "02",
    title: "Uncompromising Quality",
    description:
      "Maintaining high standards across planning, construction, materials, execution and customer experience.",
    icon: ShieldCheck,
  },
  {
    no: "03",
    title: "Timely Execution",
    description:
      "Strong planning and efficient time management keep every stage of development moving with purpose.",
    icon: Clock3,
  },
  {
    no: "04",
    title: "Continuous Progress",
    description:
      "Combining experience with technology, modern infrastructure and evolving architectural thinking.",
    icon: Lightbulb,
  },
];

const leadershipJourney = [
  {
    year: "Early Years",
    title: "A Foundation in Dairy",
    description:
      "Sri Penmetsa Srinivasa Raju began his professional journey in the dairy industry in Bhimavaram, West Godavari.",
  },
  {
    year: "2007",
    title: "Entering Construction",
    description:
      "Driven by the belief that owning a home can transform a family's life, he entered the construction industry and began building the SLV legacy.",
  },
  {
    year: "Growth",
    title: "Building a Trusted Name",
    description:
      "With integrity, commitment, hard work and efficient time management at its core, SLV expanded its presence and earned the trust of customers and industry partners.",
  },
  {
    year: "Today",
    title: "A Broader Vision",
    description:
      "SLV continues to focus on high-quality living spaces, from project conceptualisation and construction to operations and maintenance.",
  },
];

/*
 * IMPORTANT:
 * The official SLV Management page gives verified information about
 * Sri Penmetsa Srinivasa Raju.
 *
 * The other two people in the supplied photographs are not identified
 * on the official Management page. Their names/designations are therefore
 * intentionally left as placeholders instead of inventing information.
 */
const leadershipTeam = [
  {
    name: "Sri Penmetsa Srinivasa Raju",
    designation: "Chairman & Managing Director",
    role: "Founder Leadership",
    image: chairmanImage,
    imagePosition: "object-center",
    description:
      "The driving force behind SLV Group, Sri Penmetsa Srinivasa Raju began his professional journey in the dairy industry in Bhimavaram before entering the construction industry in 2007. His leadership philosophy centres on customer trust, uncompromising quality, hard work, efficient time management and creating excellent living environments.",
    highlights: [
      "Founded SLV's construction journey in 2007",
      "Customer trust and uncompromising quality",
      "Focus on excellent living environments",
    ],
    verified: true,
  },
  {
    name: "Vegesna Appala Narasiamha Raju (NANI)",
    designation: "Director",
    role: "Executive Leadership",
    image: executiveImage,
    imagePosition: "object-center",
    description:
      "A member of the SLV leadership team contributing to the organisation's continued growth, execution standards and customer-focused approach.",
    highlights: [
      "Strategic execution",
      "Customer-focused operations",
      "Supporting organisational growth",
    ],
    verified: false,
  },
  {
    name: "Uppalapati Chaitanya Kumar Varma",
    designation: "Director",
    role: "Management Leadership",
    image: managementImage,
    imagePosition: "object-center",
    description:
      "A member of the wider SLV management team supporting the organisation's operational discipline, project coordination and commitment to quality.",
    highlights: ["Operational coordination", "Project execution", "Quality-focused management"],
    verified: false,
  },
];

function CornerMarks() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
      <span className="absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2 border-gold/70" />
      <span className="absolute right-3 top-3 h-6 w-6 border-r-2 border-t-2 border-gold/70" />
      <span className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-gold/70" />
      <span className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-gold/70" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* LEADERSHIP PROFILE CARD                                                     */
/* -------------------------------------------------------------------------- */

function LeadershipProfile({
  member,
  reverse = false,
}: {
  member: (typeof leadershipTeam)[number];
  reverse?: boolean;
}) {
  return (
    <section className="relative overflow-hidden py-24 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "grid items-center gap-12 lg:grid-cols-2 lg:gap-20",
            reverse && "lg:[&>div:first-child]:order-2",
            reverse && "lg:[&>div:last-child]:order-1",
          )}
        >
          {/* IMAGE */}
          <Reveal>
            <div className="relative mx-auto w-full max-w-lg">
              <div
                aria-hidden
                className={cn(
                  "absolute h-32 w-32 border-gold/40",
                  reverse
                    ? "-right-5 -top-5 border-r-2 border-t-2 sm:-right-7 sm:-top-7"
                    : "-left-5 -top-5 border-l-2 border-t-2 sm:-left-7 sm:-top-7",
                )}
              />

              <div className="group relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_25px_90px_rgba(0,0,0,0.12)] sm:rounded-[2.5rem]">
                <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[3/4]">
                  <img
                    src={member.image}
                    alt={member.name}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    className={cn(
                      "h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]",
                      member.imagePosition,
                    )}
                  />

                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"
                  />

                  <CornerMarks />

                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 sm:pr-40">
                    <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-gold">
                      {member.role}
                    </p>

                    <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">
                      {member.name}
                    </h3>

                    <p className="mt-1 text-xs text-white/55 sm:text-sm">{member.designation}</p>
                  </div>
                </div>
              </div>

              {/* Floating role badge (visible on sm+ screens where there is space) */}
              <div className="hidden sm:block absolute -bottom-5 right-4 z-20 rounded-2xl border border-white/10 bg-gradient-obsidian px-5 py-3 text-white shadow-2xl sm:-bottom-6 sm:right-7 sm:px-6 sm:py-4">
                <p className="text-[7px] font-bold uppercase tracking-[0.24em] text-white/40">
                  SLV Leadership
                </p>

                <p className="mt-1 font-display text-base font-bold text-gold sm:text-lg">
                  {member.role}
                </p>
              </div>
            </div>
          </Reveal>

          {/* CONTENT */}
          <Reveal delay={120}>
            <div className="max-w-3xl">
              <p className="section-label text-gold">{member.role}</p>

              <h2 className="mt-5 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                Leadership
                <br />
                <span className="italic font-normal text-gradient-gold">in action.</span>
              </h2>

              <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
                {member.description}
              </p>

              <div className="mt-8 space-y-3">
                {member.highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="flex items-start gap-3 rounded-xl border border-border/70 bg-card/70 p-4"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                      <Check className="h-3 w-3" />
                    </span>

                    <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {highlight}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ManagementPage() {
  return (
    <main className="overflow-hidden bg-background">
      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-b from-secondary/80 via-background to-background"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute -right-48 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-gold/10 blur-[150px] sm:h-[700px] sm:w-[700px]"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute -left-48 bottom-0 -z-10 h-[360px] w-[360px] rounded-full bg-gold/5 blur-[130px]"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(212,175,55,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.45) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />

        <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 sm:pb-32 sm:pt-40 lg:px-8 lg:pb-40">
          <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            {/* LEFT */}
            <Reveal>
              <div className="max-w-2xl">
                <div className="flex items-center gap-3">
                  <p className="section-label tracking-[0.28em] text-gold">
                    Leadership & Management
                  </p>

                  <span className="h-px w-10 bg-gradient-gold sm:w-16" />
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[9px] font-bold uppercase tracking-[0.22em] text-muted-foreground sm:text-[10px]">
                  <span>SLV Group</span>
                  <span className="text-gold/40">•</span>
                  <span>Since 2007</span>
                  <span className="text-gold/40">•</span>
                  <span>Trust & Quality</span>
                </div>

                <h1 className="mt-7 font-display text-[clamp(2rem,4vw,5.5rem)] font-semibold leading-[0.88] tracking-[-0.045em] text-foreground">
                  Leadership
                  <br />
                  <span className="italic font-normal text-gradient-gold">with purpose.</span>
                </h1>

                <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl">
                  A legacy shaped by vision, customer trust and an unwavering commitment to quality
                  living.
                </p>

                <div className="mt-8 flex max-w-xl items-center gap-3">
                  <span className="h-px w-14 bg-gradient-gold" />
                  <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
                  <span className="h-px flex-1 bg-gold/15" />
                </div>

                <p className="mt-7 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  From the dairy industry in Bhimavaram to entering construction in 2007, Sri
                  Penmetsa Srinivasa Raju built SLV around a simple belief — create homes that bring
                  value, comfort and happiness to families.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="#chairman"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-gold px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-gold-foreground shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Meet the Chairman
                    <ArrowDown className="h-3.5 w-3.5" />
                  </a>

                  <a
                    href="#philosophy"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground backdrop-blur-sm transition-all duration-300 hover:border-gold/50 hover:bg-gold/5"
                  >
                    Our Philosophy
                  </a>
                </div>
              </div>
            </Reveal>

            {/* RIGHT */}
            <Reveal delay={120}>
              <div className="relative mx-auto w-full max-w-2xl">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-5 -top-5 h-28 w-28 border-r border-t border-gold/40 sm:-right-7 sm:-top-7 sm:h-40 sm:w-40"
                />

                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-5 -left-5 h-24 w-24 border-b border-l border-gold/30 sm:-bottom-7 sm:-left-7 sm:h-36 sm:w-36"
                />

                <div className="group relative overflow-hidden rounded-[2rem] border border-gold/15 bg-gradient-obsidian shadow-[0_35px_120px_rgba(0,0,0,0.28)] sm:rounded-[2.5rem]">
                  <img
                    src={heroImage}
                    alt="SLV Group"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    className="block aspect-[4/3] w-full object-cover transition-transform duration-1000 group-hover:scale-[1.025] sm:aspect-[5/4] lg:aspect-[4/3]"
                  />

                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"
                  />

                  <CornerMarks />

                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10 pr-28 sm:pr-36">
                    <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-gold">
                      Sri Lakshmi Venkateswara Group
                    </p>

                    <h2 className="mt-2 max-w-lg font-display text-base font-semibold leading-tight text-white sm:text-xl lg:text-2xl">
                      Building with vision.
                      <br />
                      Leading with trust.
                    </h2>
                  </div>
                </div>

                <div className="hidden sm:block absolute -bottom-6 right-4 z-20 rounded-2xl border border-white/10 bg-black/85 px-5 py-4 text-white shadow-2xl backdrop-blur-xl sm:-bottom-7 sm:right-7 sm:px-7 sm:py-5">
                  <p className="text-[6px] font-bold uppercase tracking-[0.24em] text-white/40">
                    Entered Construction
                  </p>

                  <p className="mt-1 font-display text-sm font-bold text-gold">2007</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =========================================================
          CHAIRMAN
      ========================================================== */}
      <div id="chairman">
        <LeadershipProfile member={leadershipTeam[0]} />
      </div>

      {/* =========================================================
          EXECUTIVE LEADERSHIP
      ========================================================== */}
      <section className="relative overflow-hidden bg-secondary/35">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 top-20 h-[420px] w-[420px] rounded-full bg-gold/5 blur-[130px]"
        />

        <LeadershipProfile member={leadershipTeam[1]} reverse />
      </section>

      {/* =========================================================
          MANAGEMENT LEADERSHIP
      ========================================================== */}
      <LeadershipProfile member={leadershipTeam[2]} />

      {/* =========================================================
          PHILOSOPHY
      ========================================================== */}
      <section
        id="philosophy"
        className="relative overflow-hidden bg-gradient-obsidian py-24 text-white sm:py-28 lg:py-32"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-150px] top-[-120px] h-[500px] w-[500px] rounded-full bg-gold/10 blur-[140px]"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute bottom-[-180px] left-[-150px] h-[420px] w-[420px] rounded-full bg-gold/5 blur-[120px]"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-3xl">
              <p className="section-label text-gold">Management Philosophy</p>

              <h2 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Principles that
                <br />
                <span className="italic font-normal text-gold">guide every decision.</span>
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
                The SLV approach is grounded in the values that have shaped its journey from the
                beginning — integrity, commitment, hard work, efficient time management, customer
                trust and uncompromising quality. These principles are consistent with the
                company&apos;s official management philosophy.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((principle, index) => {
              const Icon = principle.icon;

              return (
                <Reveal key={principle.no} delay={index * 90}>
                  <article className="group relative h-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 transition-all duration-500 hover:-translate-y-1 hover:border-gold/30 hover:bg-white/[0.06] sm:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 text-gold">
                        <Icon className="h-5 w-5" />
                      </div>

                      <span className="font-display text-4xl font-bold text-gold/15 transition-colors group-hover:text-gold/25">
                        {principle.no}
                      </span>
                    </div>

                    <h3 className="mt-7 font-display text-xl font-semibold text-white">
                      {principle.title}
                    </h3>

                    <div className="mt-4 h-px w-12 bg-gradient-gold" />

                    <p className="mt-4 text-sm leading-relaxed text-white/50">
                      {principle.description}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          LEADERSHIP JOURNEY
      ========================================================== */}
      <section className="relative py-24 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-3xl">
              <p className="section-label text-gold">Leadership Journey</p>

              <h2 className="mt-5 font-display text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
                From experience
                <br />
                <span className="italic font-normal text-gradient-gold">to enterprise.</span>
              </h2>
            </div>
          </Reveal>

          <div className="relative mt-14">
            <div
              aria-hidden
              className="absolute left-[8.333%] right-[8.333%] top-8 hidden h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent lg:block"
            />

            <div className="grid gap-8 lg:grid-cols-4 lg:gap-6">
              {leadershipJourney.map((item, index) => (
                <Reveal key={item.year} delay={index * 90}>
                  <article className="relative h-full rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-7">
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-gold bg-background text-gold shadow-[0_0_0_6px_rgba(212,175,55,0.08)]">
                        {index === 0 ? (
                          <Users className="h-5 w-5" />
                        ) : index === 1 ? (
                          <Building2 className="h-5 w-5" />
                        ) : index === 2 ? (
                          <Target className="h-5 w-5" />
                        ) : (
                          <Award className="h-5 w-5" />
                        )}
                      </div>

                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold">
                          {item.year}
                        </p>

                        <h3 className="mt-1 font-display text-xl font-semibold text-foreground">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MANAGEMENT MODEL
      ========================================================== */}
      <section className="relative overflow-hidden py-24 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <Reveal>
              <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_25px_90px_rgba(0,0,0,0.10)]">
                <img
                  src={visionImage}
                  alt="SLV development"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  className="aspect-[4/3] w-full object-cover"
                />

                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"
                />

                <CornerMarks />

                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-gold">
                    From Concept to Completion
                  </p>

                  <p className="mt-2 max-w-lg font-display text-sm font-semibold text-white sm:text-xl">
                    Leadership is reflected in every stage of the journey.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="max-w-2xl">
                <p className="section-label text-gold">Management Approach</p>

                <h2 className="mt-5 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl">
                  More than development.
                  <br />
                  <span className="italic font-normal text-gradient-gold">
                    A complete responsibility.
                  </span>
                </h2>

                <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  SLV describes its approach as covering the complete lifecycle of a project — from
                  conceptualisation and on-time construction through effective operations and prompt
                  maintenance.
                </p>

                <div className="mt-8 space-y-4">
                  {[
                    "Project conceptualisation and planning",
                    "Functional and architectural design",
                    "High-quality construction execution",
                    "Efficient operations and time management",
                    "Prompt post-completion maintenance",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                        <Check className="h-3 w-3" />
                      </span>

                      <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =========================================================
          CHAIRMAN MESSAGE
      ========================================================== */}
      <section className="px-4 pb-24 sm:px-6 sm:pb-28 lg:px-8 lg:pb-32">
        <Reveal>
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-obsidian px-6 py-14 text-white sm:px-10 sm:py-20 lg:px-16 lg:py-24">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gold/10 blur-[120px]"
            />

            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gold/5 blur-[110px]"
            />

            <div className="relative grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
              <div>
                <p className="section-label text-gold">Chairman's Message</p>

                <h2 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl">
                  Trust first.
                  <br />
                  <span className="italic font-normal text-gold">Quality always.</span>
                </h2>
              </div>

              <div>
                <p className="text-lg leading-relaxed text-white/75 sm:text-xl">
                  "The crux of SLV Group's foundation came up with the motto of earning customer
                  trust and uncompromising quality."
                </p>

                <p className="mt-6 text-base leading-relaxed text-white/55">
                  The Chairman's official message describes a leadership philosophy centred on
                  excellent living environments, latest technology and infrastructure, service
                  excellence and setting new benchmarks in residential construction.
                </p>

                <div className="mt-8 flex items-center gap-4">
                  <div className="h-px w-12 bg-gradient-gold" />

                  <div>
                    <p className="text-sm font-semibold text-white">Sri Penmetsa Srinivasa Raju</p>

                    <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-white/35">
                      Chairman & Managing Director — SLV Group
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* =========================================================
          CLOSING
      ========================================================== */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
        <Reveal>
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border border-gold/15 bg-card px-6 py-14 text-center sm:px-10 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/10 blur-[110px]"
            />

            <p className="section-label text-gold">Leadership that endures</p>

            <h2 className="relative mt-5 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              Building more than
              <br />
              <span className="italic font-normal text-gradient-gold">structures.</span>
            </h2>

            <p className="relative mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Creating homes, strengthening communities and building a legacy rooted in trust,
              quality and long-term relationships.
            </p>

            <a
              href="/"
              className={cn(
                "relative mt-8 inline-flex items-center gap-2 rounded-xl",
                "bg-gradient-gold px-6 py-3.5 text-[10px] font-bold",
                "uppercase tracking-[0.18em] text-gold-foreground",
                "shadow-xl transition-all duration-300 hover:-translate-y-0.5",
              )}
            >
              Explore SLV
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </Reveal>
      </section>
    </main>
  );
}

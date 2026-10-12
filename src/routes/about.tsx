import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Eye,
  Rocket,
  ArrowRight,
  Quote,
  MapPin,
  Building2,
  Award,
  ChevronDown,
  Download,
  Trophy,
  ShieldCheck,
  Medal,
  Star,
  Sparkles,
  Users,
  Handshake,
  HardHat,
  ArrowDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/about_slv.jpg";
import amaravathi from "@/assets/about/where-it-began.jpg";
import journey2 from "@/assets/about/slv-anjani-heights.jpg";
import journey3 from "@/assets/slv-image.png";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — SLV Group" },
      {
        name: "description",
        content:
          "Since 2007, SLV Group has crafted trusted homes across Bhimavaram, Vijayawada, and the Amaravati region — built on the 4 Ts: Trust, Teamwork, Timely Delivery, and Transparency.",
      },
      { property: "og:title", content: "About SLV Group" },
      {
        property: "og:description",
        content: "20 years of building trusted homes across Andhra Pradesh.",
      },
      { property: "og:image", content: heroImage },
    ],
  }),
  component: AboutPage,
});

const stats = [
  {
    value: "20+",
    label: "Years",
    note: "Building with trust",
  },
  {
    value: "35+",
    label: "Projects",
    note: "Residential & Commercial",
  },
  {
    value: "5000+",
    label: "Happy Families",
    note: "Homes & communities",
  },
  {
    value: "100%",
    label: "RERA Approved",
    note: "Built with transparency",
  },
];

const pillars = [
  { letter: "T", title: "Trust", desc: "Earned at every handshake, walkthrough, and handover." },
  { letter: "T", title: "Teamwork", desc: "Architects, engineers, and managers moving as one." },
  {
    letter: "T",
    title: "Timely Delivery",
    desc: "Every project handed over on the promised date.",
  },
  { letter: "T", title: "Transparency", desc: "Clear titles, clear pricing, and no surprises." },
];

const journey: {
  year: string;
  title: string;
  tag: string;
  img: string;
  icon: typeof MapPin;
  desc: ReactNode;
}[] = [
  {
    year: "2007",
    title: "Where It All Began",
    tag: "Bhimavaram, Andhra Pradesh",
    img: amaravathi,
    icon: MapPin,
    desc: "SLV Group was founded in Bhimavaram with a single intent — providing affordable housing and lands to families who dreamed of a home of their own.",
  },
  {
    year: "2015",
    title: "Into the Capital City",
    tag: "Vijayawada, Andhra Pradesh",
    img: journey2,
    icon: Building2,
    desc: (
      <>
        With over a decade of trust and excellence, SLV entered Vijayawada under the divine
        blessings of{" "}
        <strong className="font-semibold text-foreground">Sri Mavullamma Thalli</strong>,
        introducing <strong className="font-semibold text-foreground">SLV Anjani Heights</strong> —
        the capital region's first premium gated community, setting a new benchmark for modern
        living.
      </>
    ),
  },
  {
    year: "Today",
    title: "A Name People Trust",
    tag: "Across Andhra Pradesh",
    img: journey3,
    icon: Award,
    desc: "With 20 residential projects, 2 commercial projects, and an educational institute, SLV is a proud member of CREDAI–Vijayawada, IGBC, and NAREDCO — every project RERA approved.",
  },
];

// const awards = [
//   {
//     icon: Trophy,
//     year: "2023",
//     title: "Developer of the Year — Andhra Pradesh",
//     body: "Recognised by the Real Estate Excellence Council for consistent on-time delivery across residential portfolios.",
//   },
//   {
//     icon: Award,
//     year: "2022",
//     title: "Best Gated Community Project",
//     body: "Awarded to SLV Anjani Heights for design innovation, green cover, and community-first amenities.",
//   },
//   {
//     icon: ShieldCheck,
//     year: "2021",
//     title: "RERA Compliance Excellence",
//     body: "100% RERA-approved portfolio recognised for transparent titles, disclosures, and buyer protection.",
//   },
//   {
//     icon: Medal,
//     year: "2020",
//     title: "CREDAI Quality Construction Award",
//     body: "Honoured by CREDAI–Vijayawada for engineering standards and structural quality benchmarks.",
//   },
//   {
//     icon: Star,
//     year: "2019",
//     title: "Customer Trust Award",
//     body: "Voted among the most trusted builders in the Amaravati region by homeowner surveys.",
//   },
//   {
//     icon: Sparkles,
//     year: "2018",
//     title: "IGBC Green Building Recognition",
//     body: "Acknowledged by the Indian Green Building Council for sustainable design and material choices.",
//   },
// ];

const workWithUs = [
  {
    icon: Users,
    title: "Home Buyers",
    desc: "Discover RERA-approved apartments, villas, and plots crafted around your family's next chapter.",
    cta: "Explore Projects",
  },
  {
    icon: Handshake,
    title: "Channel Partners",
    desc: "Partner with a 19-year-old brand known for transparent pricing, timely delivery, and reliable payouts.",
    cta: "Become a Partner",
  },
  {
    icon: HardHat,
    title: "Contractors & Vendors",
    desc: "Join our approved supplier network for civil, MEP, interiors, and material supply across active sites.",
    cta: "Get Empanelled",
  },
  {
    icon: Building2,
    title: "Landowners",
    desc: "Unlock the value of your land through joint developments with a builder trusted by 5,000+ families.",
    cta: "Propose a Site",
  },
];

const growthData = [
  { year: "2021", clients: 40, projects: 20, completed: 10 },
  { year: "2022", clients: 60, projects: 30, completed: 18 },
  { year: "2023", clients: 80, projects: 45, completed: 25 },
  { year: "2024", clients: 100, projects: 55, completed: 35 },
  { year: "2025", clients: 110, projects: 65, completed: 42 },
  { year: "2026", clients: 120, projects: 75, completed: 50 },
];

/** Thin gold registration marks at the corners of a media frame — an
 *  architect's-drawing motif reused across the hero and journey sections. */
function CornerMarks() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10" aria-hidden>
      <span className="absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-gold/80" />
      <span className="absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-gold/80" />
      <span className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-gold/80" />
      <span className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-gold/80" />
    </div>
  );
}

/** Counts up to `end` once it scrolls into view. */
function CountUp({
  end,
  duration = 1600,
  className,
}: {
  end: number;
  duration?: number;
  className?: string;
}) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(Math.round(eased * end));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}

function AboutPage() {
  const projectPortfolio = { completed: 42, ongoing: 12, upcoming: 6 };
  const total = projectPortfolio.completed + projectPortfolio.ongoing + projectPortfolio.upcoming;
  return (
    <div className="overflow-hidden">
      {/* ---------- Legacy Hero ---------- */}
      <section className="relative mx-auto max-w-7xl px-4 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pt-40">
        {/* Architectural blueprint background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-10 -z-10 h-[620px] overflow-hidden opacity-[0.045]"
        >
          <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1200 620">
            <defs>
              <pattern id="about-blueprint" width="44" height="44" patternUnits="userSpaceOnUse">
                <path d="M 44 0 L 0 0 0 44" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>

            <rect width="1200" height="620" fill="url(#about-blueprint)" className="text-gold" />
          </svg>
        </div>

        {/* Ambient glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-20 -z-10 h-72 w-72 rounded-full bg-gold/10 blur-[120px] sm:h-96 sm:w-96"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 bottom-10 -z-10 h-64 w-64 rounded-full bg-gold/5 blur-[100px]"
        />

        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* =====================================================
        LEFT — Editorial Hero Copy
    ====================================================== */}
          <Reveal>
            <div className="max-w-xl xl:max-w-lg">
              <div className="flex items-center gap-3">
                <p className="section-label tracking-[0.28em] text-gold">ABOUT SLV DEVELOPERS</p>
                <span className="h-px w-10 bg-gradient-gold sm:w-16" />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[9px] font-bold uppercase tracking-[0.22em] text-muted-foreground sm:text-[10px]">
                <span>EST. 2007</span>
                <span className="text-gold/40">•</span>
                <span>Andhra Pradesh</span>
                <span className="text-gold/40">•</span>
                <span>TRUSTED LEGACY</span>
              </div>

              <h1 className="mt-7 font-display text-[clamp(2rem,4vw,5.5rem)] font-semibold leading-[0.9] tracking-[-0.04em] text-foreground">
                Building
                <br />
                <span className="italic font-normal text-gradient-gold">Legacies</span>
              </h1>

              {/* Near 20 years */}
              <div className="mt-5 flex items-end sm:mt-7">
                <span className="mr-2 pb-2 font-display text-sm italic text-foreground/60 sm:mr-3 sm:text-xl">
                  near
                </span>

                <CountUp
                  end={20}
                  className="
            font-display
            text-[clamp(2rem,4vw,5.5rem)]
            font-semibold
            leading-[0.78]
            tracking-[-0.05em]
            text-gradient-gold
            drop-shadow-[0_8px_28px_rgba(212,175,55,0.22)]
          "
                />

                <div className="mb-1 ml-2 border-l border-gold/30 pl-3 sm:ml-4 sm:pl-4">
                  <p className="font-display text-sm italic text-foreground/80 sm:text-md">years</p>

                  <p className="text-[7px] font-bold uppercase tracking-[0.24em] text-muted-foreground sm:text-[9px]">
                    of trust
                  </p>
                </div>
              </div>

              <div className="mt-8 flex max-w-xl items-center gap-3">
                <span className="h-px w-12 bg-gradient-gold sm:w-16" />
                <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
                <span className="h-px flex-1 bg-gold/20" />
              </div>

              <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl">
                Thoughtfully crafted homes and communities, built on trust since 2007.
              </p>

              <p className="mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl">
                From a humble beginning in Bhimavaram to communities across the Vijayawada and
                Amaravati region, SLV has grown by keeping one promise at the heart of every project
                — build with trust, deliver with purpose.
              </p>

              {/* Heritage line */}
              <div className="mt-7 max-w-md sm:mt-8">
                <div className="flex items-center gap-3 text-gold/70">
                  <span className="font-mono text-[9px] tracking-[0.2em] sm:text-[10px]">2007</span>

                  <span className="h-px flex-1 bg-gradient-to-r from-gold/60 to-gold/10" />

                  <span className="font-mono text-[9px] tracking-[0.2em] sm:text-[10px]">2026</span>
                </div>

                <div className="mt-2 flex justify-between text-[7px] uppercase tracking-[0.16em] text-muted-foreground sm:text-[8px]">
                  <span>Founded in Bhimavaram</span>
                  <span>A name families trust</span>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-7 flex flex-wrap gap-2.5 sm:mt-9 sm:gap-3">
                {/* Our Journey */}
                <a
                  href="#our-journey"
                  className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-gradient-gold
                  px-4
                  py-2.5
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-gold-foreground
                  shadow-lg
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:shadow-xl
                  sm:px-5
                  sm:py-3
                  sm:text-[10px]
                  cursor-pointer
                "
                >
                  Our Journey
                  <ArrowRight className="h-3 w-3" />
                </a>

                {/* Explore Projects */}
                <Link
                  to="/projects"
                  search={{ status: undefined }}
                  className="
                      inline-flex
                      items-center
                      rounded-xl
                      border
                      border-border
                      bg-card/50
                      px-4
                      py-2.5
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.16em]
                      text-foreground
                      backdrop-blur-sm
                      transition-all
                      duration-300
                      hover:border-gold/50
                      hover:bg-gold/5
                      sm:px-5
                      sm:py-3
                      sm:text-[10px]
                      cursor-pointer
                    "
                >
                  Explore Projects
                </Link>

                {/* Company Brochure */}
                <button
                  type="button"
                  onClick={() => {
                    // Add brochure download functionality later
                  }}
                  className="
                    group
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-gold/30
                    bg-gold/5
                    px-4
                    py-2.5
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-foreground
                    backdrop-blur-sm
                    transition-all
                    duration-300
                    hover:border-gold
                    hover:bg-gold/10
                    hover:text-gold
                    sm:px-5
                    sm:py-3
                    sm:text-[10px]
                    cursor-pointer
                    "
                >
                  <Download className="h-3.5 w-3.5 text-gold transition-transform duration-300 group-hover:-translate-y-0.5" />
                  Company Brochure
                </button>
              </div>
            </div>
          </Reveal>
          {/* =====================================================
        RIGHT — Cinematic Image
    ====================================================== */}
          <Reveal delay={140}>
            <div className="relative mx-auto w-full max-w-2xl lg:ml-auto">
              {/* Architectural outer marks */}
              <div
                aria-hidden
                className="
            pointer-events-none
            absolute
            -right-3
            -top-3
            h-20
            w-20
            border-r
            border-t
            border-gold/50
            sm:-right-5
            sm:-top-5
            sm:h-32
            sm:w-32
          "
              />

              <div
                aria-hidden
                className="
            pointer-events-none
            absolute
            -bottom-3
            -left-3
            h-20
            w-20
            border-b
            border-l
            border-gold/30
            sm:-bottom-5
            sm:-left-5
            sm:h-28
            sm:w-28
          "
              />

              {/* Main media */}
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-obsidian shadow-[0_30px_100px_rgba(0,0,0,0.2)] sm:rounded-[2.25rem]">
                <img
                  src={heroImage}
                  alt="An SLV residential landmark at twilight"
                  className="
              w-full
              object-cover
              transition-transform
              duration-1000
              hover:scale-[1.04]
              lg:aspect-[1]
            "
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                />

                {/* Cinematic overlays */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(7,8,15,0.9) 0%, rgba(7,8,15,0.28) 45%, rgba(7,8,15,0.05) 75%, transparent 100%)",
                  }}
                />

                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: "linear-gradient(to right, rgba(7,8,15,0.35), transparent 55%)",
                  }}
                />

                {/* Gold vertical accent */}
                <div
                  aria-hidden
                  className="absolute bottom-0 left-5 top-24 w-px bg-gradient-to-b from-transparent via-gold/60 to-transparent sm:left-7"
                />

                {/* Image caption */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                  <p className="text-[7px] font-bold uppercase tracking-[0.28em] text-gold">
                    A legacy in motion
                  </p>

                  <p className="mt-2 max-w-md font-display text-xs font-semibold leading-tight text-white sm:text-2xl lg:text-3xl">
                    Creating places
                    <br />
                    people are proud to call home.
                  </p>
                </div>

                {/* Corner marks */}
                <CornerMarks />
              </div>

              {/* Floating establishment badge */}
              <div
                className="
            absolute
            -bottom-5
            right-0
            z-20
            min-w-[135px]
            rounded-2xl
            border
            border-white/10
            bg-gradient-obsidian
            px-3
            py-2
            text-white
            shadow-2xl
            sm:-bottom-8
            sm:right-8
            sm:min-w-[160px]
            sm:px-4
            sm:py-3
          "
              >
                <p className="text-[6px] font-bold uppercase tracking-[0.25em] text-white/45">
                  Established
                </p>

                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-sm font-bold text-gold sm:text-3xl">2007</span>

                  <span className="text-[6px] text-white/45 sm:text-[10px]">Bhimavaram</span>
                </div>
              </div>

              {/* Small trust badge */}
              <div
                className="
            absolute
            left-3
            top-4
            z-20
            rounded-full
            border
            border-white/15
            bg-black/30
            px-3
            py-1.5
            backdrop-blur-xl
            sm:left-5
            sm:top-5
            sm:px-4
            sm:py-2
          "
              >
                <span className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.2em] text-white/85 sm:text-[9px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                  SLV Group
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Scroll cue */}
        <Reveal delay={260}>
          <a
            href="#our-journey"
            className="
        group
        mx-auto
        mt-16
        flex
        w-fit
        flex-col
        items-center
        gap-2
        text-muted-foreground
        transition-colors
        hover:text-gold
        sm:mt-20
      "
          >
            <span className="text-[8px] font-semibold uppercase tracking-[0.32em] sm:text-[9px]">
              Explore our story
            </span>

            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-all duration-300 group-hover:border-gold/50 group-hover:bg-gold/5">
              <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
            </span>
          </a>
        </Reveal>
      </section>

      {/* ---------- Statement ---------- */}
      <section className="mx-auto mt-16 max-w-5xl px-6 text-center">
        <Reveal>
          <h2 className="font-display text-3xl font-bold leading-tight text-foreground sm:text-5xl">
            Building Trust for <span className="text-gradient-gold">Generations</span>
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            With the able guidance and commitment of its founder, Sri Penmetsa Srinivasa Raju, SLV
            Group has grown across every format of construction. Owing to the patronage of loyal
            clients and the good word of mouth from buyers, SLV continues to set new benchmarks with
            quality construction — reaching the maximum audience while never compromising on the
            details that turn a building into a home.
          </p>
        </Reveal>
      </section>

      {/* ---------- Stats Legacy Metrics ---------- */}
      <section className="relative mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-obsidian px-6 py-12 text-background sm:px-10 sm:py-16 lg:px-16 lg:py-20">
            {/* Ambient glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-gold/10 blur-[130px]"
            />

            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-40 -left-40 h-[360px] w-[360px] rounded-full bg-gold/5 blur-[120px]"
            />

            <div className="relative">
              {/* Section intro */}
              <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-[clamp(0.55rem,0.8vw,0.625rem)] font-bold uppercase tracking-[0.3em] text-gold">
                    Our Legacy in Numbers
                  </p>

                  <h2
                    className="
                    mt-4
                    max-w-2xl
                    font-display
                    font-semibold
                    leading-[1.05]
                    tracking-[-0.02em]
                    text-[clamp(2rem,4.2vw,3.75rem)]"
                  >
                    Nearly two decades.
                    <br />
                    <span className="italic font-normal text-gold">Thousands of lives.</span>
                  </h2>
                </div>

                <p className="max-w-sm text-[clamp(0.78rem,1.1vw,1rem)] leading-relaxed text-white/50 lg:pb-1">
                  Every number represents a home delivered, a family served, and another step in the
                  journey of SLV.
                </p>
              </div>

              {/* Metrics */}
              <div className="relative mt-14 lg:mt-20">
                {/* Timeline */}
                <div
                  aria-hidden
                  className="absolute left-[12.5%] right-[12.5%] top-8 hidden h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent lg:block"
                />

                <div className="grid grid-cols-2 lg:grid-cols-4">
                  {stats.map((item, index) => (
                    <div
                      key={item.label}
                      className={cn(
                        "group relative px-4 py-8 sm:px-6 lg:px-8 lg:py-0",
                        index % 2 === 0 && "border-r border-white/10 lg:border-r-0",
                        index < 2 && "border-b border-white/10 lg:border-b-0",
                      )}
                    >
                      {/* Timeline node */}
                      <div className="hidden relative z-10 mx-auto md:flex w-fit items-center justify-center">
                        <div className="flex h-4 w-4 items-center justify-center rounded-full border border-gold/40 bg-obsidian">
                          <span className="h-1.5 w-1.5 rounded-full bg-gold transition-all duration-500 group-hover:scale-150" />
                        </div>
                      </div>

                      {/* Number */}
                      <div className="mt-7 text-center">
                        <p className="font-display text-[clamp(2.5rem,4vw,4rem)] font-semibold leading-none text-gradient-gold">
                          {item.value}
                        </p>

                        <p className="mt-4 font-display font-semibold text-white text-[clamp(0.85rem,1.4vw,1.125rem)]">
                          {item.label}
                        </p>

                        <p className="mt-2 text-[clamp(0.55rem,0.75vw,0.625rem)] uppercase tracking-[0.2em] text-white/35">
                          {item.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom statement */}
              <div className="mt-14 flex items-center justify-center gap-4 sm:mt-16">
                <span
                  className="h-px w-12 sm:w-20"
                  style={{ background: "var(--gradient-gold)" }}
                />

                <span className="text-center font-display text-sm italic text-white/45 sm:text-base">
                  Built with trust. Measured through impact.
                </span>

                <span
                  className="h-px w-12 sm:w-20"
                  style={{ background: "var(--gradient-gold)" }}
                />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- Vision & Mission ---------- */}
      <section className="mx-auto mt-24 max-w-7xl px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-3xl bg-card p-9 neu">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-gold text-gold-foreground">
                <Eye className="h-6 w-6" />
              </span>
              <h3 className="mt-6 font-display text-2xl font-semibold text-foreground">
                Our Vision
              </h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                To become the first choice for those who wish to acquire a dream property — and the
                sought-after name in the construction industry.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="h-full rounded-3xl bg-card p-9 neu">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-gold text-gold-foreground">
                <Rocket className="h-6 w-6" />
              </span>
              <h3 className="mt-6 font-display text-2xl font-semibold text-foreground">
                Our Mission
              </h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                To evolve with our customers' requirements, providing them contemporary, sustainable
                dwellings through the highest standards of quality and workmanship.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Brand Pillars (4 Ts) ---------- */}
      <section className="mx-auto mt-28 max-w-7xl px-6">
        <Reveal>
          <div className="text-center">
            <p className="section-label text-gold">Our Philosophy</p>
            <h2 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-5xl">
              Built on the <span className="text-gradient-gold">4 Ts</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              The foundation of SLV Group rests on four enduring principles.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 100}>
              <div className="group relative h-full overflow-hidden rounded-3xl bg-gradient-obsidian p-8 text-background">
                <span className="font-display text-7xl font-bold text-gold/25 transition-colors group-hover:text-gold/40">
                  {p.letter}
                </span>
                <h3 className="mt-2 font-display text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-background/65">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Our Journey ---------- */}
      <section id="our-journey" className="mx-auto mt-28 max-w-7xl px-6">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="section-label text-gold">Our Journey</p>
              <h2 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-5xl">
                A Journey Through the Years
              </h2>
              <p className="mt-3 max-w-md text-muted-foreground">
                Two decades, three milestones, one promise kept — traced from a single town to a
                name families across Andhra Pradesh recognize.
              </p>
            </div>
            <Link
              to="/projects"
              search={{ status: undefined }}
              className="group inline-flex items-center gap-2 text-sm font-semibold text-foreground"
            >
              Explore Our Projects
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-12 sm:mt-14">
          {journey.map((j, i) => {
            const Icon = j.icon;
            const isReversed = i % 2 === 1;

            return (
              <Reveal key={j.year}>
                {/* =========================================================
            MOBILE / TABLET TIMELINE
        ========================================================== */}
                <article className="relative lg:hidden">
                  {/* Vertical timeline rail */}
                  <div
                    aria-hidden
                    className="
              absolute
              bottom-0
              left-[17px]
              top-6
              w-px
              bg-gradient-to-b
              from-gold/60
              via-gold/25
              to-transparent
            "
                  />

                  {/* Timeline node */}
                  <div className="relative z-10 flex items-center gap-4">
                    <div
                      className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-gold/50
                bg-background
                text-gold
                shadow-[0_0_0_5px_rgba(212,175,55,0.06)]
              "
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="font-display text-3xl font-bold leading-none text-gold sm:text-4xl">
                        {j.year}
                      </p>

                      <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:text-[10px]">
                        {j.tag}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="ml-[4.25rem] mt-5 pb-14 sm:ml-[4.5rem] sm:pb-16">
                    {/* Image */}
                    <div className="group relative overflow-hidden rounded-[1.5rem] bg-card shadow-[var(--glass-shadow)] sm:rounded-[2rem]">
                      <img
                        src={j.img}
                        alt={j.title}
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                        className="
                        aspect-[16/10]
                        w-full
                        object-cover
                        transition-transform
                        duration-700
                        group-hover:scale-105
                        sm:aspect-[16/9]
                      "
                      />

                      {/* Bottom gradient */}
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
                        style={{
                          background: "linear-gradient(to top, rgba(7,8,15,0.55), transparent)",
                        }}
                      />

                      {/* Image year badge */}
                      <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                        {j.year}
                      </span>

                      <CornerMarks />
                    </div>

                    {/* Heading */}
                    <div className="mt-6">
                      <h3 className="font-display text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
                        {j.title}
                      </h3>

                      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {j.desc}
                      </p>
                    </div>
                  </div>
                </article>

                {/* =========================================================
            DESKTOP TIMELINE
        ========================================================== */}
                <article className="hidden lg:block">
                  <div className="my-10 grid items-center gap-8 lg:grid-cols-[1fr_auto_1fr]">
                    {/* Image */}
                    <div
                      className={cn(
                        "relative overflow-hidden rounded-[2rem] shadow-[var(--glass-shadow)]",
                        isReversed ? "lg:order-3" : "lg:order-1",
                      )}
                    >
                      <img
                        src={j.img}
                        alt={j.title}
                        className="aspect-[16/10] w-full object-cover transition-transform duration-700 hover:scale-105"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                      />

                      <CornerMarks />
                    </div>

                    {/* Center rail */}
                    <div className="order-2 flex h-full w-full flex-col items-center">
                      <span
                        className={cn("w-px flex-1", i === 0 ? "bg-transparent" : "bg-gold/25")}
                      />

                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-gold bg-background text-gold shadow-[0_0_0_6px_rgba(212,175,55,0.08)]">
                        <Icon className="h-6 w-6" />
                      </span>

                      <span
                        className={cn(
                          "w-px flex-1",
                          i === journey.length - 1 ? "bg-transparent" : "bg-gold/25",
                        )}
                      />
                    </div>

                    {/* Text */}
                    <div className={isReversed ? "lg:order-1" : "lg:order-3"}>
                      <span className="font-display text-6xl font-bold text-gold/30 sm:text-7xl">
                        {j.year}
                      </span>

                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {j.tag}
                      </p>

                      <h3 className="mt-2 font-display text-2xl font-semibold text-foreground sm:text-3xl">
                        {j.title}
                      </h3>

                      <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
                        {j.desc}
                      </p>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------- Awards & Recognition ---------- */}
      {/* <section className="mx-auto mt-28 max-w-7xl px-6">
        <Reveal>
          <div className="text-center">
            <p className="section-label text-gold">Recognition</p>
            <h2 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-5xl">
              Awards & <span className="text-gradient-gold">Recognition</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Milestones earned through trust, timely delivery, and uncompromised quality.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {awards.map((a, i) => {
            const Icon = a.icon;
            return (
              <Reveal key={a.title} delay={i * 90}>
                <div className="group relative h-full overflow-hidden rounded-3xl bg-card p-8 neu">
                  <div className="flex items-start justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-gold text-gold-foreground">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="font-display text-3xl font-bold text-gold/30 transition-colors group-hover:text-gold/50">
                      {a.year}
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-semibold text-foreground">
                    {a.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section> */}

      {/* ---------- Founder quote ---------- */}
      <section className="mx-auto mt-28 max-w-4xl px-6">
        <Reveal>
          <div className="relative rounded-[2rem] glass p-10 text-center sm:p-14">
            <Quote className="mx-auto h-9 w-9 text-gold" />
            <p className="mt-6 font-display text-2xl italic leading-relaxed text-foreground sm:text-3xl">
              "We don't just build structures — we build relationships that last generations."
            </p>
            <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Sri Penmetsa Srinivasa Raju · Founder, SLV Group
            </p>
          </div>
        </Reveal>
      </section>

      {/* ---------- Work With Us ---------- */}
      <section className="mx-auto mt-28 max-w-7xl px-6">
        <Reveal>
          <div className="text-center">
            <p className="section-label text-gold">Collaborate</p>
            <h2 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-5xl">
              Work <span className="text-gradient-gold">With Us</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Whether you're buying a home, partnering on sales, supplying our sites, or bringing us
              your land — there's a place for you in the SLV story.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {workWithUs.map((w, i) => {
            const Icon = w.icon;
            return (
              <Reveal key={w.title} delay={i * 100}>
                <div className="group flex h-full flex-col rounded-3xl bg-gradient-obsidian p-8 text-background">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold ring-1 ring-gold/30">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-6 font-display text-xl font-semibold">{w.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-background/65">{w.desc}</p>
                  <Link
                    to="/contact"
                    className="group/link mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold"
                  >
                    {w.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------- Growth Chart ---------- */}
      <section className="mx-auto mt-20 max-w-5xl px-6">
        <Reveal>
          <div className="rounded-[2rem] bg-card p-8 neu">
            <div className="text-center mb-8">
              <p className="text-sm uppercase tracking-[0.3em] text-gold">Our Journey</p>
              <h3 className="mt-4 font-display text-5xl font-bold text-foreground">Growth</h3>
              <p className="mt-2 text-muted-foreground">
                Building digital experiences that create impact.
              </p>
            </div>

            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="clients"
                  stroke="#d4af37"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  name="Clients"
                />
                <Line
                  type="monotone"
                  dataKey="projects"
                  stroke="#8884d8"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  name="Projects"
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#82ca9d"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  name="Completed Projects"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Reveal>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="mx-auto mt-24 max-w-7xl px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-obsidian px-8 py-16 text-center text-background sm:px-16">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/15 blur-3xl"
            />
            <h2 className="relative font-display text-3xl font-bold sm:text-5xl">
              Let's Build Your Future Together
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-background/70">
              Connect with our team to find a home that matches your aspirations.
            </p>
            <Link
              to="/contact"
              className="relative mt-8 inline-flex rounded-xl bg-gradient-gold px-8 py-3.5 text-sm font-semibold text-gold-foreground transition-transform hover:scale-[1.03]"
            >
              Get in Touch
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

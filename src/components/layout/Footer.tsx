import { Link, useRouterState } from "@tanstack/react-router";
import { MapPin, Phone, Mail, MessageCircle, ArrowUpRight, Crown } from "lucide-react";
import slvLogo from "@/assets/SLV_Group_Logo.png";

const ourStory = [
  { label: "About Us", to: "/about" },
  { label: "Leadership & Management", to: "/management" },
  { label: "Awards", to: "/awards" },
  { label: "CSR", to: "/csr" },
  { label: "Gallery", to: "/projects" },
];

const projectLinks = [
  { label: "Ongoing Projects", to: "/projects", search: { status: "ongoing" } },
  { label: "Upcoming Projects", to: "/projects", search: { status: "upcoming" } },
  { label: "Completed Projects", to: "/projects", search: { status: "completed" } },
] as const;

const workWithUs = [
  { label: "Careers", to: "/careers" },
  { label: "Architect & Consultant", to: "/careers" },
  { label: "Contractor Registration", to: "/careers" },
  { label: "Vendors & Suppliers", to: "/careers" },
  { label: "Land Proposals", to: "/land-proposals" },
  { label: "Work Shop", to: "/workshop" },
] as const;

const buyersGuide = [
  { label: "EMI Calculator", to: "/emi-calculator" },
  { label: "FAQ'S", to: "/faq" },
];

const message = encodeURIComponent(
  `Hello SLV Group,

I came across your website and I'm interested in learning more about your projects.

Could you please share details regarding:
• Available properties
• Pricing and payment plans
• Project locations
• Site visit availability

Looking forward to hearing from you.

Thank you.`,
);

export function Footer() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const scrollToTopIfSamePage = (target: string) => {
    if (pathname === target) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };
  return (
    <footer
      className="relative mt-24 overflow-hidden text-white"
      style={{ background: "var(--gradient-royal)" }}
    >
      {/* Top gold hairline */}
      <div className="absolute inset-x-0 top-0 h-px hairline-gold" />

      {/* Decorative glow orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full blur-[100px] opacity-15"
        style={{ background: "var(--color-gold)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full blur-[80px] opacity-8"
        style={{ background: "var(--color-gold)" }}
      />

      {/* Crown header bar */}
      <div className="relative border-b border-white/6 px-6 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-4">
          <div className="h-px w-24 opacity-20" style={{ background: "var(--gradient-gold)" }} />
          <p className="section-label text-gold/70 tracking-[0.35em]">Excellence In Every Detail</p>
          <div className="h-px w-24 opacity-20" style={{ background: "var(--gradient-gold)" }} />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        {/* Brand column */}
        <div>
          <span className="inline-flex rounded-2xl px-4 py-3 shadow-lg">
            <img src={slvLogo} alt="SLV Group" className="h-12 w-auto object-contain" />
          </span>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/55">
            SLV strives to develop high-quality properties in prime locations at an affordable
            price. With a focus on functional, cutting-edge architecture and premium materials, we
            make luxurious urban living possible — masterpieces in their own right.
          </p>

          {/* Certification badges */}
          <div className="mt-7 flex flex-wrap gap-2">
            {["RERA", "CREDAI", "IGBC", "NAREDCO", "AP CHAMBERS", "BAI"].map((b) => (
              <span
                key={b}
                className="rounded-lg px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-widest text-white/60 transition-all duration-300 hover:text-gold"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Our Story */}
        <div>
          <h4 className="section-label text-gold tracking-[0.28em]">Our Story</h4>
          <div
            className="mt-2 h-px w-8 opacity-40"
            style={{ background: "var(--gradient-gold)" }}
          />
          <ul className="mt-4 space-y-3.5">
            {ourStory.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  onClick={() => scrollToTopIfSamePage(l.to)}
                  className="group inline-flex items-center gap-1.5 text-sm text-white/55 transition-all duration-300 hover:text-gold"
                >
                  <span className="hover-gold-line">{l.label}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </li>
            ))}
          </ul>
          <h4 className="section-label mt-10 text-gold tracking-[0.28em]">Projects</h4>
          <div
            className="mt-2 h-px w-8 opacity-40"
            style={{ background: "var(--gradient-gold)" }}
          />
          <ul className="mt-4 space-y-3.5">
            {projectLinks.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  onClick={() => scrollToTopIfSamePage(l.to)}
                  search={l.search}
                  className="group inline-flex items-center gap-1.5 text-sm text-white/55 transition-all duration-300 hover:text-gold"
                >
                  <span>{l.label}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all duration-300 group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Work With Us + Projects */}
        <div>
          <h4 className="section-label text-gold tracking-[0.28em]">Work With Us</h4>
          <div
            className="mt-2 h-px w-8 opacity-40"
            style={{ background: "var(--gradient-gold)" }}
          />
          <ul className="mt-4 space-y-3.5">
            {workWithUs.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  onClick={() => scrollToTopIfSamePage(l.to)}
                  className="group inline-flex items-center gap-1.5 text-sm text-white/55 transition-all duration-300 hover:text-gold"
                >
                  <span>{l.label}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all duration-300 group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
          <h4 className="section-label mt-10 text-gold tracking-[0.28em]">Buyer's Guide</h4>
          <div
            className="mt-2 h-px w-8 opacity-40"
            style={{ background: "var(--gradient-gold)" }}
          />
          <ul className="mt-4 space-y-3.5">
            {buyersGuide.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  onClick={() => scrollToTopIfSamePage(l.to)}
                  className="group inline-flex items-center gap-1.5 text-sm text-white/55 transition-all duration-300 hover:text-gold"
                >
                  <span>{l.label}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all duration-300 group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="section-label text-gold tracking-[0.28em]">Registered Office</h4>
          <div
            className="mt-2 h-px w-8 opacity-40"
            style={{ background: "var(--gradient-gold)" }}
          />
          <p className="mt-6 flex gap-3 text-sm leading-relaxed text-white/55">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <span>
              <span className="block font-semibold text-white/80">SLV Group</span>
              8-56-68/5, Beside Tenali Flyover, Sri Saila Nagar, Ward No. 5, Mangalagiri, Guntur,
              Andhra Pradesh.
            </span>
          </p>

          <h4 className="section-label mt-10 text-gold tracking-[0.28em]">Connect</h4>
          <div
            className="mt-2 h-px w-8 opacity-40"
            style={{ background: "var(--gradient-gold)" }}
          />
          <ul className="mt-6 space-y-4 text-sm text-white/55">
            <li>
              <a
                href="tel:+919859595939"
                className="group flex items-center gap-3 transition-all duration-300 hover:text-gold"
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: "rgba(212,175,55,0.12)",
                    border: "1px solid rgba(212,175,55,0.2)",
                  }}
                >
                  <Phone className="h-3.5 w-3.5 text-gold" />
                </span>
                +91 98595 95939
              </a>
            </li>
            <li>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=slv.bvrm@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 transition-all duration-300 hover:text-gold"
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: "rgba(212,175,55,0.12)",
                    border: "1px solid rgba(212,175,55,0.2)",
                  }}
                >
                  <Mail className="h-3.5 w-3.5 text-gold" />
                </span>
                slv.bvrm@gmail.com
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/919859595939?text=${message}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 transition-all duration-300 hover:text-gold"
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: "rgba(212,175,55,0.12)",
                    border: "1px solid rgba(212,175,55,0.2)",
                  }}
                >
                  <MessageCircle className="h-3.5 w-3.5 text-gold" />
                </span>
                WhatsApp Us
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom strip */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-white/35 sm:flex-row">
          <p>© {new Date().getFullYear()} SLV Group. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <div className="h-px w-4 opacity-30" style={{ background: "var(--color-gold)" }} />
            <p>RERA Registered · Crafted for discerning homeowners.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

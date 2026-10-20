import { useEffect, useState, useRef, useCallback, Fragment } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, Phone, Crown, ChevronDown, ArrowUpRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import slvLogo from "@/assets/SLV_Group_Logo.png";

const ourStoryLinks = [
  { label: "About Us", to: "/about" },
  { label: "Leadership & Management", to: "/management" },
  { label: "Awards", to: "/awards" },
  { label: "CSR", to: "/csr" },
  { label: "Gallery", to: "/projects" },
];

const buyersGuideLinks = [
  { label: "EMI Calculator", to: "/emi-calculator" },
  { label: "FAQ'S", to: "/faq" },
];

const projectLinks = [
  { label: "Ongoing Projects", to: "/projects", search: { status: "ongoing" } },
  { label: "Upcoming Projects", to: "/projects", search: { status: "upcoming" } },
  { label: "Completed Projects", to: "/projects", search: { status: "completed" } },
];

const workLinks = [
  {
    label: "Careers",
    to: "/careers",
  },
  {
    label: "Architect & Consultant",
    to: "/architect-consultant-registration",
  },
  {
    label: "Contractor Registration",
    to: "/contractor-registration",
  },
  {
    label: "Vendors & Suppliers",
    to: "/vendors-suppliers-registration",
  },
  {
    label: "Land Proposals",
    to: "/land-proposals",
  },
  {
    label: "Workshop",
    to: "/workshop",
  },
];

type DropdownKey = "ourStory" | "projects" | "work" | "buyersGuide";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileOurStoryOpen, setMobileOurStoryOpen] = useState(false);
  const [mobileProjectsOpen, setMobileProjectsOpen] = useState(false);
  const [mobileWorkOpen, setMobileWorkOpen] = useState(false);
  const [mobileBuyersGuideOpen, setMobileBuyersGuideOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownKey | null>(null);

  const dropdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const scrollToTopIfSamePage = (target: string) => {
    if (pathname === target) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const openDropdown = useCallback((key: DropdownKey) => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setActiveDropdown(key);
  }, []);

  const closeDropdown = useCallback(() => {
    dropdownTimerRef.current = setTimeout(() => setActiveDropdown(null), 150);
  }, []);

  const toggleDropdown = useCallback((key: DropdownKey) => {
    setActiveDropdown((prev) => (prev === key ? null : key));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const renderDropdown = (
    key: DropdownKey,
    label: string,
    links: Array<{ label: string; to: string; search?: Record<string, string> }>,
    minWidth = "230px",
  ) => (
    <div
      className="relative"
      onMouseEnter={() => openDropdown(key)}
      onMouseLeave={closeDropdown}
    >
      <button
        onClick={() => toggleDropdown(key)}
        className={cn(
          "flex items-center gap-1 rounded-lg px-3 py-2 text-[0.82rem] font-medium transition-all duration-300 cursor-pointer",
          scrolled ? "text-black/50 hover:text-foreground" : "text-white/70 hover:text-white",
        )}
      >
        {label}
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform",
            activeDropdown === key ? "rotate-180" : "",
          )}
        />
      </button>

      {activeDropdown === key && (
        <div
          className="absolute left-0 top-full pt-1 z-50"
          style={{ minWidth }}
          onMouseEnter={() => openDropdown(key)}
          onMouseLeave={closeDropdown}
        >
          <div className="rounded-2xl border border-white/10 bg-black/80 p-4 backdrop-blur-xl">
            <ul className="space-y-3">
              {links.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    search={item.search}
                    onClick={() => {
                      scrollToTopIfSamePage(item.to);
                      setActiveDropdown(null);
                    }}
                    className="flex items-center justify-between text-sm text-white/70 hover:text-gold"
                  >
                    {item.label}
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-6">
      {/* Ambient top glow when scrolled */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-32 transition-opacity duration-700",
          scrolled ? "opacity-0" : "opacity-100",
        )}
        style={{
          background: "linear-gradient(to bottom, rgba(15,15,15,0.20) 0%, transparent 100%)",
        }}
        aria-hidden
      />

      <nav
        ref={navRef}
        className={cn(
          "relative mx-auto flex max-w-7xl items-center justify-between rounded-full px-5 py-3.5 transition-all duration-700 sm:px-7",
          scrolled
            ? "navbar-light border border-white/25 bg-white/[0.10] backdrop-blur-[28px] shadow-[0_8px_40px_rgba(0,0,0,0.22)]"
            : "navbar-dark border border-white/10 bg-black/25 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.25)]",
        )}
      >
        <div className="absolute inset-0 overflow-hidden rounded-[28px] pointer-events-none">
          <div className="navbar-shine absolute top-0 left-0 h-full w-56" />
        </div>

        {/* Thin gold hairline border glow at bottom of nav */}
        <div
          className={cn(
            "pointer-events-none absolute inset-x-6 bottom-0 h-px transition-opacity duration-700",
            scrolled ? "opacity-100" : "opacity-40",
          )}
          style={{
            background: "linear-gradient(90deg, transparent, var(--color-gold), transparent)",
          }}
          aria-hidden
        />

        {/* Logo */}
        <Link
          to="/"
          onClick={() => scrollToTopIfSamePage("/")}
          className="group flex items-center gap-2.5 outline-none"
        >
          <span
            className={
              "flex items-center justify-center rounded-xl p-1.5 transition-all duration-300"
            }
          >
            <img
              src={slvLogo}
              alt="SLV Group"
              className="h-9 w-auto sm:h-10 md:h-11 object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-[0_2px_10px_rgba(201,168,76,0.3)]"
            />
          </span>
        </Link>

        {/* Desktop links — xl breakpoint (1280px+) to prevent wrapping on tablets */}
        <div className="hidden items-center gap-1 xl:flex">
          {/* Home */}
          <Link
            to="/"
            onClick={() => scrollToTopIfSamePage("/")}
            className={cn(
              "rounded-lg px-3 py-2 text-[0.82rem] font-medium transition-all duration-300",
              pathname === "/"
                ? scrolled
                  ? "text-foreground"
                  : "text-white"
                : scrolled
                  ? "text-black/50 hover:text-foreground"
                  : "text-white/70 hover:text-white",
            )}
          >
            Home
          </Link>

          {/* Our Story */}
          {renderDropdown("ourStory", "Our Story", ourStoryLinks, "230px")}

          {/* Projects */}
          {renderDropdown("projects", "Projects", projectLinks, "230px")}

          {/* Work With Us */}
          {renderDropdown("work", "Work With Us", workLinks, "260px")}

          {/* Buyer's Guide */}
          {renderDropdown("buyersGuide", "Buyer's Guide", buyersGuideLinks, "200px")}

          {/* NRI Corner */}
          <Link
            to="/nri-corner"
            onClick={() => scrollToTopIfSamePage("/nri-corner")}
            className={cn(
              "rounded-lg px-3 py-2 text-[0.82rem] font-medium transition-all duration-300",
              pathname === "/nri-corner"
                ? scrolled
                  ? "text-foreground"
                  : "text-white"
                : scrolled
                  ? "text-black/50 hover:text-foreground"
                  : "text-white/70 hover:text-white",
            )}
          >
            NRI Corner
          </Link>

          {/* Contact */}
          <Link
            to="/contact"
            onClick={() => scrollToTopIfSamePage("/contact")}
            className={cn(
              "rounded-lg px-3 py-2 text-[0.82rem] font-medium transition-all duration-300",
              pathname === "/contact"
                ? scrolled
                  ? "text-foreground"
                  : "text-white"
                : scrolled
                  ? "text-black/50 hover:text-foreground"
                  : "text-white/70 hover:text-white",
            )}
          >
            Contact Us
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/site-visit"
            onClick={() => scrollToTopIfSamePage("/site-visit")}
            className="group hidden items-center gap-2 overflow-hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-gold-foreground shadow-lg transition-all duration-300 hover:scale-[1.04] hover:shadow-xl xl:flex"
            style={{ background: "var(--gradient-gold)" }}
          >
            <MapPin className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
            <span>Book Your Site</span>
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 xl:hidden cursor-pointer",
              scrolled ? "text-foreground hover:bg-secondary" : "text-gold hover:bg-white/15",
            )}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="mx-auto mt-2 max-w-7xl max-h-[calc(100dvh-100px)] overflow-y-auto overscroll-contain [scrollbar-width:thin] animate-slide-down rounded-2xl border border-white/10 bg-black/60 p-3 backdrop-blur-[30px] xl:hidden shadow-2xl">
          {/* Crown accent */}
          <div className="mb-2 flex items-center gap-2 px-3 py-1.5 border-b border-border/50">
            <Crown className="h-3.5 w-3.5 text-gold" />
            <span className="section-label text-gold">Navigation</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <Link to="/" className="rounded-xl px-4 py-3 text-gold">
              Home
            </Link>

            <button
              onClick={() => setMobileOurStoryOpen((o) => !o)}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-gold cursor-pointer"
            >
              Our Story
              <ChevronDown
                className={`h-4 w-4 transition-transform ${mobileOurStoryOpen ? "rotate-180" : ""}`}
              />
            </button>

            {mobileOurStoryOpen &&
              ourStoryLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => {
                    scrollToTopIfSamePage(item.to);
                    setMobileOurStoryOpen(false);
                    setOpen((o) => !o);
                  }}
                  className="pl-8 py-2 text-sm text-gold/70"
                >
                  {item.label}
                </Link>
              ))}

            <button
              onClick={() => setMobileProjectsOpen((o) => !o)}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-gold cursor-pointer"
            >
              Projects
              <ChevronDown
                className={`h-4 w-4 transition-transform ${mobileProjectsOpen ? "rotate-180" : ""}`}
              />
            </button>

            {mobileProjectsOpen &&
              projectLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  search={item.search}
                  onClick={() => {
                    scrollToTopIfSamePage(item.to);
                    setMobileProjectsOpen(false);
                    setOpen((o) => !o);
                  }}
                  className="pl-8 py-2 text-sm text-gold/70"
                >
                  {item.label}
                </Link>
              ))}

            <button
              onClick={() => setMobileWorkOpen((o) => !o)}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-gold cursor-pointer"
            >
              Work With Us
              <ChevronDown
                className={`h-4 w-4 transition-transform ${mobileWorkOpen ? "rotate-180" : ""}`}
              />
            </button>

            {mobileWorkOpen &&
              workLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => {
                    scrollToTopIfSamePage(item.to);
                    setMobileWorkOpen(false);
                    setOpen((o) => !o);
                  }}
                  className="pl-8 py-2 text-sm text-gold/70"
                >
                  {item.label}
                </Link>
              ))}

            <button
              onClick={() => setMobileBuyersGuideOpen((o) => !o)}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-gold cursor-pointer"
            >
              Buyer's Guide
              <ChevronDown
                className={`h-4 w-4 transition-transform ${mobileBuyersGuideOpen ? "rotate-180" : ""}`}
              />
            </button>

            {mobileBuyersGuideOpen &&
              buyersGuideLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => {
                    scrollToTopIfSamePage(item.to);
                    setMobileBuyersGuideOpen(false);
                    setOpen((o) => !o);
                  }}
                  className="pl-8 py-2 text-sm text-gold/70"
                >
                  {item.label}
                </Link>
              ))}

            <Link
              to="/nri-corner"
              onClick={() => scrollToTopIfSamePage("/nri-corner")}
              className="rounded-xl px-4 py-3 text-gold"
            >
              NRI Corner
            </Link>
            <Link
              to="/contact"
              onClick={() => scrollToTopIfSamePage("/contact")}
              className="rounded-xl px-4 py-3 text-gold"
            >
              Contact Us
            </Link>
            <Link
              to="/site-visit"
              onClick={() => scrollToTopIfSamePage("/site-visit")}
              className="mt-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-gold-foreground"
              style={{ background: "var(--gradient-gold)" }}
            >
              <MapPin className="h-4 w-4" /> Book Your Site Visit
            </Link>
            <a
              href="tel:+919859595939"
              className="mt-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-gold-foreground"
              style={{ background: "var(--gradient-gold)" }}
            >
              <Phone className="h-4 w-4" /> Call Us: +91 98595 95939
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

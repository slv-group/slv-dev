import { Link } from "@tanstack/react-router";
import { MoveRight } from "lucide-react";
import { useEffect, useState } from "react";
import slvPoster from "@/assets/slv-poster.png";
import slvHeroMobile from "@/assets/videos/slv_green_4k_mobile.mp4";
import slvHeroDesktop from "@/assets/videos/slv_green_4k_desktop.mp4";

/* ── Hero Section ────────────────────────────────────────── */
export function HeroSection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const updateVideo = () => {
      setIsMobile(mediaQuery.matches);
    };

    updateVideo();

    mediaQuery.addEventListener("change", updateVideo);

    return () => {
      mediaQuery.removeEventListener("change", updateVideo);
    };
  }, []);

  const videoSrc = isMobile ? slvHeroMobile : slvHeroDesktop;

  return (
    <section className="group relative flex min-h-[100svh] items-center justify-center overflow-hidden">
      <video
        key={videoSrc}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={slvPoster}
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/35 to-black/80" />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 60% 40%, rgba(180,140,40,0.12) 0%, transparent 65%)",
        }}
      />

      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-[10%] top-[15%] h-px w-48 opacity-20"
          style={{ background: "var(--gradient-gold)" }}
        />

        <div
          className="absolute right-[8%] bottom-[30%] h-px w-32 opacity-15"
          style={{ background: "var(--gradient-gold)" }}
        />

        <div
          className="absolute left-[55%] top-[8%] h-24 w-px opacity-15"
          style={{
            background: "linear-gradient(to bottom, var(--color-gold), transparent)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-28 pb-4 text-center text-white md:translate-y-24 lg:translate-y-28">
        <Link
          to="/projects"
          search={{ status: "ongoing" }}
          className="
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-black/20
            bg-gradient-gold
            px-8
            py-4
            text-sm
            font-bold
            text-black
            shadow-lg
            shadow-gold/30
            backdrop-blur-xl
            lg:pointer-events-none
            lg:translate-y-3
            lg:opacity-0
            transition-all
            duration-500
            ease-out
            lg:group-hover:pointer-events-auto
            lg:group-hover:translate-y-0
            lg:group-hover:opacity-100
          "
        >
          <span>Explore Our Projects</span>
          <MoveRight className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}

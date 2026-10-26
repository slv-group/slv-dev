import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Compass, ShieldCheck, Sparkles, Volume2, VolumeX } from "lucide-react";
import slvHeroDesktop from "@/assets/videos/slv_green_4k_desktop.mp4";
import slvHeroMobile from "@/assets/videos/slv_green_4k_mobile.mp4";
import slvPoster from "@/assets/slv-poster.png";

const REDIRECT_URL = "https://www.slvgroup.co.in/";
const ANIMATION_DURATION_MS = 4800;

export const Route = createFileRoute("/launch")({
  head: () => ({
    meta: [
      { title: "SLV Group — Exclusive Launch Experience" },
      {
        name: "description",
        content:
          "Experience the cinematic unveiling of SLV Group. Curated luxury residences, architectural mastery, and timeless living.",
      },
      { property: "og:title", content: "SLV Group — Exclusive Launch Experience" },
      {
        property: "og:description",
        content: "Enter the world of SLV Group. Architectural refinement and luxury residences.",
      },
      { property: "og:image", content: "/slv-logo.png" },
    ],
  }),
  component: LaunchPage,
});

/* ── Web Audio Synth for Authentic Crackers / Fireworks Sound ── */
function playCinematicAudio(muted: boolean) {
  if (muted || typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    const now = ctx.currentTime;

    // Helper: Generate White/Pink Noise Buffer
    const createNoiseBuffer = (durationSec: number) => {
      const bufferSize = Math.floor(ctx.sampleRate * durationSec);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      return buffer;
    };

    // 1. Rocket Launch Whistle & Whoosh (Ascending screamer)
    const whistleOsc = ctx.createOscillator();
    const whistleGain = ctx.createGain();
    whistleOsc.type = "sawtooth";
    whistleOsc.frequency.setValueAtTime(650, now);
    whistleOsc.frequency.exponentialRampToValueAtTime(3200, now + 0.45);
    whistleGain.gain.setValueAtTime(0.001, now);
    whistleGain.gain.linearRampToValueAtTime(0.2, now + 0.15);
    whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

    const whistleFilter = ctx.createBiquadFilter();
    whistleFilter.type = "bandpass";
    whistleFilter.frequency.setValueAtTime(1200, now);
    whistleFilter.frequency.exponentialRampToValueAtTime(3600, now + 0.45);
    whistleFilter.Q.value = 5;

    whistleOsc.connect(whistleFilter);
    whistleFilter.connect(whistleGain);
    whistleGain.connect(ctx.destination);
    whistleOsc.start(now);
    whistleOsc.stop(now + 0.5);

    // 2. Heavy Aerial Explosion Bangs (Deep Cracker Thuds)
    const burstTimings = [0.45, 0.85, 1.35, 1.95, 2.6];
    burstTimings.forEach((t) => {
      const burstTime = now + t;

      // Sub-bass thump
      const boomOsc = ctx.createOscillator();
      const boomGain = ctx.createGain();
      boomOsc.type = "sine";
      boomOsc.frequency.setValueAtTime(160, burstTime);
      boomOsc.frequency.exponentialRampToValueAtTime(35, burstTime + 0.35);
      boomGain.gain.setValueAtTime(0.55, burstTime);
      boomGain.gain.exponentialRampToValueAtTime(0.001, burstTime + 0.4);
      boomOsc.connect(boomGain);
      boomGain.connect(ctx.destination);
      boomOsc.start(burstTime);
      boomOsc.stop(burstTime + 0.45);

      // Explosive initial crack noise
      const crackBuffer = createNoiseBuffer(0.2);
      const crackSource = ctx.createBufferSource();
      crackSource.buffer = crackBuffer;
      const crackFilter = ctx.createBiquadFilter();
      crackFilter.type = "lowpass";
      crackFilter.frequency.value = 1400;
      const crackGain = ctx.createGain();
      crackGain.gain.setValueAtTime(0.45, burstTime);
      crackGain.gain.exponentialRampToValueAtTime(0.001, burstTime + 0.25);
      crackSource.connect(crackFilter);
      crackFilter.connect(crackGain);
      crackGain.connect(ctx.destination);
      crackSource.start(burstTime);
    });

    // 3. Dense Chain of Cracker Pops ("Ladi" / Firecracker Garland Rapid Pops)
    // 40+ sharp, randomized snaps & pops
    for (let i = 0; i < 45; i++) {
      const popDelay = 0.48 + Math.random() * 2.8;
      const popDuration = 0.015 + Math.random() * 0.025;
      const popBuffer = createNoiseBuffer(popDuration);
      const popSource = ctx.createBufferSource();
      popSource.buffer = popBuffer;

      const popFilter = ctx.createBiquadFilter();
      popFilter.type = "bandpass";
      popFilter.frequency.value = 1800 + Math.random() * 4500;
      popFilter.Q.value = 2.5 + Math.random() * 3;

      const popGain = ctx.createGain();
      popGain.gain.setValueAtTime(0.25 + Math.random() * 0.2, now + popDelay);
      popGain.gain.exponentialRampToValueAtTime(0.001, now + popDelay + popDuration);

      popSource.connect(popFilter);
      popFilter.connect(popGain);
      popGain.connect(ctx.destination);
      popSource.start(now + popDelay);
    }

    // 4. Sparkler Sizzle / Sizzling Embers
    const sizzleDuration = 3.2;
    const sizzleBuffer = createNoiseBuffer(sizzleDuration);
    const sizzleSource = ctx.createBufferSource();
    sizzleSource.buffer = sizzleBuffer;
    const sizzleFilter = ctx.createBiquadFilter();
    sizzleFilter.type = "highpass";
    sizzleFilter.frequency.value = 4500;
    const sizzleGain = ctx.createGain();
    sizzleGain.gain.setValueAtTime(0.001, now + 0.45);
    sizzleGain.gain.linearRampToValueAtTime(0.08, now + 0.8);
    sizzleGain.gain.exponentialRampToValueAtTime(0.001, now + sizzleDuration + 0.45);

    sizzleSource.connect(sizzleFilter);
    sizzleFilter.connect(sizzleGain);
    sizzleGain.connect(ctx.destination);
    sizzleSource.start(now + 0.45);
  } catch {
    // Audio fallback
  }
}

export function LaunchPage() {
  const [animState, setAnimState] = useState<"idle" | "revealing" | "completed">("idle");
  const [isMobile, setIsMobile] = useState(false);
  const [muted, setMuted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive video selection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(max-width: 768px)");
      setIsMobile(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Launch Firecrackers Animation on Canvas
  const triggerFirecrackers = (originX: number, originY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      size: number;
      decay: number;
      gravity: number;
      sparkle: boolean;
    }

    const particles: Particle[] = [];
    const colors = [
      "#ffd700", // Gold
      "#fff0d4", // Champagne
      "#ffaa00", // Amber
      "#ffffff", // Diamond sparkle
      "#e5a93b", // Rich Bronze Gold
    ];

    // Create explosion clusters
    const createExplosion = (x: number, y: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 3 + 1.5,
          decay: Math.random() * 0.015 + 0.008,
          gravity: 0.12,
          sparkle: Math.random() > 0.4,
        });
      }
    };

    // Primary initial burst from button location
    createExplosion(originX, originY, 120);

    // Additional festive aerial bursts across the screen
    const timeouts = [
      setTimeout(() => createExplosion(canvas.width * 0.25, canvas.height * 0.35, 90), 250),
      setTimeout(() => createExplosion(canvas.width * 0.75, canvas.height * 0.3, 90), 550),
      setTimeout(() => createExplosion(canvas.width * 0.5, canvas.height * 0.2, 110), 850),
      setTimeout(() => createExplosion(canvas.width * 0.15, canvas.height * 0.5, 70), 1200),
      setTimeout(() => createExplosion(canvas.width * 0.85, canvas.height * 0.45, 80), 1500),
    ];

    let animFrame: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = p.sparkle ? 10 : 4;
        ctx.shadowColor = p.color;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (particles.length > 0) {
        animFrame = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      timeouts.forEach(clearTimeout);
      cancelAnimationFrame(animFrame);
    };
  };

  const handleEnterExperience = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (animState !== "idle") return;

    setAnimState("revealing");

    // Click coordinates for particle launch
    const rect = e.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    // 1. Play crackers & cinematic celebration visuals
    triggerFirecrackers(originX, originY);

    // 2. Play luxury audio synth
    playCinematicAudio(muted);

    // 3. Coordinate redirection after cinematic animation
    timeoutRef.current = setTimeout(() => {
      setAnimState("completed");
      window.location.href = REDIRECT_URL;
    }, ANIMATION_DURATION_MS);
  };

  const handleSkipIntro = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    window.location.href = REDIRECT_URL;
  };

  const videoSrc = isMobile ? slvHeroMobile : slvHeroDesktop;

  return (
    <div
      className="slv-launch-wrapper fixed inset-0 z-[9999] overflow-hidden select-none bg-[#0a0a0a] text-[#f4efe6] font-sans"
      data-state={animState}
    >
      {/* ── 1. CINEMATIC 4K VIDEO BACKGROUND ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <video
          key={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={slvPoster}
          className="slv-bg-video absolute inset-0 h-full w-full object-cover transition-transform duration-[4000ms] ease-out"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>

        {/* Cinematic Vignette & Warm Gold Grading */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/45 to-black/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.12)_0%,rgba(10,10,10,0.85)_75%)]" />

        {/* Perspective Hairline Blueprint Grid */}
        <div className="slv-arch-grid absolute inset-0 opacity-40" />
      </div>

      {/* ── 2. FIRECRACKERS & FESTIVE CANVAS LAYER ── */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-30 w-full h-full" />

      {/* ── 3. CINEMATIC REVEAL ARCHITECTURAL LINES ── */}
      <div className="slv-portal-layer absolute inset-0 pointer-events-none z-25">
        <div className="slv-line slv-line-top" />
        <div className="slv-line slv-line-bottom" />
        <div className="slv-line slv-line-left" />
        <div className="slv-line slv-line-right" />
        <div className="slv-shockwave" />
      </div>

      {/* ── 4. HEADER NAVIGATION ── */}
      <header className="relative z-40 flex items-center justify-between px-6 py-6 md:px-12 md:py-8 w-full">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-[#c9a84c] animate-pulse" />
          <span className="text-xs uppercase tracking-[0.25em] text-[#e8d5a3] font-medium drop-shadow-md">
            SLV Group Official Launch
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={() => setMuted(!muted)}
            className="p-2 rounded-full border border-white/10 bg-black/40 hover:bg-black/60 text-[#c9a84c] transition-all"
            title={muted ? "Unmute audio" : "Mute audio"}
            aria-label={muted ? "Unmute audio" : "Mute audio"}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Skip Intro */}
          <button
            onClick={handleSkipIntro}
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#e8d5a3] hover:text-[#fff] transition-colors px-3.5 py-1.5 rounded-full border border-white/15 bg-black/40 hover:bg-black/70 hover:border-[#c9a84c]/50"
            aria-label="Skip intro and go to main website"
          >
            <span>Skip Intro</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1 text-[#c9a84c]" />
          </button>
        </div>
      </header>

      {/* ── 5. MAIN STAGE ── */}
      <main className="relative z-40 flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-6 text-center max-w-4xl mx-auto">
        {/* Genuine SLV Logo with Breathing Gold Halo */}
        <div className="slv-logo-container relative mb-8 flex items-center justify-center">
          <div className="slv-logo-halo absolute inset-0 rounded-full blur-2xl" />
          <div className="relative p-3.5 rounded-2xl bg-gradient-to-b from-white/10 to-transparent border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-md">
            <img
              src="/slv-logo.png"
              alt="SLV Group Emblem"
              className="slv-logo-img w-20 h-20 md:w-28 md:h-28 object-contain drop-shadow-[0_8px_30px_rgba(201,168,76,0.5)] transition-all duration-700"
              loading="eager"
            />
          </div>
        </div>

        {/* Launch Typography & CTA Button */}
        <div className="slv-idle-content transition-all duration-700 ease-out">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1 rounded-full border border-[#c9a84c]/30 bg-black/50 backdrop-blur-sm text-[#e8d5a3] text-[11px] uppercase tracking-[0.3em]">
            <Sparkles className="w-3 h-3 text-[#c9a84c]" />
            <span>Architecture &bull; Refinement &bull; Legacy</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-[#f9f7f2] leading-[1.15] mb-5 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
            The Art of{" "}
            <span className="italic font-normal bg-gradient-to-r from-[#eddab3] via-[#c9a84c] to-[#eddab3] bg-clip-text text-transparent">
              Elevated Living
            </span>
          </h1>

          <p className="max-w-xl mx-auto text-sm md:text-base text-[#d1cbc0] font-light leading-relaxed mb-9 tracking-wide drop-shadow-md">
            Welcome to SLV Group. Rooted in nearly two decades of trust across Andhra Pradesh, we
            sculpt landmark communities and visionary spaces where architectural elegance meets
            uncompromising craftsmanship.
          </p>

          {/* Primary CTA Button */}
          <div className="flex items-center justify-center">
            <button
              onClick={handleEnterExperience}
              disabled={animState !== "idle"}
              className="slv-cta-btn group relative inline-flex items-center justify-center gap-3 px-9 py-4 rounded-full text-xs uppercase tracking-[0.25em] font-semibold text-[#0a0a0a] bg-gradient-to-r from-[#d4b55a] via-[#f3e7c4] to-[#c49f42] hover:shadow-[0_0_40px_rgba(201,168,76,0.6)] transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer disabled:cursor-wait"
            >
              <Compass className="w-4 h-4 text-[#1a1405] transition-transform duration-700 group-hover:rotate-90" />
              <span>Enter The Experience</span>
              <span className="slv-btn-shimmer" />
            </button>
          </div>
        </div>

        {/* ── 6. ACTIVE TRANSITION SCREEN (Reveals after click) ── */}
        <div
          className="slv-transition-content absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          aria-live="polite"
        >
          <div className="text-center px-4">
            <p className="font-serif italic text-2xl sm:text-4xl text-[#ebdcb9] tracking-wide mb-3 drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
              Entering SLV Group…
            </p>
            <p className="text-xs uppercase tracking-[0.3em] text-[#c9a84c] mb-6 drop-shadow-md">
              Unveiling the architectural portfolio
            </p>

            {/* Glowing Golden Horizon Progress Bar */}
            <div className="w-56 sm:w-72 h-[3px] bg-white/20 mx-auto rounded-full overflow-hidden shadow-[0_0_20px_rgba(201,168,76,0.5)]">
              <div className="slv-progress-bar h-full bg-gradient-to-r from-[#c9a84c] via-[#fff5d6] to-[#c9a84c]" />
            </div>
          </div>
        </div>
      </main>

      {/* ── 7. FOOTER FALLBACK ── */}
      <footer className="relative z-40 flex flex-col sm:flex-row items-center justify-between px-6 py-6 md:px-12 md:py-8 w-full text-xs text-[#a39c90]">
        <div className="flex items-center gap-2 mb-3 sm:mb-0">
          <ShieldCheck className="w-3.5 h-3.5 text-[#c9a84c]" />
          <span>© {new Date().getFullYear()} SLV Group. All Rights Reserved.</span>
        </div>

        <a
          href={REDIRECT_URL}
          className="text-[#e8d5a3] hover:text-[#fff] hover:underline underline-offset-4 transition-colors font-medium tracking-wide flex items-center gap-1.5"
          title="Direct link to main website"
        >
          <span>Go directly to slvgroup.co.in</span>
          <ArrowRight className="w-3 h-3 text-[#c9a84c]" />
        </a>
      </footer>

      {/* ── 8. SCOPED CINEMATIC KEYFRAMES ── */}
      <style>{`
        /* Architectural Grid */
        .slv-arch-grid {
          background-image: 
            linear-gradient(to right, rgba(201, 168, 76, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(201, 168, 76, 0.08) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(ellipse at center, rgba(0,0,0,0.85) 30%, transparent 80%);
          perspective: 800px;
          transform: perspective(500px) rotateX(25deg) scale(1.15);
          transform-origin: center bottom;
        }

        .slv-logo-halo {
          background: radial-gradient(circle, rgba(201, 168, 76, 0.35) 0%, transparent 70%);
          animation: slv-breathe 4s ease-in-out infinite alternate;
        }

        .slv-btn-shimmer {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          background-size: 200% 100%;
          animation: slv-shimmer 2.8s infinite;
        }

        @keyframes slv-breathe {
          0% { opacity: 0.6; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1.15); }
        }

        @keyframes slv-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        /* Border Reveal Lines */
        .slv-line {
          position: absolute;
          background: #c9a84c;
          transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 0;
          box-shadow: 0 0 15px rgba(201, 168, 76, 0.8);
        }

        .slv-line-top {
          top: 0; left: 0; right: 0; height: 2px;
          transform: scaleX(0);
          transform-origin: left;
        }
        .slv-line-bottom {
          bottom: 0; left: 0; right: 0; height: 2px;
          transform: scaleX(0);
          transform-origin: right;
        }
        .slv-line-left {
          top: 0; bottom: 0; left: 0; width: 2px;
          transform: scaleY(0);
          transform-origin: top;
        }
        .slv-line-right {
          top: 0; bottom: 0; right: 0; width: 2px;
          transform: scaleY(0);
          transform-origin: bottom;
        }

        /* Shockwave Expansion Ring on Click */
        .slv-shockwave {
          position: absolute;
          top: 50%; left: 50%;
          width: 20px; height: 20px;
          margin-left: -10px; margin-top: -10px;
          border-radius: 50%;
          border: 2px solid rgba(201, 168, 76, 0.9);
          box-shadow: 0 0 35px rgba(201, 168, 76, 0.9);
          opacity: 0;
          pointer-events: none;
        }

        /* --- ACTIVE REVEAL STATE (On Button Click) --- */
        [data-state="revealing"] .slv-bg-video {
          transform: scale(1.12);
          filter: brightness(1.15);
        }

        [data-state="revealing"] .slv-shockwave {
          animation: slv-shockwave-ring 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slv-shockwave-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(120); opacity: 0; }
        }

        [data-state="revealing"] .slv-idle-content {
          opacity: 0;
          transform: translateY(-24px) scale(0.95);
          pointer-events: none;
        }

        [data-state="revealing"] .slv-line {
          opacity: 1;
        }
        [data-state="revealing"] .slv-line-top,
        [data-state="revealing"] .slv-line-bottom {
          transform: scaleX(1);
        }
        [data-state="revealing"] .slv-line-left,
        [data-state="revealing"] .slv-line-right {
          transform: scaleY(1);
        }

        [data-state="revealing"] .slv-logo-img {
          animation: slv-logo-epic 4.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slv-logo-epic {
          0% { transform: scale(1); filter: brightness(1); }
          20% { transform: scale(1.22); filter: brightness(1.4) drop-shadow(0 0 45px rgba(201, 168, 76, 0.9)); }
          50% { transform: scale(1.1); filter: brightness(1.2); }
          100% { transform: scale(0.9); opacity: 0.25; }
        }

        /* Transition Text & Progress */
        .slv-transition-content {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        [data-state="revealing"] .slv-transition-content {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 1.2s;
        }

        [data-state="revealing"] .slv-progress-bar {
          animation: slv-progress-fill 3.2s cubic-bezier(0.16, 1, 0.3, 1) 1.4s forwards;
          transform: scaleX(0);
          transform-origin: left;
        }

        @keyframes slv-progress-fill {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }

        /* Final Fade to Black */
        [data-state="completed"] {
          opacity: 0;
          transition: opacity 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

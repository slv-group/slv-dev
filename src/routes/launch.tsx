import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, Compass, ShieldCheck, Sparkles, Volume2, VolumeX, Award } from "lucide-react";
import slvHeroDesktop from "@/assets/videos/slv_green_4k_desktop.mp4";
import slvHeroMobile from "@/assets/videos/slv_green_4k_mobile.mp4";
import slvPoster from "@/assets/slv-poster.png";

const REDIRECT_URL = "https://www.slvgroup.co.in/";
const COUNT_INTERVAL_MS = 110; // ~110ms per number -> ~2.2s for 1 to 20
const ANNIVERSARY_HOLD_MS = 1300; // 1.3s showcase of "20 YEARS OF EXCELLENCE" before fireworks
const FIREWORKS_DURATION_MS = 5200; // ~5.2s fireworks celebration
const FADE_OUT_DURATION_MS = 600; // Smooth final exit fade

export const Route = createFileRoute("/launch")({
  head: () => ({
    meta: [
      { title: "SLV Group — 20 Years of Excellence Launch Experience" },
      {
        name: "description",
        content:
          "Experience the cinematic unveiling of SLV Group's 20 Years of Excellence. Curated luxury residences, architectural mastery, and timeless living across Andhra Pradesh.",
      },
      { property: "og:title", content: "SLV Group — 20 Years of Excellence Launch Experience" },
      {
        property: "og:description",
        content:
          "Celebrating 20 Years of Excellence. Enter the world of SLV Group — architectural refinement and luxury residences.",
      },
      { property: "og:image", content: "/slv-logo.png" },
    ],
  }),
  component: LaunchPage,
});

/* ── Web Audio Synthesizer for Authentic Fireworks Acoustic Ambiance ── */
function createCinematicAudio(
  muted: boolean,
  audioCtxRef: React.MutableRefObject<AudioContext | null>,
) {
  if (muted || typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    const now = ctx.currentTime;

    const createNoiseBuffer = (durationSec: number) => {
      const bufferSize = Math.floor(ctx.sampleRate * durationSec);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      return buffer;
    };

    // 1. Rocket Launch Ascending Whistle & Whoosh
    const whistleOsc = ctx.createOscillator();
    const whistleGain = ctx.createGain();
    whistleOsc.type = "sawtooth";
    whistleOsc.frequency.setValueAtTime(600, now);
    whistleOsc.frequency.exponentialRampToValueAtTime(3200, now + 0.45);
    whistleGain.gain.setValueAtTime(0.001, now);
    whistleGain.gain.linearRampToValueAtTime(0.18, now + 0.15);
    whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

    const whistleFilter = ctx.createBiquadFilter();
    whistleFilter.type = "bandpass";
    whistleFilter.frequency.setValueAtTime(1100, now);
    whistleFilter.frequency.exponentialRampToValueAtTime(3400, now + 0.45);
    whistleFilter.Q.value = 5;

    whistleOsc.connect(whistleFilter);
    whistleFilter.connect(whistleGain);
    whistleGain.connect(ctx.destination);
    whistleOsc.start(now);
    whistleOsc.stop(now + 0.5);

    // 2. Heavy Aerial Explosion Bangs (Deep Bass Thuds & Resonant Cracks)
    const burstTimings = [0.45, 0.95, 1.45, 2.1, 2.8, 3.6];
    burstTimings.forEach((t) => {
      const burstTime = now + t;

      // Sub-bass resonant thump
      const boomOsc = ctx.createOscillator();
      const boomGain = ctx.createGain();
      boomOsc.type = "sine";
      boomOsc.frequency.setValueAtTime(150, burstTime);
      boomOsc.frequency.exponentialRampToValueAtTime(32, burstTime + 0.4);
      boomGain.gain.setValueAtTime(0.5, burstTime);
      boomGain.gain.exponentialRampToValueAtTime(0.001, burstTime + 0.45);
      boomOsc.connect(boomGain);
      boomGain.connect(ctx.destination);
      boomOsc.start(burstTime);
      boomOsc.stop(burstTime + 0.5);

      // Explosive initial air crack noise
      const crackBuffer = createNoiseBuffer(0.2);
      const crackSource = ctx.createBufferSource();
      crackSource.buffer = crackBuffer;
      const crackFilter = ctx.createBiquadFilter();
      crackFilter.type = "lowpass";
      crackFilter.frequency.value = 1300;
      const crackGain = ctx.createGain();
      crackGain.gain.setValueAtTime(0.4, burstTime);
      crackGain.gain.exponentialRampToValueAtTime(0.001, burstTime + 0.25);
      crackSource.connect(crackFilter);
      crackFilter.connect(crackGain);
      crackGain.connect(ctx.destination);
      crackSource.start(burstTime);
    });

    // 3. Dense Festive Sparkle & Crackle Chain
    for (let i = 0; i < 40; i++) {
      const popDelay = 0.5 + Math.random() * 3.4;
      const popDuration = 0.015 + Math.random() * 0.025;
      const popBuffer = createNoiseBuffer(popDuration);
      const popSource = ctx.createBufferSource();
      popSource.buffer = popBuffer;

      const popFilter = ctx.createBiquadFilter();
      popFilter.type = "bandpass";
      popFilter.frequency.value = 1800 + Math.random() * 4000;
      popFilter.Q.value = 2.5 + Math.random() * 2.5;

      const popGain = ctx.createGain();
      popGain.gain.setValueAtTime(0.18 + Math.random() * 0.15, now + popDelay);
      popGain.gain.exponentialRampToValueAtTime(0.001, now + popDelay + popDuration);

      popSource.connect(popFilter);
      popFilter.connect(popGain);
      popGain.connect(ctx.destination);
      popSource.start(now + popDelay);
    }

    // 4. Sparkler Sizzle / Sizzling Embers
    const sizzleDuration = 3.6;
    const sizzleBuffer = createNoiseBuffer(sizzleDuration);
    const sizzleSource = ctx.createBufferSource();
    sizzleSource.buffer = sizzleBuffer;
    const sizzleFilter = ctx.createBiquadFilter();
    sizzleFilter.type = "highpass";
    sizzleFilter.frequency.value = 4200;
    const sizzleGain = ctx.createGain();
    sizzleGain.gain.setValueAtTime(0.001, now + 0.45);
    sizzleGain.gain.linearRampToValueAtTime(0.07, now + 0.85);
    sizzleGain.gain.exponentialRampToValueAtTime(0.001, now + sizzleDuration + 0.45);

    sizzleSource.connect(sizzleFilter);
    sizzleFilter.connect(sizzleGain);
    sizzleGain.connect(ctx.destination);
    sizzleSource.start(now + 0.45);
  } catch {
    // Audio fallback
  }
}

export type LaunchExperienceState =
  | "idle" // Normal landing screen
  | "fading_intro" // Smooth fade-out of intro content & button
  | "counting" // Sequential 1 to 20 counter
  | "anniversary" // 20 YEARS OF EXCELLENCE grand reveal
  | "fireworks" // Celebratory golden fireworks display
  | "completed"; // Exit fade & redirect

export function LaunchPage() {
  const [animState, setAnimState] = useState<LaunchExperienceState>("idle");
  const [counter, setCounter] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [muted, setMuted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const hasNavigatedRef = useRef(false);

  // Responsive video check
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(max-width: 768px)");
      setIsMobile(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, []);

  // Cleanup helper to cancel all animation frames, intervals, timeouts, and audio
  const cleanupAll = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {
        // ignore
      }
      audioCtxRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupAll();
    };
  }, [cleanupAll]);

  // Window resize handler for fireworks canvas
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Step 4: Golden Fireworks Canvas Particle Engine ──
  const startFireworks = useCallback(() => {
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
      trail: { x: number; y: number }[];
    }

    const particles: Particle[] = [];
    const colors = [
      "#ffd700", // Brilliant 24k Gold
      "#fff2d6", // Champagne Cream
      "#ffc233", // Rich Imperial Gold
      "#ffffff", // Diamond Starlight
      "#e6a835", // Deep Warm Gold
      "#fef9e7", // Warm White Ivory
    ];

    const createBurst = (x: number, y: number, count: number, spreadFactor = 1) => {
      const actualCount = isMobile ? Math.floor(count * 0.65) : count;
      for (let i = 0; i < actualCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 8.5 + 2) * spreadFactor;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 2.8 + 1.4,
          decay: Math.random() * 0.013 + 0.007,
          gravity: 0.09,
          sparkle: Math.random() > 0.35,
          trail: [],
        });
      }
    };

    // Staggered cinematic firework bursts framing the "20 YEARS OF EXCELLENCE" title
    const addTimeout = (fn: () => void, delayMs: number) => {
      const id = setTimeout(fn, delayMs);
      timeoutsRef.current.push(id);
    };

    // 1. Initial flanking bursts (left and right of central title)
    createBurst(canvas.width * 0.22, canvas.height * 0.35, 110, 1.05);
    createBurst(canvas.width * 0.78, canvas.height * 0.35, 110, 1.05);

    // 2. High central burst above the "20"
    addTimeout(() => {
      createBurst(canvas.width * 0.5, canvas.height * 0.18, 140, 1.2);
    }, 450);

    // 3. Wide champagne cascade bursts
    addTimeout(() => {
      createBurst(canvas.width * 0.35, canvas.height * 0.26, 95, 0.95);
      createBurst(canvas.width * 0.65, canvas.height * 0.26, 95, 0.95);
    }, 1100);

    // 4. Dramatic outer festive bursts
    addTimeout(() => {
      createBurst(canvas.width * 0.14, canvas.height * 0.42, 90, 1.0);
      createBurst(canvas.width * 0.86, canvas.height * 0.42, 90, 1.0);
    }, 1800);

    // 5. Crown canopy burst directly overhead
    addTimeout(() => {
      createBurst(canvas.width * 0.5, canvas.height * 0.22, 130, 1.15);
    }, 2500);

    // 6. Grand celebratory crescendo finale
    addTimeout(() => {
      createBurst(canvas.width * 0.28, canvas.height * 0.3, 110, 1.1);
      createBurst(canvas.width * 0.5, canvas.height * 0.15, 150, 1.25);
      createBurst(canvas.width * 0.72, canvas.height * 0.3, 110, 1.1);
    }, 3200);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 4) p.trail.shift();

        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.985;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Render soft sparkling trail
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let t = 1; t < p.trail.length; t++) {
            ctx.lineTo(p.trail[t].x, p.trail[t].y);
          }
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = p.alpha * 0.35;
          ctx.lineWidth = p.size * 0.6;
          ctx.stroke();
        }

        // Render main particle with golden glow
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = p.sparkle ? 12 : 5;
        ctx.shadowColor = p.color;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (particles.length > 0) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();
  }, [isMobile]);

  // ── Main Interaction: Enter The Experience ──
  const handleEnterExperience = () => {
    if (animState !== "idle") return;

    // Step 1: Smooth button interaction & fade out intro content (300ms)
    setAnimState("fading_intro");

    const introTimeout = setTimeout(() => {
      // Step 2: Start counting from 1 to 20
      setAnimState("counting");
      setCounter(1);

      let current = 1;
      intervalRef.current = setInterval(() => {
        current += 1;
        if (current >= 20) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setCounter(20);

          // Step 3: Reveal "20 YEARS OF EXCELLENCE"
          setAnimState("anniversary");

          // Step 4: After anniversary showcase, start celebratory fireworks!
          const fireworksDelayTimeout = setTimeout(() => {
            setAnimState("fireworks");
            startFireworks();
            createCinematicAudio(muted, audioCtxRef);

            // Step 5: After fireworks celebration finishes, smoothly redirect to main site
            const completionTimeout = setTimeout(() => {
              setAnimState("completed");
              const redirectTimeout = setTimeout(() => {
                if (!hasNavigatedRef.current) {
                  hasNavigatedRef.current = true;
                  window.location.href = REDIRECT_URL;
                }
              }, FADE_OUT_DURATION_MS);
              timeoutsRef.current.push(redirectTimeout);
            }, FIREWORKS_DURATION_MS);
            timeoutsRef.current.push(completionTimeout);
          }, ANNIVERSARY_HOLD_MS);
          timeoutsRef.current.push(fireworksDelayTimeout);
        } else {
          setCounter(current);
        }
      }, COUNT_INTERVAL_MS);
    }, 350);

    timeoutsRef.current.push(introTimeout);
  };

  // ── Skip Intro Navigation ──
  const handleSkipIntro = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    cleanupAll();
    window.location.href = REDIRECT_URL;
  };

  const videoSrc = isMobile ? slvHeroMobile : slvHeroDesktop;
  const isExperienceActive = animState !== "idle";

  return (
    <div
      className="slv-launch-wrapper fixed inset-0 z-[9999] overflow-hidden select-none bg-[#0a0a0a] text-[#f4efe6] font-sans"
      data-state={animState}
    >
      {/* ── 1. CINEMATIC 4K ARCHITECTURAL BACKGROUND ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <video
          key={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={slvPoster}
          className="slv-bg-video absolute inset-0 h-full w-full object-cover transition-all duration-[3000ms] ease-out"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>

        {/* Cinematic Vignette & Warm Gold Grading */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/50 to-black/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.14)_0%,rgba(10,10,10,0.88)_75%)]" />

        {/* Darkening veil during active anniversary / fireworks sequence */}
        <div
          className={`absolute inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity duration-1000 ${
            isExperienceActive ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Perspective Hairline Blueprint Grid */}
        <div className="slv-arch-grid absolute inset-0 opacity-30" />
      </div>

      {/* ── 2. CELEBRATORY FIREWORKS CANVAS LAYER ── */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-30 w-full h-full" />

      {/* ── 3. CINEMATIC REVEAL ARCHITECTURAL BORDER LINES ── */}
      <div className="slv-portal-layer absolute inset-0 pointer-events-none z-25">
        <div className="slv-line slv-line-top" />
        <div className="slv-line slv-line-bottom" />
        <div className="slv-line slv-line-left" />
        <div className="slv-line slv-line-right" />
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
            className="p-2 rounded-full border border-white/10 bg-black/40 hover:bg-black/60 text-[#c9a84c] transition-all cursor-pointer"
            title={muted ? "Unmute audio" : "Mute audio"}
            aria-label={muted ? "Unmute audio" : "Mute audio"}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Skip Intro */}
          <button
            onClick={handleSkipIntro}
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#e8d5a3] hover:text-[#fff] transition-colors px-3.5 py-1.5 rounded-full border border-white/15 bg-black/40 hover:bg-black/70 hover:border-[#c9a84c]/50 cursor-pointer"
            aria-label="Skip intro and go to main website"
          >
            <span>Skip Intro</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1 text-[#c9a84c]" />
          </button>
        </div>
      </header>

      {/* ── 5. MAIN STAGE ── */}
      <main className="relative z-40 flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-6 text-center max-w-5xl mx-auto">
        {/* SLV Logo with Breathing Gold Halo (Visible in idle, gently scales during celebration) */}
        <div
          className={`slv-logo-container relative mb-6 transition-all duration-700 ${
            animState === "counting" || animState === "anniversary" || animState === "fireworks"
              ? "opacity-90 scale-90 -translate-y-2"
              : ""
          }`}
        >
          <div className="slv-logo-halo absolute inset-0 rounded-full blur-2xl" />
          <div className="relative p-3 rounded-2xl bg-gradient-to-b from-white/10 to-transparent border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-md">
            <img
              src="/slv-logo.png"
              alt="SLV Group Emblem"
              className="slv-logo-img w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain drop-shadow-[0_8px_30px_rgba(201,168,76,0.5)] transition-all duration-700"
              loading="eager"
            />
          </div>
        </div>

        {/* ── PHASE A: INTRODUCTORY CONTENT (Visible when idle) ── */}
        <div
          className={`slv-idle-content transition-all duration-500 ease-out ${
            isExperienceActive
              ? "opacity-0 -translate-y-6 pointer-events-none absolute"
              : "opacity-100"
          }`}
        >
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
              disabled={isExperienceActive}
              className="slv-cta-btn group relative inline-flex items-center justify-center gap-3 px-9 py-4 rounded-full text-xs uppercase tracking-[0.25em] font-semibold text-[#0a0a0a] bg-gradient-to-r from-[#d4b55a] via-[#f3e7c4] to-[#c49f42] hover:shadow-[0_0_40px_rgba(201,168,76,0.6)] transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.96] cursor-pointer disabled:cursor-wait"
            >
              <Compass className="w-4 h-4 text-[#1a1405] transition-transform duration-700 group-hover:rotate-90" />
              <span>Enter The Experience</span>
              <span className="slv-btn-shimmer" />
            </button>
          </div>
        </div>

        {/* ── PHASE B: STEP 2 SEQUENTIAL COUNT (1 to 20) ── */}
        {animState === "counting" && (
          <div
            className="slv-counter-stage relative flex flex-col items-center justify-center pointer-events-none"
            aria-live="polite"
          >
            {/* Ambient Radial Aura behind Counter */}
            <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full blur-3xl opacity-60 bg-[radial-gradient(circle,rgba(201,168,76,0.4)_0%,rgba(247,231,190,0.15)_40%,transparent_75%)]" />

            {/* Orbiting Golden Ring */}
            <div className="slv-counter-ring absolute w-52 h-52 sm:w-72 sm:h-72 rounded-full border border-[#c9a84c]/25 pointer-events-none" />

            {/* Animated Sequential Number with Gold Gradient */}
            <div className="relative z-10 flex flex-col items-center">
              <span
                key={counter}
                className="slv-count-num font-serif font-bold text-7xl sm:text-9xl md:text-[10.5rem] leading-none tracking-tight block bg-gradient-to-b from-[#ffffff] via-[#f7e7be] via-50% to-[#c9a84c] bg-clip-text text-transparent drop-shadow-[0_0_45px_rgba(201,168,76,0.7)]"
              >
                {counter}
              </span>

              <p className="mt-4 text-[10px] sm:text-xs uppercase tracking-[0.35em] text-[#e8d5a3]/80 font-medium drop-shadow-md">
                Years of Trust & Excellence
              </p>
            </div>
          </div>
        )}

        {/* ── PHASE C & D: STEP 3 & 4 "20 YEARS OF EXCELLENCE" CELEBRATION & FIREWORKS ── */}
        {(animState === "anniversary" || animState === "fireworks") && (
          <div
            className="slv-anniversary-stage relative flex flex-col items-center justify-center text-center px-4 pointer-events-none select-none z-30"
            aria-live="polite"
          >
            {/* Rotating Sunburst Rays */}
            <div className="slv-sunburst absolute w-[400px] h-[400px] sm:w-[650px] sm:h-[650px] pointer-events-none -z-10" />

            {/* Radiant Golden Glow Halo */}
            <div className="absolute w-72 h-72 sm:w-[480px] sm:h-[480px] rounded-full blur-3xl opacity-75 bg-[radial-gradient(circle,rgba(201,168,76,0.55)_0%,rgba(247,231,190,0.2)_40%,transparent_75%)] pointer-events-none -z-10" />

            {/* Golden 20 Number Display */}
            <div className="slv-hero-20 relative">
              <span className="font-serif font-black text-8xl sm:text-[11rem] md:text-[13rem] leading-none tracking-tight block bg-gradient-to-b from-[#ffffff] via-[#fce8bb] via-45% to-[#c9a84c] bg-clip-text text-transparent drop-shadow-[0_12px_60px_rgba(201,168,76,0.75)]">
                20
              </span>
            </div>

            {/* Decorative Gold Filigree Divider */}
            <div className="my-3 sm:my-5 flex items-center justify-center gap-3 w-full max-w-sm sm:max-w-md">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c9a84c] to-[#e8d5a3]" />
              <div className="h-1.5 w-1.5 rotate-45 bg-[#f3e7c4] shadow-[0_0_12px_#fff]" />
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#c9a84c] to-[#e8d5a3]" />
            </div>

            {/* Anniversary Heading */}
            <h2 className="slv-anniversary-title font-serif text-2xl sm:text-4xl md:text-5xl font-light uppercase tracking-[0.26em] sm:tracking-[0.38em] text-[#fffdfa] drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
              Years of{" "}
              <span className="italic font-normal bg-gradient-to-r from-[#ffe49e] via-[#c9a84c] to-[#fff3d1] bg-clip-text text-transparent">
                Excellence
              </span>
            </h2>

            {/* Prestigious Milestone Credential */}
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c9a84c]/40 bg-black/60 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
              <Award className="w-3.5 h-3.5 text-[#c9a84c]" />
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.28em] text-[#e8d5a3] font-medium">
                Building Legacies Since 2007 &bull; Andhra Pradesh
              </span>
            </div>
          </div>
        )}
      </main>

      {/* ── 6. FOOTER FALLBACK ── */}
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

      {/* ── 7. SCOPED CINEMATIC KEYFRAMES ── */}
      <style>{`
        /* Architectural Blueprint Grid */
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

        /* Active Lines State */
        [data-state="counting"] .slv-line,
        [data-state="anniversary"] .slv-line,
        [data-state="fireworks"] .slv-line {
          opacity: 1;
        }
        [data-state="counting"] .slv-line-top,
        [data-state="counting"] .slv-line-bottom,
        [data-state="anniversary"] .slv-line-top,
        [data-state="anniversary"] .slv-line-bottom,
        [data-state="fireworks"] .slv-line-top,
        [data-state="fireworks"] .slv-line-bottom {
          transform: scaleX(1);
        }
        [data-state="counting"] .slv-line-left,
        [data-state="counting"] .slv-line-right,
        [data-state="anniversary"] .slv-line-left,
        [data-state="anniversary"] .slv-line-right,
        [data-state="fireworks"] .slv-line-left,
        [data-state="fireworks"] .slv-line-right {
          transform: scaleY(1);
        }

        /* Video Zoom during Experience */
        [data-state="counting"] .slv-bg-video,
        [data-state="anniversary"] .slv-bg-video,
        [data-state="fireworks"] .slv-bg-video {
          transform: scale(1.08);
          filter: brightness(1.1);
        }

        /* Counter Stage Animations */
        .slv-count-num {
          animation: slv-num-tick 0.11s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slv-num-tick {
          0% {
            transform: scale(0.92);
            opacity: 0.6;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .slv-counter-ring {
          animation: slv-spin 20s linear infinite;
        }

        /* Anniversary Reveal Animations */
        .slv-hero-20 {
          animation: slv-reveal-20 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slv-reveal-20 {
          0% {
            transform: scale(0.7) translateY(20px);
            opacity: 0;
            filter: blur(8px);
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
            filter: blur(0);
          }
        }

        .slv-anniversary-title {
          animation: slv-fade-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
        }

        @keyframes slv-fade-up {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Rotating Sunburst Light Rays */
        .slv-sunburst {
          background: repeating-conic-gradient(
            from 0deg,
            rgba(201, 168, 76, 0.08) 0deg 12deg,
            transparent 12deg 24deg
          );
          border-radius: 50%;
          mask-image: radial-gradient(circle, rgba(0,0,0,1) 15%, transparent 70%);
          animation: slv-spin 35s linear infinite;
        }

        @keyframes slv-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Final Fade Out before Redirection */
        [data-state="completed"] {
          opacity: 0;
          transition: opacity 0.6s ease-out;
        }

        /* Reduced Motion Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .slv-sunburst,
          .slv-counter-ring,
          .slv-logo-halo {
            animation: none !important;
          }
          .slv-hero-20,
          .slv-count-num,
          .slv-anniversary-title {
            animation-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

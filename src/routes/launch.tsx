import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, Compass, ShieldCheck, Volume2, VolumeX, Award } from "lucide-react";
import slvHeroDesktop from "@/assets/videos/slv_green_4k_desktop.mp4";
import slvHeroMobile from "@/assets/videos/slv_green_4k_mobile.mp4";
import slvPoster from "@/assets/slv-poster.png";

const REDIRECT_URL = "https://www.slvgroup.co.in/";
const COUNT_INTERVAL_MS = 1000; // ~1 second per number (approx. 20s total countdown)
const ANNIVERSARY_HOLD_MS = 1800; // 1.8s showcase of "20 YEARS OF EXCELLENCE" before fireworks
const FIREWORKS_DURATION_MS = 21000; // 21 seconds of continuous celebratory fireworks (meets 18-20s requirement)
const FADE_OUT_DURATION_MS = 800; // Smooth final exit fade

export const Route = createFileRoute("/launch")({
  head: () => ({
    meta: [
      { title: "SLV Group — New Website Launch" },
      {
        name: "description",
        content:
          "Official Launch of the new SLV Group website. Celebrating 20 Years of Excellence in real estate developments across Andhra Pradesh.",
      },
      { property: "og:title", content: "SLV Group — New Website Launch" },
      {
        property: "og:description",
        content:
          "01 NOV 2026 — Celebrating 20 Years of Excellence. Explore SLV Group's landmark residential gated communities and plotted developments.",
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

    // Helper: Schedule an aerial burst boom & crack at time `t`
    const scheduleBoom = (t: number, subFreq = 145, gainLevel = 0.45) => {
      const boomTime = now + t;
      const boomOsc = ctx.createOscillator();
      const boomGain = ctx.createGain();
      boomOsc.type = "sine";
      boomOsc.frequency.setValueAtTime(subFreq, boomTime);
      boomOsc.frequency.exponentialRampToValueAtTime(30, boomTime + 0.45);
      boomGain.gain.setValueAtTime(gainLevel, boomTime);
      boomGain.gain.exponentialRampToValueAtTime(0.001, boomTime + 0.5);
      boomOsc.connect(boomGain);
      boomGain.connect(ctx.destination);
      boomOsc.start(boomTime);
      boomOsc.stop(boomTime + 0.55);

      const crackBuffer = createNoiseBuffer(0.2);
      const crackSource = ctx.createBufferSource();
      crackSource.buffer = crackBuffer;
      const crackFilter = ctx.createBiquadFilter();
      crackFilter.type = "lowpass";
      crackFilter.frequency.value = 1300;
      const crackGain = ctx.createGain();
      crackGain.gain.setValueAtTime(gainLevel * 0.75, boomTime);
      crackGain.gain.exponentialRampToValueAtTime(0.001, boomTime + 0.25);
      crackSource.connect(crackFilter);
      crackFilter.connect(crackGain);
      crackGain.connect(ctx.destination);
      crackSource.start(boomTime);
    };

    // Helper: Schedule ascending rocket whistle
    const scheduleWhistle = (t: number) => {
      const whistleTime = now + t;
      const whistleOsc = ctx.createOscillator();
      const whistleGain = ctx.createGain();
      whistleOsc.type = "sawtooth";
      whistleOsc.frequency.setValueAtTime(550, whistleTime);
      whistleOsc.frequency.exponentialRampToValueAtTime(3000, whistleTime + 0.45);
      whistleGain.gain.setValueAtTime(0.001, whistleTime);
      whistleGain.gain.linearRampToValueAtTime(0.15, whistleTime + 0.15);
      whistleGain.gain.exponentialRampToValueAtTime(0.001, whistleTime + 0.48);

      const whistleFilter = ctx.createBiquadFilter();
      whistleFilter.type = "bandpass";
      whistleFilter.frequency.setValueAtTime(1100, whistleTime);
      whistleFilter.frequency.exponentialRampToValueAtTime(3200, whistleTime + 0.45);
      whistleFilter.Q.value = 4.5;

      whistleOsc.connect(whistleFilter);
      whistleFilter.connect(whistleGain);
      whistleGain.connect(ctx.destination);
      whistleOsc.start(whistleTime);
      whistleOsc.stop(whistleTime + 0.5);
    };

    // 1. Initial rocket launches and bursts
    scheduleWhistle(0);
    scheduleBoom(0.45, 155, 0.5);
    scheduleBoom(0.85, 135, 0.45);
    scheduleBoom(1.8, 140, 0.42);

    // 2. Continuous periodic celebratory booms throughout 20s
    const boomMoments = [3.0, 4.2, 5.6, 7.0, 8.5, 10.0, 11.5, 13.0, 14.5, 16.0, 17.5, 19.0, 19.5];
    boomMoments.forEach((t) => {
      if (Math.random() > 0.4) scheduleWhistle(t - 0.4);
      scheduleBoom(t, 130 + Math.random() * 30, 0.38 + Math.random() * 0.15);
    });

    // 3. Dense Festive Sparkle & Crackle Chain across duration
    for (let i = 0; i < 70; i++) {
      const popDelay = 0.5 + Math.random() * 19.5;
      const popDuration = 0.015 + Math.random() * 0.025;
      const popBuffer = createNoiseBuffer(popDuration);
      const popSource = ctx.createBufferSource();
      popSource.buffer = popBuffer;

      const popFilter = ctx.createBiquadFilter();
      popFilter.type = "bandpass";
      popFilter.frequency.value = 1800 + Math.random() * 4000;
      popFilter.Q.value = 2.5 + Math.random() * 2.5;

      const popGain = ctx.createGain();
      popGain.gain.setValueAtTime(0.12 + Math.random() * 0.12, now + popDelay);
      popGain.gain.exponentialRampToValueAtTime(0.001, now + popDelay + popDuration);

      popSource.connect(popFilter);
      popFilter.connect(popGain);
      popGain.connect(ctx.destination);
      popSource.start(now + popDelay);
    }
  } catch {
    // Audio fallback
  }
}

export type LaunchExperienceState =
  | "idle" // Normal landing screen
  | "fading_intro" // Smooth fade-out of intro content & button
  | "counting" // Sequential 1 to 20 counter (approx. 20s)
  | "anniversary" // 20 YEARS OF EXCELLENCE grand reveal
  | "fireworks" // Celebratory golden fireworks display (20+ seconds)
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

  // ── Step 5: Continuous 20-Second Fireworks Canvas Particle Engine ──
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
          decay: Math.random() * 0.012 + 0.006,
          gravity: 0.085,
          sparkle: Math.random() > 0.35,
          trail: [],
        });
      }
    };

    const addTimeout = (fn: () => void, delayMs: number) => {
      const id = setTimeout(fn, delayMs);
      timeoutsRef.current.push(id);
    };

    // Staggered sequence across the full 20+ second celebration
    // 0s – Initial flanking bursts
    createBurst(canvas.width * 0.22, canvas.height * 0.35, 110, 1.05);
    createBurst(canvas.width * 0.78, canvas.height * 0.35, 110, 1.05);

    // 0.8s – High central burst
    addTimeout(() => {
      createBurst(canvas.width * 0.5, canvas.height * 0.18, 140, 1.2);
    }, 800);

    // 1.8s – Champagne cascade bursts
    addTimeout(() => {
      createBurst(canvas.width * 0.35, canvas.height * 0.26, 95, 0.95);
      createBurst(canvas.width * 0.65, canvas.height * 0.26, 95, 0.95);
    }, 1800);

    // 3.0s – Outer festive bursts
    addTimeout(() => {
      createBurst(canvas.width * 0.14, canvas.height * 0.4, 90, 1.0);
      createBurst(canvas.width * 0.86, canvas.height * 0.4, 90, 1.0);
    }, 3000);

    // 4.2s – Golden canopy burst
    addTimeout(() => {
      createBurst(canvas.width * 0.5, canvas.height * 0.22, 130, 1.15);
    }, 4200);

    // 5.6s – Mid-stage dual bursts
    addTimeout(() => {
      createBurst(canvas.width * 0.28, canvas.height * 0.32, 105, 1.05);
      createBurst(canvas.width * 0.72, canvas.height * 0.32, 105, 1.05);
    }, 5600);

    // 7.0s – Triple crescendo burst
    addTimeout(() => {
      createBurst(canvas.width * 0.25, canvas.height * 0.28, 100, 1.0);
      createBurst(canvas.width * 0.5, canvas.height * 0.16, 140, 1.2);
      createBurst(canvas.width * 0.75, canvas.height * 0.28, 100, 1.0);
    }, 7000);

    // 8.5s – Diamond sparkling burst
    addTimeout(() => {
      createBurst(canvas.width * 0.38, canvas.height * 0.24, 110, 1.1);
      createBurst(canvas.width * 0.62, canvas.height * 0.24, 110, 1.1);
    }, 8500);

    // 10.0s – Mid-show grand starburst
    addTimeout(() => {
      createBurst(canvas.width * 0.5, canvas.height * 0.2, 150, 1.25);
    }, 10000);

    // 11.5s – Wide outer celebratory bursts
    addTimeout(() => {
      createBurst(canvas.width * 0.18, canvas.height * 0.38, 95, 1.0);
      createBurst(canvas.width * 0.82, canvas.height * 0.38, 95, 1.0);
    }, 11500);

    // 13.0s – Cascading amber & gold bursts
    addTimeout(() => {
      createBurst(canvas.width * 0.32, canvas.height * 0.3, 105, 1.05);
      createBurst(canvas.width * 0.68, canvas.height * 0.3, 105, 1.05);
    }, 13000);

    // 14.5s – High apex canopy burst
    addTimeout(() => {
      createBurst(canvas.width * 0.5, canvas.height * 0.18, 135, 1.15);
    }, 14500);

    // 16.0s – Twin golden bursts
    addTimeout(() => {
      createBurst(canvas.width * 0.24, canvas.height * 0.34, 100, 1.05);
      createBurst(canvas.width * 0.76, canvas.height * 0.34, 100, 1.05);
    }, 16000);

    // 17.5s – Pre-finale escalation bursts
    addTimeout(() => {
      createBurst(canvas.width * 0.35, canvas.height * 0.25, 110, 1.1);
      createBurst(canvas.width * 0.65, canvas.height * 0.25, 110, 1.1);
    }, 17500);

    // 19.0s – GRAND JUBILEE FINALE (Coordinated 4-burst sky celebration)
    addTimeout(() => {
      createBurst(canvas.width * 0.2, canvas.height * 0.28, 120, 1.15);
      createBurst(canvas.width * 0.4, canvas.height * 0.16, 150, 1.25);
      createBurst(canvas.width * 0.6, canvas.height * 0.16, 150, 1.25);
      createBurst(canvas.width * 0.8, canvas.height * 0.28, 120, 1.15);
    }, 19000);

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

    // Step 1: Smooth button interaction & fade out intro content (350ms)
    setAnimState("fading_intro");

    const introTimeout = setTimeout(() => {
      // Step 2: Natural countdown from 1 to 20 (~1s per number, ~20s total)
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

          // Step 4: After anniversary showcase, start celebratory fireworks (at least 20 seconds)!
          const fireworksDelayTimeout = setTimeout(() => {
            setAnimState("fireworks");
            startFireworks();
            createCinematicAudio(muted, audioCtxRef);

            // Step 5: After 21s fireworks celebration finishes, smoothly redirect to main site
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

      {/* ── 4. HEADER NAVIGATION (Skip Intro completely removed) ── */}
      <header className="relative z-40 flex items-center justify-between px-6 py-6 md:px-12 md:py-8 w-full">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-[#c9a84c] animate-pulse" />
          <span className="text-xs uppercase tracking-[0.25em] text-[#e8d5a3] font-medium drop-shadow-md">
            SLV Group Official Launch
          </span>
        </div>

        <div className="flex items-center">
          {/* Sound Toggle */}
          <button
            onClick={() => setMuted(!muted)}
            className="p-2.5 rounded-full border border-white/10 bg-black/40 hover:bg-black/60 text-[#c9a84c] transition-all cursor-pointer"
            title={muted ? "Unmute audio" : "Mute audio"}
            aria-label={muted ? "Unmute audio" : "Mute audio"}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── 5. MAIN STAGE ── */}
      <main className="relative z-40 flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-6 text-center max-w-5xl mx-auto">
        {/* 1. SLV Group Logo with Breathing Gold Halo */}
        <div
          className={`slv-logo-container relative mb-6 sm:mb-8 transition-all duration-700 ${
            animState === "counting" || animState === "anniversary" || animState === "fireworks"
              ? "opacity-90 scale-90 -translate-y-2"
              : ""
          }`}
        >
          <div className="slv-logo-halo absolute inset-0 rounded-full blur-2xl" />
          <div className="relative p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-white/10 to-transparent border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-md">
            <img
              src="/slv-logo.png"
              alt="SLV Group Emblem"
              className="slv-logo-img w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain drop-shadow-[0_8px_30px_rgba(201,168,76,0.5)] transition-all duration-700"
              loading="eager"
            />
          </div>
        </div>

        {/* ── PHASE A: SIMPLIFIED LAUNCH HERO (Visible when idle) ── */}
        <div
          className={`slv-idle-content flex flex-col items-center justify-center transition-all duration-500 ease-out ${
            isExperienceActive
              ? "opacity-0 -translate-y-6 pointer-events-none absolute"
              : "opacity-100"
          }`}
        >
          {/* 2. Primary Heading: NEW WEBSITE LAUNCH (Strict Single Line) */}
          <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold uppercase tracking-[0.12em] sm:tracking-[0.18em] md:tracking-[0.22em] text-[#fffdfa] leading-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] whitespace-nowrap select-none">
            New Website{" "}
            <span className="bg-gradient-to-r from-[#ffe49e] via-[#c9a84c] to-[#fff3d1] bg-clip-text text-transparent">
              Launch
            </span>
          </h1>

          {/* 3. Launch Date: 01 NOV 2026 */}
          <div className="mt-4 sm:mt-5 mb-8 sm:mb-11 inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-[#c9a84c]/40 bg-black/60 backdrop-blur-md shadow-[0_4px_25px_rgba(201,168,76,0.2)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c9a84c] animate-pulse" />
            <p className="font-serif text-sm sm:text-base md:text-lg tracking-[0.3em] sm:tracking-[0.35em] text-[#f4e2b8] font-medium uppercase whitespace-nowrap">
              01 NOV 2026
            </p>
            <span className="h-1.5 w-1.5 rounded-full bg-[#c9a84c] animate-pulse" />
          </div>

          {/* 4. Prominent Enter the Experience Button (Enlarged & High-Impact) */}
          <div className="flex items-center justify-center">
            <button
              onClick={handleEnterExperience}
              disabled={isExperienceActive}
              className="slv-cta-btn group relative inline-flex items-center justify-center gap-4 px-12 py-5 sm:px-16 sm:py-6 md:px-20 md:py-6.5 rounded-full text-sm sm:text-base md:text-lg uppercase tracking-[0.26em] sm:tracking-[0.28em] font-bold text-[#0a0a0a] bg-gradient-to-r from-[#d4b55a] via-[#f8eed1] to-[#c49f42] hover:shadow-[0_0_65px_rgba(201,168,76,0.8)] transition-all duration-300 transform hover:scale-[1.04] active:scale-[0.96] cursor-pointer disabled:cursor-wait whitespace-nowrap"
            >
              <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-[#1a1405] transition-transform duration-700 group-hover:rotate-90 shrink-0" />
              <span>Enter The Experience</span>
              <span className="slv-btn-shimmer" />
            </button>
          </div>
        </div>

        {/* ── PHASE B: STEP 3 NATURAL COUNTDOWN (1 to 20, ~1s per number) ── */}
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

        {/* ── PHASE C & D: STEP 4 & 5 "20 YEARS OF EXCELLENCE" CELEBRATION & 20-SECOND FIREWORKS ── */}
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
          animation: slv-num-tick 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slv-num-tick {
          0% {
            transform: scale(0.9);
            opacity: 0.4;
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
          animation: slv-reveal-20 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
          transition: opacity 0.8s ease-out;
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

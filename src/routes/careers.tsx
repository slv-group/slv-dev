import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ChevronDown, UploadCloud, FileText, Check, X, Briefcase, MapPin } from "lucide-react";
import { jobOpenings } from "@/data/projects";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — SLV Group" },
      {
        name: "description",
        content:
          "Join SLV Group. Explore open roles in sales, design, and marketing, and submit your application online.",
      },
      { property: "og:title", content: "Careers — SLV Group" },
      {
        property: "og:description",
        content: "Build your career with India's luxury real estate leader.",
      },
    ],
  }),
  component: CareersPage,
});

function Dropzone() {
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = (f: File | null) => {
    if (!f) return;
    const valid = /\.(pdf|docx?|doc)$/i.test(f.name);
    if (!valid) return toast.error("Only PDF or DOC files are allowed.");
    if (f.size > 5 * 1024 * 1024) return toast.error("File must be under 5MB.");
    setFile(f);
    setProgress(0);
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t);
          return 100;
        }
        return p + 10;
      });
    }, 80);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handle(e.dataTransfer.files?.[0] ?? null);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative cursor-pointer rounded-3xl p-10 text-center transition-all neu-pressed",
          drag && "ring-2 ring-gold",
        )}
      >
        {drag && <div className="absolute inset-0 rounded-3xl bg-gold/10 backdrop-blur-sm" />}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => handle(e.target.files?.[0] ?? null)}
        />
        <UploadCloud className="mx-auto h-10 w-10 text-gold" />
        <p className="mt-4 font-medium text-foreground">
          {drag ? "Drop your resume here" : "Drag & drop your resume / CV"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          or click to browse · PDF or DOC · max 5MB
        </p>
      </div>

      {file && (
        <div className="mt-4 rounded-2xl bg-card p-4 neu-sm">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-gold" />
            <span className="flex-1 truncate text-sm font-medium text-foreground">{file.name}</span>
            {progress >= 100 ? (
              <Check className="h-5 w-5 text-emerald-500" />
            ) : (
              <span className="text-xs text-muted-foreground">{progress}%</span>
            )}
            <button onClick={() => setFile(null)} aria-label="Remove">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-gold transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function CareersPage() {
  const [open, setOpen] = useState(0);

  return (
    <div className="pt-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <p className="section-label text-gold">Careers</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-foreground sm:text-6xl">
            Build the Extraordinary
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Join a team that turns blueprints into landmarks. Explore our open roles below.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* Job listings */}
          <div className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-foreground">Open Positions</h2>
            {jobOpenings.map((job, i) => (
              <div key={job.id} className="overflow-hidden rounded-2xl bg-card neu-sm">
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span>
                    <span className="block font-display text-lg font-semibold text-foreground">
                      {job.title}
                    </span>
                    <span className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3 text-gold" /> {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gold" /> {job.location}
                      </span>
                      <span>{job.type}</span>
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-gold transition-transform",
                      open === i && "rotate-180",
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-300",
                    open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                      {job.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Application form */}
          <div className="h-fit rounded-3xl bg-card p-7 neu">
            <h2 className="font-display text-2xl font-semibold text-foreground">Apply Now</h2>
            <form
              className="mt-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Application submitted! Our HR team will be in touch.");
              }}
            >
              <input
                required
                placeholder="Full Name"
                className="w-full rounded-xl bg-background px-4 py-3 text-sm neu-pressed focus:outline-none"
              />
              <input
                required
                type="email"
                placeholder="Email Address"
                className="w-full rounded-xl bg-background px-4 py-3 text-sm neu-pressed focus:outline-none"
              />
              <input
                required
                placeholder="Phone Number"
                className="w-full rounded-xl bg-background px-4 py-3 text-sm neu-pressed focus:outline-none"
              />
              <Dropzone />
              <button className="w-full rounded-xl bg-gradient-gold py-3.5 text-sm font-semibold text-gold-foreground transition-transform hover:scale-[1.01]">
                Submit Application
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

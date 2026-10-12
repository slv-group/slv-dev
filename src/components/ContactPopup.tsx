import { useEffect, useState } from "react";
import { Loader2, MessageCircle, X } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Project = {
  id: string;
  name: string;
};

const whatsappMessage = encodeURIComponent(
  `Hello SLV Group,

I am interested in your projects and would like more information regarding available properties, pricing, and site visits.

Please share the details.

Thank you.`,
);

export function ContactPopup() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOpen(true);
    }, 500);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadProjects = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .eq("is_published", true)
        .eq("status", "Ongoing")
        .order("sort_order", { ascending: true });

      if (!error && data) {
        setProjects(data);
      }
    };

    loadProjects();
  }, []);

  const closePopup = () => {
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      const projectId = selectedProject && selectedProject !== "general" ? selectedProject : null;

      const { error } = await supabase.from("leads").insert({
        name: fullName,
        phone: phoneNumber,
        email: emailAddress,
        project_id: projectId,
        message: messageText || null,
        source: "contact",
        status: "new",
      });

      if (error) throw error;

      toast.success("Thank you! Our team will contact you shortly.");

      setFullName("");
      setPhoneNumber("");
      setEmailAddress("");
      setSelectedProject("");
      setMessageText("");

      closePopup();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit enquiry. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && closePopup()}>
      <DialogContent
        className="
          w-[calc(100%-2rem)]
          max-w-xl
          overflow-y-auto
          rounded-3xl
          border-border/50
          bg-card/95
          p-5
          shadow-2xl
          backdrop-blur-xl
          sm:p-8
          max-h-[90vh]
        "
      >
        <DialogHeader className="pr-8 text-left">
          <p className="section-label text-gold">Get in Touch</p>

          <DialogTitle className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
            Let&apos;s Find Your Home
          </DialogTitle>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Share your details and our relationship team will contact you shortly.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Full Name *"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl bg-background px-4 py-3 text-sm text-foreground neu-pressed focus:outline-none focus:ring-2 focus:ring-gold/40"
            />

            <input
              required
              type="tel"
              placeholder="Phone Number *"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full rounded-xl bg-background px-4 py-3 text-sm text-foreground neu-pressed focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>

          <input
            required
            type="email"
            placeholder="Email Address *"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            className="w-full rounded-xl bg-background px-4 py-3 text-sm text-foreground neu-pressed focus:outline-none focus:ring-2 focus:ring-gold/40"
          />

          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full rounded-xl bg-background px-4 py-3 text-sm text-foreground neu-pressed focus:outline-none"
          >
            <option value="">I&apos;m interested in…</option>

            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}

            <option value="general">General Enquiry</option>
          </select>

          <textarea
            rows={4}
            placeholder="Tell us what you're looking for…"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="w-full resize-none rounded-xl bg-background px-4 py-3 text-sm text-foreground neu-pressed focus:outline-none focus:ring-2 focus:ring-gold/40"
          />

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold py-3.5 text-sm font-semibold text-gold-foreground transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit Enquiry
          </button>

          <a
            href={`https://wa.me/919859595939?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.01]"
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
          </a>
        </form>
      </DialogContent>
    </Dialog>
  );
}

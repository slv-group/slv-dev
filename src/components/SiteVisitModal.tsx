import { useState } from "react";
import { Calendar, Clock, User, Phone, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { format, addHours, startOfHour } from "date-fns";
import { cn } from "@/lib/utils";

export function SiteVisitModal({
  projectId,
  projectName,
  trigger,
}: {
  projectId?: string;
  projectName?: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const nextHour = startOfHour(addHours(new Date(), 1));

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: nextHour as Date | undefined,
    time: format(nextHour, "HH:mm"),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formattedDate = formData.date ? format(formData.date, "yyyy-MM-dd") : "Not specified";
      const detailedMessage = `Preferred Date: ${formattedDate}\nPreferred Time: ${formData.time}`;

      const { error } = await supabase.from("leads").insert({
        name: formData.name,
        phone: formData.phone,
        project_id: projectId || null,
        message: detailedMessage,
        source: "site_visit",
        status: "new",
      });

      if (error) throw error;
      toast.success("Site visit booked successfully! Our team will contact you to confirm.");
      setOpen(false);
      setFormData({ name: "", phone: "", date: nextHour, time: format(nextHour, "HH:mm") });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to book site visit. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl bg-card border-gold/20 shadow-2xl p-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent pointer-events-none" />
        <div className="p-6 relative z-10">
          <DialogHeader className="mb-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center mb-4 text-gold-foreground shadow-lg shadow-gold/20">
              <MapPin className="h-6 w-6" />
            </div>
            <DialogTitle className="text-2xl font-display font-bold text-center text-foreground">
              Book a Site Visit
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground mt-2">
              {projectName
                ? `Schedule a private viewing for ${projectName}.`
                : "Schedule a private viewing of our properties."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  required
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl bg-background pl-11 pr-4 py-3.5 text-sm neu-pressed focus:outline-none focus:ring-1 focus:ring-gold/50 text-foreground"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  required
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl bg-background pl-11 pr-4 py-3.5 text-sm neu-pressed focus:outline-none focus:ring-1 focus:ring-gold/50 text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "w-full flex items-center justify-start rounded-xl bg-background pl-11 pr-4 py-3.5 text-sm neu-pressed focus:outline-none focus:ring-1 focus:ring-gold/50 text-foreground transition-all",
                          !formData.date && "text-muted-foreground",
                        )}
                      >
                        {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 border-border bg-card rounded-xl"
                      align="start"
                    >
                      <CalendarUI
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => setFormData({ ...formData, date: date || nextHour })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    required
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full rounded-xl bg-background pl-11 pr-4 py-3.5 text-sm neu-pressed focus:outline-none focus:ring-1 focus:ring-gold/50 text-foreground [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            <button
              disabled={submitting}
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-gold py-4 text-sm font-bold text-gold-foreground transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-gold/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
              Confirm Booking
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

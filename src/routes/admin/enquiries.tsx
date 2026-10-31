import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables, Enums } from "@/integrations/supabase/types";
import {
  Search,
  MessageSquare,
  Eye,
  Clock,
  Phone,
  Mail,
  StickyNote,
  Loader2,
  Download,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/enquiries")({
  component: EnquiriesManagement,
});

type Lead = Tables<"leads">;
type LeadStatus = Enums<"lead_status">;
type LeadSource = Enums<"lead_source">;

const statusColors: Record<LeadStatus, string> = {
  new: "bg-sky-500/15 text-sky-600 border-sky-500/20",
  contacted: "bg-amber-500/15 text-amber-600 border-amber-500/20",
  qualified: "bg-violet-500/15 text-violet-600 border-violet-500/20",
  won: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
  lost: "bg-rose-500/15 text-rose-600 border-rose-500/20",
};

const statuses: LeadStatus[] = ["new", "contacted", "qualified", "won", "lost"];
const sources: LeadSource[] = [
  "hero",
  "project_enquiry",
  "brochure",
  "contact",
  "careers",
  "site_visit",
];

// Helper to extract structured enquiry metadata from message
function parseLeadMetadata(rawMessage: string | null | undefined) {
  if (!rawMessage) {
    return { enquiryType: null, whatsapp: null, cleanMessage: null };
  }

  const typeMatch = rawMessage.match(/\[Enquiry Type\]:\s*([^\n]+)/i);
  const interestMatch = rawMessage.match(/\[Interested In\]:\s*([^\n]+)/i);
  const waMatch = rawMessage.match(/\[WhatsApp Number\]:\s*([^\n]+)/i);
  const msgMatch = rawMessage.match(/\[Message\]:\s*([\s\S]+)/i);

  const enquiryType = typeMatch
    ? typeMatch[1].trim()
    : interestMatch && interestMatch[1].trim().toLowerCase() === "others"
      ? "Others"
      : null;
  const whatsapp = waMatch ? waMatch[1].trim() : null;
  const cleanMessage = msgMatch
    ? msgMatch[1].trim()
    : !typeMatch && !waMatch && !interestMatch
      ? rawMessage.trim()
      : null;

  return { enquiryType, whatsapp, cleanMessage };
}

function EnquiriesManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Fetch all projects for ID-to-name mapping
  const { data: projectsList = [] } = useQuery({
    queryKey: ["admin-projects-lookup"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("id, name");
      if (error) throw error;
      return data;
    },
  });

  const projectMap = useMemo(() => {
    return new Map(projectsList.map((p) => [p.id, p.name]));
  }, [projectsList]);

  // Export filtered enquiries in Excel-compatible CSV format
  const downloadExcel = () => {
    if (filtered.length === 0) {
      toast.error("No enquiries to export");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Phone",
      "WhatsApp Number",
      "Enquiry Type",
      "Project Interest",
      "Source",
      "Status",
      "Date Created",
      "Message",
      "Notes",
    ];

    const csvRows = [
      headers.join(","),
      ...filtered.map((lead) => {
        const projectName = lead.project_id
          ? projectMap.get(lead.project_id) || "Unknown Project"
          : "General Enquiry";
        const dateStr = new Date(lead.created_at).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        const meta = parseLeadMetadata(lead.message);

        const escapeCSV = (val: string | null | undefined) => {
          if (val === null || val === undefined) return '""';
          const formatted = val.replace(/"/g, '""');
          return `"${formatted}"`;
        };

        return [
          escapeCSV(lead.name),
          escapeCSV(lead.email),
          escapeCSV(lead.phone),
          escapeCSV(meta.whatsapp || (lead.phone ? `Same as phone (${lead.phone})` : "N/A")),
          escapeCSV(meta.enquiryType || "Residential"),
          escapeCSV(projectName),
          escapeCSV(lead.source),
          escapeCSV(lead.status),
          escapeCSV(dateStr),
          escapeCSV(meta.cleanMessage || lead.message),
          escapeCSV(lead.notes),
        ].join(",");
      }),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `enquiries_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Excel/CSV export completed");
  };

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      const { error } = await supabase
        .from("leads")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      toast.success("Status updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const saveNotes = async (id: string) => {
    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from("leads")
        .update({ notes: editNotes || null, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      toast.success("Notes saved");
      setViewingLead((prev) => (prev ? { ...prev, notes: editNotes || null } : prev));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingNotes(false);
    }
  };

  const openLead = (lead: Lead) => {
    setViewingLead(lead);
    setEditNotes(lead.notes ?? "");
  };

  const filtered = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (l.phone ?? "").includes(search) ||
      (l.message ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    const matchesSource = sourceFilter === "all" || l.source === sourceFilter;
    const meta = parseLeadMetadata(l.message);
    const matchesType =
      typeFilter === "all" ||
      (meta.enquiryType && meta.enquiryType.toLowerCase() === typeFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesSource && matchesType;
  });

  // Group by status for summary
  const statusCounts = statuses.reduce(
    (acc, s) => {
      acc[s] = leads.filter((l) => l.status === s).length;
      return acc;
    },
    {} as Record<LeadStatus, number>,
  );

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Status summary pills */}
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer",
              statusFilter === s
                ? statusColors[s]
                : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted",
            )}
          >
            <span className="capitalize">{s}</span>
            <span
              className={cn(
                "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                statusFilter === s ? "bg-current/20" : "bg-muted text-muted-foreground",
              )}
            >
              {statusCounts[s]}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, message…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="All sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {sources.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="residential">Residential</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
            <SelectItem value="plots">Plots</SelectItem>
            <SelectItem value="others">Others</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={downloadExcel}
          variant="outline"
          className="h-9 gap-2 border-gold/30 hover:border-gold/50 text-gold hover:text-gold hover:bg-gold/10 sm:ml-auto"
        >
          <Download className="w-4 h-4" />
          Export Excel
        </Button>

        <p className="text-xs text-muted-foreground whitespace-nowrap">
          {filtered.length} of {leads.length} leads
        </p>
      </div>

      {/* Table */}
      <div className="royal-card rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">No enquiries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  {[
                    "Name",
                    "Contact & WhatsApp",
                    "Enquiry / Project",
                    "Source",
                    "Status",
                    "Date",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => {
                  const meta = parseLeadMetadata(lead.message);
                  const cleanPhoneDigits = (lead.phone || "").replace(/[^\d]/g, "");
                  const whatsappDigits =
                    (meta.whatsapp || "").replace(/[^\d]/g, "") || cleanPhoneDigits;

                  return (
                    <tr
                      key={lead.id}
                      className={cn(
                        "border-b border-border/40 hover:bg-muted/20 transition-colors",
                        i === filtered.length - 1 && "border-0",
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center text-obsidian text-xs font-bold flex-shrink-0">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-[140px]">
                              {lead.name}
                            </p>
                            {lead.notes && (
                              <div className="flex items-center gap-1 text-[10px] text-amber-500">
                                <StickyNote className="w-2.5 h-2.5" />
                                has notes
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1 text-xs text-muted-foreground">
                          {lead.phone && (
                            <div className="flex items-center gap-1 font-medium text-foreground">
                              <Phone className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
                              <a
                                href={`tel:${lead.phone}`}
                                className="hover:text-gold transition-colors"
                              >
                                {lead.phone}
                              </a>
                            </div>
                          )}

                          {meta.whatsapp && (
                            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                              <MessageCircle className="w-3 h-3 flex-shrink-0" />
                              {whatsappDigits ? (
                                <a
                                  href={`https://wa.me/${whatsappDigits}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline flex items-center gap-1"
                                  title="Chat on WhatsApp"
                                >
                                  <span>WA: {meta.whatsapp}</span>
                                </a>
                              ) : (
                                <span>WA: {meta.whatsapp}</span>
                              )}
                            </div>
                          )}

                          {lead.email && (
                            <div className="flex items-center gap-1 truncate max-w-[160px] text-[11px]">
                              <Mail className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{lead.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {meta.enquiryType && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold/15 text-gold border border-gold/30">
                              {meta.enquiryType}
                            </span>
                          )}
                          <p className="text-xs font-medium text-foreground truncate max-w-[150px]">
                            {lead.project_id
                              ? projectMap.get(lead.project_id) || "Project"
                              : "General Enquiry"}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-xs text-muted-foreground capitalize">
                        {lead.source.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={lead.status}
                          onValueChange={(v) =>
                            updateStatusMutation.mutate({
                              id: lead.id,
                              status: v as LeadStatus,
                            })
                          }
                        >
                          <SelectTrigger
                            className={cn(
                              "h-7 w-32 text-xs border px-2 gap-1 cursor-pointer",
                              statusColors[lead.status as LeadStatus],
                            )}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map((s) => (
                              <SelectItem key={s} value={s} className="capitalize text-xs">
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(lead.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                          onClick={() => openLead(lead)}
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead Detail Dialog */}
      <Dialog open={!!viewingLead} onOpenChange={(o) => !o && setViewingLead(null)}>
        {viewingLead &&
          (() => {
            const meta = parseLeadMetadata(viewingLead.message);
            const cleanPhoneDigits = (viewingLead.phone || "").replace(/[^\d]/g, "");
            const whatsappDigits = (meta.whatsapp || "").replace(/[^\d]/g, "") || cleanPhoneDigits;

            return (
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-obsidian font-bold">
                      {viewingLead.name.charAt(0).toUpperCase()}
                    </div>
                    {viewingLead.name}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Contact info grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {viewingLead.phone ? (
                      <div className="p-3 rounded-lg bg-muted/30 border border-border/60">
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> Phone
                        </p>
                        <a
                          href={`tel:${viewingLead.phone}`}
                          className="text-sm font-medium hover:text-gold transition-colors"
                        >
                          {viewingLead.phone}
                        </a>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                        <p className="text-xs text-muted-foreground mb-1">Phone</p>
                        <p className="text-xs text-muted-foreground">Not provided</p>
                      </div>
                    )}

                    {meta.whatsapp ? (
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1 font-medium">
                          <MessageCircle className="w-3 h-3" /> WhatsApp
                        </p>
                        <p className="text-xs font-semibold text-foreground truncate">
                          {meta.whatsapp}
                        </p>
                        {whatsappDigits && (
                          <a
                            href={`https://wa.me/${whatsappDigits}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:underline mt-1 font-medium"
                          >
                            Chat on WhatsApp →
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-muted/20 border border-border/40">
                        <p className="text-xs text-muted-foreground mb-1">WhatsApp</p>
                        <p className="text-xs text-muted-foreground">Same as phone</p>
                      </div>
                    )}
                  </div>

                  {/* Email row (Optional) */}
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/60">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email Address
                    </p>
                    {viewingLead.email ? (
                      <a
                        href={`mailto:${viewingLead.email}`}
                        className="text-sm font-medium hover:text-gold transition-colors break-all"
                      >
                        {viewingLead.email}
                      </a>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Not provided (optional field)
                      </p>
                    )}
                  </div>

                  {/* Meta details */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-muted/20 text-center">
                      <p className="text-muted-foreground mb-1">Source</p>
                      <p className="font-semibold capitalize">
                        {viewingLead.source.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/20 text-center">
                      <p className="text-muted-foreground mb-1">Status</p>
                      <Badge
                        className={cn(
                          "text-[10px] capitalize border",
                          statusColors[viewingLead.status as LeadStatus],
                        )}
                      >
                        {viewingLead.status}
                      </Badge>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/20 text-center">
                      <p className="text-muted-foreground mb-1">Enquiry Type</p>
                      <p className="font-semibold text-gold">{meta.enquiryType || "Residential"}</p>
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/60">
                    <p className="text-xs text-muted-foreground mb-1">Interested Project</p>
                    <p className="text-sm font-semibold text-foreground">
                      {viewingLead.project_id
                        ? projectMap.get(viewingLead.project_id) || "Unknown Project"
                        : "General Enquiry"}
                    </p>
                  </div>

                  {/* Message */}
                  {(meta.cleanMessage || viewingLead.message) && (
                    <div className="p-3 rounded-lg bg-muted/20 border border-border/60">
                      <p className="text-xs text-muted-foreground mb-1.5">User Message</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {meta.cleanMessage || viewingLead.message}
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5 text-sm">
                      <StickyNote className="w-3.5 h-3.5" />
                      Internal Notes
                    </Label>
                    <Textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Add internal notes about this lead…"
                      rows={3}
                      className="text-sm resize-none"
                    />
                  </div>

                  {/* Status update */}
                  <div className="space-y-1.5">
                    <Label className="text-sm">Update Status</Label>
                    <Select
                      value={viewingLead.status}
                      onValueChange={(v) => {
                        updateStatusMutation.mutate({
                          id: viewingLead.id,
                          status: v as LeadStatus,
                        });
                        setViewingLead((prev) =>
                          prev ? { ...prev, status: v as LeadStatus } : prev,
                        );
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setViewingLead(null)}>
                    Close
                  </Button>
                  <Button
                    onClick={() => saveNotes(viewingLead.id)}
                    disabled={savingNotes}
                    className="bg-gradient-gold text-obsidian font-semibold hover:opacity-90 gap-2"
                  >
                    {savingNotes && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Notes
                  </Button>
                </DialogFooter>
              </DialogContent>
            );
          })()}
      </Dialog>
    </div>
  );
}

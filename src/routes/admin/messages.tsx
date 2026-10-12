import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  Search,
  Mail,
  MailOpen,
  Phone,
  Calendar,
  FileText,
  ExternalLink,
  Loader2,
  Inbox,
  CheckCircle2,
  XCircle,
  Clock3,
  FileSpreadsheet,
  FileDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { exportRegistrationsToExcel } from "@/lib/exports/excel";
import { exportRegistrationsToPDF } from "@/lib/exports/pdf";

export const Route = createFileRoute("/admin/messages")({
  component: RegistrationMessages,
});

type Registration = Tables<"work_registrations">;

const registrationLabels: Record<string, string> = {
  architect_consultant: "Architect & Consultant",
  contractor: "Contractor",
  vendor_supplier: "Vendor & Supplier",
  land_proposal: "Land Proposal",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
};

export function formatFieldName(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusClass(status: string) {
  switch (status) {
    case "approved":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600";

    case "rejected":
      return "border-red-500/20 bg-red-500/10 text-red-600";

    case "under_review":
      return "border-blue-500/20 bg-blue-500/10 text-blue-600";

    default:
      return "border-amber-500/20 bg-amber-500/10 text-amber-600";
  }
}

function RegistrationMessages() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Registration | null>(null);
  const [openingDocument, setOpeningDocument] = useState<string | null>(null);

  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ["admin-work-registrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data as Registration[];
    },
  });

  const openRegistrationMutation = useMutation({
    mutationFn: async (registration: Registration) => {
      const updates: Partial<Registration> = {
        viewed: true,
        updated_at: new Date().toISOString(),
      };

      // Opening a pending application begins the review process.
      if (registration.status === "pending") {
        updates.status = "under_review";
      }

      const { data, error } = await supabase
        .from("work_registrations")
        .update(updates)
        .eq("id", registration.id)
        .select()
        .single();

      if (error) throw error;

      return data as Registration;
    },

    onSuccess: (updatedRegistration) => {
      setSelected(updatedRegistration);

      queryClient.invalidateQueries({
        queryKey: ["admin-work-registrations"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-unread-registration-count"],
      });
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const openRegistration = (registration: Registration) => {
    setSelected(registration);

    const needsUpdate = !registration.viewed || registration.status === "pending";

    if (needsUpdate) {
      openRegistrationMutation.mutate(registration);
    }
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { data, error } = await supabase
        .from("work_registrations")
        .update({
          status,
          viewed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return data as Registration;
    },

    onSuccess: (updatedRegistration) => {
      setSelected(updatedRegistration);

      queryClient.invalidateQueries({
        queryKey: ["admin-work-registrations"],
      });

      toast.success(
        updatedRegistration.status === "approved"
          ? "Application approved successfully."
          : "Application rejected.",
      );
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const openDocument = async (path: string) => {
    if (!path) {
      toast.error("Document path is missing.");
      return;
    }

    // Open immediately while still inside the user's click event.
    const newWindow = window.open("", "_blank");

    if (!newWindow) {
      toast.error("Please allow pop-ups to view documents.");
      return;
    }

    setOpeningDocument(path);

    try {
      const { data, error } = await supabase.storage
        .from("registration-documents")
        .createSignedUrl(path, 60 * 5);

      if (error) throw error;

      if (!data?.signedUrl) {
        throw new Error("Supabase did not return a signed URL.");
      }

      newWindow.location.href = data.signedUrl;
    } catch (error) {
      newWindow.close();
      toast.error(error instanceof Error ? error.message : "Unable to open document.");
    } finally {
      setOpeningDocument(null);
    }
  };

  const filtered = registrations.filter((registration) => {
    const value = search.toLowerCase();

    return (
      registration.applicant_name.toLowerCase().includes(value) ||
      registration.email.toLowerCase().includes(value) ||
      registration.phone.toLowerCase().includes(value) ||
      registrationLabels[registration.registration_type]?.toLowerCase().includes(value)
    );
  });

  const unreadCount = registrations.filter((item) => !item.viewed).length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Applications</p>

              <p className="mt-1 text-3xl font-bold text-foreground">{registrations.length}</p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10">
              <Inbox className="h-5 w-5 text-gold" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-gold/[0.03] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Unread Messages</p>

              <p className="mt-1 text-3xl font-bold text-foreground">{unreadCount}</p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10">
              <Mail className="h-5 w-5 text-gold" />
            </div>
          </div>
        </div>
      </div>

      {/* Search + Export */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applications..."
            className="pl-10"
          />
        </div>

        {/* Export buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => exportRegistrationsToExcel(registrations)}
            disabled={isLoading || registrations.length === 0}
            className="gap-2"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Export Excel
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => exportRegistrationsToPDF(registrations)}
            disabled={isLoading || registrations.length === 0}
            className="gap-2"
          >
            <FileDown className="h-4 w-4 text-red-500" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Inbox className="mx-auto h-10 w-10 text-muted-foreground/40" />

            <p className="mt-3 text-sm text-muted-foreground">
              No registration applications found.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((registration) => (
              <button
                key={registration.id}
                type="button"
                onClick={() => openRegistration(registration)}
                className={cn(
                  "flex w-full items-start gap-4 p-5 text-left transition hover:bg-muted/40",
                  !registration.viewed && "border-l-4 border-l-gold bg-gold/[0.045]",
                )}
              >
                <div
                  className={cn(
                    "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    registration.viewed ? "bg-muted" : "bg-gold/10",
                  )}
                >
                  {registration.viewed ? (
                    <MailOpen className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Mail className="h-4 w-4 text-gold" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={cn(
                        "truncate text-sm",
                        !registration.viewed
                          ? "font-bold text-foreground"
                          : "font-medium text-foreground",
                      )}
                    >
                      {registration.applicant_name}
                    </p>

                    {!registration.viewed && <Badge className="bg-gold text-obsidian">New</Badge>}

                    <Badge variant="outline">
                      {registrationLabels[registration.registration_type] ??
                        registration.registration_type}
                    </Badge>
                  </div>

                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {registration.email}
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(registration.created_at).toLocaleString()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details dialog */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  {selected.applicant_name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-7">
                {/* Application type */}
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-gold text-obsidian">
                    {registrationLabels[selected.registration_type] ?? selected.registration_type}
                  </Badge>

                  <Badge variant="outline" className={getStatusClass(selected.status)}>
                    {statusLabels[selected.status] ?? selected.status}
                  </Badge>
                </div>

                {/* Contact */}
                <section className="rounded-xl border border-border p-5">
                  <h3 className="mb-4 font-semibold text-foreground">Contact Information</h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex gap-3">
                      <Mail className="mt-0.5 h-4 w-4 text-gold" />

                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>

                        <p className="text-sm font-medium">{selected.email}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Phone className="mt-0.5 h-4 w-4 text-gold" />

                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>

                        <p className="text-sm font-medium">{selected.phone}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Calendar className="mt-0.5 h-4 w-4 text-gold" />

                      <div>
                        <p className="text-xs text-muted-foreground">Submitted</p>

                        <p className="text-sm font-medium">
                          {new Date(selected.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-border bg-muted/20 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">Application Status</h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Review this application and update its status.
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className={cn("w-fit px-3 py-1", getStatusClass(selected.status))}
                    >
                      {statusLabels[selected.status] ?? selected.status}
                    </Badge>
                  </div>

                  {selected.status === "under_review" && (
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button
                        type="button"
                        disabled={updateStatusMutation.isPending}
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: selected.id,
                            status: "approved",
                          })
                        }
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        {updateStatusMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                        )}
                        Approve
                      </Button>

                      <Button
                        type="button"
                        variant="destructive"
                        disabled={updateStatusMutation.isPending}
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: selected.id,
                            status: "rejected",
                          })
                        }
                      >
                        {updateStatusMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="mr-2 h-4 w-4" />
                        )}
                        Reject
                      </Button>
                    </div>
                  )}

                  {selected.status === "approved" && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      This application has been approved.
                    </div>
                  )}

                  {selected.status === "rejected" && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-red-600">
                      <XCircle className="h-4 w-4" />
                      This application has been rejected.
                    </div>
                  )}

                  {selected.status === "pending" && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-amber-600">
                      <Clock3 className="h-4 w-4" />
                      Starting review...
                    </div>
                  )}
                </section>

                {/* Dynamic form data */}
                <section>
                  <h3 className="mb-4 font-semibold text-foreground">Application Details</h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {Object.entries((selected.form_data ?? {}) as Record<string, unknown>).map(
                      ([key, value]) => (
                        <div key={key} className="rounded-xl border border-border bg-muted/20 p-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {formatFieldName(key)}
                          </p>

                          <p className="mt-1 break-words text-sm font-medium text-foreground">
                            {String(value || "—")}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </section>

                {/* Documents */}
                <section>
                  <h3 className="mb-4 font-semibold text-foreground">Documents</h3>

                  {Object.keys((selected.document_paths ?? {}) as Record<string, string>).length ===
                  0 ? (
                    <p className="text-sm text-muted-foreground">No documents uploaded.</p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {Object.entries(
                        (selected.document_paths ?? {}) as Record<string, string>,
                      ).map(([name, path]) => (
                        <div
                          key={name}
                          className="flex items-center justify-between gap-3 rounded-xl border border-border p-4"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <FileText className="h-5 w-5 shrink-0 text-gold" />

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {formatFieldName(name)}
                              </p>

                              <p className="text-xs text-muted-foreground">Uploaded document</p>
                            </div>
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={openingDocument === path}
                            onClick={() => openDocument(path)}
                          >
                            {openingDocument === path ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                View
                                <ExternalLink className="ml-2 h-3.5 w-3.5" />
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Award as AwardIcon,
  Edit2,
  Image as ImageIcon,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { uploadAwardImage, deleteAwardImage } from "@/lib/awards";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/awards")({
  component: AwardsManagement,
});

type Award = Tables<"awards">;

type AwardCategory = "Leadership" | "Developer" | "Project" | "Lifetime Achievement";

type AwardFormData = {
  year: string;
  category: AwardCategory;
  title: string;
  subtitle: string;
  recipient: string;
  organization: string;
  issuer: string;
  location: string;
  description: string;
  image_url: string;
  featured: boolean;
  is_published: boolean;
  sort_order: string;
};

const defaultForm: AwardFormData = {
  year: "",
  category: "Leadership",
  title: "",
  subtitle: "",
  recipient: "",
  organization: "",
  issuer: "",
  location: "",
  description: "",
  image_url: "",
  featured: false,
  is_published: true,
  sort_order: "0",
};

const categoryColors: Record<AwardCategory, string> = {
  Leadership: "bg-violet-500/15 text-violet-600 border-violet-500/20",
  Developer: "bg-sky-500/15 text-sky-600 border-sky-500/20",
  Project: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
  "Lifetime Achievement": "bg-amber-500/15 text-amber-600 border-amber-500/20",
};

function AwardsManagement() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAward, setEditingAward] = useState<Award | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState<AwardFormData>(defaultForm);

  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: awards = [], isLoading } = useQuery({
    queryKey: ["admin-awards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("awards")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("year", { ascending: false });

      if (error) throw error;

      return data as Award[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AwardFormData) => {
      const { error } = await supabase.from("awards").insert({
        year: data.year ? Number(data.year) : null,
        category: data.category,
        title: data.title,
        subtitle: data.subtitle || null,
        recipient: data.recipient,
        organization: data.organization || null,
        issuer: data.issuer,
        location: data.location || null,
        description: data.description,
        image_url: data.image_url,
        featured: data.featured,
        is_published: data.is_published,
        sort_order: Number(data.sort_order) || 0,
      });

      if (error) throw error;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-awards"],
      });

      queryClient.invalidateQueries({
        queryKey: ["public-awards"],
      });

      toast.success("Award created successfully");
      closeForm();
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AwardFormData }) => {
      const { error } = await supabase
        .from("awards")
        .update({
          year: data.year ? Number(data.year) : null,
          category: data.category,
          title: data.title,
          subtitle: data.subtitle || null,
          recipient: data.recipient,
          organization: data.organization || null,
          issuer: data.issuer,
          location: data.location || null,
          description: data.description,
          image_url: data.image_url,
          featured: data.featured,
          is_published: data.is_published,
          sort_order: Number(data.sort_order) || 0,
        })
        .eq("id", id);

      if (error) throw error;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-awards"],
      });

      queryClient.invalidateQueries({
        queryKey: ["public-awards"],
      });

      toast.success("Award updated successfully");
      closeForm();
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (award: Award) => {
      await deleteAwardImage(award.image_url);

      const { error } = await supabase.from("awards").delete().eq("id", award.id);

      if (error) throw error;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-awards"],
      });

      queryClient.invalidateQueries({
        queryKey: ["public-awards"],
      });

      toast.success("Award deleted");
      setDeletingId(null);
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const filteredAwards = awards.filter((award) => {
    const text = [award.title, award.recipient, award.organization, award.issuer, award.category]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return text.includes(search.toLowerCase());
  });

  function openCreate() {
    setEditingAward(null);
    setForm(defaultForm);
    setShowForm(true);
  }

  function openEdit(award: Award) {
    setEditingAward(award);

    setForm({
      year: award.year?.toString() ?? "",
      category: award.category as AwardCategory,
      title: award.title,
      subtitle: award.subtitle ?? "",
      recipient: award.recipient,
      organization: award.organization ?? "",
      issuer: award.issuer,
      location: award.location ?? "",
      description: award.description,
      image_url: award.image_url,
      featured: award.featured,
      is_published: award.is_published,
      sort_order: award.sort_order.toString(),
    });

    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingAward(null);
    setForm(defaultForm);
  }

  function validateForm() {
    if (!form.title.trim()) {
      toast.error("Award title is required");
      return false;
    }

    if (!form.category) {
      toast.error("Award category is required");
      return false;
    }

    if (!form.recipient.trim()) {
      toast.error("Recipient is required");
      return false;
    }

    if (!form.issuer.trim()) {
      toast.error("Award issuer is required");
      return false;
    }

    if (!form.description.trim()) {
      toast.error("Description is required");
      return false;
    }

    if (!form.image_url.trim()) {
      toast.error("Award image is required");
      return false;
    }

    return true;
  }

  function submitForm(event: React.FormEvent) {
    event.preventDefault();

    if (!validateForm()) return;

    if (editingAward) {
      updateMutation.mutate({
        id: editingAward.id,
        data: form,
      });
    } else {
      createMutation.mutate(form);
    }
  }

  async function handleImageUpload(file: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be under 10 MB");
      return;
    }

    setUploadingImage(true);

    try {
      const url = await uploadAwardImage(file, form.year ? Number(form.year) : null);

      setForm((current) => ({
        ...current,
        image_url: url,
      }));

      toast.success("Award image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  }

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search awards..."
            className="pl-9"
          />
        </div>

        <Button onClick={openCreate} className="gap-2 bg-gradient-gold text-obsidian">
          <Plus className="h-4 w-4" />
          Add Award
        </Button>
      </div>

      {/* Table */}
      <div className="royal-card overflow-hidden rounded-xl">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : filteredAwards.length === 0 ? (
          <div className="py-16 text-center">
            <AwardIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />

            <p className="font-medium text-muted-foreground">
              {search ? "No matching awards" : "No awards yet"}
            </p>

            {!search && (
              <Button onClick={openCreate} variant="outline" className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Add your first award
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thumb-accent">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  {[
                    "Award",
                    "Recipient",
                    "Category",
                    "Year",
                    "Published",
                    "Featured",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredAwards.map((award, index) => (
                  <tr
                    key={award.id}
                    className={cn(
                      "border-b border-border/40 transition-colors hover:bg-muted/20",
                      index === filteredAwards.length - 1 && "border-0",
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex min-w-[260px] items-center gap-3">
                        <img
                          src={award.image_url}
                          alt={award.title}
                          className="h-12 w-16 rounded-lg object-cover"
                        />

                        <div>
                          <p className="font-semibold text-foreground">{award.title}</p>

                          {award.subtitle && (
                            <p className="text-xs text-muted-foreground">{award.subtitle}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">{award.recipient}</td>

                    <td className="px-4 py-3">
                      <Badge
                        className={cn("border", categoryColors[award.category as AwardCategory])}
                      >
                        {award.category}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 text-muted-foreground">{award.year ?? "—"}</td>

                    <td className="px-4 py-3">
                      <Switch
                        checked={award.is_published}
                        onCheckedChange={async (value) => {
                          const { error } = await supabase
                            .from("awards")
                            .update({
                              is_published: value,
                            })
                            .eq("id", award.id);

                          if (error) {
                            toast.error(error.message);
                            return;
                          }

                          queryClient.invalidateQueries({
                            queryKey: ["admin-awards"],
                          });

                          queryClient.invalidateQueries({
                            queryKey: ["public-awards"],
                          });
                        }}
                      />
                    </td>

                    <td className="px-4 py-3">
                      <Switch
                        checked={award.featured}
                        onCheckedChange={async (value) => {
                          const { error } = await supabase
                            .from("awards")
                            .update({
                              featured: value,
                            })
                            .eq("id", award.id);

                          if (error) {
                            toast.error(error.message);
                            return;
                          }

                          queryClient.invalidateQueries({
                            queryKey: ["admin-awards"],
                          });

                          queryClient.invalidateQueries({
                            queryKey: ["public-awards"],
                          });
                        }}
                      />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(award)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeletingId(award.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit */}
      <Dialog
        open={showForm}
        onOpenChange={(open) => {
          if (!open) closeForm();
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAward ? "Edit Award" : "Create Award"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={submitForm} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Title */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Award Title *</Label>

                <Input
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Legendary Personality"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Subtitle</Label>

                <Input
                  value={form.subtitle}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      subtitle: event.target.value,
                    }))
                  }
                  placeholder="in Real Estate"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label>Category *</Label>

                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category: event.target.value as AwardCategory,
                    }))
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="Leadership">Leadership</option>

                  <option value="Developer">Developer</option>

                  <option value="Project">Project</option>

                  <option value="Lifetime Achievement">Lifetime Achievement</option>
                </select>
              </div>

              {/* Year */}
              <div className="space-y-1.5">
                <Label>Year</Label>

                <Input
                  type="number"
                  value={form.year}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      year: event.target.value,
                    }))
                  }
                  placeholder="2025"
                />
              </div>

              {/* Recipient */}
              <div className="space-y-1.5">
                <Label>Recipient *</Label>

                <Input
                  value={form.recipient}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      recipient: event.target.value,
                    }))
                  }
                  placeholder="Penmetsa Srinivasa Raju"
                />
              </div>

              {/* Organization */}
              <div className="space-y-1.5">
                <Label>Organization</Label>

                <Input
                  value={form.organization}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      organization: event.target.value,
                    }))
                  }
                  placeholder="SLV Group"
                />
              </div>

              {/* Issuer */}
              <div className="space-y-1.5">
                <Label>Award Issuer *</Label>

                <Input
                  value={form.issuer}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      issuer: event.target.value,
                    }))
                  }
                  placeholder="Times Business Awards"
                />
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <Label>Location</Label>

                <Input
                  value={form.location}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      location: event.target.value,
                    }))
                  }
                  placeholder="Andhra Pradesh"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Description *</Label>

                <Textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  rows={5}
                  placeholder="Describe the recognition..."
                />
              </div>

              {/* Image */}
              <div className="space-y-3 sm:col-span-2">
                <Label>Award Image *</Label>

                {form.image_url ? (
                  <div className="relative h-52 overflow-hidden rounded-xl border border-border">
                    <img
                      src={form.image_url}
                      alt="Award"
                      className="h-full w-full object-contain bg-black"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          image_url: "",
                        }))
                      }
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-40 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border text-center">
                    <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground/40" />

                    <p className="text-sm text-muted-foreground">No image selected</p>
                  </div>
                )}

                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];

                      if (file) {
                        handleImageUpload(file);
                      }

                      event.target.value = "";
                    }}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    disabled={uploadingImage}
                    className="gap-2"
                  >
                    <span>
                      {uploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}

                      {uploadingImage ? "Uploading..." : "Upload Award Image"}
                    </span>
                  </Button>
                </label>
              </div>

              {/* Sort */}
              <div className="space-y-1.5">
                <Label>Sort Order</Label>

                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      sort_order: event.target.value,
                    }))
                  }
                />
              </div>

              {/* Publish */}
              <div className="flex items-center gap-3 rounded-xl border border-border p-4">
                <Switch
                  checked={form.is_published}
                  onCheckedChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      is_published: value,
                    }))
                  }
                />

                <div>
                  <p className="font-medium">Publish Award</p>

                  <p className="text-xs text-muted-foreground">Visible on public website</p>
                </div>
              </div>

              {/* Featured */}
              <div className="flex items-center gap-3 rounded-xl border border-border p-4 sm:col-span-2">
                <Switch
                  checked={form.featured}
                  onCheckedChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      featured: value,
                    }))
                  }
                />

                <div>
                  <p className="font-medium">Featured Award</p>

                  <p className="text-xs text-muted-foreground">
                    Can be highlighted on the awards page
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-border/60 pt-5">
              <Button type="button" variant="outline" onClick={closeForm} disabled={saving}>
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving || uploadingImage}
                className="gap-2 bg-gradient-gold text-obsidian"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}

                {editingAward ? "Save Changes" : "Create Award"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete award?</AlertDialogTitle>

            <AlertDialogDescription>
              This will remove the award record and its image from Supabase Storage.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={() => {
                const award = awards.find((item) => item.id === deletingId);

                if (award) {
                  deleteMutation.mutate(award);
                }
              }}
              className="bg-destructive text-destructive-foreground"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

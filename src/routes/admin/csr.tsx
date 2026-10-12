import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  HeartHandshake,
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
import { uploadCSRImage, deleteCSRImage } from "@/lib/csr";
import { cn } from "@/lib/utils";

// Static CSR images for resolving old DB paths
import annaCanteenImg from "@/assets/csr/anna-canteen-donation.png";
import communityImg from "@/assets/csr/community.jpg";
import csrP1 from "@/assets/csr/photo_2026-08-23_23-01-15.jpg";
import csrP2 from "@/assets/csr/photo_2026-08-23_23-01-19.jpg";
import csrP3 from "@/assets/csr/photo_2026-08-23_23-01-22.jpg";
import csrP4 from "@/assets/csr/photo_2026-08-23_23-01-26.jpg";

const csrImageMap: Record<string, string> = {
  "/src/assets/csr/anna-canteen-donation.png": annaCanteenImg,
  "/assets/csr/anna-canteen-donation.png": annaCanteenImg,
  "/src/assets/csr/community.jpg": communityImg,
  "/assets/csr/community.jpg": communityImg,
  "/src/assets/csr/photo_2026-08-23_23-01-15.jpg": csrP1,
  "/assets/csr/photo_2026-08-23_23-01-15.jpg": csrP1,
  "/src/assets/csr/photo_2026-08-23_23-01-19.jpg": csrP2,
  "/assets/csr/photo_2026-08-23_23-01-19.jpg": csrP2,
  "/src/assets/csr/photo_2026-08-23_23-01-22.jpg": csrP3,
  "/assets/csr/photo_2026-08-23_23-01-22.jpg": csrP3,
  "/src/assets/csr/photo_2026-08-23_23-01-26.jpg": csrP4,
  "/assets/csr/photo_2026-08-23_23-01-26.jpg": csrP4,
};

function resolveCSRImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (csrImageMap[url]) return csrImageMap[url];
  if (url.startsWith("http")) return url;
  return communityImg;
}

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

export const Route = createFileRoute("/admin/csr")({
  component: CSRManagement,
});

type CSRActivity = Tables<"csr_activities">;

type CSRCategory =
  "Community" | "Healthcare & Accessibility" | "Education" | "Environment" | "Food & Relief";

type CSRFormData = {
  title: string;
  category: CSRCategory;
  year: string;
  date: string;
  location: string;
  short_description: string;
  description: string;
  impact: string;
  beneficiaries: string;
  image_url: string;
  featured: boolean;
  is_published: boolean;
  sort_order: string;
};

const defaultForm: CSRFormData = {
  title: "",
  category: "Community",
  year: new Date().getFullYear().toString(),
  date: "",
  location: "",
  short_description: "",
  description: "",
  impact: "",
  beneficiaries: "",
  image_url: "",
  featured: false,
  is_published: true,
  sort_order: "0",
};

const categoryColors: Record<CSRCategory, string> = {
  Community: "bg-violet-500/15 text-violet-600 border-violet-500/20",
  "Healthcare & Accessibility": "bg-sky-500/15 text-sky-600 border-sky-500/20",
  Education: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
  Environment: "bg-green-500/15 text-green-600 border-green-500/20",
  "Food & Relief": "bg-amber-500/15 text-amber-600 border-amber-500/20",
};

function CSRManagement() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<CSRActivity | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState<CSRFormData>(defaultForm);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["admin-csr-activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("csr_activities")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("year", { ascending: false });

      if (error) throw error;
      return data as CSRActivity[];
    },
  });

  //
  // MUTATIONS
  //
  const saveMutation = useMutation({
    mutationFn: async (data: CSRFormData) => {
      const payload = {
        title: data.title,
        category: data.category,
        year: parseInt(data.year) || null,
        date: data.date,
        location: data.location,
        short_description: data.short_description,
        description: data.description,
        impact: data.impact,
        beneficiaries: data.beneficiaries,
        image_url: data.image_url,
        featured: data.featured,
        is_published: data.is_published,
        sort_order: parseInt(data.sort_order) || 0,
      };

      if (editingActivity) {
        const { error } = await supabase
          .from("csr_activities")
          .update(payload)
          .eq("id", editingActivity.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("csr_activities").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-csr-activities"] });
      toast.success(
        editingActivity ? "CSR Activity updated successfully" : "CSR Activity created successfully",
      );
      closeForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save CSR activity");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const activity = activities.find((a) => a.id === id);
      if (activity?.image_url && activity.image_url.includes("supabase.co")) {
        await deleteCSRImage(activity.image_url);
      }
      const { error } = await supabase.from("csr_activities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-csr-activities"] });
      toast.success("CSR Activity deleted successfully");
      setDeletingId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete CSR activity");
    },
  });

  //
  // HANDLERS
  //
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      console.log("Current Supabase user:", user);
      console.log("Auth error:", authError);

      if (!user) {
        throw new Error("You are not authenticated. Please log in again.");
      }

      const url = await uploadCSRImage(file);
      setForm({ ...form, image_url: url });
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageRemove = async () => {
    if (!form.image_url) return;

    try {
      if (form.image_url.includes("supabase.co")) {
        await deleteCSRImage(form.image_url);
      }
      setForm({ ...form, image_url: "" });
    } catch (error: any) {
      toast.error("Failed to remove image");
    }
  };

  const openForm = (activity?: CSRActivity) => {
    if (activity) {
      setEditingActivity(activity);
      setForm({
        title: activity.title,
        category: activity.category as CSRCategory,
        year: activity.year?.toString() || "",
        date: activity.date || "",
        location: activity.location || "",
        short_description: activity.short_description || "",
        description: activity.description || "",
        impact: activity.impact || "",
        beneficiaries: activity.beneficiaries || "",
        image_url: activity.image_url || "",
        featured: activity.featured || false,
        is_published: activity.is_published,
        sort_order: activity.sort_order?.toString() || "0",
      });
    } else {
      setEditingActivity(null);
      setForm(defaultForm);
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingActivity(null);
    setForm(defaultForm);
  };

  const filteredActivities = activities.filter((activity) =>
    activity.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-semibold text-foreground">CSR Activities</h2>
          <p className="mt-1 text-muted-foreground">
            Manage corporate social responsibility initiatives.
          </p>
        </div>

        <Button
          onClick={() => openForm()}
          className="bg-gold hover:bg-gold/90 text-obsidian font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Activity
        </Button>
      </div>

      {/* TOOLBAR */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* CONTENT */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center border border-border/50 border-dashed rounded-2xl">
          <Loader2 className="w-6 h-6 text-gold animate-spin" />
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center border border-border/50 border-dashed rounded-2xl text-center px-4">
          <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center mb-4">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <p className="text-lg font-medium text-foreground">No activities found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? "Try adjusting your search terms." : "Get started by adding a new activity."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="group flex flex-col sm:flex-row sm:items-center gap-6 p-4 rounded-2xl border border-border bg-card hover:border-gold/30 transition-colors"
            >
              {/* IMAGE */}
              <div className="w-full sm:w-48 aspect-video bg-muted rounded-xl overflow-hidden shrink-0 border border-border/50">
                {activity.image_url ? (
                  <img
                    src={resolveCSRImageUrl(activity.image_url)}
                    alt={activity.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-8 h-8 opacity-20" />
                  </div>
                )}
              </div>

              {/* DETAILS */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-md text-[10px] uppercase tracking-wider font-semibold border",
                      categoryColors[activity.category as CSRCategory],
                    )}
                  >
                    {activity.category}
                  </Badge>
                  {activity.featured && (
                    <Badge variant="outline" className="rounded-md border-gold text-gold">
                      Featured
                    </Badge>
                  )}
                  {!activity.is_published && (
                    <Badge
                      variant="outline"
                      className="rounded-md border-muted text-muted-foreground"
                    >
                      Draft
                    </Badge>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-foreground truncate">{activity.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {activity.short_description}
                </p>

                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground/70">
                  <span>{activity.year}</span>
                  {activity.location && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span>{activity.location}</span>
                    </>
                  )}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex sm:flex-col gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openForm(activity)}
                  className="flex-1 sm:flex-none border-border hover:border-gold/50 hover:text-gold"
                >
                  <Edit2 className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingId(activity.id)}
                  className="flex-1 sm:flex-none border-border hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FORM DIALOG */}
      <Dialog open={showForm} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingActivity ? "Edit Activity" : "Add Activity"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Cover Image *</Label>
              <div className="flex gap-4">
                <div className="relative w-48 aspect-video rounded-xl border border-border overflow-hidden bg-muted flex items-center justify-center shrink-0">
                  {form.image_url ? (
                    <>
                      <img
                        src={resolveCSRImageUrl(form.image_url)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleImageRemove}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                  )}
                </div>

                <div className="flex-1">
                  <Label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-border rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                      {uploadingImage ? (
                        <Loader2 className="w-6 h-6 animate-spin mb-2" />
                      ) : (
                        <Upload className="w-6 h-6 mb-2" />
                      )}
                      <p className="text-sm font-medium">Click to upload image</p>
                      <p className="text-xs mt-1">PNG, JPG, WEBP (Max 2MB)</p>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </Label>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. ₹1 Crore Donation to Anna Canteens"
                />
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as CSRCategory })}
                >
                  {Object.keys(categoryColors).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Year *</Label>
                <Input
                  type="number"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  placeholder="e.g. 2024"
                />
              </div>

              <div className="space-y-2">
                <Label>Date String (Optional)</Label>
                <Input
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  placeholder="e.g. August 2024"
                />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Andhra Pradesh"
                />
              </div>

              <div className="space-y-2">
                <Label>Impact</Label>
                <Input
                  value={form.impact}
                  onChange={(e) => setForm({ ...form, impact: e.target.value })}
                  placeholder="e.g. ₹1 Crore Contribution"
                />
              </div>

              <div className="space-y-2">
                <Label>Beneficiaries</Label>
                <Input
                  value={form.beneficiaries}
                  onChange={(e) => setForm({ ...form, beneficiaries: e.target.value })}
                  placeholder="e.g. People & Families in Need"
                />
              </div>

              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Short Description *</Label>
              <Textarea
                value={form.short_description}
                onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                placeholder="A brief summary for the card..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Full Description *</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detailed description..."
                rows={4}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-6 p-4 border border-border rounded-xl bg-secondary/20">
              <div className="flex items-center justify-between flex-1">
                <div className="space-y-0.5">
                  <Label>Featured Activity</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Display prominently on the CSR page
                  </p>
                </div>
                <Switch
                  checked={form.featured}
                  onCheckedChange={(c) => setForm({ ...form, featured: c })}
                />
              </div>

              <div className="flex items-center justify-between flex-1">
                <div className="space-y-0.5">
                  <Label>Published</Label>
                  <p className="text-[11px] text-muted-foreground">Visible on the public website</p>
                </div>
                <Switch
                  checked={form.is_published}
                  onCheckedChange={(c) => setForm({ ...form, is_published: c })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={closeForm}>
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate(form)}
              disabled={saveMutation.isPending || !form.title || !form.image_url}
              className="bg-gold hover:bg-gold/90 text-obsidian"
            >
              {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Activity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this activity? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

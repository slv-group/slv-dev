import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { projects as staticProjects } from "@/data/projects";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  Building2,
  X,
  Upload,
  ExternalLink,
  FileDown,
  GripVertical,
  MapPin,
  ListChecks,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/admin/projects")({
  component: ProjectsManagement,
});

type Project = Tables<"projects">;
type ProjectStatus = "Ongoing" | "Completed" | "Upcoming";

const statusColors: Record<ProjectStatus, string> = {
  Ongoing: "bg-sky-500/15 text-sky-600 border-sky-500/20",
  Completed: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
  Upcoming: "bg-amber-500/15 text-amber-600 border-amber-500/20",
};

// ── Helpers for JSONB sub-structures ──
type SpecItem = { label: string; value: string };
type NearbyItem = { label: string; distance: string };
type FloorPlanItem = { type: string; sqft: string; image: string };

type ProjectFormData = {
  _editingId: string | null; // non-null when editing — prevents edit-creates-new bug
  name: string;
  slug: string;
  tagline: string;
  description: string;
  status: ProjectStatus;
  category: string;
  city: string;
  location: string;
  bedrooms: string;
  price_from: string;
  sqft_from: string;
  sqft_to: string;
  area_unit: string;
  launch_date: string;
  rera_number: string;
  cover_image: string;
  brochure_url: string;
  map_embed: string;
  amenities: string[];
  gallery: string[];
  specifications: SpecItem[];
  nearby: NearbyItem[];
  floor_plans: FloorPlanItem[];
  is_featured: boolean;
  is_published: boolean;
  sort_order: string;
};

const defaultForm: ProjectFormData = {
  _editingId: null,
  name: "",
  slug: "",
  tagline: "",
  description: "",
  status: "Ongoing",
  category: "",
  city: "",
  location: "",
  bedrooms: "",
  price_from: "",
  sqft_from: "",
  sqft_to: "",
  area_unit: "sqft",
  launch_date: "",
  rera_number: "",
  cover_image: "",
  brochure_url: "",
  map_embed: "",
  amenities: [],
  gallery: [],
  specifications: [],
  nearby: [],
  floor_plans: [],
  is_featured: false,
  is_published: true,
  sort_order: "0",
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ── CSV Export helper ──
function exportProjectsCSV(projects: Project[]) {
  const headers = [
    "Name",
    "Slug",
    "Status",
    "Category",
    "City",
    "Location",
    "Bedrooms",
    "Price From",
    "Sqft From",
    "Sqft To",
    "Area Unit",
    "Launch Date",
    "RERA",
    "Amenities",
    "Published",
    "Featured",
    "Created",
  ];
  const rows = projects.map((p) => [
    p.name,
    p.slug,
    p.status,
    p.category ?? "",
    p.city ?? "",
    p.location ?? "",
    p.bedrooms ?? "",
    p.price_from?.toString() ?? "",
    p.sqft_from?.toString() ?? "",
    (p as Record<string, unknown>).sqft_to?.toString() ?? "",
    ((p as any).area_unit || (Array.isArray(p.specifications) ? (p.specifications as any[]).find((s) => s?.label === "__area_unit" || s?.label === "Area Unit")?.value : "") || (p.category === "Plots" ? "sq yd" : "sqft")),
    (p as Record<string, unknown>).launch_date?.toString() ?? "",
    p.rera_number ?? "",
    Array.isArray(p.amenities) ? (p.amenities as string[]).join("; ") : "",
    p.is_published ? "Yes" : "No",
    p.is_featured ? "Yes" : "No",
    new Date(p.created_at).toLocaleDateString(),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `slv-projects-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Upload helper ──
async function uploadToStorage(bucket: string, folder: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

function ProjectsManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectFormData>(defaultForm);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingBrochure, setUploadingBrochure] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingFloorPlan, setUploadingFloorPlan] = useState<number | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // ── New amenity / spec / nearby input states ──
  const [newAmenity, setNewAmenity] = useState("");
  const [newSpec, setNewSpec] = useState<SpecItem>({ label: "", value: "" });
  const [newNearby, setNewNearby] = useState<NearbyItem>({ label: "", distance: "" });

  // Fetch projects
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Project[];
    },
  });

  // ── Build payload from form ──
  const buildPayload = (data: ProjectFormData) => ({
    name: data.name,
    slug: data.slug || generateSlug(data.name),
    tagline: data.tagline || null,
    description: data.description || null,
    status: data.status,
    category: data.category || null,
    city: data.city || null,
    location: data.location || null,
    bedrooms: data.bedrooms || null,
    price_from: data.price_from ? Number(data.price_from.toString().replace(/,/g, "")) : null,
    sqft_from: data.sqft_from ? Number(data.sqft_from.toString().replace(/,/g, "")) : null,
    sqft_to: data.sqft_to ? Number(data.sqft_to.toString().replace(/,/g, "")) : null,
    launch_date: data.launch_date || null,
    rera_number: data.rera_number || null,
    cover_image: data.cover_image || null,
    brochure_url: data.brochure_url || null,
    map_embed: data.map_embed || null,
    amenities: data.amenities,
    gallery: data.gallery,
    specifications: [
      ...(data.specifications || []).filter((s) => !s.label.startsWith("__") && s.label !== "Area Unit"),
      { label: "__area_unit", value: data.area_unit || "sqft" },
    ],
    nearby: data.nearby,
    floor_plans: data.floor_plans.map((fp) => ({
      type: fp.type,
      sqft: fp.sqft ? Number(fp.sqft.toString().replace(/,/g, "")) : 0,
      image: fp.image,
    })),
    is_featured: data.is_featured,
    is_published: data.is_published,
    sort_order: Number(data.sort_order) || 0,
  });

  const handleSeedStaticProjects = async () => {
    setIsSeeding(true);
    toast.loading("Migrating projects & images to Supabase... this may take a minute.");

    try {
      let successCount = 0;
      for (const p of staticProjects) {
        // Upload cover image
        let cover_url = p.image || null;
        if (cover_url && cover_url.startsWith("/")) {
          try {
            const res = await fetch(cover_url);
            const blob = await res.blob();
            const file = new File([blob], `cover-${p.slug}.jpg`, { type: blob.type });
            cover_url = await uploadToStorage("project-media", "covers", file);
          } catch (e) {
            console.error("Failed to upload cover for", p.name, e);
          }
        }

        // Upload gallery images
        const gallery_urls = [];
        if (p.gallery && p.gallery.length > 0) {
          for (let i = 0; i < p.gallery.length; i++) {
            let gUrl = p.gallery[i];
            if (gUrl && gUrl.startsWith("/")) {
              try {
                const res = await fetch(gUrl);
                const blob = await res.blob();
                const file = new File([blob], `gallery-${p.slug}-${i}.jpg`, { type: blob.type });
                gUrl = await uploadToStorage("project-media", "gallery", file);
              } catch (e) {
                console.error("Failed to upload gallery image for", p.name, e);
              }
            }
            gallery_urls.push(gUrl);
          }
        }

        // Upload brochure
        let brochureUrl = p.brochureUrl || null;
        if (brochureUrl && brochureUrl.startsWith("/")) {
          try {
            const res = await fetch(brochureUrl);
            const blob = await res.blob();
            const file = new File([blob], `brochure-${p.slug}.pdf`, { type: blob.type });
            brochureUrl = await uploadToStorage("brochures", "brochures", file);
          } catch (e) {
            console.error("Failed to upload brochure for", p.name, e);
          }
        }

        // Upload floor plans
        const floorPlans = [];
        if (p.floorPlans && p.floorPlans.length > 0) {
          for (let i = 0; i < p.floorPlans.length; i++) {
            const fp = { ...p.floorPlans[i] };
            if (fp.image && fp.image.startsWith("/")) {
              try {
                const res = await fetch(fp.image);
                const blob = await res.blob();
                const file = new File([blob], `floorplan-${p.slug}-${i}.jpg`, { type: blob.type });
                fp.image = await uploadToStorage("project-media", "gallery", file);
              } catch (e) {
                console.error("Failed to upload floor plan for", p.name, e);
              }
            }
            floorPlans.push(fp);
          }
        }

        const payload = {
          slug: p.slug,
          name: p.name,
          tagline: p.tagline || null,
          category: p.category,
          status: p.status,
          location: p.location || null,
          city: p.city || null,
          price_from: p.priceFrom || null,
          bedrooms: p.bedrooms || null,
          sqft_from: p.sqftFrom || null,
          sqft_to: p.sqftTo || null,
          launch_date: p.launchDate || null,
          cover_image: cover_url,
          gallery: gallery_urls,
          description: p.description || null,
          amenities: p.amenities || [],
          specifications: p.specifications || [],
          nearby: p.proximity || [],
          floor_plans: floorPlans,
          brochure_url: brochureUrl,
          is_published: true,
          sort_order: parseInt(p.id) || 0,
        };

        const { error } = await supabase.from("projects").upsert(payload, { onConflict: "slug" });
        if (!error) successCount++;
      }
      toast.dismiss();
      toast.success(
        `Successfully migrated ${successCount} projects and uploaded all their images!`,
      );
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
    } catch (err: any) {
      toast.dismiss();
      toast.error("Failed to migrate: " + err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  // Safe project persistence helper that supports area_unit column and gracefully handles schema cache
  const saveProjectToSupabase = async (payload: Record<string, any>, areaUnit: string, id?: string) => {
    const fullPayload = { ...payload, area_unit: areaUnit || "sqft" };
    let res = id
      ? await supabase.from("projects").update(fullPayload as any).eq("id", id)
      : await supabase.from("projects").insert(fullPayload as any);

    // If area_unit column does not exist in schema cache yet (PGRST204), fallback to payload without it.
    // The unit is safely preserved in specifications as __area_unit regardless!
    if (res.error && res.error.code === "PGRST204") {
      res = id
        ? await supabase.from("projects").update(payload as any).eq("id", id)
        : await supabase.from("projects").insert(payload as any);
    }
    if (res.error) throw res.error;
  };

  // Create project
  const createMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      await saveProjectToSupabase(buildPayload(data), data.area_unit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      toast.success("Project created successfully");
      closeForm();
    },
    onError: (err: any) => {
      console.error("Create Project Error:", err);
      toast.error(`Create failed: ${err.message || "Unknown error"}`);
    },
  });

  // Update project
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProjectFormData }) => {
      const payload = buildPayload(data);
      console.log("Updating project payload:", payload);
      await saveProjectToSupabase(payload, data.area_unit, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      toast.success("Project updated successfully");
      closeForm();
    },
    onError: (err: any) => {
      console.error("Update Project Error:", err);
      toast.error(`Update failed: ${err.message || "Unknown error"}`);
    },
  });

  // Delete project
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      toast.success("Project deleted");
      setDeletingId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Quick toggle (publish / feature)
  const toggleMutation = useMutation({
    mutationFn: async ({
      id,
      field,
      value,
    }: {
      id: string;
      field: "is_published" | "is_featured";
      value: boolean;
    }) => {
      const payload = field === "is_published" ? { is_published: value } : { is_featured: value };
      const { error } = await supabase.from("projects").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-projects"] }),
    onError: (err: Error) => toast.error(err.message),
  });

  // ── Upload handlers ──
  const handleCoverUpload = async (file: File) => {
    if (!file) return;
    setUploadingCover(true);
    try {
      const url = await uploadToStorage("project-media", "covers", file);
      setForm((f) => ({ ...f, cover_image: url }));
      toast.success("Cover image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleBrochureUpload = async (file: File) => {
    if (!file) return;
    setUploadingBrochure(true);
    try {
      const url = await uploadToStorage("brochures", "brochures", file);
      setForm((f) => ({ ...f, brochure_url: url }));
      toast.success("Brochure uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingBrochure(false);
    }
  };

  const handleGalleryUpload = async (files: FileList) => {
    setUploadingGallery(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadToStorage("project-media", "gallery", file);
        urls.push(url);
      }
      setForm((f) => ({ ...f, gallery: [...f.gallery, ...urls] }));
      toast.success(`${urls.length} image(s) uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleFloorPlanImageUpload = async (file: File, index: number) => {
    setUploadingFloorPlan(index);
    try {
      const url = await uploadToStorage("project-media", "floor-plans", file);
      setForm((f) => {
        const plans = [...f.floor_plans];
        plans[index] = { ...plans[index], image: url };
        return { ...f, floor_plans: plans };
      });
      toast.success("Floor plan image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingFloorPlan(null);
    }
  };

  // ── Form open/close ──
  const openCreate = () => {
    setEditingProject(null);
    setForm(defaultForm);
    setNewAmenity("");
    setNewSpec({ label: "", value: "" });
    setNewNearby({ label: "", distance: "" });
    setShowForm(true);
  };

  const openEdit = (p: Project) => {
    setEditingProject(p);
    const raw = p as Record<string, unknown>;
    const rawSpecs = Array.isArray(p.specifications) ? (p.specifications as SpecItem[]) : [];
    const unitFromSpecs = rawSpecs.find((s) => s.label === "__area_unit" || s.label === "Area Unit")?.value;
    const areaUnit = (raw.area_unit as string) ?? unitFromSpecs ?? (p.category === "Plots" ? "sq yd" : "sqft");

    setForm({
      _editingId: p.id, // ← embed the ID so we never lose track during edits
      name: p.name,
      slug: p.slug,
      tagline: p.tagline ?? "",
      description: p.description ?? "",
      status: p.status as ProjectStatus,
      category: p.category ?? "",
      city: p.city ?? "",
      location: p.location ?? "",
      bedrooms: p.bedrooms ?? "",
      price_from: p.price_from?.toString() ?? "",
      sqft_from: p.sqft_from?.toString() ?? "",
      sqft_to: (raw.sqft_to as number)?.toString() ?? "",
      area_unit: areaUnit,
      launch_date: (raw.launch_date as string) ?? "",
      rera_number: p.rera_number ?? "",
      cover_image: p.cover_image ?? "",
      brochure_url: p.brochure_url ?? "",
      map_embed: p.map_embed ?? "",
      amenities: Array.isArray(p.amenities) ? (p.amenities as string[]) : [],
      gallery: Array.isArray(p.gallery) ? (p.gallery as string[]) : [],
      specifications: rawSpecs.filter((s) => !s.label.startsWith("__")),
      nearby: Array.isArray(p.nearby) ? (p.nearby as NearbyItem[]) : [],
      floor_plans: Array.isArray(p.floor_plans)
        ? (p.floor_plans as { type: string; sqft: number; image: string }[]).map((fp) => ({
            type: fp.type ?? "",
            sqft: fp.sqft?.toString() ?? "",
            image: fp.image ?? "",
          }))
        : [],
      is_featured: p.is_featured,
      is_published: p.is_published,
      sort_order: p.sort_order.toString(),
    });
    setNewAmenity("");
    setNewSpec({ label: "", value: "" });
    setNewNearby({ label: "", distance: "" });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    // Use _editingId from the form itself as primary signal (cannot desync)
    const editId = form._editingId || editingProject?.id;

    console.log("🛠️ Submitting project form", {
      editId,
      editingProject: editingProject?.id,
      formEditingId: form._editingId,
    });

    if (editId) {
      // Update existing project
      updateMutation.mutate({ id: editId, data: form });
    } else {
      // Create new project
      createMutation.mutate(form);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Filter
  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.city ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Ongoing">Ongoing</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Upcoming">Upcoming</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="gap-2 h-9"
          onClick={() => exportProjectsCSV(projects)}
          disabled={projects.length === 0}
        >
          <FileDown className="w-4 h-4" />
          Export Excel
        </Button>
        <Button
          onClick={openCreate}
          className="bg-gradient-gold text-obsidian font-semibold hover:opacity-90 gap-2 h-9"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </Button>
        <Button
          variant="outline"
          className="gap-2 bg-muted/30"
          onClick={handleSeedStaticProjects}
          disabled={isSeeding}
        >
          {isSeeding ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {isSeeding ? "Migrating..." : "Migrate Static Projects"}
        </Button>
      </div>

      {/* Table */}
      <div className="royal-card rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground font-medium">
              {search || statusFilter !== "all" ? "No matching projects" : "No projects yet"}
            </p>
            {!search && statusFilter === "all" && (
              <Button onClick={openCreate} variant="outline" className="mt-4 gap-2">
                <Plus className="w-4 h-4" />
                Create your first project
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  {["Project", "City", "Status", "Price", "Published", "Featured", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((project, i) => (
                  <tr
                    key={project.id}
                    className={cn(
                      "border-b border-border/40 hover:bg-muted/20 transition-colors",
                      i === filtered.length - 1 && "border-0",
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {project.cover_image ? (
                          <img
                            src={project.cover_image}
                            alt={project.name}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate max-w-[180px]">
                            {project.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            /{project.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {project.city ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={cn(
                          "text-xs border",
                          statusColors[project.status as ProjectStatus] ??
                            "bg-muted text-muted-foreground",
                        )}
                      >
                        {project.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {project.price_from ? `₹${(project.price_from / 100000).toFixed(0)}L` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Switch
                        checked={project.is_published}
                        onCheckedChange={(v) =>
                          toggleMutation.mutate({
                            id: project.id,
                            field: "is_published",
                            value: v,
                          })
                        }
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Switch
                        checked={project.is_featured}
                        onCheckedChange={(v) =>
                          toggleMutation.mutate({
                            id: project.id,
                            field: "is_featured",
                            value: v,
                          })
                        }
                        className="data-[state=checked]:bg-gold"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openEdit(project)}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        {project.slug && (
                          <a
                            href={`/projects/${project.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-sky-500"
                              title="View live"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeletingId(project.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Summary */}
      {!isLoading && (
        <p className="text-xs text-muted-foreground text-right">
          Showing {filtered.length} of {projects.length} projects
        </p>
      )}

      {/* ═══════════════════════════════════════════════════════════
          CREATE / EDIT DIALOG — 5 Tabs
      ═══════════════════════════════════════════════════════════ */}
      <Dialog open={showForm} onOpenChange={(o) => !o && closeForm()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {form._editingId ? "Edit Project" : "New Project"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-0">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="basic" className="text-xs sm:text-sm">
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="details" className="text-xs sm:text-sm">
                  Details
                </TabsTrigger>
                <TabsTrigger value="media" className="text-xs sm:text-sm">
                  Media
                </TabsTrigger>
                <TabsTrigger value="amenities" className="text-xs sm:text-sm">
                  Amenities & Specs
                </TabsTrigger>
                <TabsTrigger value="location" className="text-xs sm:text-sm">
                  Location & Plans
                </TabsTrigger>
              </TabsList>

              {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  TAB 1: Basic Info
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          name: e.target.value,
                          slug: f.slug || generateSlug(e.target.value),
                        }))
                      }
                      placeholder="e.g. SLV Grandeur"
                      required
                    />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={form.slug}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, slug: generateSlug(e.target.value) }))
                      }
                      placeholder="slv-grandeur"
                      required
                    />
                    <p className="text-xs text-muted-foreground">/projects/{form.slug || "…"}</p>
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={form.tagline}
                      onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                      placeholder="Where luxury meets serenity"
                    />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="description">Overview / Project Vision</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Describe the project vision, community, and key highlights…"
                      rows={5}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(v) => setForm((f) => ({ ...f, status: v as ProjectStatus }))}
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ongoing">Ongoing</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Upcoming">Upcoming</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={form.category || "__none"}
                      onValueChange={(v) => {
                        const nextCat = v === "__none" ? "" : v;
                        setForm((f) => ({
                          ...f,
                          category: nextCat,
                          area_unit:
                            nextCat === "Plots" && (f.area_unit === "sqft" || !f.area_unit)
                              ? "sq yd"
                              : f.area_unit,
                        }));
                      }}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">Select…</SelectItem>
                        <SelectItem value="Apartment">Apartment</SelectItem>
                        <SelectItem value="Villa">Villa</SelectItem>
                        <SelectItem value="Plots">Plots</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                        <SelectItem value="Educational">Educational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      placeholder="Vijayawada"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="location">Location / Area</Label>
                    <Input
                      id="location"
                      value={form.location}
                      onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                      placeholder="Mangalagiri"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="launch_date">Launch / Delivery Date</Label>
                    <Input
                      id="launch_date"
                      value={form.launch_date}
                      onChange={(e) => setForm((f) => ({ ...f, launch_date: e.target.value }))}
                      placeholder="Ongoing — Dec 2025"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="sort_order">Sort Order</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={form.sort_order}
                      onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                      placeholder="0"
                    />
                  </div>

                  <div className="flex items-center gap-3 col-span-2 p-3 rounded-lg border border-border/60 bg-muted/20">
                    <div className="flex items-center gap-2 flex-1">
                      <Switch
                        id="is_published"
                        checked={form.is_published}
                        onCheckedChange={(v) => setForm((f) => ({ ...f, is_published: v }))}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                      <Label htmlFor="is_published" className="cursor-pointer">
                        Published (visible on website)
                      </Label>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <Switch
                        id="is_featured"
                        checked={form.is_featured}
                        onCheckedChange={(v) => setForm((f) => ({ ...f, is_featured: v }))}
                        className="data-[state=checked]:bg-gold"
                      />
                      <Label htmlFor="is_featured" className="cursor-pointer">
                        Featured (homepage highlight)
                      </Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  TAB 2: Details
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="bedrooms">Configurations</Label>
                    <Input
                      id="bedrooms"
                      value={form.bedrooms}
                      onChange={(e) => setForm((f) => ({ ...f, bedrooms: e.target.value }))}
                      placeholder="2 & 3 BHK"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="price_from">Price From (₹)</Label>
                    <Input
                      id="price_from"
                      type="number"
                      value={form.price_from}
                      onChange={(e) => setForm((f) => ({ ...f, price_from: e.target.value }))}
                      placeholder="5000000"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sqft_from">Area From</Label>
                      {/* Measurement unit dropdown beside sqft */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium text-muted-foreground">Unit:</span>
                        <select
                          id="area_unit"
                          value={form.area_unit}
                          onChange={(e) => setForm((f) => ({ ...f, area_unit: e.target.value }))}
                          aria-label="Measurement unit"
                          className="h-6 text-xs rounded border border-border bg-background px-2 py-0 font-semibold text-foreground focus:ring-1 focus:ring-primary shadow-xs cursor-pointer hover:border-gold/60 transition-colors"
                        >
                          <option value="sqft">sqft (Sq. Ft)</option>
                          <option value="sq yd">sq yd (Sq. Yards)</option>
                          <option value="acres">acres</option>
                        </select>
                      </div>
                    </div>
                    <div className="relative">
                      <Input
                        id="sqft_from"
                        type="number"
                        value={form.sqft_from}
                        onChange={(e) => setForm((f) => ({ ...f, sqft_from: e.target.value }))}
                        placeholder={form.area_unit === "sq yd" ? "150" : "1180"}
                        className="pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground pointer-events-none uppercase">
                        {form.area_unit || "sqft"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sqft_to">Area To</Label>
                      <span className="text-xs font-medium text-muted-foreground">
                        ({form.area_unit || "sqft"})
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        id="sqft_to"
                        type="number"
                        value={form.sqft_to}
                        onChange={(e) => setForm((f) => ({ ...f, sqft_to: e.target.value }))}
                        placeholder={form.area_unit === "sq yd" ? "400" : "1860"}
                        className="pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground pointer-events-none uppercase">
                        {form.area_unit || "sqft"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="rera_number">RERA Number</Label>
                    <Input
                      id="rera_number"
                      value={form.rera_number}
                      onChange={(e) => setForm((f) => ({ ...f, rera_number: e.target.value }))}
                      placeholder="RERA-12345"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  TAB 3: Media (Cover, Gallery, Brochure)
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
              <TabsContent value="media" className="space-y-6">
                {/* Cover Image */}
                <div className="space-y-3">
                  <Label>Cover Image</Label>
                  {form.cover_image && (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border border-border">
                      <img
                        src={form.cover_image}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, cover_image: "" }))}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Input
                      value={form.cover_image}
                      onChange={(e) => setForm((f) => ({ ...f, cover_image: e.target.value }))}
                      placeholder="Paste image URL or upload below"
                      className="flex-1"
                    />
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCoverUpload(file);
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingCover}
                        className="gap-2 whitespace-nowrap"
                        asChild
                      >
                        <span>
                          {uploadingCover ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          Upload
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>

                {/* Gallery Images */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Gallery Images ({form.gallery.length})</Label>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.length) handleGalleryUpload(e.target.files);
                          e.target.value = "";
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingGallery}
                        className="gap-2"
                        asChild
                      >
                        <span>
                          {uploadingGallery ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
                          Add Images
                        </span>
                      </Button>
                    </label>
                  </div>
                  {form.gallery.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {form.gallery.map((url, i) => (
                        <div
                          key={i}
                          className="relative group aspect-square rounded-lg overflow-hidden border border-border"
                        >
                          <img
                            src={url}
                            alt={`Gallery ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {i > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setForm((f) => {
                                      const g = [...f.gallery];
                                      [g[i - 1], g[i]] = [g[i], g[i - 1]];
                                      return { ...f, gallery: g };
                                    });
                                  }}
                                  className="w-6 h-6 rounded bg-white/90 flex items-center justify-center text-xs font-bold text-gray-700"
                                  title="Move left"
                                >
                                  ←
                                </button>
                              )}
                              {i < form.gallery.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setForm((f) => {
                                      const g = [...f.gallery];
                                      [g[i], g[i + 1]] = [g[i + 1], g[i]];
                                      return { ...f, gallery: g };
                                    });
                                  }}
                                  className="w-6 h-6 rounded bg-white/90 flex items-center justify-center text-xs font-bold text-gray-700"
                                  title="Move right"
                                >
                                  →
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  setForm((f) => ({
                                    ...f,
                                    gallery: f.gallery.filter((_, idx) => idx !== i),
                                  }))
                                }
                                className="w-6 h-6 rounded bg-red-500 flex items-center justify-center text-white"
                                title="Remove"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white">
                            {i + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-xl py-8 text-center text-sm text-muted-foreground">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No gallery images yet. Click "Add Images" to upload.
                    </div>
                  )}
                </div>

                {/* Brochure */}
                <div className="space-y-3">
                  <Label>Brochure (PDF)</Label>
                  {form.brochure_url && (
                    <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/20">
                      <span className="text-sm text-muted-foreground flex-1 truncate">
                        {form.brochure_url}
                      </span>
                      <a href={form.brochure_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, brochure_url: "" }))}
                      >
                        <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Input
                      value={form.brochure_url}
                      onChange={(e) => setForm((f) => ({ ...f, brochure_url: e.target.value }))}
                      placeholder="Paste PDF URL or upload below"
                      className="flex-1"
                    />
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleBrochureUpload(file);
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingBrochure}
                        className="gap-2 whitespace-nowrap"
                        asChild
                      >
                        <span>
                          {uploadingBrochure ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          Upload
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              </TabsContent>

              {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  TAB 4: Amenities & Specifications
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
              <TabsContent value="amenities" className="space-y-6">
                {/* Amenities */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-gold" />
                    <Label className="text-base font-semibold">
                      Amenities ({form.amenities.length})
                    </Label>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      placeholder="e.g. Swimming Pool"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (newAmenity.trim()) {
                            setForm((f) => ({
                              ...f,
                              amenities: [...f.amenities, newAmenity.trim()],
                            }));
                            setNewAmenity("");
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (newAmenity.trim()) {
                          setForm((f) => ({
                            ...f,
                            amenities: [...f.amenities, newAmenity.trim()],
                          }));
                          setNewAmenity("");
                        }
                      }}
                      className="gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </Button>
                  </div>
                  {form.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.amenities.map((a, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="gap-1.5 pl-3 pr-1.5 py-1.5 text-sm"
                        >
                          {a}
                          <button
                            type="button"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                amenities: f.amenities.filter((_, idx) => idx !== i),
                              }))
                            }
                            className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <hr className="border-border/50" />

                {/* Specifications */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gold" />
                    <Label className="text-base font-semibold">
                      Specifications ({form.specifications.length})
                    </Label>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newSpec.label}
                      onChange={(e) => setNewSpec((s) => ({ ...s, label: e.target.value }))}
                      placeholder="Label (e.g. Structure)"
                      className="flex-1"
                    />
                    <Input
                      value={newSpec.value}
                      onChange={(e) => setNewSpec((s) => ({ ...s, value: e.target.value }))}
                      placeholder="Value (e.g. RCC framed…)"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (newSpec.label.trim() && newSpec.value.trim()) {
                            setForm((f) => ({
                              ...f,
                              specifications: [
                                ...f.specifications,
                                { label: newSpec.label.trim(), value: newSpec.value.trim() },
                              ],
                            }));
                            setNewSpec({ label: "", value: "" });
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (newSpec.label.trim() && newSpec.value.trim()) {
                          setForm((f) => ({
                            ...f,
                            specifications: [
                              ...f.specifications,
                              { label: newSpec.label.trim(), value: newSpec.value.trim() },
                            ],
                          }));
                          setNewSpec({ label: "", value: "" });
                        }
                      }}
                      className="gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </Button>
                  </div>
                  {form.specifications.length > 0 && (
                    <div className="space-y-2">
                      {form.specifications.map((spec, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/10"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              {spec.label}
                            </p>
                            <p className="text-sm text-foreground mt-0.5">{spec.value}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                specifications: f.specifications.filter((_, idx) => idx !== i),
                              }))
                            }
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  TAB 5: Location & Floor Plans
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
              <TabsContent value="location" className="space-y-6">
                {/* Nearby / Geo-Spatial Insights */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gold" />
                    <Label className="text-base font-semibold">
                      Geo-Spatial Insights ({form.nearby.length})
                    </Label>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newNearby.label}
                      onChange={(e) => setNewNearby((n) => ({ ...n, label: e.target.value }))}
                      placeholder="Place (e.g. AIIMS Hospital)"
                      className="flex-1"
                    />
                    <Input
                      value={newNearby.distance}
                      onChange={(e) => setNewNearby((n) => ({ ...n, distance: e.target.value }))}
                      placeholder="Distance (e.g. 3 km)"
                      className="w-32"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (newNearby.label.trim() && newNearby.distance.trim()) {
                            setForm((f) => ({
                              ...f,
                              nearby: [
                                ...f.nearby,
                                {
                                  label: newNearby.label.trim(),
                                  distance: newNearby.distance.trim(),
                                },
                              ],
                            }));
                            setNewNearby({ label: "", distance: "" });
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (newNearby.label.trim() && newNearby.distance.trim()) {
                          setForm((f) => ({
                            ...f,
                            nearby: [
                              ...f.nearby,
                              {
                                label: newNearby.label.trim(),
                                distance: newNearby.distance.trim(),
                              },
                            ],
                          }));
                          setNewNearby({ label: "", distance: "" });
                        }
                      }}
                      className="gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </Button>
                  </div>
                  {form.nearby.length > 0 && (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {form.nearby.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-2 p-3 rounded-lg border border-border bg-muted/10"
                        >
                          <span className="text-sm text-foreground">{item.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gold-foreground whitespace-nowrap">
                              {item.distance}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setForm((f) => ({
                                  ...f,
                                  nearby: f.nearby.filter((_, idx) => idx !== i),
                                }))
                              }
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <hr className="border-border/50" />

                {/* Map Embed */}
                <div className="space-y-1.5">
                  <Label htmlFor="map_embed">Map Embed URL</Label>
                  <Input
                    id="map_embed"
                    value={form.map_embed}
                    onChange={(e) => setForm((f) => ({ ...f, map_embed: e.target.value }))}
                    placeholder="https://maps.google.com/maps?..."
                  />
                </div>

                <hr className="border-border/50" />

                {/* Floor Plans */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-gold" />
                      <Label className="text-base font-semibold">
                        Floor Plans ({form.floor_plans.length})
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          floor_plans: [...f.floor_plans, { type: "", sqft: "", image: "" }],
                        }))
                      }
                      className="gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Plan
                    </Button>
                  </div>

                  {form.floor_plans.length > 0 ? (
                    <div className="space-y-3">
                      {form.floor_plans.map((fp, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-border bg-muted/10 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">
                              Floor Plan #{i + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setForm((f) => ({
                                  ...f,
                                  floor_plans: f.floor_plans.filter((_, idx) => idx !== i),
                                }))
                              }
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Type</Label>
                              <Input
                                value={fp.type}
                                onChange={(e) =>
                                  setForm((f) => {
                                    const plans = [...f.floor_plans];
                                    plans[i] = { ...plans[i], type: e.target.value };
                                    return { ...f, floor_plans: plans };
                                  })
                                }
                                placeholder="e.g. 3 BHK"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Area ({form.area_unit || "sqft"})</Label>
                              <Input
                                type="number"
                                value={fp.sqft}
                                onChange={(e) =>
                                  setForm((f) => {
                                    const plans = [...f.floor_plans];
                                    plans[i] = { ...plans[i], sqft: e.target.value };
                                    return { ...f, floor_plans: plans };
                                  })
                                }
                                placeholder="1400"
                              />
                            </div>
                          </div>
                          {/* Floor plan image */}
                          {fp.image && (
                            <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                              <img
                                src={fp.image}
                                alt={`Floor plan ${fp.type}`}
                                className="w-full h-full object-contain bg-white"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setForm((f) => {
                                    const plans = [...f.floor_plans];
                                    plans[i] = { ...plans[i], image: "" };
                                    return { ...f, floor_plans: plans };
                                  })
                                }
                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Input
                              value={fp.image}
                              onChange={(e) =>
                                setForm((f) => {
                                  const plans = [...f.floor_plans];
                                  plans[i] = { ...plans[i], image: e.target.value };
                                  return { ...f, floor_plans: plans };
                                })
                              }
                              placeholder="Image URL or upload"
                              className="flex-1"
                            />
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFloorPlanImageUpload(file, i);
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={uploadingFloorPlan === i}
                                className="gap-1"
                                asChild
                              >
                                <span>
                                  {uploadingFloorPlan === i ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Upload className="w-3.5 h-3.5" />
                                  )}
                                  Upload
                                </span>
                              </Button>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-xl py-8 text-center text-sm text-muted-foreground">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No floor plans yet. Click "Add Plan" to add one.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="pt-6 mt-6 border-t border-border/60">
              <Button type="button" variant="outline" onClick={closeForm} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-gradient-gold text-obsidian font-semibold hover:opacity-90 gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {form._editingId ? "Save Changes" : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The project and all its data will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  FileText,
  Video,
  Loader2,
  Download,
  Plus,
  ExternalLink,
  FolderOpen,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/media")({
  component: MediaManagement,
});

type GalleryItem = Tables<"gallery">;

interface StorageFile {
  name: string;
  id: string | null;
  metadata?: { size?: number; mimetype?: string } | null;
  created_at?: string | null;
  publicUrl?: string;
}

function formatBytes(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// ─── Gallery Tab ──────────────────────────────────────────────────────────────
function GalleryTab() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [replacingItemId, setReplacingItemId] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [activeReplaceItem, setActiveReplaceItem] = useState<GalleryItem | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as GalleryItem[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["public-gallery-images"] });
      router.invalidate();
      toast.success("Image deleted");
      setDeletingId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleTriggerReplace = (item: GalleryItem) => {
    setActiveReplaceItem(item);
    replaceInputRef.current?.click();
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeReplaceItem) return;
    const itemToReplace = activeReplaceItem;
    setReplacingItemId(itemToReplace.id);
    try {
      const ext = file.name.split(".").pop();
      const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("project-media")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("project-media").getPublicUrl(path);
      const { error: dbError } = await supabase
        .from("gallery")
        .update({ image_url: urlData.publicUrl })
        .eq("id", itemToReplace.id);
      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["public-gallery-images"] });
      router.invalidate();
      toast.success("Gallery image replaced successfully");
    } catch (err) {
      toast.error(`Failed to replace image: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setReplacingItemId(null);
      setActiveReplaceItem(null);
      if (replaceInputRef.current) replaceInputRef.current.value = "";
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    let successCount = 0;
    for (const file of Array.from(files)) {
      try {
        const ext = file.name.split(".").pop();
        const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("project-media")
          .upload(path, file, { upsert: true });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("project-media").getPublicUrl(path);
        const { error: dbError } = await supabase.from("gallery").insert({
          image_url: data.publicUrl,
          title: titleInput || file.name.replace(/\.[^/.]+$/, ""),
          category: categoryInput || null,
          is_published: true,
        });
        if (dbError) throw dbError;
        successCount++;
      } catch (err) {
        toast.error(
          `Failed to upload ${file.name}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
    if (successCount > 0) {
      queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["public-gallery-images"] });
      router.invalidate();
      toast.success(`${successCount} image(s) uploaded`);
      setTitleInput("");
      setCategoryInput("");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div className="royal-card rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Upload className="w-4 h-4 text-gold" />
          Upload Images
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Title (optional)</Label>
            <Input
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="Image title"
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Category (optional)</Label>
            <Input
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              placeholder="e.g. Exterior, Interior"
              className="h-9"
            />
          </div>
        </div>
        <label
          className={cn(
            "flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors duration-200",
            "border-border/60 hover:border-gold/50 hover:bg-gold/5",
            uploading && "opacity-60 pointer-events-none",
          )}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
              <p className="text-sm text-muted-foreground">Uploading…</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                <Plus className="w-6 h-6 text-gold" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Click to upload images</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  JPG, PNG, WebP — up to 50 MB each (multiple files supported)
                </p>
              </div>
            </>
          )}
        </label>
      </div>

      {/* Gallery grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground">No images yet. Upload your first one above.</p>
        </div>
      ) : (
        <>
          <input
            ref={replaceInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleReplaceFile}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative royal-card rounded-xl overflow-hidden aspect-square"
              >
                <img
                  src={item.image_url}
                  alt={item.title ?? "Gallery image"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                {replacingItemId === item.id && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 z-10">
                    <Loader2 className="w-6 h-6 text-gold animate-spin" />
                    <span className="text-white text-xs font-medium">Replacing...</span>
                  </div>
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-end p-2.5 opacity-0 group-hover:opacity-100">
                  <div className="flex-1 min-w-0">
                    {item.title && (
                      <p className="text-white text-xs font-medium truncate">{item.title}</p>
                    )}
                    {item.category && (
                      <p className="text-white/60 text-[10px] truncate">{item.category}</p>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <a href={item.image_url} target="_blank" rel="noopener noreferrer">
                      <button
                        type="button"
                        className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                        title="View image"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleTriggerReplace(item)}
                      disabled={replacingItemId === item.id}
                      className="w-7 h-7 rounded-lg bg-gold/80 backdrop-blur-sm flex items-center justify-center text-black hover:bg-gold transition-colors"
                      title="Replace image"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(item.id)}
                      className="w-7 h-7 rounded-lg bg-rose-500/80 backdrop-blur-sm flex items-center justify-center text-white hover:bg-rose-500 transition-colors"
                      title="Delete image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the image from the gallery database. The file in storage will remain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Brochures Tab ────────────────────────────────────────────────────────────
function BrochuresTab() {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadFiles = async () => {
    setLoadingFiles(true);
    try {
      const { data, error } = await supabase.storage.from("brochures").list("brochures", {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (error) throw error;
      const withUrls: StorageFile[] = (data ?? []).map((f) => {
        const { data: urlData } = supabase.storage
          .from("brochures")
          .getPublicUrl(`brochures/${f.name}`);
        return { ...f, publicUrl: urlData.publicUrl };
      });
      setFiles(withUrls);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingFiles(false);
    }
  };

  useState(() => {
    loadFiles();
  });

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `brochures/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("brochures")
        .upload(path, file, { upsert: true });
      if (error) throw error;
      toast.success("Brochure uploaded");
      await loadFiles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (name: string) => {
    try {
      const { error } = await supabase.storage.from("brochures").remove([`brochures/${name}`]);
      if (error) throw error;
      toast.success("Brochure deleted");
      await loadFiles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setDeletingPath(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="royal-card rounded-xl p-5">
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
          <Upload className="w-4 h-4 text-gold" />
          Upload Brochure (PDF)
        </h3>
        <label
          className={cn(
            "flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors duration-200",
            "border-border/60 hover:border-gold/50 hover:bg-gold/5",
            uploading && "opacity-60 pointer-events-none",
          )}
        >
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
          />
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
              <p className="text-sm text-muted-foreground">Uploading PDF…</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-gold" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Click to upload PDF brochure</p>
                <p className="text-xs text-muted-foreground mt-0.5">PDF files — up to 20 MB</p>
              </div>
            </>
          )}
        </label>
      </div>

      {loadingFiles ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="py-16 text-center">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground">No brochures uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="royal-card rounded-xl p-3.5 flex items-center gap-3 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.metadata?.size)}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {file.publicUrl && (
                  <a href={file.publicUrl} target="_blank" rel="noopener noreferrer" download>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </a>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeletingPath(file.name)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deletingPath} onOpenChange={(o) => !o && setDeletingPath(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brochure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this file from storage. Project brochure links pointing
              to it will break.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingPath && handleDelete(deletingPath)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Videos Tab ───────────────────────────────────────────────────────────────
function VideosTab() {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadFiles = async () => {
    setLoadingFiles(true);
    try {
      const { data, error } = await supabase.storage.from("project-media").list("videos", {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (error && error.message !== "The resource was not found") throw error;
      const withUrls: StorageFile[] = (data ?? []).map((f) => {
        const { data: urlData } = supabase.storage
          .from("project-media")
          .getPublicUrl(`videos/${f.name}`);
        return { ...f, publicUrl: urlData.publicUrl };
      });
      setFiles(withUrls);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFiles(false);
    }
  };

  useState(() => {
    loadFiles();
  });

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `videos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("project-media")
        .upload(path, file, { upsert: true });
      if (error) throw error;
      toast.success("Video uploaded");
      await loadFiles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (name: string) => {
    try {
      const { error } = await supabase.storage.from("project-media").remove([`videos/${name}`]);
      if (error) throw error;
      toast.success("Video deleted");
      await loadFiles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setDeletingPath(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="royal-card rounded-xl p-5">
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
          <Upload className="w-4 h-4 text-gold" />
          Upload Video
        </h3>
        <label
          className={cn(
            "flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors duration-200",
            "border-border/60 hover:border-gold/50 hover:bg-gold/5",
            uploading && "opacity-60 pointer-events-none",
          )}
        >
          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/webm,video/mov"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
          />
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
              <p className="text-sm text-muted-foreground">Uploading video…</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                <Video className="w-6 h-6 text-gold" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Click to upload video</p>
                <p className="text-xs text-muted-foreground mt-0.5">MP4, WebM, MOV — up to 50 MB</p>
              </div>
            </>
          )}
        </label>
      </div>

      {loadingFiles ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="py-16 text-center">
          <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground">No videos uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="royal-card rounded-xl p-3.5 flex items-center gap-3 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                <Video className="w-5 h-5 text-violet-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.metadata?.size)}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {file.publicUrl && (
                  <a href={file.publicUrl} target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeletingPath(file.name)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deletingPath} onOpenChange={(o) => !o && setDeletingPath(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this video from storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingPath && handleDelete(deletingPath)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function MediaManagement() {
  return (
    <div className="space-y-6 animate-fade-up">
      <Tabs defaultValue="gallery" className="w-full">
        <TabsList className="grid w-full max-w-sm grid-cols-3">
          <TabsTrigger value="gallery" className="gap-2">
            <ImageIcon className="w-3.5 h-3.5" />
            Gallery
          </TabsTrigger>
          <TabsTrigger value="brochures" className="gap-2">
            <FileText className="w-3.5 h-3.5" />
            Brochures
          </TabsTrigger>
          <TabsTrigger value="videos" className="gap-2">
            <Video className="w-3.5 h-3.5" />
            Videos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="mt-6">
          <GalleryTab />
        </TabsContent>
        <TabsContent value="brochures" className="mt-6">
          <BrochuresTab />
        </TabsContent>
        <TabsContent value="videos" className="mt-6">
          <VideosTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

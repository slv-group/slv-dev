import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { X, Scale, ArrowRight } from "lucide-react";
import { useStore } from "@/store/useStore";
import { projects as staticProjects, mapSupabaseToProject, type Project } from "@/data/projects";
import { supabase } from "@/integrations/supabase/client";

export function ComparisonBar() {
  const { compare, toggleCompare, clearCompare } = useStore();
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  useEffect(() => {
    supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const dbProjects = data.map(mapSupabaseToProject);
          setAllProjects(dbProjects);
        }
      });
  }, []);

  if (compare.length === 0) return null;

  const selected = allProjects.filter((p) => compare.includes(p.id) || compare.includes(p.slug));

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-6 sm:pb-5">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 rounded-2xl glass-dark p-4 text-background sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-sm font-semibold text-gold">
            <Scale className="h-4 w-4" /> Compare ({compare.length}/3)
          </span>
          <div className="flex gap-2">
            {selected.map((p) => (
              <div
                key={p.id}
                className="group relative h-12 w-16 overflow-hidden rounded-lg border border-white/15"
              >
                <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                <button
                  onClick={() => toggleCompare(p.id)}
                  className="absolute inset-0 flex items-center justify-center bg-obsidian/60 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove"
                >
                  <X className="h-4 w-4 text-background" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearCompare}
            className="rounded-xl px-3 py-2 text-sm text-background/70 hover:text-background"
          >
            Clear
          </button>
          <Link
            to="/compare"
            className="flex items-center gap-2 rounded-xl bg-gradient-gold px-4 py-2.5 text-sm font-semibold text-gold-foreground"
          >
            Compare Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

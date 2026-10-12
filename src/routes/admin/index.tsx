import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "@/components/admin/StatsCard";
import { Building2, MessageSquare, Image, TrendingUp, ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const statusColors: Record<string, string> = {
  new: "bg-sky-500/15 text-sky-500 border-sky-500/20",
  contacted: "bg-amber-500/15 text-amber-500 border-amber-500/20",
  qualified: "bg-violet-500/15 text-violet-500 border-violet-500/20",
  won: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20",
  lost: "bg-rose-500/15 text-rose-500 border-rose-500/20",
};

function AdminDashboard() {
  const { data: projectStats, isLoading: loadingProjects } = useQuery({
    queryKey: ["admin-stats-projects"],
    queryFn: async () => {
      const { count } = await supabase.from("projects").select("*", { count: "exact", head: true });
      const { count: published } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("is_published", true);
      return { total: count ?? 0, published: published ?? 0 };
    },
  });

  const { data: leadStats, isLoading: loadingLeads } = useQuery({
    queryKey: ["admin-stats-leads"],
    queryFn: async () => {
      const { count } = await supabase.from("leads").select("*", { count: "exact", head: true });
      const { count: newCount } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("status", "new");
      return { total: count ?? 0, newCount: newCount ?? 0 };
    },
  });

  const { data: mediaStats, isLoading: loadingMedia } = useQuery({
    queryKey: ["admin-stats-media"],
    queryFn: async () => {
      const { count } = await supabase.from("gallery").select("*", { count: "exact", head: true });
      return { total: count ?? 0 };
    },
  });

  const { data: recentLeads, isLoading: loadingRecentLeads } = useQuery({
    queryKey: ["admin-recent-leads"],
    queryFn: async () => {
      const { data } = await supabase
        .from("leads")
        .select("id, name, email, phone, status, source, created_at")
        .order("created_at", { ascending: false })
        .limit(8);
      return data ?? [];
    },
  });

  const quickActions = [
    {
      to: "/admin/projects",
      label: "Add Project",
      icon: Building2,
      desc: "Create a new property listing",
      accent: "gold",
    },
    {
      to: "/admin/enquiries",
      label: "View Leads",
      icon: MessageSquare,
      desc: "Check incoming enquiries",
      accent: "blue",
    },
    {
      to: "/admin/media",
      label: "Upload Media",
      icon: Image,
      desc: "Add images and brochures",
      accent: "green",
    },
  ] as const;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Projects"
          value={projectStats?.total ?? 0}
          icon={Building2}
          accent="gold"
          loading={loadingProjects}
          trend={{ value: `${projectStats?.published ?? 0} published`, positive: true }}
        />
        <StatsCard
          label="Total Enquiries"
          value={leadStats?.total ?? 0}
          icon={MessageSquare}
          accent="blue"
          loading={loadingLeads}
          trend={{ value: `${leadStats?.newCount ?? 0} new`, positive: true }}
        />
        <StatsCard
          label="Media Items"
          value={mediaStats?.total ?? 0}
          icon={Image}
          accent="green"
          loading={loadingMedia}
        />
        <StatsCard label="Conversion Rate" value="—" icon={TrendingUp} accent="red" />
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map(({ to, label, icon: Icon, desc }) => (
            <Link
              key={to}
              to={to}
              className="group royal-card rounded-xl p-5 flex items-start gap-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/15 transition-colors">
                <Icon className="w-6 h-6 text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-gold group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5" />
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Leads */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Recent Enquiries
          </h2>
          <Link
            to="/admin/enquiries"
            className="text-xs text-gold hover:text-gold-light transition-colors flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="royal-card rounded-xl overflow-hidden">
          {loadingRecentLeads ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : recentLeads && recentLeads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                      Contact
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                      Source
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead, i) => (
                    <tr
                      key={lead.id}
                      className={cn(
                        "border-b border-border/40 hover:bg-muted/30 transition-colors",
                        i === recentLeads.length - 1 && "border-0",
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-gold flex items-center justify-center text-obsidian text-xs font-bold flex-shrink-0">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-foreground truncate max-w-[120px]">
                            {lead.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                        <div className="text-xs">
                          <p className="truncate max-w-[140px]">{lead.email ?? "—"}</p>
                          <p className="text-muted-foreground/60">{lead.phone ?? "—"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={cn(
                            "text-xs capitalize border",
                            statusColors[lead.status] ?? "bg-muted text-muted-foreground",
                          )}
                        >
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground capitalize hidden md:table-cell">
                        {lead.source.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(lead.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No enquiries yet</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

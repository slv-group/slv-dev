import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  Inbox,
  Image,
  Award as AwardIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import slvIcon from "@/assets/slv-icon.png";
import slvLogo from "@/assets/SLV_Group_Logo.png";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/projects", label: "Projects", icon: Building2 },
  { to: "/admin/awards", label: "Awards", icon: AwardIcon },
  { to: "/admin/enquiries", label: "Enquiries", icon: MessageSquare },
  { to: "/admin/messages", label: "Messages", icon: Inbox },
  { to: "/admin/media", label: "Media", icon: Image },
  { to: "/admin/csr", label: "CSR Activities", icon: HeartHandshake },
];

interface AdminSidebarProps {
  userEmail?: string | null;
  userRole?: string | null;
  onSignOut: () => void;
}

export function AdminSidebar({ userEmail, userRole, onSignOut }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["admin-unread-registration-count"],

    queryFn: async () => {
      const { count, error } = await supabase
        .from("work_registrations")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("viewed", false);

      if (error) throw error;

      return count ?? 0;
    },

    refetchInterval: 30000,
  });

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative flex flex-col h-screen bg-gradient-royal border-r border-white/10 transition-all duration-300 ease-in-out select-none",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {/* Logo / Brand */}
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-5 border-b border-white/10 overflow-hidden",
            collapsed && "justify-center px-2",
          )}
        >
          <div
            className={cn(
              "flex-shrink-0 overflow-hidden",
              collapsed ? "h-8 w-auto" : "h-12 w-auto",
            )}
          >
            <img src={collapsed ? slvIcon : slvLogo} alt="SLV" className="h-full object-contain" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <p className="text-xs font-bold tracking-widest text-gold uppercase">SLV</p>
              <p className="text-[10px] text-white/50 tracking-wider uppercase">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === to : pathname.startsWith(to) && to !== "/admin";
            const isDashboard = to === "/admin" && pathname === "/admin";
            const active = exact ? isDashboard : isActive;

            const linkEl = (
              <Link
                key={to}
                to={to}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  "text-white/60 hover:text-white hover:bg-white/8",
                  active && "text-gold bg-white/10 shadow-sm",
                  collapsed && "justify-center px-0",
                )}
              >
                {/* Icon + collapsed unread badge */}
                <div className="relative flex-shrink-0">
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-colors duration-200",
                      active ? "text-gold" : "text-white/50 group-hover:text-white",
                    )}
                  />

                  {/* When sidebar is collapsed, attach count to icon */}
                  {collapsed && to === "/admin/messages" && unreadCount > 0 && (
                    <span className="absolute -right-2.5 -top-2.5 flex min-w-4 h-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold leading-none text-obsidian shadow-sm">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>

                {!collapsed && <span className="truncate">{label}</span>}

                {/* Normal expanded-sidebar count */}
                {!collapsed && to === "/admin/messages" && unreadCount > 0 && (
                  <span className="ml-auto flex min-w-5 h-5 items-center justify-center rounded-full bg-gold px-1.5 text-[10px] font-bold text-obsidian">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
                {active && !collapsed && (to !== "/admin/messages" || unreadCount === 0) && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold animate-pulse-gold" />
                )}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={to}>
                  <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                  <TooltipContent side="right" className="bg-obsidian text-white border-white/10">
                    {label}
                  </TooltipContent>
                </Tooltip>
              );
            }
            return linkEl;
          })}
        </nav>

        {/* User info + sign out */}
        <div className={cn("p-3 border-t border-white/10 space-y-2", collapsed && "px-2")}>
          {!collapsed && (
            <div className="px-2 py-1.5 rounded-lg bg-white/5 space-y-0.5 animate-fade-in">
              <p className="text-xs text-white/40 uppercase tracking-widest">Signed in as</p>
              <p className="text-xs text-white/80 truncate font-medium">{userEmail}</p>
              <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold font-semibold uppercase tracking-wider">
                {userRole ?? "viewer"}
              </span>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSignOut}
                className={cn(
                  "w-full text-white/60 hover:text-white hover:bg-white/10 gap-2",
                  collapsed && "justify-center px-0",
                )}
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>Sign Out</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="bg-obsidian text-white border-white/10">
                Sign Out
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-obsidian border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-gold/50 transition-all duration-200 z-10 shadow-lg"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>
    </TooltipProvider>
  );
}

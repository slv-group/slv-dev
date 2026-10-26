import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useEffect } from "react";
import { Crown, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }, { title: "Admin Portal — SLV Group" }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { session, isStaff, isLoading, signOut, user, role } = useAdminAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isAuthPage = pathname === "/admin/login" || pathname === "/admin/signup";

  // Derive page title from pathname
  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    "/admin": { title: "Dashboard", subtitle: "Welcome back to SLV Admin" },
    "/admin/": { title: "Dashboard", subtitle: "Welcome back to SLV Admin" },
    "/admin/projects": { title: "Projects", subtitle: "Manage your property listings" },
    "/admin/enquiries": { title: "Enquiries", subtitle: "Track and manage leads" },
    "/admin/messages": {
      title: "Messages",
      subtitle: "Review work registration applications",
    },
    "/admin/media": { title: "Media Library", subtitle: "Images, videos & brochures" },
  };
  const pageInfo = pageTitles[pathname] ?? { title: "Admin", subtitle: "" };

  // Redirect to login if not authenticated (only for non-auth pages)
  useEffect(() => {
    if (!isAuthPage && !isLoading && !session) {
      navigate({ to: "/admin/login" });
    }
  }, [isAuthPage, isLoading, session, navigate]);

  // If this is a login/signup route, render it directly without admin sidebar/header
  if (isAuthPage) {
    return <Outlet />;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-royal flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center mx-auto animate-pulse-gold">
            <Crown className="w-8 h-8 text-obsidian" />
          </div>
          <div className="space-y-2">
            <div className="h-2 w-32 bg-white/20 rounded-full mx-auto animate-pulse" />
            <div className="h-2 w-24 bg-white/10 rounded-full mx-auto animate-pulse" />
          </div>
          <p className="text-white/50 text-sm">Loading Admin Panel…</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session) return null;

  // Authenticated but no staff role
  if (!isStaff) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto">
            <ShieldOff className="w-10 h-10 text-destructive" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
            <p className="mt-2 text-muted-foreground">
              Your account ({user?.email}) does not have admin or editor privileges. Contact a
              system administrator to be granted access.
            </p>
          </div>
          <Button
            onClick={signOut}
            variant="outline"
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar
        userEmail={user?.email}
        userRole={role}
        onSignOut={async () => {
          await signOut();
          navigate({ to: "/admin/login" });
        }}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader title={pageInfo.title} subtitle={pageInfo.subtitle} userEmail={user?.email} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

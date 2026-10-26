import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/SLV_Group_Logo.png";

export const Route = createFileRoute("/admin/signup")({
  component: AdminSignupDisabled,
});

function AdminSignupDisabled() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-royal px-4 py-6 sm:py-10 md:py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="glass-dark rounded-2xl border border-white/10 p-6 shadow-2xl sm:p-8 text-center">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center">
            <img
              src={logo}
              alt="SLV Group"
              className="mb-3 h-auto w-[120px] object-contain sm:w-[145px] md:w-[160px]"
            />
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h1 className="font-display text-xl font-bold text-white sm:text-2xl">
              Registration Restricted
            </h1>
            <p className="mt-2 text-xs text-white/70 sm:text-sm leading-relaxed">
              Self-service administrator registration is disabled. Administrator and editor accounts
              are provisioned exclusively through authorized organizational invitation by a system
              administrator.
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-left">
            <p className="text-xs text-white/50 leading-relaxed">
              If you require access to the SLV Group admin dashboard, please contact your department
              supervisor or the primary system administrator at{" "}
              <a href="mailto:info@slvgroup.co.in" className="text-gold underline">
                info@slvgroup.co.in
              </a>
              .
            </p>
          </div>

          <div className="mt-6">
            <Button
              asChild
              className="w-full h-11 bg-gradient-gold text-obsidian font-semibold hover:opacity-90 transition-opacity shadow-lg"
            >
              <Link to="/admin/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Login
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

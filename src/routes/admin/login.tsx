import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/SLV_Group_Logo.png";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // If already logged in, redirect to admin
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate({ to: "/admin" });
      else setCheckingSession(false);
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setIsLoading(false);
        if (error.message.toLowerCase().includes("email not confirmed")) {
          toast.error(
            "Email confirmation required. Please check your inbox for the confirmation email, or confirm the user in Supabase Dashboard under Authentication -> Users.",
            { duration: 9000 },
          );
        } else if (error.message.toLowerCase().includes("invalid login credentials")) {
          toast.error(
            "Invalid email or password. Note: If you signed up recently, ensure you confirmed your email via the inbox link or via Supabase Users panel.",
            { duration: 9000 },
          );
        } else {
          toast.error(error.message);
        }
        return;
      }
      if (data.session) {
        toast.success("Signed in successfully");
        setIsLoading(false);
        navigate({ to: "/admin" });
      }
    } catch (err) {
      setIsLoading(false);
      toast.error("An unexpected error occurred");
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-royal flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-royal px-4 py-6 sm:py-10 md:py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="glass-dark rounded-2xl border border-white/10 p-5 shadow-2xl sm:p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img
              src={logo}
              alt="SLV Group"
              className="mb-3 h-auto w-[120px] object-contain sm:w-[145px] md:w-[160px]"
            />
            <h1 className="text-xl font-bold text-white font-display sm:text-2xl">SLV Admin</h1>
            <p className="text-xs text-white/50 mt-1 sm:text-sm">Sign in to your admin account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80 text-sm">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@slvbuilders.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/8 border-white/15 text-white placeholder:text-white/30 focus-visible:ring-gold/50 focus-visible:border-gold/50 h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80 text-sm">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/8 border-white/15 text-white placeholder:text-white/30 focus-visible:ring-gold/50 focus-visible:border-gold/50 h-11 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-gold text-obsidian font-semibold hover:opacity-90 transition-opacity shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/40 text-sm">
              Need an account?{" "}
              <Link
                to="/admin/signup"
                className="text-gold hover:text-gold-light transition-colors font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-white/40 text-center">
              🔒 Secure admin access. Your role must be assigned by a system administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

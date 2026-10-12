import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/slv-logo.png";

export const Route = createFileRoute("/admin/signup")({
  component: AdminSignup,
});

function AdminSignup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() },
        },
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      if (data.session) {
        toast.success("Account created successfully!");
        navigate({ to: "/admin" });
      } else {
        toast.success(
          `Account created! A confirmation email was sent to ${email.trim()}. Please check your inbox and click the confirmation link before signing in.`,
          { duration: 10000 },
        );
        navigate({ to: "/admin/login" });
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-royal px-4 py-6 sm:py-10 md:py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="glass-dark rounded-2xl border border-white/10 p-5 shadow-2xl sm:p-8">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center text-center sm:mb-8">
            <img
              src={logo}
              alt="SLV Group"
              className="mb-3 h-auto w-[120px] object-contain sm:w-[145px] md:w-[160px]"
            />
            <h1 className="font-display text-xl font-bold text-white sm:text-2xl">
              Create Account
            </h1>
            <p className="mt-1 text-xs text-white/50 sm:text-sm">Request access to SLV Admin</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white/80 text-sm">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-white/8 border-white/15 text-white placeholder:text-white/30 focus-visible:ring-gold/50 focus-visible:border-gold/50 h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80 text-sm">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@slvbuilders.com"
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
                  autoComplete="new-password"
                  placeholder="Min 6 characters"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/80 text-sm">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-white/8 border-white/15 text-white placeholder:text-white/30 focus-visible:ring-gold/50 focus-visible:border-gold/50 h-11"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-gold text-obsidian font-semibold hover:opacity-90 transition-opacity shadow-lg mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/40 text-sm">
              Already have an account?{" "}
              <Link
                to="/admin/login"
                className="text-gold hover:text-gold-light transition-colors font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-gold/10 border border-gold/20">
            <p className="text-xs text-gold/80 text-center">
              ✨ Admin access is granted automatically upon account creation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

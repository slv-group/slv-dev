import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  userEmail?: string | null;
}

function getInitials(email?: string | null): string {
  if (!email) return "A";
  return email.charAt(0).toUpperCase();
}

export function AdminHeader({ title, subtitle, userEmail }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 px-6 py-4 bg-background/90 backdrop-blur-md border-b border-border/60 shadow-sm">
      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold text-foreground truncate">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
      </div>

      {/* Notification bell */}
      <Button
        variant="ghost"
        size="icon"
        className="relative text-muted-foreground hover:text-foreground"
      >
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold animate-pulse-gold" />
      </Button>

      {/* User avatar */}
      <Avatar className="w-9 h-9 border-2 border-gold/30 ring-2 ring-background">
        <AvatarFallback className="bg-gradient-gold text-obsidian text-sm font-bold">
          {getInitials(userEmail)}
        </AvatarFallback>
      </Avatar>
    </header>
  );
}

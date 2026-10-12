import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  accent?: "gold" | "green" | "blue" | "red";
  loading?: boolean;
}

const accentMap = {
  gold: "text-gold bg-gold/10 border-gold/20",
  green: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  blue: "text-sky-500 bg-sky-500/10 border-sky-500/20",
  red: "text-rose-500 bg-rose-500/10 border-rose-500/20",
};

export function StatsCard({
  label,
  value,
  icon: Icon,
  trend,
  accent = "gold",
  loading = false,
}: StatsCardProps) {
  return (
    <div className="royal-card rounded-xl p-5 flex items-start gap-4 hover:shadow-lg transition-shadow duration-300">
      <div
        className={cn(
          "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border",
          accentMap[accent],
        )}
      >
        <Icon className="w-6 h-6" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
          {label}
        </p>
        {loading ? (
          <div className="mt-1 h-7 w-20 bg-muted animate-pulse rounded" />
        ) : (
          <p className="mt-0.5 text-2xl font-bold text-foreground tracking-tight">{value}</p>
        )}
        {trend && !loading && (
          <p
            className={cn(
              "mt-1 text-xs font-medium",
              trend.positive ? "text-emerald-500" : "text-rose-500",
            )}
          >
            {trend.positive ? "↑" : "↓"} {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}

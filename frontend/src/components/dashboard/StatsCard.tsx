import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: ReactNode;
  variant?: "default" | "primary" | "success" | "accent";
}

export const StatsCard = ({ title, value, change, icon, variant = "default" }: StatsCardProps) => {
  const isPositive = change && change > 0;
  
  return (
    <div className={cn(
      "glass-card-premium rounded-2xl p-6 card-hover",
      variant === "primary" && "border-primary/30",
      variant === "success" && "border-win/30",
      variant === "accent" && "border-accent/30"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          variant === "default" && "bg-secondary",
          variant === "primary" && "gradient-primary",
          variant === "success" && "gradient-success",
          variant === "accent" && "gradient-accent"
        )}>
          <div className={cn(
            variant === "default" ? "text-foreground" : "text-primary-foreground"
          )}>
            {icon}
          </div>
        </div>
        
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg",
            isPositive ? "text-win bg-win/10" : "text-lose bg-lose/10"
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      
      <p className="text-muted-foreground text-sm mb-1">{title}</p>
      <p className="text-3xl font-display">{value}</p>
    </div>
  );
};

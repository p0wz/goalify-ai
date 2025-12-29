import { TrendingUp, Radio, Trophy, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const actions = [
  {
    icon: TrendingUp,
    title: "Günün Tahminleri",
    description: "12 yeni tahmin hazır",
    path: "/predictions",
    gradient: "gradient-primary"
  },
  {
    icon: Radio,
    title: "Canlı Maçlar",
    description: "5 maç oynanıyor",
    path: "/live",
    gradient: "gradient-accent"
  },
  {
    icon: Trophy,
    title: "Lig Tabloları",
    description: "Güncel sıralamalar",
    path: "/leagues",
    gradient: "gradient-success"
  },
  {
    icon: Zap,
    title: "VIP Tahminler",
    description: "Premium içerikler",
    path: "/premium",
    gradient: "gradient-premium"
  }
];

export const QuickActions = () => {
  return (
    <div className="glass-card-premium rounded-2xl p-6">
      <h3 className="font-display text-lg mb-4">Hızlı Aksiyonlar</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <Link
            key={action.path}
            to={action.path}
            className={cn(
              "group p-4 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300",
              "hover:shadow-lg hover:shadow-primary/10 animate-scale-in"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", action.gradient)}>
              <action.icon className="w-5 h-5 text-primary-foreground" />
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <p className="font-medium mb-0.5">{action.title}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

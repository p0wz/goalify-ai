import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Radio, 
  Trophy,
  Settings, 
  Bell,
  Crown,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const mainNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: TrendingUp, label: "Tahminler", path: "/predictions" },
  { icon: Radio, label: "Canlı Maçlar", path: "/live" },
  { icon: Trophy, label: "Lig Tabloları", path: "/leagues" },
];

const bottomNavItems = [
  { icon: Bell, label: "Bildirimler", path: "/notifications" },
  { icon: Settings, label: "Ayarlar", path: "/settings" },
];

export const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl text-gradient">SENTIO</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center mx-auto">
            <Trophy className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-2 rounded-lg hover:bg-secondary transition-colors",
            collapsed && "mx-auto mt-2"
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {mainNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "gradient-primary text-primary-foreground shadow-glow-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", collapsed && "mx-auto")} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}

        {/* Premium CTA */}
        <Link
          to="/premium"
          className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-xl mt-4 transition-all duration-200",
            "bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30",
            "text-accent hover:from-accent/30 hover:to-primary/30",
            collapsed && "justify-center"
          )}
        >
          <Crown className={cn("w-5 h-5 flex-shrink-0", collapsed && "mx-auto")} />
          {!collapsed && <span className="font-semibold">Premium</span>}
        </Link>
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        {bottomNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-secondary text-foreground" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", collapsed && "mx-auto")} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
        
        <button
          className={cn(
            "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
            "text-destructive hover:bg-destructive/10",
            collapsed && "justify-center"
          )}
        >
          <LogOut className={cn("w-5 h-5 flex-shrink-0", collapsed && "mx-auto")} />
          {!collapsed && <span className="font-medium">Çıkış Yap</span>}
        </button>
      </div>
    </aside>
  );
};

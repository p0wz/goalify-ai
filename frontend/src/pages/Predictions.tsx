import { useState } from "react";
import { TrendingUp, Check, X, Clock, Trophy, Target, Flame, ChevronRight, Zap, Award, BarChart3 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

type PredictionStatus = "pending" | "won" | "lost";
type FilterType = "all" | "pending" | "won" | "lost";

interface Prediction {
  id: number;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  league: string;
  prediction: string;
  odds: number;
  confidence: number;
  status: PredictionStatus;
  date: string;
}

const Predictions = () => {
  const [filter, setFilter] = useState<FilterType>("all");

  const predictions: Prediction[] = [
    { 
      id: 1, 
      home: "Manchester City", 
      away: "Newcastle United",
      homeScore: 3,
      awayScore: 1,
      league: "Premier League", 
      prediction: "Ev Sahibi Kazanır", 
      odds: 1.65, 
      confidence: 85, 
      status: "won", 
      date: "Dün" 
    },
    { 
      id: 2, 
      home: "Paris Saint-Germain", 
      away: "Olympique Lyon",
      homeScore: 1,
      awayScore: 1,
      league: "Ligue 1", 
      prediction: "Üst 3.5 Gol", 
      odds: 2.10, 
      confidence: 72, 
      status: "lost", 
      date: "Dün" 
    },
    { 
      id: 3, 
      home: "Juventus", 
      away: "AS Roma",
      homeScore: null,
      awayScore: null,
      league: "Serie A", 
      prediction: "Karşılıklı Gol Var", 
      odds: 1.85, 
      confidence: 78, 
      status: "pending", 
      date: "Bugün 22:00" 
    },
    { 
      id: 4, 
      home: "Ajax Amsterdam", 
      away: "PSV Eindhoven",
      homeScore: null,
      awayScore: null,
      league: "Eredivisie", 
      prediction: "Üst 2.5 Gol", 
      odds: 1.55, 
      confidence: 91, 
      status: "pending", 
      date: "Yarın 20:00" 
    },
    { 
      id: 5, 
      home: "Real Madrid", 
      away: "Barcelona",
      homeScore: 2,
      awayScore: 1,
      league: "La Liga", 
      prediction: "Ev Sahibi Kazanır", 
      odds: 2.20, 
      confidence: 68, 
      status: "won", 
      date: "2 gün önce" 
    },
    { 
      id: 6, 
      home: "Bayern Munich", 
      away: "Dortmund",
      homeScore: 4,
      awayScore: 2,
      league: "Bundesliga", 
      prediction: "Üst 3.5 Gol", 
      odds: 1.90, 
      confidence: 82, 
      status: "won", 
      date: "3 gün önce" 
    },
  ];

  const filteredPredictions = filter === "all" 
    ? predictions 
    : predictions.filter(p => p.status === filter);

  const completedPredictions = predictions.filter(p => p.status !== "pending");
  const stats = {
    total: predictions.length,
    won: predictions.filter(p => p.status === "won").length,
    lost: predictions.filter(p => p.status === "lost").length,
    pending: predictions.filter(p => p.status === "pending").length,
    winRate: completedPredictions.length > 0 
      ? Math.round((predictions.filter(p => p.status === "won").length / completedPredictions.length) * 100)
      : 0,
    profit: 12.4,
    streak: 5,
  };

  const getStatusConfig = (status: PredictionStatus) => {
    switch (status) {
      case "won":
        return {
          gradient: "from-green-500/15 via-green-500/5 to-transparent",
          iconBg: "bg-green-500/15",
          iconColor: "text-green-500",
          badge: "bg-green-500/15 text-green-500 border border-green-500/20",
          glow: "shadow-[0_4px_20px_-4px_rgba(34,197,94,0.3)]",
          icon: Check,
        };
      case "lost":
        return {
          gradient: "from-red-500/10 via-red-500/5 to-transparent",
          iconBg: "bg-red-500/10",
          iconColor: "text-red-500",
          badge: "bg-red-500/10 text-red-500 border border-red-500/15",
          glow: "",
          icon: X,
        };
      default:
        return {
          gradient: "from-accent/10 via-accent/5 to-transparent",
          iconBg: "bg-accent/10",
          iconColor: "text-accent",
          badge: "bg-accent/10 text-accent border border-accent/20",
          glow: "",
          icon: Clock,
        };
    }
  };

  const filterTabs = [
    { key: "all" as FilterType, label: "Tümü", count: stats.total },
    { key: "won" as FilterType, label: "Kazandı", count: stats.won },
    { key: "lost" as FilterType, label: "Kaybetti", count: stats.lost },
    { key: "pending" as FilterType, label: "Bekliyor", count: stats.pending },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tahminlerim</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Son 30 günlük performans</p>
          </div>
          <div className="flex items-center gap-2 bg-card border border-border px-3 py-2 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Flame className="w-4 h-4 text-accent-foreground" />
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Seri</p>
              <p className="text-sm font-bold text-accent">{stats.streak} Galibiyet</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex items-center gap-1 text-green-500 text-xs font-semibold">
                <TrendingUp className="w-3 h-3" />
                +12%
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.won}</p>
            <p className="text-xs text-muted-foreground mt-1">Kazanılan</p>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${stats.winRate}%` }} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <X className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.lost}</p>
            <p className="text-xs text-muted-foreground mt-1">Kaybedilen</p>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-red-500/60 rounded-full transition-all duration-500" style={{ width: `${completedPredictions.length > 0 ? (stats.lost / completedPredictions.length) * 100 : 0}%` }} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-accent" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
            <p className="text-xs text-muted-foreground mt-1">Bekleyen</p>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-accent/60 rounded-full animate-pulse" style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        {/* Win Rate Banner */}
        <div className="bg-card border border-border rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Başarı Oranı</p>
                <p className="text-2xl font-bold text-foreground">%{stats.winRate}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Toplam Kâr</p>
              <p className="text-xl font-bold text-green-500">+{stats.profit}x</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                filter === tab.key 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                filter === tab.key ? "bg-primary-foreground/20" : "bg-background"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Predictions List */}
        <div className="space-y-3">
          {filteredPredictions.map((pred) => {
            const config = getStatusConfig(pred.status);
            const StatusIcon = config.icon;
            
            return (
              <div
                key={pred.id}
                className={`relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-colors cursor-pointer ${config.glow}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} pointer-events-none`} />
                
                <div className="relative p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${config.iconBg} flex items-center justify-center`}>
                        <StatusIcon className={`w-4 h-4 ${config.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{pred.league}</p>
                        <p className="text-xs font-medium text-foreground/80">{pred.date}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${config.badge}`}>
                      {pred.odds}x
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                          H
                        </div>
                        <span className="font-semibold text-foreground truncate">{pred.home}</span>
                        {pred.homeScore !== null && (
                          <span className="ml-auto text-lg font-bold text-foreground">{pred.homeScore}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                          A
                        </div>
                        <span className="font-semibold text-foreground truncate">{pred.away}</span>
                        {pred.awayScore !== null && (
                          <span className="ml-auto text-lg font-bold text-foreground">{pred.awayScore}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-accent" />
                      <span className="text-sm font-semibold text-foreground">{pred.prediction}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-lg">
                        <Award className="w-3 h-3 text-primary" />
                        <span className="text-xs font-medium text-muted-foreground">%{pred.confidence}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Predictions;

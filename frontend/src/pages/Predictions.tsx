import { useState, useEffect, useMemo } from "react";
import { TrendingUp, Check, X, Clock, Trophy, Target, Zap, ChevronRight, Loader2, RefreshCw, Lock, ChevronDown, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";

const API_BASE = import.meta.env.VITE_API_URL || 'https://goalify-ai.onrender.com/api';

type PredictionStatus = "PENDING" | "WON" | "LOST" | "REFUND";
type FilterType = "all" | "PENDING" | "WON" | "LOST";

interface ApprovedBet {
  id: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  market: string;
  odds: string;
  status: PredictionStatus;
  finalScore: string | null;
  approvedAt: string;
  settledAt: string | null;
  matchTime: string | null;
}

interface GroupedBets {
  date: string;
  label: string;
  bets: ApprovedBet[];
  isToday: boolean;
}

const Predictions = () => {
  const [filter, setFilter] = useState<FilterType>("all");
  const [bets, setBets] = useState<ApprovedBet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const isPremium = user?.plan === 'pro' || user?.role === 'admin';

  const fetchBets = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Fetch user info
      if (token) {
        const userRes = await fetch(`${API_BASE}/auth/me`, { headers });
        const userData = await userRes.json();
        if (userData.success) setUser(userData.user);
      }

      // Fetch bets
      const res = await fetch(`${API_BASE}/approved-bets`, { headers });
      const data = await res.json();
      if (data.success) {
        setBets(data.bets || []);
      } else {
        setError('Veriler yüklenemedi');
      }
    } catch (err) {
      setError('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBets();
  }, []);

  // Group bets by day (UTC)
  const groupedBets = useMemo(() => {
    const groups: Map<string, GroupedBets> = new Map();
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Filter bets based on current filter
    const filteredBets = filter === "all" ? bets : bets.filter(b => b.status === filter);

    filteredBets.forEach(bet => {
      const betDate = new Date(bet.approvedAt);
      betDate.setUTCHours(0, 0, 0, 0);
      const dateStr = betDate.toISOString().split('T')[0];

      if (!groups.has(dateStr)) {
        const isToday = dateStr === todayStr;
        const dateObj = new Date(dateStr);
        const diffDays = Math.floor((today.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));

        let label = '';
        if (diffDays === 0) label = 'Bugün';
        else if (diffDays === 1) label = 'Dün';
        else if (diffDays < 7) label = `${diffDays} gün önce`;
        else label = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

        groups.set(dateStr, { date: dateStr, label, bets: [], isToday });
      }
      groups.get(dateStr)!.bets.push(bet);
    });

    // Sort by date (newest first)
    const sorted = Array.from(groups.values()).sort((a, b) => b.date.localeCompare(a.date));

    return sorted;
  }, [bets, filter]);

  // Auto-expand today
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newExpanded = new Set(expandedDays);
    newExpanded.add(todayStr);
    setExpandedDays(newExpanded);
  }, [bets]);

  const toggleDay = (date: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDays(newExpanded);
  };

  const stats = {
    total: bets.length,
    won: bets.filter(b => b.status === "WON").length,
    lost: bets.filter(b => b.status === "LOST").length,
    pending: bets.filter(b => b.status === "PENDING").length,
  };

  const completedBets = bets.filter(b => b.status === "WON" || b.status === "LOST");
  const winRate = completedBets.length > 0
    ? Math.round((stats.won / completedBets.length) * 100)
    : 0;

  const getStatusConfig = (status: PredictionStatus) => {
    switch (status) {
      case "WON":
        return {
          gradient: "from-green-500/15 via-green-500/5 to-transparent",
          iconBg: "bg-green-500/15",
          iconColor: "text-green-500",
          badge: "bg-green-500/15 text-green-500 border border-green-500/20",
          glow: "shadow-[0_4px_20px_-4px_rgba(34,197,94,0.3)]",
          icon: Check,
          label: "Kazandı"
        };
      case "LOST":
        return {
          gradient: "from-red-500/10 via-red-500/5 to-transparent",
          iconBg: "bg-red-500/10",
          iconColor: "text-red-500",
          badge: "bg-red-500/10 text-red-500 border border-red-500/15",
          glow: "",
          icon: X,
          label: "Kaybetti"
        };
      case "REFUND":
        return {
          gradient: "from-yellow-500/10 via-yellow-500/5 to-transparent",
          iconBg: "bg-yellow-500/10",
          iconColor: "text-yellow-500",
          badge: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/15",
          glow: "",
          icon: RefreshCw,
          label: "İade"
        };
      default:
        return {
          gradient: "from-accent/10 via-accent/5 to-transparent",
          iconBg: "bg-accent/10",
          iconColor: "text-accent",
          badge: "bg-accent/10 text-accent border border-accent/20",
          glow: "",
          icon: Clock,
          label: "Bekliyor"
        };
    }
  };

  const filterTabs = [
    { key: "all" as FilterType, label: "Tümü", count: stats.total },
    { key: "WON" as FilterType, label: "Kazandı", count: stats.won },
    { key: "LOST" as FilterType, label: "Kaybetti", count: stats.lost },
    { key: "PENDING" as FilterType, label: "Bekleyen", count: stats.pending },
  ];

  const renderBetCard = (bet: ApprovedBet, isLocked: boolean) => {
    const config = getStatusConfig(bet.status);
    const StatusIcon = config.icon;

    if (isLocked) {
      return (
        <div
          key={bet.id}
          className="relative glass-card-premium rounded-2xl overflow-hidden opacity-60"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center">
              <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-medium">Premium Üyelik Gerekli</p>
              <Link to="/premium" className="text-xs text-primary hover:underline mt-1 inline-block">
                Premium'a Geç →
              </Link>
            </div>
          </div>
          <div className="p-4 blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Lig Adı</p>
                <p className="text-xs font-medium">Tarih</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-muted-foreground">Ev Sahibi Takım</p>
              <p className="font-semibold text-muted-foreground">Deplasman Takımı</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={bet.id}
        className={`relative glass-card-premium rounded-2xl overflow-hidden hover:border-primary/50 transition-colors ${config.glow}`}
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} pointer-events-none`} />

        <div className="relative p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${config.iconBg} flex items-center justify-center`}>
                <StatusIcon className={`w-4 h-4 ${config.iconColor}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{bet.league}</p>
              </div>
            </div>
            <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${config.badge}`}>
              {bet.odds || '-'}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                  H
                </div>
                <span className="font-semibold text-foreground truncate">{bet.homeTeam}</span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                  A
                </div>
                <span className="font-semibold text-foreground truncate">{bet.awayTeam}</span>
              </div>
            </div>
            {bet.finalScore && (
              <div className="text-center">
                <p className="text-lg font-display-bold text-foreground">{bet.finalScore}</p>
                <p className="text-xs text-muted-foreground">Skor</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/30">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-foreground">{bet.market}</span>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded ${config.badge}`}>
              {config.label}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="brutalist-heading text-2xl">Tahminler</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Günlük tahminler ve sonuçlar</p>
          </div>
          <button
            onClick={fetchBets}
            disabled={loading}
            className="p-2.5 rounded-xl hover:bg-secondary transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Stats Grid */}
        {!loading && bets.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card-premium rounded-2xl p-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center mb-3">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-display-bold text-foreground">{stats.won}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Kazanılan</p>
            </div>

            <div className="glass-card-premium rounded-2xl p-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center mb-3">
                <X className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-2xl font-display-bold text-foreground">{stats.lost}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Kaybedilen</p>
            </div>

            <div className="glass-card-premium rounded-2xl p-4">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <p className="text-2xl font-display-bold text-foreground">{stats.pending}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Bekleyen</p>
            </div>

            <div className="glass-card-premium rounded-2xl p-4">
              <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-display-bold text-foreground">%{winRate}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Başarı Oranı</p>
            </div>
          </div>
        )}

        {/* Premium Banner for non-premium users */}
        {!isPremium && !loading && (
          <div className="glass-card-premium rounded-2xl p-4 border border-accent/30 bg-gradient-to-r from-accent/10 to-primary/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 gradient-accent flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-display text-foreground">Premium ile Tüm Tahminlere Erişim</p>
                <p className="text-sm text-muted-foreground">Bekleyen tahminleri görmek için Premium üye olun</p>
              </div>
              <Link to="/premium" className="btn-brutalist h-10 px-6 text-sm shrink-0">
                Premium'a Geç
              </Link>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${filter === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-md ${filter === tab.key ? "bg-primary-foreground/20" : "bg-background"
                }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-muted-foreground mb-4">{error}</p>
            <button onClick={fetchBets} className="btn-brutalist-outline">
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && bets.length === 0 && (
          <div className="glass-card-premium rounded-2xl p-12 text-center">
            <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-display text-foreground mb-2">Henüz Tahmin Yok</h3>
            <p className="text-muted-foreground">Onaylanan tahminler burada görünecek.</p>
          </div>
        )}

        {/* Grouped Bets by Day */}
        {!loading && !error && groupedBets.length > 0 && (
          <div className="space-y-4">
            {groupedBets.map((group) => {
              const isExpanded = expandedDays.has(group.date);

              return (
                <div key={group.date} className="glass-card-premium rounded-2xl overflow-hidden">
                  {/* Day Header */}
                  <button
                    onClick={() => toggleDay(group.date)}
                    className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${group.isToday ? 'gradient-primary' : 'bg-muted'}`}>
                        <span className={`text-sm font-display-bold ${group.isToday ? 'text-white' : 'text-muted-foreground'}`}>
                          {new Date(group.date).getUTCDate()}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="font-display text-foreground">{group.label}</p>
                        <p className="text-xs text-muted-foreground">{group.bets.length} tahmin</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Day Content */}
                  {isExpanded && (
                    <div className="p-4 pt-0 space-y-3">
                      {group.bets.map((bet) => {
                        // Non-premium users can't see pending bets
                        const isLocked = !isPremium && bet.status === "PENDING";
                        return renderBetCard(bet, isLocked);
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Predictions;

import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/components/LanguageProvider";
import { Link } from "react-router-dom";
import {
    TrendingUp,
    Search,
    Clock,
    ChevronDown,
    ChevronUp,
    Crown,
    BarChart3,
    RefreshCw,
    Trophy,
    Shield,
    Target,
    Loader2,
    AlertCircle,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "https://goalify-ai.onrender.com/api";

interface MatchStats {
    homeWin?: number;
    homeDraw?: number;
    homeLoss?: number;
    awayWin?: number;
    awayDraw?: number;
    awayLoss?: number;
    homeGoals?: number;
    awayGoals?: number;
    homeGoalsConceded?: number;
    awayGoalsConceded?: number;
    homeCleanSheet?: number;
    awayCleanSheet?: number;
    homeFailedToScore?: number;
    awayFailedToScore?: number;
    homeBTTS?: number;
    awayBTTS?: number;
    homeOver25?: number;
    awayOver25?: number;
    leagueAvgGoals?: number;
    homeConsecutiveScoring?: number;
    awayConsecutiveScoring?: number;
    homeConsecutiveConceding?: number;
    awayConsecutiveConceding?: number;
    [key: string]: any;
}

interface PublishedMatch {
    matchId: string;
    homeTeam: string;
    awayTeam: string;
    league: string;
    timestamp: number;
    stats: MatchStats;
    publishedAt: string;
}

const Analysis = () => {
    const { t } = useLanguage();
    const [matches, setMatches] = useState<PublishedMatch[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isPremium, setIsPremium] = useState(false);
    const [isLimited, setIsLimited] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLeague, setSelectedLeague] = useState("all");
    const [selectedTime, setSelectedTime] = useState("all");

    const getAuthHeaders = (): Record<string, string> => {
        const token = localStorage.getItem("sentio_token");
        if (token) return { Authorization: `Bearer ${token}` };
        return {};
    };

    const loadMatches = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/public/matches`, {
                headers: { ...getAuthHeaders() },
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data.success) {
                setMatches(data.matches || []);
                setTotalCount(data.totalCount || 0);
                setIsPremium(data.isPremium || false);
                setIsLimited(data.limited || false);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadMatches(); }, []);

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    // Unique leagues for filter
    const leagues = useMemo(() => {
        const set = new Set(matches.map(m => m.league));
        return Array.from(set).sort();
    }, [matches]);

    // Time ranges for filter
    const timeRanges = useMemo(() => {
        return [
            { value: "all", label: t.analysis?.allTimes || "Tüm Saatler" },
            { value: "morning", label: "12:00 - 15:00" },
            { value: "afternoon", label: "15:00 - 18:00" },
            { value: "evening", label: "18:00 - 21:00" },
            { value: "night", label: "21:00 - 00:00" },
        ];
    }, [t]);

    // Filtered matches
    const filteredMatches = useMemo(() => {
        return matches.filter(m => {
            // Text search
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if (!m.homeTeam.toLowerCase().includes(q) &&
                    !m.awayTeam.toLowerCase().includes(q) &&
                    !m.league.toLowerCase().includes(q)) return false;
            }
            // League filter
            if (selectedLeague !== "all" && m.league !== selectedLeague) return false;
            // Time filter
            if (selectedTime !== "all" && m.timestamp) {
                const d = new Date(m.timestamp * 1000);
                const h = d.getHours();
                if (selectedTime === "morning" && (h < 12 || h >= 15)) return false;
                if (selectedTime === "afternoon" && (h < 15 || h >= 18)) return false;
                if (selectedTime === "evening" && (h < 18 || h >= 21)) return false;
                if (selectedTime === "night" && (h < 21 && h >= 0)) return false;
            }
            return true;
        });
    }, [matches, searchQuery, selectedLeague, selectedTime]);

    const formatTime = (ts: number) => {
        if (!ts) return "--:--";
        const d = new Date(ts * 1000);
        return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    };

    const StatBar = ({ label, value, max = 100, color = "emerald" }: { label: string; value?: number; max?: number; color?: string }) => {
        const pct = value != null ? Math.min((value / max) * 100, 100) : 0;
        const bgColors: Record<string, string> = {
            emerald: "bg-emerald-500",
            blue: "bg-blue-500",
            amber: "bg-amber-500",
            red: "bg-red-500",
            cyan: "bg-cyan-500",
        };
        return (
            <div className="flex items-center gap-2 text-xs">
                <span className="w-28 text-muted-foreground truncate">{label}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${bgColors[color] || bgColors.emerald}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="w-10 text-right font-mono text-foreground">
                    {value != null ? (max === 100 ? `${value}%` : value) : "-"}
                </span>
            </div>
        );
    };

    return (
        <AppLayout>
            <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <BarChart3 className="h-6 w-6 text-emerald-500" />
                            {t.analysis?.title || "Günlük Analiz"}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {t.analysis?.subtitle || "AI destekli istatistiksel maç analizi"}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                            {filteredMatches.length} {t.analysis?.matchCount || "maç"}
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={loadMatches} disabled={loading}>
                            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t.analysis?.searchPlaceholder || "Takım veya lig ara..."}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={selectedLeague} onValueChange={setSelectedLeague}>
                        <SelectTrigger>
                            <SelectValue placeholder={t.analysis?.allLeagues || "Tüm Ligler"} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t.analysis?.allLeagues || "Tüm Ligler"}</SelectItem>
                            {leagues.map(l => (
                                <SelectItem key={l} value={l}>{l}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger>
                            <SelectValue placeholder={t.analysis?.allTimes || "Tüm Saatler"} />
                        </SelectTrigger>
                        <SelectContent>
                            {timeRanges.map(r => (
                                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                    </div>
                )}

                {/* Error */}
                {error && (
                    <Card className="border-red-500/30 bg-red-500/5">
                        <CardContent className="p-4 flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <span className="text-sm text-red-400">{error}</span>
                            <Button variant="outline" size="sm" onClick={loadMatches} className="ml-auto">
                                {t.common?.retry || "Tekrar Dene"}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Empty State */}
                {!loading && !error && filteredMatches.length === 0 && (
                    <Card className="border-dashed">
                        <CardContent className="p-12 text-center">
                            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium">{t.analysis?.noData || "Bugün henüz analiz yayınlanmadı"}</h3>
                            <p className="text-sm text-muted-foreground mt-2">{t.analysis?.noDataDesc || "Analizler yayınlandığında burada görünecek."}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Match Cards */}
                <div className="space-y-4">
                    {filteredMatches.map(match => {
                        const isExpanded = expandedIds.has(match.matchId);
                        const s = match.stats || {};
                        return (
                            <Card key={match.matchId} className="overflow-hidden border-border/50 hover:border-emerald-500/30 transition-colors">
                                {/* Match Header */}
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Badge variant="secondary" className="text-[10px] px-2 py-0">
                                                {match.league}
                                            </Badge>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatTime(match.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                    <CardTitle className="text-lg mt-2 flex items-center justify-center gap-3">
                                        <span className="text-right flex-1 font-bold">{match.homeTeam}</span>
                                        <span className="text-muted-foreground text-sm font-normal px-2">vs</span>
                                        <span className="text-left flex-1 font-bold">{match.awayTeam}</span>
                                    </CardTitle>
                                </CardHeader>

                                {/* Quick Stats */}
                                <CardContent className="p-4 pt-2">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
                                        <div className="bg-muted/50 rounded-lg p-2">
                                            <div className="text-muted-foreground">{t.analysis?.leagueAvg || "Lig Ort."}</div>
                                            <div className="text-lg font-bold text-emerald-500">{s.leagueAvgGoals ?? "-"}</div>
                                        </div>
                                        <div className="bg-muted/50 rounded-lg p-2">
                                            <div className="text-muted-foreground">{t.analysis?.homeO25 || "Ev Ü2.5"}</div>
                                            <div className="text-lg font-bold text-blue-500">{s.homeOver25 != null ? `${s.homeOver25}%` : "-"}</div>
                                        </div>
                                        <div className="bg-muted/50 rounded-lg p-2">
                                            <div className="text-muted-foreground">{t.analysis?.awayO25 || "Dep Ü2.5"}</div>
                                            <div className="text-lg font-bold text-cyan-500">{s.awayOver25 != null ? `${s.awayOver25}%` : "-"}</div>
                                        </div>
                                        <div className="bg-muted/50 rounded-lg p-2">
                                            <div className="text-muted-foreground">{t.analysis?.btts || "KG Var"}</div>
                                            <div className="text-lg font-bold text-amber-500">
                                                {s.homeBTTS != null && s.awayBTTS != null
                                                    ? `${Math.round((s.homeBTTS + s.awayBTTS) / 2)}%`
                                                    : "-"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expand Toggle */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full mt-3 text-muted-foreground hover:text-foreground"
                                        onClick={() => toggleExpand(match.matchId)}
                                    >
                                        {isExpanded ? (
                                            <><ChevronUp className="h-4 w-4 mr-1" /> {t.analysis?.detailedStats || "Detaylı İstatistikler"}</>
                                        ) : (
                                            <><ChevronDown className="h-4 w-4 mr-1" /> {t.analysis?.detailedStats || "Detaylı İstatistikler"}</>
                                        )}
                                    </Button>

                                    {/* Expanded Stats */}
                                    {isExpanded && (
                                        <div className="mt-4 space-y-6 animate-in slide-in-from-top-2 duration-300">
                                            {/* Home Performance */}
                                            <div>
                                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-blue-500" />
                                                    {match.homeTeam} — {t.analysis?.homePerformance || "Ev Performansı"}
                                                </h4>
                                                <div className="space-y-2">
                                                    <StatBar label={t.analysis?.win || "Galibiyet"} value={s.homeWin} color="emerald" />
                                                    <StatBar label={t.analysis?.draw || "Beraberlik"} value={s.homeDraw} color="amber" />
                                                    <StatBar label={t.analysis?.loss || "Mağlubiyet"} value={s.homeLoss} color="red" />
                                                    <StatBar label={t.analysis?.goalsScored || "Atılan Gol"} value={s.homeGoals} max={3} color="emerald" />
                                                    <StatBar label={t.analysis?.goalsConceded || "Yenilen Gol"} value={s.homeGoalsConceded} max={3} color="red" />
                                                    <StatBar label={t.analysis?.cleanSheet || "Gol Yememe"} value={s.homeCleanSheet} color="cyan" />
                                                    <StatBar label={t.analysis?.failedToScore || "Gol Atamama"} value={s.homeFailedToScore} color="red" />
                                                    <StatBar label={t.analysis?.btts || "KG Var"} value={s.homeBTTS} color="amber" />
                                                    {s.homeConsecutiveScoring != null && (
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <span className="w-28 text-muted-foreground truncate">{t.analysis?.scoringSeq || "Ardışık Gol Attığı"}</span>
                                                            <span className="font-mono text-emerald-500 font-bold">{s.homeConsecutiveScoring} {t.analysis?.matches || "maç"}</span>
                                                        </div>
                                                    )}
                                                    {s.homeConsecutiveConceding != null && (
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <span className="w-28 text-muted-foreground truncate">{t.analysis?.concedingSeq || "Ardışık Gol Yediği"}</span>
                                                            <span className="font-mono text-red-500 font-bold">{s.homeConsecutiveConceding} {t.analysis?.matches || "maç"}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Away Performance */}
                                            <div>
                                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                                    <Target className="h-4 w-4 text-cyan-500" />
                                                    {match.awayTeam} — {t.analysis?.awayPerformance || "Deplasman Performansı"}
                                                </h4>
                                                <div className="space-y-2">
                                                    <StatBar label={t.analysis?.win || "Galibiyet"} value={s.awayWin} color="emerald" />
                                                    <StatBar label={t.analysis?.draw || "Beraberlik"} value={s.awayDraw} color="amber" />
                                                    <StatBar label={t.analysis?.loss || "Mağlubiyet"} value={s.awayLoss} color="red" />
                                                    <StatBar label={t.analysis?.goalsScored || "Atılan Gol"} value={s.awayGoals} max={3} color="emerald" />
                                                    <StatBar label={t.analysis?.goalsConceded || "Yenilen Gol"} value={s.awayGoalsConceded} max={3} color="red" />
                                                    <StatBar label={t.analysis?.cleanSheet || "Gol Yememe"} value={s.awayCleanSheet} color="cyan" />
                                                    <StatBar label={t.analysis?.failedToScore || "Gol Atamama"} value={s.awayFailedToScore} color="red" />
                                                    <StatBar label={t.analysis?.btts || "KG Var"} value={s.awayBTTS} color="amber" />
                                                    {s.awayConsecutiveScoring != null && (
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <span className="w-28 text-muted-foreground truncate">{t.analysis?.scoringSeq || "Ardışık Gol Attığı"}</span>
                                                            <span className="font-mono text-emerald-500 font-bold">{s.awayConsecutiveScoring} {t.analysis?.matches || "maç"}</span>
                                                        </div>
                                                    )}
                                                    {s.awayConsecutiveConceding != null && (
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <span className="w-28 text-muted-foreground truncate">{t.analysis?.concedingSeq || "Ardışık Gol Yediği"}</span>
                                                            <span className="font-mono text-red-500 font-bold">{s.awayConsecutiveConceding} {t.analysis?.matches || "maç"}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Premium Gate Banner */}
                {isLimited && !isPremium && (
                    <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-amber-600/5">
                        <CardContent className="p-6 text-center">
                            <Crown className="h-10 w-10 mx-auto text-amber-500 mb-3" />
                            <h3 className="text-lg font-bold mb-1">
                                {t.analysis?.premiumRequired || "Bu analizleri görmek için Premium üye olun"}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {totalCount - matches.length} {t.analysis?.moreMatches || "daha fazla maç mevcut"}
                            </p>
                            <Link to="/premium">
                                <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                                    <Crown className="mr-2 h-4 w-4" />
                                    {t.analysis?.upgradeToPremium || "Premium'a Geç"}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
};

export default Analysis;

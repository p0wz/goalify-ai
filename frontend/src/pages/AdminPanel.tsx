import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
    Play,
    Copy,
    Check,
    TrendingUp,
    Target,
    Activity,
    Clock,
    FileText,
    RefreshCw,
    Trash2,
    Brain,
    CheckCircle,
    XCircle,
    Settings,
    BarChart3,
    Zap,
    User,
    Shield,
    List,
    Smartphone,
    Radio,
    History
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || 'https://goalify-ai.onrender.com/api';

// Safe JSON parser - handles Render sleep mode HTML responses
const safeJson = async (res: Response) => {
    const text = await res.text();
    if (!text || text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        throw new Error('Sunucu uyanıyor, lütfen birkaç saniye bekleyip tekrar deneyin.');
    }
    try {
        return JSON.parse(text);
    } catch {
        throw new Error('Geçersiz sunucu yanıtı');
    }
};

interface AnalysisResult {
    id: string;
    matchId: string;
    homeTeam: string;
    awayTeam: string;
    league: string;
    timestamp: number;
    market: string;
    marketKey: string;
    stats: any;
    aiPrompt: string;
    rawStats: string;
}

interface RawMatch {
    matchId: string;
    homeTeam: string;
    awayTeam: string;
    league: string;
    timestamp: number;
    stats: any;
    detailedStats: string;
}

interface ApprovedBet {
    id: string;
    matchId: string;
    homeTeam: string;
    awayTeam: string;
    league: string;
    market: string;
    odds: string;
    status: string;
    finalScore: string;
    approvedAt: string;
    matchTime?: string;
}

interface TrainingEntry {
    id: string;
    match: string;
    league: string;
    market: string;
    odds: string;
    result: string;
    final_score: string;
    settled_at: string;
}

interface UserData {
    id: string;
    email: string;
    role: string;
    plan: string;
    isPremium: boolean;
    is_premium?: number;
    created_at: string;
}

interface MobileBet {
    id: string;
    betId: string;
    homeTeam: string;
    awayTeam: string;
    league: string;
    market: string;
    odds: string;
    status: string;
    finalScore: string;
    matchTime: string;
    createdAt: string;
}

const AdminPanel = () => {
    // Analysis State
    const [results, setResults] = useState<AnalysisResult[]>([]);
    const [allMatches, setAllMatches] = useState<RawMatch[]>([]);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [marketFilter, setMarketFilter] = useState("all");
    const [oddsInputs, setOddsInputs] = useState<Record<string, string>>({});

    // Raw Match Manual Selection State
    const [rawMarketSelections, setRawMarketSelections] = useState<Record<string, string>>({});
    const [rawOddsInputs, setRawOddsInputs] = useState<Record<string, string>>({});

    // Approved Bets State
    const [bets, setBets] = useState<ApprovedBet[]>([]);
    const [betsFilter, setBetsFilter] = useState("all");
    const [betsLoading, setBetsLoading] = useState(false);

    // Calculate Real-time Win Rates for Approved Bets
    const betStats = useMemo(() => {
        const stats: Record<string, { total: number, won: number, lost: number, refund: number }> = {};
        bets.forEach(bet => {
            if (bet.status === 'PENDING') return; // Skip pending
            if (!stats[bet.market]) stats[bet.market] = { total: 0, won: 0, lost: 0, refund: 0 };

            stats[bet.market].total++;
            if (bet.status === 'WON') stats[bet.market].won++;
            if (bet.status === 'LOST') stats[bet.market].lost++;
            if (bet.status === 'REFUND') stats[bet.market].refund++; // Refunds don't count as lost but affected total? usually excluded from WR.
            // Let's keep WR = Won / (Won + Lost) for betting accuracy, or Won / Total (including refund)?
            // Standard: Refund is push. Won / (Won + Lost).
        });

        return Object.entries(stats).map(([market, data]) => {
            const decided = data.won + data.lost;
            return {
                market,
                ...data,
                winRate: decided > 0 ? Math.round((data.won / decided) * 100) : 0
            };
        }).sort((a, b) => b.total - a.total);
    }, [bets]);
    const [settling, setSettling] = useState(false);

    // Training Pool State
    const [training, setTraining] = useState<TrainingEntry[]>([]);
    const [trainingStats, setTrainingStats] = useState<any>(null);

    // Users State
    const [users, setUsers] = useState<UserData[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);

    // Mobile Bets State
    const [mobileBets, setMobileBets] = useState<MobileBet[]>([]);
    const [mobileBetsLoading, setMobileBetsLoading] = useState(false);

    // Live Bot State
    const [liveSignals, setLiveSignals] = useState<any[]>([]);
    const [liveHistory, setLiveHistory] = useState<any[]>([]);
    const [liveStatus, setLiveStatus] = useState<any>({});
    const [liveLoading, setLiveLoading] = useState(false);

    // Dead Match Bot State
    const [deadStatus, setDeadStatus] = useState<any>({});
    const [deadLoading, setDeadLoading] = useState(false);


    // Load data on mount
    useEffect(() => {
        loadCachedAnalysis();
        loadBets();
        loadTraining();
        loadUsers();
        loadMobileBets();
        loadLiveSignals();
        loadLiveHistory();
        loadDeadStatus();
    }, []);

    // ============ ANALYSIS FUNCTIONS ============

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    const handleAuthError = (res: Response) => {
        if (res.status === 401) {
            toast.error("Oturum süresi doldu, lütfen tekrar giriş yapın");
            localStorage.removeItem('token');
            // Allow time for toast
            setTimeout(() => window.location.href = '/login', 1500);
            throw new Error("Unauthorized");
        }
        return res;
    };

    const loadCachedAnalysis = async () => {
        // Silent load - do not set analysisLoading to avoid "Analysis Starting" UI confusion
        try {
            const res = await fetch(`${API_BASE}/analysis/results`, { headers: getAuthHeaders() as any });
            handleAuthError(res);
            const data = await safeJson(res);
            if (data.success && data.results && data.results.length > 0) {
                setResults(data.results);
                toast.success(`${data.results.length} analiz önbellekten yüklendi`);
            }
        } catch (err: any) {
            console.error('Cache load error:', err);
        }
    };

    const runAnalysis = async (limit: number = 500, leagueFilter: boolean = true) => {
        setAnalysisLoading(true);
        try {
            const res = await fetch(`${API_BASE}/analysis/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ limit, leagueFilter })
            });
            handleAuthError(res);
            const data = await safeJson(res); // Removed duplicate declaration
            if (data.success) {
                setResults(data.results);
                setAllMatches(data.allMatches || []);
                toast.success(`${data.count} aday bulundu! (${data.totalMatches || 0} toplam maç)`);
            } else {
                toast.error(data.error || 'Analiz hatası');
            }
        } catch (err: any) {
            toast.error(err.message);
        }
        setAnalysisLoading(false);
    };

    const approveBet = async (item: AnalysisResult) => {
        const odds = oddsInputs[item.id] || null;
        try {
            const res = await fetch(`${API_BASE}/bets/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    matchId: item.matchId,
                    homeTeam: item.homeTeam,
                    awayTeam: item.awayTeam,
                    league: item.league,
                    market: item.market,
                    odds,
                    matchTime: item.timestamp
                })
            });
            handleAuthError(res);
            const data = await safeJson(res);
            if (data.success) {
                toast.success('Bahis onaylandı!');
                setResults(results.filter(r => r.id !== item.id));
                loadBets();
            } else {
                toast.error(data.error || 'Onay hatası');
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Panoya kopyalandı!');
    };

    const copyAllPrompts = () => {
        const filtered = marketFilter === 'all' ? results : results.filter(r => r.marketKey === marketFilter);
        const text = filtered.map(r => {
            let prompt = r.aiPrompt;
            if (oddsInputs[r.id]) {
                prompt = prompt.replace(`Market: ${r.market}`, `Market: ${r.market}\nOdds: ${oddsInputs[r.id]}`);
            }
            return prompt;
        }).join('\n\n---\n\n');
        copyToClipboard(text);
    };

    const copyAllRawStats = () => {
        const filtered = marketFilter === 'all' ? results : results.filter(r => r.marketKey === marketFilter);
        const unique: AnalysisResult[] = [];
        const seen = new Set();
        filtered.forEach(r => {
            if (!seen.has(r.matchId)) {
                seen.add(r.matchId);
                unique.push(r);
            }
        });
        const text = unique.map(r => r.rawStats).join('\n\n');
        copyToClipboard(text);
    };

    const copyAllRawDetailedPrompts = () => {
        const text = allMatches.map(m => m.detailedStats).join('\n\n---\n\n');
        copyToClipboard(text);
    };

    const approveRawMatch = async (match: RawMatch) => {
        const market = rawMarketSelections[match.matchId];
        const odds = rawOddsInputs[match.matchId];

        if (!market) {
            toast.error("Lütfen bir market seçin");
            return;
        }
        if (!odds) {
            toast.error("Lütfen oran girin");
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/bets/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    matchId: match.matchId,
                    homeTeam: match.homeTeam,
                    awayTeam: match.awayTeam,
                    league: match.league,
                    market: market,
                    odds,
                    matchTime: match.timestamp
                })
            });
            handleAuthError(res);
            const data = await safeJson(res);
            if (data.success) {
                toast.success('Manuel bahis onaylandı!');
                loadBets();
            } else {
                toast.error(data.error || 'Onay hatası');
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    // ============ BETS FUNCTIONS ============

    const loadBets = async () => {
        setBetsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/bets/approved`, { headers: getAuthHeaders() as any });
            handleAuthError(res);
            const data = await safeJson(res);
            if (data.success) setBets(data.bets || []);
        } catch (err: any) {
            console.error(err);
            // Silent fail on initial load
        }
        setBetsLoading(false);
    };

    const runSettlement = async () => {
        setSettling(true);
        try {
            const res = await fetch(`${API_BASE}/settlement/run`, {
                method: 'POST',
                headers: getAuthHeaders() as any
            });
            handleAuthError(res);
            const data = await safeJson(res);
            if (data.success) {
                toast.success(`${data.settled} bahis settle edildi!`);
                loadBets();
                loadTraining();
            } else {
                toast.error(data.error || 'Settlement hatası');
            }
        } catch (err: any) {
            toast.error(err.message);
        }
        setSettling(false);
    };

    const deleteBet = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE}/bets/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders() as any
            });
            handleAuthError(res);
            await safeJson(res);
            loadBets();
            toast.success('Bahis silindi');
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    // ============ TRAINING FUNCTIONS ============

    const loadTraining = async () => {
        try {
            const [dataRes, statsRes] = await Promise.all([
                fetch(`${API_BASE}/training/all`, { headers: getAuthHeaders() as any }).then(handleAuthError),
                fetch(`${API_BASE}/training/stats`, { headers: getAuthHeaders() as any }).then(handleAuthError)
            ]);
            const [dataJson, statsJson] = await Promise.all([
                safeJson(dataRes).catch(() => ({ success: false })),
                safeJson(statsRes).catch(() => ({ success: false }))
            ]);
            if (dataJson.success) setTraining(dataJson.data || []);
            if (statsJson.success) setTrainingStats(statsJson.stats);
        } catch (err) {
            console.error(err);
            // Silent fail on initial load
        }
    };

    // ============ USERS FUNCTIONS ============

    const loadUsers = async () => {
        setUsersLoading(true);
        try {
            const res = await fetch(`${API_BASE}/admin/users`, { headers: getAuthHeaders() as any });
            handleAuthError(res);
            const data = await safeJson(res);
            if (data.success) setUsers(data.users || []);
        } catch (err) {
            console.error(err);
        }
        setUsersLoading(false);
    };

    const togglePlan = async (userId: string, currentPlan: string) => {
        const newPlan = currentPlan === 'free' ? 'pro' : 'free';
        try {
            const res = await fetch(`${API_BASE}/users/${userId}/plan`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ plan: newPlan })
            });
            handleAuthError(res);
            const data = await safeJson(res);
            if (data.success) {
                toast.success(`Kullanıcı planı güncellendi: ${newPlan.toUpperCase()}`);
                loadUsers();
            } else {
                toast.error(data.error);
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const togglePremium = async (userId: string, currentPremium: boolean) => {
        try {
            const res = await fetch(`${API_BASE}/admin/users/${userId}/premium`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ isPremium: !currentPremium })
            });
            handleAuthError(res);
            const data = await safeJson(res);
            if (data.success) {
                toast.success(currentPremium ? 'PRO deaktif edildi' : 'PRO aktif edildi');
                loadUsers();
            } else {
                toast.error(data.error || 'Hata oluştu');
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    // ============ MOBILE BETS FUNCTIONS ============

    const loadMobileBets = async () => {
        setMobileBetsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/mobile-bets`, { headers: getAuthHeaders() as any });
            handleAuthError(res);
            const data = await safeJson(res);
            if (data.success) setMobileBets(data.bets || []);
        } catch (err) {
            console.error(err);
        }
        setMobileBetsLoading(false);
    };

    const addToMobile = async (bet: ApprovedBet) => {
        try {
            const res = await fetch(`${API_BASE}/mobile-bets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    betId: bet.id,
                    homeTeam: bet.homeTeam,
                    awayTeam: bet.awayTeam,
                    league: bet.league,
                    market: bet.market,
                    odds: bet.odds,
                    matchTime: bet.matchTime,
                    status: bet.status
                })
            });
            handleAuthError(res);
            const data = await safeJson(res);
            if (data.success) {
                toast.success('Bahis mobile eklendi!');
                loadMobileBets();
            } else {
                toast.error(data.error || 'Hata oluştu');
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const deleteMobileBet = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE}/mobile-bets/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders() as any
            });
            handleAuthError(res);
            await safeJson(res);
            loadMobileBets();
            toast.success('Mobil bahis silindi');
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    // ============ LIVE BOT FUNCTIONS ============

    const loadLiveSignals = async () => {
        try {
            setLiveLoading(true);
            const res = await fetch(`${API_BASE}/live/signals`, { headers: getAuthHeaders() as any });
            if (res.ok) {
                const data = await safeJson(res);
                setLiveSignals(data.signals || []);
                setLiveStatus(data.status || {});
            }
        } catch (err: any) {
            console.error('Live signals error:', err.message);
        } finally {
            setLiveLoading(false);
        }
    };

    const loadLiveHistory = async () => {
        try {
            const res = await fetch(`${API_BASE}/live/history`, { headers: getAuthHeaders() as any });
            if (res.ok) {
                const data = await safeJson(res);
                setLiveHistory(data.signals || []);
            }
        } catch (err: any) {
            console.error('Live history error:', err.message);
        }
    };

    const runManualScan = async () => {
        try {
            setLiveLoading(true);
            toast.info('Manuel tarama başlatıldı...');
            const res = await fetch(`${API_BASE}/live/scan`, {
                method: 'POST',
                headers: getAuthHeaders() as any
            });
            handleAuthError(res);
            const data = await safeJson(res);
            if (data.success) {
                toast.success(`Tarama tamamlandı: ${data.signals?.length || 0} sinyal`);
                loadLiveSignals();
                loadLiveHistory();
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLiveLoading(false);
        }
    };

    const startLiveBot = async (filterEnabled: boolean = true) => {
        try {
            setLiveLoading(true);
            const res = await fetch(`${API_BASE}/live/start`, {
                method: 'POST',
                headers: getAuthHeaders() as any,
                body: JSON.stringify({ filterEnabled })
            });
            handleAuthError(res);
            const data = await safeJson(res);
            if (data.success) {
                toast.success(data.message || 'Canlı bot başlatıldı!');
                loadLiveSignals();
            } else {
                toast.error(data.message || 'Başlatılamadı');
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLiveLoading(false);
        }
    };

    const stopLiveBot = async () => {
        try {
            setLiveLoading(true);
            const res = await fetch(`${API_BASE}/live/stop`, {
                method: 'POST',
                headers: getAuthHeaders() as any
            });
            handleAuthError(res);
            const data = await safeJson(res);
            if (data.success) {
                toast.success('Canlı bot durduruldu');
                loadLiveSignals();
            } else {
                toast.error(data.message || 'Durdurulamadı');
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLiveLoading(false);
        }
    };

    // ============ DEAD MATCH BOT FUNCTIONS ============

    const loadDeadStatus = async () => {
        try {
            const res = await fetch(`${API_BASE}/dead/status`, {
                headers: getAuthHeaders() as any
            });
            handleAuthError(res);
            const data = await safeJson(res);
            if (data.success) {
                setDeadStatus(data);
            }
        } catch (err) {
            console.error('Dead status error:', err);
        }
    };

    const startDeadBot = async (filterEnabled: boolean = true) => {
        try {
            setDeadLoading(true);
            const res = await fetch(`${API_BASE}/dead/start`, {
                method: 'POST',
                headers: getAuthHeaders() as any,
                body: JSON.stringify({ filterEnabled })
            });
            handleAuthError(res);
            const data = await safeJson(res);
            if (data.success) {
                toast.success(data.message || 'Dead Bot başlatıldı!');
                loadDeadStatus();
                loadLiveSignals(); // Dead signals go to same list
            } else {
                toast.error(data.message || 'Başlatılamadı');
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setDeadLoading(false);
        }
    };

    const stopDeadBot = async () => {
        try {
            setDeadLoading(true);
            const res = await fetch(`${API_BASE}/dead/stop`, {
                method: 'POST',
                headers: getAuthHeaders() as any
            });
            handleAuthError(res);
            const data = await safeJson(res);
            if (data.success) {
                toast.success('Dead Bot durduruldu');
                loadDeadStatus();
            } else {
                toast.error(data.message || 'Durdurulamadı');
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setDeadLoading(false);
        }
    };

    // ============ HELPERS ============

    const filteredResults = marketFilter === 'all' ? results : results.filter(r => r.marketKey === marketFilter);
    const markets = [...new Set(results.map(r => r.marketKey))];
    const pendingCount = bets.filter(b => b.status === 'PENDING').length;
    const wonCount = bets.filter(b => b.status === 'WON').length;
    const lostCount = bets.filter(b => b.status === 'LOST').length;

    const getStatusBadge = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'WON':
                return <Badge className="bg-win text-white"><CheckCircle className="mr-1 h-3 w-3" />WON</Badge>;
            case 'LOST':
                return <Badge className="bg-lose text-white"><XCircle className="mr-1 h-3 w-3" />LOST</Badge>;
            default:
                return <Badge className="bg-draw text-white"><Clock className="mr-1 h-3 w-3" />PENDING</Badge>;
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6 animate-slide-up">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-display flex items-center gap-3">
                            <Settings className="h-8 w-8 text-primary" />
                            Admin Panel
                        </h1>
                        <p className="text-muted-foreground mt-1">Analiz, Settlement ve Training Pool Yönetimi</p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="glass-card card-hover">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-primary">{results.length}</div>
                            <div className="text-sm text-muted-foreground">Aday</div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card card-hover">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-draw">{pendingCount}</div>
                            <div className="text-sm text-muted-foreground">Bekleyen</div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card card-hover">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-win">{wonCount}</div>
                            <div className="text-sm text-muted-foreground">Kazanan</div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card card-hover">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-lose">{lostCount}</div>
                            <div className="text-sm text-muted-foreground">Kaybeden</div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card-premium card-hover">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-gradient">{trainingStats?.winRate || 0}%</div>
                            <div className="text-sm text-muted-foreground">Win Rate</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                {/* Tabs */}
                <Tabs defaultValue="analysis" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-8">
                        <TabsTrigger value="analysis" className="relative flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Analiz
                            {results.length > 0 && (
                                <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1">{results.length}</Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="matches" className="flex items-center gap-2">
                            <List className="h-4 w-4" />
                            Tüm Maçlar
                        </TabsTrigger>
                        <TabsTrigger value="bets" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Bahisler
                        </TabsTrigger>
                        <TabsTrigger value="livebot" className="flex items-center gap-2">
                            <Radio className="h-4 w-4" />
                            Canlı Bot
                            {liveSignals.length > 0 && (
                                <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1">{liveSignals.length}</Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="livehistory" className="flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Bot Geçmişi
                        </TabsTrigger>
                        <TabsTrigger value="mobile" className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            Mobil
                        </TabsTrigger>
                        <TabsTrigger value="training" className="flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            Training
                        </TabsTrigger>
                        <TabsTrigger value="users" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Kullanıcılar
                        </TabsTrigger>
                    </TabsList>

                    {/* ============ ANALYSIS TAB ============ */}
                    <TabsContent value="analysis" className="space-y-4">
                        <div className="flex flex-wrap gap-3 items-center">
                            <Button
                                onClick={() => runAnalysis(500, true)}
                                disabled={analysisLoading}
                                className="gradient-primary text-white shadow-glow-primary"
                            >
                                {analysisLoading ? (
                                    <><Activity className="mr-2 h-4 w-4 animate-spin" />Analiz Ediliyor...</>
                                ) : (
                                    <><Play className="mr-2 h-4 w-4" />Analizi Başlat (Filtreli)</>
                                )}
                            </Button>

                            <Button
                                onClick={() => runAnalysis(500, false)}
                                disabled={analysisLoading}
                                variant="outline"
                                className="border-primary/50 text-foreground hover:bg-primary/10"
                            >
                                {analysisLoading ? (
                                    <><Activity className="mr-2 h-4 w-4 animate-spin" />Analiz Ediliyor...</>
                                ) : (
                                    <><Play className="mr-2 h-4 w-4" />Analizi Başlat (Tüm Ligler)</>
                                )}
                            </Button>
                            {results.length > 0 && (
                                <>
                                    <Button variant="outline" onClick={copyAllPrompts}>
                                        <Copy className="mr-2 h-4 w-4" />Tüm AI Promptlar
                                    </Button>
                                    <Button variant="outline" onClick={copyAllRawStats}>
                                        <FileText className="mr-2 h-4 w-4" />Ham İstatistik
                                    </Button>
                                    <Select value={marketFilter} onValueChange={setMarketFilter}>
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue placeholder="Market Filtresi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tüm Marketler ({results.length})</SelectItem>
                                            {markets.map(m => (
                                                <SelectItem key={m} value={m}>{m} ({results.filter(r => r.marketKey === m).length})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </>
                            )}
                        </div>

                        {results.length === 0 ? (
                            <Card className="glass-card">
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <Target className="h-16 w-16 text-muted-foreground mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">Henüz Analiz Yapılmadı</h3>
                                    <p className="text-muted-foreground">"Analizi Başlat" butonuna tıklayın.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {filteredResults.map((item, index) => (
                                    <Card key={item.id} className="glass-card card-hover" style={{ animationDelay: `${index * 30}ms` }}>
                                        <CardHeader className="pb-2">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center">
                                                        <TrendingUp className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg">{item.homeTeam} vs {item.awayTeam}</CardTitle>
                                                        <CardDescription>{item.league}</CardDescription>
                                                    </div>
                                                </div>
                                                <Badge className="gradient-accent text-white w-fit">{item.market}</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                                                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                                                    <div className="text-lg font-bold text-primary">{item.stats?.leagueAvg?.toFixed(1) || '-'}</div>
                                                    <div className="text-xs text-muted-foreground">Lig Ort.</div>
                                                </div>
                                                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                                                    <div className="text-lg font-bold text-win">{item.stats?.homeForm?.over25Rate?.toFixed(0) || '-'}%</div>
                                                    <div className="text-xs text-muted-foreground">Ev O2.5</div>
                                                </div>
                                                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                                                    <div className="text-lg font-bold text-accent">{item.stats?.awayForm?.over25Rate?.toFixed(0) || '-'}%</div>
                                                    <div className="text-xs text-muted-foreground">Dep O2.5</div>
                                                </div>
                                                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                                                    <div className="text-lg font-bold">{item.stats?.homeHomeStats?.scoringRate?.toFixed(0) || '-'}%</div>
                                                    <div className="text-xs text-muted-foreground">Ev Gol%</div>
                                                </div>
                                                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                                                    <div className="text-lg font-bold">{item.stats?.awayAwayStats?.scoringRate?.toFixed(0) || '-'}%</div>
                                                    <div className="text-xs text-muted-foreground">Dep Gol%</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
                                                <Input
                                                    type="text"
                                                    placeholder="Oran"
                                                    className="w-24"
                                                    value={oddsInputs[item.id] || ''}
                                                    onChange={e => setOddsInputs({ ...oddsInputs, [item.id]: e.target.value })}
                                                />
                                                <Button variant="outline" size="sm" onClick={() => {
                                                    let prompt = item.aiPrompt;
                                                    if (oddsInputs[item.id]) {
                                                        prompt = prompt.replace(`Market: ${item.market}`, `Market: ${item.market}\nOdds: ${oddsInputs[item.id]}`);
                                                    }
                                                    copyToClipboard(prompt);
                                                }}>
                                                    <Copy className="mr-2 h-4 w-4" />AI Prompt
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => copyToClipboard(item.rawStats)}>
                                                    <FileText className="mr-2 h-4 w-4" />Ham İstatistik
                                                </Button>
                                                <Button size="sm" className="gradient-success text-white" onClick={() => approveBet(item)}>
                                                    <Check className="mr-2 h-4 w-4" />Onayla
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* ============ BETS TAB ============ */}
                    <TabsContent value="bets" className="space-y-4">
                        <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
                            <div className="flex gap-2 items-center">
                                <h3 className="font-semibold mr-2">Market Filtresi:</h3>
                                <Select value={betsFilter} onValueChange={setBetsFilter}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Tümü" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tümü</SelectItem>
                                        <SelectItem value="First Half Over 0.5">IY 0.5 Üst</SelectItem>
                                        <SelectItem value="Home Wins Either Half">Ev Sahibi İki Yarıdan Birini Kazanır</SelectItem>
                                        <SelectItem value="Match Winner Home">Maç Sonucu 1</SelectItem>
                                        <SelectItem value="Over 2.5 Goals">2.5 Üst</SelectItem>
                                        <SelectItem value="Over 1.5 Goals">1.5 Üst</SelectItem>
                                        <SelectItem value="Under 2.5 Goals">2.5 Alt</SelectItem>
                                        <SelectItem value="Under 3.5 Goals">3.5 Alt</SelectItem>
                                        <SelectItem value="BTTS">KG Var</SelectItem>
                                        {/* Combination Markets */}
                                        <SelectItem value="2X + Over 1.5">2X + 1.5 Üst</SelectItem>
                                        <SelectItem value="2X + Over 2.5">2X + 2.5 Üst</SelectItem>
                                        <SelectItem value="2X + Under 3.5">2X + 3.5 Alt</SelectItem>
                                        <SelectItem value="2X + Under 4.5">2X + 4.5 Alt</SelectItem>
                                        <SelectItem value="2X + Under 5.5">2X + 5.5 Alt</SelectItem>
                                        <SelectItem value="1X + Over 2.5">1X + 2.5 Üst</SelectItem>
                                        <SelectItem value="1X + Under 3.5">1X + 3.5 Alt</SelectItem>
                                        <SelectItem value="1X + Under 4.5">1X + 4.5 Alt</SelectItem>
                                        <SelectItem value="1X + Under 5.5">1X + 5.5 Alt</SelectItem>
                                        <SelectItem value="2 + Over 1.5">MS2 + 1.5 Üst</SelectItem>
                                        <SelectItem value="2 + Over 2.5">MS2 + 2.5 Üst</SelectItem>
                                        <SelectItem value="2 + Under 3.5">MS2 + 3.5 Alt</SelectItem>
                                        <SelectItem value="2 + Under 4.5">MS2 + 4.5 Alt</SelectItem>
                                        <SelectItem value="2 + Under 5.5">MS2 + 5.5 Alt</SelectItem>
                                        <SelectItem value="1 + Over 1.5">MS1 + 1.5 Üst</SelectItem>
                                        <SelectItem value="1 + Over 2.5">MS1 + 2.5 Üst</SelectItem>
                                        <SelectItem value="1 + Under 3.5">MS1 + 3.5 Alt</SelectItem>
                                        <SelectItem value="1 + Under 4.5">MS1 + 4.5 Alt</SelectItem>
                                        <SelectItem value="1 + Under 5.5">MS1 + 5.5 Alt</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-3">
                                <Button onClick={runSettlement} disabled={settling} className="gradient-primary text-white shadow-glow-primary">
                                    {settling ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Çalışıyor...</> : <><Play className="mr-2 h-4 w-4" />Settlement Çalıştır</>}
                                </Button>
                                <Button variant="outline" onClick={loadBets} disabled={betsLoading}>
                                    <RefreshCw className={`mr-2 h-4 w-4 ${betsLoading ? 'animate-spin' : ''}`} />Yenile
                                </Button>
                                <Button variant="secondary" onClick={async () => {
                                    const force = confirm('Zaman kısıtlamasını yoksayarak TÜM bekleyen bahisleri sonuçlandırmak istiyor musunuz? (Force Mode)');
                                    try {
                                        await fetch(`${API_BASE}/settlement/trigger`, {
                                            method: 'POST',
                                            headers: {
                                                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify({ force })
                                        });
                                        alert(`İşlem başlatıldı. ${force ? '(FORCE MODU AKTİF)' : ''} Logları kontrol edin.`);
                                        // Refresh after a delay
                                        setTimeout(loadBets, 3000);
                                    } catch (e) {
                                        alert('Hata oluştu');
                                    }
                                }}>
                                    <Play className="mr-2 h-4 w-4" /> {betsLoading ? 'İşleniyor...' : 'Sonuçlandır'}
                                </Button>
                            </div>
                        </div>

                        {/* Live Performance Stats */}
                        {betStats.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
                                {betStats.map(stat => (
                                    <Card key={stat.market} className="glass-card p-3 flex flex-col items-center justify-center border-t-2 border-t-primary/50">
                                        <div className="text-xs text-muted-foreground font-medium text-center mb-1 h-8 flex items-center">{stat.market}</div>
                                        <div className={`text-2xl font-bold ${stat.winRate >= 60 ? 'text-win' : stat.winRate >= 50 ? 'text-warning' : 'text-lose'}`}>
                                            %{stat.winRate}
                                        </div>
                                        <div className="text-xs flex gap-2 mt-1 opacity-70">
                                            <span className="text-win">{stat.won}W</span>
                                            <span className="text-lose">{stat.lost}L</span>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {bets.length === 0 ? (
                            <Card className="glass-card">
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <Target className="h-16 w-16 text-muted-foreground mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">Henüz Onaylanmış Bahis Yok</h3>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="glass-card overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Maç</TableHead>
                                            <TableHead>Market</TableHead>
                                            <TableHead>Oran</TableHead>
                                            <TableHead>Durum</TableHead>
                                            <TableHead>Sonuç</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {bets
                                            .filter(bet => betsFilter === 'all' || bet.market === betsFilter)
                                            .map(bet => (
                                                <TableRow key={bet.id}>
                                                    <TableCell className="font-medium">{bet.homeTeam} vs {bet.awayTeam}</TableCell>
                                                    <TableCell>{bet.market}</TableCell>
                                                    <TableCell>{bet.odds || '-'}</TableCell>
                                                    <TableCell>{getStatusBadge(bet.status)}</TableCell>
                                                    <TableCell>{bet.finalScore || '-'}</TableCell>
                                                    <TableCell className="flex gap-1">
                                                        <Button variant="outline" size="sm" onClick={() => addToMobile(bet)} className="text-primary">
                                                            <Smartphone className="h-4 w-4 mr-1" />Mobil
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => deleteBet(bet.id)} className="text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        )}
                    </TabsContent>

                    {/* ============ MOBILE TAB ============ */}
                    <TabsContent value="mobile" className="space-y-4">
                        <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
                            <h3 className="font-semibold">Mobil Uygulamadaki Bahisler</h3>
                            <Button variant="outline" onClick={loadMobileBets} disabled={mobileBetsLoading}>
                                <RefreshCw className={`mr-2 h-4 w-4 ${mobileBetsLoading ? 'animate-spin' : ''}`} />Yenile
                            </Button>
                        </div>

                        {mobileBets.length === 0 ? (
                            <Card className="glass-card">
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <Smartphone className="h-16 w-16 text-muted-foreground mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">Mobil'de Bahis Yok</h3>
                                    <p className="text-muted-foreground">Bahisler sekmesinden "Mobil" butonuna tıklayarak ekleyin.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="glass-card overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Maç</TableHead>
                                            <TableHead>Market</TableHead>
                                            <TableHead>Oran</TableHead>
                                            <TableHead>Durum</TableHead>
                                            <TableHead>Sonuç</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mobileBets.map(bet => (
                                            <TableRow key={bet.id}>
                                                <TableCell className="font-medium">{bet.homeTeam} vs {bet.awayTeam}</TableCell>
                                                <TableCell>{bet.market}</TableCell>
                                                <TableCell>{bet.odds || '-'}</TableCell>
                                                <TableCell>{getStatusBadge(bet.status)}</TableCell>
                                                <TableCell>{bet.finalScore || '-'}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => deleteMobileBet(bet.id)} className="text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        )}
                    </TabsContent>

                    {/* ============ TRAINING TAB ============ */}
                    <TabsContent value="training" className="space-y-4">
                        <div className="flex justify-end">
                            <Button variant="destructive" onClick={async () => {
                                if (!confirm('Tüm eğitim verilerini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;
                                try {
                                    const res = await fetch(`${API_BASE}/training`, {
                                        method: 'DELETE',
                                        headers: getAuthHeaders() as any
                                    });
                                    handleAuthError(res);
                                    const data = await safeJson(res);
                                    if (data.success) {
                                        toast.success('Training pool temizlendi');
                                        loadTraining();
                                    } else {
                                        toast.error(data.error || 'Hata oluştu');
                                    }
                                } catch (err: any) {
                                    toast.error(err.message);
                                }
                            }}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                İstatistikleri Sıfırla
                            </Button>
                        </div>

                        {trainingStats && (
                            <>
                                {/* Global Stats */}
                                <Card className="glass-card-premium mb-6">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-primary" />
                                            Genel Performans ({trainingStats.total} Bahis)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>Kazanma Oranı</span>
                                                    <span className="font-semibold text-win">{trainingStats.winRate}%</span>
                                                </div>
                                                <div className="h-4 bg-secondary rounded-full overflow-hidden flex">
                                                    <div className="h-full bg-win" style={{ width: `${(trainingStats.won / (trainingStats.total || 1)) * 100}%` }} />
                                                    <div className="h-full bg-lose" style={{ width: `${(trainingStats.lost / (trainingStats.total || 1)) * 100}%` }} />
                                                </div>
                                            </div>
                                            <div className="flex justify-center gap-6 text-sm">
                                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-win" /><span>Kazanan ({trainingStats.won})</span></div>
                                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-lose" /><span>Kaybeden ({trainingStats.lost})</span></div>
                                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-muted" /><span>İade ({trainingStats.refund})</span></div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Market Stats Grid */}
                                <h3 className="text-xl font-semibold mb-4 px-1">Market Performansı</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                    {trainingStats.byMarket?.map((m: any) => (
                                        <Card key={m.market} className="glass-card border-l-4 border-l-primary/50">
                                            <CardHeader className="pb-2 pt-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-base font-bold">{m.market}</CardTitle>
                                                        <CardDescription>{m.total} Bahis</CardDescription>
                                                    </div>
                                                    <Badge className={m.winRate >= 70 ? "bg-win text-white" : m.winRate >= 50 ? "bg-warning text-black" : "bg-lose text-white"}>
                                                        %{m.winRate}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pb-4">
                                                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                                    <div className="bg-win/10 p-2 rounded">
                                                        <div className="font-bold text-win">{m.won}</div>
                                                        <div className="text-xs opacity-70">W</div>
                                                    </div>
                                                    <div className="bg-lose/10 p-2 rounded">
                                                        <div className="font-bold text-lose">{m.lost}</div>
                                                        <div className="text-xs opacity-70">L</div>
                                                    </div>
                                                    <div className="bg-muted/10 p-2 rounded">
                                                        <div className="font-bold text-muted-foreground">{m.refund}</div>
                                                        <div className="text-xs opacity-70">R</div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </>
                        )}

                        {training.length === 0 ? (
                            <Card className="glass-card">
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <Brain className="h-16 w-16 text-muted-foreground mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">Training Pool Boş</h3>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="glass-card overflow-hidden">
                                <div className="p-4 border-b border-border">
                                    <h3 className="font-semibold">Son İşlemler</h3>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Maç</TableHead>
                                            <TableHead>Market</TableHead>
                                            <TableHead>Oran</TableHead>
                                            <TableHead>Sonuç</TableHead>
                                            <TableHead>Skor</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {training.map(item => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.match}</TableCell>
                                                <TableCell>{item.market}</TableCell>
                                                <TableCell>{item.odds || '-'}</TableCell>
                                                <TableCell>{getStatusBadge(item.result)}</TableCell>
                                                <TableCell>{item.final_score}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        )}
                    </TabsContent>

                    {/* ============ ALL MATCHES TAB ============ */}
                    <TabsContent value="matches" className="space-y-4">
                        <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
                            <span>Günlük Fikstür ({allMatches.length})</span>
                            <Button onClick={copyAllRawDetailedPrompts} disabled={allMatches.length === 0}>
                                <Copy className="mr-2 h-4 w-4" /> Detaylı İstatistikleri Kopyala
                            </Button>
                        </div>

                        {allMatches.length === 0 ? (
                            <Card className="glass-card">
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <h3 className="text-xl font-semibold mb-2">Henüz Analiz Yapılmadı</h3>
                                    <p className="text-muted-foreground">Analiz sekmesinden tarama başlatın.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {allMatches.map(match => (
                                    <Card key={match.matchId} className="glass-card">
                                        <CardContent className="p-4 grid grid-cols-12 gap-4 items-center">
                                            <div className="col-span-4">
                                                <div className="font-semibold text-lg flex items-center gap-2">
                                                    {match.homeTeam} <span className="text-muted-foreground text-sm">vs</span> {match.awayTeam}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {match.league} • {new Date(match.timestamp * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>

                                            <div className="col-span-3">
                                                <Select
                                                    value={rawMarketSelections[match.matchId] || ""}
                                                    onValueChange={(val) => setRawMarketSelections(prev => ({ ...prev, [match.matchId]: val }))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Market Seç" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="First Half Over 0.5">IY 0.5 Üst</SelectItem>
                                                        <SelectItem value="Home Wins Either Half">Ev İki Yarıdan Birini Kazanır</SelectItem>
                                                        <SelectItem value="Match Winner Home">Maç Sonucu 1</SelectItem>
                                                        <SelectItem value="Over 2.5 Goals">2.5 Üst</SelectItem>
                                                        <SelectItem value="Over 1.5 Goals">1.5 Üst</SelectItem>
                                                        <SelectItem value="Under 2.5 Goals">2.5 Alt</SelectItem>
                                                        <SelectItem value="Under 3.5 Goals">3.5 Alt</SelectItem>
                                                        <SelectItem value="Both Teams To Score">KG Var</SelectItem>
                                                        {/* Combination Markets */}
                                                        <SelectItem value="2X + Over 1.5">2X + 1.5 Üst</SelectItem>
                                                        <SelectItem value="2X + Over 2.5">2X + 2.5 Üst</SelectItem>
                                                        <SelectItem value="2X + Under 3.5">2X + 3.5 Alt</SelectItem>
                                                        <SelectItem value="2X + Under 4.5">2X + 4.5 Alt</SelectItem>
                                                        <SelectItem value="2X + Under 5.5">2X + 5.5 Alt</SelectItem>
                                                        <SelectItem value="1X + Over 2.5">1X + 2.5 Üst</SelectItem>
                                                        <SelectItem value="1X + Under 3.5">1X + 3.5 Alt</SelectItem>
                                                        <SelectItem value="1X + Under 4.5">1X + 4.5 Alt</SelectItem>
                                                        <SelectItem value="1X + Under 5.5">1X + 5.5 Alt</SelectItem>
                                                        <SelectItem value="2 + Over 1.5">MS2 + 1.5 Üst</SelectItem>
                                                        <SelectItem value="2 + Over 2.5">MS2 + 2.5 Üst</SelectItem>
                                                        <SelectItem value="2 + Under 3.5">MS2 + 3.5 Alt</SelectItem>
                                                        <SelectItem value="2 + Under 4.5">MS2 + 4.5 Alt</SelectItem>
                                                        <SelectItem value="2 + Under 5.5">MS2 + 5.5 Alt</SelectItem>
                                                        <SelectItem value="1 + Over 1.5">MS1 + 1.5 Üst</SelectItem>
                                                        <SelectItem value="1 + Over 2.5">MS1 + 2.5 Üst</SelectItem>
                                                        <SelectItem value="1 + Under 3.5">MS1 + 3.5 Alt</SelectItem>
                                                        <SelectItem value="1 + Under 4.5">MS1 + 4.5 Alt</SelectItem>
                                                        <SelectItem value="1 + Under 5.5">MS1 + 5.5 Alt</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="col-span-2">
                                                <Input
                                                    type="number"
                                                    placeholder="Oran"
                                                    value={rawOddsInputs[match.matchId] || ""}
                                                    onChange={(e) => setRawOddsInputs(prev => ({ ...prev, [match.matchId]: e.target.value }))}
                                                />
                                            </div>

                                            <div className="col-span-3 text-right">
                                                <Button onClick={() => approveRawMatch(match)}>
                                                    <CheckCircle className="mr-2 h-4 w-4" /> Onayla
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* ============ USERS TAB ============ */}
                    <TabsContent value="users" className="space-y-4">
                        <div className="flex justify-end">
                            <Button variant="outline" onClick={loadUsers} disabled={usersLoading}>
                                <RefreshCw className={`mr-2 h-4 w-4 ${usersLoading ? 'animate-spin' : ''}`} />Yenile
                            </Button>
                        </div>
                        <Card className="glass-card overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Rol</TableHead>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Kayıt Tarihi</TableHead>
                                        <TableHead>İşlem</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map(user => (
                                        <TableRow key={user.id}>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={user.role === 'admin' ? 'border-red-500/50 text-red-500' : ''}>
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={user.plan === 'pro' ? 'gradient-accent text-white' : 'bg-secondary'}>
                                                    {user.plan === 'pro' ? 'PRO' : 'FREE'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(user.created_at).toLocaleDateString('tr-TR')}
                                            </TableCell>
                                            <TableCell>
                                                {user.role !== 'admin' && (
                                                    <Button
                                                        size="sm"
                                                        variant={user.plan === 'pro' ? 'destructive' : 'default'}
                                                        className={user.plan === 'free' ? 'gradient-success text-white' : ''}
                                                        onClick={() => togglePlan(user.id, user.plan)}
                                                    >
                                                        {user.plan === 'pro' ? 'Pro İptal' : 'Pro Yap'}
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    {/* ============ LIVE BOT TAB ============ */}
                    <TabsContent value="livebot" className="space-y-4">
                        <div className="flex flex-wrap gap-3 items-center">
                            {/* Start/Stop Buttons */}
                            {liveStatus.isRunning ? (
                                <Button onClick={stopLiveBot} disabled={liveLoading} variant="destructive">
                                    {liveLoading ? (
                                        <><Activity className="mr-2 h-4 w-4 animate-spin" />İşleniyor...</>
                                    ) : (
                                        <><XCircle className="mr-2 h-4 w-4" />Botu Durdur</>
                                    )}
                                </Button>
                            ) : (
                                <>
                                    <Button onClick={() => startLiveBot(true)} disabled={liveLoading} className="gradient-success text-white">
                                        {liveLoading ? (
                                            <><Activity className="mr-2 h-4 w-4 animate-spin" />İşleniyor...</>
                                        ) : (
                                            <><Play className="mr-2 h-4 w-4" />Filtreli Başlat</>
                                        )}
                                    </Button>
                                    <Button onClick={() => startLiveBot(false)} disabled={liveLoading} variant="outline">
                                        {liveLoading ? (
                                            <><Activity className="mr-2 h-4 w-4 animate-spin" />İşleniyor...</>
                                        ) : (
                                            <><Play className="mr-2 h-4 w-4" />Tüm Ligler</>
                                        )}
                                    </Button>
                                </>
                            )}

                            <Button onClick={runManualScan} disabled={liveLoading || !liveStatus.isRunning} variant="outline">
                                <Play className="mr-2 h-4 w-4" />Manuel Tarama
                            </Button>
                            <Button variant="outline" onClick={() => { loadLiveSignals(); loadLiveHistory(); loadDeadStatus(); }}>
                                <RefreshCw className="mr-2 h-4 w-4" />Yenile
                            </Button>
                            <div className="flex items-center gap-2 ml-auto">
                                <Badge className={liveStatus.isRunning ? 'bg-win' : 'bg-lose'}>
                                    {liveStatus.isRunning
                                        ? `⚽ Momentum ${liveStatus.useLeagueFilter ? '(Filtreli)' : '(Tüm)'}`
                                        : '⚽ Durdu'}
                                </Badge>
                                {liveStatus.lastScanTime && (
                                    <span className="text-sm text-muted-foreground">
                                        Son: {new Date(liveStatus.lastScanTime).toLocaleTimeString('tr-TR')}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Dead Match Bot Controls */}
                        <div className="flex flex-wrap gap-3 items-center p-3 bg-secondary/30 rounded-lg">
                            <span className="font-medium">📉 Dead Match Bot:</span>
                            {deadStatus.isRunning ? (
                                <Button onClick={stopDeadBot} disabled={deadLoading} variant="destructive" size="sm">
                                    {deadLoading ? (
                                        <><Activity className="mr-2 h-4 w-4 animate-spin" />İşleniyor...</>
                                    ) : (
                                        <><XCircle className="mr-2 h-4 w-4" />Durdur</>
                                    )}
                                </Button>
                            ) : (
                                <>
                                    <Button onClick={() => startDeadBot(true)} disabled={deadLoading} className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                                        {deadLoading ? (
                                            <><Activity className="mr-2 h-4 w-4 animate-spin" />...</>
                                        ) : (
                                            <><Play className="mr-2 h-4 w-4" />Filtreli</>
                                        )}
                                    </Button>
                                    <Button onClick={() => startDeadBot(false)} disabled={deadLoading} variant="outline" size="sm">
                                        {deadLoading ? (
                                            <><Activity className="mr-2 h-4 w-4 animate-spin" />...</>
                                        ) : (
                                            <><Play className="mr-2 h-4 w-4" />Tüm Ligler</>
                                        )}
                                    </Button>
                                </>
                            )}
                            <Badge className={deadStatus.isRunning ? 'bg-blue-600' : 'bg-gray-500'}>
                                {deadStatus.isRunning
                                    ? `💤 Aktif ${deadStatus.useLeagueFilter ? '(Filtreli)' : '(Tüm)'}`
                                    : '💤 Durdu'}
                            </Badge>
                        </div>

                        {liveSignals.length === 0 ? (
                            <Card className="glass-card">
                                <CardContent className="p-8 text-center">
                                    <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">Aktif sinyal yok</p>
                                    <p className="text-sm text-muted-foreground mt-2">Bot her 3 dakikada bir canlı maçları tarar</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {liveSignals.map((signal) => (
                                    <Card key={signal.id} className="glass-card card-hover">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-lg">{signal.home} vs {signal.away}</CardTitle>
                                                    <CardDescription>{signal.league}</CardDescription>
                                                </div>
                                                <Badge className="gradient-accent text-white">{signal.strategy}</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-4 gap-3">
                                                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                                                    <div className="text-lg font-bold">{signal.entryScore}</div>
                                                    <div className="text-xs text-muted-foreground">Skor</div>
                                                </div>
                                                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                                                    <div className="text-lg font-bold text-primary">{signal.confidence}%</div>
                                                    <div className="text-xs text-muted-foreground">Güven</div>
                                                </div>
                                                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                                                    <div className="text-lg font-bold">{signal.stats?.shots || '-'}</div>
                                                    <div className="text-xs text-muted-foreground">Shots</div>
                                                </div>
                                                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                                                    <div className="text-lg font-bold">{signal.stats?.corners || '-'}</div>
                                                    <div className="text-xs text-muted-foreground">Corners</div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-3">{signal.reason}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* ============ LIVE HISTORY TAB ============ */}
                    <TabsContent value="livehistory" className="space-y-4">
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="h-5 w-5" />
                                    Canlı Bot Geçmişi
                                </CardTitle>
                                <CardDescription>Otomatik settlement: 1 saat sonra skor değiştiyse WON</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Maç</TableHead>
                                            <TableHead>Strateji</TableHead>
                                            <TableHead>Giriş Skoru</TableHead>
                                            <TableHead>Final Skor</TableHead>
                                            <TableHead>Güven</TableHead>
                                            <TableHead>Sonuç</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {liveHistory.map((signal) => (
                                            <TableRow key={signal.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{signal.home} vs {signal.away}</div>
                                                        <div className="text-xs text-muted-foreground">{signal.league}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{signal.strategyCode}</Badge>
                                                </TableCell>
                                                <TableCell>{signal.entryScore}</TableCell>
                                                <TableCell>{signal.finalScore || '-'}</TableCell>
                                                <TableCell>{signal.confidence}%</TableCell>
                                                <TableCell>{getStatusBadge(signal.status)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ============ USERS TAB ============ */}
                    <TabsContent value="users" className="space-y-4">
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Kullanıcı Yönetimi
                                </CardTitle>
                                <CardDescription>Kullanıcıları görüntüle ve PRO durumunu değiştir</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-end mb-4">
                                    <Button onClick={loadUsers} disabled={usersLoading} variant="outline">
                                        <RefreshCw className={`mr-2 h-4 w-4 ${usersLoading ? 'animate-spin' : ''}`} />
                                        Yenile
                                    </Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Rol</TableHead>
                                            <TableHead>Plan</TableHead>
                                            <TableHead>PRO Durum</TableHead>
                                            <TableHead>Kayıt Tarihi</TableHead>
                                            <TableHead>İşlem</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                        {user.role === 'admin' ? <Shield className="mr-1 h-3 w-3" /> : null}
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{user.plan}</TableCell>
                                                <TableCell>
                                                    {user.isPremium || user.is_premium === 1 ? (
                                                        <Badge className="bg-primary text-white">
                                                            <Zap className="mr-1 h-3 w-3" />
                                                            PRO
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline">FREE</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR') : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant={user.isPremium || user.is_premium === 1 ? "destructive" : "default"}
                                                        onClick={() => togglePremium(user.id, user.isPremium || user.is_premium === 1)}
                                                    >
                                                        {user.isPremium || user.is_premium === 1 ? 'PRO Kaldır' : 'PRO Yap'}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {users.length === 0 && !usersLoading && (
                                    <p className="text-center text-muted-foreground py-8">Henüz kullanıcı yok</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
};

export default AdminPanel;

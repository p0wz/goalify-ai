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
    History,
    UploadCloud
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
    const [premierLeagueMatches, setPremierLeagueMatches] = useState<RawMatch[]>([]);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [plLoading, setPlLoading] = useState(false);
    const [marketFilter, setMarketFilter] = useState("all");
    const [oddsInputs, setOddsInputs] = useState<Record<string, string>>({});

    // Live Scores State
    const [liveScores, setLiveScores] = useState<any[]>([]);
    const [liveScoresLoading, setLiveScoresLoading] = useState(false);

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

    // AI Debug State
    const [debugData, setDebugData] = useState<any>(null);
    const [debugLoading, setDebugLoading] = useState(false);

    // Published Matches State (for Analiz tab)
    const [publishedMatchIds, setPublishedMatchIds] = useState<Set<string>>(new Set());


    // Load data on mount
    useEffect(() => {
        loadCachedAnalysis();
        loadBets();
        loadTraining();
        loadUsers();
        loadMobileBets();
        loadLiveSignals();
        loadLiveHistory();
    }, []);

    // Poll live data every 60s
    useEffect(() => {
        const interval = setInterval(() => {
            loadLiveSignals();
            loadLiveHistory();
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    // Etsy Publish State
    const [isPublishing, setIsPublishing] = useState(false);
    const [lastPublished, setLastPublished] = useState<string | null>(null);

    // ============ PUBLISH TO ANALIZ TAB ============

    const publishMatchToAnaliz = async (match: RawMatch) => {
        try {
            const res = await fetch(`${API_BASE}/matches/publish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    matchId: match.matchId,
                    homeTeam: match.homeTeam,
                    awayTeam: match.awayTeam,
                    league: match.league,
                    timestamp: match.timestamp,
                    stats: match.stats
                })
            });
            handleAuthError(res);
            const data = await safeJson(res);
            if (data.success) {
                setPublishedMatchIds(prev => new Set([...prev, match.matchId]));
                if (data.duplicate) {
                    toast.info('Bu maç zaten yayınlanmış');
                } else {
                    toast.success(`Yayınlandı: ${match.homeTeam} vs ${match.awayTeam}`);
                }
            } else {
                toast.error(data.error || 'Yayınlama hatası');
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const publishAllMatches = async () => {
        for (const match of allMatches) {
            if (!publishedMatchIds.has(match.matchId)) {
                await publishMatchToAnaliz(match);
            }
        }
        toast.success('Tüm maçlar yayınlandı!');
    };

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

    // Publish stats to public endpoint for Google Sheets (Etsy product)
    const publishToEtsy = async () => {
        setIsPublishing(true);
        try {
            const res = await fetch(`${API_BASE}/stats/publish`, {
                method: 'POST',
                headers: { ...getAuthHeaders() as any }
            });
            handleAuthError(res);
            const data = await safeJson(res);
            if (data.success) {
                setLastPublished(data.publishedAt);
                toast.success(`✅ ${data.message} - Sheets için yayınlandı!`);
            } else {
                toast.error(data.error || 'Yayınlama başarısız');
            }
        } catch (err: any) {
            toast.error('Publish error: ' + err.message);
        }
        setIsPublishing(false);
    };

    const runAnalysis = async (limit: number = 500, leagueFilter: boolean = true, noCupFilter: boolean = false) => {
        setAnalysisLoading(true);
        try {
            const res = await fetch(`${API_BASE}/analysis/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ limit, leagueFilter, noCupFilter })
            });
            handleAuthError(res);
            const data = await safeJson(res);
            if (data.success) {
                setResults(data.results);
                setAllMatches(data.allMatches || []);
                const noCupLabel = noCupFilter ? ' (kupassız)' : '';
                toast.success(`${data.count} aday bulundu! (${data.totalMatches || 0} toplam maç${noCupLabel})`);
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

    // ============ PREMIER LEAGUE ANALYSIS ============

    const runPremierLeagueAnalysis = async () => {
        setPlLoading(true);
        try {
            const res = await fetch(`${API_BASE}/analysis/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ limit: 500, leagueFilter: true, specificLeague: 'Premier League' })
            });
            handleAuthError(res);
            const data = await safeJson(res);
            if (data.success) {
                // Filter only Premier League and FA Cup matches
                const plMatches = (data.allMatches || []).filter((m: RawMatch) =>
                    m.league.toLowerCase().includes('premier league') ||
                    m.league.toLowerCase().includes('fa cup') ||
                    m.league.toLowerCase().includes('england') ||
                    m.league === 'Premier League'
                );
                setPremierLeagueMatches(plMatches);
                toast.success(`${plMatches.length} Premier League / FA Cup maçı bulundu!`);
            } else {
                toast.error(data.error || 'Analiz hatası');
            }
        } catch (err: any) {
            toast.error(err.message);
        }
        setPlLoading(false);
    };

    const copyAllPremierLeaguePrompts = () => {
        const text = premierLeagueMatches.map(m => m.detailedStats).join('\n\n---\n\n');
        copyToClipboard(text);
    };

    // ============ LIVE SCORES FUNCTIONS ============

    const fetchLiveScores = async (useLeagueFilter: boolean = false) => {
        setLiveScoresLoading(true);
        try {
            const res = await fetch(`${API_BASE}/live/current-matches`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ leagueFilter: useLeagueFilter })
            });
            handleAuthError(res);
            const data = await safeJson(res);
            if (data.success) {
                setLiveScores(data.matches || []);
                toast.success(`${data.count || 0} canlı maç bulundu!`);
            } else {
                toast.error(data.error || 'Canlı maç alınamadı');
            }
        } catch (err: any) {
            toast.error(err.message);
        }
        setLiveScoresLoading(false);
    };

    const copyAllLiveScores = () => {
        const text = liveScores.map(m =>
            `${m.homeTeam} ${m.homeScore} - ${m.awayScore} ${m.awayTeam} (${m.minute}) | ${m.league}`
        ).join('\n');
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
            handleAuthError(res);
            const data = await safeJson(res);
            if (data.signals) {
                setLiveHistory(data.signals);
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
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
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

    // ============ AI DEBUG SCAN ============
    const runDebugScan = async () => {
        setDebugLoading(true);
        setDebugData(null);
        try {
            const res = await fetch(`${API_BASE}/live/debug-scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
            });
            if (!res.ok) throw new Error('Debug scan failed');
            const data = await safeJson(res);
            setDebugData(data);
            if (data.success) {
                toast.success(`${data.matchCount} maç analiz edildi!`);
            } else {
                toast.error(data.error || 'Tarama başarısız');
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setDebugLoading(false);
        }
    };

    const copyDebugPrompt = () => {
        if (debugData?.prompt) {
            navigator.clipboard.writeText(debugData.prompt);
            toast.success('AI Prompt kopyalandı!');
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
                    <TabsList className="grid w-full grid-cols-11">
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
                        <TabsTrigger value="livescores" className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Canlı Maçlar
                            {liveScores.length > 0 && (
                                <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1">{liveScores.length}</Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="premierleague" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Premier Lig
                            {premierLeagueMatches.length > 0 && (
                                <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1">{premierLeagueMatches.length}</Badge>
                            )}
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
                        <TabsTrigger value="aidebug" className="flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            AI Debug
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

                            <Button
                                onClick={publishToEtsy}
                                disabled={isPublishing || results.length === 0}
                                variant="outline"
                                className="border-green-500/50 text-green-500 hover:bg-green-500/10"
                            >
                                {isPublishing ? (
                                    <><Activity className="mr-2 h-4 w-4 animate-spin" />Yayınlanıyor...</>
                                ) : (
                                    <><UploadCloud className="mr-2 h-4 w-4" />Google Sheets'e Yayınla</>
                                )}
                            </Button>
                            {lastPublished && <span className="text-xs text-muted-foreground">Son: {new Date(lastPublished).toLocaleTimeString()}</span>}

                            <Button
                                onClick={runPremierLeagueAnalysis}
                                disabled={plLoading}
                                variant="outline"
                                className="border-blue-500/50 text-blue-500 hover:bg-blue-500/10"
                            >
                                {plLoading ? (
                                    <><Activity className="mr-2 h-4 w-4 animate-spin" />PL Taranıyor...</>
                                ) : (
                                    <><Shield className="mr-2 h-4 w-4" />Premier League Tara</>
                                )}
                            </Button>

                            <Button
                                onClick={() => runAnalysis(500, true, true)}
                                disabled={analysisLoading}
                                variant="outline"
                                className="border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
                            >
                                {analysisLoading ? (
                                    <><Activity className="mr-2 h-4 w-4 animate-spin" />Analiz Ediliyor...</>
                                ) : (
                                    <><Target className="mr-2 h-4 w-4" />Kupassız Analiz</>
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
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={publishAllMatches} disabled={allMatches.length === 0}>
                                    <UploadCloud className="mr-2 h-4 w-4" /> Tümünü Yayınla
                                </Button>
                                <Button onClick={copyAllRawDetailedPrompts} disabled={allMatches.length === 0}>
                                    <Copy className="mr-2 h-4 w-4" /> Detaylı İstatistikleri Kopyala
                                </Button>
                            </div>
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
                                                    <SelectContent className="max-h-80">
                                                        {/* === OVER/UNDER === */}
                                                        <SelectItem value="Over 0.5 Goals">0.5 Üst</SelectItem>
                                                        <SelectItem value="Over 1.5 Goals">1.5 Üst</SelectItem>
                                                        <SelectItem value="Over 2.5 Goals">2.5 Üst</SelectItem>
                                                        <SelectItem value="Over 3.5 Goals">3.5 Üst</SelectItem>
                                                        <SelectItem value="Over 4.5 Goals">4.5 Üst</SelectItem>
                                                        <SelectItem value="Under 1.5 Goals">1.5 Alt</SelectItem>
                                                        <SelectItem value="Under 2.5 Goals">2.5 Alt</SelectItem>
                                                        <SelectItem value="Under 3.5 Goals">3.5 Alt</SelectItem>
                                                        <SelectItem value="Under 4.5 Goals">4.5 Alt</SelectItem>

                                                        {/* === 1X2 & DOUBLE CHANCE === */}
                                                        <SelectItem value="Match Winner Home">MS1 (Ev Kazanır)</SelectItem>
                                                        <SelectItem value="Match Winner Away">MS2 (Dep Kazanır)</SelectItem>
                                                        <SelectItem value="Draw">Berabere (X)</SelectItem>
                                                        <SelectItem value="1X">1X (Ev veya Berabere)</SelectItem>
                                                        <SelectItem value="X2">X2 (Dep veya Berabere)</SelectItem>
                                                        <SelectItem value="12">12 (Gol Olur)</SelectItem>

                                                        {/* === DNB (DRAW NO BET) === */}
                                                        <SelectItem value="Home DNB">Ev DNB</SelectItem>
                                                        <SelectItem value="Away DNB">Dep DNB</SelectItem>

                                                        {/* === BTTS === */}
                                                        <SelectItem value="Both Teams To Score">KG Var</SelectItem>
                                                        <SelectItem value="BTTS No">KG Yok</SelectItem>
                                                        <SelectItem value="BTTS + Over 2.5">KG Var + 2.5 Üst</SelectItem>

                                                        {/* === TEAM GOALS === */}
                                                        <SelectItem value="Home Over 0.5">Ev 0.5 Üst</SelectItem>
                                                        <SelectItem value="Home Over 1.5">Ev 1.5 Üst</SelectItem>
                                                        <SelectItem value="Away Over 0.5">Dep 0.5 Üst</SelectItem>
                                                        <SelectItem value="Away Over 1.5">Dep 1.5 Üst</SelectItem>

                                                        {/* === FIRST HALF === */}
                                                        <SelectItem value="First Half Over 0.5">IY 0.5 Üst</SelectItem>
                                                        <SelectItem value="First Half Over 1.5">IY 1.5 Üst</SelectItem>
                                                        <SelectItem value="First Half Under 0.5">IY 0.5 Alt</SelectItem>

                                                        {/* === SECOND HALF === */}
                                                        <SelectItem value="2H Over 0.5">2Y 0.5 Üst</SelectItem>
                                                        <SelectItem value="2H Over 1.5">2Y 1.5 Üst</SelectItem>

                                                        {/* === HALF WINNERS === */}
                                                        <SelectItem value="Home Wins Either Half">Ev Yarı Kazanır</SelectItem>
                                                        <SelectItem value="Away Wins Either Half">Dep Yarı Kazanır</SelectItem>

                                                        {/* === HANDICAP === */}
                                                        <SelectItem value="Hnd. Home -1.5">Handikap MS1 (-1.5)</SelectItem>
                                                        <SelectItem value="Hnd. Away -1.5">Handikap MS2 (-1.5)</SelectItem>

                                                        {/* === 1X COMBINATIONS === */}
                                                        <SelectItem value="1X + Over 1.5">1X + 1.5 Üst</SelectItem>
                                                        <SelectItem value="1X + Over 2.5">1X + 2.5 Üst</SelectItem>
                                                        <SelectItem value="1X + Under 3.5">1X + 3.5 Alt</SelectItem>
                                                        <SelectItem value="1X + Under 4.5">1X + 4.5 Alt</SelectItem>
                                                        <SelectItem value="1X + Under 5.5">1X + 5.5 Alt</SelectItem>

                                                        {/* === 2X COMBINATIONS === */}
                                                        <SelectItem value="2X + Over 1.5">2X + 1.5 Üst</SelectItem>
                                                        <SelectItem value="2X + Over 2.5">2X + 2.5 Üst</SelectItem>
                                                        <SelectItem value="2X + Under 3.5">2X + 3.5 Alt</SelectItem>
                                                        <SelectItem value="2X + Under 4.5">2X + 4.5 Alt</SelectItem>
                                                        <SelectItem value="2X + Under 5.5">2X + 5.5 Alt</SelectItem>

                                                        {/* === MS1 COMBINATIONS === */}
                                                        <SelectItem value="1 + Over 1.5">MS1 + 1.5 Üst</SelectItem>
                                                        <SelectItem value="1 + Over 2.5">MS1 + 2.5 Üst</SelectItem>
                                                        <SelectItem value="1 + Under 3.5">MS1 + 3.5 Alt</SelectItem>
                                                        <SelectItem value="1 + Under 4.5">MS1 + 4.5 Alt</SelectItem>
                                                        <SelectItem value="1 + Under 5.5">MS1 + 5.5 Alt</SelectItem>

                                                        {/* === MS2 COMBINATIONS === */}
                                                        <SelectItem value="2 + Over 1.5">MS2 + 1.5 Üst</SelectItem>
                                                        <SelectItem value="2 + Over 2.5">MS2 + 2.5 Üst</SelectItem>
                                                        <SelectItem value="2 + Under 3.5">MS2 + 3.5 Alt</SelectItem>
                                                        <SelectItem value="2 + Under 4.5">MS2 + 4.5 Alt</SelectItem>
                                                        <SelectItem value="2 + Under 5.5">MS2 + 5.5 Alt</SelectItem>
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

                                            <div className="col-span-3 text-right flex gap-2 justify-end">
                                                <Button
                                                    variant="outline"
                                                    className={publishedMatchIds.has(match.matchId) ? 'border-green-500 text-green-500' : ''}
                                                    onClick={() => publishMatchToAnaliz(match)}
                                                    disabled={publishedMatchIds.has(match.matchId)}
                                                >
                                                    {publishedMatchIds.has(match.matchId) ? (
                                                        <><CheckCircle className="mr-2 h-4 w-4" /> Yayında</>
                                                    ) : (
                                                        <><UploadCloud className="mr-2 h-4 w-4" /> Yayınla</>
                                                    )}
                                                </Button>
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

                    {/* ============ LIVE SCORES TAB ============ */}
                    <TabsContent value="livescores" className="space-y-4">
                        <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <Activity className="h-6 w-6 text-green-500" />
                                <span className="font-semibold">Canlı Maçlar ({liveScores.length})</span>
                                <Badge variant="secondary" className="text-xs">v2.2</Badge>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => fetchLiveScores(true)}
                                    disabled={liveScoresLoading}
                                    variant="outline"
                                    className="border-green-500/50 text-green-500 hover:bg-green-500/10"
                                >
                                    {liveScoresLoading ? (
                                        <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Yükleniyor...</>
                                    ) : (
                                        <><Play className="mr-2 h-4 w-4" />Lig Filtreli</>
                                    )}
                                </Button>
                                <Button
                                    onClick={() => fetchLiveScores(false)}
                                    disabled={liveScoresLoading}
                                    variant="outline"
                                >
                                    {liveScoresLoading ? (
                                        <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Yükleniyor...</>
                                    ) : (
                                        <><Play className="mr-2 h-4 w-4" />Tüm Ligler</>
                                    )}
                                </Button>
                                <Button
                                    onClick={copyAllLiveScores}
                                    disabled={liveScores.length === 0}
                                    className="gradient-primary text-white"
                                >
                                    <Copy className="mr-2 h-4 w-4" /> Toplu Kopyala
                                </Button>
                            </div>
                        </div>

                        {liveScores.length === 0 ? (
                            <Card className="glass-card">
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <Activity className="h-16 w-16 text-muted-foreground mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">Henüz Canlı Maç Çekilmedi</h3>
                                    <p className="text-muted-foreground mb-4">"Lig Filtreli" veya "Tüm Ligler" butonuna tıklayın.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="glass-card overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">Dakika</TableHead>
                                            <TableHead>Ev Sahibi</TableHead>
                                            <TableHead className="text-center w-[100px]">Skor</TableHead>
                                            <TableHead>Deplasman</TableHead>
                                            <TableHead>Lig</TableHead>
                                            <TableHead className="w-[80px]">İY</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {liveScores.map((match, index) => (
                                            <TableRow key={match.matchId || index}>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                                                        {match.minute}'
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">{match.homeTeam}</TableCell>
                                                <TableCell className="text-center">
                                                    <span className="text-lg font-bold">
                                                        {(match.homeScore !== undefined && match.homeScore !== null) ? match.homeScore : '-'} - {(match.awayScore !== undefined && match.awayScore !== null) ? match.awayScore : '-'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="font-medium">{match.awayTeam}</TableCell>
                                                <TableCell className="text-muted-foreground text-sm">{match.league}</TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {match.htHome !== null ? `${match.htHome}-${match.htAway}` : '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        )}

                        {/* DEBUG: Raw Data Dump */}
                        {liveScores.length > 0 && (
                            <div className="mt-4 p-4 bg-black/50 rounded border border-red-500/30 font-mono text-xs overflow-x-auto text-red-300">
                                <p className="mb-2 font-bold text-red-400">🔥 DEBUG DATA (ilk maç):</p>
                                <pre>{JSON.stringify(liveScores[0], null, 2)}</pre>
                            </div>
                        )}
                    </TabsContent>

                    {/* ============ PREMIER LEAGUE TAB ============ */}
                    <TabsContent value="premierleague" className="space-y-4">
                        <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <Shield className="h-6 w-6 text-blue-500" />
                                <span className="font-semibold">Premier League Maçları ({premierLeagueMatches.length})</span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={runPremierLeagueAnalysis}
                                    disabled={plLoading}
                                    variant="outline"
                                    className="border-blue-500/50 text-blue-500 hover:bg-blue-500/10"
                                >
                                    {plLoading ? (
                                        <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Taranıyor...</>
                                    ) : (
                                        <><RefreshCw className="mr-2 h-4 w-4" />Yenile</>
                                    )}
                                </Button>
                                <Button
                                    onClick={copyAllPremierLeaguePrompts}
                                    disabled={premierLeagueMatches.length === 0}
                                    className="gradient-primary text-white"
                                >
                                    <Copy className="mr-2 h-4 w-4" /> Tüm Promptları Kopyala
                                </Button>
                            </div>
                        </div>

                        {premierLeagueMatches.length === 0 ? (
                            <Card className="glass-card">
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">Henüz Premier League Taranmadı</h3>
                                    <p className="text-muted-foreground mb-4">Analiz sekmesinden "Premier League Tara" butonuna tıklayın.</p>
                                    <Button onClick={runPremierLeagueAnalysis} disabled={plLoading} className="gradient-primary text-white">
                                        <Play className="mr-2 h-4 w-4" /> Premier League Tara
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {premierLeagueMatches.map((match, index) => (
                                    <Card key={match.matchId} className="glass-card card-hover" style={{ animationDelay: `${index * 30}ms` }}>
                                        <CardContent className="p-4">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="font-semibold text-lg flex items-center gap-2">
                                                        <Badge className="bg-blue-500 text-white">PL</Badge>
                                                        {match.homeTeam} <span className="text-muted-foreground text-sm">vs</span> {match.awayTeam}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        {match.league} • {new Date(match.timestamp * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(match.detailedStats)}
                                                    >
                                                        <Copy className="mr-2 h-4 w-4" /> Prompt Kopyala
                                                    </Button>
                                                </div>
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
                            <Button variant="outline" onClick={() => { loadLiveSignals(); loadLiveHistory(); }}>
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
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <CardTitle className="flex items-center gap-2">
                                            <History className="h-5 w-5" />
                                            Canlı Bot Geçmişi
                                        </CardTitle>
                                        <CardDescription>Otomatik settlement: 1 saat sonra skor değiştiyse WON</CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={loadLiveHistory}>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Yenile
                                    </Button>
                                </div>
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

                    {/* ============ AI DEBUG TAB ============ */}
                    <TabsContent value="aidebug" className="space-y-4">
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-primary" />
                                    AI Debug Scanner
                                </CardTitle>
                                <CardDescription>
                                    Tüm canlı maçları tarayarak detaylı AI analizi için prompt oluştur
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-3 items-center">
                                    <Button
                                        onClick={runDebugScan}
                                        disabled={debugLoading}
                                        className="gradient-primary text-white shadow-glow-primary"
                                    >
                                        {debugLoading ? (
                                            <><Activity className="mr-2 h-4 w-4 animate-spin" />Taranıyor...</>
                                        ) : (
                                            <><Play className="mr-2 h-4 w-4" />Tarama Başlat</>
                                        )}
                                    </Button>
                                    {debugData?.matchCount && (
                                        <Badge variant="secondary" className="text-sm">
                                            {debugData.matchCount} maç analiz edildi
                                        </Badge>
                                    )}
                                </div>

                                {debugData?.prompt && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-medium">AI Prompt (Kopyalanabilir)</h4>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={copyDebugPrompt}
                                                className="gap-2"
                                            >
                                                <Copy className="h-4 w-4" />
                                                Kopyala
                                            </Button>
                                        </div>
                                        <textarea
                                            readOnly
                                            value={debugData.prompt}
                                            className="w-full h-96 p-4 bg-muted/50 rounded-lg text-sm font-mono resize-none border border-border"
                                        />
                                    </div>
                                )}

                                {debugData?.matches?.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium">Maç Listesi ({debugData.matches.length})</h4>
                                        <div className="max-h-64 overflow-y-auto space-y-2">
                                            {debugData.matches.map((m: any, idx: number) => (
                                                <div key={idx} className="p-2 bg-muted/30 rounded text-sm flex justify-between items-center">
                                                    <span>{m.home} vs {m.away} ({m.score}, {m.elapsed}')</span>
                                                    <div className="flex gap-2">
                                                        {m.allFiltersPassed ? (
                                                            <Badge className="bg-win text-white">✓ Passed</Badge>
                                                        ) : (
                                                            <Badge variant="secondary">✗ Filtered</Badge>
                                                        )}
                                                        {m.topMarket && (
                                                            <Badge variant="outline">{m.topMarket.name} ({m.topMarket.confidence}%)</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
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

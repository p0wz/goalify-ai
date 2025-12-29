import { useState, useEffect } from "react";
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
    Zap
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

interface ApprovedBet {
    id: string;
    match_id: string;
    home_team: string;
    away_team: string;
    league: string;
    market: string;
    odds: string;
    status: string;
    final_score: string;
    approved_at: string;
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

const AdminPanel = () => {
    // Analysis State
    const [results, setResults] = useState<AnalysisResult[]>([]);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [marketFilter, setMarketFilter] = useState("all");
    const [oddsInputs, setOddsInputs] = useState<Record<string, string>>({});

    // Approved Bets State
    const [bets, setBets] = useState<ApprovedBet[]>([]);
    const [betsLoading, setBetsLoading] = useState(false);
    const [settling, setSettling] = useState(false);

    // Training Pool State
    const [training, setTraining] = useState<TrainingEntry[]>([]);
    const [trainingStats, setTrainingStats] = useState<any>(null);


    // Load data on mount
    useEffect(() => {
        loadCachedAnalysis();
        loadBets();
        loadTraining();
    }, []);

    // ============ ANALYSIS FUNCTIONS ============

    const loadCachedAnalysis = async () => {
        setAnalysisLoading(true);
        try {
            const res = await fetch(`${API_BASE}/analysis/results`);
            const data = await safeJson(res);
            if (data.success && data.results && data.results.length > 0) {
                setResults(data.results);
                toast.success(`${data.results.length} analiz önbellekten yüklendi`);
            }
        } catch (err: any) {
            console.error('Cache load error:', err);
        }
        setAnalysisLoading(false);
    };

    const runAnalysis = async () => {
        setAnalysisLoading(true);
        try {
            const res = await fetch(`${API_BASE}/analysis/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ limit: 50, leagueFilter: true })
            });
            const data = await safeJson(res);
            if (data.success) {
                setResults(data.results);
                toast.success(`${data.count} aday bulundu!`);
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
                headers: { 'Content-Type': 'application/json' },
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

    // ============ BETS FUNCTIONS ============

    const loadBets = async () => {
        setBetsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/bets/approved`);
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
            const res = await fetch(`${API_BASE}/settlement/run`, { method: 'POST' });
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
            const res = await fetch(`${API_BASE}/bets/${id}`, { method: 'DELETE' });
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
                fetch(`${API_BASE}/training/all`),
                fetch(`${API_BASE}/training/stats`)
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
                <Tabs defaultValue="analysis" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="analysis" className="flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Analiz
                        </TabsTrigger>
                        <TabsTrigger value="bets" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Bahisler
                        </TabsTrigger>
                        <TabsTrigger value="training" className="flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            Training
                        </TabsTrigger>
                    </TabsList>

                    {/* ============ ANALYSIS TAB ============ */}
                    <TabsContent value="analysis" className="space-y-4">
                        <div className="flex flex-wrap gap-3 items-center">
                            <Button
                                onClick={runAnalysis}
                                disabled={analysisLoading}
                                className="gradient-primary text-white shadow-glow-primary"
                            >
                                {analysisLoading ? (
                                    <><Activity className="mr-2 h-4 w-4 animate-spin" />Analiz Ediliyor...</>
                                ) : (
                                    <><Play className="mr-2 h-4 w-4" />Analizi Başlat</>
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
                        <div className="flex gap-3">
                            <Button onClick={runSettlement} disabled={settling} className="gradient-primary text-white shadow-glow-primary">
                                {settling ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Çalışıyor...</> : <><Play className="mr-2 h-4 w-4" />Settlement Çalıştır</>}
                            </Button>
                            <Button variant="outline" onClick={loadBets} disabled={betsLoading}>
                                <RefreshCw className={`mr-2 h-4 w-4 ${betsLoading ? 'animate-spin' : ''}`} />Yenile
                            </Button>
                        </div>

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
                                        {bets.map(bet => (
                                            <TableRow key={bet.id}>
                                                <TableCell className="font-medium">{bet.home_team} vs {bet.away_team}</TableCell>
                                                <TableCell>{bet.market}</TableCell>
                                                <TableCell>{bet.odds || '-'}</TableCell>
                                                <TableCell>{getStatusBadge(bet.status)}</TableCell>
                                                <TableCell>{bet.final_score || '-'}</TableCell>
                                                <TableCell>
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

                    {/* ============ TRAINING TAB ============ */}
                    <TabsContent value="training" className="space-y-4">
                        {trainingStats && (
                            <Card className="glass-card-premium">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                        Performans Özeti
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
                </Tabs>
            </div>
        </AppLayout>
    );
};

export default AdminPanel;

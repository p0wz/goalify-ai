import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
    Play,
    Copy,
    Check,
    TrendingUp,
    Target,
    Activity,
    Clock,
    FileText
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || 'https://goalify-ai.onrender.com/api';

interface AnalysisResult {
    id: string;
    matchId: string;
    homeTeam: string;
    awayTeam: string;
    league: string;
    timestamp: number;
    market: string;
    marketKey: string;
    stats: {
        leagueAvg: number;
        homeForm: any;
        awayForm: any;
        homeHomeStats: any;
        awayAwayStats: any;
    };
    aiPrompt: string;
    rawStats: string;
}

const Analysis = () => {
    const [results, setResults] = useState<AnalysisResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [marketFilter, setMarketFilter] = useState("all");
    const [oddsInputs, setOddsInputs] = useState<Record<string, string>>({});

    const runAnalysis = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/analysis/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ limit: 50, leagueFilter: true })
            });
            const data = await res.json();
            if (data.success) {
                setResults(data.results);
                toast.success(`${data.count} aday bulundu!`);
            } else {
                toast.error(data.error);
            }
        } catch (err: any) {
            toast.error(err.message);
        }
        setLoading(false);
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
            const data = await res.json();
            if (data.success) {
                toast.success('Bahis onaylandı!');
                setResults(results.filter(r => r.id !== item.id));
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Panoya kopyalandı!');
    };

    const copyAllMarketPrompts = () => {
        const filtered = marketFilter === 'all' ? results : results.filter(r => r.marketKey === marketFilter);

        let text = "";

        if (marketFilter === 'all') {
            // Group by market
            const grouped: Record<string, string[]> = {};
            filtered.forEach(r => {
                if (!grouped[r.market]) grouped[r.market] = [];
                let prompt = r.aiPrompt;
                if (oddsInputs[r.id]) {
                    prompt = prompt.replace(`Market: ${r.market}`, `Market: ${r.market}\nOdds: ${oddsInputs[r.id]}`);
                }
                grouped[r.market].push(prompt);
            });

            Object.entries(grouped).forEach(([market, prompts]) => {
                text += `=== MARKET: ${market.toUpperCase()} ===\n\n`;
                text += prompts.join('\n\n---\n\n');
                text += '\n\n\n';
            });
        } else {
            text = filtered.map(r => {
                const odds = oddsInputs[r.id];
                let prompt = r.aiPrompt;
                if (odds) {
                    prompt = prompt.replace(`Market: ${r.market}`, `Market: ${r.market}\nOdds: ${odds}`);
                }
                return prompt;
            }).join('\n\n---\n\n');
        }

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

    const filteredResults = marketFilter === 'all'
        ? results
        : results.filter(r => r.marketKey === marketFilter);

    const markets = [...new Set(results.map(r => r.marketKey))];

    return (
        <AppLayout>
            <div className="space-y-6 animate-slide-up">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-display">Günlük Analiz</h1>
                        <p className="text-muted-foreground mt-1">Flashscore verilerine dayalı maç öncesi analiz</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={runAnalysis}
                            disabled={loading}
                            className="gradient-primary text-white shadow-glow-primary"
                        >
                            {loading ? (
                                <>
                                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                                    Analiz Ediliyor...
                                </>
                            ) : (
                                <>
                                    <Play className="mr-2 h-4 w-4" />
                                    Analizi Başlat
                                </>
                            )}
                        </Button>
                        {results.length > 0 && (
                            <>
                                <Button variant="outline" onClick={copyAllMarketPrompts}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Tüm AI Promptlar
                                </Button>
                                <Button variant="outline" onClick={copyAllRawStats}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Ham İstatistik
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Stats Overview */}
                {results.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="glass-card card-hover">
                            <CardContent className="p-4 text-center">
                                <div className="text-3xl font-bold text-primary">{results.length}</div>
                                <div className="text-sm text-muted-foreground">Toplam Aday</div>
                            </CardContent>
                        </Card>
                        <Card className="glass-card card-hover">
                            <CardContent className="p-4 text-center">
                                <div className="text-3xl font-bold text-win">{markets.length}</div>
                                <div className="text-sm text-muted-foreground">Farklı Market</div>
                            </CardContent>
                        </Card>
                        <Card className="glass-card card-hover">
                            <CardContent className="p-4 text-center">
                                <div className="text-3xl font-bold text-accent">{new Set(results.map(r => r.matchId)).size}</div>
                                <div className="text-sm text-muted-foreground">Maç Sayısı</div>
                            </CardContent>
                        </Card>
                        <Card className="glass-card card-hover">
                            <CardContent className="p-4 text-center">
                                <div className="text-3xl font-bold">{filteredResults.length}</div>
                                <div className="text-sm text-muted-foreground">Filtrelenmiş</div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Market Filter */}
                {results.length > 0 && (
                    <div className="flex gap-4 items-center">
                        <Select value={marketFilter} onValueChange={setMarketFilter}>
                            <SelectTrigger className="w-[280px]">
                                <SelectValue placeholder="Market Filtresi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tüm Marketler ({results.length})</SelectItem>
                                {markets.map(m => (
                                    <SelectItem key={m} value={m}>
                                        {m} ({results.filter(r => r.marketKey === m).length})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Results */}
                {!loading && results.length === 0 && (
                    <Card className="glass-card">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Target className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Henüz Analiz Yapılmadı</h3>
                            <p className="text-muted-foreground text-center max-w-md">
                                Günlük maç analizini başlatmak için "Analizi Başlat" butonuna tıklayın.
                            </p>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4">
                    {filteredResults.map((item, index) => (
                        <Card
                            key={item.id}
                            className="glass-card card-hover animate-slide-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center">
                                            <TrendingUp className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{item.homeTeam} vs {item.awayTeam}</CardTitle>
                                            <CardDescription className="flex items-center gap-2">
                                                <Clock className="h-3 w-3" />
                                                {item.league}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Badge className="gradient-accent text-white w-fit">{item.market}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                                    <div className="bg-secondary/50 rounded-lg p-3 text-center">
                                        <div className="text-lg font-bold text-primary">{item.stats.leagueAvg?.toFixed(1) || '-'}</div>
                                        <div className="text-xs text-muted-foreground">Lig Ort.</div>
                                    </div>
                                    <div className="bg-secondary/50 rounded-lg p-3 text-center">
                                        <div className="text-lg font-bold text-win">{item.stats.homeForm?.over25Rate?.toFixed(0) || '-'}%</div>
                                        <div className="text-xs text-muted-foreground">Ev O2.5</div>
                                    </div>
                                    <div className="bg-secondary/50 rounded-lg p-3 text-center">
                                        <div className="text-lg font-bold text-accent">{item.stats.awayForm?.over25Rate?.toFixed(0) || '-'}%</div>
                                        <div className="text-xs text-muted-foreground">Dep O2.5</div>
                                    </div>
                                    <div className="bg-secondary/50 rounded-lg p-3 text-center">
                                        <div className="text-lg font-bold">{item.stats.homeHomeStats?.scoringRate?.toFixed(0) || '-'}%</div>
                                        <div className="text-xs text-muted-foreground">Ev Gol%</div>
                                    </div>
                                    <div className="bg-secondary/50 rounded-lg p-3 text-center">
                                        <div className="text-lg font-bold">{item.stats.awayAwayStats?.scoringRate?.toFixed(0) || '-'}%</div>
                                        <div className="text-xs text-muted-foreground">Dep Gol%</div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
                                    <Input
                                        type="text"
                                        placeholder="Oran"
                                        className="w-24"
                                        value={oddsInputs[item.id] || ''}
                                        onChange={e => setOddsInputs({ ...oddsInputs, [item.id]: e.target.value })}
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            let prompt = item.aiPrompt;
                                            if (oddsInputs[item.id]) {
                                                prompt = prompt.replace(`Market: ${item.market}`, `Market: ${item.market}\nOdds: ${oddsInputs[item.id]}`);
                                            }
                                            copyToClipboard(prompt);
                                        }}
                                    >
                                        <Copy className="mr-2 h-4 w-4" />
                                        AI Prompt
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(item.rawStats)}
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        Ham İstatistik
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="gradient-success text-white"
                                        onClick={() => approveBet(item)}
                                    >
                                        <Check className="mr-2 h-4 w-4" />
                                        Onayla
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
};

export default Analysis;

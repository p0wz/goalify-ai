import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
    RefreshCw,
    Brain,
    TrendingUp,
    CheckCircle,
    XCircle,
    Target
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface TrainingEntry {
    id: string;
    match: string;
    home_team: string;
    away_team: string;
    league: string;
    market: string;
    odds: string;
    result: string;
    final_score: string;
    settled_at: string;
}

interface TrainingStats {
    total: number;
    won: number;
    lost: number;
    refund: number;
    winRate: number;
}

const TrainingPool = () => {
    const [data, setData] = useState<TrainingEntry[]>([]);
    const [stats, setStats] = useState<TrainingStats | null>(null);
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [dataRes, statsRes] = await Promise.all([
                fetch(`${API_BASE}/training/all`),
                fetch(`${API_BASE}/training/stats`)
            ]);
            const [dataJson, statsJson] = await Promise.all([dataRes.json(), statsRes.json()]);
            if (dataJson.success) setData(dataJson.data);
            if (statsJson.success) setStats(statsJson.stats);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const getStatusBadge = (result: string) => {
        switch (result?.toUpperCase()) {
            case 'WON':
                return <Badge className="bg-win text-white"><CheckCircle className="mr-1 h-3 w-3" />WON</Badge>;
            case 'LOST':
                return <Badge className="bg-lose text-white"><XCircle className="mr-1 h-3 w-3" />LOST</Badge>;
            default:
                return <Badge variant="secondary">REFUND</Badge>;
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6 animate-slide-up">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-display flex items-center gap-3">
                            <Brain className="h-8 w-8 text-primary" />
                            Training Pool
                        </h1>
                        <p className="text-muted-foreground mt-1">AI eğitim verileri ve performans metrikleri</p>
                    </div>
                    <Button variant="outline" onClick={loadData} disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Yenile
                    </Button>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <Card className="glass-card card-hover">
                            <CardContent className="p-4 text-center">
                                <div className="text-3xl font-bold">{stats.total}</div>
                                <div className="text-sm text-muted-foreground">Toplam</div>
                            </CardContent>
                        </Card>
                        <Card className="glass-card card-hover">
                            <CardContent className="p-4 text-center">
                                <div className="text-3xl font-bold text-win">{stats.won}</div>
                                <div className="text-sm text-muted-foreground">Kazanan</div>
                            </CardContent>
                        </Card>
                        <Card className="glass-card card-hover">
                            <CardContent className="p-4 text-center">
                                <div className="text-3xl font-bold text-lose">{stats.lost}</div>
                                <div className="text-sm text-muted-foreground">Kaybeden</div>
                            </CardContent>
                        </Card>
                        <Card className="glass-card card-hover">
                            <CardContent className="p-4 text-center">
                                <div className="text-3xl font-bold text-muted-foreground">{stats.refund}</div>
                                <div className="text-sm text-muted-foreground">İade</div>
                            </CardContent>
                        </Card>
                        <Card className="glass-card-premium card-hover col-span-2 md:col-span-1">
                            <CardContent className="p-4 text-center">
                                <div className="text-3xl font-bold text-gradient">{stats.winRate}%</div>
                                <div className="text-sm text-muted-foreground">Win Rate</div>
                                <Progress value={stats.winRate} className="mt-2 h-2" />
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Win Rate Visual */}
                {stats && stats.total > 0 && (
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
                                        <span className="font-semibold text-win">{stats.winRate}%</span>
                                    </div>
                                    <div className="h-4 bg-secondary rounded-full overflow-hidden flex">
                                        <div
                                            className="h-full bg-win transition-all duration-500"
                                            style={{ width: `${(stats.won / stats.total) * 100}%` }}
                                        />
                                        <div
                                            className="h-full bg-lose transition-all duration-500"
                                            style={{ width: `${(stats.lost / stats.total) * 100}%` }}
                                        />
                                        <div
                                            className="h-full bg-muted transition-all duration-500"
                                            style={{ width: `${(stats.refund / stats.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-win" />
                                        <span>Kazanan ({stats.won})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-lose" />
                                        <span>Kaybeden ({stats.lost})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-muted" />
                                        <span>İade ({stats.refund})</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Table */}
                {data.length === 0 ? (
                    <Card className="glass-card">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Target className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Training Pool Boş</h3>
                            <p className="text-muted-foreground text-center max-w-md">
                                Settle edilen bahisler otomatik olarak buraya eklenecek.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="glass-card overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Maç</TableHead>
                                    <TableHead>Lig</TableHead>
                                    <TableHead>Market</TableHead>
                                    <TableHead>Oran</TableHead>
                                    <TableHead>Sonuç</TableHead>
                                    <TableHead>Skor</TableHead>
                                    <TableHead>Tarih</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.match}</TableCell>
                                        <TableCell className="text-muted-foreground">{item.league}</TableCell>
                                        <TableCell>{item.market}</TableCell>
                                        <TableCell>{item.odds || '-'}</TableCell>
                                        <TableCell>{getStatusBadge(item.result)}</TableCell>
                                        <TableCell>{item.final_score}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(item.settled_at).toLocaleDateString('tr-TR')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
};

export default TrainingPool;

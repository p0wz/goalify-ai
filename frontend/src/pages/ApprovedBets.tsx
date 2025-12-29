import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    Trash2,
    Play,
    CheckCircle,
    XCircle,
    Clock,
    Target
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || '/api';

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
    settled_at: string;
}

const ApprovedBets = () => {
    const [bets, setBets] = useState<ApprovedBet[]>([]);
    const [loading, setLoading] = useState(false);
    const [settling, setSettling] = useState(false);

    const loadBets = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/bets/approved`);
            const data = await res.json();
            if (data.success) setBets(data.bets);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const runSettlement = async () => {
        setSettling(true);
        try {
            const res = await fetch(`${API_BASE}/settlement/run`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                toast.success(`${data.settled} bahis settle edildi!`);
                loadBets();
            }
        } catch (err: any) {
            toast.error(err.message);
        }
        setSettling(false);
    };

    const deleteBet = async (id: string) => {
        try {
            await fetch(`${API_BASE}/bets/${id}`, { method: 'DELETE' });
            loadBets();
            toast.success('Bahis silindi');
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    useEffect(() => {
        loadBets();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'WON':
                return <Badge className="bg-win text-white"><CheckCircle className="mr-1 h-3 w-3" />WON</Badge>;
            case 'LOST':
                return <Badge className="bg-lose text-white"><XCircle className="mr-1 h-3 w-3" />LOST</Badge>;
            case 'REFUND':
                return <Badge variant="secondary">REFUND</Badge>;
            default:
                return <Badge className="bg-draw text-white"><Clock className="mr-1 h-3 w-3" />PENDING</Badge>;
        }
    };

    const pendingCount = bets.filter(b => b.status === 'PENDING').length;
    const wonCount = bets.filter(b => b.status === 'WON').length;
    const lostCount = bets.filter(b => b.status === 'LOST').length;

    return (
        <AppLayout>
            <div className="space-y-6 animate-slide-up">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-display">Onaylanan Bahisler</h1>
                        <p className="text-muted-foreground mt-1">Settlement ve sonuç takibi</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={runSettlement}
                            disabled={settling}
                            className="gradient-primary text-white shadow-glow-primary"
                        >
                            {settling ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Çalışıyor...
                                </>
                            ) : (
                                <>
                                    <Play className="mr-2 h-4 w-4" />
                                    Settlement Çalıştır
                                </>
                            )}
                        </Button>
                        <Button variant="outline" onClick={loadBets} disabled={loading}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Yenile
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="glass-card card-hover">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold">{bets.length}</div>
                            <div className="text-sm text-muted-foreground">Toplam</div>
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
                </div>

                {/* Table */}
                {bets.length === 0 ? (
                    <Card className="glass-card">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Target className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Henüz Onaylanmış Bahis Yok</h3>
                            <p className="text-muted-foreground text-center max-w-md">
                                Analiz sayfasından bahis onaylayarak başlayın.
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
                                    <TableHead>Durum</TableHead>
                                    <TableHead>Sonuç</TableHead>
                                    <TableHead>Tarih</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bets.map(bet => (
                                    <TableRow key={bet.id}>
                                        <TableCell className="font-medium">{bet.home_team} vs {bet.away_team}</TableCell>
                                        <TableCell className="text-muted-foreground">{bet.league}</TableCell>
                                        <TableCell>{bet.market}</TableCell>
                                        <TableCell>{bet.odds || '-'}</TableCell>
                                        <TableCell>{getStatusBadge(bet.status)}</TableCell>
                                        <TableCell>{bet.final_score || '-'}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(bet.approved_at).toLocaleDateString('tr-TR')}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteBet(bet.id)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
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

export default ApprovedBets;

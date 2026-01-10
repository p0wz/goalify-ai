import { create } from 'zustand';
import { LiveHistoryState, LiveSignal } from '../types';
import api from '../services/api';

interface LiveHistoryActions {
    fetchHistory: () => Promise<void>;
    refresh: () => Promise<void>;
    reset: () => void;
}

const initialState: LiveHistoryState = {
    signals: [],
    dailyWinRate: 0,
    monthlyWinRate: 0,
    isLoading: false,
    error: null,
};

export const useLiveHistoryStore = create<LiveHistoryState & LiveHistoryActions>((set, get) => ({
    ...initialState,

    fetchHistory: async () => {
        if (get().isLoading) return;

        set({ isLoading: true, error: null });
        try {
            const response = await api.getLiveHistory();
            if (response.success) {
                const history = response.history || [];

                // Parse signals
                const signals: LiveSignal[] = history.map((item: any) => ({
                    id: item._id || item.id,
                    matchId: item.matchId,
                    homeTeam: item.home,
                    awayTeam: item.away,
                    league: item.league,
                    market: item.strategy || item.market,
                    strategy: item.strategy,
                    entryScore: item.entryScore,
                    entryMinute: item.entryMinute,
                    confidence: item.confidencePercent || item.confidence,
                    reason: item.reason || '',
                    status: item.status || 'PENDING',
                    finalScore: item.finalScore,
                    createdAt: item.createdAt,
                }));

                // Calculate win rates
                const settledSignals = signals.filter((s) => s.status !== 'PENDING');
                const wonSignals = settledSignals.filter((s) => s.status === 'WON');

                const monthlyWinRate = settledSignals.length > 0
                    ? Math.round((wonSignals.length / settledSignals.length) * 100)
                    : 0;

                // Daily: last 24h
                const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
                const todaySignals = settledSignals.filter(
                    (s) => new Date(s.createdAt).getTime() > oneDayAgo
                );
                const todayWon = todaySignals.filter((s) => s.status === 'WON');
                const dailyWinRate = todaySignals.length > 0
                    ? Math.round((todayWon.length / todaySignals.length) * 100)
                    : 0;

                set({
                    signals,
                    dailyWinRate,
                    monthlyWinRate,
                    isLoading: false,
                });
            } else {
                set({ error: response.error || 'Veri alınamadı', isLoading: false });
            }
        } catch (error: any) {
            set({
                error: error.message || 'Bağlantı hatası',
                isLoading: false,
            });
        }
    },

    refresh: async () => {
        set({ isLoading: true });
        await get().fetchHistory();
    },

    reset: () => set(initialState),
}));

import { create } from 'zustand';
import { LiveState, LiveSignal } from '../types';
import api from '../services/api';

interface LiveActions {
    fetchSignals: () => Promise<void>;
    refresh: () => Promise<void>;
    reset: () => void;
}

const initialState: LiveState = {
    signals: [],
    isLoading: false,
    error: null,
};

export const useLiveStore = create<LiveState & LiveActions>((set, get) => ({
    ...initialState,

    fetchSignals: async () => {
        if (get().isLoading) return;

        set({ isLoading: true, error: null });
        try {
            const response = await api.getLiveSignals();
            if (response.success) {
                const signals: LiveSignal[] = (response.signals || []).map((item: any) => ({
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

                set({ signals, isLoading: false });
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
        await get().fetchSignals();
    },

    reset: () => set(initialState),
}));

import { create } from 'zustand';
import { Prediction } from '../types';
import api from '../services/api';

interface PredictionsState {
    predictions: Prediction[];
    isLoading: boolean;
    error: string | null;
}

interface PredictionsActions {
    fetchPredictions: () => Promise<void>;
    reset: () => void;
}

const initialState: PredictionsState = {
    predictions: [],
    isLoading: false,
    error: null,
};

export const usePredictionsStore = create<PredictionsState & PredictionsActions>((set, get) => ({
    ...initialState,

    fetchPredictions: async () => {
        if (get().isLoading) return;

        set({ isLoading: true, error: null });
        try {
            const response = await api.getApprovedBets();
            if (response.success) {
                const predictions: Prediction[] = (response.bets || []).map((item: any) => ({
                    id: item._id || item.id,
                    matchId: item.matchId,
                    homeTeam: item.home,
                    awayTeam: item.away,
                    league: item.league || 'Unknown',
                    market: item.market,
                    odds: item.odds,
                    matchTime: item.matchTime,
                    status: item.status || 'PENDING',
                    finalScore: item.finalScore,
                    createdAt: item.createdAt,
                }));

                set({ predictions, isLoading: false });
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

    reset: () => set(initialState),
}));

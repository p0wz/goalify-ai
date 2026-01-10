// Type definitions for SENTIO

export interface User {
    id: string;
    firebaseUid?: string;
    name: string;
    email: string;
    role: string;
    isPremium: boolean;
}

export interface LiveSignal {
    id: string;
    matchId: string;
    homeTeam: string;
    awayTeam: string;
    league: string;
    market: string;
    strategy: string;
    entryScore: string;
    entryMinute: number;
    confidence: number;
    reason: string;
    status: 'PENDING' | 'WON' | 'LOST';
    finalScore?: string;
    createdAt: string;
}

export interface Prediction {
    id: string;
    matchId: string;
    homeTeam: string;
    awayTeam: string;
    league: string;
    market: string;
    odds?: string;
    matchTime: number;
    status: 'PENDING' | 'WON' | 'LOST';
    finalScore?: string;
    createdAt: string;
}

export interface LiveHistoryStats {
    dailyWinRate: number;
    monthlyWinRate: number;
    totalSignals: number;
    wonSignals: number;
}

export interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
    token: string | null;
    user: User | null;
}

export interface LiveState {
    signals: LiveSignal[];
    isLoading: boolean;
    error: string | null;
}

export interface LiveHistoryState {
    signals: LiveSignal[];
    dailyWinRate: number;
    monthlyWinRate: number;
    isLoading: boolean;
    error: string | null;
}

export interface PredictionsState {
    predictions: Prediction[];
    isLoading: boolean;
    error: string | null;
}

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    token?: string;
    user?: User;
}

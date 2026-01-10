import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://goalify-ai.onrender.com/api';
const TOKEN_KEY = 'sentio_auth_token';

class ApiService {
    private client: AxiosInstance;
    private token: string | null = null;

    constructor() {
        this.client = axios.create({
            baseURL: BASE_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor for auth token
        this.client.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                if (this.token) {
                    config.headers.Authorization = `Bearer ${this.token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                console.log('[API Error]', error.response?.data || error.message);
                return Promise.reject(error);
            }
        );
    }

    // Token management
    async loadToken(): Promise<string | null> {
        try {
            this.token = await SecureStore.getItemAsync(TOKEN_KEY);
            return this.token;
        } catch {
            return null;
        }
    }

    async setToken(token: string | null): Promise<void> {
        this.token = token;
        if (token) {
            await SecureStore.setItemAsync(TOKEN_KEY, token);
        } else {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
    }

    getToken(): string | null {
        return this.token;
    }

    // ============ AUTH ============

    async login(email: string, password: string) {
        const { data } = await this.client.post('/auth/login', { email, password });
        if (data.success && data.token) {
            await this.setToken(data.token);
        }
        return data;
    }

    async register(name: string, email: string, password: string) {
        const { data } = await this.client.post('/auth/register', { name, email, password });
        if (data.success && data.token) {
            await this.setToken(data.token);
        }
        return data;
    }

    async firebaseSync(firebaseUid: string, email: string, name: string, idToken: string) {
        const { data } = await this.client.post('/auth/firebase-sync', {
            firebaseUid,
            email,
            name,
            idToken,
        });
        if (data.success && data.token) {
            await this.setToken(data.token);
        }
        return data;
    }

    async logout() {
        await this.setToken(null);
    }

    // ============ LIVE SIGNALS ============

    async getLiveSignals() {
        const { data } = await this.client.get('/mobile/live-signals');
        return data;
    }

    async getLiveHistory() {
        try {
            const { data } = await this.client.get('/mobile/live-history');
            return data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return { success: true, history: [] };
            }
            throw error;
        }
    }

    // ============ ANALYSIS ============

    async getAnalysisResults() {
        const { data } = await this.client.get('/analysis/results');
        return data;
    }

    // ============ BETS ============

    async getApprovedBets() {
        const { data } = await this.client.get('/bets/approved');
        return data;
    }

    async getMobileBets(status?: string) {
        const { data } = await this.client.get('/mobile-bets', {
            params: status ? { status } : undefined,
        });
        return data;
    }
}

export const api = new ApiService();
export default api;

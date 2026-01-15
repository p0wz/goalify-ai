import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';

const BASE_URL = 'https://goalify-ai.onrender.com/api';
const TOKEN_KEY = 'sentio_auth_token';

// Web-compatible storage abstraction
const storage = {
    async getItem(key: string): Promise<string | null> {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        }
        // Native: use SecureStore
        const SecureStore = require('expo-secure-store');
        try {
            return await SecureStore.getItemAsync(key);
        } catch (e) {
            console.log('[Storage] SecureStore error, falling back to null:', e);
            return null;
        }
    },
    async setItem(key: string, value: string): Promise<void> {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
            return;
        }
        // Native: use SecureStore
        const SecureStore = require('expo-secure-store');
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (e) {
            console.log('[Storage] SecureStore setItem error:', e);
        }
    },
    async deleteItem(key: string): Promise<void> {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
            return;
        }
        // Native: use SecureStore
        const SecureStore = require('expo-secure-store');
        try {
            await SecureStore.deleteItemAsync(key);
        } catch (e) {
            console.log('[Storage] SecureStore deleteItem error:', e);
        }
    }
};

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
            this.token = await storage.getItem(TOKEN_KEY);
            return this.token;
        } catch {
            return null;
        }
    }

    async setToken(token: string | null): Promise<void> {
        this.token = token;
        try {
            if (token) {
                await storage.setItem(TOKEN_KEY, token);
            } else {
                await storage.deleteItem(TOKEN_KEY);
            }
        } catch (e) {
            console.log('[API] Token storage error (non-critical):', e);
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

    // ============ LIVE ============

    async getLiveSignals() {
        const { data } = await this.client.get('/mobile/live-signals');
        return data;
    }

    // ============ ANALYSIS ============

    async getAnalysis() {
        const { data } = await this.client.get('/analysis/latest');
        return data;
    }
}

export const api = new ApiService();
export default api;

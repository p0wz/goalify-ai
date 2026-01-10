import { create } from 'zustand';
import { AuthState, User } from '../types';
import api from '../services/api';
import { firebaseService } from '../services/firebase';
import { revenueCatService } from '../services/revenuecat';

interface AuthActions {
    initialize: () => Promise<void>;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    signInWithGoogle: () => Promise<boolean>;
    logout: () => Promise<void>;
    refreshPremiumStatus: () => Promise<void>;
    setUser: (user: User | null) => void;
}

const initialState: AuthState = {
    isAuthenticated: false,
    isLoading: true,
    isInitialized: false,
    token: null,
    user: null,
};

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
    ...initialState,

    initialize: async () => {
        try {
            // Initialize Firebase
            await firebaseService.initialize();

            // Load token from secure storage
            const token = await api.loadToken();

            if (token) {
                // Initialize RevenueCat with user ID
                const user = get().user;
                if (user?.id) {
                    await revenueCatService.initialize(user.id);
                } else {
                    await revenueCatService.initialize();
                }

                set({
                    isAuthenticated: true,
                    isLoading: false,
                    isInitialized: true,
                    token,
                });
            } else {
                set({ isLoading: false, isInitialized: true });
            }
        } catch (error) {
            console.error('[Auth] Initialize error:', error);
            set({ isLoading: false, isInitialized: true });
        }
    },

    login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
            const response = await api.login(email, password);
            if (response.success) {
                // Initialize RevenueCat with user ID
                if (response.user?.id) {
                    await revenueCatService.initialize(response.user.id);
                    await revenueCatService.login(response.user.id);
                }

                // Check premium status
                const isPremium = revenueCatService.isPremium;

                set({
                    isAuthenticated: true,
                    isLoading: false,
                    token: response.token,
                    user: {
                        ...response.user,
                        isPremium,
                    },
                });
                return true;
            }
            set({ isLoading: false });
            return false;
        } catch (error: any) {
            set({ isLoading: false });
            throw new Error(error.response?.data?.error || 'Giriş başarısız');
        }
    },

    register: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
            const response = await api.register(name, email, password);
            if (response.success) {
                // Initialize RevenueCat
                if (response.user?.id) {
                    await revenueCatService.initialize(response.user.id);
                    await revenueCatService.login(response.user.id);
                }

                set({
                    isAuthenticated: true,
                    isLoading: false,
                    token: response.token,
                    user: response.user,
                });
                return true;
            }
            set({ isLoading: false });
            return false;
        } catch (error: any) {
            set({ isLoading: false });
            throw new Error(error.response?.data?.error || 'Kayıt başarısız');
        }
    },

    signInWithGoogle: async () => {
        set({ isLoading: true });
        try {
            // Sign in with Firebase
            const userCredential = await firebaseService.signInWithGoogle();

            if (!userCredential) {
                set({ isLoading: false });
                return false;
            }

            const firebaseUser = userCredential.user;
            const idToken = await firebaseService.getIdToken();

            if (!idToken) {
                set({ isLoading: false });
                throw new Error('Firebase token alınamadı');
            }

            // Sync with backend
            const response = await api.firebaseSync(
                firebaseUser.uid,
                firebaseUser.email || '',
                firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                idToken
            );

            if (response.success) {
                // Initialize RevenueCat
                if (response.user?.id) {
                    await revenueCatService.initialize(response.user.id);
                    await revenueCatService.login(response.user.id);
                }

                const isPremium = revenueCatService.isPremium;

                set({
                    isAuthenticated: true,
                    isLoading: false,
                    token: response.token,
                    user: {
                        ...response.user,
                        isPremium,
                    },
                });
                return true;
            }

            set({ isLoading: false });
            return false;
        } catch (error: any) {
            console.error('[Auth] Google sign-in error:', error);
            set({ isLoading: false });
            throw new Error(error.message || 'Google giriş başarısız');
        }
    },

    logout: async () => {
        try {
            // Sign out from Firebase
            await firebaseService.signOut();

            // Logout from RevenueCat
            await revenueCatService.logout();

            // Clear API token
            await api.logout();

            set({
                isAuthenticated: false,
                token: null,
                user: null,
            });
        } catch (error) {
            console.error('[Auth] Logout error:', error);
        }
    },

    refreshPremiumStatus: async () => {
        try {
            await revenueCatService.refreshCustomerInfo();
            const isPremium = revenueCatService.isPremium;

            const currentUser = get().user;
            if (currentUser) {
                set({
                    user: {
                        ...currentUser,
                        isPremium,
                    },
                });
            }
        } catch (error) {
            console.error('[Auth] Refresh premium error:', error);
        }
    },

    setUser: (user) => set({ user }),
}));

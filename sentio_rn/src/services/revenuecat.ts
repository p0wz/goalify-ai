// Mock RevenueCat Service for Expo Go compatibility
// react-native-purchases requires native modules
// For production, switch to development build with actual RevenueCat SDK

import { Platform } from 'react-native';

export enum PurchaseResult {
    SUCCESS = 'success',
    CANCELLED = 'cancelled',
    FAILED = 'failed',
}

// Mock types to replace actual RevenueCat types
interface MockPackage {
    identifier: string;
    product: {
        priceString: string;
        title: string;
        description: string;
    };
}

interface MockOfferings {
    current: {
        monthly?: MockPackage;
        annual?: MockPackage;
        availablePackages: MockPackage[];
    } | null;
}

class RevenueCatService {
    private initialized = false;
    private _isPremium = false;

    /**
     * Initialize RevenueCat SDK (mock for Expo Go)
     */
    async initialize(userId?: string): Promise<void> {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[RevenueCat] Mock initialized for Expo Go');
        console.log('[RevenueCat] User ID:', userId || 'anonymous');
    }

    /**
     * Refresh customer info (mock)
     */
    async refreshCustomerInfo(): Promise<null> {
        console.log('[RevenueCat] Mock refresh customer info');
        return null;
    }

    /**
     * Check if user has pro entitlement (mock - always false in Expo Go)
     */
    get isPremium(): boolean {
        return this._isPremium;
    }

    /**
     * Set premium status (for testing in Expo Go)
     */
    setPremiumForTesting(value: boolean): void {
        this._isPremium = value;
        console.log('[RevenueCat] Mock premium set to:', value);
    }

    /**
     * Get available offerings (mock data)
     */
    async getOfferings(): Promise<MockOfferings> {
        console.log('[RevenueCat] Returning mock offerings');
        return {
            current: {
                monthly: {
                    identifier: 'monthly',
                    product: {
                        priceString: '₺99.99',
                        title: 'SENTIO PRO Aylık',
                        description: 'Tüm premium özelliklere aylık erişim',
                    },
                },
                annual: {
                    identifier: 'annual',
                    product: {
                        priceString: '₺799.99',
                        title: 'SENTIO PRO Yıllık',
                        description: 'Tüm premium özelliklere yıllık erişim (%33 indirim)',
                    },
                },
                availablePackages: [
                    {
                        identifier: 'monthly',
                        product: {
                            priceString: '₺99.99',
                            title: 'SENTIO PRO Aylık',
                            description: 'Tüm premium özelliklere aylık erişim',
                        },
                    },
                    {
                        identifier: 'annual',
                        product: {
                            priceString: '₺799.99',
                            title: 'SENTIO PRO Yıllık',
                            description: 'Tüm premium özelliklere yıllık erişim (%33 indirim)',
                        },
                    },
                ],
            },
        };
    }

    /**
     * Purchase a package (mock - not available in Expo Go)
     */
    async purchasePackage(pkg: MockPackage): Promise<PurchaseResult> {
        console.log('[RevenueCat] Purchase not available in Expo Go');
        console.log('[RevenueCat] Package:', pkg.identifier);
        console.log('[RevenueCat] Use development build for actual purchases');
        // Simulate success for testing
        this._isPremium = true;
        return PurchaseResult.SUCCESS;
    }

    /**
     * Restore previous purchases (mock)
     */
    async restorePurchases(): Promise<boolean> {
        console.log('[RevenueCat] Restore not available in Expo Go');
        return this._isPremium;
    }

    /**
     * Login user (mock)
     */
    async login(userId: string): Promise<void> {
        console.log('[RevenueCat] Mock login:', userId);
    }

    /**
     * Logout user (mock)
     */
    async logout(): Promise<void> {
        this._isPremium = false;
        console.log('[RevenueCat] Mock logout');
    }

    /**
     * Get cached customer info (mock)
     */
    getCustomerInfo(): null {
        return null;
    }

    /**
     * Listen to customer info changes (mock)
     */
    addCustomerInfoUpdateListener(callback: (info: any) => void): () => void {
        // Return noop unsubscribe
        return () => { };
    }
}

export const revenueCatService = new RevenueCatService();
export default revenueCatService;

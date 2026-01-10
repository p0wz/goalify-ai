import Purchases, {
    PurchasesOfferings,
    PurchasesPackage,
    CustomerInfo,
    LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';

// RevenueCat API Keys - Replace with your actual keys
const API_KEYS = {
    ios: 'appl_YOUR_IOS_API_KEY',
    android: 'goog_YOUR_ANDROID_API_KEY',
};

// Entitlement ID from RevenueCat dashboard
const ENTITLEMENT_ID = 'pro';

export enum PurchaseResult {
    SUCCESS = 'success',
    CANCELLED = 'cancelled',
    FAILED = 'failed',
}

class RevenueCatService {
    private initialized = false;
    private customerInfo: CustomerInfo | null = null;

    /**
     * Initialize RevenueCat SDK
     * Call this once on app start
     */
    async initialize(userId?: string): Promise<void> {
        if (this.initialized) return;

        try {
            // Set log level for debugging
            Purchases.setLogLevel(LOG_LEVEL.DEBUG);

            // Get API key based on platform
            const apiKey = Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android;

            // Configure Purchases
            await Purchases.configure({
                apiKey,
                appUserID: userId,
            });

            this.initialized = true;

            // Fetch initial customer info
            await this.refreshCustomerInfo();

            console.log('[RevenueCat] Initialized');
        } catch (error) {
            console.error('[RevenueCat] Init error:', error);
        }
    }

    /**
     * Refresh and cache customer info
     */
    async refreshCustomerInfo(): Promise<CustomerInfo | null> {
        try {
            this.customerInfo = await Purchases.getCustomerInfo();
            return this.customerInfo;
        } catch (error) {
            console.error('[RevenueCat] Get customer info error:', error);
            return null;
        }
    }

    /**
     * Check if user has pro entitlement
     */
    get isPremium(): boolean {
        if (!this.customerInfo) return false;
        return typeof this.customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
    }

    /**
     * Get available offerings (subscription packages)
     */
    async getOfferings(): Promise<PurchasesOfferings | null> {
        try {
            const offerings = await Purchases.getOfferings();
            return offerings;
        } catch (error) {
            console.error('[RevenueCat] Get offerings error:', error);
            return null;
        }
    }

    /**
     * Purchase a package
     */
    async purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult> {
        try {
            const { customerInfo } = await Purchases.purchasePackage(pkg);
            this.customerInfo = customerInfo;

            if (this.isPremium) {
                console.log('[RevenueCat] Purchase successful');
                return PurchaseResult.SUCCESS;
            }

            return PurchaseResult.FAILED;
        } catch (error: any) {
            if (error.userCancelled) {
                console.log('[RevenueCat] Purchase cancelled by user');
                return PurchaseResult.CANCELLED;
            }

            console.error('[RevenueCat] Purchase error:', error);
            return PurchaseResult.FAILED;
        }
    }

    /**
     * Restore previous purchases
     */
    async restorePurchases(): Promise<boolean> {
        try {
            this.customerInfo = await Purchases.restorePurchases();
            return this.isPremium;
        } catch (error) {
            console.error('[RevenueCat] Restore error:', error);
            return false;
        }
    }

    /**
     * Login user (associate purchases with user ID)
     */
    async login(userId: string): Promise<void> {
        try {
            const { customerInfo } = await Purchases.logIn(userId);
            this.customerInfo = customerInfo;
            console.log('[RevenueCat] Logged in:', userId);
        } catch (error) {
            console.error('[RevenueCat] Login error:', error);
        }
    }

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        try {
            this.customerInfo = await Purchases.logOut();
            console.log('[RevenueCat] Logged out');
        } catch (error) {
            console.error('[RevenueCat] Logout error:', error);
        }
    }

    /**
     * Get cached customer info
     */
    getCustomerInfo(): CustomerInfo | null {
        return this.customerInfo;
    }

    /**
     * Listen to customer info changes
     */
    addCustomerInfoUpdateListener(callback: (info: CustomerInfo) => void): () => void {
        const listener = Purchases.addCustomerInfoUpdateListener(callback);
        return () => listener.remove();
    }
}

export const revenueCatService = new RevenueCatService();
export default revenueCatService;

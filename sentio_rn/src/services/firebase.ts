// Mock Firebase Service for Expo Go compatibility
// This replaces @react-native-firebase/auth which requires native modules
// For production, switch to development build with actual Firebase

interface MockUser {
    uid: string;
    email: string | null;
    displayName: string | null;
}

interface MockUserCredential {
    user: MockUser;
}

class FirebaseService {
    private initialized = false;
    private currentUser: MockUser | null = null;

    /**
     * Initialize Firebase (mock for Expo Go)
     */
    async initialize(): Promise<void> {
        if (this.initialized) return;
        this.initialized = true;
        console.log('[Firebase] Mock initialized for Expo Go');
    }

    /**
     * Get current user (mock)
     */
    getCurrentUser(): MockUser | null {
        return this.currentUser;
    }

    /**
     * Sign in with Google (not available in Expo Go)
     * Returns null - will show error to user
     */
    async signInWithGoogle(): Promise<MockUserCredential | null> {
        console.log('[Firebase] Google Sign-In not available in Expo Go');
        console.log('[Firebase] Use email/password login instead or build development build');
        // Return null to indicate feature not available
        return null;
    }

    /**
     * Sign in with email and password (mock - uses backend directly)
     */
    async signInWithEmail(email: string, password: string): Promise<MockUserCredential> {
        // For Expo Go, we skip Firebase and use backend directly
        // The actual auth happens in authStore via api.login()
        this.currentUser = {
            uid: `mock_${Date.now()}`,
            email,
            displayName: email.split('@')[0],
        };
        return { user: this.currentUser };
    }

    /**
     * Create new account (mock - uses backend directly)
     */
    async createUserWithEmail(email: string, password: string): Promise<MockUserCredential> {
        this.currentUser = {
            uid: `mock_${Date.now()}`,
            email,
            displayName: email.split('@')[0],
        };
        return { user: this.currentUser };
    }

    /**
     * Update display name (mock)
     */
    async updateProfile(displayName: string): Promise<void> {
        if (this.currentUser) {
            this.currentUser.displayName = displayName;
        }
    }

    /**
     * Get Firebase ID token (mock - returns null for Expo Go)
     * Backend will accept login without Firebase token in dev mode
     */
    async getIdToken(): Promise<string | null> {
        // In Expo Go, we don't have real Firebase tokens
        // Backend should handle this gracefully
        return null;
    }

    /**
     * Sign out
     */
    async signOut(): Promise<void> {
        this.currentUser = null;
        console.log('[Firebase] Mock signed out');
    }

    /**
     * Listen to auth state changes (mock - does nothing in Expo Go)
     */
    onAuthStateChanged(callback: (user: MockUser | null) => void): () => void {
        // Immediately call with current state
        callback(this.currentUser);
        // Return unsubscribe function
        return () => { };
    }

    /**
     * Send password reset email (mock - not available in Expo Go)
     */
    async sendPasswordResetEmail(email: string): Promise<void> {
        console.log('[Firebase] Password reset not available in Expo Go mock');
        console.log('[Firebase] Email:', email);
    }
}

export const firebaseService = new FirebaseService();
export default firebaseService;

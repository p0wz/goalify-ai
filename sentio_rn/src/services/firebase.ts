import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// Configure Google Sign-In
// Replace with your actual Web Client ID from Firebase Console
const WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';

class FirebaseService {
    private initialized = false;

    /**
     * Initialize Firebase and Google Sign-In
     * Call this once on app start
     */
    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            GoogleSignin.configure({
                webClientId: WEB_CLIENT_ID,
                offlineAccess: true,
            });
            this.initialized = true;
            console.log('[Firebase] Initialized');
        } catch (error) {
            console.error('[Firebase] Init error:', error);
        }
    }

    /**
     * Get current Firebase user
     */
    getCurrentUser(): FirebaseAuthTypes.User | null {
        return auth().currentUser;
    }

    /**
     * Sign in with Google
     * Returns Firebase user credential
     */
    async signInWithGoogle(): Promise<FirebaseAuthTypes.UserCredential | null> {
        try {
            // Check if device supports Google Play
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            // Get user info from Google
            const userInfo = await GoogleSignin.signIn();

            // Get ID token
            const { idToken } = await GoogleSignin.getTokens();

            if (!idToken) {
                throw new Error('No ID token received from Google');
            }

            // Create Firebase credential with Google token
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);

            // Sign in to Firebase with credential
            const userCredential = await auth().signInWithCredential(googleCredential);

            console.log('[Firebase] Google sign-in successful:', userCredential.user.email);
            return userCredential;

        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('[Firebase] Google sign-in cancelled by user');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log('[Firebase] Google sign-in already in progress');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log('[Firebase] Google Play Services not available');
            } else {
                console.error('[Firebase] Google sign-in error:', error);
            }
            return null;
        }
    }

    /**
     * Sign in with email and password
     */
    async signInWithEmail(email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> {
        return await auth().signInWithEmailAndPassword(email, password);
    }

    /**
     * Create new account with email and password
     */
    async createUserWithEmail(email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> {
        return await auth().createUserWithEmailAndPassword(email, password);
    }

    /**
     * Update display name
     */
    async updateProfile(displayName: string): Promise<void> {
        const user = auth().currentUser;
        if (user) {
            await user.updateProfile({ displayName });
        }
    }

    /**
     * Get Firebase ID token for backend authentication
     */
    async getIdToken(): Promise<string | null> {
        const user = auth().currentUser;
        if (!user) return null;

        try {
            return await user.getIdToken(true);
        } catch (error) {
            console.error('[Firebase] Get ID token error:', error);
            return null;
        }
    }

    /**
     * Sign out from Firebase and Google
     */
    async signOut(): Promise<void> {
        try {
            // Sign out from Google
            const isSignedIn = await GoogleSignin.isSignedIn();
            if (isSignedIn) {
                await GoogleSignin.signOut();
            }

            // Sign out from Firebase
            await auth().signOut();

            console.log('[Firebase] Signed out');
        } catch (error) {
            console.error('[Firebase] Sign out error:', error);
        }
    }

    /**
     * Listen to auth state changes
     */
    onAuthStateChanged(callback: (user: FirebaseAuthTypes.User | null) => void): () => void {
        return auth().onAuthStateChanged(callback);
    }

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(email: string): Promise<void> {
        await auth().sendPasswordResetEmail(email);
    }
}

export const firebaseService = new FirebaseService();
export default firebaseService;

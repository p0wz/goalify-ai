import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../data/services/api_service.dart';
import '../../data/services/revenuecat_service.dart';

/// Auth State
class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final bool isInitialized; // New field
  final String? token;
  final AppUser? user;
  final String? error;

  const AuthState({
    this.isAuthenticated = false,
    this.isLoading = false,
    this.isInitialized = false,
    this.token,
    this.user,
    this.error,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    bool? isInitialized,
    String? token,
    AppUser? user,
    String? error,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      isInitialized: isInitialized ?? this.isInitialized,
      token: token ?? this.token,
      user: user ?? this.user,
      error: error,
    );
  }
}

/// User Model
class AppUser {
  final String id;
  final String? firebaseUid;
  final String name;
  final String email;
  final String role;
  final bool isPremium;

  const AppUser({
    required this.id,
    this.firebaseUid,
    required this.name,
    required this.email,
    required this.role,
    this.isPremium = false,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['id'] ?? json['_id'] ?? '',
      firebaseUid: json['firebase_uid'] ?? json['firebaseUid'],
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'user',
      isPremium: json['isPremium'] ?? json['is_premium'] == 1 ?? false,
    );
  }
}

/// Auth Notifier with Firebase Support
class AuthNotifier extends StateNotifier<AuthState> {
  final FlutterSecureStorage _secureStorage;
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();

  AuthNotifier(this._secureStorage) : super(const AuthState()) {
    _init();
  }

  Future<void> _init() async {
    state = state.copyWith(isLoading: true);

    // Listen to Firebase auth state changes
    _firebaseAuth.authStateChanges().listen((User? firebaseUser) async {
      if (firebaseUser != null) {
        // User is signed in with Firebase
        await _syncWithBackend(firebaseUser);
      } else {
        // Check for existing JWT token
        await _loadToken();
      }
    });
  }

  Future<void> _loadToken() async {
    try {
      final token = await _secureStorage.read(key: 'auth_token');
      if (token != null) {
        apiService.setAuthToken(token);
        state = state.copyWith(
          isAuthenticated: true,
          token: token,
          isLoading: false,
        );
      } else {
        state = state.copyWith(isLoading: false);
      }
    } catch (e) {
      state = state.copyWith(isLoading: false);
    }
  }

  /// Sync Firebase user with backend
  Future<void> _syncWithBackend(User firebaseUser) async {
    try {
      final idToken = await firebaseUser.getIdToken();

      // Sync with backend
      final response = await apiService.firebaseSync(
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email!,
        name: firebaseUser.displayName ?? 'User',
        idToken: idToken!,
      );

      if (response['success']) {
        final token = response['token'];
        await _secureStorage.write(key: 'auth_token', value: token);
        apiService.setAuthToken(token);

        // Identify user in RevenueCat
        final userId = response['user']['id'];
        await RevenueCatService().login(userId);

        // Check if actually premium in RevenueCat (source of truth for mobile)
        final isRevenueCatPremium = RevenueCatService().isPremium;

        // Use backend user but override premium status if RevenueCat says so
        var user = AppUser.fromJson(response['user']);
        if (isRevenueCatPremium && !user.isPremium) {
          // TODO: Sync back to server that user is premium
          user = AppUser(
            id: user.id,
            firebaseUid: user.firebaseUid,
            name: user.name,
            email: user.email,
            role: user.role,
            isPremium: true,
          );
        }

        state = state.copyWith(
          isAuthenticated: true,
          isLoading: false,
          token: token,
          user: user,
          error: null,
        );
      } else {
        await logout();
      }
    } catch (e) {
      print('Sync Error: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  /// Refresh premium status from RevenueCat
  Future<void> refreshUser() async {
    if (state.user == null) return;

    // Check RevenueCat
    await RevenueCatService().refreshCustomerInfo();
    final isPremium = RevenueCatService().isPremium;

    if (isPremium != state.user!.isPremium) {
      final updatedUser = AppUser(
        id: state.user!.id,
        firebaseUid: state.user!.firebaseUid,
        name: state.user!.name,
        email: state.user!.email,
        role: state.user!.role,
        isPremium: isPremium,
      );

      state = state.copyWith(user: updatedUser);

      // Sync to backend if needed
      if (isPremium) {
        // apiService.updatePremiumStatus(true); // Implement this later
      }
    }
  }

  /// Sign in with Google
  Future<bool> signInWithGoogle() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      // Trigger the Google Sign-In flow
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();

      if (googleUser == null) {
        state = state.copyWith(isLoading: false);
        return false; // User cancelled
      }

      // Get auth details from Google
      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;

      // Create Firebase credential
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      // Sign in to Firebase
      await _firebaseAuth.signInWithCredential(credential);

      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Google giriş hatası: $e',
      );
      return false;
    }
  }

  /// Sign in with Email and Password (Firebase)
  Future<bool> signInWithEmail(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      await _firebaseAuth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      return true;
    } on FirebaseAuthException catch (e) {
      String errorMessage = 'Giriş başarısız';
      if (e.code == 'user-not-found') {
        errorMessage = 'Bu email ile kayıtlı kullanıcı bulunamadı';
      } else if (e.code == 'wrong-password') {
        errorMessage = 'Yanlış şifre';
      } else if (e.code == 'invalid-email') {
        errorMessage = 'Geçersiz email';
      }
      state = state.copyWith(isLoading: false, error: errorMessage);
      return false;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Bağlantı hatası');
      return false;
    }
  }

  /// Register with Email and Password (Firebase)
  Future<bool> registerWithEmail(
    String name,
    String email,
    String password,
  ) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final userCredential = await _firebaseAuth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      // Update display name
      await userCredential.user?.updateDisplayName(name);

      return true;
    } on FirebaseAuthException catch (e) {
      String errorMessage = 'Kayıt başarısız';
      if (e.code == 'weak-password') {
        errorMessage = 'Şifre çok zayıf';
      } else if (e.code == 'email-already-in-use') {
        errorMessage = 'Bu email zaten kullanımda';
      } else if (e.code == 'invalid-email') {
        errorMessage = 'Geçersiz email';
      }
      state = state.copyWith(isLoading: false, error: errorMessage);
      return false;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Bağlantı hatası');
      return false;
    }
  }

  /// Send email verification
  Future<void> sendEmailVerification() async {
    final user = _firebaseAuth.currentUser;
    if (user != null && !user.emailVerified) {
      await user.sendEmailVerification();
    }
  }

  /// Legacy login (for backward compatibility)
  Future<bool> login(String email, String password) async {
    return signInWithEmail(email, password);
  }

  /// Legacy register (for backward compatibility)
  Future<bool> register(String name, String email, String password) async {
    return registerWithEmail(name, email, password);
  }

  /// Logout
  Future<void> logout() async {
    await _googleSignIn.signOut();
    await _firebaseAuth.signOut();
    await _secureStorage.delete(key: 'auth_token');
    apiService.setAuthToken(null);
    state = const AuthState();
  }
}

/// Providers
final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage();
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final secureStorage = ref.watch(secureStorageProvider);
  return AuthNotifier(secureStorage);
});

/// Theme Provider
final themeModeProvider = StateProvider<bool>(
  (ref) => true,
); // true = dark mode

/// SharedPreferences Provider
final sharedPreferencesProvider = FutureProvider<SharedPreferences>((
  ref,
) async {
  return await SharedPreferences.getInstance();
});

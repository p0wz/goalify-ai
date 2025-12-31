import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../data/services/api_service.dart';

/// Auth State
class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final String? token;
  final User? user;
  final String? error;

  const AuthState({
    this.isAuthenticated = false,
    this.isLoading = false,
    this.token,
    this.user,
    this.error,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    String? token,
    User? user,
    String? error,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      token: token ?? this.token,
      user: user ?? this.user,
      error: error,
    );
  }
}

/// User Model
class User {
  final String id;
  final String name;
  final String email;
  final String role;
  final bool isPremium;

  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.isPremium = false,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'user',
      isPremium: json['isPremium'] ?? false,
    );
  }
}

/// Auth Notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final FlutterSecureStorage _secureStorage;

  AuthNotifier(this._secureStorage) : super(const AuthState()) {
    _loadToken();
  }

  Future<void> _loadToken() async {
    state = state.copyWith(isLoading: true);

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

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await apiService.login(email, password);

      if (response['success'] == true) {
        final token = response['token'];
        final userData = response['user'];

        await _secureStorage.write(key: 'auth_token', value: token);
        apiService.setAuthToken(token);

        state = state.copyWith(
          isAuthenticated: true,
          token: token,
          user: userData != null ? User.fromJson(userData) : null,
          isLoading: false,
        );
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response['error'] ?? 'Giriş başarısız',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Bağlantı hatası');
      return false;
    }
  }

  Future<bool> register(String name, String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await apiService.register(name, email, password);

      if (response['success'] == true) {
        final token = response['token'];
        final userData = response['user'];

        await _secureStorage.write(key: 'auth_token', value: token);
        apiService.setAuthToken(token);

        state = state.copyWith(
          isAuthenticated: true,
          token: token,
          user: userData != null ? User.fromJson(userData) : null,
          isLoading: false,
        );
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response['error'] ?? 'Kayıt başarısız',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Bağlantı hatası');
      return false;
    }
  }

  Future<void> logout() async {
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

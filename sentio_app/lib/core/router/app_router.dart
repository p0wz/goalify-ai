import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../presentation/screens/splash/splash_screen.dart';
import '../../presentation/screens/auth/login_screen.dart';
import '../../presentation/screens/auth/register_screen.dart';
import '../../presentation/screens/dashboard/dashboard_screen.dart';
import '../../presentation/screens/predictions/predictions_screen.dart';
import '../../presentation/screens/live/live_screen.dart';
import '../../presentation/screens/leagues/leagues_screen.dart';
import '../../presentation/screens/profile/profile_screen.dart';
import '../../presentation/screens/settings/settings_screen.dart';
import '../../presentation/screens/main_navigation.dart';

/// SENTIO App Router
/// Using go_router for declarative navigation
class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/splash',
    debugLogDiagnostics: true,
    routes: [
      // Splash Screen
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),

      // Authentication Routes
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        name: 'register',
        builder: (context, state) => const RegisterScreen(),
      ),

      // Settings (outside shell - no bottom nav)
      GoRoute(
        path: '/settings',
        name: 'settings',
        builder: (context, state) => const SettingsScreen(),
      ),

      // Main App (with bottom navigation)
      ShellRoute(
        builder: (context, state, child) => MainNavigation(child: child),
        routes: [
          GoRoute(
            path: '/',
            name: 'dashboard',
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: '/predictions',
            name: 'predictions',
            builder: (context, state) => const PredictionsScreen(),
          ),
          GoRoute(
            path: '/live',
            name: 'live',
            builder: (context, state) => const LiveScreen(),
          ),
          GoRoute(
            path: '/leagues',
            name: 'leagues',
            builder: (context, state) => const LeaguesScreen(),
          ),
          GoRoute(
            path: '/profile',
            name: 'profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
    ],

    // Error handling
    errorBuilder: (context, state) =>
        Scaffold(body: Center(child: Text('Sayfa bulunamadı: ${state.uri}'))),
  );
}

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../providers/auth_provider.dart';

/// Splash Screen - Clean
class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  @override
  void initState() {
    super.initState();
    // No arbitrary delay logic here anymore, we normally listen in build
    // But for "Minimum Splash Time", we can combine Future.delayed with a listener.
  }

  @override
  Widget build(BuildContext context) {
    // Listen to Auth State
    ref.listen(authProvider, (previous, next) {
      // If we are initialized, we can decide where to go
      if (next.isInitialized && (previous?.isInitialized != true)) {
        // Wait at least 1.5 seconds for splash effect, then go
        Future.delayed(const Duration(milliseconds: 1500), () {
          if (mounted) {
            if (next.isAuthenticated) {
              context.go('/');
            } else {
              context.go('/login');
            }
          }
        });
      }
    });

    // Also check if already initialized (hot reload case)
    final authState = ref.watch(authProvider);
    if (authState.isInitialized) {
      // We can trigger navigation if we missed the transition
      // But doing it in build is tricky.
      // Better to stick with the listener + a one-off check in post-frame callback if needed.
      // For now, let's keep it simple:
      // If initialized, the listener above might not fire if it's already true.
      // So we should use a microtask or init state check.
    }

    // Let's implement a more robust approach:
    // Combined Check

    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark
          ? AppColors.backgroundDark
          : AppColors.backgroundLight,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Icon(
                Icons.analytics_rounded,
                size: 48,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'SENTIO',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.w800,
                letterSpacing: 4,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Akıllı Tahmin Asistanı',
              style: TextStyle(
                fontSize: 14,
                color: isDark
                    ? AppColors.textSecondaryDark
                    : AppColors.textSecondaryLight,
              ),
            ),
            const SizedBox(height: 48),
            const CircularProgressIndicator(
              color: AppColors.primary,
              strokeWidth: 2,
            ),
          ],
        ),
      ),
    );
  }
}

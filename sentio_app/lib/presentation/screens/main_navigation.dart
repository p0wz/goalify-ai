import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_strings.dart';

/// Main Navigation - Clean with subtle blur
class MainNavigation extends ConsumerWidget {
  final Widget child;

  const MainNavigation({super.key, required this.child});

  int _getSelectedIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();
    if (location.startsWith('/predictions')) return 1;
    if (location.startsWith('/stats')) return 2;
    if (location.startsWith('/profile')) return 3;
    return 0;
  }

  void _onItemTapped(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/');
        break;
      case 1:
        context.go('/predictions');
        break;
      case 2:
        context.go('/stats');
        break;
      case 3:
        context.go('/profile');
        break;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedIndex = _getSelectedIndex(context);
    final strings = ref.watch(stringsProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: child,
      extendBody: true,
      bottomNavigationBar: ClipRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: Container(
            decoration: BoxDecoration(
              color:
                  (isDark
                          ? AppColors.backgroundDark
                          : AppColors.backgroundLight)
                      .withAlpha(230),
              border: Border(
                top: BorderSide(
                  color: isDark ? AppColors.borderDark : AppColors.borderLight,
                  width: 1,
                ),
              ),
            ),
            child: SafeArea(
              child: SizedBox(
                height: 64,
                child: Row(
                  children: [
                    _buildNavItem(
                      context,
                      Icons.home_outlined,
                      Icons.home_rounded,
                      strings.home,
                      selectedIndex == 0,
                      () => _onItemTapped(context, 0),
                    ),
                    _buildNavItem(
                      context,
                      Icons.layers_outlined,
                      Icons.layers_rounded,
                      strings.bets,
                      selectedIndex == 1,
                      () => _onItemTapped(context, 1),
                    ),
                    _buildNavItem(
                      context,
                      Icons.bar_chart_outlined,
                      Icons.bar_chart_rounded,
                      'İstatistik',
                      selectedIndex == 2,
                      () => _onItemTapped(context, 2),
                    ),
                    _buildNavItem(
                      context,
                      Icons.person_outline_rounded,
                      Icons.person_rounded,
                      strings.profile,
                      selectedIndex == 3,
                      () => _onItemTapped(context, 3),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(
    BuildContext context,
    IconData icon,
    IconData activeIcon,
    String label,
    bool isSelected,
    VoidCallback onTap,
  ) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isSelected ? activeIcon : icon,
              color: isSelected
                  ? AppColors.primary
                  : AppColors.textMuted(context),
              size: 24,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                color: isSelected
                    ? AppColors.primary
                    : AppColors.textMuted(context),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/l10n/app_strings.dart';

/// Main Navigation Shell - 4 Tab Layout
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
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkCard : AppColors.lightCard,
          border: Border(
            top: BorderSide(
              color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
              width: 0.5,
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
                  icon: Icons.home_rounded,
                  label: strings.home,
                  isSelected: selectedIndex == 0,
                  onTap: () => _onItemTapped(context, 0),
                ),
                _buildNavItem(
                  context,
                  icon: Icons.track_changes_rounded,
                  label: strings.bets,
                  isSelected: selectedIndex == 1,
                  onTap: () => _onItemTapped(context, 1),
                  isPrimary: true,
                ),
                _buildNavItem(
                  context,
                  icon: Icons.bar_chart_rounded,
                  label: 'İstatistikler',
                  isSelected: selectedIndex == 2,
                  onTap: () => _onItemTapped(context, 2),
                ),
                _buildNavItem(
                  context,
                  icon: Icons.person_rounded,
                  label: strings.profile,
                  isSelected: selectedIndex == 3,
                  onTap: () => _onItemTapped(context, 3),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(
    BuildContext context, {
    required IconData icon,
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
    bool isPrimary = false,
  }) {
    final color = isSelected
        ? (isPrimary ? AppColors.primaryPurple : AppColors.primaryPurple)
        : Theme.of(context).colorScheme.onSurface.withAlpha(102);

    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: EdgeInsets.all(isSelected ? 8 : 6),
              decoration: isSelected
                  ? BoxDecoration(
                      color: AppColors.primaryPurple.withAlpha(25),
                      borderRadius: BorderRadius.circular(12),
                    )
                  : null,
              child: Icon(icon, color: color, size: isSelected ? 24 : 22),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                color: color,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

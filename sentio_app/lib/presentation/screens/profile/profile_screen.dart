import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/l10n/app_strings.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common/glass_card.dart';
import '../../widgets/common/gradient_button.dart';

/// Profile Screen - Premium Design with i18n
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final strings = ref.watch(stringsProvider);

    if (!authState.isAuthenticated) {
      return _buildLoginPrompt(context, strings);
    }

    return Scaffold(
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              floating: true,
              title: Text(strings.profile),
              actions: [
                IconButton(
                  icon: const Icon(Icons.settings_outlined),
                  onPressed: () => context.push('/settings'),
                ),
              ],
            ),
            SliverPadding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  _buildProfileHeader(context, authState, strings),
                  const SizedBox(height: AppSpacing.xxl),
                  _buildStatsGrid(context, strings),
                  const SizedBox(height: AppSpacing.xxl),
                  _buildMenuSection(context, ref, strings),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoginPrompt(BuildContext context, AppStrings strings) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.xxl),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    gradient: AppColors.gradientPrimary,
                    shape: BoxShape.circle,
                    boxShadow: [AppShadows.primaryGlow],
                  ),
                  child: const Icon(
                    Icons.person_outline_rounded,
                    size: 56,
                    color: Colors.white,
                  ),
                ).animate().fadeIn().scale(),
                const SizedBox(height: AppSpacing.xxl),
                Text(
                  strings.loginToProfile,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ).animate().fadeIn(delay: 100.ms),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  strings.loginToProfileSubtitle,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Theme.of(
                      context,
                    ).colorScheme.onSurface.withAlpha(153),
                    fontSize: 15,
                  ),
                ).animate().fadeIn(delay: 200.ms),
                const SizedBox(height: AppSpacing.xxxl),
                GradientButton(
                  text: strings.login,
                  onPressed: () => context.go('/login'),
                ).animate().fadeIn(delay: 300.ms),
                const SizedBox(height: AppSpacing.md),
                TextButton(
                  onPressed: () => context.go('/register'),
                  child: Text('${strings.noAccount} ${strings.register}'),
                ).animate().fadeIn(delay: 400.ms),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildProfileHeader(
    BuildContext context,
    AuthState authState,
    AppStrings strings,
  ) {
    final user = authState.user;
    final email = user?.email ?? '';
    final name = user?.name ?? email.split('@').first;
    final initials = name.isNotEmpty ? name[0].toUpperCase() : 'U';
    final isPremium = user?.isPremium ?? false;

    return Column(
      children: [
        // Avatar with glow
        Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            boxShadow: [AppShadows.primaryGlowStrong],
          ),
          child: Container(
            width: 110,
            height: 110,
            decoration: BoxDecoration(
              gradient: AppColors.gradientPrimary,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                initials,
                style: const TextStyle(
                  fontSize: 42,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ).animate().fadeIn(duration: 500.ms).scale(delay: 100.ms),

        const SizedBox(height: AppSpacing.lg),

        Text(
          name,
          style: Theme.of(
            context,
          ).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w700),
        ).animate().fadeIn(delay: 200.ms),

        const SizedBox(height: AppSpacing.sm),

        // Badge
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          decoration: BoxDecoration(
            gradient: isPremium ? AppColors.gradientPremium : null,
            color: isPremium ? null : AppColors.darkMuted,
            borderRadius: BorderRadius.circular(AppRadius.full),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (isPremium) ...[
                const Icon(Icons.star_rounded, size: 16, color: Colors.white),
                const SizedBox(width: 6),
              ],
              Text(
                isPremium ? strings.proPlan : strings.freePlan,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ).animate().fadeIn(delay: 300.ms),

        const SizedBox(height: AppSpacing.sm),

        Text(
          email,
          style: TextStyle(
            fontSize: 14,
            color: Theme.of(context).colorScheme.onSurface.withAlpha(128),
          ),
        ).animate().fadeIn(delay: 400.ms),
      ],
    );
  }

  Widget _buildStatsGrid(BuildContext context, AppStrings strings) {
    return Row(
      children: [
        Expanded(
          child: _buildStatItem(
            context,
            '-',
            strings.totalPredictions,
            AppColors.primaryPurple,
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: _buildStatItem(
            context,
            '-',
            strings.successRate,
            AppColors.winGreen,
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: _buildStatItem(
            context,
            '-',
            strings.won,
            AppColors.accentOrange,
          ),
        ),
      ],
    ).animate().fadeIn(delay: 500.ms);
  }

  Widget _buildStatItem(
    BuildContext context,
    String value,
    String label,
    Color color,
  ) {
    return GlassCard(
      variant: GlassCardVariant.elevated,
      padding: const EdgeInsets.symmetric(
        vertical: AppSpacing.lg,
        horizontal: AppSpacing.sm,
      ),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: Theme.of(context).colorScheme.onSurface.withAlpha(153),
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildMenuSection(
    BuildContext context,
    WidgetRef ref,
    AppStrings strings,
  ) {
    final menuItems = [
      {
        'icon': Icons.workspace_premium_rounded,
        'title': strings.premium,
        'route': '/premium',
      },
      {
        'icon': Icons.notifications_outlined,
        'title': strings.notifications,
        'route': '/notifications',
      },
      {
        'icon': Icons.settings_outlined,
        'title': strings.settings,
        'route': '/settings',
      },
      {
        'icon': Icons.help_outline_rounded,
        'title': strings.help,
        'route': '/help',
      },
    ];

    return Column(
      children: [
        GlassCard(
          padding: EdgeInsets.zero,
          child: Column(
            children: menuItems.asMap().entries.map((entry) {
              final index = entry.key;
              final item = entry.value;
              final isLast = index == menuItems.length - 1;

              return Column(
                children: [
                  ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primaryPurple.withAlpha(25),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        item['icon'] as IconData,
                        color: AppColors.primaryPurple,
                        size: 20,
                      ),
                    ),
                    title: Text(
                      item['title'] as String,
                      style: const TextStyle(fontWeight: FontWeight.w500),
                    ),
                    trailing: Icon(
                      Icons.chevron_right_rounded,
                      color: Theme.of(
                        context,
                      ).colorScheme.onSurface.withAlpha(77),
                    ),
                    onTap: () => context.push(item['route'] as String),
                  ),
                  if (!isLast)
                    Divider(
                      height: 1,
                      indent: 64,
                      color: Theme.of(context).dividerColor,
                    ),
                ],
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        // Logout Button
        GlassCard(
          variant: GlassCardVariant.danger,
          padding: EdgeInsets.zero,
          onTap: () => _handleLogout(context, ref, strings),
          child: ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.loseRed.withAlpha(25),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.logout_rounded,
                color: AppColors.loseRed,
                size: 20,
              ),
            ),
            title: Text(
              strings.logout,
              style: const TextStyle(
                fontWeight: FontWeight.w500,
                color: AppColors.loseRed,
              ),
            ),
          ),
        ),
      ],
    ).animate().fadeIn(delay: 600.ms).slideY(begin: 0.05);
  }

  void _handleLogout(
    BuildContext context,
    WidgetRef ref,
    AppStrings strings,
  ) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(strings.logout),
        content: Text(strings.logoutConfirm),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(strings.cancel),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(
              strings.logout,
              style: const TextStyle(color: AppColors.loseRed),
            ),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await ref.read(authProvider.notifier).logout();
      if (context.mounted) context.go('/login');
    }
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/l10n/app_strings.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common/app_card.dart';

/// Profile Screen
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
        bottom: false,
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
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                0,
                AppSpacing.lg,
                100,
              ),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  const SizedBox(height: AppSpacing.lg),
                  _buildHeader(context, authState, strings),
                  const SizedBox(height: AppSpacing.xxl),
                  _buildMenu(context, ref, strings),
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
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.xxl),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppColors.primary.withAlpha(25),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.person_outline_rounded,
                  size: 40,
                  color: AppColors.primary,
                ),
              ).animate().fadeIn().scale(),
              const SizedBox(height: AppSpacing.xxl),
              Text(
                strings.loginToProfile,
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                strings.loginToProfileSubtitle,
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.textSecondary),
              ),
              const SizedBox(height: AppSpacing.xxxl),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => context.go('/login'),
                  child: Text(strings.login),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              TextButton(
                onPressed: () => context.go('/register'),
                child: Text('${strings.noAccount} ${strings.register}'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(
    BuildContext context,
    AuthState authState,
    AppStrings strings,
  ) {
    final user = authState.user;
    final email = user?.email ?? '';
    final name = user?.name ?? email.split('@').first;
    final initial = name.isNotEmpty ? name[0].toUpperCase() : 'U';
    final isPremium = user?.isPremium ?? false;

    return Column(
      children: [
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: AppColors.primary,
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              initial,
              style: const TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ),
        ).animate().fadeIn().scale(),
        const SizedBox(height: AppSpacing.lg),
        Text(
          name,
          style: Theme.of(context).textTheme.headlineMedium,
        ).animate().fadeIn(delay: 100.ms),
        const SizedBox(height: AppSpacing.xs),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: isPremium ? AppColors.primary.withAlpha(25) : AppColors.card,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isPremium
                  ? AppColors.primary.withAlpha(77)
                  : AppColors.border,
            ),
          ),
          child: Text(
            isPremium ? strings.proPlan : strings.freePlan,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: isPremium ? AppColors.primary : AppColors.textSecondary,
            ),
          ),
        ).animate().fadeIn(delay: 200.ms),
        const SizedBox(height: AppSpacing.xs),
        Text(
          email,
          style: TextStyle(fontSize: 13, color: AppColors.textMuted),
        ).animate().fadeIn(delay: 300.ms),
      ],
    );
  }

  Widget _buildMenu(BuildContext context, WidgetRef ref, AppStrings strings) {
    final items = [
      {
        'icon': Icons.workspace_premium_rounded,
        'label': strings.premium,
        'route': '/premium',
      },
      {
        'icon': Icons.notifications_outlined,
        'label': strings.notifications,
        'route': '/notifications',
      },
      {
        'icon': Icons.settings_outlined,
        'label': strings.settings,
        'route': '/settings',
      },
      {
        'icon': Icons.help_outline_rounded,
        'label': strings.help,
        'route': '/help',
      },
    ];

    return Column(
      children: [
        AppCard(
          padding: EdgeInsets.zero,
          child: Column(
            children: items.asMap().entries.map((e) {
              final i = e.key;
              final item = e.value;
              return Column(
                children: [
                  ListTile(
                    leading: Icon(
                      item['icon'] as IconData,
                      color: AppColors.textSecondary,
                    ),
                    title: Text(item['label'] as String),
                    trailing: const Icon(
                      Icons.chevron_right_rounded,
                      color: AppColors.textMuted,
                    ),
                    onTap: () => context.push(item['route'] as String),
                  ),
                  if (i < items.length - 1)
                    Divider(height: 1, indent: 56, color: AppColors.border),
                ],
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        AppCard(
          variant: AppCardVariant.danger,
          padding: EdgeInsets.zero,
          onTap: () => _logout(context, ref, strings),
          child: ListTile(
            leading: const Icon(Icons.logout_rounded, color: AppColors.danger),
            title: Text(
              strings.logout,
              style: const TextStyle(color: AppColors.danger),
            ),
          ),
        ),
      ],
    ).animate().fadeIn(delay: 400.ms);
  }

  void _logout(BuildContext context, WidgetRef ref, AppStrings strings) async {
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
              style: const TextStyle(color: AppColors.danger),
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

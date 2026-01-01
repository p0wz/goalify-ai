import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/l10n/app_strings.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common/clean_card.dart';

/// Profile Screen - Clean Design
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
              backgroundColor: Colors.transparent,
              title: Row(
                children: [
                  Icon(Icons.person_rounded, color: AppColors.primary),
                  const SizedBox(width: 10),
                  Text(strings.profile),
                ],
              ),
              actions: [
                IconButton(
                  icon: Icon(
                    Icons.settings_outlined,
                    color: AppColors.textSecondary(context),
                  ),
                  onPressed: () => context.push('/settings'),
                ),
                const SizedBox(width: 8),
              ],
            ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                0,
                AppSpacing.lg,
                120,
              ),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  const SizedBox(height: AppSpacing.xl),
                  _buildHeader(context, authState, strings),
                  const SizedBox(height: AppSpacing.xxxl),
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
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.person_outline_rounded,
                  size: 48,
                  color: Colors.white,
                ),
              ).animate().fadeIn().scale(),
              const SizedBox(height: AppSpacing.xxl),
              Text(
                strings.loginToProfile,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                strings.loginToProfileSubtitle,
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.textSecondary(context)),
              ),
              const SizedBox(height: AppSpacing.xxxl),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => context.go('/login'),
                  icon: const Icon(Icons.login_rounded),
                  label: Text(strings.login),
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
          padding: const EdgeInsets.all(3),
          decoration: BoxDecoration(
            color: AppColors.primary,
            shape: BoxShape.circle,
          ),
          child: Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.card(context),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                initial,
                style: const TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
              ),
            ),
          ),
        ).animate().fadeIn().scale(),
        const SizedBox(height: AppSpacing.lg),
        Text(
          name,
          style: Theme.of(
            context,
          ).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w700),
        ).animate().fadeIn(delay: 100.ms),
        const SizedBox(height: AppSpacing.sm),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: isPremium ? AppColors.warning : AppColors.card(context),
            borderRadius: BorderRadius.circular(20),
            border: isPremium
                ? null
                : Border.all(color: AppColors.border(context)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                isPremium
                    ? Icons.workspace_premium_rounded
                    : Icons.person_outline_rounded,
                size: 16,
                color: isPremium
                    ? Colors.white
                    : AppColors.textSecondary(context),
              ),
              const SizedBox(width: 6),
              Text(
                isPremium ? strings.proPlan : strings.freePlan,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: isPremium
                      ? Colors.white
                      : AppColors.textSecondary(context),
                ),
              ),
            ],
          ),
        ).animate().fadeIn(delay: 200.ms),
        const SizedBox(height: AppSpacing.sm),
        Text(
          email,
          style: TextStyle(fontSize: 14, color: AppColors.textMuted(context)),
        ).animate().fadeIn(delay: 300.ms),
      ],
    );
  }

  Widget _buildMenu(BuildContext context, WidgetRef ref, AppStrings strings) {
    return Column(
      children: [
        CleanCard(
          padding: EdgeInsets.zero,
          child: Column(
            children: [
              _buildMenuItem(
                context,
                Icons.workspace_premium_rounded,
                strings.premium,
                AppColors.warning,
                () => context.push('/premium'),
              ),
              _divider(context),
              _buildMenuItem(
                context,
                Icons.notifications_outlined,
                strings.notifications,
                AppColors.primary,
                () => context.push('/notifications'),
              ),
              _divider(context),
              _buildMenuItem(
                context,
                Icons.settings_outlined,
                strings.settings,
                AppColors.textSecondary(context),
                () => context.push('/settings'),
              ),
              _divider(context),
              _buildMenuItem(
                context,
                Icons.help_outline_rounded,
                strings.help,
                AppColors.success,
                () {},
              ),
            ],
          ),
        ).animate().fadeIn(delay: 400.ms),
        const SizedBox(height: AppSpacing.lg),
        CleanCard(
          variant: CleanCardVariant.danger,
          padding: EdgeInsets.zero,
          onTap: () => _logout(context, ref, strings),
          child: ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.danger,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.logout_rounded,
                color: Colors.white,
                size: 18,
              ),
            ),
            title: const Text(
              'Çıkış Yap',
              style: TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
        ).animate().fadeIn(delay: 500.ms),
      ],
    );
  }

  Widget _buildMenuItem(
    BuildContext context,
    IconData icon,
    String label,
    Color color,
    VoidCallback onTap,
  ) {
    return ListTile(
      onTap: onTap,
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: color.withAlpha(25),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, color: color, size: 20),
      ),
      title: Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
      trailing: Icon(
        Icons.chevron_right_rounded,
        color: AppColors.textMuted(context),
      ),
    );
  }

  Widget _divider(BuildContext context) =>
      Divider(height: 1, indent: 60, color: AppColors.border(context));

  void _logout(BuildContext context, WidgetRef ref, AppStrings strings) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(strings.logout),
        content: Text(strings.logoutConfirm),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(strings.cancel),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
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

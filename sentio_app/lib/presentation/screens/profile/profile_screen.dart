import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/l10n/app_strings.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common/premium_card.dart';

/// Profile Screen - Vibrant Design
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
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColors.background, Color(0xFF12101F)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SafeArea(
          bottom: false,
          child: CustomScrollView(
            slivers: [
              SliverAppBar(
                floating: true,
                backgroundColor: Colors.transparent,
                title: Row(
                  children: [
                    ShaderMask(
                      shaderCallback: (bounds) =>
                          AppColors.gradientAccent.createShader(bounds),
                      child: const Icon(
                        Icons.person_rounded,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Text(strings.profile),
                  ],
                ),
                actions: [
                  IconButton(
                    icon: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.card,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.settings_outlined, size: 20),
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
      ),
    );
  }

  Widget _buildLoginPrompt(BuildContext context, AppStrings strings) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColors.background, Color(0xFF12101F)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.xxl),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: AppColors.gradientPrimary,
                    shape: BoxShape.circle,
                    boxShadow: [AppShadows.primaryGlowStrong],
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
                  style: TextStyle(color: AppColors.textSecondary),
                ),
                const SizedBox(height: AppSpacing.xxxl),
                SizedBox(
                  width: double.infinity,
                  child: GradientButton(
                    text: strings.login,
                    icon: Icons.login_rounded,
                    onPressed: () => context.go('/login'),
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                TextButton(
                  onPressed: () => context.go('/register'),
                  child: Text(
                    '${strings.noAccount} ${strings.register}',
                    style: const TextStyle(color: AppColors.accent),
                  ),
                ),
              ],
            ),
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
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            gradient: AppColors.gradientPrimary,
            shape: BoxShape.circle,
            boxShadow: [AppShadows.primaryGlow],
          ),
          child: Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.card,
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
            gradient: isPremium ? AppColors.gradientHot : null,
            color: isPremium ? null : AppColors.card,
            borderRadius: BorderRadius.circular(20),
            boxShadow: isPremium ? [AppShadows.warningGlow] : null,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                isPremium
                    ? Icons.workspace_premium_rounded
                    : Icons.person_outline_rounded,
                size: 16,
                color: isPremium ? Colors.white : AppColors.textSecondary,
              ),
              const SizedBox(width: 6),
              Text(
                isPremium ? strings.proPlan : strings.freePlan,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: isPremium ? Colors.white : AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ).animate().fadeIn(delay: 200.ms),
        const SizedBox(height: AppSpacing.sm),
        Text(
          email,
          style: TextStyle(fontSize: 14, color: AppColors.textMuted),
        ).animate().fadeIn(delay: 300.ms),
      ],
    );
  }

  Widget _buildMenu(BuildContext context, WidgetRef ref, AppStrings strings) {
    return Column(
      children: [
        PremiumCard(
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
              _divider(),
              _buildMenuItem(
                context,
                Icons.notifications_outlined,
                strings.notifications,
                AppColors.accent,
                () => context.push('/notifications'),
              ),
              _divider(),
              _buildMenuItem(
                context,
                Icons.settings_outlined,
                strings.settings,
                AppColors.primary,
                () => context.push('/settings'),
              ),
              _divider(),
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
        PremiumCard(
          variant: PremiumCardVariant.danger,
          padding: EdgeInsets.zero,
          onTap: () => _logout(context, ref, strings),
          child: ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                gradient: AppColors.gradientDanger,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.logout_rounded,
                color: Colors.white,
                size: 18,
              ),
            ),
            title: Text(
              'Çıkış Yap',
              style: const TextStyle(fontWeight: FontWeight.w600),
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
      trailing: const Icon(
        Icons.chevron_right_rounded,
        color: AppColors.textMuted,
      ),
    );
  }

  Widget _divider() => Divider(height: 1, indent: 60, color: AppColors.border);

  void _logout(BuildContext context, WidgetRef ref, AppStrings strings) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.cardElevated,
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

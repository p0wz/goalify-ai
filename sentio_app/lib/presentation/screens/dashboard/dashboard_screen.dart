import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/l10n/app_strings.dart';
import '../../widgets/common/glass_card.dart';
import '../../widgets/common/gradient_button.dart';

/// Dashboard / Home Screen - Clean Design
class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final strings = ref.watch(stringsProvider);

    return Scaffold(
      body: SafeArea(
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // App Bar
            SliverAppBar(
              floating: true,
              title: ShaderMask(
                shaderCallback: (bounds) =>
                    AppColors.gradientPrimary.createShader(bounds),
                child: const Text(
                  'SENTIO',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 2,
                    color: Colors.white,
                  ),
                ),
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.notifications_outlined),
                  onPressed: () => context.push('/notifications'),
                ),
                IconButton(
                  icon: const Icon(Icons.settings_outlined),
                  onPressed: () => context.push('/settings'),
                ),
              ],
            ),

            // Content
            SliverPadding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  // Welcome Section
                  _buildWelcomeSection(context, strings),
                  const SizedBox(height: AppSpacing.xxxl),

                  // Quick Actions
                  _buildQuickActions(context, strings),
                  const SizedBox(height: AppSpacing.xxxl),

                  // Info Cards
                  _buildInfoSection(context, strings),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWelcomeSection(BuildContext context, AppStrings strings) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              '${strings.welcome} ',
              style: Theme.of(
                context,
              ).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w700),
            ),
            const Text('👋', style: TextStyle(fontSize: 28)),
          ],
        ).animate().fadeIn(duration: 500.ms).slideX(begin: -0.1),
        const SizedBox(height: 6),
        Text(
          strings.todayPredictions,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
            color: Theme.of(context).colorScheme.onSurface.withAlpha(153),
          ),
        ).animate().fadeIn(delay: 200.ms, duration: 500.ms),
      ],
    );
  }

  Widget _buildQuickActions(BuildContext context, AppStrings strings) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                gradient: AppColors.gradientPrimary,
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Icon(
                Icons.bolt_rounded,
                size: 14,
                color: Colors.white,
              ),
            ),
            const SizedBox(width: 10),
            Text(
              strings.quickActions,
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.lg),
        Row(
          children: [
            Expanded(
              child: GradientButton(
                text: strings.bets,
                icon: Icons.track_changes_rounded,
                onPressed: () => context.go('/predictions'),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: GlassCard(
                variant: GlassCardVariant.elevated,
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                onTap: () => context.go('/stats'),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.winGreen.withAlpha(25),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.bar_chart_rounded,
                        size: 24,
                        color: AppColors.winGreen,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'İstatistikler',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        GlassCard(
          variant: GlassCardVariant.premium,
          padding: const EdgeInsets.symmetric(
            vertical: AppSpacing.lg,
            horizontal: AppSpacing.lg,
          ),
          onTap: () => context.push('/premium'),
          child: Row(
            children: [
              ShaderMask(
                shaderCallback: (bounds) =>
                    AppColors.gradientPremium.createShader(bounds),
                child: const Icon(
                  Icons.workspace_premium_rounded,
                  size: 32,
                  color: Colors.white,
                ),
              ),
              const SizedBox(width: AppSpacing.lg),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      strings.premium,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    Text(
                      'Tüm özelliklere erişin',
                      style: TextStyle(
                        fontSize: 12,
                        color: Theme.of(
                          context,
                        ).colorScheme.onSurface.withAlpha(153),
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.arrow_forward_ios_rounded, size: 16),
            ],
          ),
        ),
      ],
    ).animate().fadeIn(delay: 300.ms, duration: 400.ms);
  }

  Widget _buildInfoSection(BuildContext context, AppStrings strings) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.accentOrange.withAlpha(25),
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Icon(
                Icons.info_outline_rounded,
                size: 14,
                color: AppColors.accentOrange,
              ),
            ),
            const SizedBox(width: 10),
            Text(
              'Nasıl Çalışır?',
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.lg),
        _buildInfoCard(
          context,
          icon: Icons.track_changes_rounded,
          title: 'Bahisler',
          description: 'Günlük tahminlerimizi inceleyin',
          color: AppColors.primaryPurple,
        ),
        const SizedBox(height: AppSpacing.md),
        _buildInfoCard(
          context,
          icon: Icons.bar_chart_rounded,
          title: 'İstatistikler',
          description: 'Geçmiş sonuçları ve başarı oranını görün',
          color: AppColors.winGreen,
        ),
      ],
    ).animate().fadeIn(delay: 500.ms, duration: 400.ms);
  }

  Widget _buildInfoCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String description,
    required Color color,
  }) {
    return GlassCard(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withAlpha(25),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                Text(
                  description,
                  style: TextStyle(
                    fontSize: 12,
                    color: Theme.of(
                      context,
                    ).colorScheme.onSurface.withAlpha(153),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

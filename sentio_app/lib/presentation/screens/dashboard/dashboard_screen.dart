import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../data/services/api_service.dart';
import '../../widgets/common/glass_card.dart';
import '../../widgets/common/gradient_button.dart';

/// Settled bets provider for dashboard
final settledBetsProvider = FutureProvider<List<Map<String, dynamic>>>((
  ref,
) async {
  try {
    final response = await apiService.getMobileBets(status: 'WON');
    final wonBets = (response['bets'] as List?) ?? [];

    final lostResponse = await apiService.getMobileBets(status: 'LOST');
    final lostBets = (lostResponse['bets'] as List?) ?? [];

    final allSettled = [...wonBets, ...lostBets];
    allSettled.sort(
      (a, b) => (b['createdAt'] ?? '').compareTo(a['createdAt'] ?? ''),
    );

    return allSettled.take(5).toList().cast<Map<String, dynamic>>();
  } catch (e) {
    return [];
  }
});

/// Dashboard / Home Screen - Premium Design
class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final strings = ref.watch(stringsProvider);
    final settledBetsAsync = ref.watch(settledBetsProvider);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async => ref.refresh(settledBetsProvider),
          color: AppColors.primaryPurple,
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
                    const SizedBox(height: AppSpacing.xxl),

                    // Stats Grid
                    _buildStatsGrid(context, strings),
                    const SizedBox(height: AppSpacing.xxl),

                    // Quick Actions
                    _buildQuickActions(context, strings),
                    const SizedBox(height: AppSpacing.xxl),

                    // Recent Activity
                    _buildRecentActivity(
                      context,
                      ref,
                      strings,
                      settledBetsAsync,
                    ),
                    const SizedBox(height: AppSpacing.xxl),
                  ]),
                ),
              ),
            ],
          ),
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

  Widget _buildStatsGrid(BuildContext context, AppStrings strings) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: AppSpacing.md,
      crossAxisSpacing: AppSpacing.md,
      childAspectRatio: 1.4,
      children: [
        _buildStatCard(
          context,
          title: strings.totalPredictions,
          value: '-',
          icon: Icons.track_changes_rounded,
          gradient: AppColors.gradientPrimary,
          index: 0,
        ),
        _buildStatCard(
          context,
          title: strings.successRate,
          value: '-',
          icon: Icons.trending_up_rounded,
          gradient: AppColors.gradientSuccess,
          index: 1,
        ),
        _buildStatCard(
          context,
          title: strings.pending,
          value: '-',
          icon: Icons.hourglass_empty_rounded,
          gradient: AppColors.gradientAccent,
          index: 2,
        ),
        _buildStatCard(
          context,
          title: strings.won,
          value: '-',
          icon: Icons.emoji_events_rounded,
          gradient: AppColors.gradientSuccess,
          index: 3,
        ),
      ],
    );
  }

  Widget _buildStatCard(
    BuildContext context, {
    required String title,
    required String value,
    required IconData icon,
    required LinearGradient gradient,
    required int index,
  }) {
    return GlassCard(
          variant: GlassCardVariant.elevated,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  gradient: gradient,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  boxShadow: [
                    BoxShadow(
                      color: gradient.colors.first.withAlpha(77),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Icon(icon, color: Colors.white, size: 20),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    value,
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  Text(
                    title,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(
                        context,
                      ).colorScheme.onSurface.withAlpha(153),
                    ),
                  ),
                ],
              ),
            ],
          ),
        )
        .animate()
        .fadeIn(
          delay: Duration(milliseconds: 300 + (index * 80)),
          duration: 400.ms,
        )
        .slideY(begin: 0.1);
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
        const SizedBox(height: AppSpacing.md),
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
                variant: GlassCardVariant.premium,
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                onTap: () => context.push('/premium'),
                child: Column(
                  children: [
                    ShaderMask(
                      shaderCallback: (bounds) =>
                          AppColors.gradientPremium.createShader(bounds),
                      child: const Icon(
                        Icons.workspace_premium_rounded,
                        size: 28,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      strings.premium,
                      style: const TextStyle(
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
      ],
    ).animate().fadeIn(delay: 500.ms, duration: 400.ms);
  }

  Widget _buildRecentActivity(
    BuildContext context,
    WidgetRef ref,
    AppStrings strings,
    AsyncValue<List<Map<String, dynamic>>> settledBetsAsync,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
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
                    Icons.history_rounded,
                    size: 14,
                    color: AppColors.accentOrange,
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  strings.recentActivity,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
            TextButton(
              onPressed: () => context.go('/predictions'),
              child: Text(strings.viewAll),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        settledBetsAsync.when(
          loading: () => GlassCard(
            child: const Center(
              child: Padding(
                padding: EdgeInsets.all(32),
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            ),
          ),
          error: (e, _) => GlassCard(
            variant: GlassCardVariant.danger,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Center(child: Text('${strings.error}: $e')),
            ),
          ),
          data: (bets) {
            if (bets.isEmpty) {
              return GlassCard(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Center(
                    child: Column(
                      children: [
                        Icon(
                          Icons.history_rounded,
                          size: 48,
                          color: Theme.of(
                            context,
                          ).colorScheme.onSurface.withAlpha(51),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          strings.noSettledBets,
                          style: TextStyle(
                            color: Theme.of(
                              context,
                            ).colorScheme.onSurface.withAlpha(102),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }

            return Column(
              children: bets.asMap().entries.map((entry) {
                final index = entry.key;
                final bet = entry.value;
                return _buildActivityItem(context, strings, bet, index);
              }).toList(),
            );
          },
        ),
      ],
    ).animate().fadeIn(delay: 600.ms, duration: 400.ms);
  }

  Widget _buildActivityItem(
    BuildContext context,
    AppStrings strings,
    Map<String, dynamic> bet,
    int index,
  ) {
    final isWin = bet['status'] == 'WON';
    final match = '${bet['homeTeam']} vs ${bet['awayTeam']}';
    final market = bet['market'] ?? '';
    final odds = bet['odds'] ?? '';
    final finalScore = bet['finalScore'] ?? '';

    return Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.sm),
          child: GlassCard(
            variant: isWin ? GlassCardVariant.success : GlassCardVariant.danger,
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    gradient: isWin
                        ? AppColors.gradientSuccess
                        : AppColors.gradientDanger,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    isWin ? Icons.check_rounded : Icons.close_rounded,
                    color: Colors.white,
                    size: 18,
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        match,
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        market,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Theme.of(
                            context,
                          ).colorScheme.onSurface.withAlpha(153),
                        ),
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    if (finalScore.isNotEmpty)
                      Text(
                        finalScore,
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 14,
                          color: isWin ? AppColors.winGreen : AppColors.loseRed,
                        ),
                      ),
                    if (odds.isNotEmpty)
                      Text(
                        odds,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Theme.of(
                            context,
                          ).colorScheme.onSurface.withAlpha(102),
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
        )
        .animate()
        .fadeIn(
          delay: Duration(milliseconds: index * 80),
          duration: 300.ms,
        )
        .slideX(begin: 0.05);
  }
}

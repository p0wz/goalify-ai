import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/l10n/app_strings.dart';
import '../../widgets/common/clean_card.dart';
import '../../providers/live_provider.dart';
import '../../providers/stats_provider.dart';
import '../../providers/live_history_provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common/premium_banner.dart';

/// Dashboard - Clean & Modern
class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    // Auto-fetch data on load
    Future.microtask(() {
      ref.refresh(settledBetsProvider); // Correct way to refresh FutureProvider
      ref
          .read(liveHistoryProvider.notifier)
          .fetchHistory(); // Fetch stats via history provider
    });
  }

  @override
  Widget build(BuildContext context) {
    final strings = ref.watch(stringsProvider);
    final user = ref.watch(authProvider).user;
    final isPremium = user?.isPremium ?? false;

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: CustomScrollView(
          slivers: [
            // Header
            SliverAppBar(
              floating: true,
              backgroundColor: Colors.transparent,
              title: Text(
                'SENTIO',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 2,
                  color: AppColors.primary,
                ),
              ),
              actions: [
                IconButton(
                  icon: Icon(
                    Icons.notifications_outlined,
                    color: AppColors.textSecondary(context),
                  ),
                  onPressed: () => context.push('/notifications'),
                ),
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

            // Content
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                0,
                AppSpacing.lg,
                120,
              ),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  const SizedBox(height: AppSpacing.lg),

                  // Premium Banner (Upsell) - Safe check
                  if (!isPremium) ...[
                    const PremiumBanner(),
                    const SizedBox(height: AppSpacing.lg),
                  ],

                  _buildWelcome(context, strings),
                  const SizedBox(height: AppSpacing.lg),
                  _buildWinRates(context, ref),
                  const SizedBox(height: AppSpacing.xxl),
                  _buildHeroCard(context, strings),
                  const SizedBox(height: AppSpacing.xxl),
                  _buildQuickActions(context, strings),
                  const SizedBox(height: AppSpacing.xxl),

                  // Live History Preview (New)
                  _buildLiveHistoryPreview(context, ref),
                  const SizedBox(height: AppSpacing.xxl),

                  // Live Results (Bot) - Kept for compatibility if needed, using History instead now
                  // _buildLiveResults(context, ref),
                  _buildAnalysisResults(context, ref),
                  const SizedBox(height: 100),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWelcome(BuildContext context, AppStrings strings) {
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
        ),
        const SizedBox(height: 4),
        Text(
          strings.todayPredictions,
          style: TextStyle(
            fontSize: 15,
            color: AppColors.textSecondary(context),
          ),
        ),
      ],
    ).animate().fadeIn(duration: 400.ms).slideX(begin: -0.05);
  }

  Widget _buildWinRates(BuildContext context, WidgetRef ref) {
    // USE LIVE HISTORY PROVIDER FOR STATS (Since it's verified to work)
    final state = ref.watch(liveHistoryProvider);

    return Row(
      children: [
        Expanded(
          child: _buildWinRateCard(
            context,
            'Günlük Başarı',
            '%${state.dailyWinRate}',
            AppColors.primary,
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: _buildWinRateCard(
            context,
            'Aylık Başarı',
            '%${state.monthlyWinRate}',
            AppColors.success,
          ),
        ),
      ],
    ).animate().fadeIn(delay: 100.ms, duration: 400.ms);
  }

  Widget _buildWinRateCard(
    BuildContext context,
    String label,
    String value,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: color.withAlpha(20),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withAlpha(40)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.trending_up, size: 16, color: color),
              const SizedBox(width: 8),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textMuted(context),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroCard(BuildContext context, AppStrings strings) {
    return CleanCard(
      variant: CleanCardVariant.primary,
      padding: const EdgeInsets.all(AppSpacing.xl),
      onTap: () => context.go('/predictions'),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(
              Icons.layers_rounded,
              color: Colors.white,
              size: 28,
            ),
          ),
          const SizedBox(width: AppSpacing.lg),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Günün Tahminleri',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 4),
                Text(
                  'Bahisleri incele ve kazan',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary(context),
                  ),
                ),
              ],
            ),
          ),
          Icon(Icons.arrow_forward_rounded, color: AppColors.primary),
        ],
      ),
    ).animate().fadeIn(delay: 200.ms, duration: 400.ms).slideY(begin: 0.05);
  }

  Widget _buildQuickActions(BuildContext context, AppStrings strings) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(Icons.bolt_rounded, color: AppColors.primary, size: 20),
            const SizedBox(width: 8),
            Text(
              strings.quickActions,
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.lg),
        Row(
          children: [
            Expanded(
              child: _buildActionCard(
                context,
                icon: Icons.bar_chart_rounded,
                label: 'İstatistik',
                color: AppColors.success,
                onTap: () => context.go('/stats'),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: _buildActionCard(
                context,
                icon: Icons.workspace_premium_rounded,
                label: strings.premium,
                color: AppColors.warning,
                onTap: () => context.push('/premium'),
              ),
            ),
          ],
        ),
      ],
    ).animate().fadeIn(delay: 300.ms, duration: 400.ms);
  }

  Widget _buildActionCard(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return CleanCard(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: Colors.white, size: 24),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            label,
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _buildLiveHistoryPreview(BuildContext context, WidgetRef ref) {
    final state = ref.watch(liveSignalsProvider);
    final history = state.historySignals.take(5).toList(); // Show top 5 history

    if (history.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Icon(Icons.history, color: AppColors.primary, size: 20),
                const SizedBox(width: 8),
                Text(
                  'Canlı Geçmişi',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            TextButton(
              onPressed: () =>
                  context.push('/live-history'), // Corrected route path
              child: const Text('Tümünü Gör'),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        SizedBox(
          height: 100,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: history.length,
            clipBehavior: Clip.none,
            itemBuilder: (context, index) {
              final signal = history[index];
              return Padding(
                padding: const EdgeInsets.only(right: 12),
                child: _buildMiniResultCard(
                  context,
                  home: signal.homeTeam,
                  away: signal.awayTeam,
                  score: signal.finalScore ?? '-',
                  isWin: signal.status == 'WON',
                  label: signal.market,
                ),
              );
            },
          ),
        ),
      ],
    ).animate().fadeIn(delay: 400.ms, duration: 400.ms);
  }

  Widget _buildAnalysisResults(BuildContext context, WidgetRef ref) {
    final settledAsync = ref.watch(settledBetsProvider);

    return settledAsync.when(
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
      data: (bets) {
        if (bets.isEmpty) return const SizedBox.shrink();

        final results = bets.take(10).toList(); // Show last 10

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.analytics_outlined,
                  color: AppColors.success,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  'Analiz Sonuçları',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            SizedBox(
              height: 100,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: results.length,
                clipBehavior: Clip.none,
                itemBuilder: (context, index) {
                  final bet = results[index];
                  return Padding(
                    padding: const EdgeInsets.only(right: 12),
                    child: _buildMiniResultCard(
                      context,
                      home: bet['homeTeam'],
                      away: bet['awayTeam'],
                      score: bet['finalScore'] ?? '-',
                      isWin: bet['status'] == 'WON',
                      label: bet['market'] ?? 'Analiz',
                    ),
                  );
                },
              ),
            ),
          ],
        ).animate().fadeIn(delay: 500.ms, duration: 400.ms);
      },
    );
  }

  Widget _buildMiniResultCard(
    BuildContext context, {
    required String home,
    required String away,
    required String score,
    required bool isWin,
    required String label,
  }) {
    return SizedBox(
      width: 160,
      child: CleanCard(
        padding: const EdgeInsets.all(12),
        variant: isWin ? CleanCardVariant.success : CleanCardVariant.danger,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 6,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: (isWin ? AppColors.success : AppColors.danger)
                        .withOpacity(0.2),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    isWin ? 'WON' : 'LOST',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: isWin ? AppColors.success : AppColors.danger,
                    ),
                  ),
                ),
                Text(
                  score,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              '$home\n$away',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                height: 1.2,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 10,
                color: AppColors.textMuted(context),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

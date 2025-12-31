import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../data/services/api_service.dart';
import '../../widgets/common/glass_card.dart';

/// Settled bets provider for dashboard
final settledBetsProvider = FutureProvider<List<Map<String, dynamic>>>((
  ref,
) async {
  try {
    final response = await apiService.getMobileBets(status: 'WON');
    final wonBets = (response['bets'] as List?) ?? [];

    final lostResponse = await apiService.getMobileBets(status: 'LOST');
    final lostBets = (lostResponse['bets'] as List?) ?? [];

    // Combine and sort by createdAt
    final allSettled = [...wonBets, ...lostBets];
    allSettled.sort(
      (a, b) => (b['createdAt'] ?? '').compareTo(a['createdAt'] ?? ''),
    );

    return allSettled.take(5).toList().cast<Map<String, dynamic>>();
  } catch (e) {
    return [];
  }
});

/// Dashboard / Home Screen
class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settledBetsAsync = ref.watch(settledBetsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('SENTIO'),
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
      body: RefreshIndicator(
        onRefresh: () async => ref.refresh(settledBetsProvider),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome Section
              _buildWelcomeSection(context),
              const SizedBox(height: AppSpacing.xxl),

              // Stats Grid
              _buildStatsGrid(context),
              const SizedBox(height: AppSpacing.xxl),

              // Quick Actions
              _buildQuickActions(context),
              const SizedBox(height: AppSpacing.xxl),

              // Recent Activity - Settled Bets
              _buildRecentActivity(context, ref, settledBetsAsync),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildWelcomeSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              'Hoş Geldin! ',
              style: Theme.of(
                context,
              ).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
            const Text('👋', style: TextStyle(fontSize: 24)),
          ],
        ).animate().fadeIn(duration: 400.ms).slideX(begin: -0.1, end: 0),
        const SizedBox(height: 4),
        Text(
          'Bugünün tahminleri hazır.',
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
            color: Theme.of(context).colorScheme.onSurface.withAlpha(153),
          ),
        ).animate().fadeIn(delay: 200.ms, duration: 400.ms),
      ],
    );
  }

  Widget _buildStatsGrid(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: AppSpacing.md,
      crossAxisSpacing: AppSpacing.md,
      childAspectRatio: 1.5,
      children: [
        _buildStatCard(
          context,
          title: 'Toplam Tahmin',
          value: '-',
          icon: Icons.track_changes_rounded,
          color: AppColors.primaryPurple,
        ),
        _buildStatCard(
          context,
          title: 'Başarı Oranı',
          value: '-',
          icon: Icons.trending_up_rounded,
          color: AppColors.winGreen,
        ),
        _buildStatCard(
          context,
          title: 'Bekleyen',
          value: '-',
          icon: Icons.hourglass_empty_rounded,
          color: AppColors.accentOrange,
        ),
        _buildStatCard(
          context,
          title: 'Kazanılan',
          value: '-',
          icon: Icons.emoji_events_rounded,
          color: AppColors.winGreen,
        ),
      ],
    ).animate().fadeIn(delay: 300.ms, duration: 400.ms);
  }

  Widget _buildStatCard(
    BuildContext context, {
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withAlpha(25),
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              Text(
                title,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Theme.of(context).colorScheme.onSurface.withAlpha(153),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.bolt_rounded, size: 20),
            const SizedBox(width: 8),
            Text(
              'Hızlı İşlemler',
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        Row(
          children: [
            Expanded(
              child: _buildQuickActionButton(
                context,
                icon: Icons.track_changes_rounded,
                label: 'Bahisler',
                gradient: AppColors.gradientPrimary,
                onTap: () => context.go('/predictions'),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: _buildQuickActionButton(
                context,
                icon: Icons.workspace_premium_rounded,
                label: 'Premium',
                gradient: AppColors.gradientAccent,
                onTap: () => context.push('/premium'),
              ),
            ),
          ],
        ),
      ],
    ).animate().fadeIn(delay: 400.ms, duration: 400.ms);
  }

  Widget _buildQuickActionButton(
    BuildContext context, {
    required IconData icon,
    required String label,
    required LinearGradient gradient,
    required VoidCallback onTap,
  }) {
    return Container(
      decoration: BoxDecoration(
        gradient: gradient,
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppRadius.md),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
            child: Column(
              children: [
                Icon(icon, color: Colors.white, size: 24),
                const SizedBox(height: 4),
                Text(
                  label,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRecentActivity(
    BuildContext context,
    WidgetRef ref,
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
                const Icon(Icons.history_rounded, size: 20),
                const SizedBox(width: 8),
                Text(
                  'Son Aktiviteler',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            TextButton(
              onPressed: () => context.go('/predictions'),
              child: const Text('Tümünü Gör'),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        settledBetsAsync.when(
          loading: () => const GlassCard(
            child: Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: CircularProgressIndicator(),
              ),
            ),
          ),
          error: (e, _) => GlassCard(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Center(child: Text('Hata: $e')),
            ),
          ),
          data: (bets) {
            if (bets.isEmpty) {
              return GlassCard(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Center(
                    child: Column(
                      children: [
                        Icon(
                          Icons.history_rounded,
                          size: 40,
                          color: Theme.of(
                            context,
                          ).colorScheme.onSurface.withAlpha(77),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Henüz sonuçlanmış bahis yok',
                          style: TextStyle(
                            color: Theme.of(
                              context,
                            ).colorScheme.onSurface.withAlpha(128),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }

            return GlassCard(
              padding: EdgeInsets.zero,
              child: Column(
                children: bets.asMap().entries.map((entry) {
                  final index = entry.key;
                  final bet = entry.value;
                  final isWin = bet['status'] == 'WON';
                  final match = '${bet['homeTeam']} - ${bet['awayTeam']}';
                  final market = bet['market'] ?? '';
                  final odds = bet['odds'] ?? '';
                  final finalScore = bet['finalScore'] ?? '';

                  return Column(
                    children: [
                      if (index > 0) const Divider(height: 1),
                      _buildActivityItem(
                        context,
                        match: match,
                        market: market,
                        result: isWin ? 'Kazandı' : 'Kaybetti',
                        odds: odds,
                        finalScore: finalScore,
                        isWin: isWin,
                      ),
                    ],
                  );
                }).toList(),
              ),
            );
          },
        ),
      ],
    ).animate().fadeIn(delay: 600.ms, duration: 400.ms);
  }

  Widget _buildActivityItem(
    BuildContext context, {
    required String match,
    required String market,
    required String result,
    required String odds,
    required String finalScore,
    required bool isWin,
  }) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: (isWin ? AppColors.winGreen : AppColors.loseRed).withAlpha(
                25,
              ),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isWin ? Icons.check_rounded : Icons.close_rounded,
              color: isWin ? AppColors.winGreen : AppColors.loseRed,
              size: 16,
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
                    fontWeight: FontWeight.w500,
                    fontSize: 13,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  market,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Theme.of(
                      context,
                    ).colorScheme.onSurface.withAlpha(153),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
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
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                    color: isWin ? AppColors.winGreen : AppColors.loseRed,
                  ),
                ),
              if (odds.isNotEmpty)
                Text(
                  odds,
                  style: TextStyle(
                    fontSize: 11,
                    color: Theme.of(
                      context,
                    ).colorScheme.onSurface.withAlpha(128),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../data/services/api_service.dart';
import '../../widgets/common/glass_card.dart';

/// Provider for settled bets with market filter
final selectedMarketProvider = StateProvider<String?>((ref) => null);

final settledBetsProvider = FutureProvider<List<Map<String, dynamic>>>((
  ref,
) async {
  try {
    final wonResponse = await apiService.getMobileBets(status: 'WON');
    final wonBets = (wonResponse['bets'] as List?) ?? [];

    final lostResponse = await apiService.getMobileBets(status: 'LOST');
    final lostBets = (lostResponse['bets'] as List?) ?? [];

    final allSettled = [...wonBets, ...lostBets];
    allSettled.sort(
      (a, b) => (b['createdAt'] ?? '').compareTo(a['createdAt'] ?? ''),
    );

    return allSettled.cast<Map<String, dynamic>>();
  } catch (e) {
    return [];
  }
});

/// Statistics Screen - Settled bets with market filter
class StatsScreen extends ConsumerWidget {
  const StatsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final strings = ref.watch(stringsProvider);
    final settledBetsAsync = ref.watch(settledBetsProvider);
    final selectedMarket = ref.watch(selectedMarketProvider);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async => ref.refresh(settledBetsProvider),
          color: AppColors.primaryPurple,
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              SliverAppBar(floating: true, title: const Text('İstatistikler')),
              SliverPadding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    // Success Rate Card
                    _buildSuccessRateCard(context, settledBetsAsync),
                    const SizedBox(height: AppSpacing.xxl),

                    // Market Filter
                    _buildMarketFilter(
                      context,
                      ref,
                      settledBetsAsync,
                      selectedMarket,
                    ),
                    const SizedBox(height: AppSpacing.lg),

                    // Settled Bets List
                    _buildSettledBetsList(
                      context,
                      strings,
                      settledBetsAsync,
                      selectedMarket,
                    ),
                  ]),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSuccessRateCard(
    BuildContext context,
    AsyncValue<List<Map<String, dynamic>>> betsAsync,
  ) {
    return betsAsync.when(
      loading: () => GlassCard(
        variant: GlassCardVariant.elevated,
        child: const Center(child: CircularProgressIndicator(strokeWidth: 2)),
      ),
      error: (e, _) => const SizedBox.shrink(),
      data: (bets) {
        final total = bets.length;
        final won = bets.where((b) => b['status'] == 'WON').length;
        final successRate = total > 0 ? (won / total * 100) : 0.0;

        return GlassCard(
          variant: GlassCardVariant.elevated,
          showGlow: true,
          child: Column(
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      gradient: AppColors.gradientSuccess,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.trending_up_rounded,
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.lg),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Genel Başarı Oranı',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${successRate.toStringAsFixed(1)}%',
                          style: const TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.w800,
                            color: AppColors.winGreen,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '$won / $total',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Kazanılan / Toplam',
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
            ],
          ),
        ).animate().fadeIn(duration: 400.ms);
      },
    );
  }

  Widget _buildMarketFilter(
    BuildContext context,
    WidgetRef ref,
    AsyncValue<List<Map<String, dynamic>>> betsAsync,
    String? selectedMarket,
  ) {
    return betsAsync.when(
      loading: () => const SizedBox.shrink(),
      error: (e, _) => const SizedBox.shrink(),
      data: (bets) {
        // Extract unique markets
        final markets = bets
            .map((b) => b['market'] as String? ?? '')
            .where((m) => m.isNotEmpty)
            .toSet()
            .toList();
        markets.sort();

        if (markets.isEmpty) return const SizedBox.shrink();

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Market Filtresi',
              style: TextStyle(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: AppSpacing.sm),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip(
                    context,
                    label: 'Tümü',
                    isSelected: selectedMarket == null,
                    onTap: () =>
                        ref.read(selectedMarketProvider.notifier).state = null,
                  ),
                  const SizedBox(width: 8),
                  ...markets.map(
                    (market) => Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: _buildFilterChip(
                        context,
                        label: market,
                        isSelected: selectedMarket == market,
                        onTap: () =>
                            ref.read(selectedMarketProvider.notifier).state =
                                market,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ).animate().fadeIn(delay: 200.ms);
      },
    );
  }

  Widget _buildFilterChip(
    BuildContext context, {
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          gradient: isSelected ? AppColors.gradientPrimary : null,
          color: isSelected ? null : AppColors.darkMuted,
          borderRadius: BorderRadius.circular(20),
          border: isSelected ? null : Border.all(color: AppColors.darkBorder),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
            color: isSelected
                ? Colors.white
                : Theme.of(context).colorScheme.onSurface.withAlpha(179),
          ),
        ),
      ),
    );
  }

  Widget _buildSettledBetsList(
    BuildContext context,
    AppStrings strings,
    AsyncValue<List<Map<String, dynamic>>> betsAsync,
    String? selectedMarket,
  ) {
    return betsAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('${strings.error}: $e')),
      data: (bets) {
        // Filter by market
        final filteredBets = selectedMarket == null
            ? bets
            : bets.where((b) => b['market'] == selectedMarket).toList();

        if (filteredBets.isEmpty) {
          return GlassCard(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Center(
                child: Column(
                  children: [
                    Icon(
                      Icons.bar_chart_rounded,
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
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Sonuçlar (${filteredBets.length})',
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
            ),
            const SizedBox(height: AppSpacing.md),
            ...filteredBets.asMap().entries.map((entry) {
              final index = entry.key;
              final bet = entry.value;
              return _buildBetCard(context, bet, index);
            }),
          ],
        );
      },
    );
  }

  Widget _buildBetCard(
    BuildContext context,
    Map<String, dynamic> bet,
    int index,
  ) {
    final isWin = bet['status'] == 'WON';
    final match = '${bet['homeTeam']} vs ${bet['awayTeam']}';
    final market = bet['market'] ?? '';
    final odds = bet['odds'] ?? '';
    final finalScore = bet['finalScore'] ?? '';
    final matchTime = bet['matchTime'] ?? '';
    final league = bet['league'] ?? '';

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: GlassCard(
        variant: isWin ? GlassCardVariant.success : GlassCardVariant.danger,
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    gradient: isWin
                        ? AppColors.gradientSuccess
                        : AppColors.gradientDanger,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    isWin ? Icons.check_rounded : Icons.close_rounded,
                    color: Colors.white,
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
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (league.isNotEmpty)
                        Text(
                          league,
                          style: TextStyle(
                            fontSize: 11,
                            color: Theme.of(
                              context,
                            ).colorScheme.onSurface.withAlpha(128),
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
                          fontSize: 16,
                          color: isWin ? AppColors.winGreen : AppColors.loseRed,
                        ),
                      ),
                    Text(
                      isWin ? 'Kazandı' : 'Kaybetti',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: isWin ? AppColors.winGreen : AppColors.loseRed,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            // Info row
            Row(
              children: [
                _buildInfoChip(context, Icons.track_changes_rounded, market),
                if (odds.isNotEmpty) ...[
                  const SizedBox(width: 8),
                  _buildInfoChip(context, Icons.trending_up_rounded, odds),
                ],
                if (matchTime.isNotEmpty) ...[
                  const SizedBox(width: 8),
                  _buildInfoChip(context, Icons.access_time_rounded, matchTime),
                ],
              ],
            ),
          ],
        ),
      ),
    ).animate().fadeIn(
      delay: Duration(milliseconds: index * 50),
      duration: 300.ms,
    );
  }

  Widget _buildInfoChip(BuildContext context, IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface.withAlpha(128),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 12,
            color: Theme.of(context).colorScheme.onSurface.withAlpha(153),
          ),
          const SizedBox(width: 4),
          Text(
            text,
            style: TextStyle(
              fontSize: 11,
              color: Theme.of(context).colorScheme.onSurface.withAlpha(179),
            ),
          ),
        ],
      ),
    );
  }
}

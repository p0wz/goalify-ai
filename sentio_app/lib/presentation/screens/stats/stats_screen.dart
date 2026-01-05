import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/l10n/app_strings.dart';
import '../../widgets/common/clean_card.dart';

import '../../providers/stats_provider.dart';

/// Providers
final selectedMarketProvider = StateProvider<String?>((ref) => null);

/// Statistics Screen - Clean Design
class StatsView extends ConsumerWidget {
  const StatsView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final strings = ref.watch(stringsProvider);
    final settledBetsAsync = ref.watch(settledBetsProvider);
    final selectedMarket = ref.watch(selectedMarketProvider);

    return RefreshIndicator(
      onRefresh: () async => ref.refresh(settledBetsProvider),
      color: AppColors.primary,
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              AppSpacing.lg,
              AppSpacing.lg,
              120,
            ),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                _buildSuccessRate(context, settledBetsAsync),
                const SizedBox(height: AppSpacing.xxl),
                _buildMarketFilter(
                  context,
                  ref,
                  settledBetsAsync,
                  selectedMarket,
                ),
                const SizedBox(height: AppSpacing.lg),
                _buildBetsList(
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
    );
  }

  Widget _buildSuccessRate(
    BuildContext context,
    AsyncValue<List<Map<String, dynamic>>> betsAsync,
  ) {
    return betsAsync.when(
      loading: () => CleanCard(
        child: const Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
      ),
      error: (e, _) => const SizedBox.shrink(),
      data: (bets) {
        final total = bets.length;
        final won = bets.where((b) => b['status'] == 'WON').length;
        final rate = total > 0 ? (won / total * 100) : 0.0;

        return CleanCard(
          variant: CleanCardVariant.success,
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.success,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(
                  Icons.trending_up_rounded,
                  color: Colors.white,
                  size: 28,
                ),
              ),
              const SizedBox(width: AppSpacing.lg),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Başarı Oranı',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.textMuted(context),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${rate.toStringAsFixed(1)}%',
                      style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w800,
                        color: AppColors.success,
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.success.withAlpha(25),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '$won / $total',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.success,
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Kazanılan',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textMuted(context),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.05);
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
            Text(
              'Market Filtresi',
              style: TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary(context),
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildChip(
                    context,
                    'Tümü',
                    selectedMarket == null,
                    () =>
                        ref.read(selectedMarketProvider.notifier).state = null,
                  ),
                  const SizedBox(width: 8),
                  ...markets.map(
                    (m) => Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: _buildChip(
                        context,
                        m,
                        selectedMarket == m,
                        () =>
                            ref.read(selectedMarketProvider.notifier).state = m,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ).animate().fadeIn(delay: 100.ms);
      },
    );
  }

  Widget _buildChip(
    BuildContext context,
    String label,
    bool isSelected,
    VoidCallback onTap,
  ) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.card(context),
          borderRadius: BorderRadius.circular(20),
          border: isSelected
              ? null
              : Border.all(color: AppColors.border(context)),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
            color: isSelected ? Colors.white : AppColors.textSecondary(context),
          ),
        ),
      ),
    );
  }

  Widget _buildBetsList(
    BuildContext context,
    AppStrings strings,
    AsyncValue<List<Map<String, dynamic>>> betsAsync,
    String? selectedMarket,
  ) {
    return betsAsync.when(
      loading: () => const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      ),
      error: (e, _) => Center(child: Text('${strings.error}: $e')),
      data: (bets) {
        final filtered = selectedMarket == null
            ? bets
            : bets.where((b) => b['market'] == selectedMarket).toList();

        if (filtered.isEmpty) {
          return CleanCard(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    Icon(
                      Icons.bar_chart_outlined,
                      size: 40,
                      color: AppColors.textMuted(context),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Text(
                      strings.noSettledBets,
                      style: TextStyle(color: AppColors.textSecondary(context)),
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
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Sonuçlar',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary(context),
                  ),
                ),
                Text(
                  '${filtered.length}',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.textMuted(context),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            ...filtered.asMap().entries.map(
              (e) => _buildBetCard(context, e.value, e.key),
            ),
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

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: CleanCard(
        variant: isWin ? CleanCardVariant.success : CleanCardVariant.danger,
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: isWin ? AppColors.success : AppColors.danger,
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
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textMuted(context),
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
                      color: isWin ? AppColors.success : AppColors.danger,
                    ),
                  ),
                if (odds.isNotEmpty)
                  Text(
                    odds,
                    style: TextStyle(
                      fontSize: 11,
                      color: AppColors.textMuted(context),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    ).animate().fadeIn(
      delay: Duration(milliseconds: index * 50),
      duration: 250.ms,
    );
  }
}

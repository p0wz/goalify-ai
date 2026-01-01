import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../data/services/api_service.dart';
import '../../widgets/common/glass_card.dart';

/// Provider for pending bets only
final pendingBetsProvider = FutureProvider<List<Map<String, dynamic>>>((
  ref,
) async {
  try {
    final response = await apiService.getMobileBets(status: 'PENDING');
    final bets = (response['bets'] as List?) ?? [];
    return bets.cast<Map<String, dynamic>>();
  } catch (e) {
    return [];
  }
});

/// Predictions/Bets Screen - Shows only PENDING bets
class PredictionsScreen extends ConsumerWidget {
  const PredictionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final strings = ref.watch(stringsProvider);
    final pendingBetsAsync = ref.watch(pendingBetsProvider);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async => ref.refresh(pendingBetsProvider),
          color: AppColors.primaryPurple,
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              SliverAppBar(
                floating: true,
                title: Text(strings.bets),
                actions: [
                  IconButton(
                    icon: const Icon(Icons.refresh_rounded),
                    onPressed: () => ref.refresh(pendingBetsProvider),
                  ),
                ],
              ),
              SliverPadding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                sliver: pendingBetsAsync.when(
                  loading: () => const SliverFillRemaining(
                    child: Center(child: CircularProgressIndicator()),
                  ),
                  error: (e, _) => SliverFillRemaining(
                    child: Center(child: Text('${strings.error}: $e')),
                  ),
                  data: (bets) {
                    if (bets.isEmpty) {
                      return SliverFillRemaining(
                        child: Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.track_changes_rounded,
                                size: 64,
                                color: Theme.of(
                                  context,
                                ).colorScheme.onSurface.withAlpha(51),
                              ),
                              const SizedBox(height: AppSpacing.lg),
                              Text(
                                strings.noPendingBets,
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Theme.of(
                                    context,
                                  ).colorScheme.onSurface.withAlpha(128),
                                ),
                              ),
                              const SizedBox(height: AppSpacing.sm),
                              Text(
                                'Yeni tahminler yakında eklenecek',
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Theme.of(
                                    context,
                                  ).colorScheme.onSurface.withAlpha(102),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }

                    return SliverList(
                      delegate: SliverChildBuilderDelegate((context, index) {
                        if (index == 0) {
                          return Padding(
                            padding: const EdgeInsets.only(
                              bottom: AppSpacing.lg,
                            ),
                            child: Text(
                              'Günün Tahminleri (${bets.length})',
                              style: const TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 16,
                              ),
                            ),
                          );
                        }
                        final bet = bets[index - 1];
                        return _buildBetCard(context, bet, index - 1);
                      }, childCount: bets.length + 1),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBetCard(
    BuildContext context,
    Map<String, dynamic> bet,
    int index,
  ) {
    final homeTeam = bet['homeTeam'] ?? '';
    final awayTeam = bet['awayTeam'] ?? '';
    final market = bet['market'] ?? '';
    final odds = bet['odds'] ?? '';
    final matchTime = bet['matchTime'] ?? '';
    final league = bet['league'] ?? '';

    return Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.md),
          child: GlassCard(
            variant: GlassCardVariant.elevated,
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // League & Time
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    if (league.isNotEmpty)
                      Text(
                        league,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: AppColors.primaryPurple,
                        ),
                      ),
                    if (matchTime.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.accentOrange.withAlpha(25),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.access_time_rounded,
                              size: 12,
                              color: AppColors.accentOrange,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              matchTime,
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: AppColors.accentOrange,
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),

                // Teams
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        children: [
                          Text(
                            homeTeam,
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 15,
                            ),
                            textAlign: TextAlign.center,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md,
                      ),
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.surface,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'VS',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: Column(
                        children: [
                          Text(
                            awayTeam,
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 15,
                            ),
                            textAlign: TextAlign.center,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.lg),

                // Prediction & Odds
                Container(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    gradient: AppColors.gradientPrimary.scale(0.3),
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    border: Border.all(
                      color: AppColors.primaryPurple.withAlpha(51),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(
                            Icons.track_changes_rounded,
                            size: 16,
                            color: AppColors.primaryPurple,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            market,
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                      if (odds.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.winGreen.withAlpha(25),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            odds,
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 14,
                              color: AppColors.winGreen,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        )
        .animate()
        .fadeIn(
          delay: Duration(milliseconds: index * 80),
          duration: 400.ms,
        )
        .slideY(begin: 0.05);
  }
}

extension LinearGradientExtension on LinearGradient {
  LinearGradient scale(double factor) {
    return LinearGradient(
      colors: colors
          .map((c) => c.withAlpha((c.alpha * factor).round()))
          .toList(),
      begin: begin,
      end: end,
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../data/services/api_service.dart';
import '../../widgets/common/premium_card.dart';

/// Providers
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

/// Statistics Screen - Vibrant Design
class StatsScreen extends ConsumerWidget {
  const StatsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final strings = ref.watch(stringsProvider);
    final settledBetsAsync = ref.watch(settledBetsProvider);
    final selectedMarket = ref.watch(selectedMarketProvider);

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
          child: RefreshIndicator(
            onRefresh: () async => ref.refresh(settledBetsProvider),
            color: AppColors.primary,
            child: CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                SliverAppBar(
                  floating: true,
                  backgroundColor: Colors.transparent,
                  title: Row(
                    children: [
                      ShaderMask(
                        shaderCallback: (bounds) =>
                            AppColors.gradientSuccess.createShader(bounds),
                        child: const Icon(
                          Icons.bar_chart_rounded,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(width: 10),
                      const Text('İstatistikler'),
                    ],
                  ),
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
                      const SizedBox(height: AppSpacing.lg),
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
          ),
        ),
      ),
    );
  }

  Widget _buildSuccessRate(
    BuildContext context,
    AsyncValue<List<Map<String, dynamic>>> betsAsync,
  ) {
    return betsAsync.when(
      loading: () => PremiumCard(
        variant: PremiumCardVariant.elevated,
        child: const Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
      ),
      error: (e, _) => const SizedBox.shrink(),
      data: (bets) {
        final total = bets.length;
        final won = bets.where((b) => b['status'] == 'WON').length;
        final rate = total > 0 ? (won / total * 100) : 0.0;

        return PremiumCard(
          variant: PremiumCardVariant.elevated,
          showGlow: true,
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  gradient: AppColors.gradientSuccess,
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [AppShadows.successGlow],
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
                        color: AppColors.textMuted,
                      ),
                    ),
                    const SizedBox(height: 4),
                    ShaderMask(
                      shaderCallback: (bounds) =>
                          AppColors.gradientSuccess.createShader(bounds),
                      child: Text(
                        '${rate.toStringAsFixed(1)}%',
                        style: const TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
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
                    style: TextStyle(fontSize: 12, color: AppColors.textMuted),
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
              style: Theme.of(
                context,
              ).textTheme.titleSmall?.copyWith(color: AppColors.textSecondary),
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
          gradient: isSelected ? AppColors.gradientPrimary : null,
          color: isSelected ? null : AppColors.card,
          borderRadius: BorderRadius.circular(20),
          border: isSelected ? null : Border.all(color: AppColors.border),
          boxShadow: isSelected ? [AppShadows.primaryGlow] : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
            color: isSelected ? Colors.white : AppColors.textSecondary,
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
          return PremiumCard(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    const Icon(
                      Icons.bar_chart_outlined,
                      size: 40,
                      color: AppColors.textMuted,
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Text(
                      strings.noSettledBets,
                      style: TextStyle(color: AppColors.textSecondary),
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
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                Text(
                  '${filtered.length}',
                  style: TextStyle(fontSize: 13, color: AppColors.textMuted),
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
      child: PremiumCard(
        variant: isWin ? PremiumCardVariant.success : PremiumCardVariant.danger,
        showGlow: true,
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
                    style: TextStyle(fontSize: 12, color: AppColors.textMuted),
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
                    style: TextStyle(fontSize: 11, color: AppColors.textMuted),
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

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../providers/live_history_provider.dart';
import '../../providers/live_provider.dart'; // For LiveSignal model
import '../../widgets/common/clean_card.dart';
import '../../providers/auth_provider.dart';

/// Live Signals History Screen
class LiveHistoryScreen extends ConsumerStatefulWidget {
  const LiveHistoryScreen({super.key});

  @override
  ConsumerState<LiveHistoryScreen> createState() => _LiveHistoryScreenState();
}

class _LiveHistoryScreenState extends ConsumerState<LiveHistoryScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      final authState = ref.read(authProvider);
      if (authState.isAuthenticated) {
        ref.read(liveHistoryProvider.notifier).fetchHistory();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(liveHistoryProvider);

    ref.listen(authProvider, (previous, next) {
      if (previous?.isAuthenticated != true && next.isAuthenticated) {
        ref.read(liveHistoryProvider.notifier).fetchHistory();
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('Canlı Geçmiş'),
        actions: [
          IconButton(
            onPressed: state.isLoading
                ? null
                : () => ref.read(liveHistoryProvider.notifier).refresh(),
            icon: state.isLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.refresh_rounded),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // Stats Header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Row(
                  children: [
                    _buildStatChip(
                      context,
                      'Günlük: %${state.dailyWinRate}',
                      AppColors.primary,
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    _buildStatChip(
                      context,
                      'Aylık: %${state.monthlyWinRate}',
                      AppColors.success,
                    ),
                  ],
                ),
              ),
            ),

            // Content
            if (state.error != null)
              SliverToBoxAdapter(child: Center(child: Text(state.error!)))
            else if (state.signals.isEmpty && !state.isLoading)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: CleanCard(
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.xl),
                      child: Column(
                        children: [
                          Icon(
                            Icons.history_toggle_off_rounded,
                            size: 64,
                            color: AppColors.textMuted(context),
                          ),
                          const SizedBox(height: AppSpacing.md),
                          Text(
                            'Geçmiş Yok',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate((context, index) {
                    final signal = state.signals[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: AppSpacing.md),
                      child: _buildSignalCard(context, signal),
                    );
                  }, childCount: state.signals.length),
                ),
              ),

            // Bottom padding
            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
    );
  }

  Widget _buildStatChip(BuildContext context, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        decoration: BoxDecoration(
          color: color.withAlpha(20),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withAlpha(50)),
        ),
        child: Text(
          value,
          textAlign: TextAlign.center,
          style: TextStyle(
            color: color,
            fontWeight: FontWeight.w700,
            fontSize: 14,
          ),
        ),
      ),
    );
  }

  Widget _buildSignalCard(BuildContext context, LiveSignal signal) {
    final statusColor = signal.isWon ? AppColors.success : AppColors.danger;
    final statusIcon = signal.isWon
        ? Icons.check_circle_rounded
        : Icons.cancel_rounded;
    final statusText = signal.isWon ? 'Kazandı' : 'Kaybetti';

    return CleanCard(
      variant: signal.isWon
          ? CleanCardVariant.success
          : CleanCardVariant.danger,
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${signal.homeTeam} vs ${signal.awayTeam}',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        signal.league,
                        style: TextStyle(
                          color: AppColors.textMuted(context),
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: statusColor.withAlpha(20),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Icon(statusIcon, size: 14, color: statusColor),
                      const SizedBox(width: 4),
                      Text(
                        statusText,
                        style: TextStyle(
                          color: statusColor,
                          fontWeight: FontWeight.w600,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            // Market & Score info similar to Live Screen but cleaner for history
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withAlpha(15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    signal.market,
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600,
                      fontSize: 12,
                    ),
                  ),
                ),
                const Spacer(),
                if (signal.finalScore != null)
                  Text(
                    'Skor: ${signal.finalScore}',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

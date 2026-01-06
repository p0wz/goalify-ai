import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../providers/live_provider.dart';
import '../../widgets/common/clean_card.dart';
import '../../providers/auth_provider.dart';

/// Live Signals Screen - Canlı Sinyaller
class LiveScreen extends ConsumerStatefulWidget {
  const LiveScreen({super.key});

  @override
  ConsumerState<LiveScreen> createState() => _LiveScreenState();
}

class _LiveScreenState extends ConsumerState<LiveScreen> {
  @override
  void initState() {
    super.initState();
    // Initial fetch if already authenticated AND premium
    Future.microtask(() {
      final authState = ref.read(authProvider);
      if (authState.isAuthenticated && (authState.user?.isPremium ?? false)) {
        ref.read(liveSignalsProvider.notifier).fetchSignals();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(liveSignalsProvider);
    final user = ref.watch(authProvider).user;
    final isPremium = user?.isPremium ?? false;

    // Listen to Auth State changes to trigger fetch ONLY if premium
    ref.listen(authProvider, (previous, next) {
      if (previous?.isAuthenticated != true &&
          next.isAuthenticated &&
          (next.user?.isPremium ?? false)) {
        ref.read(liveSignalsProvider.notifier).fetchSignals();
      }
    });

    return Scaffold(
      backgroundColor: AppColors.background(context),
      body: SafeArea(
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // Header
            SliverAppBar(
              floating: true,
              backgroundColor: Colors.transparent,
              title: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.danger.withAlpha(30),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      Icons.sensors,
                      color: AppColors.danger,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text('Canlı Sinyaller'),
                ],
              ),
              actions: [
                if (isPremium)
                  IconButton(
                    onPressed: state.isLoading
                        ? null
                        : () =>
                              ref.read(liveSignalsProvider.notifier).refresh(),
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

            // Content
            if (!isPremium)
              SliverFillRemaining(
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.lock_rounded,
                            size: 64,
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(height: 24),
                        const Text(
                          'Sadece Pro Üyeler',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Canlı sinyallere erişmek ve anlık bildirimler almak için Pro plana geçin.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 16,
                            color: AppColors.textSecondary(context),
                          ),
                        ),
                        const SizedBox(height: 32),
                        ElevatedButton(
                          onPressed: () => context.push('/premium'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 32,
                              vertical: 16,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(30),
                            ),
                          ),
                          child: const Text(
                            'Pro\'ya Geç',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              )
            else if (state.error != null)
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.all(AppSpacing.lg),
                  child: CleanCard(
                    child: Padding(
                      padding: EdgeInsets.all(AppSpacing.lg),
                      child: Column(
                        children: [
                          Icon(
                            Icons.error_outline,
                            size: 48,
                            color: AppColors.danger,
                          ),
                          SizedBox(height: AppSpacing.md),
                          Text(state.error!, textAlign: TextAlign.center),
                          SizedBox(height: AppSpacing.md),
                          ElevatedButton(
                            onPressed: () => ref
                                .read(liveSignalsProvider.notifier)
                                .refresh(),
                            child: const Text('Tekrar Dene'),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              )
            else if (state.signals.isEmpty && !state.isLoading)
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.all(AppSpacing.lg),
                  child: CleanCard(
                    child: Padding(
                      padding: EdgeInsets.all(AppSpacing.xl),
                      child: Column(
                        children: [
                          Icon(
                            Icons.sensors_off_rounded,
                            size: 64,
                            color: AppColors.textMuted(context),
                          ),
                          SizedBox(height: AppSpacing.md),
                          Text(
                            'Aktif Sinyal Yok',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          SizedBox(height: AppSpacing.xs),
                          Text(
                            'Yeni sinyaller yakında gelecek',
                            style: TextStyle(
                              color: AppColors.textMuted(context),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              )
            else
              SliverPadding(
                padding: EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate((context, index) {
                    final signal = state.signals[index];
                    return Padding(
                      padding: EdgeInsets.only(bottom: AppSpacing.md),
                      child: _buildSignalCard(context, signal),
                    );
                  }, childCount: state.signals.length),
                ),
              ),

            // Bottom padding for nav bar
            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
    );
  }

  Widget _buildSignalCard(BuildContext context, LiveSignal signal) {
    final statusColor = signal.isPending
        ? Colors.orange
        : signal.isWon
        ? AppColors.success
        : AppColors.danger;

    final statusIcon = signal.isPending
        ? Icons.pending_rounded
        : signal.isWon
        ? Icons.check_circle_rounded
        : Icons.cancel_rounded;

    final statusText = signal.isPending
        ? 'Bekliyor'
        : signal.isWon
        ? 'Kazandı'
        : 'Kaybetti';

    return CleanCard(
      child: Padding(
        padding: EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header: Teams + Status
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${signal.homeTeam} vs ${signal.awayTeam}',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.bold),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        signal.league,
                        style: TextStyle(
                          color: AppColors.textMuted(context),
                          fontSize: 12,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                // Status badge
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: statusColor.withAlpha(20),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
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

            SizedBox(height: AppSpacing.md),

            // Market chip
            Container(
              padding: EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.sm,
              ),
              decoration: BoxDecoration(
                color: AppColors.primary.withAlpha(15),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.primary.withAlpha(30)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.sports_soccer,
                    size: 16,
                    color: AppColors.primary,
                  ),
                  SizedBox(width: AppSpacing.xs),
                  Text(
                    signal.market,
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),

            SizedBox(height: AppSpacing.md),

            // Stats row
            Row(
              children: [
                _buildInfoChip(
                  context,
                  Icons.timer_outlined,
                  "${signal.entryMinute}'",
                ),
                SizedBox(width: AppSpacing.sm),
                _buildInfoChip(
                  context,
                  Icons.scoreboard_outlined,
                  signal.entryScore,
                ),
                SizedBox(width: AppSpacing.sm),
                _buildInfoChip(
                  context,
                  Icons.trending_up,
                  '${signal.confidence}%',
                ),
                if (signal.finalScore != null) ...[
                  SizedBox(width: AppSpacing.sm),
                  _buildInfoChip(
                    context,
                    Icons.flag,
                    signal.finalScore!,
                    highlight: true,
                  ),
                ],
              ],
            ),

            // Reason
            if (signal.reason.isNotEmpty) ...[
              SizedBox(height: AppSpacing.sm),
              Text(
                signal.reason,
                style: TextStyle(
                  color: AppColors.textMuted(context),
                  fontSize: 12,
                  fontStyle: FontStyle.italic,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildInfoChip(
    BuildContext context,
    IconData icon,
    String value, {
    bool highlight = false,
  }) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 4),
      decoration: BoxDecoration(
        color: highlight
            ? AppColors.success.withAlpha(20)
            : AppColors.card(context),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 12,
            color: highlight ? AppColors.success : AppColors.textMuted(context),
          ),
          const SizedBox(width: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: highlight ? AppColors.success : null,
            ),
          ),
        ],
      ),
    );
  }
}

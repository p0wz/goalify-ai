import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../data/services/api_service.dart';
import '../../widgets/common/glass_card.dart';

/// Mobile Bet Model
class MobileBet {
  final String id;
  final String homeTeam;
  final String awayTeam;
  final String league;
  final String market;
  final String? odds;
  final String status;
  final String? finalScore;
  final String? matchTime;
  final String? createdAt;

  MobileBet({
    required this.id,
    required this.homeTeam,
    required this.awayTeam,
    required this.league,
    required this.market,
    this.odds,
    required this.status,
    this.finalScore,
    this.matchTime,
    this.createdAt,
  });

  factory MobileBet.fromJson(Map<String, dynamic> json) {
    return MobileBet(
      id: json['id'] ?? '',
      homeTeam: json['homeTeam'] ?? '',
      awayTeam: json['awayTeam'] ?? '',
      league: json['league'] ?? '',
      market: json['market'] ?? '',
      odds: json['odds'],
      status: json['status'] ?? 'PENDING',
      finalScore: json['finalScore'],
      matchTime: json['matchTime'],
      createdAt: json['createdAt'],
    );
  }
}

/// Mobile Bets Provider
final mobileBetsProvider = FutureProvider<List<MobileBet>>((ref) async {
  try {
    final response = await apiService.getMobileBets();
    if (response['success'] == true) {
      final bets =
          (response['bets'] as List?)
              ?.map((e) => MobileBet.fromJson(e))
              .toList() ??
          [];
      return bets;
    }
    return [];
  } catch (e) {
    return [];
  }
});

/// Predictions Screen - Now shows Mobile Bets
class PredictionsScreen extends ConsumerStatefulWidget {
  const PredictionsScreen({super.key});

  @override
  ConsumerState<PredictionsScreen> createState() => _PredictionsScreenState();
}

class _PredictionsScreenState extends ConsumerState<PredictionsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final List<String> _tabs = ['Bekleyen', 'Sonuçlanan'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final betsAsync = ref.watch(mobileBetsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Bahisler'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => ref.refresh(mobileBetsProvider),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primaryPurple,
          indicatorWeight: 3,
          labelColor: AppColors.primaryPurple,
          unselectedLabelColor: Theme.of(
            context,
          ).colorScheme.onSurface.withAlpha(128),
          tabs: _tabs.map((tab) => Tab(text: tab)).toList(),
        ),
      ),
      body: betsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.error_outline,
                size: 48,
                color: AppColors.loseRed,
              ),
              const SizedBox(height: 16),
              Text('Hata: $error'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.refresh(mobileBetsProvider),
                child: const Text('Yeniden Dene'),
              ),
            ],
          ),
        ),
        data: (bets) {
          final pendingBets = bets.where((b) => b.status == 'PENDING').toList();
          final settledBets = bets.where((b) => b.status != 'PENDING').toList();

          return TabBarView(
            controller: _tabController,
            children: [
              _buildBetsList(pendingBets, isPending: true),
              _buildBetsList(settledBets, isPending: false),
            ],
          );
        },
      ),
    );
  }

  Widget _buildBetsList(List<MobileBet> bets, {required bool isPending}) {
    if (bets.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isPending
                  ? Icons.hourglass_empty_rounded
                  : Icons.check_circle_outline_rounded,
              size: 64,
              color: Theme.of(context).colorScheme.onSurface.withAlpha(77),
            ),
            const SizedBox(height: 16),
            Text(
              isPending ? 'Bekleyen bahis yok' : 'Sonuçlanmış bahis yok',
              style: TextStyle(
                fontSize: 16,
                color: Theme.of(context).colorScheme.onSurface.withAlpha(128),
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async => ref.refresh(mobileBetsProvider),
      child: ListView.builder(
        padding: const EdgeInsets.all(AppSpacing.lg),
        itemCount: bets.length,
        itemBuilder: (context, index) {
          final bet = bets[index];
          return _buildBetCard(bet, index);
        },
      ),
    );
  }

  Widget _buildBetCard(MobileBet bet, int index) {
    final isWon = bet.status == 'WON';
    final isLost = bet.status == 'LOST';
    final isPending = bet.status == 'PENDING';

    Color statusColor = AppColors.primaryPurple;
    IconData statusIcon = Icons.hourglass_empty_rounded;
    String statusText = 'Bekliyor';

    if (isWon) {
      statusColor = AppColors.winGreen;
      statusIcon = Icons.check_circle_rounded;
      statusText = 'Kazandı';
    } else if (isLost) {
      statusColor = AppColors.loseRed;
      statusIcon = Icons.cancel_rounded;
      statusText = 'Kaybetti';
    }

    return Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.md),
          child: GlassCard(
            variant: isPending
                ? GlassCardVariant.premium
                : GlassCardVariant.defaultVariant,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Row
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${bet.homeTeam} vs ${bet.awayTeam}',
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            bet.league,
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
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: statusColor.withAlpha(25),
                        borderRadius: BorderRadius.circular(AppRadius.full),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(statusIcon, size: 14, color: statusColor),
                          const SizedBox(width: 4),
                          Text(
                            statusText,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: statusColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                // Market and Odds
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surface.withAlpha(128),
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Tahmin',
                            style: TextStyle(
                              fontSize: 11,
                              color: Theme.of(
                                context,
                              ).colorScheme.onSurface.withAlpha(128),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            bet.market,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      if (bet.odds != null)
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              'Oran',
                              style: TextStyle(
                                fontSize: 11,
                                color: Theme.of(
                                  context,
                                ).colorScheme.onSurface.withAlpha(128),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              bet.odds!,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: AppColors.primaryPurple,
                              ),
                            ),
                          ],
                        ),
                      if (bet.finalScore != null)
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              'Skor',
                              style: TextStyle(
                                fontSize: 11,
                                color: Theme.of(
                                  context,
                                ).colorScheme.onSurface.withAlpha(128),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              bet.finalScore!,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: isWon
                                    ? AppColors.winGreen
                                    : (isLost ? AppColors.loseRed : null),
                              ),
                            ),
                          ],
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
          delay: Duration(milliseconds: index * 50),
          duration: 300.ms,
        )
        .slideY(begin: 0.05, end: 0);
  }
}

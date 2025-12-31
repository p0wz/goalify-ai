import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../widgets/common/glass_card.dart';
import '../../widgets/match/match_card.dart';

/// Predictions Screen
/// Shows upcoming matches with AI predictions
class PredictionsScreen extends StatefulWidget {
  const PredictionsScreen({super.key});

  @override
  State<PredictionsScreen> createState() => _PredictionsScreenState();
}

class _PredictionsScreenState extends State<PredictionsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final List<String> _tabs = ['Bugün', 'Yarın', 'Haftalık', 'Tümü'];

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
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tahminler'),
        actions: [
          IconButton(icon: const Icon(Icons.search_rounded), onPressed: () {}),
          IconButton(
            icon: const Icon(Icons.filter_list_rounded),
            onPressed: () {},
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primaryPurple,
          unselectedLabelColor: Theme.of(
            context,
          ).colorScheme.onSurface.withAlpha(128),
          indicatorColor: AppColors.primaryPurple,
          tabs: _tabs.map((t) => Tab(text: t)).toList(),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: _tabs.map((tab) => _buildPredictionsList(context)).toList(),
      ),
    );
  }

  Widget _buildPredictionsList(BuildContext context) {
    // Mock data - will be replaced with API data
    final matches = [
      {
        'homeTeam': 'Galatasaray',
        'awayTeam': 'Fenerbahçe',
        'league': 'Süper Lig',
        'time': '20:00',
        'prediction': 'Galatasaray Kazanır',
        'confidence': 85.0,
      },
      {
        'homeTeam': 'Beşiktaş',
        'awayTeam': 'Trabzonspor',
        'league': 'Süper Lig',
        'time': '22:00',
        'prediction': 'Berabere',
        'confidence': 62.0,
      },
      {
        'homeTeam': 'Barcelona',
        'awayTeam': 'Real Madrid',
        'league': 'La Liga',
        'time': '23:00',
        'prediction': 'Over 2.5',
        'confidence': 78.0,
      },
      {
        'homeTeam': 'Man City',
        'awayTeam': 'Liverpool',
        'league': 'Premier League',
        'time': '19:30',
        'prediction': 'BTTS - KG Var',
        'confidence': 71.0,
      },
      {
        'homeTeam': 'Bayern Munich',
        'awayTeam': 'Dortmund',
        'league': 'Bundesliga',
        'time': '21:30',
        'prediction': 'Bayern Kazanır',
        'confidence': 88.0,
      },
    ];

    return RefreshIndicator(
      onRefresh: () async {
        // TODO: Refresh predictions from API
        await Future.delayed(const Duration(seconds: 1));
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(AppSpacing.lg),
        itemCount: matches.length,
        itemBuilder: (context, index) {
          final match = matches[index];
          return MatchCard(
            homeTeam: match['homeTeam'] as String,
            awayTeam: match['awayTeam'] as String,
            league: match['league'] as String,
            matchTime: match['time'] as String,
            prediction: match['prediction'] as String?,
            confidence: match['confidence'] as double?,
            onTap: () => _showMatchDetail(context, match),
          ).animate().fadeIn(
            delay: Duration(milliseconds: index * 100),
            duration: 300.ms,
          );
        },
      ),
    );
  }

  void _showMatchDetail(BuildContext context, Map<String, dynamic> match) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _buildMatchDetailSheet(context, match),
    );
  }

  Widget _buildMatchDetailSheet(
    BuildContext context,
    Map<String, dynamic> match,
  ) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      height: MediaQuery.of(context).size.height * 0.7,
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : AppColors.lightCard,
        borderRadius: const BorderRadius.vertical(
          top: Radius.circular(AppRadius.xxl),
        ),
      ),
      child: Column(
        children: [
          // Handle bar
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(top: AppSpacing.md),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkMuted : AppColors.lightMuted,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(AppSpacing.xxl),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Teams header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _buildTeamColumn(match['homeTeam'] as String),
                      Column(
                        children: [
                          Text(
                            match['time'] as String,
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            match['league'] as String,
                            style: TextStyle(
                              fontSize: 12,
                              color: isDark
                                  ? AppColors.darkMutedForeground
                                  : AppColors.lightMutedForeground,
                            ),
                          ),
                        ],
                      ),
                      _buildTeamColumn(match['awayTeam'] as String),
                    ],
                  ),

                  const SizedBox(height: AppSpacing.xxl),

                  // AI Prediction Card
                  GlassCard(
                    variant: GlassCardVariant.premium,
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                gradient: AppColors.gradientPrimary,
                                borderRadius: BorderRadius.circular(
                                  AppRadius.md,
                                ),
                              ),
                              child: const Icon(
                                Icons.psychology_rounded,
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
                                    'AI Tahmini',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w500,
                                      color: AppColors.primaryPurple,
                                    ),
                                  ),
                                  Text(
                                    match['prediction'] as String,
                                    style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            _buildLargeConfidenceMeter(
                              match['confidence'] as double,
                            ),
                          ],
                        ),

                        const SizedBox(height: AppSpacing.lg),
                        const Divider(),
                        const SizedBox(height: AppSpacing.lg),

                        // Probability bars
                        _buildProbabilityBar('Ev Sahibi Kazanır', 0.68),
                        const SizedBox(height: AppSpacing.md),
                        _buildProbabilityBar('Berabere', 0.18),
                        const SizedBox(height: AppSpacing.md),
                        _buildProbabilityBar('Deplasman Kazanır', 0.14),
                      ],
                    ),
                  ),

                  const SizedBox(height: AppSpacing.xxl),

                  // Action buttons
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {},
                          icon: const Icon(Icons.favorite_border_rounded),
                          label: const Text('Favorilere Ekle'),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {},
                          icon: const Icon(Icons.add_rounded),
                          label: const Text('Tahmin Kaydet'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTeamColumn(String teamName) {
    return Column(
      children: [
        Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            color: AppColors.primaryPurple.withAlpha(25),
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              teamName.isNotEmpty ? teamName[0].toUpperCase() : '?',
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w700,
                color: AppColors.primaryPurple,
              ),
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        SizedBox(
          width: 80,
          child: Text(
            teamName,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  Widget _buildLargeConfidenceMeter(double confidence) {
    Color meterColor;
    if (confidence >= 80) {
      meterColor = AppColors.winGreen;
    } else if (confidence >= 60) {
      meterColor = AppColors.primaryPurple;
    } else if (confidence >= 40) {
      meterColor = AppColors.drawYellow;
    } else {
      meterColor = AppColors.loseRed;
    }

    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: meterColor.withAlpha(25),
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Column(
        children: [
          Text(
            '${confidence.toInt()}%',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w800,
              color: meterColor,
            ),
          ),
          Text(
            'Güven',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w500,
              color: meterColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProbabilityBar(String label, double probability) {
    return Row(
      children: [
        SizedBox(
          width: 120,
          child: Text(label, style: const TextStyle(fontSize: 13)),
        ),
        Expanded(
          child: ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: probability,
              backgroundColor: AppColors.primaryPurple.withAlpha(25),
              valueColor: const AlwaysStoppedAnimation<Color>(
                AppColors.primaryPurple,
              ),
              minHeight: 8,
            ),
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        Text(
          '${(probability * 100).toInt()}%',
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}

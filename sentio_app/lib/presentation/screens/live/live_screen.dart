import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../widgets/common/glass_card.dart';
import '../../widgets/match/match_card.dart';

/// Live Matches Screen
/// Shows currently playing matches with real-time updates
class LiveScreen extends StatefulWidget {
  const LiveScreen({super.key});

  @override
  State<LiveScreen> createState() => _LiveScreenState();
}

class _LiveScreenState extends State<LiveScreen> {
  // Mock live matches - will be replaced with WebSocket data
  final List<Map<String, dynamic>> _liveMatches = [
    {
      'homeTeam': 'Galatasaray',
      'awayTeam': 'Fenerbahçe',
      'homeScore': 2,
      'awayScore': 1,
      'minute': "78'",
      'league': 'Süper Lig',
      'prediction': 'Galatasaray Kazanır',
      'predictionStatus': 'winning', // winning, losing, pending
      'events': [
        {'minute': 23, 'type': 'goal', 'team': 'home', 'player': 'Icardi'},
        {'minute': 45, 'type': 'goal', 'team': 'home', 'player': 'Icardi'},
        {'minute': 67, 'type': 'goal', 'team': 'away', 'player': 'Dzeko'},
      ],
    },
    {
      'homeTeam': 'Man City',
      'awayTeam': 'Liverpool',
      'homeScore': 0,
      'awayScore': 0,
      'minute': "34'",
      'league': 'Premier League',
      'prediction': 'Over 2.5',
      'predictionStatus': 'pending',
      'events': [],
    },
    {
      'homeTeam': 'Barcelona',
      'awayTeam': 'Real Madrid',
      'homeScore': 1,
      'awayScore': 2,
      'minute': "56'",
      'league': 'La Liga',
      'prediction': 'Barcelona Kazanır',
      'predictionStatus': 'losing',
      'events': [
        {'minute': 12, 'type': 'goal', 'team': 'away', 'player': 'Vinicius'},
        {'minute': 34, 'type': 'goal', 'team': 'home', 'player': 'Lewandowski'},
        {'minute': 51, 'type': 'goal', 'team': 'away', 'player': 'Bellingham'},
      ],
    },
  ];

  final List<Map<String, dynamic>> _upcomingMatches = [
    {
      'homeTeam': 'Bayern Munich',
      'awayTeam': 'Dortmund',
      'league': 'Bundesliga',
      'time': '2 saat sonra',
    },
    {
      'homeTeam': 'PSG',
      'awayTeam': 'Marseille',
      'league': 'Ligue 1',
      'time': '3 saat sonra',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Canlı Maçlar'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () {
              // TODO: Refresh live data
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          // TODO: Refresh from WebSocket
          await Future.delayed(const Duration(seconds: 1));
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Live Section Header
              _buildSectionHeader(
                icon: Icons.circle,
                iconColor: AppColors.liveRed,
                title: '${_liveMatches.length} Canlı Maç',
                isLive: true,
              ),

              const SizedBox(height: AppSpacing.md),

              // Live Matches
              ..._liveMatches.asMap().entries.map((entry) {
                final index = entry.key;
                final match = entry.value;
                return _buildLiveMatchCard(context, match).animate().fadeIn(
                  delay: Duration(milliseconds: index * 100),
                  duration: 300.ms,
                );
              }),

              const SizedBox(height: AppSpacing.xxl),

              // Upcoming Section Header
              _buildSectionHeader(
                icon: Icons.schedule_rounded,
                iconColor: AppColors.primaryPurple,
                title: 'Yaklaşan Maçlar',
                isLive: false,
              ),

              const SizedBox(height: AppSpacing.md),

              // Upcoming Matches
              ..._upcomingMatches.asMap().entries.map((entry) {
                final index = entry.key;
                final match = entry.value;
                return MatchCard(
                  homeTeam: match['homeTeam'] as String,
                  awayTeam: match['awayTeam'] as String,
                  league: match['league'] as String,
                  matchTime: match['time'] as String,
                  onTap: () {},
                ).animate().fadeIn(
                  delay: Duration(
                    milliseconds: (_liveMatches.length + index) * 100,
                  ),
                  duration: 300.ms,
                );
              }),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader({
    required IconData icon,
    required Color iconColor,
    required String title,
    required bool isLive,
  }) {
    return Row(
      children: [
        if (isLive)
          Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: iconColor,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(color: iconColor.withAlpha(128), blurRadius: 8),
                  ],
                ),
              )
              .animate(onPlay: (c) => c.repeat(reverse: true))
              .scale(
                begin: const Offset(1, 1),
                end: const Offset(0.8, 0.8),
                duration: 1.seconds,
              )
        else
          Icon(icon, size: 20, color: iconColor),
        const SizedBox(width: AppSpacing.sm),
        Text(
          title,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: isLive ? AppColors.liveRed : null,
          ),
        ),
      ],
    );
  }

  Widget _buildLiveMatchCard(BuildContext context, Map<String, dynamic> match) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final predictionStatus = match['predictionStatus'] as String;

    Color statusColor;
    IconData statusIcon;
    switch (predictionStatus) {
      case 'winning':
        statusColor = AppColors.winGreen;
        statusIcon = Icons.check_circle_rounded;
        break;
      case 'losing':
        statusColor = AppColors.loseRed;
        statusIcon = Icons.cancel_rounded;
        break;
      default:
        statusColor = AppColors.drawYellow;
        statusIcon = Icons.access_time_rounded;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : AppColors.lightCard,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.liveRed.withAlpha(80), width: 2),
        boxShadow: [
          BoxShadow(color: AppColors.liveRed.withAlpha(40), blurRadius: 20),
        ],
      ),
      child: Column(
        children: [
          // Main match info
          Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              children: [
                // Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      match['league'] as String,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: isDark
                            ? AppColors.darkMutedForeground
                            : AppColors.lightMutedForeground,
                      ),
                    ),
                    _buildPulsingLiveIndicator(match['minute'] as String),
                  ],
                ),

                const SizedBox(height: AppSpacing.lg),

                // Score display
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildTeamDisplay(match['homeTeam'] as String, true),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.xl,
                        vertical: AppSpacing.md,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.liveRed.withAlpha(25),
                        borderRadius: BorderRadius.circular(AppRadius.md),
                      ),
                      child: Text(
                        '${match['homeScore']} - ${match['awayScore']}',
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    _buildTeamDisplay(match['awayTeam'] as String, false),
                  ],
                ),

                const SizedBox(height: AppSpacing.lg),

                // Prediction status
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.sm,
                  ),
                  decoration: BoxDecoration(
                    color: statusColor.withAlpha(25),
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                    border: Border.all(color: statusColor.withAlpha(80)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(statusIcon, size: 16, color: statusColor),
                      const SizedBox(width: AppSpacing.xs),
                      Text(
                        'Tahmin: ${match['prediction']}',
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
          ),

          // Events timeline (if any)
          if ((match['events'] as List).isNotEmpty) ...[
            Divider(
              height: 1,
              color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
            ),
            _buildEventsTimeline(match['events'] as List, match),
          ],
        ],
      ),
    );
  }

  Widget _buildPulsingLiveIndicator(String minute) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.liveRed.withAlpha(25),
        borderRadius: BorderRadius.circular(AppRadius.sm),
        border: Border.all(color: AppColors.liveRed.withAlpha(80)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: AppColors.liveRed,
                  shape: BoxShape.circle,
                ),
              )
              .animate(onPlay: (c) => c.repeat(reverse: true))
              .scale(
                begin: const Offset(1, 1),
                end: const Offset(0.6, 0.6),
                duration: 1.seconds,
              ),
          const SizedBox(width: 6),
          Text(
            minute,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.liveRed,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTeamDisplay(String teamName, bool isHome) {
    return Expanded(
      child: Column(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppColors.primaryPurple.withAlpha(25),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                teamName.isNotEmpty ? teamName[0].toUpperCase() : '?',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primaryPurple,
                ),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            teamName,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildEventsTimeline(List events, Map<String, dynamic> match) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        children: events.map<Widget>((event) {
          final isHome = event['team'] == 'home';
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Row(
              children: [
                SizedBox(
                  width: 30,
                  child: Text(
                    "${event['minute']}'",
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primaryPurple,
                    ),
                  ),
                ),
                const Icon(
                  Icons.sports_soccer_rounded,
                  size: 14,
                  color: AppColors.winGreen,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '${event['player']} (${isHome ? match['homeTeam'] : match['awayTeam']})',
                    style: const TextStyle(fontSize: 12),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}

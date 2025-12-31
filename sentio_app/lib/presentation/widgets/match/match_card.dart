import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';

/// Match Card Widget
/// Displays match info, prediction, and confidence
class MatchCard extends StatelessWidget {
  final String homeTeam;
  final String awayTeam;
  final String league;
  final String matchTime;
  final String? prediction;
  final double? confidence;
  final int? homeScore;
  final int? awayScore;
  final bool isLive;
  final String? liveMinute;
  final VoidCallback? onTap;

  const MatchCard({
    super.key,
    required this.homeTeam,
    required this.awayTeam,
    required this.league,
    required this.matchTime,
    this.prediction,
    this.confidence,
    this.homeScore,
    this.awayScore,
    this.isLive = false,
    this.liveMinute,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : AppColors.lightCard,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(
          color: isLive
              ? AppColors.liveRed.withAlpha(80)
              : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
          width: isLive ? 2 : 1,
        ),
        boxShadow: isLive
            ? [
                BoxShadow(
                  color: AppColors.liveRed.withAlpha(40),
                  blurRadius: 20,
                ),
              ]
            : null,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Row: League & Time/Live indicator
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      league,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: isDark
                            ? AppColors.darkMutedForeground
                            : AppColors.lightMutedForeground,
                      ),
                    ),
                    if (isLive)
                      _buildLiveIndicator()
                    else
                      Text(
                        matchTime,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: isDark
                              ? AppColors.darkMutedForeground
                              : AppColors.lightMutedForeground,
                        ),
                      ),
                  ],
                ),

                const SizedBox(height: AppSpacing.md),

                // Teams Row
                Row(
                  children: [
                    // Home Team
                    Expanded(
                      child: Row(
                        children: [
                          _buildTeamLogo(homeTeam),
                          const SizedBox(width: AppSpacing.sm),
                          Expanded(
                            child: Text(
                              homeTeam,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Score or VS
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md,
                        vertical: AppSpacing.xs,
                      ),
                      decoration: BoxDecoration(
                        color: isLive
                            ? AppColors.liveRed.withAlpha(25)
                            : (isDark
                                  ? AppColors.darkMuted
                                  : AppColors.lightMuted),
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                      child: Text(
                        isLive && homeScore != null && awayScore != null
                            ? '$homeScore - $awayScore'
                            : 'vs',
                        style: TextStyle(
                          fontSize: isLive ? 16 : 12,
                          fontWeight: FontWeight.w700,
                          color: isLive ? AppColors.liveRed : null,
                        ),
                      ),
                    ),

                    // Away Team
                    Expanded(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          Expanded(
                            child: Text(
                              awayTeam,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                              overflow: TextOverflow.ellipsis,
                              textAlign: TextAlign.right,
                            ),
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          _buildTeamLogo(awayTeam),
                        ],
                      ),
                    ),
                  ],
                ),

                // AI Prediction (if available)
                if (prediction != null) ...[
                  const SizedBox(height: AppSpacing.lg),
                  _buildPredictionSection(context),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLiveIndicator() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.liveRed.withAlpha(25),
        borderRadius: BorderRadius.circular(AppRadius.sm),
        border: Border.all(color: AppColors.liveRed.withAlpha(80)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: const BoxDecoration(
              color: AppColors.liveRed,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 4),
          Text(
            liveMinute ?? 'CANLI',
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: AppColors.liveRed,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTeamLogo(String teamName) {
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        color: AppColors.primaryPurple.withAlpha(25),
        shape: BoxShape.circle,
      ),
      child: Center(
        child: Text(
          teamName.isNotEmpty ? teamName[0].toUpperCase() : '?',
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: AppColors.primaryPurple,
          ),
        ),
      ),
    );
  }

  Widget _buildPredictionSection(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: isDark
            ? AppColors.primaryPurple.withAlpha(20)
            : AppColors.primaryPurple.withAlpha(13),
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.primaryPurple.withAlpha(50)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: AppColors.primaryPurple.withAlpha(50),
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
            child: const Icon(
              Icons.psychology_rounded,
              size: 16,
              color: AppColors.primaryPurple,
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'AI Tahmini',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w500,
                    color: AppColors.primaryPurple,
                  ),
                ),
                Text(
                  prediction!,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          if (confidence != null) _buildConfidenceMeter(),
        ],
      ),
    );
  }

  Widget _buildConfidenceMeter() {
    Color meterColor;
    if (confidence! >= 80) {
      meterColor = AppColors.winGreen;
    } else if (confidence! >= 60) {
      meterColor = AppColors.primaryPurple;
    } else if (confidence! >= 40) {
      meterColor = AppColors.drawYellow;
    } else {
      meterColor = AppColors.loseRed;
    }

    return Column(
      children: [
        Text(
          '${confidence!.toInt()}%',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: meterColor,
          ),
        ),
        const SizedBox(height: 2),
        SizedBox(
          width: 40,
          height: 4,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(2),
            child: LinearProgressIndicator(
              value: confidence! / 100,
              backgroundColor: meterColor.withAlpha(50),
              valueColor: AlwaysStoppedAnimation<Color>(meterColor),
            ),
          ),
        ),
      ],
    );
  }
}

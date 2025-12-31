import 'dart:ui';
import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';

/// Glass Card Widget
/// Premium glassmorphism effect with blur, glow, and gradient borders
class GlassCard extends StatelessWidget {
  final Widget child;
  final GlassCardVariant variant;
  final EdgeInsets padding;
  final VoidCallback? onTap;
  final double? borderRadius;
  final bool showGlow;

  const GlassCard({
    super.key,
    required this.child,
    this.variant = GlassCardVariant.defaultVariant,
    this.padding = const EdgeInsets.all(AppSpacing.lg),
    this.onTap,
    this.borderRadius,
    this.showGlow = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final radius = borderRadius ?? AppRadius.lg;

    Color backgroundColor;
    double blur;
    Color borderColor;
    List<BoxShadow> shadows = [];

    switch (variant) {
      case GlassCardVariant.defaultVariant:
        backgroundColor = isDark
            ? AppColors.darkCard.withAlpha(230)
            : AppColors.lightCard.withAlpha(240);
        blur = 10;
        borderColor = isDark
            ? Colors.white.withAlpha(13)
            : AppColors.lightBorder.withAlpha(128);
        if (isDark) {
          shadows.add(
            BoxShadow(
              color: Colors.black.withAlpha(38),
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
          );
        }
        break;

      case GlassCardVariant.elevated:
        backgroundColor = isDark
            ? AppColors.darkCardElevated.withAlpha(242)
            : AppColors.lightCard;
        blur = 15;
        borderColor = isDark
            ? Colors.white.withAlpha(20)
            : AppColors.lightBorder;
        shadows.add(
          BoxShadow(
            color: Colors.black.withAlpha(isDark ? 51 : 13),
            blurRadius: 30,
            offset: const Offset(0, 12),
          ),
        );
        break;

      case GlassCardVariant.premium:
        backgroundColor = isDark
            ? AppColors.primaryPurple.withAlpha(25)
            : AppColors.primaryPurple.withAlpha(13);
        blur = 15;
        borderColor = AppColors.primaryPurple.withAlpha(77);
        shadows.add(
          BoxShadow(
            color: AppColors.primaryPurple.withAlpha(isDark ? 51 : 25),
            blurRadius: 30,
            offset: const Offset(0, 8),
          ),
        );
        break;

      case GlassCardVariant.success:
        backgroundColor = isDark
            ? AppColors.winGreen.withAlpha(20)
            : AppColors.winGreen.withAlpha(10);
        blur = 12;
        borderColor = AppColors.winGreen.withAlpha(64);
        shadows.add(
          BoxShadow(
            color: AppColors.winGreen.withAlpha(38),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        );
        break;

      case GlassCardVariant.danger:
        backgroundColor = isDark
            ? AppColors.loseRed.withAlpha(20)
            : AppColors.loseRed.withAlpha(10);
        blur = 12;
        borderColor = AppColors.loseRed.withAlpha(64);
        shadows.add(
          BoxShadow(
            color: AppColors.loseRed.withAlpha(38),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        );
        break;
    }

    if (showGlow) {
      shadows.add(AppShadows.primaryGlow);
    }

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(radius),
        boxShadow: shadows,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(radius),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: onTap,
              borderRadius: BorderRadius.circular(radius),
              splashColor: AppColors.primaryPurple.withAlpha(25),
              highlightColor: AppColors.primaryPurple.withAlpha(13),
              child: Container(
                decoration: BoxDecoration(
                  color: backgroundColor,
                  borderRadius: BorderRadius.circular(radius),
                  border: Border.all(color: borderColor, width: 1),
                  gradient: isDark
                      ? LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            Colors.white.withAlpha(5),
                            Colors.transparent,
                          ],
                        )
                      : null,
                ),
                padding: padding,
                child: child,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

enum GlassCardVariant { defaultVariant, elevated, premium, success, danger }

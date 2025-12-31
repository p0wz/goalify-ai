import 'dart:ui';
import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';

/// Glass Card Widget
/// Implements glassmorphism effect with blur and transparency
class GlassCard extends StatelessWidget {
  final Widget child;
  final GlassCardVariant variant;
  final EdgeInsets padding;
  final VoidCallback? onTap;
  final double? borderRadius;

  const GlassCard({
    super.key,
    required this.child,
    this.variant = GlassCardVariant.defaultVariant,
    this.padding = const EdgeInsets.all(AppSpacing.lg),
    this.onTap,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final radius = borderRadius ?? AppRadius.lg;

    Color backgroundColor;
    double blur;
    Color borderColor;

    switch (variant) {
      case GlassCardVariant.defaultVariant:
        backgroundColor = isDark
            ? AppColors.darkCard.withOpacity(0.7)
            : AppColors.lightCard.withOpacity(0.8);
        blur = 10;
        borderColor = isDark
            ? AppColors.darkBorder.withOpacity(0.5)
            : AppColors.lightBorder.withOpacity(0.5);
        break;
      case GlassCardVariant.strong:
        backgroundColor = isDark
            ? AppColors.darkCard.withOpacity(0.9)
            : AppColors.lightCard.withOpacity(0.95);
        blur = 20;
        borderColor = isDark ? AppColors.darkBorder : AppColors.lightBorder;
        break;
      case GlassCardVariant.premium:
        backgroundColor = isDark
            ? AppColors.primaryPurple.withOpacity(0.15)
            : AppColors.primaryPurple.withOpacity(0.08);
        blur = 15;
        borderColor = AppColors.primaryPurple.withOpacity(0.3);
        break;
    }

    return ClipRRect(
      borderRadius: BorderRadius.circular(radius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(radius),
            child: Container(
              decoration: BoxDecoration(
                color: backgroundColor,
                borderRadius: BorderRadius.circular(radius),
                border: Border.all(color: borderColor, width: 1),
              ),
              padding: padding,
              child: child,
            ),
          ),
        ),
      ),
    );
  }
}

enum GlassCardVariant { defaultVariant, strong, premium }

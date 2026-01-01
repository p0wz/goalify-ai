import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';

/// Clean Card Widget - Simple solid card without effects
class CleanCard extends StatelessWidget {
  final Widget child;
  final EdgeInsets padding;
  final VoidCallback? onTap;
  final CleanCardVariant variant;
  final double? borderRadius;

  const CleanCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(AppSpacing.lg),
    this.onTap,
    this.variant = CleanCardVariant.normal,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final radius = borderRadius ?? AppRadius.lg;

    Color bgColor;
    Color borderColor;

    switch (variant) {
      case CleanCardVariant.normal:
        bgColor = isDark ? AppColors.cardDark : AppColors.cardLight;
        borderColor = isDark ? AppColors.borderDark : AppColors.borderLight;
        break;
      case CleanCardVariant.elevated:
        bgColor = isDark
            ? AppColors.cardElevatedDark
            : AppColors.cardElevatedLight;
        borderColor = isDark ? AppColors.borderDark : AppColors.borderLight;
        break;
      case CleanCardVariant.primary:
        bgColor = AppColors.primary.withAlpha(isDark ? 30 : 20);
        borderColor = AppColors.primary.withAlpha(60);
        break;
      case CleanCardVariant.success:
        bgColor = AppColors.success.withAlpha(isDark ? 30 : 20);
        borderColor = AppColors.success.withAlpha(60);
        break;
      case CleanCardVariant.danger:
        bgColor = AppColors.danger.withAlpha(isDark ? 30 : 20);
        borderColor = AppColors.danger.withAlpha(60);
        break;
      case CleanCardVariant.warning:
        bgColor = AppColors.warning.withAlpha(isDark ? 30 : 20);
        borderColor = AppColors.warning.withAlpha(60);
        break;
    }

    return Container(
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: borderColor, width: 1),
        boxShadow: [isDark ? AppShadows.card : AppShadows.cardLight],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(radius),
          splashColor: AppColors.primary.withAlpha(25),
          highlightColor: AppColors.primary.withAlpha(15),
          child: Padding(padding: padding, child: child),
        ),
      ),
    );
  }
}

enum CleanCardVariant { normal, elevated, primary, success, danger, warning }

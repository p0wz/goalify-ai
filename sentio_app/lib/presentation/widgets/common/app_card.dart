import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';

/// App Card - Clean solid card with no glassmorphism
class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsets padding;
  final VoidCallback? onTap;
  final AppCardVariant variant;
  final double? borderRadius;

  const AppCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(AppSpacing.lg),
    this.onTap,
    this.variant = AppCardVariant.normal,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final radius = borderRadius ?? AppRadius.lg;

    Color bgColor;
    Color borderColor;

    switch (variant) {
      case AppCardVariant.normal:
        bgColor = isDark ? AppColors.card : AppColors.cardLight;
        borderColor = isDark ? AppColors.border : AppColors.borderLight;
        break;
      case AppCardVariant.elevated:
        bgColor = isDark ? AppColors.cardElevated : AppColors.cardLightElevated;
        borderColor = isDark ? AppColors.border : AppColors.borderLight;
        break;
      case AppCardVariant.success:
        bgColor = isDark
            ? AppColors.successMuted.withAlpha(51)
            : AppColors.success.withAlpha(25);
        borderColor = AppColors.success.withAlpha(77);
        break;
      case AppCardVariant.danger:
        bgColor = isDark
            ? AppColors.dangerMuted.withAlpha(51)
            : AppColors.danger.withAlpha(25);
        borderColor = AppColors.danger.withAlpha(77);
        break;
      case AppCardVariant.warning:
        bgColor = isDark
            ? AppColors.warningMuted.withAlpha(51)
            : AppColors.warning.withAlpha(25);
        borderColor = AppColors.warning.withAlpha(77);
        break;
      case AppCardVariant.primary:
        bgColor = isDark
            ? AppColors.primary.withAlpha(25)
            : AppColors.primary.withAlpha(13);
        borderColor = AppColors.primary.withAlpha(77);
        break;
    }

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(radius),
        splashColor: AppColors.primary.withAlpha(25),
        highlightColor: AppColors.primary.withAlpha(13),
        child: Container(
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(radius),
            border: Border.all(color: borderColor, width: 1),
          ),
          padding: padding,
          child: child,
        ),
      ),
    );
  }
}

enum AppCardVariant { normal, elevated, success, danger, warning, primary }

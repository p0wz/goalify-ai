import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';

/// Simple App Card - fallback when PremiumCard not needed
class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsets padding;
  final VoidCallback? onTap;
  final AppCardVariant variant;

  const AppCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(AppSpacing.lg),
    this.onTap,
    this.variant = AppCardVariant.normal,
  });

  @override
  Widget build(BuildContext context) {
    Color bgColor = AppColors.card;
    Color borderColor = AppColors.border;

    switch (variant) {
      case AppCardVariant.normal:
        break;
      case AppCardVariant.elevated:
        bgColor = AppColors.cardElevated;
        break;
      case AppCardVariant.primary:
        bgColor = AppColors.primary.withAlpha(25);
        borderColor = AppColors.primary.withAlpha(77);
        break;
      case AppCardVariant.success:
        bgColor = AppColors.success.withAlpha(25);
        borderColor = AppColors.success.withAlpha(77);
        break;
      case AppCardVariant.danger:
        bgColor = AppColors.danger.withAlpha(25);
        borderColor = AppColors.danger.withAlpha(77);
        break;
      case AppCardVariant.warning:
        bgColor = AppColors.warning.withAlpha(25);
        borderColor = AppColors.warning.withAlpha(77);
        break;
    }

    return Container(
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: borderColor, width: 1),
        boxShadow: [AppShadows.subtle],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          child: Padding(padding: padding, child: child),
        ),
      ),
    );
  }
}

enum AppCardVariant { normal, elevated, primary, success, danger, warning }

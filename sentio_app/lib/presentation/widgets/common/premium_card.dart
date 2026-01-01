import 'dart:ui';
import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';

/// Premium Card with gradient background, glow, and blur
class PremiumCard extends StatelessWidget {
  final Widget child;
  final EdgeInsets padding;
  final VoidCallback? onTap;
  final PremiumCardVariant variant;
  final bool showGlow;
  final double? borderRadius;

  const PremiumCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(AppSpacing.lg),
    this.onTap,
    this.variant = PremiumCardVariant.normal,
    this.showGlow = false,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    final radius = borderRadius ?? AppRadius.xl;

    LinearGradient bgGradient;
    LinearGradient borderGradient;
    List<BoxShadow> shadows = [AppShadows.card];

    switch (variant) {
      case PremiumCardVariant.normal:
        bgGradient = const LinearGradient(
          colors: [Color(0xFF1A1625), Color(0xFF151020)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
        borderGradient = const LinearGradient(
          colors: [Color(0xFF2D2640), Color(0xFF1E1830)],
        );
        break;

      case PremiumCardVariant.elevated:
        bgGradient = AppColors.gradientCard;
        borderGradient = AppColors.gradientBorder;
        if (showGlow) shadows.add(AppShadows.primaryGlow);
        break;

      case PremiumCardVariant.primary:
        bgGradient = LinearGradient(
          colors: [
            AppColors.primary.withAlpha(38),
            AppColors.primaryDark.withAlpha(25),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
        borderGradient = AppColors.gradientPrimary;
        if (showGlow) shadows.add(AppShadows.primaryGlow);
        break;

      case PremiumCardVariant.success:
        bgGradient = LinearGradient(
          colors: [
            AppColors.success.withAlpha(38),
            AppColors.successDark.withAlpha(25),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
        borderGradient = AppColors.gradientSuccess;
        if (showGlow) shadows.add(AppShadows.successGlow);
        break;

      case PremiumCardVariant.danger:
        bgGradient = LinearGradient(
          colors: [
            AppColors.danger.withAlpha(38),
            AppColors.dangerDark.withAlpha(25),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
        borderGradient = AppColors.gradientDanger;
        if (showGlow) shadows.add(AppShadows.dangerGlow);
        break;

      case PremiumCardVariant.accent:
        bgGradient = LinearGradient(
          colors: [
            AppColors.accent.withAlpha(38),
            AppColors.accent.withAlpha(25),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
        borderGradient = AppColors.gradientAccent;
        if (showGlow) shadows.add(AppShadows.accentGlow);
        break;
    }

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(radius),
        boxShadow: shadows,
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(radius),
          gradient: borderGradient,
        ),
        padding: const EdgeInsets.all(1.5), // Border width
        child: ClipRRect(
          borderRadius: BorderRadius.circular(radius - 1.5),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: onTap,
                borderRadius: BorderRadius.circular(radius - 1.5),
                splashColor: AppColors.primary.withAlpha(38),
                highlightColor: AppColors.primary.withAlpha(25),
                child: Container(
                  decoration: BoxDecoration(
                    gradient: bgGradient,
                    borderRadius: BorderRadius.circular(radius - 1.5),
                  ),
                  padding: padding,
                  child: child,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

enum PremiumCardVariant { normal, elevated, primary, success, danger, accent }

/// Gradient Button with glow effect
class GradientButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final IconData? icon;
  final LinearGradient? gradient;
  final bool isLoading;
  final bool showGlow;

  const GradientButton({
    super.key,
    required this.text,
    this.onPressed,
    this.icon,
    this.gradient,
    this.isLoading = false,
    this.showGlow = true,
  });

  @override
  Widget build(BuildContext context) {
    final grad = gradient ?? AppColors.gradientPrimary;

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.md),
        boxShadow: showGlow ? [AppShadows.primaryGlow] : null,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isLoading ? null : onPressed,
          borderRadius: BorderRadius.circular(AppRadius.md),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
            decoration: BoxDecoration(
              gradient: grad,
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                if (isLoading)
                  const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                else ...[
                  if (icon != null) ...[
                    Icon(icon, color: Colors.white, size: 20),
                    const SizedBox(width: 8),
                  ],
                  Text(
                    text,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

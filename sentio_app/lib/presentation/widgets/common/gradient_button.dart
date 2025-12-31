import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';

/// Gradient Button Widget
/// A button with gradient background and optional icon
class GradientButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final GradientType gradient;
  final bool isLoading;
  final IconData? icon;
  final bool isFullWidth;

  const GradientButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.gradient = GradientType.primary,
    this.isLoading = false,
    this.icon,
    this.isFullWidth = true,
  });

  LinearGradient get _gradient {
    switch (gradient) {
      case GradientType.primary:
        return AppColors.gradientPrimary;
      case GradientType.accent:
        return AppColors.gradientAccent;
      case GradientType.premium:
        return AppColors.gradientPremium;
      case GradientType.success:
        return AppColors.gradientSuccess;
    }
  }

  BoxShadow get _glow {
    switch (gradient) {
      case GradientType.primary:
        return AppShadows.primaryGlow;
      case GradientType.accent:
        return AppShadows.accentGlow;
      case GradientType.premium:
        return AppShadows.primaryGlow;
      case GradientType.success:
        return AppShadows.winGlow;
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      width: isFullWidth ? double.infinity : null,
      decoration: BoxDecoration(
        gradient: _gradient,
        borderRadius: BorderRadius.circular(AppRadius.md),
        boxShadow: [_glow],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isLoading ? null : onPressed,
          borderRadius: BorderRadius.circular(AppRadius.md),
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.xl,
              vertical: AppSpacing.lg,
            ),
            child: Row(
              mainAxisSize: isFullWidth ? MainAxisSize.max : MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (isLoading)
                  const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                else ...[
                  if (icon != null) ...[
                    Icon(icon, color: Colors.white, size: 20),
                    const SizedBox(width: AppSpacing.sm),
                  ],
                  Text(
                    text,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    ).animate().fadeIn(duration: 200.ms).scale(begin: const Offset(0.95, 0.95));
  }
}

enum GradientType { primary, accent, premium, success }

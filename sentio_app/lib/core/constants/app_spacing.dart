import 'package:flutter/material.dart';
import 'app_colors.dart';

/// SENTIO Spacing & Effects System
class AppSpacing {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double xl = 20.0;
  static const double xxl = 24.0;
  static const double xxxl = 32.0;
  static const double section = 48.0;
}

class AppRadius {
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double xl = 20.0;
  static const double xxl = 24.0;
  static const double full = 9999.0;
}

/// Glow & Shadow Effects
class AppShadows {
  // Subtle shadows
  static BoxShadow get subtle => BoxShadow(
    color: Colors.black.withAlpha(38),
    blurRadius: 8,
    offset: const Offset(0, 2),
  );

  static BoxShadow get card => BoxShadow(
    color: Colors.black.withAlpha(51),
    blurRadius: 16,
    offset: const Offset(0, 4),
  );

  // Glow effects - Vibrant!
  static BoxShadow get primaryGlow => BoxShadow(
    color: AppColors.primary.withAlpha(102), // 40%
    blurRadius: 24,
    spreadRadius: -4,
  );

  static BoxShadow get primaryGlowStrong => BoxShadow(
    color: AppColors.primary.withAlpha(153), // 60%
    blurRadius: 32,
    spreadRadius: -2,
  );

  static BoxShadow get accentGlow => BoxShadow(
    color: AppColors.accent.withAlpha(102),
    blurRadius: 20,
    spreadRadius: -4,
  );

  static BoxShadow get successGlow => BoxShadow(
    color: AppColors.success.withAlpha(102),
    blurRadius: 20,
    spreadRadius: -4,
  );

  static BoxShadow get dangerGlow => BoxShadow(
    color: AppColors.danger.withAlpha(102),
    blurRadius: 20,
    spreadRadius: -4,
  );

  static BoxShadow get warningGlow => BoxShadow(
    color: AppColors.warning.withAlpha(102),
    blurRadius: 20,
    spreadRadius: -4,
  );

  // Inner glow for cards
  static BoxShadow get innerGlow => BoxShadow(
    color: AppColors.primary.withAlpha(25),
    blurRadius: 40,
    spreadRadius: -10,
  );
}

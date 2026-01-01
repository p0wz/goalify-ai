import 'package:flutter/material.dart';

/// SENTIO Vibrant Color System - Premium & Electric
class AppColors {
  // Background - Deep navy/purple
  static const Color background = Color(0xFF0F0D1A);
  static const Color backgroundLight = Color(0xFFF8FAFC);

  // Cards - Rich dark with purple tint
  static const Color card = Color(0xFF1A1625);
  static const Color cardElevated = Color(0xFF221D2E);
  static const Color cardLight = Color(0xFFFFFFFF);

  // Borders
  static const Color border = Color(0xFF2D2640);
  static const Color borderLight = Color(0xFFE5E7EB);

  // Text
  static const Color textPrimary = Color(0xFFF9FAFB);
  static const Color textSecondary = Color(0xFFA1A1AA);
  static const Color textMuted = Color(0xFF71717A);

  // Primary - Electric Purple
  static const Color primary = Color(0xFF9333EA);
  static const Color primaryLight = Color(0xFFA855F7);
  static const Color primaryDark = Color(0xFF7C3AED);

  // Accent - Cyan
  static const Color accent = Color(0xFF06B6D4);
  static const Color accentLight = Color(0xFF22D3EE);

  // Semantic - Vibrant
  static const Color success = Color(0xFF22C55E);
  static const Color successDark = Color(0xFF16A34A);
  static const Color danger = Color(0xFFF43F5E);
  static const Color dangerDark = Color(0xFFE11D48);
  static const Color warning = Color(0xFFF97316);
  static const Color warningDark = Color(0xFFEA580C);

  // Gradients - Rich & Vibrant
  static const LinearGradient gradientPrimary = LinearGradient(
    colors: [Color(0xFF9333EA), Color(0xFF7C3AED)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient gradientAccent = LinearGradient(
    colors: [Color(0xFF06B6D4), Color(0xFF0EA5E9)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient gradientPremium = LinearGradient(
    colors: [Color(0xFF9333EA), Color(0xFF3B82F6)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient gradientHot = LinearGradient(
    colors: [Color(0xFFF97316), Color(0xFFEF4444)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient gradientSuccess = LinearGradient(
    colors: [Color(0xFF22C55E), Color(0xFF10B981)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient gradientDanger = LinearGradient(
    colors: [Color(0xFFF43F5E), Color(0xFFE11D48)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Card gradients - Deep & Rich
  static const LinearGradient gradientCard = LinearGradient(
    colors: [Color(0xFF1E1B4B), Color(0xFF172554)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient gradientCardElevated = LinearGradient(
    colors: [Color(0xFF2D2640), Color(0xFF1E1B4B)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  // Border gradient for neon effect
  static const LinearGradient gradientBorder = LinearGradient(
    colors: [Color(0xFF9333EA), Color(0xFF06B6D4)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Navigation
  static const Color navBackground = Color(0xE60F0D1A); // 90% opacity
  static const Color navActive = Color(0xFF9333EA);
  static const Color navInactive = Color(0xFF71717A);
}

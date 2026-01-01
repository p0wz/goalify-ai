import 'package:flutter/material.dart';

/// SENTIO App Color System - Clean & Minimal
class AppColors {
  // Background
  static const Color background = Color(0xFF0A0A0F);
  static const Color backgroundLight = Color(0xFFF8FAFC);

  // Cards
  static const Color card = Color(0xFF13131A);
  static const Color cardElevated = Color(0xFF1A1A24);
  static const Color cardLight = Color(0xFFFFFFFF);
  static const Color cardLightElevated = Color(0xFFF8FAFC);

  // Borders
  static const Color border = Color(0xFF252530);
  static const Color borderLight = Color(0xFFE5E7EB);

  // Text
  static const Color textPrimary = Color(0xFFF9FAFB);
  static const Color textSecondary = Color(0xFF9CA3AF);
  static const Color textMuted = Color(0xFF6B7280);
  static const Color textPrimaryLight = Color(0xFF111827);
  static const Color textSecondaryLight = Color(0xFF6B7280);

  // Primary
  static const Color primary = Color(0xFF8B5CF6);
  static const Color primaryHover = Color(0xFF7C3AED);
  static const Color primaryMuted = Color(0xFF8B5CF6);

  // Semantic
  static const Color success = Color(0xFF10B981);
  static const Color successMuted = Color(0xFF065F46);
  static const Color danger = Color(0xFFEF4444);
  static const Color dangerMuted = Color(0xFF991B1B);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningMuted = Color(0xFF92400E);

  // Navigation
  static const Color navBackground = Color(0xFF0A0A0F);
  static const Color navBackgroundTranslucent = Color(
    0xE60A0A0F,
  ); // 90% opacity
  static const Color navActive = Color(0xFF8B5CF6);
  static const Color navInactive = Color(0xFF6B7280);

  // Gradients (minimal use)
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF8B5CF6), Color(0xFF7C3AED)],
  );

  static const LinearGradient successGradient = LinearGradient(
    colors: [Color(0xFF10B981), Color(0xFF059669)],
  );

  static const LinearGradient dangerGradient = LinearGradient(
    colors: [Color(0xFFEF4444), Color(0xFFDC2626)],
  );
}

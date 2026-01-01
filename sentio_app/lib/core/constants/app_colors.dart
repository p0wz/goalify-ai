import 'package:flutter/material.dart';

/// SENTIO Color System - Clean & Modern
/// Supports both Dark and Light themes
class AppColors {
  // ============= DARK THEME =============
  static const Color backgroundDark = Color(0xFF141416);
  static const Color cardDark = Color(0xFF1E1E22);
  static const Color cardElevatedDark = Color(0xFF252529);
  static const Color borderDark = Color(0xFF2A2A2E);
  static const Color textPrimaryDark = Color(0xFFFAFAFA);
  static const Color textSecondaryDark = Color(0xFFA1A1AA);
  static const Color textMutedDark = Color(0xFF71717A);

  // ============= LIGHT THEME =============
  static const Color backgroundLight = Color(0xFFF8F9FA);
  static const Color cardLight = Color(0xFFFFFFFF);
  static const Color cardElevatedLight = Color(0xFFF3F4F6);
  static const Color borderLight = Color(0xFFE5E7EB);
  static const Color textPrimaryLight = Color(0xFF18181B);
  static const Color textSecondaryLight = Color(0xFF71717A);
  static const Color textMutedLight = Color(0xFFA1A1AA);

  // ============= ACCENT COLORS (Shared) =============
  static const Color primary = Color(0xFF7C3AED);
  static const Color primaryLight = Color(0xFF8B5CF6);
  static const Color primaryDark = Color(0xFF6D28D9);

  static const Color success = Color(0xFF22C55E);
  static const Color successLight = Color(0xFF4ADE80);
  static const Color successDark = Color(0xFF16A34A);

  static const Color danger = Color(0xFFEF4444);
  static const Color dangerLight = Color(0xFFF87171);
  static const Color dangerDark = Color(0xFFDC2626);

  static const Color warning = Color(0xFFF59E0B);
  static const Color warningLight = Color(0xFFFBBF24);
  static const Color warningDark = Color(0xFFD97706);

  // ============= HELPERS =============
  /// Get card color based on brightness
  static Color card(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? cardDark
        : cardLight;
  }

  /// Get background color based on brightness
  static Color background(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? backgroundDark
        : backgroundLight;
  }

  /// Get border color based on brightness
  static Color border(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? borderDark
        : borderLight;
  }

  /// Get text primary color based on brightness
  static Color textPrimary(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? textPrimaryDark
        : textPrimaryLight;
  }

  /// Get text secondary color based on brightness
  static Color textSecondary(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? textSecondaryDark
        : textSecondaryLight;
  }

  /// Get text muted color based on brightness
  static Color textMuted(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? textMutedDark
        : textMutedLight;
  }
}

import 'package:flutter/material.dart';

/// SENTIO App Color System
/// Based on design specification with HSL to HEX conversions
class AppColors {
  // Primary Palette
  static const Color primaryPurple = Color(0xFF8B5CF6);      // Primary
  static const Color primaryPurpleLight = Color(0xFFA78BFA); // Primary Hover
  static const Color accentOrange = Color(0xFFF97316);       // Accent
  static const Color accentOrangeLight = Color(0xFFFB923C);  // Accent Hover

  // Semantic Colors
  static const Color winGreen = Color(0xFF22C55E);           // Win
  static const Color loseRed = Color(0xFFEF4444);            // Lose
  static const Color drawYellow = Color(0xFFF59E0B);         // Draw
  static const Color liveRed = Color(0xFFEF4444);            // Live indicator

  // Light Theme
  static const Color lightBackground = Color(0xFFF8FAFC);
  static const Color lightForeground = Color(0xFF1E293B);
  static const Color lightCard = Color(0xFFFFFFFF);
  static const Color lightMuted = Color(0xFFE2E8F0);
  static const Color lightMutedForeground = Color(0xFF64748B);
  static const Color lightBorder = Color(0xFFDDE3ED);

  // Dark Theme
  static const Color darkBackground = Color(0xFF0F172A);
  static const Color darkForeground = Color(0xFFF1F5F9);
  static const Color darkCard = Color(0xFF1E293B);
  static const Color darkMuted = Color(0xFF334155);
  static const Color darkMutedForeground = Color(0xFF94A3B8);
  static const Color darkBorder = Color(0xFF334155);

  // Gradients
  static const LinearGradient gradientPrimary = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF8B5CF6), Color(0xFFA855F7)],
  );

  static const LinearGradient gradientAccent = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFF97316), Color(0xFFFB923C)],
  );

  static const LinearGradient gradientPremium = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF8B5CF6), Color(0xFFC084FC), Color(0xFFF97316)],
  );

  static const LinearGradient gradientSuccess = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF22C55E), Color(0xFF16A34A)],
  );

  static const LinearGradient textGradient = LinearGradient(
    colors: [Color(0xFF8B5CF6), Color(0xFFF97316)],
  );
}

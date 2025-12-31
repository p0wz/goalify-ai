import 'package:flutter/material.dart';

/// SENTIO App Color System
/// Premium dark theme with vibrant accents
class AppColors {
  // Primary Palette - Richer purples
  static const Color primaryPurple = Color(0xFF8B5CF6);
  static const Color primaryPurpleLight = Color(0xFFA78BFA);
  static const Color primaryPurpleDark = Color(0xFF7C3AED);
  static const Color accentOrange = Color(0xFFF97316);
  static const Color accentOrangeLight = Color(0xFFFB923C);

  // Semantic Colors
  static const Color winGreen = Color(0xFF22C55E);
  static const Color loseRed = Color(0xFFEF4444);
  static const Color drawYellow = Color(0xFFF59E0B);
  static const Color liveRed = Color(0xFFEF4444);

  // Light Theme - Clean & Crisp
  static const Color lightBackground = Color(0xFFF8FAFC);
  static const Color lightForeground = Color(0xFF0F172A);
  static const Color lightCard = Color(0xFFFFFFFF);
  static const Color lightCardElevated = Color(0xFFFAFAFA);
  static const Color lightMuted = Color(0xFFF1F5F9);
  static const Color lightMutedForeground = Color(0xFF64748B);
  static const Color lightBorder = Color(0xFFE2E8F0);

  // Dark Theme - Deep & Premium
  static const Color darkBackground = Color(0xFF0C0A1A); // Deep purple-black
  static const Color darkForeground = Color(0xFFF8FAFC);
  static const Color darkCard = Color(0xFF1A1528); // Subtle purple tint
  static const Color darkCardElevated = Color(0xFF241E35); // Elevated card
  static const Color darkMuted = Color(0xFF2D2640);
  static const Color darkMutedForeground = Color(0xFF94A3B8);
  static const Color darkBorder = Color(0xFF3D3555);

  // Gradients - Vibrant & Dynamic
  static const LinearGradient gradientPrimary = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF7C3AED), Color(0xFF8B5CF6), Color(0xFFA855F7)],
  );

  static const LinearGradient gradientAccent = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFEA580C), Color(0xFFF97316), Color(0xFFFB923C)],
  );

  static const LinearGradient gradientPremium = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF7C3AED), Color(0xFFC084FC), Color(0xFFF97316)],
  );

  static const LinearGradient gradientSuccess = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF16A34A), Color(0xFF22C55E), Color(0xFF4ADE80)],
  );

  static const LinearGradient gradientDanger = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFDC2626), Color(0xFFEF4444), Color(0xFFF87171)],
  );

  static const LinearGradient textGradient = LinearGradient(
    colors: [Color(0xFF8B5CF6), Color(0xFFF97316)],
  );

  // Dark overlay gradient for cards
  static const LinearGradient cardOverlay = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0x0AFFFFFF), Color(0x00FFFFFF)],
  );

  // Neon glow gradient border
  static const LinearGradient neonBorder = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF8B5CF6), Color(0xFFC084FC), Color(0xFFF97316)],
  );
}

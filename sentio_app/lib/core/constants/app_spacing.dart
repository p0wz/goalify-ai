import 'package:flutter/material.dart';

/// SENTIO App Spacing & Radius System
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

class AppShadows {
  // Subtle card shadow
  static BoxShadow get cardShadow => BoxShadow(
    color: Colors.black.withAlpha(13),
    blurRadius: 20,
    offset: const Offset(0, 8),
  );

  // Elevated card shadow
  static BoxShadow get elevatedShadow => BoxShadow(
    color: Colors.black.withAlpha(25),
    blurRadius: 30,
    offset: const Offset(0, 12),
  );

  // Primary glow
  static BoxShadow get primaryGlow => BoxShadow(
    color: const Color(0xFF8B5CF6).withAlpha(64),
    blurRadius: 40,
    spreadRadius: -5,
  );

  // Strong primary glow
  static BoxShadow get primaryGlowStrong => BoxShadow(
    color: const Color(0xFF8B5CF6).withAlpha(102),
    blurRadius: 50,
    spreadRadius: 0,
  );

  // Accent glow
  static BoxShadow get accentGlow => BoxShadow(
    color: const Color(0xFFF97316).withAlpha(64),
    blurRadius: 40,
    spreadRadius: -5,
  );

  // Win glow
  static BoxShadow get winGlow => BoxShadow(
    color: const Color(0xFF22C55E).withAlpha(77),
    blurRadius: 30,
    offset: const Offset(0, 4),
  );

  // Lose glow
  static BoxShadow get loseGlow => BoxShadow(
    color: const Color(0xFFEF4444).withAlpha(77),
    blurRadius: 30,
    offset: const Offset(0, 4),
  );

  // Neon glow for buttons
  static BoxShadow get neonGlow => BoxShadow(
    color: const Color(0xFF8B5CF6).withAlpha(128),
    blurRadius: 20,
    spreadRadius: -2,
  );

  // Inner glow effect
  static BoxShadow get innerGlow => BoxShadow(
    color: Colors.white.withAlpha(13),
    blurRadius: 15,
    spreadRadius: -5,
    offset: const Offset(0, -5),
  );
}

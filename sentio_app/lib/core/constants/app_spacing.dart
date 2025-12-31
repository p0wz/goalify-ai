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
  // Light shadows
  static BoxShadow cardShadow = BoxShadow(
    color: Colors.black.withOpacity(0.05),
    blurRadius: 10,
    offset: const Offset(0, 4),
  );

  // Glow effects
  static BoxShadow primaryGlow = BoxShadow(
    color: const Color(0xFF8B5CF6).withOpacity(0.25),
    blurRadius: 40,
    spreadRadius: 0,
  );

  static BoxShadow accentGlow = BoxShadow(
    color: const Color(0xFFF97316).withOpacity(0.25),
    blurRadius: 40,
    spreadRadius: 0,
  );

  static BoxShadow winGlow = BoxShadow(
    color: const Color(0xFF22C55E).withOpacity(0.35),
    blurRadius: 20,
    offset: const Offset(0, 4),
  );
}

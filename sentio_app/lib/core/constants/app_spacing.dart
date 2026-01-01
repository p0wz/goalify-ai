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

/// Minimal shadows - no glows
class AppShadows {
  static BoxShadow get subtle => BoxShadow(
    color: Colors.black.withAlpha(25),
    blurRadius: 8,
    offset: const Offset(0, 2),
  );

  static BoxShadow get card => BoxShadow(
    color: Colors.black.withAlpha(38),
    blurRadius: 16,
    offset: const Offset(0, 4),
  );

  static BoxShadow get elevated => BoxShadow(
    color: Colors.black.withAlpha(51),
    blurRadius: 24,
    offset: const Offset(0, 8),
  );
}

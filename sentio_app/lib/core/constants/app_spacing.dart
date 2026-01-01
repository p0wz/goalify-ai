import 'package:flutter/material.dart';

/// SENTIO Spacing & Effects System - Clean & Minimal
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

/// Minimal Shadow Effects - No Glows
class AppShadows {
  static BoxShadow get subtle => BoxShadow(
    color: Colors.black.withAlpha(20),
    blurRadius: 4,
    offset: const Offset(0, 1),
  );

  static BoxShadow get card => BoxShadow(
    color: Colors.black.withAlpha(30),
    blurRadius: 8,
    offset: const Offset(0, 2),
  );

  static BoxShadow get elevated => BoxShadow(
    color: Colors.black.withAlpha(40),
    blurRadius: 16,
    offset: const Offset(0, 4),
  );

  // For light theme - lighter shadows
  static BoxShadow get cardLight => BoxShadow(
    color: Colors.black.withAlpha(15),
    blurRadius: 10,
    offset: const Offset(0, 2),
  );
}

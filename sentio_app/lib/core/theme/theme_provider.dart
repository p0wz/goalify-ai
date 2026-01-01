import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Theme mode options
enum AppThemeMode { system, light, dark }

/// Theme state
class ThemeState {
  final AppThemeMode mode;
  final ThemeMode themeMode;

  ThemeState({required this.mode, required this.themeMode});

  factory ThemeState.initial() {
    return ThemeState(mode: AppThemeMode.system, themeMode: ThemeMode.system);
  }

  ThemeState copyWith({AppThemeMode? mode, ThemeMode? themeMode}) {
    return ThemeState(
      mode: mode ?? this.mode,
      themeMode: themeMode ?? this.themeMode,
    );
  }
}

/// Theme provider
class ThemeNotifier extends StateNotifier<ThemeState> {
  ThemeNotifier() : super(ThemeState.initial()) {
    _loadTheme();
  }

  static const _key = 'theme_mode';

  Future<void> _loadTheme() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_key);

    if (saved != null) {
      final mode = AppThemeMode.values.firstWhere(
        (e) => e.name == saved,
        orElse: () => AppThemeMode.system,
      );
      setTheme(mode);
    }
  }

  Future<void> setTheme(AppThemeMode mode) async {
    ThemeMode themeMode;

    switch (mode) {
      case AppThemeMode.light:
        themeMode = ThemeMode.light;
        break;
      case AppThemeMode.dark:
        themeMode = ThemeMode.dark;
        break;
      case AppThemeMode.system:
        themeMode = ThemeMode.system;
        break;
    }

    state = state.copyWith(mode: mode, themeMode: themeMode);

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, mode.name);
  }

  /// Get current brightness based on theme mode
  Brightness get currentBrightness {
    if (state.mode == AppThemeMode.system) {
      final platformBrightness =
          SchedulerBinding.instance.platformDispatcher.platformBrightness;
      return platformBrightness;
    }
    return state.mode == AppThemeMode.dark ? Brightness.dark : Brightness.light;
  }
}

/// Theme provider
final themeProvider = StateNotifierProvider<ThemeNotifier, ThemeState>((ref) {
  return ThemeNotifier();
});

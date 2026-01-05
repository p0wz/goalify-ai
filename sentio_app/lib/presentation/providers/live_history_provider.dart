import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/services/api_service.dart';
import 'auth_provider.dart';
import 'live_provider.dart'; // Import LiveSignal model

/// Live History State
class LiveHistoryState {
  final List<LiveSignal> signals;
  final bool isLoading;
  final String? error;
  final int dailyWinRate;
  final int monthlyWinRate;

  LiveHistoryState({
    this.signals = const [],
    this.isLoading = false,
    this.error,
    this.dailyWinRate = 0,
    this.monthlyWinRate = 0,
  });

  LiveHistoryState copyWith({
    List<LiveSignal>? signals,
    bool? isLoading,
    String? error,
    int? dailyWinRate,
    int? monthlyWinRate,
  }) {
    return LiveHistoryState(
      signals: signals ?? this.signals,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      dailyWinRate: dailyWinRate ?? this.dailyWinRate,
      monthlyWinRate: monthlyWinRate ?? this.monthlyWinRate,
    );
  }
}

/// Live History Notifier
class LiveHistoryNotifier extends StateNotifier<LiveHistoryState> {
  final Ref _ref;

  LiveHistoryNotifier(this._ref) : super(LiveHistoryState());

  Future<void> fetchHistory() async {
    state = state.copyWith(isLoading: true, error: null);

    // Get auth token
    final authState = _ref.read(authProvider);
    final token = authState.token;

    if (token == null) {
      state = state.copyWith(
        isLoading: false,
        error: 'Giriş yapmanız gerekiyor',
      );
      return;
    }

    try {
      // Use ApiService which now supports getLiveHistory, but we need to inject token manually
      // or rely on ApiService's internal token.
      // ApiService instance is global, let's use it.
      apiService.setAuthToken(token);

      final data = await apiService.getLiveHistory();

      if (data['success'] == true) {
        final List<dynamic> signalList = data['signals'] ?? [];
        final signals = signalList
            .map((json) => LiveSignal.fromJson(json))
            .toList();

        // Parse stats
        final stats = data['stats'] ?? {};
        final dailyWR = stats['dailyWinRate'] ?? 0;
        final monthlyWR = stats['monthlyWinRate'] ?? 0;

        state = state.copyWith(
          signals: signals,
          isLoading: false,
          dailyWinRate: dailyWR,
          monthlyWinRate: monthlyWR,
        );
      } else {
        state = state.copyWith(
          isLoading: false,
          error: data['error'] ?? 'Geçmiş yüklenemedi',
        );
      }
    } catch (e) {
      if (kDebugMode) {
        print('Live history fetch error: $e');
      }
      state = state.copyWith(isLoading: false, error: 'Bir hata oluştu');
    }
  }

  void refresh() => fetchHistory();
}

/// Provider
final liveHistoryProvider =
    StateNotifierProvider<LiveHistoryNotifier, LiveHistoryState>((ref) {
      return LiveHistoryNotifier(ref);
    });

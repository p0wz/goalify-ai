import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'auth_provider.dart';

/// Live Signal Model
class LiveSignal {
  final String id;
  final String homeTeam;
  final String awayTeam;
  final String league;
  final String market;
  final String entryScore;
  final int entryMinute;
  final int confidence;
  final String status; // PENDING, WON, LOST
  final String? finalScore;
  final String reason;
  final DateTime createdAt;

  LiveSignal({
    required this.id,
    required this.homeTeam,
    required this.awayTeam,
    required this.league,
    required this.market,
    required this.entryScore,
    required this.entryMinute,
    required this.confidence,
    required this.status,
    this.finalScore,
    required this.reason,
    required this.createdAt,
  });

  factory LiveSignal.fromJson(Map<String, dynamic> json) {
    return LiveSignal(
      id: json['id'] ?? '',
      homeTeam: json['home_team'] ?? json['homeTeam'] ?? json['home'] ?? '',
      awayTeam: json['away_team'] ?? json['awayTeam'] ?? json['away'] ?? '',
      league: json['league'] ?? '',
      market: json['strategy'] ?? json['market'] ?? '',
      entryScore: json['entry_score'] ?? json['entryScore'] ?? '0-0',
      entryMinute: json['entry_minute'] ?? json['entryMinute'] ?? 0,
      confidence: json['confidence'] ?? json['confidencePercent'] ?? 0,
      status: json['status'] ?? 'PENDING',
      finalScore: json['final_score'] ?? json['finalScore'],
      reason: json['reason'] ?? '',
      createdAt: json['entryTime'] != null
          ? DateTime.fromMillisecondsSinceEpoch(
              int.parse(json['entryTime'].toString()),
            )
          : (json['created_at'] != null
                ? DateTime.tryParse(json['created_at'].toString()) ??
                      DateTime.now()
                : DateTime.now()),
    );
  }

  bool get isPending => status == 'PENDING';
  bool get isWon => status == 'WON';
  bool get isLost => status == 'LOST';
}

/// Live Signals State
class LiveSignalsState {
  final List<LiveSignal> signals;
  final List<LiveSignal> historySignals;
  final bool isLoading;
  final String? error;
  final int dailyWinRate;
  final int monthlyWinRate;

  LiveSignalsState({
    this.signals = const [],
    this.historySignals = const [],
    this.isLoading = false,
    this.error,
    this.dailyWinRate = 0,
    this.monthlyWinRate = 0,
  });

  LiveSignalsState copyWith({
    List<LiveSignal>? signals,
    List<LiveSignal>? historySignals,
    bool? isLoading,
    String? error,
    int? dailyWinRate,
    int? monthlyWinRate,
  }) {
    return LiveSignalsState(
      signals: signals ?? this.signals,
      historySignals: historySignals ?? this.historySignals,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      dailyWinRate: dailyWinRate ?? this.dailyWinRate,
      monthlyWinRate: monthlyWinRate ?? this.monthlyWinRate,
    );
  }

  int get pendingCount => signals.where((s) => s.isPending).length;
  int get wonCount => signals.where((s) => s.isWon).length;
  int get lostCount => signals.where((s) => s.isLost).length;
}

/// Live Signals Notifier - requires auth token
class LiveSignalsNotifier extends StateNotifier<LiveSignalsState> {
  static const String baseUrl = 'https://goalify-ai.onrender.com/api';
  final Dio _dio;
  final Ref _ref;

  LiveSignalsNotifier(this._ref)
    : _dio = Dio(
        BaseOptions(
          baseUrl: baseUrl,
          connectTimeout: const Duration(seconds: 30),
          receiveTimeout: const Duration(seconds: 30),
        ),
      ),
      super(LiveSignalsState());

  Future<void> fetchSignals() async {
    // Keep existing fetchSignals logic but ensure it preserves history
    state = state.copyWith(isLoading: true, error: null);

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
      final response = await _dio.get(
        '/mobile/live-signals',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      if (response.data != null && response.data['success'] == true) {
        final List<dynamic> data = response.data['signals'] ?? [];
        final signals = data.map((json) => LiveSignal.fromJson(json)).toList();

        final stats = response.data['stats'] ?? {};
        final dailyWR = stats['dailyWinRate'] ?? 0;
        final monthlyWR = stats['monthlyWinRate'] ?? 0;

        signals.sort((a, b) {
          if (a.isPending && !b.isPending) return -1;
          if (!a.isPending && b.isPending) return 1;
          return b.createdAt.compareTo(a.createdAt);
        });

        state = state.copyWith(
          signals: signals,
          isLoading: false,
          dailyWinRate: dailyWR,
          monthlyWinRate: monthlyWR,
        );
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response.data?['error'] ?? 'Sinyaller yüklenemedi',
        );
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Hata: $e');
    }
  }

  Future<void> fetchHistory() async {
    // Don't set global loading to avoid flickering dashboard
    try {
      final response = await _dio.get('/mobile/live-history');

      if (response.data != null && response.data['success'] == true) {
        final List<dynamic> data = response.data['history'] ?? [];
        final history = data.map((json) => LiveSignal.fromJson(json)).toList();

        // Sort by date desc
        history.sort((a, b) => b.createdAt.compareTo(a.createdAt));

        state = state.copyWith(historySignals: history);
      }
    } catch (e) {
      if (kDebugMode) print('History fetch error: $e');
    }
  }

  void refresh() {
    fetchSignals();
    fetchHistory();
  }
}

/// Provider - uses ref to access auth token
final liveSignalsProvider =
    StateNotifierProvider<LiveSignalsNotifier, LiveSignalsState>((ref) {
      return LiveSignalsNotifier(ref);
    });

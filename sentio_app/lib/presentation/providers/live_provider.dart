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
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  bool get isPending => status == 'PENDING';
  bool get isWon => status == 'WON';
  bool get isLost => status == 'LOST';
}

/// Live Signals State
class LiveSignalsState {
  final List<LiveSignal> signals;
  final bool isLoading;
  final String? error;

  LiveSignalsState({
    this.signals = const [],
    this.isLoading = false,
    this.error,
  });

  LiveSignalsState copyWith({
    List<LiveSignal>? signals,
    bool? isLoading,
    String? error,
  }) {
    return LiveSignalsState(
      signals: signals ?? this.signals,
      isLoading: isLoading ?? this.isLoading,
      error: error,
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
    state = state.copyWith(isLoading: true, error: null);

    // Get auth token from auth provider
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

        // Sort: pending first, then by date desc
        signals.sort((a, b) {
          if (a.isPending && !b.isPending) return -1;
          if (!a.isPending && b.isPending) return 1;
          return b.createdAt.compareTo(a.createdAt);
        });

        state = state.copyWith(signals: signals, isLoading: false);
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response.data?['error'] ?? 'Sinyaller yüklenemedi',
        );
      }
    } on DioException catch (e) {
      if (kDebugMode) {
        print('Live signals fetch error: ${e.message}');
      }

      if (e.response?.statusCode == 401) {
        state = state.copyWith(
          isLoading: false,
          error: 'Oturum süresi doldu, tekrar giriş yapın',
        );
      } else {
        state = state.copyWith(isLoading: false, error: 'Bağlantı hatası');
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Beklenmeyen hata');
    }
  }

  void refresh() => fetchSignals();
}

/// Provider - uses ref to access auth token
final liveSignalsProvider =
    StateNotifierProvider<LiveSignalsNotifier, LiveSignalsState>((ref) {
      return LiveSignalsNotifier(ref);
    });

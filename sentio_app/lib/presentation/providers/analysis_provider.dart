import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/services/api_service.dart';

/// Match Model
class Match {
  final String matchId;
  final String homeTeam;
  final String awayTeam;
  final String league;
  final int timestamp;
  final int? homeScore;
  final int? awayScore;
  final String? stage;
  final String? prediction;
  final double? confidence;

  const Match({
    required this.matchId,
    required this.homeTeam,
    required this.awayTeam,
    required this.league,
    required this.timestamp,
    this.homeScore,
    this.awayScore,
    this.stage,
    this.prediction,
    this.confidence,
  });

  factory Match.fromJson(Map<String, dynamic> json) {
    return Match(
      matchId: json['matchId'] ?? '',
      homeTeam: json['homeTeam'] ?? '',
      awayTeam: json['awayTeam'] ?? '',
      league: json['league'] ?? '',
      timestamp: json['timestamp'] ?? 0,
      homeScore: json['homeScore'],
      awayScore: json['awayScore'],
      stage: json['stage'],
      prediction: json['prediction'],
      confidence: json['confidence']?.toDouble(),
    );
  }

  bool get isLive {
    final stages = ['1st Half', '2nd Half', 'Half Time', 'Extra Time'];
    if (stage == null) return false;

    // Check if it's a minute indicator like "45'" or "90+"
    if (stage!.contains("'") || stage!.contains('+')) return true;

    // Check numeric minute
    final minute = int.tryParse(stage!);
    if (minute != null && minute > 0 && minute <= 120) return true;

    return stages.any((s) => stage!.contains(s));
  }

  String get formattedTime {
    final date = DateTime.fromMillisecondsSinceEpoch(timestamp * 1000);
    return '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
  }
}

/// Analysis State
class AnalysisState {
  final List<Match> matches;
  final List<Match> allMatches;
  final bool isLoading;
  final String? error;
  final DateTime? lastUpdated;

  const AnalysisState({
    this.matches = const [],
    this.allMatches = const [],
    this.isLoading = false,
    this.error,
    this.lastUpdated,
  });

  AnalysisState copyWith({
    List<Match>? matches,
    List<Match>? allMatches,
    bool? isLoading,
    String? error,
    DateTime? lastUpdated,
  }) {
    return AnalysisState(
      matches: matches ?? this.matches,
      allMatches: allMatches ?? this.allMatches,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      lastUpdated: lastUpdated ?? this.lastUpdated,
    );
  }
}

/// Analysis Notifier
class AnalysisNotifier extends StateNotifier<AnalysisState> {
  AnalysisNotifier() : super(const AnalysisState());

  Future<void> fetchAnalysisResults() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await apiService.getAnalysisResults();

      if (response['success'] == true) {
        final results =
            (response['results'] as List?)
                ?.map((e) => Match.fromJson(e))
                .toList() ??
            [];

        final all =
            (response['allMatches'] as List?)
                ?.map((e) => Match.fromJson(e))
                .toList() ??
            [];

        state = state.copyWith(
          matches: results,
          allMatches: all,
          isLoading: false,
          lastUpdated: DateTime.now(),
        );
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response['error'] ?? 'Analiz sonuçları alınamadı',
        );
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Bağlantı hatası');
    }
  }

  Future<void> runAnalysis({int limit = 500, bool leagueFilter = true}) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await apiService.runAnalysis(
        limit: limit,
        leagueFilter: leagueFilter,
      );

      if (response['success'] == true) {
        final results =
            (response['results'] as List?)
                ?.map((e) => Match.fromJson(e))
                .toList() ??
            [];

        final all =
            (response['allMatches'] as List?)
                ?.map((e) => Match.fromJson(e))
                .toList() ??
            [];

        state = state.copyWith(
          matches: results,
          allMatches: all,
          isLoading: false,
          lastUpdated: DateTime.now(),
        );
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response['error'] ?? 'Analiz çalıştırılamadı',
        );
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Bağlantı hatası');
    }
  }
}

/// Providers
final analysisProvider = StateNotifierProvider<AnalysisNotifier, AnalysisState>(
  (ref) {
    return AnalysisNotifier();
  },
);

/// Live Matches - Filtered from all matches
final liveMatchesProvider = Provider<List<Match>>((ref) {
  final state = ref.watch(analysisProvider);
  return state.allMatches.where((m) => m.isLive).toList();
});

/// Upcoming Matches - Future matches
final upcomingMatchesProvider = Provider<List<Match>>((ref) {
  final state = ref.watch(analysisProvider);
  final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
  return state.allMatches.where((m) => m.timestamp > now && !m.isLive).toList()
    ..sort((a, b) => a.timestamp.compareTo(b.timestamp));
});

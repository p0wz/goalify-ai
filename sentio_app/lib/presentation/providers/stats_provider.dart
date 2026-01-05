import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/services/api_service.dart';

/// Settled Bets Provider - Fetches WON/LOST bets
final settledBetsProvider = FutureProvider<List<Map<String, dynamic>>>((
  ref,
) async {
  try {
    final wonResponse = await apiService.getMobileBets(status: 'WON');
    final wonBets = (wonResponse['bets'] as List?) ?? [];

    final lostResponse = await apiService.getMobileBets(status: 'LOST');
    final lostBets = (lostResponse['bets'] as List?) ?? [];

    final allSettled = [...wonBets, ...lostBets];
    allSettled.sort(
      (a, b) => (b['createdAt'] ?? '').compareTo(a['createdAt'] ?? ''),
    );

    return allSettled.cast<Map<String, dynamic>>();
  } catch (e) {
    return [];
  }
});

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';

import '../predictions/predictions_screen.dart';
import '../stats/stats_screen.dart';

/// Pre-Match Screen (Tabs: Predictions & Stats)
class PreMatchScreen extends ConsumerWidget {
  const PreMatchScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Strings could be used here but hardcoding for now as verified in updated requests
    // "Maç Önü" -> Pre-Match

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Maç Önü'),
          bottom: TabBar(
            indicatorColor: AppColors.primary,
            labelColor: AppColors.primary,
            unselectedLabelColor: AppColors.textMuted(context),
            tabs: const [
              Tab(text: 'Tahminler'),
              Tab(text: 'Sonuçlar'),
            ],
          ),
          actions: [
            // We can add a refresh button that refreshes the ACTIVE tab,
            // generally manual refresh inside views is better or pull-to-refresh.
            // Let's keep it simple for now.
          ],
        ),
        body: const TabBarView(children: [PredictionsView(), StatsView()]),
      ),
    );
  }
}

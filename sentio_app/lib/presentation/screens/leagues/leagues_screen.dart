import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../widgets/common/glass_card.dart';

/// Leagues Screen
/// Shows available leagues with follow functionality
class LeaguesScreen extends StatefulWidget {
  const LeaguesScreen({super.key});

  @override
  State<LeaguesScreen> createState() => _LeaguesScreenState();
}

class _LeaguesScreenState extends State<LeaguesScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final List<String> _tabs = ['Takip Edilen', 'Tümü', 'Ülkeler'];

  // Mock followed leagues
  final Set<String> _followedLeagues = {
    'super-lig',
    'premier-league',
    'la-liga',
  };

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ligler'),
        actions: [
          IconButton(icon: const Icon(Icons.search_rounded), onPressed: () {}),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primaryPurple,
          unselectedLabelColor: Theme.of(
            context,
          ).colorScheme.onSurface.withAlpha(128),
          indicatorColor: AppColors.primaryPurple,
          tabs: _tabs.map((t) => Tab(text: t)).toList(),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildFollowedLeagues(context),
          _buildAllLeagues(context),
          _buildCountries(context),
        ],
      ),
    );
  }

  Widget _buildFollowedLeagues(BuildContext context) {
    final followedLeagueData = _allLeagues
        .where((l) => _followedLeagues.contains(l['id']))
        .toList();

    if (followedLeagueData.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.star_border_rounded,
              size: 64,
              color: Theme.of(context).colorScheme.onSurface.withAlpha(77),
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(
              'Henüz takip ettiğiniz lig yok',
              style: TextStyle(
                color: Theme.of(context).colorScheme.onSurface.withAlpha(128),
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.lg),
      itemCount: followedLeagueData.length,
      itemBuilder: (context, index) {
        final league = followedLeagueData[index];
        return _buildLeagueCard(context, league, index);
      },
    );
  }

  Widget _buildAllLeagues(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.lg),
      itemCount: _allLeagues.length,
      itemBuilder: (context, index) {
        final league = _allLeagues[index];
        return _buildLeagueCard(context, league, index);
      },
    );
  }

  Widget _buildCountries(BuildContext context) {
    final countries = [
      {'flag': '🇹🇷', 'name': 'Türkiye', 'count': 3},
      {'flag': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'name': 'İngiltere', 'count': 4},
      {'flag': '🇪🇸', 'name': 'İspanya', 'count': 2},
      {'flag': '🇩🇪', 'name': 'Almanya', 'count': 2},
      {'flag': '🇮🇹', 'name': 'İtalya', 'count': 2},
      {'flag': '🇫🇷', 'name': 'Fransa', 'count': 2},
      {'flag': '🇳🇱', 'name': 'Hollanda', 'count': 1},
      {'flag': '🇵🇹', 'name': 'Portekiz', 'count': 1},
    ];

    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.lg),
      itemCount: countries.length,
      itemBuilder: (context, index) {
        final country = countries[index];
        return GlassCard(
          onTap: () {
            // Navigate to country leagues
          },
          child: Row(
            children: [
              Text(
                country['flag'] as String,
                style: const TextStyle(fontSize: 32),
              ),
              const SizedBox(width: AppSpacing.lg),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      country['name'] as String,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      '${country['count']} lig',
                      style: TextStyle(
                        fontSize: 12,
                        color: Theme.of(
                          context,
                        ).colorScheme.onSurface.withAlpha(128),
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.chevron_right_rounded,
                color: Theme.of(context).colorScheme.onSurface.withAlpha(77),
              ),
            ],
          ),
        ).animate().fadeIn(
          delay: Duration(milliseconds: index * 50),
          duration: 300.ms,
        );
      },
    );
  }

  Widget _buildLeagueCard(
    BuildContext context,
    Map<String, dynamic> league,
    int index,
  ) {
    final isFollowed = _followedLeagues.contains(league['id']);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      child: GlassCard(
        variant: isFollowed
            ? GlassCardVariant.premium
            : GlassCardVariant.defaultVariant,
        onTap: () {
          // Navigate to league details
        },
        child: Row(
          children: [
            // League icon
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppColors.primaryPurple.withAlpha(25),
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
              child: Center(
                child: Text(
                  league['flag'] as String,
                  style: const TextStyle(fontSize: 24),
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.lg),

            // League info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    league['name'] as String,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${league['teams']} takım • ${league['matches']} maç/hafta',
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark
                          ? AppColors.darkMutedForeground
                          : AppColors.lightMutedForeground,
                    ),
                  ),
                ],
              ),
            ),

            // Follow button
            GestureDetector(
              onTap: () {
                setState(() {
                  if (isFollowed) {
                    _followedLeagues.remove(league['id']);
                  } else {
                    _followedLeagues.add(league['id'] as String);
                  }
                });
              },
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: isFollowed
                      ? AppColors.primaryPurple
                      : AppColors.primaryPurple.withAlpha(25),
                  borderRadius: BorderRadius.circular(AppRadius.full),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      isFollowed ? Icons.check_rounded : Icons.add_rounded,
                      size: 16,
                      color: isFollowed
                          ? Colors.white
                          : AppColors.primaryPurple,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      isFollowed ? 'Takip' : 'Takip Et',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: isFollowed
                            ? Colors.white
                            : AppColors.primaryPurple,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(
      delay: Duration(milliseconds: index * 50),
      duration: 300.ms,
    );
  }

  // Mock league data
  final List<Map<String, dynamic>> _allLeagues = [
    {
      'id': 'super-lig',
      'name': 'Süper Lig',
      'country': 'Türkiye',
      'flag': '🇹🇷',
      'teams': 20,
      'matches': 10,
    },
    {
      'id': 'premier-league',
      'name': 'Premier League',
      'country': 'İngiltere',
      'flag': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'teams': 20,
      'matches': 10,
    },
    {
      'id': 'la-liga',
      'name': 'La Liga',
      'country': 'İspanya',
      'flag': '🇪🇸',
      'teams': 20,
      'matches': 10,
    },
    {
      'id': 'bundesliga',
      'name': 'Bundesliga',
      'country': 'Almanya',
      'flag': '🇩🇪',
      'teams': 18,
      'matches': 9,
    },
    {
      'id': 'serie-a',
      'name': 'Serie A',
      'country': 'İtalya',
      'flag': '🇮🇹',
      'teams': 20,
      'matches': 10,
    },
    {
      'id': 'ligue-1',
      'name': 'Ligue 1',
      'country': 'Fransa',
      'flag': '🇫🇷',
      'teams': 18,
      'matches': 9,
    },
    {
      'id': 'eredivisie',
      'name': 'Eredivisie',
      'country': 'Hollanda',
      'flag': '🇳🇱',
      'teams': 18,
      'matches': 9,
    },
    {
      'id': 'primeira-liga',
      'name': 'Primeira Liga',
      'country': 'Portekiz',
      'flag': '🇵🇹',
      'teams': 18,
      'matches': 9,
    },
    {
      'id': 'championship',
      'name': 'Championship',
      'country': 'İngiltere',
      'flag': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'teams': 24,
      'matches': 12,
    },
    {
      'id': '1-lig',
      'name': '1. Lig',
      'country': 'Türkiye',
      'flag': '🇹🇷',
      'teams': 18,
      'matches': 9,
    },
  ];
}

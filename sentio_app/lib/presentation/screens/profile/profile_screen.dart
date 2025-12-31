import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../widgets/common/glass_card.dart';

/// Profile Screen
/// Shows user info, stats, and menu options
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profil'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () {
              // Navigate to settings
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          children: [
            // Profile Header
            _buildProfileHeader(context),
            const SizedBox(height: AppSpacing.xxl),

            // Stats Grid
            _buildStatsGrid(context),
            const SizedBox(height: AppSpacing.xxl),

            // Menu Items
            _buildMenuSection(context),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeader(BuildContext context) {
    return Column(
      children: [
        // Avatar
        Container(
          width: 100,
          height: 100,
          decoration: BoxDecoration(
            gradient: AppColors.gradientPrimary,
            shape: BoxShape.circle,
            boxShadow: [AppShadows.primaryGlow],
          ),
          child: const Center(
            child: Text(
              'AY',
              style: TextStyle(
                fontSize: 36,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ),
        ).animate().fadeIn(duration: 400.ms).scale(delay: 100.ms),

        const SizedBox(height: AppSpacing.lg),

        // Name
        const Text(
          'Ahmet Yılmaz',
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700),
        ).animate().fadeIn(delay: 200.ms),

        const SizedBox(height: AppSpacing.xs),

        // Badge
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            gradient: AppColors.gradientPremium,
            borderRadius: BorderRadius.circular(AppRadius.full),
          ),
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.star_rounded, size: 14, color: Colors.white),
              SizedBox(width: 4),
              Text(
                'Pro Üye',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ).animate().fadeIn(delay: 300.ms),

        const SizedBox(height: AppSpacing.sm),

        // Username
        Text(
          '@ahmetyilmaz',
          style: TextStyle(
            fontSize: 14,
            color: Theme.of(context).colorScheme.onSurface.withAlpha(128),
          ),
        ).animate().fadeIn(delay: 400.ms),
      ],
    );
  }

  Widget _buildStatsGrid(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _buildStatItem(
            context,
            value: '247',
            label: 'Tahmin',
            color: AppColors.primaryPurple,
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: _buildStatItem(
            context,
            value: '%81.4',
            label: 'Başarı',
            color: AppColors.winGreen,
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: _buildStatItem(
            context,
            value: '201',
            label: 'Kazanılan',
            color: AppColors.accentOrange,
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: _buildStatItem(
            context,
            value: '156',
            label: 'Seri',
            color: AppColors.primaryPurple,
          ),
        ),
      ],
    ).animate().fadeIn(delay: 500.ms);
  }

  Widget _buildStatItem(
    BuildContext context, {
    required String value,
    required String label,
    required Color color,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GlassCard(
      padding: const EdgeInsets.symmetric(
        vertical: AppSpacing.lg,
        horizontal: AppSpacing.sm,
      ),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: isDark
                  ? AppColors.darkMutedForeground
                  : AppColors.lightMutedForeground,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuSection(BuildContext context) {
    final menuItems = [
      {
        'icon': Icons.person_outline_rounded,
        'title': 'Profili Düzenle',
        'route': '/edit-profile',
      },
      {
        'icon': Icons.bar_chart_rounded,
        'title': 'İstatistiklerim',
        'route': '/stats',
      },
      {
        'icon': Icons.star_outline_rounded,
        'title': 'Premium',
        'route': '/premium',
      },
      {
        'icon': Icons.notifications_outlined,
        'title': 'Bildirimler',
        'route': '/notifications',
      },
      {
        'icon': Icons.settings_outlined,
        'title': 'Ayarlar',
        'route': '/settings',
      },
      {'icon': Icons.help_outline_rounded, 'title': 'Yardım', 'route': '/help'},
      {
        'icon': Icons.logout_rounded,
        'title': 'Çıkış Yap',
        'route': '/logout',
        'isDestructive': true,
      },
    ];

    return GlassCard(
      padding: EdgeInsets.zero,
      child: Column(
        children: menuItems.asMap().entries.map((entry) {
          final index = entry.key;
          final item = entry.value;
          final isLast = index == menuItems.length - 1;
          final isDestructive = item['isDestructive'] == true;

          return Column(
            children: [
              ListTile(
                leading: Icon(
                  item['icon'] as IconData,
                  color: isDestructive
                      ? AppColors.loseRed
                      : AppColors.primaryPurple,
                ),
                title: Text(
                  item['title'] as String,
                  style: TextStyle(
                    fontWeight: FontWeight.w500,
                    color: isDestructive ? AppColors.loseRed : null,
                  ),
                ),
                trailing: Icon(
                  Icons.chevron_right_rounded,
                  color: Theme.of(context).colorScheme.onSurface.withAlpha(77),
                ),
                onTap: () {
                  // Navigate to route
                },
              ),
              if (!isLast)
                Divider(
                  height: 1,
                  indent: 56,
                  color: Theme.of(context).dividerColor,
                ),
            ],
          );
        }).toList(),
      ),
    ).animate().fadeIn(delay: 600.ms).slideY(begin: 0.1, end: 0);
  }
}

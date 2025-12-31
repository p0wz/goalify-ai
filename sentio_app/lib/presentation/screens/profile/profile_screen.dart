import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common/glass_card.dart';
import '../../widgets/common/gradient_button.dart';

/// Profile Screen
/// Shows user info, stats, and menu options - or login prompt if not authenticated
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    // If not authenticated, show login prompt
    if (!authState.isAuthenticated) {
      return _buildLoginPrompt(context);
    }

    // Authenticated - show profile
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profil'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => context.push('/settings'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          children: [
            // Profile Header
            _buildProfileHeader(context, authState),
            const SizedBox(height: AppSpacing.xxl),

            // Stats Grid
            _buildStatsGrid(context),
            const SizedBox(height: AppSpacing.xxl),

            // Menu Items
            _buildMenuSection(context, ref),
          ],
        ),
      ),
    );
  }

  Widget _buildLoginPrompt(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profil')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.xxl),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: AppColors.primaryPurple.withAlpha(25),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.person_outline_rounded,
                  size: 48,
                  color: AppColors.primaryPurple.withAlpha(128),
                ),
              ).animate().fadeIn().scale(),
              const SizedBox(height: AppSpacing.xl),
              Text(
                'Hesabınıza Giriş Yapın',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ).animate().fadeIn(delay: 100.ms),
              const SizedBox(height: AppSpacing.sm),
              Text(
                'Tahminlerinizi kaydedin, istatistiklerinizi takip edin',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onSurface.withAlpha(153),
                ),
              ).animate().fadeIn(delay: 200.ms),
              const SizedBox(height: AppSpacing.xxl),
              GradientButton(
                text: 'Giriş Yap',
                onPressed: () => context.go('/login'),
              ).animate().fadeIn(delay: 300.ms),
              const SizedBox(height: AppSpacing.md),
              TextButton(
                onPressed: () => context.go('/register'),
                child: const Text('Hesabınız yok mu? Kayıt olun'),
              ).animate().fadeIn(delay: 400.ms),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileHeader(BuildContext context, AuthState authState) {
    final user = authState.user;
    final email = user?.email ?? 'kullanici@email.com';
    final name = user?.name ?? email.split('@').first;
    final initials = name.isNotEmpty ? name[0].toUpperCase() : 'U';
    final isPremium = user?.isPremium ?? false;

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
          child: Center(
            child: Text(
              initials,
              style: const TextStyle(
                fontSize: 36,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ),
        ).animate().fadeIn(duration: 400.ms).scale(delay: 100.ms),

        const SizedBox(height: AppSpacing.lg),

        // Name
        Text(
          name,
          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700),
        ).animate().fadeIn(delay: 200.ms),

        const SizedBox(height: AppSpacing.xs),

        // Badge
        if (isPremium)
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
          ).animate().fadeIn(delay: 300.ms)
        else
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(AppRadius.full),
              border: Border.all(color: Theme.of(context).dividerColor),
            ),
            child: const Text(
              'Ücretsiz Plan',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
            ),
          ).animate().fadeIn(delay: 300.ms),

        const SizedBox(height: AppSpacing.sm),

        // Email
        Text(
          email,
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
            value: '-',
            label: 'Tahmin',
            color: AppColors.primaryPurple,
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: _buildStatItem(
            context,
            value: '-',
            label: 'Başarı',
            color: AppColors.winGreen,
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: _buildStatItem(
            context,
            value: '-',
            label: 'Kazanılan',
            color: AppColors.accentOrange,
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

  Widget _buildMenuSection(BuildContext context, WidgetRef ref) {
    final menuItems = [
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
    ];

    return Column(
      children: [
        GlassCard(
          padding: EdgeInsets.zero,
          child: Column(
            children: menuItems.asMap().entries.map((entry) {
              final index = entry.key;
              final item = entry.value;
              final isLast = index == menuItems.length - 1;

              return Column(
                children: [
                  ListTile(
                    leading: Icon(
                      item['icon'] as IconData,
                      color: AppColors.primaryPurple,
                    ),
                    title: Text(
                      item['title'] as String,
                      style: const TextStyle(fontWeight: FontWeight.w500),
                    ),
                    trailing: Icon(
                      Icons.chevron_right_rounded,
                      color: Theme.of(
                        context,
                      ).colorScheme.onSurface.withAlpha(77),
                    ),
                    onTap: () => context.push(item['route'] as String),
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
        ),
        const SizedBox(height: AppSpacing.lg),
        // Logout Button
        GlassCard(
          padding: EdgeInsets.zero,
          child: ListTile(
            leading: const Icon(Icons.logout_rounded, color: AppColors.loseRed),
            title: const Text(
              'Çıkış Yap',
              style: TextStyle(
                fontWeight: FontWeight.w500,
                color: AppColors.loseRed,
              ),
            ),
            onTap: () async {
              // Show confirmation dialog
              final confirm = await showDialog<bool>(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Çıkış Yap'),
                  content: const Text(
                    'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context, false),
                      child: const Text('İptal'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(context, true),
                      child: const Text(
                        'Çıkış Yap',
                        style: TextStyle(color: AppColors.loseRed),
                      ),
                    ),
                  ],
                ),
              );

              if (confirm == true) {
                await ref.read(authProvider.notifier).logout();
                if (context.mounted) {
                  context.go('/login');
                }
              }
            },
          ),
        ),
      ],
    ).animate().fadeIn(delay: 600.ms).slideY(begin: 0.1, end: 0);
  }
}

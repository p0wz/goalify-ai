import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../widgets/common/glass_card.dart';
import '../../widgets/common/gradient_button.dart';

/// Premium Screen
/// Shows subscription plans and features
class PremiumScreen extends StatefulWidget {
  const PremiumScreen({super.key});

  @override
  State<PremiumScreen> createState() => _PremiumScreenState();
}

class _PremiumScreenState extends State<PremiumScreen> {
  int _selectedPlan = 1; // 0: Monthly, 1: Yearly

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.gradientPremium),
        child: SafeArea(
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(
                        Icons.close_rounded,
                        color: Colors.white,
                      ),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                    const Spacer(),
                    TextButton(
                      onPressed: () {},
                      child: const Text(
                        'Geri Yükle',
                        style: TextStyle(color: Colors.white70),
                      ),
                    ),
                  ],
                ),
              ),

              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.xxl,
                  ),
                  child: Column(
                    children: [
                      // Crown Icon
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: Colors.white.withAlpha(51),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.workspace_premium_rounded,
                          size: 48,
                          color: Colors.white,
                        ),
                      ).animate().fadeIn(duration: 400.ms).scale(delay: 100.ms),

                      const SizedBox(height: AppSpacing.xl),

                      // Title
                      const Text(
                        'SENTIO PRO',
                        style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          letterSpacing: 2,
                        ),
                      ).animate().fadeIn(delay: 200.ms),

                      const SizedBox(height: AppSpacing.sm),

                      Text(
                        'Profesyonel tahmin araçlarına eriş',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.white.withAlpha(179),
                        ),
                      ).animate().fadeIn(delay: 300.ms),

                      const SizedBox(height: AppSpacing.xxxl),

                      // Features
                      _buildFeaturesList(),

                      const SizedBox(height: AppSpacing.xxxl),

                      // Plan Selector
                      _buildPlanSelector(),

                      const SizedBox(height: AppSpacing.xxl),

                      // CTA Button
                      GradientButton(
                        text: 'Premium\'a Geç',
                        onPressed: () {
                          // Handle subscription
                        },
                        gradient: GradientType.accent,
                        icon: Icons.bolt_rounded,
                      ).animate().fadeIn(delay: 700.ms),

                      const SizedBox(height: AppSpacing.lg),

                      // Terms
                      Text(
                        '3 günlük ücretsiz deneme • İstediğin zaman iptal et',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.white.withAlpha(128),
                        ),
                        textAlign: TextAlign.center,
                      ),

                      const SizedBox(height: AppSpacing.xxl),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFeaturesList() {
    final features = [
      {
        'icon': Icons.all_inclusive_rounded,
        'title': 'Sınırsız Tahmin',
        'desc': 'Tüm maçlara AI tahmini',
      },
      {
        'icon': Icons.bolt_rounded,
        'title': 'Canlı Analiz',
        'desc': 'Maç sırasında anlık tahminler',
      },
      {
        'icon': Icons.bar_chart_rounded,
        'title': 'Detaylı İstatistik',
        'desc': 'Gelişmiş veri analizi',
      },
      {
        'icon': Icons.notifications_active_rounded,
        'title': 'Öncelikli Bildirim',
        'desc': 'Fırsat anında haber al',
      },
      {
        'icon': Icons.support_agent_rounded,
        'title': 'VIP Destek',
        'desc': '7/24 öncelikli destek',
      },
    ];

    return Column(
      children: features.asMap().entries.map((entry) {
        final index = entry.key;
        final feature = entry.value;

        return Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.lg),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white.withAlpha(38),
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                    child: Icon(
                      feature['icon'] as IconData,
                      color: Colors.white,
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.lg),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        feature['title'] as String,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        feature['desc'] as String,
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.white.withAlpha(153),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            )
            .animate()
            .fadeIn(
              delay: Duration(milliseconds: 400 + (index * 100)),
              duration: 300.ms,
            )
            .slideX(begin: -0.1, end: 0);
      }).toList(),
    );
  }

  Widget _buildPlanSelector() {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.white.withAlpha(38),
        borderRadius: BorderRadius.circular(AppRadius.lg),
      ),
      child: Row(
        children: [
          _buildPlanOption(
            index: 0,
            title: 'Aylık',
            price: '₺99',
            period: '/ay',
            isPopular: false,
          ),
          _buildPlanOption(
            index: 1,
            title: 'Yıllık',
            price: '₺599',
            period: '/yıl',
            isPopular: true,
            discount: '%50',
          ),
        ],
      ),
    ).animate().fadeIn(delay: 600.ms);
  }

  Widget _buildPlanOption({
    required int index,
    required String title,
    required String price,
    required String period,
    required bool isPopular,
    String? discount,
  }) {
    final isSelected = _selectedPlan == index;

    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedPlan = index),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
          decoration: BoxDecoration(
            color: isSelected ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(AppRadius.md),
          ),
          child: Column(
            children: [
              if (isPopular && discount != null)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 2,
                  ),
                  margin: const EdgeInsets.only(bottom: 8),
                  decoration: BoxDecoration(
                    gradient: AppColors.gradientAccent,
                    borderRadius: BorderRadius.circular(AppRadius.full),
                  ),
                  child: Text(
                    discount,
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
              Text(
                title,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: isSelected ? AppColors.primaryPurple : Colors.white,
                ),
              ),
              const SizedBox(height: 4),
              RichText(
                text: TextSpan(
                  children: [
                    TextSpan(
                      text: price,
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        color: isSelected
                            ? AppColors.primaryPurple
                            : Colors.white,
                      ),
                    ),
                    TextSpan(
                      text: period,
                      style: TextStyle(
                        fontSize: 12,
                        color: isSelected
                            ? AppColors.primaryPurple.withAlpha(179)
                            : Colors.white70,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

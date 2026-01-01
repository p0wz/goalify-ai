import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';

/// Premium Screen - Clean design
class PremiumScreen extends StatefulWidget {
  const PremiumScreen({super.key});

  @override
  State<PremiumScreen> createState() => _PremiumScreenState();
}

class _PremiumScreenState extends State<PremiumScreen> {
  int _selectedPlan = 1;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Premium'),
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.xxl),
          child: Column(
            children: [
              // Icon
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppColors.primary.withAlpha(25),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.workspace_premium_rounded,
                  size: 40,
                  color: AppColors.primary,
                ),
              ).animate().fadeIn().scale(),

              const SizedBox(height: AppSpacing.xl),

              // Title
              const Text(
                'SENTIO PRO',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 2,
                ),
              ).animate().fadeIn(delay: 100.ms),

              const SizedBox(height: AppSpacing.sm),

              Text(
                'Profesyonel tahmin araçlarına eriş',
                style: TextStyle(fontSize: 15, color: AppColors.textSecondary),
              ).animate().fadeIn(delay: 200.ms),

              const SizedBox(height: AppSpacing.xxxl),

              // Features
              _buildFeatures(),

              const SizedBox(height: AppSpacing.xxxl),

              // Plans
              _buildPlans(),

              const SizedBox(height: AppSpacing.xxl),

              // CTA
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.bolt_rounded),
                  label: const Text("Premium'a Geç"),
                ),
              ).animate().fadeIn(delay: 600.ms),

              const SizedBox(height: AppSpacing.md),

              Text(
                '3 günlük ücretsiz deneme • İstediğin zaman iptal et',
                style: TextStyle(fontSize: 12, color: AppColors.textMuted),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFeatures() {
    final features = [
      {'icon': Icons.all_inclusive_rounded, 'title': 'Sınırsız Tahmin'},
      {'icon': Icons.bolt_rounded, 'title': 'Canlı Analiz'},
      {'icon': Icons.bar_chart_rounded, 'title': 'Detaylı İstatistik'},
      {
        'icon': Icons.notifications_active_rounded,
        'title': 'Öncelikli Bildirim',
      },
    ];

    return Column(
      children: features.asMap().entries.map((e) {
        final f = e.value;
        return Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.md),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppColors.primary.withAlpha(25),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  f['icon'] as IconData,
                  color: AppColors.primary,
                  size: 20,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Text(
                f['title'] as String,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const Spacer(),
              const Icon(
                Icons.check_rounded,
                color: AppColors.success,
                size: 20,
              ),
            ],
          ),
        ).animate().fadeIn(delay: Duration(milliseconds: 300 + e.key * 80));
      }).toList(),
    );
  }

  Widget _buildPlans() {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          _buildPlan(0, 'Aylık', '₺99', '/ay'),
          _buildPlan(1, 'Yıllık', '₺599', '/yıl', discount: '%50'),
        ],
      ),
    ).animate().fadeIn(delay: 500.ms);
  }

  Widget _buildPlan(
    int index,
    String title,
    String price,
    String period, {
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
            color: isSelected ? AppColors.primary : Colors.transparent,
            borderRadius: BorderRadius.circular(AppRadius.md),
          ),
          child: Column(
            children: [
              if (discount != null)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 2,
                  ),
                  margin: const EdgeInsets.only(bottom: 6),
                  decoration: BoxDecoration(
                    color: AppColors.warning,
                    borderRadius: BorderRadius.circular(10),
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
                  fontWeight: FontWeight.w600,
                  color: isSelected ? Colors.white : AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 4),
              RichText(
                text: TextSpan(
                  children: [
                    TextSpan(
                      text: price,
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: isSelected
                            ? Colors.white
                            : AppColors.textPrimary,
                      ),
                    ),
                    TextSpan(
                      text: period,
                      style: TextStyle(
                        fontSize: 12,
                        color: isSelected
                            ? Colors.white70
                            : AppColors.textMuted,
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

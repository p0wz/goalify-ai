import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:purchases_flutter/purchases_flutter.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../data/services/revenuecat_service.dart';
import '../../widgets/common/clean_card.dart';

/// Premium Screen - RevenueCat Paywall
class PremiumScreen extends ConsumerStatefulWidget {
  const PremiumScreen({super.key});

  @override
  ConsumerState<PremiumScreen> createState() => _PremiumScreenState();
}

class _PremiumScreenState extends ConsumerState<PremiumScreen> {
  bool _isLoading = true;
  bool _isPurchasing = false;
  Offerings? _offerings;
  Package? _selectedPackage;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadOfferings();
  }

  Future<void> _loadOfferings() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final offerings = await RevenueCatService().getOfferings();
      setState(() {
        _offerings = offerings;
        // Select default package (monthly or first available)
        if (offerings?.current?.monthly != null) {
          _selectedPackage = offerings!.current!.monthly;
        } else if (offerings?.current?.availablePackages.isNotEmpty ?? false) {
          _selectedPackage = offerings!.current!.availablePackages.first;
        }
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Paketler yüklenemedi';
        _isLoading = false;
      });
    }
  }

  Future<void> _purchasePackage() async {
    if (_selectedPackage == null) return;

    setState(() => _isPurchasing = true);

    final result = await RevenueCatService().purchasePackage(_selectedPackage!);

    setState(() => _isPurchasing = false);

    if (!mounted) return;

    switch (result) {
      case PurchaseResult.success:
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('🎉 Pro abonelik aktif!'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, true); // Return success
        break;
      case PurchaseResult.cancelled:
        // User cancelled - do nothing
        break;
      case PurchaseResult.failed:
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Satın alma başarısız'),
            backgroundColor: Colors.red,
          ),
        );
        break;
    }
  }

  Future<void> _restorePurchases() async {
    setState(() => _isPurchasing = true);

    final restored = await RevenueCatService().restorePurchases();

    setState(() => _isPurchasing = false);

    if (!mounted) return;

    if (restored) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✅ Satın almalar geri yüklendi'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.pop(context, true);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Geri yüklenecek satın alma bulunamadı'),
          backgroundColor: Colors.orange,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('PRO'),
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          TextButton(
            onPressed: _isPurchasing ? null : _restorePurchases,
            child: const Text('Geri Yükle'),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
          ? _buildError()
          : _buildContent(isDark),
    );
  }

  Widget _buildError() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 64, color: AppColors.error),
          const SizedBox(height: AppSpacing.md),
          Text(_errorMessage ?? 'Bir hata oluştu'),
          const SizedBox(height: AppSpacing.md),
          ElevatedButton(
            onPressed: _loadOfferings,
            child: const Text('Tekrar Dene'),
          ),
        ],
      ),
    );
  }

  Widget _buildContent(bool isDark) {
    final packages = _offerings?.current?.availablePackages ?? [];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.warning,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.workspace_premium_rounded,
              size: 48,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          const Text(
            'SENTIO Pro',
            style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Daha fazla tahmin, daha yüksek kazanç',
            style: TextStyle(
              fontSize: 15,
              color: isDark
                  ? AppColors.textSecondaryDark
                  : AppColors.textSecondaryLight,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.xxxl),

          // Features
          _buildFeature(
            context,
            Icons.layers_rounded,
            'Sınırsız Tahmin',
            'Tüm maç tahminlerine erişim',
          ),
          _buildFeature(
            context,
            Icons.bar_chart_rounded,
            'Detaylı İstatistik',
            'Gelişmiş analizler',
          ),
          _buildFeature(
            context,
            Icons.notifications_rounded,
            'Anlık Bildirimler',
            'Önemli maçlarda uyarı',
          ),
          _buildFeature(
            context,
            Icons.support_agent_rounded,
            'Öncelikli Destek',
            '7/24 yardım',
          ),

          const SizedBox(height: AppSpacing.xxxl),

          // Package Selection
          if (packages.isNotEmpty) ...[
            ...packages.map((pkg) => _buildPackageCard(pkg, isDark)),
            const SizedBox(height: AppSpacing.xl),
          ],

          // CTA
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isPurchasing || _selectedPackage == null
                  ? null
                  : _purchasePackage,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.warning,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: _isPurchasing
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text(
                      'Pro\'ya Geç',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
            ),
          ),

          const SizedBox(height: AppSpacing.lg),

          // Terms
          Text(
            'Abonelik otomatik yenilenir. İstediğin zaman iptal edebilirsin.',
            style: TextStyle(
              fontSize: 11,
              color: isDark
                  ? AppColors.textMutedDark
                  : AppColors.textMutedLight,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildPackageCard(Package package, bool isDark) {
    final isSelected = _selectedPackage?.identifier == package.identifier;
    final price = package.storeProduct.priceString;
    final period = _getPeriodText(package.packageType);
    final isAnnual = package.packageType == PackageType.annual;

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: GestureDetector(
        onTap: () => setState(() => _selectedPackage = package),
        child: Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: isSelected
                ? AppColors.warning.withAlpha(25)
                : (isDark ? AppColors.surfaceDark : AppColors.surfaceLight),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? AppColors.warning : Colors.transparent,
              width: 2,
            ),
          ),
          child: Row(
            children: [
              // Radio
              Container(
                width: 20,
                height: 20,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: isSelected ? AppColors.warning : Colors.grey,
                    width: 2,
                  ),
                ),
                child: isSelected
                    ? Center(
                        child: Container(
                          width: 10,
                          height: 10,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppColors.warning,
                          ),
                        ),
                      )
                    : null,
              ),
              const SizedBox(width: AppSpacing.md),

              // Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          period,
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                        if (isAnnual) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.success,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              '%33 Tasarruf',
                              style: TextStyle(
                                fontSize: 10,
                                color: Colors.white,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    Text(
                      package.storeProduct.description,
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark
                            ? AppColors.textMutedDark
                            : AppColors.textMutedLight,
                      ),
                    ),
                  ],
                ),
              ),

              // Price
              Text(
                price,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: isSelected ? AppColors.warning : null,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _getPeriodText(PackageType type) {
    switch (type) {
      case PackageType.monthly:
        return 'Aylık';
      case PackageType.annual:
        return 'Yıllık';
      case PackageType.weekly:
        return 'Haftalık';
      case PackageType.lifetime:
        return 'Ömür Boyu';
      default:
        return 'Abonelik';
    }
  }

  Widget _buildFeature(
    BuildContext context,
    IconData icon,
    String title,
    String desc,
  ) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: CleanCard(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.warning.withAlpha(25),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: AppColors.warning, size: 20),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  Text(
                    desc,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark
                          ? AppColors.textMutedDark
                          : AppColors.textMutedLight,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/theme_provider.dart';
import '../../widgets/common/clean_card.dart';

/// Settings Screen with Theme Toggle
class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final strings = ref.watch(stringsProvider);
    final themeState = ref.watch(themeProvider);
    final currentLanguage = ref.watch(languageProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(strings.settings),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          // Theme Section
          _buildSectionTitle(context, 'Tema'),
          const SizedBox(height: AppSpacing.sm),
          CleanCard(
            padding: EdgeInsets.zero,
            child: Column(
              children: [
                _buildThemeOption(
                  context,
                  ref,
                  'Sistem',
                  'Cihaz ayarlarını takip et',
                  Icons.settings_system_daydream_outlined,
                  AppThemeMode.system,
                  themeState.mode,
                ),
                _divider(context),
                _buildThemeOption(
                  context,
                  ref,
                  'Açık',
                  'Beyaz tema',
                  Icons.light_mode_outlined,
                  AppThemeMode.light,
                  themeState.mode,
                ),
                _divider(context),
                _buildThemeOption(
                  context,
                  ref,
                  'Koyu',
                  'Siyah tema',
                  Icons.dark_mode_outlined,
                  AppThemeMode.dark,
                  themeState.mode,
                ),
              ],
            ),
          ),

          const SizedBox(height: AppSpacing.xxl),

          // Language Section
          _buildSectionTitle(context, 'Dil'),
          const SizedBox(height: AppSpacing.sm),
          CleanCard(
            padding: EdgeInsets.zero,
            child: Column(
              children: [
                _buildLanguageOption(
                  context,
                  ref,
                  'Türkçe',
                  '🇹🇷',
                  AppLanguage.turkish,
                  currentLanguage,
                ),
                _divider(context),
                _buildLanguageOption(
                  context,
                  ref,
                  'English',
                  '🇺🇸',
                  AppLanguage.english,
                  currentLanguage,
                ),
              ],
            ),
          ),

          const SizedBox(height: AppSpacing.xxl),

          // App Info
          _buildSectionTitle(context, 'Uygulama'),
          const SizedBox(height: AppSpacing.sm),
          CleanCard(
            padding: EdgeInsets.zero,
            child: Column(
              children: [
                ListTile(
                  leading: Icon(
                    Icons.info_outline_rounded,
                    color: AppColors.textSecondary(context),
                  ),
                  title: const Text('Versiyon'),
                  trailing: Text(
                    '1.0.0',
                    style: TextStyle(color: AppColors.textMuted(context)),
                  ),
                ),
                _divider(context),
                ListTile(
                  leading: Icon(
                    Icons.privacy_tip_outlined,
                    color: AppColors.textSecondary(context),
                  ),
                  title: const Text('Gizlilik Politikası'),
                  trailing: Icon(
                    Icons.chevron_right_rounded,
                    color: AppColors.textMuted(context),
                  ),
                  onTap: () {},
                ),
                _divider(context),
                ListTile(
                  leading: Icon(
                    Icons.description_outlined,
                    color: AppColors.textSecondary(context),
                  ),
                  title: const Text('Kullanım Koşulları'),
                  trailing: Icon(
                    Icons.chevron_right_rounded,
                    color: AppColors.textMuted(context),
                  ),
                  onTap: () {},
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Text(
      title,
      style: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: AppColors.textSecondary(context),
      ),
    );
  }

  Widget _buildThemeOption(
    BuildContext context,
    WidgetRef ref,
    String title,
    String subtitle,
    IconData icon,
    AppThemeMode mode,
    AppThemeMode currentMode,
  ) {
    final isSelected = mode == currentMode;

    return ListTile(
      onTap: () => ref.read(themeProvider.notifier).setTheme(mode),
      leading: Icon(
        icon,
        color: isSelected
            ? AppColors.primary
            : AppColors.textSecondary(context),
      ),
      title: Text(
        title,
        style: TextStyle(
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: TextStyle(fontSize: 12, color: AppColors.textMuted(context)),
      ),
      trailing: isSelected
          ? Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.check_rounded,
                color: Colors.white,
                size: 16,
              ),
            )
          : null,
    );
  }

  Widget _buildLanguageOption(
    BuildContext context,
    WidgetRef ref,
    String title,
    String flag,
    AppLanguage lang,
    AppLanguage currentLang,
  ) {
    final isSelected = lang == currentLang;

    return ListTile(
      onTap: () => ref.read(languageProvider.notifier).state = lang,
      leading: Text(flag, style: const TextStyle(fontSize: 24)),
      title: Text(
        title,
        style: TextStyle(
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
        ),
      ),
      trailing: isSelected
          ? Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.check_rounded,
                color: Colors.white,
                size: 16,
              ),
            )
          : null,
    );
  }

  Widget _divider(BuildContext context) =>
      Divider(height: 1, indent: 60, color: AppColors.border(context));
}

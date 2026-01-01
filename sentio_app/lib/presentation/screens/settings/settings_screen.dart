import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/l10n/app_strings.dart';
import '../../widgets/common/app_card.dart';

/// Settings Screen
class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _notificationsEnabled = true;
  bool _soundEnabled = true;

  @override
  Widget build(BuildContext context) {
    final strings = ref.watch(stringsProvider);
    final currentLang = ref.watch(languageProvider);

    return Scaffold(
      appBar: AppBar(title: Text(strings.settings)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSection('Görünüm', [
              _buildLanguageSelector(context, strings, currentLang),
            ]),
            const SizedBox(height: AppSpacing.xxl),
            _buildSection('Bildirimler', [
              _buildSwitch(
                icon: Icons.notifications_outlined,
                title: 'Bildirimleri Aç',
                subtitle: 'Push bildirimleri al',
                value: _notificationsEnabled,
                onChanged: (v) => setState(() => _notificationsEnabled = v),
              ),
              _buildSwitch(
                icon: Icons.volume_up_outlined,
                title: 'Ses',
                subtitle: 'Bildirim sesleri',
                value: _soundEnabled,
                onChanged: (v) => setState(() => _soundEnabled = v),
              ),
            ]),
            const SizedBox(height: AppSpacing.xxl),
            _buildSection('Hakkında', [
              _buildInfoTile(
                context,
                Icons.info_outline_rounded,
                'Sürüm',
                '1.0.0',
              ),
              _buildInfoTile(
                context,
                Icons.description_outlined,
                'Gizlilik Politikası',
                null,
                onTap: () {},
              ),
              _buildInfoTile(
                context,
                Icons.article_outlined,
                'Kullanım Koşulları',
                null,
                onTap: () {},
              ),
            ]),
            const SizedBox(height: AppSpacing.xxl),
            _buildDanger(context, strings),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.textMuted,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        AppCard(
          padding: EdgeInsets.zero,
          child: Column(children: children),
        ),
      ],
    ).animate().fadeIn();
  }

  Widget _buildLanguageSelector(
    BuildContext context,
    AppStrings strings,
    AppLanguage currentLang,
  ) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.primary.withAlpha(25),
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Icon(
          Icons.language_rounded,
          color: AppColors.primary,
          size: 20,
        ),
      ),
      title: const Text('Dil'),
      subtitle: Text(currentLang == AppLanguage.turkish ? 'Türkçe' : 'English'),
      trailing: const Icon(
        Icons.chevron_right_rounded,
        color: AppColors.textMuted,
      ),
      onTap: () => _showLanguageDialog(context),
    );
  }

  void _showLanguageDialog(BuildContext context) {
    final currentLang = ref.read(languageProvider);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Dil Seç'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('Türkçe'),
              leading: Radio<AppLanguage>(
                value: AppLanguage.turkish,
                groupValue: currentLang,
                onChanged: (v) {
                  ref.read(languageProvider.notifier).state =
                      AppLanguage.turkish;
                  Navigator.pop(ctx);
                },
              ),
            ),
            ListTile(
              title: const Text('English'),
              leading: Radio<AppLanguage>(
                value: AppLanguage.english,
                groupValue: currentLang,
                onChanged: (v) {
                  ref.read(languageProvider.notifier).state =
                      AppLanguage.english;
                  Navigator.pop(ctx);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSwitch({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.primary.withAlpha(25),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, color: AppColors.primary, size: 20),
      ),
      title: Text(title),
      subtitle: Text(
        subtitle,
        style: TextStyle(fontSize: 12, color: AppColors.textMuted),
      ),
      trailing: Switch(
        value: value,
        onChanged: onChanged,
        activeColor: AppColors.primary,
      ),
    );
  }

  Widget _buildInfoTile(
    BuildContext context,
    IconData icon,
    String title,
    String? value, {
    VoidCallback? onTap,
  }) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.primary.withAlpha(25),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, color: AppColors.primary, size: 20),
      ),
      title: Text(title),
      trailing: value != null
          ? Text(value, style: TextStyle(color: AppColors.textMuted))
          : const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
      onTap: onTap,
    );
  }

  Widget _buildDanger(BuildContext context, AppStrings strings) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Tehlikeli Bölge',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.danger,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        AppCard(
          variant: AppCardVariant.danger,
          padding: EdgeInsets.zero,
          child: Column(
            children: [
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.danger.withAlpha(25),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.delete_outline_rounded,
                    color: AppColors.danger,
                    size: 20,
                  ),
                ),
                title: const Text(
                  'Hesabı Sil',
                  style: TextStyle(color: AppColors.danger),
                ),
                trailing: const Icon(
                  Icons.chevron_right_rounded,
                  color: AppColors.danger,
                ),
                onTap: () => _showDeleteConfirm(context, strings),
              ),
            ],
          ),
        ),
      ],
    ).animate().fadeIn();
  }

  void _showDeleteConfirm(BuildContext context, AppStrings strings) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hesabı Sil'),
        content: const Text(
          'Bu işlem geri alınamaz. Hesabınız ve tüm verileriniz silinecektir.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(strings.cancel),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Sil', style: TextStyle(color: AppColors.danger)),
          ),
        ],
      ),
    );
  }
}

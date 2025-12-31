import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../widgets/common/glass_card.dart';

/// Settings Screen
/// App settings including theme, notifications, language
class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _darkMode = true;
  bool _notifications = true;
  bool _liveUpdates = true;
  bool _soundEffects = false;
  String _language = 'Türkçe';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ayarlar')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Appearance Section
            _buildSectionHeader('Görünüm'),
            const SizedBox(height: AppSpacing.md),
            _buildAppearanceSection(context),

            const SizedBox(height: AppSpacing.xxl),

            // Notifications Section
            _buildSectionHeader('Bildirimler'),
            const SizedBox(height: AppSpacing.md),
            _buildNotificationsSection(context),

            const SizedBox(height: AppSpacing.xxl),

            // Language Section
            _buildSectionHeader('Dil'),
            const SizedBox(height: AppSpacing.md),
            _buildLanguageSection(context),

            const SizedBox(height: AppSpacing.xxl),

            // About Section
            _buildSectionHeader('Uygulama'),
            const SizedBox(height: AppSpacing.md),
            _buildAboutSection(context),

            const SizedBox(height: AppSpacing.xxl),

            // Danger Zone
            _buildDangerZone(context),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: AppColors.primaryPurple,
      ),
    ).animate().fadeIn(duration: 300.ms);
  }

  Widget _buildAppearanceSection(BuildContext context) {
    return GlassCard(
      padding: EdgeInsets.zero,
      child: Column(
        children: [
          _buildSwitchTile(
            icon: Icons.dark_mode_rounded,
            title: 'Karanlık Mod',
            subtitle: 'Karanlık tema kullan',
            value: _darkMode,
            onChanged: (value) {
              setState(() => _darkMode = value);
            },
          ),
          const Divider(height: 1, indent: 56),
          ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primaryPurple.withAlpha(25),
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
              child: const Icon(
                Icons.palette_rounded,
                color: AppColors.primaryPurple,
                size: 20,
              ),
            ),
            title: const Text('Tema Rengi'),
            subtitle: const Text('Mor'),
            trailing: Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                gradient: AppColors.gradientPrimary,
                shape: BoxShape.circle,
              ),
            ),
            onTap: () {
              // Show color picker
            },
          ),
        ],
      ),
    ).animate().fadeIn(delay: 100.ms);
  }

  Widget _buildNotificationsSection(BuildContext context) {
    return GlassCard(
      padding: EdgeInsets.zero,
      child: Column(
        children: [
          _buildSwitchTile(
            icon: Icons.notifications_rounded,
            title: 'Bildirimler',
            subtitle: 'Push bildirimleri al',
            value: _notifications,
            onChanged: (value) {
              setState(() => _notifications = value);
            },
          ),
          const Divider(height: 1, indent: 56),
          _buildSwitchTile(
            icon: Icons.bolt_rounded,
            title: 'Canlı Güncellemeler',
            subtitle: 'Maç skorlarını anında al',
            value: _liveUpdates,
            onChanged: (value) {
              setState(() => _liveUpdates = value);
            },
          ),
          const Divider(height: 1, indent: 56),
          _buildSwitchTile(
            icon: Icons.volume_up_rounded,
            title: 'Ses Efektleri',
            subtitle: 'Bildirim sesleri',
            value: _soundEffects,
            onChanged: (value) {
              setState(() => _soundEffects = value);
            },
          ),
        ],
      ),
    ).animate().fadeIn(delay: 200.ms);
  }

  Widget _buildLanguageSection(BuildContext context) {
    final languages = ['Türkçe', 'English', 'Deutsch', 'Français'];

    return GlassCard(
      padding: EdgeInsets.zero,
      child: Column(
        children: languages.map((lang) {
          final isSelected = lang == _language;
          return Column(
            children: [
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? AppColors.primaryPurple.withAlpha(25)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                  child: Icon(
                    Icons.language_rounded,
                    color: isSelected
                        ? AppColors.primaryPurple
                        : Theme.of(
                            context,
                          ).colorScheme.onSurface.withAlpha(128),
                    size: 20,
                  ),
                ),
                title: Text(
                  lang,
                  style: TextStyle(
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                    color: isSelected ? AppColors.primaryPurple : null,
                  ),
                ),
                trailing: isSelected
                    ? const Icon(
                        Icons.check_rounded,
                        color: AppColors.primaryPurple,
                      )
                    : null,
                onTap: () {
                  setState(() => _language = lang);
                },
              ),
              if (lang != languages.last) const Divider(height: 1, indent: 56),
            ],
          );
        }).toList(),
      ),
    ).animate().fadeIn(delay: 300.ms);
  }

  Widget _buildAboutSection(BuildContext context) {
    return GlassCard(
      padding: EdgeInsets.zero,
      child: Column(
        children: [
          ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primaryPurple.withAlpha(25),
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
              child: const Icon(
                Icons.info_outline_rounded,
                color: AppColors.primaryPurple,
                size: 20,
              ),
            ),
            title: const Text('Versiyon'),
            trailing: const Text(
              '1.0.0',
              style: TextStyle(color: AppColors.primaryPurple),
            ),
          ),
          const Divider(height: 1, indent: 56),
          ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primaryPurple.withAlpha(25),
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
              child: const Icon(
                Icons.description_outlined,
                color: AppColors.primaryPurple,
                size: 20,
              ),
            ),
            title: const Text('Kullanım Şartları'),
            trailing: const Icon(Icons.chevron_right_rounded),
            onTap: () {},
          ),
          const Divider(height: 1, indent: 56),
          ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primaryPurple.withAlpha(25),
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
              child: const Icon(
                Icons.privacy_tip_outlined,
                color: AppColors.primaryPurple,
                size: 20,
              ),
            ),
            title: const Text('Gizlilik Politikası'),
            trailing: const Icon(Icons.chevron_right_rounded),
            onTap: () {},
          ),
          const Divider(height: 1, indent: 56),
          ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primaryPurple.withAlpha(25),
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
              child: const Icon(
                Icons.star_outline_rounded,
                color: AppColors.primaryPurple,
                size: 20,
              ),
            ),
            title: const Text('Uygulamayı Değerlendir'),
            trailing: const Icon(Icons.chevron_right_rounded),
            onTap: () {},
          ),
        ],
      ),
    ).animate().fadeIn(delay: 400.ms);
  }

  Widget _buildDangerZone(BuildContext context) {
    return GlassCard(
      padding: EdgeInsets.zero,
      child: Column(
        children: [
          ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.loseRed.withAlpha(25),
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
              child: const Icon(
                Icons.delete_outline_rounded,
                color: AppColors.loseRed,
                size: 20,
              ),
            ),
            title: const Text(
              'Verileri Temizle',
              style: TextStyle(color: AppColors.loseRed),
            ),
            onTap: () => _showConfirmDialog(
              context,
              title: 'Verileri Temizle',
              message: 'Tüm yerel veriler silinecek. Emin misiniz?',
              onConfirm: () {},
            ),
          ),
          const Divider(height: 1, indent: 56),
          ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.loseRed.withAlpha(25),
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
              child: const Icon(
                Icons.logout_rounded,
                color: AppColors.loseRed,
                size: 20,
              ),
            ),
            title: const Text(
              'Çıkış Yap',
              style: TextStyle(color: AppColors.loseRed),
            ),
            onTap: () => _showConfirmDialog(
              context,
              title: 'Çıkış Yap',
              message: 'Hesabınızdan çıkış yapılacak. Emin misiniz?',
              onConfirm: () {},
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 500.ms);
  }

  Widget _buildSwitchTile({
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
          color: AppColors.primaryPurple.withAlpha(25),
          borderRadius: BorderRadius.circular(AppRadius.sm),
        ),
        child: Icon(icon, color: AppColors.primaryPurple, size: 20),
      ),
      title: Text(title),
      subtitle: Text(subtitle),
      trailing: Switch(
        value: value,
        onChanged: onChanged,
        activeColor: AppColors.primaryPurple,
      ),
    );
  }

  void _showConfirmDialog(
    BuildContext context, {
    required String title,
    required String message,
    required VoidCallback onConfirm,
  }) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('İptal'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              onConfirm();
            },
            child: Text('Onayla', style: TextStyle(color: AppColors.loseRed)),
          ),
        ],
      ),
    );
  }
}

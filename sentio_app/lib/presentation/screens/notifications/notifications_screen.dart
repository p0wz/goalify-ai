import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../widgets/common/glass_card.dart';

/// Notifications Screen
/// Shows notification history and settings
class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  // Mock notifications
  final List<NotificationItem> _notifications = [
    NotificationItem(
      id: '1',
      type: NotificationType.prediction,
      title: 'Tahmin Kazandı! 🎉',
      message: 'Galatasaray - Fenerbahçe maçındaki tahmininiz doğru çıktı.',
      time: DateTime.now().subtract(const Duration(minutes: 15)),
      isRead: false,
    ),
    NotificationItem(
      id: '2',
      type: NotificationType.live,
      title: 'Canlı Maç Güncellemesi',
      message: 'Barcelona 2 - 1 Real Madrid (45\')',
      time: DateTime.now().subtract(const Duration(hours: 1)),
      isRead: false,
    ),
    NotificationItem(
      id: '3',
      type: NotificationType.system,
      title: 'Yeni Özellik!',
      message:
          'Artık ligleri takip edebilir ve özel tahminlere ulaşabilirsiniz.',
      time: DateTime.now().subtract(const Duration(hours: 5)),
      isRead: true,
    ),
    NotificationItem(
      id: '4',
      type: NotificationType.prediction,
      title: 'Tahmin Kaybetti',
      message: 'Man City - Liverpool maçındaki tahmininiz tutmadı.',
      time: DateTime.now().subtract(const Duration(days: 1)),
      isRead: true,
    ),
    NotificationItem(
      id: '5',
      type: NotificationType.premium,
      title: 'Premium Fırsatı!',
      message: 'Yıllık abonelikte %50 indirim fırsatını kaçırmayın.',
      time: DateTime.now().subtract(const Duration(days: 2)),
      isRead: true,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final unreadCount = _notifications.where((n) => !n.isRead).length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Bildirimler'),
        actions: [
          if (unreadCount > 0)
            TextButton(
              onPressed: _markAllAsRead,
              child: const Text('Tümünü Okundu İşaretle'),
            ),
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () {
              // Navigate to notification settings
            },
          ),
        ],
      ),
      body: _notifications.isEmpty
          ? _buildEmptyState()
          : ListView.builder(
              padding: const EdgeInsets.all(AppSpacing.lg),
              itemCount: _notifications.length,
              itemBuilder: (context, index) {
                final notification = _notifications[index];
                return _buildNotificationCard(context, notification, index);
              },
            ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.notifications_off_outlined,
            size: 64,
            color: Theme.of(context).colorScheme.onSurface.withAlpha(77),
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            'Bildirim yok',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Theme.of(context).colorScheme.onSurface.withAlpha(128),
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Yeni bildirimler burada görünecek',
            style: TextStyle(
              color: Theme.of(context).colorScheme.onSurface.withAlpha(102),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationCard(
    BuildContext context,
    NotificationItem notification,
    int index,
  ) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Dismissible(
      key: Key(notification.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: AppSpacing.xl),
        decoration: BoxDecoration(
          color: AppColors.loseRed.withAlpha(51),
          borderRadius: BorderRadius.circular(AppRadius.lg),
        ),
        child: const Icon(
          Icons.delete_outline_rounded,
          color: AppColors.loseRed,
        ),
      ),
      onDismissed: (direction) {
        setState(() {
          _notifications.removeAt(index);
        });
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Bildirim silindi')));
      },
      child:
          Container(
            margin: const EdgeInsets.only(bottom: AppSpacing.md),
            child: GlassCard(
              variant: notification.isRead
                  ? GlassCardVariant.defaultVariant
                  : GlassCardVariant.premium,
              onTap: () {
                setState(() {
                  notification.isRead = true;
                });
                // Handle notification tap
              },
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Icon
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: notification.color.withAlpha(25),
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                    child: Icon(
                      notification.icon,
                      color: notification.color,
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.lg),

                  // Content
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                notification.title,
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: notification.isRead
                                      ? FontWeight.w500
                                      : FontWeight.w600,
                                ),
                              ),
                            ),
                            if (!notification.isRead)
                              Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                  color: AppColors.primaryPurple,
                                  shape: BoxShape.circle,
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          notification.message,
                          style: TextStyle(
                            fontSize: 13,
                            color: isDark
                                ? AppColors.darkMutedForeground
                                : AppColors.lightMutedForeground,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          notification.timeAgo,
                          style: TextStyle(
                            fontSize: 11,
                            color: isDark
                                ? AppColors.darkMutedForeground
                                : AppColors.lightMutedForeground,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ).animate().fadeIn(
            delay: Duration(milliseconds: index * 50),
            duration: 300.ms,
          ),
    );
  }

  void _markAllAsRead() {
    setState(() {
      for (var notification in _notifications) {
        notification.isRead = true;
      }
    });
  }
}

/// Notification Type
enum NotificationType { prediction, live, system, premium }

/// Notification Item Model
class NotificationItem {
  final String id;
  final NotificationType type;
  final String title;
  final String message;
  final DateTime time;
  bool isRead;

  NotificationItem({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    required this.time,
    this.isRead = false,
  });

  IconData get icon {
    switch (type) {
      case NotificationType.prediction:
        return Icons.track_changes_rounded;
      case NotificationType.live:
        return Icons.bolt_rounded;
      case NotificationType.system:
        return Icons.info_outline_rounded;
      case NotificationType.premium:
        return Icons.workspace_premium_rounded;
    }
  }

  Color get color {
    switch (type) {
      case NotificationType.prediction:
        return AppColors.winGreen;
      case NotificationType.live:
        return AppColors.liveRed;
      case NotificationType.system:
        return AppColors.primaryPurple;
      case NotificationType.premium:
        return AppColors.accentOrange;
    }
  }

  String get timeAgo {
    final now = DateTime.now();
    final diff = now.difference(time);

    if (diff.inMinutes < 1) {
      return 'Şimdi';
    } else if (diff.inMinutes < 60) {
      return '${diff.inMinutes} dakika önce';
    } else if (diff.inHours < 24) {
      return '${diff.inHours} saat önce';
    } else if (diff.inDays < 7) {
      return '${diff.inDays} gün önce';
    } else {
      return '${(diff.inDays / 7).floor()} hafta önce';
    }
  }
}

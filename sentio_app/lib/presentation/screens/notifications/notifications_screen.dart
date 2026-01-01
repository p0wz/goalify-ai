import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../widgets/common/app_card.dart';

/// Notifications Screen
class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final List<NotificationItem> _notifications = [
    NotificationItem(
      id: '1',
      type: NotificationType.prediction,
      title: 'Tahmin Kazandı! 🎉',
      message: 'Galatasaray - Fenerbahçe tahmini doğru çıktı.',
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
      message: 'Artık ligleri takip edebilirsiniz.',
      time: DateTime.now().subtract(const Duration(hours: 5)),
      isRead: true,
    ),
    NotificationItem(
      id: '4',
      type: NotificationType.prediction,
      title: 'Tahmin Kaybetti',
      message: 'Man City - Liverpool tahmini tutmadı.',
      time: DateTime.now().subtract(const Duration(days: 1)),
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
              child: const Text('Tümünü Oku'),
            ),
        ],
      ),
      body: _notifications.isEmpty
          ? _buildEmptyState()
          : ListView.builder(
              padding: const EdgeInsets.all(AppSpacing.lg),
              itemCount: _notifications.length,
              itemBuilder: (context, index) =>
                  _buildCard(context, _notifications[index], index),
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
            size: 56,
            color: AppColors.textMuted,
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            'Bildirim yok',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCard(BuildContext context, NotificationItem n, int index) {
    return Dismissible(
      key: Key(n.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: AppSpacing.xl),
        decoration: BoxDecoration(
          color: AppColors.danger.withAlpha(25),
          borderRadius: BorderRadius.circular(AppRadius.lg),
        ),
        child: const Icon(
          Icons.delete_outline_rounded,
          color: AppColors.danger,
        ),
      ),
      onDismissed: (_) {
        setState(() => _notifications.removeAt(index));
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Bildirim silindi')));
      },
      child: Padding(
        padding: const EdgeInsets.only(bottom: AppSpacing.sm),
        child: AppCard(
          variant: n.isRead ? AppCardVariant.normal : AppCardVariant.primary,
          onTap: () => setState(() => n.isRead = true),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: n.color.withAlpha(25),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(n.icon, color: n.color, size: 20),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            n.title,
                            style: TextStyle(
                              fontWeight: n.isRead
                                  ? FontWeight.w500
                                  : FontWeight.w600,
                              fontSize: 14,
                            ),
                          ),
                        ),
                        if (!n.isRead)
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: AppColors.primary,
                              shape: BoxShape.circle,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      n.message,
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.textMuted,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      n.timeAgo,
                      style: TextStyle(
                        fontSize: 11,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ).animate().fadeIn(delay: Duration(milliseconds: index * 50)),
    );
  }

  void _markAllAsRead() {
    setState(() {
      for (var n in _notifications) {
        n.isRead = true;
      }
    });
  }
}

enum NotificationType { prediction, live, system, premium }

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
        return AppColors.success;
      case NotificationType.live:
        return AppColors.danger;
      case NotificationType.system:
        return AppColors.primary;
      case NotificationType.premium:
        return AppColors.warning;
    }
  }

  String get timeAgo {
    final diff = DateTime.now().difference(time);
    if (diff.inMinutes < 1) return 'Şimdi';
    if (diff.inMinutes < 60) return '${diff.inMinutes} dk önce';
    if (diff.inHours < 24) return '${diff.inHours} saat önce';
    return '${diff.inDays} gün önce';
  }
}

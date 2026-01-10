import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

class NotificationService {
    private pushToken: string | null = null;

    /**
     * Initialize notifications and request permissions
     */
    async initialize(): Promise<string | null> {
        if (!Device.isDevice) {
            console.log('[Notifications] Must use physical device for push notifications');
            return null;
        }

        try {
            // Get existing permissions
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            // Request permissions if not granted
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('[Notifications] Permission not granted');
                return null;
            }

            // Get push token
            const token = await this.getExpoPushToken();
            this.pushToken = token;

            // Android channel setup
            if (Platform.OS === 'android') {
                await this.setupAndroidChannel();
            }

            console.log('[Notifications] Initialized with token:', token);
            return token;
        } catch (error) {
            console.error('[Notifications] Init error:', error);
            return null;
        }
    }

    /**
     * Get Expo push token
     */
    private async getExpoPushToken(): Promise<string | null> {
        try {
            const projectId = Constants.expoConfig?.extra?.eas?.projectId;
            const token = await Notifications.getExpoPushTokenAsync({
                projectId,
            });
            return token.data;
        } catch (error) {
            console.error('[Notifications] Get token error:', error);
            return null;
        }
    }

    /**
     * Setup Android notification channel
     */
    private async setupAndroidChannel(): Promise<void> {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'SENTIO Notifications',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#7C3AED',
        });

        // Live signals channel (high priority)
        await Notifications.setNotificationChannelAsync('live_signals', {
            name: 'Canlı Sinyaller',
            description: 'Canlı maç sinyalleri',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 500, 200, 500],
            lightColor: '#EF4444',
            sound: 'default',
        });
    }

    /**
     * Get current push token
     */
    getPushToken(): string | null {
        return this.pushToken;
    }

    /**
     * Schedule local notification
     */
    async scheduleLocalNotification(
        title: string,
        body: string,
        data?: Record<string, any>,
        trigger?: Notifications.NotificationTriggerInput
    ): Promise<string> {
        return await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: true,
            },
            trigger: trigger || null, // null = immediate
        });
    }

    /**
     * Cancel scheduled notification
     */
    async cancelNotification(notificationId: string): Promise<void> {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    }

    /**
     * Cancel all scheduled notifications
     */
    async cancelAllNotifications(): Promise<void> {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }

    /**
     * Add listener for received notifications (foreground)
     */
    addNotificationReceivedListener(
        callback: (notification: Notifications.Notification) => void
    ): Notifications.Subscription {
        return Notifications.addNotificationReceivedListener(callback);
    }

    /**
     * Add listener for notification response (user tap)
     */
    addNotificationResponseListener(
        callback: (response: Notifications.NotificationResponse) => void
    ): Notifications.Subscription {
        return Notifications.addNotificationResponseReceivedListener(callback);
    }

    /**
     * Get last notification response (if app opened from notification)
     */
    async getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
        return await Notifications.getLastNotificationResponseAsync();
    }

    /**
     * Set badge count (iOS only)
     */
    async setBadgeCount(count: number): Promise<void> {
        await Notifications.setBadgeCountAsync(count);
    }

    /**
     * Get badge count
     */
    async getBadgeCount(): Promise<number> {
        return await Notifications.getBadgeCountAsync();
    }
}

export const notificationService = new NotificationService();
export default notificationService;

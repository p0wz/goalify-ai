import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemeProvider, useTheme } from './src/theme';
import { AppNavigator } from './src/navigation';
import { notificationService } from './src/services';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested',
]);

// Inner app with theme access and notification setup
const AppContent: React.FC = () => {
  const { isDark } = useTheme();

  useEffect(() => {
    // Initialize notifications
    const initNotifications = async () => {
      const token = await notificationService.initialize();
      if (token) {
        console.log('[App] Push token:', token);
        // TODO: Send token to backend for push notifications
      }
    };

    initNotifications();

    // Handle notification responses (when user taps notification)
    const responseListener = notificationService.addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      console.log('[App] Notification tapped:', data);
      // TODO: Navigate based on notification type
    });

    return () => {
      responseListener.remove();
    };
  }, []);

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <AppNavigator />
    </>
  );
};

// Main App Component
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

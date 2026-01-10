import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthStore } from '../stores';
import { MainTabs } from './MainTabs';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { SettingsScreen } from '../screens/modals/SettingsScreen';
import { NotificationsScreen } from '../screens/modals/NotificationsScreen';
import { PremiumScreen } from '../screens/modals/PremiumScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator: React.FC = () => {
    const { isAuthenticated, isInitialized, initialize } = useAuthStore();

    useEffect(() => {
        initialize();
    }, []);

    // Wait for auth initialization
    if (!isInitialized) {
        return null;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    // Auth Stack
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                ) : (
                    // Main App Stack
                    <>
                        <Stack.Screen name="MainTabs" component={MainTabs} />
                        <Stack.Screen
                            name="Settings"
                            component={SettingsScreen}
                            options={{ presentation: 'modal' }}
                        />
                        <Stack.Screen
                            name="Notifications"
                            component={NotificationsScreen}
                            options={{ presentation: 'modal' }}
                        />
                        <Stack.Screen
                            name="Premium"
                            component={PremiumScreen}
                            options={{ presentation: 'modal' }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Home, BarChart2, Radar, History, User } from 'lucide-react-native';

import { useTheme, Colors, Spacing } from '../theme';
import { DashboardScreen } from '../screens/main/DashboardScreen';
import { PreMatchScreen } from '../screens/main/PreMatchScreen';
import { LiveScreen } from '../screens/main/LiveScreen';
import { LiveHistoryScreen } from '../screens/main/LiveHistoryScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

export const MainTabs: React.FC = () => {
    const { colors, isDark } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: {
                    position: 'absolute',
                    height: Platform.OS === 'ios' ? 88 : 70,
                    paddingTop: Spacing.sm,
                    paddingBottom: Platform.OS === 'ios' ? 28 : Spacing.sm,
                    backgroundColor: isDark ? colors.background + 'F0' : colors.background + 'F5',
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                },
                // Use blur on iOS
                tabBarBackground: () =>
                    Platform.OS === 'ios' ? (
                        <BlurView
                            intensity={80}
                            tint={isDark ? 'dark' : 'light'}
                            style={StyleSheet.absoluteFill}
                        />
                    ) : null,
            }}
        >
            <Tab.Screen
                name="Home"
                component={DashboardScreen}
                options={{
                    tabBarLabel: 'Ana Sayfa',
                    tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="PreMatch"
                component={PreMatchScreen}
                options={{
                    tabBarLabel: 'Maç Önü',
                    tabBarIcon: ({ color, size }) => <BarChart2 size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Live"
                component={LiveScreen}
                options={{
                    tabBarLabel: 'Canlı',
                    tabBarIcon: ({ color, size }) => <Radar size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="LiveHistory"
                component={LiveHistoryScreen}
                options={{
                    tabBarLabel: 'Geçmiş',
                    tabBarIcon: ({ color, size }) => <History size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profil',
                    tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
                }}
            />
        </Tab.Navigator>
    );
};

export default MainTabs;

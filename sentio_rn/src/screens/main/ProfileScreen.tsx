import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import {
    User,
    Crown,
    Bell,
    Settings,
    HelpCircle,
    LogOut,
    ChevronRight,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import { useTheme, Colors, Spacing, FontSize, FontWeight, Radius } from '../../theme';
import { useAuthStore } from '../../stores';
import { CleanCard } from '../../components';

type NavigationProp = NativeStackNavigationProp<any>;

export const ProfileScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { colors } = useTheme();
    const { user, isAuthenticated, logout } = useAuthStore();

    const isPremium = user?.isPremium ?? false;
    const userName = user?.name || user?.email?.split('@')[0] || 'User';
    const userInitial = userName.charAt(0).toUpperCase();

    const handleLogout = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            'Çıkış Yap',
            'Hesabından çıkmak istediğine emin misin?',
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'Çıkış Yap',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    },
                },
            ]
        );
    };

    // Login Prompt
    if (!isAuthenticated) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loginPrompt}>
                    <MotiView
                        from={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', damping: 15 }}
                    >
                        <View style={[styles.avatarLarge, { backgroundColor: Colors.primary }]}>
                            <User size={48} color="#FFF" />
                        </View>
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 400, delay: 100 }}
                    >
                        <Text style={[styles.loginTitle, { color: colors.text }]}>Giriş Yap</Text>
                        <Text style={[styles.loginSubtitle, { color: colors.textSecondary }]}>
                            Profilini görmek ve özelliklerden faydalanmak için giriş yap
                        </Text>
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 400, delay: 200 }}
                        style={styles.loginButtons}
                    >
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.loginButtonText}>Giriş Yap</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={[styles.registerLink, { color: Colors.primary }]}>
                                Hesabın yok mu? Kayıt Ol
                            </Text>
                        </TouchableOpacity>
                    </MotiView>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTitle}>
                    <User size={22} color={Colors.primary} />
                    <Text style={[styles.headerText, { color: colors.text }]}>Profil</Text>
                </View>
                <TouchableOpacity
                    style={[styles.settingsButton, { backgroundColor: colors.surface }]}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <Settings size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* User Info */}
            <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 400 }}
                style={styles.userSection}
            >
                <View style={[styles.avatarRing, { borderColor: Colors.primary }]}>
                    <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
                        <Text style={styles.avatarText}>{userInitial}</Text>
                    </View>
                </View>

                <Text style={[styles.userName, { color: colors.text }]}>{userName}</Text>

                {/* Plan Badge */}
                <View
                    style={[
                        styles.planBadge,
                        {
                            backgroundColor: isPremium ? Colors.warning : colors.surface,
                            borderColor: isPremium ? Colors.warning : colors.border,
                        },
                    ]}
                >
                    {isPremium ? (
                        <Crown size={14} color="#FFF" />
                    ) : (
                        <User size={14} color={colors.textSecondary} />
                    )}
                    <Text
                        style={[
                            styles.planText,
                            { color: isPremium ? '#FFF' : colors.textSecondary },
                        ]}
                    >
                        {isPremium ? 'Pro Plan' : 'Ücretsiz Plan'}
                    </Text>
                </View>

                <Text style={[styles.userEmail, { color: colors.textMuted }]}>{user?.email}</Text>
            </MotiView>

            {/* Menu */}
            <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 400, delay: 100 }}
                style={styles.menuSection}
            >
                <CleanCard style={styles.menuCard} animated={false}>
                    <MenuItem
                        icon={Crown}
                        label="Premium"
                        color={Colors.warning}
                        onPress={() => navigation.navigate('Premium')}
                    />
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <MenuItem
                        icon={Bell}
                        label="Bildirimler"
                        color={Colors.primary}
                        onPress={() => navigation.navigate('Notifications')}
                    />
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <MenuItem
                        icon={Settings}
                        label="Ayarlar"
                        color={colors.textSecondary}
                        onPress={() => navigation.navigate('Settings')}
                    />
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <MenuItem
                        icon={HelpCircle}
                        label="Yardım"
                        color={Colors.success}
                        onPress={() => Alert.alert('Yardım', 'Destek: support@sentio.app')}
                    />
                </CleanCard>
            </MotiView>

            {/* Logout */}
            <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 400, delay: 200 }}
                style={styles.logoutSection}
            >
                <CleanCard variant="danger" onPress={handleLogout} animated={false}>
                    <View style={styles.logoutContent}>
                        <View style={[styles.logoutIcon, { backgroundColor: Colors.danger }]}>
                            <LogOut size={18} color="#FFF" />
                        </View>
                        <Text style={[styles.logoutText, { color: colors.text }]}>Çıkış Yap</Text>
                    </View>
                </CleanCard>
            </MotiView>
        </SafeAreaView>
    );
};

// Menu Item Component
const MenuItem: React.FC<{
    icon: any;
    label: string;
    color: string;
    onPress: () => void;
}> = ({ icon: Icon, label, color, onPress }) => {
    const { colors } = useTheme();

    return (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.menuIcon, { backgroundColor: color + '20' }]}>
                <Icon size={18} color={color} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
            <ChevronRight size={20} color={colors.textMuted} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    headerText: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.semibold,
    },
    settingsButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userSection: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
    },
    avatarRing: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: Colors.primary,
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: Spacing.lg,
    },
    planBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: 20,
        borderWidth: 1,
        marginTop: Spacing.md,
        gap: 6,
    },
    planText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
    },
    userEmail: {
        fontSize: FontSize.sm,
        marginTop: Spacing.sm,
    },
    menuSection: {
        paddingHorizontal: Spacing.lg,
    },
    menuCard: {
        padding: 0,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
    },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: Radius.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabel: {
        flex: 1,
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
        marginLeft: Spacing.md,
    },
    divider: {
        height: 1,
        marginLeft: 60,
    },
    logoutSection: {
        paddingHorizontal: Spacing.lg,
        marginTop: Spacing.lg,
    },
    logoutContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutIcon: {
        width: 36,
        height: 36,
        borderRadius: Radius.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
        marginLeft: Spacing.md,
    },
    // Login Prompt
    loginPrompt: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xxl,
    },
    avatarLarge: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginTitle: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: Spacing.xxl,
    },
    loginSubtitle: {
        fontSize: FontSize.md,
        textAlign: 'center',
        marginTop: Spacing.sm,
    },
    loginButtons: {
        width: '100%',
        marginTop: Spacing.xxxl,
    },
    loginButton: {
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.lg,
        borderRadius: Radius.md,
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#FFF',
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
    },
    registerLink: {
        fontSize: FontSize.sm,
        textAlign: 'center',
        marginTop: Spacing.lg,
    },
});

export default ProfileScreen;

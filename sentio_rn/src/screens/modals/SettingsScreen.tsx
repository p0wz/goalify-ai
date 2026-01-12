import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moon, Sun, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { useTheme, Colors, Spacing, FontSize, FontWeight, Radius } from '../../theme';
import { CleanCard } from '../../components';

export const SettingsScreen: React.FC = () => {
    const navigation = useNavigation();
    const { colors, isDark, mode, setMode } = useTheme();

    const toggleTheme = () => {
        setMode(isDark ? 'light' : 'dark');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: colors.surface }]}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerText, { color: colors.text }]}>Ayarlar</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Theme Toggle */}
            <View
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 400 }}
                style={styles.section}
            >
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Görünüm</Text>
                <CleanCard animated={false}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            {isDark ? (
                                <Moon size={20} color={Colors.primary} />
                            ) : (
                                <Sun size={20} color={Colors.warning} />
                            )}
                            <Text style={[styles.settingLabel, { color: colors.text }]}>Karanlık Mod</Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: colors.border, true: Colors.primary + '60' }}
                            thumbColor={isDark ? Colors.primary : colors.surface}
                        />
                    </View>
                </CleanCard>
            </View>

            {/* App Info */}
            <View
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 400, delay: 100 }}
                style={styles.section}
            >
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Uygulama</Text>
                <CleanCard animated={false}>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Versiyon</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>1.0.0</Text>
                    </View>
                </CleanCard>
            </View>
        </SafeAreaView>
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
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.semibold,
    },
    section: {
        paddingHorizontal: Spacing.lg,
        marginTop: Spacing.xl,
    },
    sectionTitle: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.semibold,
        textTransform: 'uppercase',
        marginBottom: Spacing.sm,
        marginLeft: Spacing.xs,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    settingLabel: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: FontSize.md,
    },
    infoValue: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
    },
});

export default SettingsScreen;

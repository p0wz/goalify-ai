import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Radar, RefreshCw, Lock, Crown } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme, Colors, Spacing, FontSize, FontWeight, Radius } from '../../theme';
import { useAuthStore, useLiveStore } from '../../stores';
import { SignalCard, CleanCard } from '../../components';
import { LiveSignal } from '../../types';

type NavigationProp = NativeStackNavigationProp<any>;

export const LiveScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { colors } = useTheme();
    const { user, isAuthenticated } = useAuthStore();
    const { signals, isLoading, error, fetchSignals, refresh } = useLiveStore();

    const isPremium = user?.isPremium ?? false;

    useEffect(() => {
        if (isAuthenticated && isPremium) {
            fetchSignals();
        }
    }, [isAuthenticated, isPremium]);

    // Premium Gate
    if (!isPremium) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTitle}>
                        <View style={[styles.headerIcon, { backgroundColor: Colors.danger + '20' }]}>
                            <Radar size={20} color={Colors.danger} />
                        </View>
                        <Text style={[styles.headerText, { color: colors.text }]}>Canlı Sinyaller</Text>
                    </View>
                </View>

                {/* Premium Lock */}
                <View style={styles.lockContainer}>
                    <View
                        from={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', damping: 15 }}
                    >
                        <View style={[styles.lockIcon, { backgroundColor: Colors.primary + '15' }]}>
                            <Lock size={64} color={Colors.primary} />
                        </View>
                    </View>

                    <View
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 400, delay: 100 }}
                    >
                        <Text style={[styles.lockTitle, { color: colors.text }]}>Sadece Pro Üyeler</Text>
                        <Text style={[styles.lockSubtitle, { color: colors.textSecondary }]}>
                            Canlı sinyallere erişmek ve anlık bildirimler almak için Pro plana geçin.
                        </Text>
                    </View>

                    <View
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 400, delay: 200 }}
                    >
                        <TouchableOpacity
                            style={styles.premiumButton}
                            onPress={() => navigation.navigate('Premium')}
                            activeOpacity={0.8}
                        >
                            <Crown size={20} color="#FFF" />
                            <Text style={styles.premiumButtonText}>Pro'ya Geç</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    // Render Signal Item
    const renderSignal = ({ item, index }: { item: LiveSignal; index: number }) => (
        <View style={styles.signalWrapper}>
            <SignalCard signal={item} delay={index * 50} />
        </View>
    );

    // Empty State
    const renderEmpty = () => {
        if (isLoading) return null;

        return (
            <View style={styles.emptyContainer}>
                <CleanCard>
                    <View style={styles.emptyContent}>
                        <Radar size={64} color={colors.textMuted} />
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>Aktif Sinyal Yok</Text>
                        <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                            Yeni sinyaller yakında gelecek
                        </Text>
                    </View>
                </CleanCard>
            </View>
        );
    };

    // Error State
    if (error) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
                <View style={styles.header}>
                    <View style={styles.headerTitle}>
                        <View style={[styles.headerIcon, { backgroundColor: Colors.danger + '20' }]}>
                            <Radar size={20} color={Colors.danger} />
                        </View>
                        <Text style={[styles.headerText, { color: colors.text }]}>Canlı Sinyaller</Text>
                    </View>
                </View>
                <View style={styles.errorContainer}>
                    <CleanCard>
                        <View style={styles.emptyContent}>
                            <Text style={[styles.emptyTitle, { color: Colors.danger }]}>Hata</Text>
                            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>{error}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={refresh}>
                                <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                            </TouchableOpacity>
                        </View>
                    </CleanCard>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTitle}>
                    <View style={[styles.headerIcon, { backgroundColor: Colors.danger + '20' }]}>
                        <Radar size={20} color={Colors.danger} />
                    </View>
                    <Text style={[styles.headerText, { color: colors.text }]}>Canlı Sinyaller</Text>
                </View>
                <TouchableOpacity
                    style={[styles.refreshButton, { backgroundColor: colors.surface }]}
                    onPress={refresh}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={Colors.primary} />
                    ) : (
                        <RefreshCw size={20} color={colors.textSecondary} />
                    )}
                </TouchableOpacity>
            </View>

            {/* Signal List */}
            <FlatList
                data={signals}
                keyExtractor={(item) => item.id}
                renderItem={renderSignal}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmpty}
                onRefresh={refresh}
                refreshing={isLoading}
            />
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
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    headerIcon: {
        width: 36,
        height: 36,
        borderRadius: Radius.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.semibold,
    },
    refreshButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 120,
    },
    signalWrapper: {
        marginBottom: Spacing.md,
    },
    lockContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xxl,
    },
    lockIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    lockTitle: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
    },
    lockSubtitle: {
        fontSize: FontSize.md,
        textAlign: 'center',
        marginTop: Spacing.md,
        lineHeight: 22,
    },
    premiumButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.xxl,
        paddingVertical: Spacing.lg,
        borderRadius: 30,
        marginTop: Spacing.xxxl,
        gap: Spacing.sm,
    },
    premiumButtonText: {
        color: '#FFF',
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
    },
    emptyContainer: {
        paddingTop: Spacing.xxl,
    },
    emptyContent: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
    },
    emptyTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.semibold,
        marginTop: Spacing.md,
    },
    emptySubtitle: {
        fontSize: FontSize.sm,
        marginTop: Spacing.xs,
    },
    errorContainer: {
        flex: 1,
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xxl,
    },
    retryButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: Radius.md,
        marginTop: Spacing.lg,
    },
    retryButtonText: {
        color: '#FFF',
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
    },
});

export default LiveScreen;

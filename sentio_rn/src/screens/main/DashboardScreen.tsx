import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import {
    Bell,
    Settings,
    TrendingUp,
    Layers,
    Tv,
    Crown,
    ChevronRight,
    History,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme, Colors, Spacing, FontSize, FontWeight, Radius } from '../../theme';
import { useAuthStore, useLiveHistoryStore } from '../../stores';
import { CleanCard, PremiumBanner, SignalCard } from '../../components';

type NavigationProp = NativeStackNavigationProp<any>;

export const DashboardScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { colors, isDark } = useTheme();
    const { user, isAuthenticated } = useAuthStore();
    const { signals, dailyWinRate, monthlyWinRate, isLoading, fetchHistory } = useLiveHistoryStore();

    const isPremium = user?.isPremium ?? false;

    useEffect(() => {
        if (isAuthenticated) {
            fetchHistory();
        }
    }, [isAuthenticated]);

    const handleRefresh = () => {
        fetchHistory();
    };

    const historyPreview = signals.slice(0, 5);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={Colors.primary} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <MotiView
                        from={{ opacity: 0, translateX: -10 }}
                        animate={{ opacity: 1, translateX: 0 }}
                        transition={{ type: 'timing', duration: 400 }}
                    >
                        <Text style={[styles.logo, { color: Colors.primary }]}>SENTIO</Text>
                    </MotiView>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={[styles.iconButton, { backgroundColor: colors.surface }]}
                            onPress={() => navigation.navigate('Notifications')}
                        >
                            <Bell size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.iconButton, { backgroundColor: colors.surface }]}
                            onPress={() => navigation.navigate('Settings')}
                        >
                            <Settings size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Premium Banner (if not premium) */}
                {!isPremium && (
                    <View style={styles.section}>
                        <PremiumBanner onPress={() => navigation.navigate('Premium')} />
                    </View>
                )}

                {/* Welcome */}
                <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 400, delay: 100 }}
                    style={styles.section}
                >
                    <View style={styles.welcomeRow}>
                        <Text style={[styles.welcomeText, { color: colors.text }]}>Hoş geldin</Text>
                        <Text style={styles.waveEmoji}>👋</Text>
                    </View>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Bugünün tahminlerini keşfet
                    </Text>
                </MotiView>

                {/* Win Rates */}
                <View style={styles.ratesRow}>
                    <CleanCard style={styles.rateCard} delay={150}>
                        <View style={styles.rateHeader}>
                            <TrendingUp size={14} color={Colors.primary} />
                            <Text style={[styles.rateLabel, { color: colors.textMuted }]}>Günlük Başarı</Text>
                        </View>
                        <Text style={[styles.rateValue, { color: Colors.primary }]}>%{dailyWinRate}</Text>
                    </CleanCard>

                    <CleanCard style={styles.rateCard} delay={200}>
                        <View style={styles.rateHeader}>
                            <TrendingUp size={14} color={Colors.success} />
                            <Text style={[styles.rateLabel, { color: colors.textMuted }]}>Aylık Başarı</Text>
                        </View>
                        <Text style={[styles.rateValue, { color: Colors.success }]}>%{monthlyWinRate}</Text>
                    </CleanCard>
                </View>

                {/* Hero Card */}
                <View style={styles.section}>
                    <CleanCard variant="primary" onPress={() => navigation.navigate('PreMatch')} delay={250}>
                        <View style={styles.heroContent}>
                            <View style={[styles.heroIcon, { backgroundColor: Colors.primary }]}>
                                <Layers size={24} color="#FFF" />
                            </View>
                            <View style={styles.heroText}>
                                <Text style={[styles.heroTitle, { color: colors.text }]}>Günün Tahminleri</Text>
                                <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                                    Bahisleri incele ve kazan
                                </Text>
                            </View>
                            <ChevronRight size={24} color={Colors.primary} />
                        </View>
                    </CleanCard>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <TrendingUp size={18} color={Colors.primary} />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Hızlı Erişim</Text>
                        </View>
                    </View>
                    <View style={styles.actionsRow}>
                        <CleanCard
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('Live')}
                            delay={300}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: Colors.danger }]}>
                                <Tv size={20} color="#FFF" />
                            </View>
                            <Text style={[styles.actionLabel, { color: colors.text }]}>Canlı Tahminler</Text>
                        </CleanCard>

                        <CleanCard
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('Premium')}
                            delay={350}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: Colors.warning }]}>
                                <Crown size={20} color="#FFF" />
                            </View>
                            <Text style={[styles.actionLabel, { color: colors.text }]}>Premium</Text>
                        </CleanCard>
                    </View>
                </View>

                {/* Live History Preview */}
                {historyPreview.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleRow}>
                                <History size={18} color={Colors.primary} />
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Canlı Geçmişi</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('LiveHistory')}>
                                <Text style={[styles.seeAllText, { color: Colors.primary }]}>Tümünü Gör</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
                            {historyPreview.map((signal, index) => (
                                <View key={signal.id} style={styles.miniCardWrapper}>
                                    <MiniResultCard
                                        home={signal.homeTeam}
                                        away={signal.awayTeam}
                                        score={signal.finalScore || '-'}
                                        isWin={signal.status === 'WON'}
                                        market={signal.market}
                                        delay={400 + index * 50}
                                    />
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Bottom Padding */}
                <View style={{ height: 120 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

// Mini Result Card Component
const MiniResultCard: React.FC<{
    home: string;
    away: string;
    score: string;
    isWin: boolean;
    market: string;
    delay: number;
}> = ({ home, away, score, isWin, market, delay }) => {
    const { colors } = useTheme();
    const statusColor = isWin ? Colors.success : Colors.danger;

    return (
        <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 300, delay }}
        >
            <View
                style={[
                    styles.miniCard,
                    {
                        backgroundColor: statusColor + '10',
                        borderColor: statusColor + '30',
                    },
                ]}
            >
                <View style={styles.miniCardHeader}>
                    <View style={[styles.statusPill, { backgroundColor: statusColor + '20' }]}>
                        <Text style={[styles.statusPillText, { color: statusColor }]}>
                            {isWin ? 'WON' : 'LOST'}
                        </Text>
                    </View>
                    <Text style={[styles.miniScore, { color: colors.text }]}>{score}</Text>
                </View>
                <Text style={[styles.miniTeams, { color: colors.text }]} numberOfLines={2}>
                    {home}{'\n'}{away}
                </Text>
                <Text style={[styles.miniMarket, { color: colors.textMuted }]} numberOfLines={1}>
                    {market}
                </Text>
            </View>
        </MotiView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
    logo: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: 2,
    },
    headerActions: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        marginTop: Spacing.lg,
    },
    welcomeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: '700',
    },
    waveEmoji: {
        fontSize: 28,
        marginLeft: Spacing.sm,
    },
    subtitle: {
        fontSize: FontSize.md,
        marginTop: 4,
    },
    ratesRow: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginTop: Spacing.lg,
    },
    rateCard: {
        flex: 1,
    },
    rateHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    rateLabel: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.semibold,
    },
    rateValue: {
        fontSize: 24,
        fontWeight: '800',
        marginTop: Spacing.sm,
    },
    heroContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    heroIcon: {
        width: 56,
        height: 56,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroText: {
        flex: 1,
        marginLeft: Spacing.lg,
    },
    heroTitle: {
        fontSize: FontSize.lg,
        fontWeight: '700',
    },
    heroSubtitle: {
        fontSize: FontSize.sm,
        marginTop: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.semibold,
    },
    seeAllText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    actionCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: Spacing.lg,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    actionLabel: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
    },
    horizontalList: {
        marginHorizontal: -Spacing.lg,
        paddingHorizontal: Spacing.lg,
    },
    miniCardWrapper: {
        marginRight: Spacing.md,
    },
    miniCard: {
        width: 160,
        padding: Spacing.md,
        borderRadius: Radius.lg,
        borderWidth: 1,
    },
    miniCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    statusPill: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusPillText: {
        fontSize: 10,
        fontWeight: '700',
    },
    miniScore: {
        fontSize: FontSize.md,
        fontWeight: '700',
    },
    miniTeams: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.semibold,
        lineHeight: 16,
    },
    miniMarket: {
        fontSize: 10,
        marginTop: 4,
    },
});

export default DashboardScreen;

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { BarChart2, ListFilter, Clock, TrendingUp } from 'lucide-react-native';

import { useTheme, Colors, Spacing, FontSize, FontWeight, Radius } from '../../theme';
import { CleanCard } from '../../components';
import { usePredictionsStore } from '../../stores/predictionsStore';
import { useLiveHistoryStore } from '../../stores';
import { Prediction, LiveSignal } from '../../types';

type TabType = 'predictions' | 'results';

export const PreMatchScreen: React.FC = () => {
    const { colors } = useTheme();
    const [activeTab, setActiveTab] = useState<TabType>('predictions');

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTitle}>
                    <BarChart2 size={22} color={Colors.primary} />
                    <Text style={[styles.headerText, { color: colors.text }]}>Maç Önü</Text>
                </View>
            </View>

            {/* Tab Bar */}
            <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'predictions' && { backgroundColor: Colors.primary + '20' },
                    ]}
                    onPress={() => setActiveTab('predictions')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            { color: activeTab === 'predictions' ? Colors.primary : colors.textSecondary },
                        ]}
                    >
                        Tahminler
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'results' && { backgroundColor: Colors.primary + '20' },
                    ]}
                    onPress={() => setActiveTab('results')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            { color: activeTab === 'results' ? Colors.primary : colors.textSecondary },
                        ]}
                    >
                        Sonuçlar
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {activeTab === 'predictions' ? <PredictionsTab /> : <ResultsTab />}
        </SafeAreaView>
    );
};

// ============ PREDICTIONS TAB ============
const PredictionsTab: React.FC = () => {
    const { colors } = useTheme();
    const { predictions, isLoading, fetchPredictions } = usePredictionsStore();

    useEffect(() => {
        fetchPredictions();
    }, []);

    const renderPrediction = ({ item, index }: { item: Prediction; index: number }) => (
        <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300, delay: index * 50 }}
            style={styles.cardWrapper}
        >
            <CleanCard animated={false}>
                <View style={styles.predictionHeader}>
                    <View style={styles.teamsContainer}>
                        <Text style={[styles.teams, { color: colors.text }]} numberOfLines={1}>
                            {item.homeTeam} vs {item.awayTeam}
                        </Text>
                        <Text style={[styles.league, { color: colors.textMuted }]}>{item.league}</Text>
                    </View>
                    {item.odds && (
                        <View style={[styles.oddsBadge, { backgroundColor: Colors.success + '20' }]}>
                            <Text style={[styles.oddsText, { color: Colors.success }]}>{item.odds}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.marketRow}>
                    <View style={styles.marketChip}>
                        <Text style={styles.marketText}>{item.market}</Text>
                    </View>
                    {item.matchTime && (
                        <View style={styles.timeChip}>
                            <Clock size={12} color={colors.textMuted} />
                            <Text style={[styles.timeText, { color: colors.textMuted }]}>
                                {new Date(item.matchTime * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    )}
                </View>
            </CleanCard>
        </MotiView>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <CleanCard>
                <View style={styles.emptyContent}>
                    <ListFilter size={48} color={colors.textMuted} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>Tahmin Yok</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                        Yeni tahminler yakında eklenecek
                    </Text>
                </View>
            </CleanCard>
        </View>
    );

    return (
        <FlatList
            data={predictions}
            keyExtractor={(item) => item.id}
            renderItem={renderPrediction}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
            refreshControl={
                <RefreshControl
                    refreshing={isLoading}
                    onRefresh={fetchPredictions}
                    tintColor={Colors.primary}
                />
            }
        />
    );
};

// ============ RESULTS TAB ============
const ResultsTab: React.FC = () => {
    const { colors } = useTheme();
    const { signals, isLoading, fetchHistory } = useLiveHistoryStore();

    useEffect(() => {
        fetchHistory();
    }, []);

    // Group by status
    const settledSignals = signals.filter((s) => s.status !== 'PENDING');

    const renderResult = ({ item, index }: { item: LiveSignal; index: number }) => {
        const isWon = item.status === 'WON';
        const statusColor = isWon ? Colors.success : Colors.danger;

        return (
            <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 300, delay: index * 50 }}
                style={styles.cardWrapper}
            >
                <CleanCard variant={isWon ? 'success' : 'danger'} animated={false}>
                    <View style={styles.resultHeader}>
                        <View style={styles.teamsContainer}>
                            <Text style={[styles.teams, { color: colors.text }]} numberOfLines={1}>
                                {item.homeTeam} vs {item.awayTeam}
                            </Text>
                            <Text style={[styles.league, { color: colors.textMuted }]}>{item.league}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                            <Text style={[styles.statusText, { color: statusColor }]}>
                                {isWon ? 'WON' : 'LOST'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.resultDetails}>
                        <View style={styles.marketChip}>
                            <Text style={styles.marketText}>{item.market}</Text>
                        </View>
                        {item.finalScore && (
                            <Text style={[styles.finalScore, { color: colors.text }]}>
                                Skor: {item.finalScore}
                            </Text>
                        )}
                    </View>
                </CleanCard>
            </MotiView>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <CleanCard>
                <View style={styles.emptyContent}>
                    <TrendingUp size={48} color={colors.textMuted} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>Sonuç Yok</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                        Henüz değerlendirilen tahmin yok
                    </Text>
                </View>
            </CleanCard>
        </View>
    );

    return (
        <FlatList
            data={settledSignals}
            keyExtractor={(item) => item.id}
            renderItem={renderResult}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
            refreshControl={
                <RefreshControl
                    refreshing={isLoading}
                    onRefresh={fetchHistory}
                    tintColor={Colors.primary}
                />
            }
        />
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
    tabBar: {
        flexDirection: 'row',
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
        borderRadius: Radius.md,
        borderWidth: 1,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.sm,
        alignItems: 'center',
    },
    tabText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 120,
    },
    cardWrapper: {
        marginBottom: Spacing.md,
    },
    predictionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    teamsContainer: {
        flex: 1,
        marginRight: Spacing.sm,
    },
    teams: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
    },
    league: {
        fontSize: FontSize.xs,
        marginTop: 2,
    },
    oddsBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: Radius.sm,
    },
    oddsText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
    },
    marketRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.md,
        gap: Spacing.sm,
    },
    marketChip: {
        backgroundColor: Colors.primary + '15',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.sm,
        borderWidth: 1,
        borderColor: Colors.primary + '30',
    },
    marketText: {
        color: Colors.primary,
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
    },
    timeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        fontSize: FontSize.xs,
    },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: Radius.sm,
    },
    statusText: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
    },
    resultDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    finalScore: {
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
});

export default PreMatchScreen;

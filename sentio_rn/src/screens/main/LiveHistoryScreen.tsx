import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { History, RefreshCw } from 'lucide-react-native';

import { useTheme, Colors, Spacing, FontSize, FontWeight, Radius } from '../../theme';
import { useAuthStore, useLiveHistoryStore } from '../../stores';
import { SignalCard, CleanCard } from '../../components';
import { LiveSignal } from '../../types';

export const LiveHistoryScreen: React.FC = () => {
    const { colors } = useTheme();
    const { isAuthenticated } = useAuthStore();
    const { signals, dailyWinRate, monthlyWinRate, isLoading, fetchHistory, refresh } = useLiveHistoryStore();

    useEffect(() => {
        if (isAuthenticated) {
            fetchHistory();
        }
    }, [isAuthenticated]);

    const renderSignal = ({ item, index }: { item: LiveSignal; index: number }) => (
        <View style={styles.signalWrapper}>
            <SignalCard signal={item} delay={index * 30} />
        </View>
    );

    const renderEmpty = () => {
        if (isLoading) return null;
        return (
            <View style={styles.emptyContainer}>
                <CleanCard>
                    <View style={styles.emptyContent}>
                        <History size={64} color={colors.textMuted} />
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>Geçmiş Yok</Text>
                    </View>
                </CleanCard>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerText, { color: colors.text }]}>Canlı Geçmiş</Text>
                <TouchableOpacity
                    style={[styles.refreshButton, { backgroundColor: colors.surface }]}
                    onPress={refresh}
                    disabled={isLoading}
                >
                    <RefreshCw size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={[styles.statChip, { backgroundColor: Colors.primary + '15', borderColor: Colors.primary + '30' }]}>
                    <Text style={[styles.statText, { color: Colors.primary }]}>Günlük: %{dailyWinRate}</Text>
                </View>
                <View style={[styles.statChip, { backgroundColor: Colors.success + '15', borderColor: Colors.success + '30' }]}>
                    <Text style={[styles.statText, { color: Colors.success }]}>Aylık: %{monthlyWinRate}</Text>
                </View>
            </View>

            {/* History List */}
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
    headerText: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.semibold,
    },
    refreshButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    statChip: {
        flex: 1,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.md,
        borderWidth: 1,
        alignItems: 'center',
    },
    statText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 120,
    },
    signalWrapper: {
        marginBottom: Spacing.md,
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
});

export default LiveHistoryScreen;

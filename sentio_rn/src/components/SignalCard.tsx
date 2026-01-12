import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, Clock, Target, Flag } from 'lucide-react-native';
import { CleanCard, CardVariant } from './CleanCard';
import { useTheme, Colors, Spacing, FontSize, FontWeight, Radius } from '../theme';
import { LiveSignal } from '../types';

interface SignalCardProps {
    signal: LiveSignal;
    delay?: number;
}

export const SignalCard: React.FC<SignalCardProps> = ({ signal, delay = 0 }) => {
    const { colors } = useTheme();

    const isPending = signal.status === 'PENDING';
    const isWon = signal.status === 'WON';

    const statusColor = isPending
        ? Colors.warning
        : isWon
            ? Colors.success
            : Colors.danger;

    const statusText = isPending
        ? 'Bekliyor'
        : isWon
            ? 'Kazandı'
            : 'Kaybetti';

    const variant: CardVariant = isPending
        ? 'default'
        : isWon
            ? 'success'
            : 'danger';

    return (
        <CleanCard variant={variant} delay={delay}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.teamsContainer}>
                    <Text style={[styles.teams, { color: colors.text }]} numberOfLines={1}>
                        {signal.homeTeam} vs {signal.awayTeam}
                    </Text>
                    <Text style={[styles.league, { color: colors.textMuted }]} numberOfLines={1}>
                        {signal.league}
                    </Text>
                </View>

                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.statusText, { color: statusColor }]}>
                        {statusText}
                    </Text>
                </View>
            </View>

            {/* Market Chip */}
            <View style={styles.marketContainer}>
                <View style={styles.marketChip}>
                    <Text style={styles.marketText}>{signal.market}</Text>
                </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={[styles.statChip, { backgroundColor: colors.surface }]}>
                    <Clock size={12} color={colors.textMuted} />
                    <Text style={[styles.statText, { color: colors.textSecondary }]}>
                        {signal.entryMinute}'
                    </Text>
                </View>

                <View style={[styles.statChip, { backgroundColor: colors.surface }]}>
                    <Target size={12} color={colors.textMuted} />
                    <Text style={[styles.statText, { color: colors.textSecondary }]}>
                        {signal.entryScore}
                    </Text>
                </View>

                <View style={[styles.statChip, { backgroundColor: colors.surface }]}>
                    <TrendingUp size={12} color={colors.textMuted} />
                    <Text style={[styles.statText, { color: colors.textSecondary }]}>
                        {signal.confidence}%
                    </Text>
                </View>

                {signal.finalScore && (
                    <View style={[styles.statChip, { backgroundColor: Colors.success + '20' }]}>
                        <Flag size={12} color={Colors.success} />
                        <Text style={[styles.statText, { color: Colors.success }]}>
                            {signal.finalScore}
                        </Text>
                    </View>
                )}
            </View>

            {/* Reason */}
            {signal.reason ? (
                <Text style={[styles.reason, { color: colors.textMuted }]} numberOfLines={2}>
                    {signal.reason}
                </Text>
            ) : null}
        </CleanCard>
    );
};

const styles = StyleSheet.create({
    header: {
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
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: Radius.full,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    statusText: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.semibold,
    },
    marketContainer: {
        marginTop: Spacing.md,
        marginBottom: Spacing.md,
    },
    marketChip: {
        alignSelf: 'flex-start',
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
    statsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    statChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: Radius.sm,
        gap: 4,
    },
    statText: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.medium,
    },
    reason: {
        marginTop: Spacing.sm,
        fontSize: FontSize.xs,
        fontStyle: 'italic',
    },
});

export default SignalCard;

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { useTheme, Colors, Spacing, FontSize, FontWeight } from '../../theme';
import { CleanCard } from '../../components';

export const NotificationsScreen: React.FC = () => {
    const navigation = useNavigation();
    const { colors } = useTheme();

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
                <Text style={[styles.headerText, { color: colors.text }]}>Bildirimler</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Empty State */}
            <View style={styles.content}>
                <CleanCard>
                    <View style={styles.emptyContent}>
                        <Bell size={48} color={colors.textMuted} />
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>Bildirim Yok</Text>
                        <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                            Yeni bildirimler burada görünecek
                        </Text>
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
    content: {
        flex: 1,
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xl,
    },
    emptyContent: {
        alignItems: 'center',
        paddingVertical: Spacing.xxxl,
    },
    emptyTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.semibold,
        marginTop: Spacing.lg,
    },
    emptySubtitle: {
        fontSize: FontSize.sm,
        marginTop: Spacing.xs,
    },
});

export default NotificationsScreen;

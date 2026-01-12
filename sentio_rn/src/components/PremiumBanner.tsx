import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown } from 'lucide-react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../theme';

interface PremiumBannerProps {
    onPress: () => void;
}

export const PremiumBanner: React.FC<PremiumBannerProps> = ({ onPress }) => {
    return (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
            <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                <View style={styles.iconContainer}>
                    <Crown size={24} color={Colors.warning} fill={Colors.warning} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Pro'ya Geç</Text>
                    <Text style={styles.subtitle}>Sınırsız erişim ve anlık bildirimler</Text>
                </View>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>%33 İndirim</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: Radius.lg,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    title: {
        color: '#FFF',
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: FontSize.sm,
        marginTop: 2,
    },
    badge: {
        backgroundColor: Colors.warning,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: Radius.sm,
    },
    badgeText: {
        color: '#000',
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
    },
});

export default PremiumBanner;

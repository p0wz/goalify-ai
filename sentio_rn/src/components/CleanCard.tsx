import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
    StyleProp,
    Platform,
} from 'react-native';
import { useTheme, Colors, Radius, Spacing } from '../theme';

export type CardVariant = 'default' | 'primary' | 'success' | 'danger';

interface CleanCardProps {
    children: React.ReactNode;
    variant?: CardVariant;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    animated?: boolean;
    delay?: number;
}

export const CleanCard: React.FC<CleanCardProps> = ({
    children,
    variant = 'default',
    onPress,
    style,
    animated = true,
    delay = 0,
}) => {
    const { colors, isDark } = useTheme();

    const getVariantStyles = (): ViewStyle => {
        switch (variant) {
            case 'primary':
                return {
                    borderColor: Colors.primary + '40',
                    backgroundColor: isDark
                        ? Colors.primary + '15'
                        : Colors.primary + '08',
                };
            case 'success':
                return {
                    borderColor: Colors.success + '40',
                    backgroundColor: isDark
                        ? Colors.success + '15'
                        : Colors.success + '08',
                };
            case 'danger':
                return {
                    borderColor: Colors.danger + '40',
                    backgroundColor: isDark
                        ? Colors.danger + '15'
                        : Colors.danger + '08',
                };
            default:
                return {
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                };
        }
    };

    const cardStyle: ViewStyle = {
        ...styles.card,
        ...getVariantStyles(),
    };

    const content = (
        <View style={[cardStyle, style]}>
            {children}
        </View>
    );

    // Skip Moti animations on web due to compatibility issues
    const wrapper = onPress ? (
        <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
            {content}
        </TouchableOpacity>
    ) : (
        content
    );

    return wrapper;
};

const styles = StyleSheet.create({
    card: {
        borderRadius: Radius.lg,
        borderWidth: 1,
        padding: Spacing.lg,
        overflow: 'hidden',
    },
});

export default CleanCard;

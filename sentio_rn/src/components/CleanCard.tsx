import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
    StyleProp,
} from 'react-native';
import { MotiView } from 'moti';
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

    const wrapper = animated ? (
        <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay }}
        >
            {onPress ? (
                <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
                    {content}
                </TouchableOpacity>
            ) : (
                content
            )}
        </MotiView>
    ) : onPress ? (
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

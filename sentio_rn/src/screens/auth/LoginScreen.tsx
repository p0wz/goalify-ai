import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Mail, Lock, Eye, EyeOff, BarChart2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import { useTheme, Colors, Spacing, FontSize, FontWeight, Radius } from '../../theme';
import { useAuthStore } from '../../stores';

type NavigationProp = NativeStackNavigationProp<any>;

export const LoginScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { colors } = useTheme();
    const { login, signInWithGoogle, isLoading } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Lütfen tüm alanları doldurun');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        if (!email.includes('@')) {
            setError('Geçersiz email adresi');
            return;
        }

        if (password.length < 6) {
            setError('Şifre en az 6 karakter olmalı');
            return;
        }

        try {
            setError(null);
            await login(email.trim(), password);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (err: any) {
            setError(err.message || 'Giriş başarısız');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        setError(null);

        try {
            const success = await signInWithGoogle();
            if (success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (err: any) {
            setError(err.message || 'Google giriş başarısız');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const isAnyLoading = isLoading || isGoogleLoading;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Logo */}
                    <MotiView
                        from={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', damping: 15 }}
                        style={styles.logoContainer}
                    >
                        <View style={[styles.logoBox, { backgroundColor: Colors.primary }]}>
                            <BarChart2 size={48} color="#FFF" />
                        </View>
                    </MotiView>

                    {/* Title */}
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 400, delay: 100 }}
                    >
                        <Text style={[styles.title, { color: colors.text }]}>Hoş Geldin</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Hesabına giriş yap ve kazanmaya başla
                        </Text>
                    </MotiView>

                    {/* Error */}
                    {error && (
                        <MotiView
                            from={{ opacity: 0, translateY: -10 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            style={styles.errorContainer}
                        >
                            <Text style={styles.errorText}>{error}</Text>
                        </MotiView>
                    )}

                    {/* Form */}
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 400, delay: 200 }}
                        style={styles.form}
                    >
                        {/* Email Input */}
                        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Mail size={20} color={colors.textMuted} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Email"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                value={email}
                                onChangeText={setEmail}
                                editable={!isAnyLoading}
                            />
                        </View>

                        {/* Password Input */}
                        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Lock size={20} color={colors.textMuted} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Şifre"
                                placeholderTextColor={colors.textMuted}
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                                editable={!isAnyLoading}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                {showPassword ? (
                                    <EyeOff size={20} color={colors.textMuted} />
                                ) : (
                                    <Eye size={20} color={colors.textMuted} />
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.button, isAnyLoading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={isAnyLoading}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>{isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}</Text>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                            <Text style={[styles.dividerText, { color: colors.textMuted }]}>veya</Text>
                            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                        </View>

                        {/* Google Button */}
                        <TouchableOpacity
                            style={[styles.googleButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
                            onPress={handleGoogleSignIn}
                            disabled={isAnyLoading}
                            activeOpacity={0.8}
                        >
                            <Image
                                source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' }}
                                style={styles.googleIcon}
                            />
                            <Text style={[styles.googleButtonText, { color: colors.text }]}>
                                {isGoogleLoading ? 'Google ile bağlanılıyor...' : 'Google ile Giriş Yap'}
                            </Text>
                        </TouchableOpacity>
                    </MotiView>

                    {/* Register Link */}
                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ type: 'timing', duration: 400, delay: 400 }}
                        style={styles.footer}
                    >
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>Hesabın yok mu?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={isAnyLoading}>
                            <Text style={[styles.footerLink, { color: Colors.primary }]}>Kayıt Ol</Text>
                        </TouchableOpacity>
                    </MotiView>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: Spacing.xxl,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    logoBox: {
        width: 88,
        height: 88,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: FontSize.md,
        textAlign: 'center',
        marginTop: Spacing.sm,
    },
    errorContainer: {
        backgroundColor: Colors.danger + '15',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: Radius.sm,
        marginTop: Spacing.lg,
    },
    errorText: {
        color: Colors.danger,
        fontSize: FontSize.sm,
        textAlign: 'center',
    },
    form: {
        marginTop: 48,
        gap: Spacing.lg,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: Radius.md,
        paddingHorizontal: Spacing.lg,
        height: 56,
        gap: Spacing.md,
    },
    input: {
        flex: 1,
        fontSize: FontSize.md,
    },
    button: {
        backgroundColor: Colors.primary,
        height: 56,
        borderRadius: Radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#FFF',
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.md,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: Spacing.md,
        fontSize: FontSize.sm,
    },
    googleButton: {
        height: 56,
        borderRadius: Radius.md,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.md,
    },
    googleIcon: {
        width: 20,
        height: 20,
    },
    googleButtonText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing.xl,
        gap: Spacing.xs,
    },
    footerText: {
        fontSize: FontSize.sm,
    },
    footerLink: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
    },
});

export default LoginScreen;

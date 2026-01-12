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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff, User, UserPlus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import { useTheme, Colors, Spacing, FontSize, FontWeight, Radius } from '../../theme';
import { useAuthStore } from '../../stores';

type NavigationProp = NativeStackNavigationProp<any>;

export const RegisterScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { colors } = useTheme();
    const { register, isLoading } = useAuthStore();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async () => {
        if (!name || !email || !password) {
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
            await register(name.trim(), email.trim(), password);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (err: any) {
            setError(err.message || 'Kayıt başarısız');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

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
                    <View
                        from={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', damping: 15 }}
                        style={styles.logoContainer}
                    >
                        <View style={[styles.logoBox, { backgroundColor: Colors.primary }]}>
                            <UserPlus size={48} color="#FFF" />
                        </View>
                    </View>

                    {/* Title */}
                    <View
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 400, delay: 100 }}
                    >
                        <Text style={[styles.title, { color: colors.text }]}>Hesap Oluştur</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Hemen ücretsiz kayıt ol
                        </Text>
                    </View>

                    {/* Error */}
                    {error && (
                        <View
                            from={{ opacity: 0, translateY: -10 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            style={styles.errorContainer}
                        >
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    {/* Form */}
                    <View
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 400, delay: 200 }}
                        style={styles.form}
                    >
                        {/* Name Input */}
                        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <User size={20} color={colors.textMuted} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Ad Soyad"
                                placeholderTextColor={colors.textMuted}
                                autoCapitalize="words"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

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
                            />
                        </View>

                        {/* Password Input */}
                        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Lock size={20} color={colors.textMuted} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Şifre (en az 6 karakter)"
                                placeholderTextColor={colors.textMuted}
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                {showPassword ? (
                                    <EyeOff size={20} color={colors.textMuted} />
                                ) : (
                                    <Eye size={20} color={colors.textMuted} />
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Register Button */}
                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>
                                {isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Login Link */}
                    <View
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ type: 'timing', duration: 400, delay: 400 }}
                        style={styles.footer}
                    >
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>Zaten hesabın var mı?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={[styles.footerLink, { color: Colors.primary }]}>Giriş Yap</Text>
                        </TouchableOpacity>
                    </View>
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

export default RegisterScreen;

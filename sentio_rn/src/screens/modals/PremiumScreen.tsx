import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Crown,
    X,
    Layers,
    BarChart2,
    Bell,
    Headphones,
    RefreshCw,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { PurchasesPackage, PurchasesOfferings } from 'react-native-purchases';

import { useTheme, Colors, Spacing, FontSize, FontWeight, Radius } from '../../theme';
import { CleanCard } from '../../components';
import { revenueCatService, PurchaseResult } from '../../services';
import { useAuthStore } from '../../stores';

const FEATURES = [
    { icon: Layers, title: 'Sınırsız Tahmin', desc: 'Tüm maç tahminlerine erişim' },
    { icon: BarChart2, title: 'Detaylı İstatistik', desc: 'Gelişmiş analizler' },
    { icon: Bell, title: 'Anlık Bildirimler', desc: 'Önemli maçlarda uyarı' },
    { icon: Headphones, title: 'Öncelikli Destek', desc: '7/24 yardım' },
];

export const PremiumScreen: React.FC = () => {
    const navigation = useNavigation();
    const { colors, isDark } = useTheme();
    const { refreshPremiumStatus } = useAuthStore();

    const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadOfferings();
    }, []);

    const loadOfferings = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const offerings = await revenueCatService.getOfferings();
            setOfferings(offerings);

            // Pre-select monthly package
            if (offerings?.current?.monthly) {
                setSelectedPackage(offerings.current.monthly);
            } else if (offerings?.current?.availablePackages.length) {
                setSelectedPackage(offerings.current.availablePackages[0]);
            }
        } catch (err) {
            setError('Paketler yüklenemedi');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePurchase = async () => {
        if (!selectedPackage) return;

        setIsPurchasing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            const result = await revenueCatService.purchasePackage(selectedPackage);

            if (result === PurchaseResult.SUCCESS) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                await refreshPremiumStatus();
                navigation.goBack();
            } else if (result === PurchaseResult.CANCELLED) {
                // User cancelled - do nothing
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                setError('Satın alma başarısız');
            }
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsPurchasing(false);
        }
    };

    const handleRestore = async () => {
        setIsPurchasing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        try {
            const restored = await revenueCatService.restorePurchases();

            if (restored) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                await refreshPremiumStatus();
                navigation.goBack();
            } else {
                setError('Geri yüklenecek satın alma bulunamadı');
            }
        } catch (err) {
            setError('Geri yükleme başarısız');
        } finally {
            setIsPurchasing(false);
        }
    };

    const packages = offerings?.current?.availablePackages || [];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.closeButton, { backgroundColor: colors.surface }]}
                    onPress={() => navigation.goBack()}
                >
                    <X size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>PRO</Text>
                <TouchableOpacity onPress={handleRestore} disabled={isPurchasing}>
                    <Text style={[styles.restoreText, { color: Colors.primary }]}>Geri Yükle</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textMuted }]}>Paketler yükleniyor...</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Error */}
                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity onPress={loadOfferings}>
                                <RefreshCw size={16} color={Colors.danger} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Hero */}
                    <View
                        from={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', damping: 15 }}
                        style={styles.heroSection}
                    >
                        <LinearGradient
                            colors={[Colors.warning, Colors.warning + 'CC']}
                            style={styles.iconContainer}
                        >
                            <Crown size={48} color="#FFF" />
                        </LinearGradient>
                        <Text style={[styles.heroTitle, { color: colors.text }]}>SENTIO Pro</Text>
                        <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                            Daha fazla tahmin, daha yüksek kazanç
                        </Text>
                    </View>

                    {/* Features */}
                    <View style={styles.featuresSection}>
                        {FEATURES.map((feature, index) => (
                            <View
                                key={feature.title}
                                from={{ opacity: 0, translateX: -20 }}
                                animate={{ opacity: 1, translateX: 0 }}
                                transition={{ type: 'timing', duration: 400, delay: 100 + index * 50 }}
                            >
                                <CleanCard style={styles.featureCard} animated={false}>
                                    <View style={[styles.featureIcon, { backgroundColor: Colors.warning + '20' }]}>
                                        <feature.icon size={20} color={Colors.warning} />
                                    </View>
                                    <View style={styles.featureText}>
                                        <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
                                        <Text style={[styles.featureDesc, { color: colors.textMuted }]}>{feature.desc}</Text>
                                    </View>
                                </CleanCard>
                            </View>
                        ))}
                    </View>

                    {/* Packages */}
                    {packages.length > 0 && (
                        <View style={styles.packagesSection}>
                            {packages.map((pkg) => {
                                const isSelected = selectedPackage?.identifier === pkg.identifier;
                                const isAnnual = pkg.packageType === 'ANNUAL';

                                return (
                                    <View
                                        key={pkg.identifier}
                                        from={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ type: 'timing', duration: 300 }}
                                    >
                                        <TouchableOpacity
                                            style={[
                                                styles.packageCard,
                                                {
                                                    backgroundColor: isSelected
                                                        ? Colors.warning + '15'
                                                        : colors.surface,
                                                    borderColor: isSelected
                                                        ? Colors.warning
                                                        : colors.border,
                                                },
                                            ]}
                                            onPress={() => setSelectedPackage(pkg)}
                                            activeOpacity={0.8}
                                        >
                                            {/* Radio */}
                                            <View
                                                style={[
                                                    styles.radio,
                                                    {
                                                        borderColor: isSelected ? Colors.warning : colors.textMuted,
                                                    },
                                                ]}
                                            >
                                                {isSelected && (
                                                    <View style={[styles.radioInner, { backgroundColor: Colors.warning }]} />
                                                )}
                                            </View>

                                            {/* Info */}
                                            <View style={styles.packageInfo}>
                                                <View style={styles.packageNameRow}>
                                                    <Text style={[styles.packageName, { color: colors.text }]}>
                                                        {pkg.packageType === 'MONTHLY' ? 'Aylık' : pkg.packageType === 'ANNUAL' ? 'Yıllık' : 'Paket'}
                                                    </Text>
                                                    {isAnnual && (
                                                        <View style={styles.savingsBadge}>
                                                            <Text style={styles.savingsText}>%33 Tasarruf</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <Text style={[styles.packageDesc, { color: colors.textMuted }]}>
                                                    {pkg.product.description}
                                                </Text>
                                            </View>

                                            {/* Price */}
                                            <View style={styles.priceContainer}>
                                                <Text
                                                    style={[
                                                        styles.price,
                                                        { color: isSelected ? Colors.warning : colors.text },
                                                    ]}
                                                >
                                                    {pkg.product.priceString}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* CTA Button */}
                    <View
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 400, delay: 300 }}
                        style={styles.ctaSection}
                    >
                        <TouchableOpacity
                            style={[styles.ctaButton, (isPurchasing || !selectedPackage) && styles.ctaButtonDisabled]}
                            onPress={handlePurchase}
                            disabled={isPurchasing || !selectedPackage}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={[Colors.warning, Colors.warning + 'DD']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.ctaGradient}
                            >
                                {isPurchasing ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <>
                                        <Crown size={20} color="#FFF" />
                                        <Text style={styles.ctaText}>Pro'ya Geç</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <Text style={[styles.termsText, { color: colors.textMuted }]}>
                            Abonelik otomatik yenilenir. İstediğin zaman iptal edebilirsin.
                        </Text>
                    </View>

                    <View style={{ height: 50 }} />
                </ScrollView>
            )}
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
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
    },
    restoreText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.md,
    },
    loadingText: {
        fontSize: FontSize.sm,
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.danger + '15',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: Radius.sm,
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    errorText: {
        color: Colors.danger,
        fontSize: FontSize.sm,
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '800',
        marginTop: Spacing.xl,
    },
    heroSubtitle: {
        fontSize: FontSize.md,
        marginTop: Spacing.sm,
        textAlign: 'center',
    },
    featuresSection: {
        gap: Spacing.md,
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
    },
    featureIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureText: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    featureTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
    },
    featureDesc: {
        fontSize: FontSize.sm,
        marginTop: 2,
    },
    packagesSection: {
        marginTop: Spacing.xxl,
        gap: Spacing.sm,
    },
    packageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: Radius.lg,
        borderWidth: 2,
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    packageInfo: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    packageNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    packageName: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
    },
    packageDesc: {
        fontSize: FontSize.xs,
        marginTop: 2,
    },
    savingsBadge: {
        backgroundColor: Colors.success,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    savingsText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: FontWeight.bold,
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    price: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
    },
    ctaSection: {
        marginTop: Spacing.xxl,
        alignItems: 'center',
    },
    ctaButton: {
        width: '100%',
        borderRadius: Radius.lg,
        overflow: 'hidden',
    },
    ctaButtonDisabled: {
        opacity: 0.7,
    },
    ctaGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.lg,
        gap: Spacing.sm,
    },
    ctaText: {
        color: '#FFF',
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
    },
    termsText: {
        fontSize: FontSize.xs,
        marginTop: Spacing.lg,
        textAlign: 'center',
        lineHeight: 16,
    },
});

export default PremiumScreen;

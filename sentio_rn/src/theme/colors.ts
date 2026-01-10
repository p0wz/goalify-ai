// SENTIO Theme - Colors
// Clean & Modern Design System

export const Colors = {
    // Primary Brand
    primary: '#7C3AED',
    primaryLight: '#A78BFA',
    primaryDark: '#5B21B6',

    // Semantic
    success: '#22C55E',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

    // Light Theme
    light: {
        background: '#F8FAFC',
        surface: '#FFFFFF',
        surfaceElevated: '#FFFFFF',
        card: '#FFFFFF',
        border: '#E2E8F0',
        text: '#0F172A',
        textSecondary: '#64748B',
        textMuted: '#94A3B8',
    },

    // Dark Theme
    dark: {
        background: '#0F172A',
        surface: '#1E293B',
        surfaceElevated: '#334155',
        card: '#1E293B',
        border: '#334155',
        text: '#F1F5F9',
        textSecondary: '#94A3B8',
        textMuted: '#64748B',
    },
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

export const Radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
};

export const FontSize = {
    xs: 11,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
};

export const FontWeight = {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
};

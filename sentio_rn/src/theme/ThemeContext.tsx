import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from './colors';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    isDark: boolean;
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    colors: typeof Colors.light | typeof Colors.dark;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@sentio_theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [mode, setModeState] = useState<ThemeMode>('system');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved theme preference
    useEffect(() => {
        AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
            if (saved && ['light', 'dark', 'system'].includes(saved)) {
                setModeState(saved as ThemeMode);
            }
            setIsLoaded(true);
        });
    }, []);

    const setMode = async (newMode: ThemeMode) => {
        setModeState(newMode);
        await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    };

    const isDark = mode === 'system'
        ? systemColorScheme === 'dark'
        : mode === 'dark';

    const colors = isDark ? Colors.dark : Colors.light;

    if (!isLoaded) return null;

    return (
        <ThemeContext.Provider value={{ isDark, mode, setMode, colors }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { AppTheme, createTheme } from '../theme';
import { storage } from '../utils/storage';

interface ThemeContextType {
  isDark: boolean;
  theme: AppTheme;
  toggleTheme: () => void;
  setDark: (value: boolean) => void;
}

const THEME_STORAGE_KEY = 'user_theme_preference';

export const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    storage.get<boolean | null>(THEME_STORAGE_KEY, null).then((saved) => {
      if (saved !== null) {
        setIsDark(saved);
      } else {
        setIsDark(true);
      }
      setIsLoaded(true);
    });
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      storage.set(THEME_STORAGE_KEY, next);
      return next;
    });
  };

  const setDark = (value: boolean) => {
    setIsDark(value);
    storage.set(THEME_STORAGE_KEY, value);
  };

  const theme = useMemo(() => createTheme(isDark), [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CategoryProvider } from './context/CategoryContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { useTheme } from './hooks/useTheme';
import { WelcomeSplash } from './components/animations/WelcomeSplash';
import { RootNavigator } from './navigation/RootNavigator';

// In-memory session tracker: Welcome splash is shown ONLY ONCE when app is opened
let hasShownAppSplash = false;

function AppContent() {
  const { isDark } = useTheme();
  const [showSplash, setShowSplash] = useState(!hasShownAppSplash);

  // Inter matches the web app's font stack; keep the splash up until ready.
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const handleSplashComplete = () => {
    hasShownAppSplash = true;
    setShowSplash(false);
  };

  const splashVisible = !fontsLoaded || showSplash;

  return (
    <View style={styles.root}>
      <StatusBar style={splashVisible ? 'light' : isDark ? 'light' : 'dark'} />
      <RootNavigator />

      {/* One-time welcome splash overlay — sits above the navigator while
          fonts load and until the entry animation completes. */}
      {splashVisible ? (
        <View style={[StyleSheet.absoluteFill, styles.splashOverlay]}>
          <WelcomeSplash onComplete={handleSplashComplete} loading={!fontsLoaded} />
        </View>
      ) : null}
    </View>
  );
}

/**
 * App root — providers + font gate + splash overlay + navigation.
 * (Replaces the former expo-router `src/app/_layout.tsx`.)
 */
export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <CategoryProvider>
                <AppContent />
              </CategoryProvider>
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  splashOverlay: {
    zIndex: 100,
    elevation: 100,
    backgroundColor: '#09090b',
  },
});

import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { CategoryProvider } from '../context/CategoryContext';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '../hooks/useTheme';
import { WelcomeSplash } from '../components/animations/WelcomeSplash';

// In-memory session tracker: Welcome splash is shown ONLY ONCE when app is opened
let hasShownAppSplash = false;

function RootLayoutContent() {
  const { theme, isDark } = useTheme();
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

  if (!fontsLoaded || showSplash) {
    return (
      <>
        <StatusBar style="light" />
        <WelcomeSplash onComplete={handleSplashComplete} loading={!fontsLoaded} />
      </>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Pantiss ERP' }} />
        <Stack.Screen name="modules/[categoryId]" options={{ title: 'Workspace Modules' }} />
        <Stack.Screen name="(auth)/login" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(hr)" options={{ headerShown: false }} />
        <Stack.Screen name="(finance)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <CategoryProvider>
                <RootLayoutContent />
              </CategoryProvider>
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { CategoryProvider } from '../context/CategoryContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '../hooks/useTheme';
import { WelcomeSplash } from '../components/animations/WelcomeSplash';

// In-memory session tracker: Welcome splash is shown ONLY ONCE when app is opened
let hasShownAppSplash = false;

function RootLayoutContent() {
  const { theme, isDark } = useTheme();
  const [showSplash, setShowSplash] = useState(!hasShownAppSplash);

  const handleSplashComplete = () => {
    hasShownAppSplash = true;
    setShowSplash(false);
  };

  if (showSplash) {
    return (
      <>
        <StatusBar style="light" />
        <WelcomeSplash onComplete={handleSplashComplete} />
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
  );
}

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { Button } from '../components/ui/Button';

export default function NotFoundScreen() {
  const { theme } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Image
          source={require('@/assets/images/pantiss-mark.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.code, { color: theme.colors.brandPrimary }]}>404</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Workspace Screen Not Found</Text>
        <Text style={[styles.message, { color: theme.colors.textMuted }]}>
          The requested module or screen route could not be located in Pantiss ERP.
        </Text>
        <Link href="/" asChild>
          <Button
            title="Return to Workspaces"
            variant="primary"
            iconName="ArrowLeft"
            size="lg"
            style={styles.button}
          />
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: 24,
  },
  code: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
    marginBottom: 28,
  },
  button: {
    minWidth: 220,
  },
});

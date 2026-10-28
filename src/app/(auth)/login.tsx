import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { useTheme } from '../../hooks/useTheme';
import { AuthUser } from '../../types/auth';
import { LoginForm } from '../../components/auth/LoginForm';
import { Icon } from '../../components/ui/Icon';

/**
 * Full-page sign-in (web CXO split-login surface). Shares all form logic
 * with the module LoginModal through `LoginForm`.
 */
export default function LoginScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ redirect?: string }>();

  const handleSuccess = (user: AuthUser) => {
    if (params.redirect) {
      router.replace(params.redirect as never);
      return;
    }
    if (user.moduleId === 'finance') {
      router.replace('/(finance)/dashboard');
    } else if (user.moduleId === 'human-resources' || user.moduleId === 'hr') {
      router.replace('/(hr)/dashboard');
    } else {
      router.replace('/');
    }
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <View style={styles.brandContainer}>
          <Image
            source={require('@/assets/images/pantiss-mark.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: theme.colors.text }]}>Sign in</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            One connected workspace for programs, people and partnerships.
          </Text>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.moduleBg,
              borderColor: theme.colors.border,
              ...(theme.shadows.card as object),
            },
          ]}
        >
          <LoginForm moduleTitle="Pantiss ERP" onSuccess={handleSuccess} />
        </View>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            router.back();
          }}
          style={styles.backLink}
        >
          <Icon name="ArrowLeft" size={16} color={theme.colors.textMuted} />
          <Text style={[styles.backLinkText, { color: theme.colors.textMuted }]}>
            Back to workspace selection
          </Text>
        </Pressable>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  container: {
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    gap: 20,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  backLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

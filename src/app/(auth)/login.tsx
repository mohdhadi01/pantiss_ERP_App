import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { dummyUsers } from '../../data/dummyUsers';
import { Icon } from '../../components/ui/Icon';
import { Button } from '../../components/ui/Button';

export default function LoginScreen() {
  const { theme, isDark } = useTheme();
  const { login } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ redirect?: string; moduleId?: string }>();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fillCredentials = (acc: (typeof dummyUsers)[0]) => {
    Haptics.selectionAsync().catch(() => {});
    setUserId(acc.id);
    setPassword(acc.password);
    setError('');
  };

  const handleLogin = async () => {
    setError('');
    if (!userId.trim() || !password) {
      setError('Please provide your user email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(userId.trim(), password);
      if (res.success && res.user) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        if (params.redirect) {
          router.replace(params.redirect as any);
        } else if (res.user.moduleId === 'finance') {
          router.replace('/(finance)/dashboard');
        } else if (
          res.user.moduleId === 'human-resources' ||
          res.user.moduleId === 'hr'
        ) {
          router.replace('/(hr)/dashboard');
        } else {
          router.replace('/');
        }
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        setError(res.error || 'Invalid credentials');
      }
    } catch {
      setError('An error occurred during authentication.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <Image
            source={require('@/assets/images/pantiss-mark.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: theme.colors.text }]}>Pantiss ERP</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Enterprise Resource Planning & Operations
          </Text>
        </View>

        {/* Form Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.cardBg,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Sign In</Text>
          <Text style={[styles.cardSubtitle, { color: theme.colors.textSubtle }]}>
            Authenticate with your organization account
          </Text>

          {error ? (
            <View
              style={[
                styles.errorBox,
                {
                  backgroundColor: theme.colors.dangerSoft,
                  borderColor: theme.colors.dangerBorder,
                },
              ]}
            >
              <Icon name="AlertTriangle" size={16} color={theme.colors.danger} />
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
            </View>
          ) : null}

          {/* User ID Field */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>User ID / Email</Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.colors.inputBg,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Icon name="Mail" size={17} color={theme.colors.textSubtle} />
              <TextInput
                value={userId}
                onChangeText={setUserId}
                placeholder="e.g. hr.lead@pantiss.org"
                placeholderTextColor={theme.colors.textSubtle}
                autoCapitalize="none"
                keyboardType="email-address"
                style={[styles.input, { color: theme.colors.text }]}
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>Password</Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.colors.inputBg,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Icon name="Lock" size={17} color={theme.colors.textSubtle} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor={theme.colors.textSubtle}
                secureTextEntry={!showPassword}
                style={[styles.input, { color: theme.colors.text }]}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                <Icon
                  name={showPassword ? 'EyeOff' : 'Eye'}
                  size={17}
                  color={theme.colors.textSubtle}
                />
              </Pressable>
            </View>
          </View>

          {/* Submit Button */}
          <Button
            title={submitting ? 'Authenticating...' : 'Sign In to Workspace'}
            variant="primary"
            size="lg"
            onPress={handleLogin}
            disabled={submitting}
            style={styles.submitButton}
            iconName={submitting ? undefined : 'ArrowRight'}
          />

          {/* Quick Demo Accounts */}
          <View style={styles.demoSection}>
            <Text style={[styles.demoSectionTitle, { color: theme.colors.textSubtle }]}>
              QUICK ACCESS DEMO ACCOUNTS
            </Text>
            <View style={styles.demoList}>
              {dummyUsers.slice(0, 4).map((acc) => (
                <Pressable
                  key={acc.id}
                  onPress={() => fillCredentials(acc)}
                  style={({ pressed }) => [
                    styles.demoPill,
                    {
                      backgroundColor: theme.colors.surfaceSoft,
                      borderColor: theme.colors.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.demoPillRole, { color: theme.colors.brandPrimary }]}>
                    {acc.roleLabel}
                  </Text>
                  <Text style={[styles.demoPillId, { color: theme.colors.textMuted }]}>
                    {acc.id}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Back Link */}
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Icon name="ArrowLeft" size={16} color={theme.colors.textMuted} />
          <Text style={[styles.backLinkText, { color: theme.colors.textMuted }]}>
            Back to Workspace Selection
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
    borderRadius: 14,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: -8,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  submitButton: {
    marginTop: 8,
  },
  demoSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
    gap: 10,
  },
  demoSectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  demoList: {
    gap: 8,
  },
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  demoPillRole: {
    fontSize: 12,
    fontWeight: '700',
  },
  demoPillId: {
    fontSize: 11,
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

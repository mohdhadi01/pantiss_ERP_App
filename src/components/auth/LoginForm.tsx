import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { AuthUser } from '../../types/auth';
import { dummyUsers } from '../../data/dummyUsers';
import { Icon } from '../ui/Icon';
import { TextField } from '../ui/TextField';
import { Button } from '../ui/Button';

export interface LoginFormProps {
  moduleId?: string;
  moduleTitle: string;
  accent?: 'primary' | 'emerald';
  onSuccess: (user: AuthUser) => void;
  showAutofill?: boolean;
  showDemoSwitcher?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  moduleId,
  moduleTitle,
  accent = 'primary',
  onSuccess,
  showAutofill = true,
  showDemoSwitcher = true,
}) => {
  const { theme } = useTheme();
  const { login } = useAuth();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const targetModule = moduleId ? (moduleId === 'hr' ? 'human-resources' : moduleId) : undefined;
  const moduleDemoAccount = targetModule
    ? dummyUsers.find((acc) => acc.moduleId === targetModule)
    : undefined;

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    const result = await login(userId.trim(), password, remember);
    setSubmitting(false);

    if (!result.success || !result.user) {
      setError(result.error || 'The user ID or password is incorrect. Contact your administrator if you need access.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }

    const userModule = result.user.moduleId === 'hr' ? 'human-resources' : result.user.moduleId;
    if (targetModule && userModule !== targetModule) {
      setError(`This account is assigned to ${result.user.roleLabel} access and cannot open ${moduleTitle}.`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onSuccess(result.user);
  };

  return (
    <View style={styles.container}>
      {showAutofill && moduleDemoAccount ? (
        <Pressable
          onPress={() => fillCredentials(moduleDemoAccount)}
          style={({ pressed }) => [
            styles.autofillBox,
            {
              backgroundColor: theme.colors.redAccentSoft,
              borderColor: 'rgba(239, 68, 68, 0.25)',
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Icon name="WandSparkles" size={15} color={theme.colors.redAccent} />
          <Text style={[styles.autofillText, { color: theme.colors.redAccent }]}>
            Autofill {moduleDemoAccount.roleLabel} demo credentials
          </Text>
        </Pressable>
      ) : null}

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
          <Icon name="AlertCircle" size={16} color={theme.colors.dangerText} />
          <Text style={[styles.errorText, { color: theme.colors.dangerText }]}>{error}</Text>
        </View>
      ) : null}

      <TextField
        label="User ID"
        value={userId}
        onChangeText={setUserId}
        placeholder="Enter your Pantiss user ID"
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
        editable={!submitting}
      />

      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secure
        placeholder="Enter your password"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!submitting}
      />

      <View style={styles.rememberRow}>
        <Pressable onPress={() => setRemember((v) => !v)} style={styles.rememberControl}>
          <View
            style={[
              styles.checkbox,
              {
                borderColor: remember ? theme.colors.brandPrimary : theme.colors.borderStrong,
                backgroundColor: remember ? theme.colors.brandPrimary : 'transparent',
              },
            ]}
          >
            {remember ? <Icon name="Check" size={12} color="#ffffff" strokeWidth={3} /> : null}
          </View>
          <Text style={[styles.rememberLabel, { color: theme.colors.textMuted }]}>Remember me</Text>
        </Pressable>
        <Pressable accessibilityRole="link" hitSlop={6}>
          <Text style={[styles.forgotText, { color: theme.colors.brandPrimary }]}>Forgot password?</Text>
        </Pressable>
      </View>

      <Button
        label={submitting ? 'Signing in…' : 'Sign in'}
        onPress={handleLogin}
        loading={submitting}
        size="lg"
        variant={accent === 'emerald' ? 'emerald' : 'primary'}
        style={styles.submit}
      />

      {showDemoSwitcher ? (
        <View style={[styles.demoSection, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.demoSectionTitle, { color: theme.colors.textSubtle }]}>
            DEMO WORKSPACE ACCOUNTS
          </Text>
          <View style={styles.demoChips}>
            {dummyUsers
              .filter((u) => u.moduleId === 'finance' || u.moduleId === 'human-resources')
              .map((demo) => (
                <Pressable
                  key={demo.id}
                  onPress={() => fillCredentials(demo)}
                  style={({ pressed }) => [
                    styles.demoChip,
                    {
                      backgroundColor: theme.colors.surfaceSoft,
                      borderColor: theme.colors.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.demoChipText, { color: theme.colors.text }]}>{demo.roleLabel}</Text>
                </Pressable>
              ))}
          </View>
          <Text style={[styles.footerNote, { color: theme.colors.textSubtle }]}>
            Access is limited to authorized Pantiss roles.
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  autofillBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  autofillText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 2,
  },
  rememberControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  forgotText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rememberLabel: {
    fontSize: 12,
  },
  submit: {
    marginTop: 6,
  },
  demoSection: {
    borderTopWidth: 1,
    paddingTop: 16,
    gap: 10,
  },
  demoSectionTitle: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  demoChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  demoChip: {
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 8,
    borderWidth: 1,
  },
  demoChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  footerNote: {
    fontSize: 11,
  },
});

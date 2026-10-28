import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { ModuleItem } from '../../types/modules';
import { AuthUser } from '../../types/auth';
import { dummyUsers } from '../../data/dummyUsers';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';

export interface LoginModalProps {
  visible: boolean;
  module: ModuleItem | null;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  visible,
  module,
  onClose,
  onSuccess,
}) => {
  const { theme } = useTheme();
  const { login } = useAuth();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!module) return null;

  const moduleDemoAccount = dummyUsers.find((acc) => acc.moduleId === module.id);

  const fillCredentials = (acc: typeof dummyUsers[0]) => {
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

    // Slight delay for authentic tactile feel
    setTimeout(async () => {
      const result = await login(userId, password, remember);
      setSubmitting(false);

      if (!result.success || !result.user) {
        setError(result.error || 'The user ID or password is incorrect.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        return;
      }

      const userMod = result.user.moduleId === 'hr' ? 'human-resources' : result.user.moduleId;
      const targetMod = module.id === 'hr' ? 'human-resources' : module.id;
      if (userMod !== targetMod) {
        setError(`This account is assigned to ${result.user.roleLabel} and cannot access ${module.title}.`);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      onSuccess(result.user);
    }, 400);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: theme.colors.cardBg,
              borderColor: theme.colors.borderStrong,
            },
          ]}
        >
          {/* Close button */}
          <Pressable
            onPress={onClose}
            style={[
              styles.closeButton,
              {
                backgroundColor: theme.colors.surfaceMuted,
              },
            ]}
          >
            <Icon name="X" size={16} color={theme.colors.textMuted} />
          </Pressable>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Brand Logo & Heading */}
            <View style={styles.brandRow}>
              <Image
                source={require('@/assets/images/pantiss-mark.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <View>
                <Text style={[styles.brandTitle, { color: theme.colors.text }]}>
                  Pantiss ERP
                </Text>
                <Text style={[styles.brandSub, { color: theme.colors.textSubtle }]}>
                  Enterprise Portal
                </Text>
              </View>
            </View>

            <Text style={[styles.heading, { color: theme.colors.text }]}>
              Sign in
            </Text>
            <Text style={[styles.subheading, { color: theme.colors.textMuted }]}>
              to access <Text style={{ fontWeight: '700', color: theme.colors.brandPrimary }}>{module.title}</Text>
            </Text>

            {/* Quick Demo Autofill */}
            {moduleDemoAccount && (
              <Pressable
                onPress={() => fillCredentials(moduleDemoAccount)}
                style={[
                  styles.autofillBox,
                  {
                    backgroundColor: theme.colors.brandSoft,
                    borderColor: theme.colors.brandRing,
                  },
                ]}
              >
                <Icon name="Sparkles" size={15} color={theme.colors.brandPrimary} />
                <Text style={[styles.autofillText, { color: theme.colors.brandPrimary }]}>
                  Autofill {moduleDemoAccount.roleLabel} demo credentials
                </Text>
              </Pressable>
            )}

            {/* Error Message */}
            {error ? (
              <View
                style={[
                  styles.errorBox,
                  {
                    backgroundColor: theme.colors.dangerSoft,
                    borderColor: 'rgba(239, 68, 68, 0.25)',
                  },
                ]}
              >
                <Icon name="AlertCircle" size={16} color={theme.colors.danger} />
                <Text style={[styles.errorText, { color: theme.colors.danger }]}>
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Form Fields */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textSubtle }]}>
                USER ID / EMAIL
              </Text>
              <TextInput
                value={userId}
                onChangeText={setUserId}
                placeholder="e.g. hr.manager@pantiss.org"
                placeholderTextColor={theme.colors.textGhost}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                style={[
                  styles.input,
                  {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.surfaceSoft,
                    borderColor: theme.colors.border,
                  },
                ]}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.colors.textSubtle }]}>
                PASSWORD
              </Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.colors.textGhost}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[
                    styles.input,
                    styles.passwordInput,
                    {
                      color: theme.colors.text,
                      backgroundColor: theme.colors.surfaceSoft,
                      borderColor: theme.colors.border,
                    },
                  ]}
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  style={styles.eyeToggle}
                >
                  <Icon
                    name={showPassword ? 'EyeOff' : 'Eye'}
                    size={16}
                    color={theme.colors.textSubtle}
                  />
                </Pressable>
              </View>
            </View>

            {/* Remember Me row */}
            <Pressable
              onPress={() => setRemember((v) => !v)}
              style={styles.rememberRow}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: remember ? theme.colors.brandPrimary : theme.colors.borderStrong,
                    backgroundColor: remember ? theme.colors.brandPrimary : 'transparent',
                  },
                ]}
              >
                {remember && <Icon name="Check" size={12} color="#ffffff" strokeWidth={3} />}
              </View>
              <Text style={[styles.rememberLabel, { color: theme.colors.textMuted }]}>
                Remember my session on this device
              </Text>
            </Pressable>

            {/* Submit Button */}
            <Button
              label={submitting ? 'Authenticating...' : 'Sign In'}
              onPress={handleLogin}
              loading={submitting}
              size="lg"
              variant={module.id === 'finance' ? 'emerald' : 'primary'}
              style={styles.submitBtn}
            />

            {/* Switcher Demo Accounts footer */}
            <View style={styles.demoAccountsSection}>
              <Text style={[styles.demoSectionTitle, { color: theme.colors.textSubtle }]}>
                SWITCH DEMO WORKSPACES:
              </Text>
              <View style={styles.demoChips}>
                {dummyUsers
                  .filter((u) => u.moduleId === 'finance' || u.moduleId === 'human-resources')
                  .map((demo) => (
                    <Pressable
                      key={demo.id}
                      onPress={() => fillCredentials(demo)}
                      style={[
                        styles.demoChip,
                        {
                          backgroundColor: theme.colors.surfaceMuted,
                          borderColor: theme.colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.demoChipText, { color: theme.colors.text }]}>
                        {demo.roleLabel}
                      </Text>
                    </Pressable>
                  ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    padding: 24,
    paddingBottom: 36,
    maxHeight: '88%',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: 11,
    fontWeight: '500',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 14,
    marginTop: 2,
    marginBottom: 16,
  },
  autofillBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 44,
  },
  eyeToggle: {
    position: 'absolute',
    right: 14,
    padding: 4,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 12,
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
  submitBtn: {
    marginTop: 8,
    marginBottom: 20,
  },
  demoAccountsSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
    paddingTop: 16,
    gap: 8,
  },
  demoSectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  demoChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  demoChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  demoChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

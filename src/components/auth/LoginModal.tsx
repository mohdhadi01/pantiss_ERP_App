import React from 'react';
import { View, Text, Pressable, StyleSheet, Image, ScrollView } from 'react-native';
import { Modal } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { AuthUser } from '../../types/auth';
import { ModuleItem } from '../../types/modules';
import { LoginForm } from './LoginForm';
import { Icon } from '../ui/Icon';

export interface LoginModalProps {
  visible: boolean;
  module: ModuleItem | null;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

/**
 * Bottom-sheet sign-in opened from module cards — the mobile take on the
 * web LoginDialog, delegating all form logic to the shared LoginForm.
 */
export const LoginModal: React.FC<LoginModalProps> = ({ visible, module, onClose, onSuccess }) => {
  const { theme } = useTheme();

  if (!module) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close sign-in" />
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: theme.colors.moduleBg,
              borderColor: theme.colors.borderStrong,
            },
          ]}
        >
          <Pressable
            onPress={onClose}
            accessibilityLabel="Close"
            style={[styles.closeButton, { backgroundColor: theme.colors.surfaceMuted }]}
          >
            <Icon name="X" size={16} color={theme.colors.textMuted} />
          </Pressable>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.brandRow}>
              <Image
                source={require('@/assets/images/pantiss-mark.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <View>
                <Text style={[styles.brandTitle, { color: theme.colors.text }]}>Pantiss ERP</Text>
                <Text style={[styles.brandSub, { color: theme.colors.textSubtle }]}>
                  Enterprise Portal
                </Text>
              </View>
            </View>

            <Text style={[styles.heading, { color: theme.colors.text }]}>Sign in</Text>
            <Text style={[styles.subheading, { color: theme.colors.textMuted }]}>
              to access{' '}
              <Text style={{ fontWeight: '700', color: theme.colors.brandPrimary }}>
                {module.title}
              </Text>
            </Text>

            <LoginForm
              moduleId={module.id}
              moduleTitle={module.title}
              accent={module.id === 'finance' ? 'emerald' : 'primary'}
              onSuccess={onSuccess}
            />
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
    flex: 1,
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
    borderRadius: 12,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: 11,
    fontWeight: '500',
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  subheading: {
    fontSize: 14,
    marginTop: 2,
    marginBottom: 18,
  },
});

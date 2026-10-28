import React from 'react';
import { View, Text, Pressable, StyleSheet, Image, ScrollView } from 'react-native';
import { Modal } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { AuthUser } from '../../types/auth';
import { ModuleItem } from '../../types/modules';
import { LoginForm } from './LoginForm';
import { Icon } from '../ui/Icon';
import { LinearGradient } from 'expo-linear-gradient';

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

            {/* Web LoginDialog right promo panel, condensed for the sheet */}
            <View style={[styles.promo, { backgroundColor: theme.colors.surfaceSoft, borderColor: theme.colors.border }]}>
              <LinearGradient
                colors={module.accentColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.promoIcon}
              >
                <Icon name={module.iconName} size={20} color="#ffffff" strokeWidth={1.9} />
              </LinearGradient>
              <View style={styles.promoText}>
                <Text style={[styles.promoTitle, { color: theme.colors.text }]}>{module.title}</Text>
                <Text style={[styles.promoDesc, { color: theme.colors.textMuted }]} numberOfLines={2}>
                  {module.description}
                </Text>
                <View style={styles.promoCta}>
                  <Text style={[styles.promoCtaText, { color: theme.colors.brandPrimary }]}>Learn more</Text>
                </View>
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
  promo: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginTop: 18,
  },
  promoIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  promoTitle: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  promoDesc: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  promoCta: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
    marginTop: 4,
  },
  promoCtaText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

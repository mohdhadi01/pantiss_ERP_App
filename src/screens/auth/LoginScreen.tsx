import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { useTheme } from '../../hooks/useTheme';
import { AuthUser } from '../../types/auth';
import { LoginForm } from '../../components/auth/LoginForm';
import { Icon } from '../../components/ui/Icon';
import type { PublicStackParamList, PublicStackNav, RootDrawerNav } from '../../navigation/types';

export interface LoginScreenProps {
  moduleId?: string;
  heading?: string;
  showBackLink?: boolean;
}

const moduleTitleFor = (moduleId?: string): string => {
  if (moduleId === 'finance') return 'Finance';
  if (moduleId === 'human-resources' || moduleId === 'hr') return 'Human Resources';
  return 'Pantiss ERP';
};

export const LoginScreen: React.FC<LoginScreenProps> = ({
  moduleId: moduleIdProp,
  heading,
  showBackLink = true,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation<PublicStackNav>();
  const route = useRoute<RouteProp<PublicStackParamList, 'Login'>>();

  const moduleId = moduleIdProp ?? route.params?.moduleId;

  const handleSuccess = (user: AuthUser) => {
    const root = navigation.getParent<RootDrawerNav>();
    if (user.moduleId === 'finance') {
      root?.reset({
        index: 0,
        routes: [{ name: 'FinanceStack', params: { screen: 'FinanceDashboard' } }],
      });
    } else if (user.moduleId === 'human-resources' || user.moduleId === 'hr') {
      root?.reset({
        index: 0,
        routes: [{ name: 'HrStack', params: { screen: 'HrDashboard' } }],
      });
    } else {
      root?.reset({
        index: 0,
        routes: [{ name: 'PublicStack', params: { screen: 'Landing' } }],
      });
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
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {heading ?? 'Sign in'}
          </Text>
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
          <LoginForm
            moduleId={moduleId}
            moduleTitle={moduleTitleFor(moduleId)}
            accent={moduleId === 'finance' ? 'emerald' : 'primary'}
            onSuccess={handleSuccess}
          />
        </View>

        {showBackLink ? (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              navigation.goBack();
            }}
            style={styles.backLink}
          >
            <Icon name="ArrowLeft" size={16} color={theme.colors.textMuted} />
            <Text style={[styles.backLinkText, { color: theme.colors.textMuted }]}>
              Back to workspace selection
            </Text>
          </Pressable>
        ) : null}
      </View>
    </ScreenWrapper>
  );
};

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

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { avatarGradients } from '../../theme/gradients';
import { Icon } from '../ui/Icon';
import { IconButton } from '../ui/IconButton';

export interface TopNavigationProps {
  canGoBack?: boolean;
  onBack?: () => void;
  subtitle?: string;
  onProfilePress?: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  canGoBack = false,
  onBack,
  subtitle,
  onProfilePress,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (onBack) {
      onBack();
    } else {
      router.replace('/');
    }
  };

  const handleProfile = () => {
    Haptics.selectionAsync().catch(() => {});
    if (onProfilePress) {
      onProfilePress();
    } else if (isAuthenticated) {
      logout();
    } else {
      router.push('/(auth)/login');
    }
  };

  const handleThemeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    toggleTheme();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.navBg,
          borderBottomColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.leftSection}>
        {canGoBack && (
          <>
            <IconButton
              icon="ArrowLeft"
              size={36}
              iconSize={18}
              onPress={handleBack}
              variant="ghost"
              accessibilityLabel="Back to workspaces"
            />
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          </>
        )}

        <Pressable
          onPress={() => router.replace('/')}
          style={styles.brandPressable}
          accessibilityLabel="Pantiss Home"
        >
          <Image
            source={require('@/assets/images/pantiss-mark.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.brandTitle, { color: theme.colors.text }]}>
            Pantiss ERP
          </Text>
        </Pressable>

        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.colors.textSubtle }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.rightSection}>
        <IconButton
          icon={isDark ? 'Sun' : 'Moon'}
          size={36}
          iconSize={18}
          onPress={handleThemeToggle}
          variant="outline"
          accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        />

        <Pressable
          onPress={handleProfile}
          style={styles.avatarButton}
          accessibilityLabel={user ? `Signed in as ${user.name}` : 'Sign in'}
        >
          <LinearGradient
            colors={avatarGradients.brand.colors}
            start={avatarGradients.brand.start}
            end={avatarGradients.brand.end}
            style={styles.avatarGradient}
          >
            {user ? (
              <Text style={styles.avatarText}>{user.initials}</Text>
            ) : (
              <Icon name="UserRound" size={15} color="#ffffff" strokeWidth={2} />
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    zIndex: 40,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  divider: {
    width: 1,
    height: 18,
    marginHorizontal: 2,
  },
  brandPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  avatarGradient: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

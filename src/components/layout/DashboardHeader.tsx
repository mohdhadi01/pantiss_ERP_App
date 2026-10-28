import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { Icon } from '../ui/Icon';
import { IconButton } from '../ui/IconButton';

export interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeColor?: string;
  onOpenDrawer?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  showThemeToggle?: boolean;
  showAlerts?: boolean;
  unreadAlertsCount?: number;
  onPressAlerts?: () => void;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  badgeText,
  badgeColor,
  onOpenDrawer,
  showBack = false,
  onBack,
  showThemeToggle = true,
  showAlerts = false,
  unreadAlertsCount = 0,
  onPressAlerts,
  rightAction,
  style,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.colors.navBg,
          borderBottomColor: theme.colors.border,
        },
        style,
      ]}
    >
      <View style={styles.leftContainer}>
        {showBack ? (
          <IconButton
            icon="ChevronLeft"
            size={38}
            iconSize={20}
            onPress={handleBack}
            variant="ghost"
          />
        ) : onOpenDrawer ? (
          <IconButton
            icon="Menu"
            size={38}
            iconSize={19}
            onPress={onOpenDrawer}
            variant="ghost"
            accessibilityLabel="Open navigation menu"
          />
        ) : null}

        <View style={styles.titleColumn}>
          {badgeText && (
            <Text
              style={[
                styles.badgeText,
                { color: badgeColor || theme.colors.brandPrimary },
              ]}
              numberOfLines={1}
            >
              {badgeText}
            </Text>
          )}
          <Text
            style={[styles.title, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[styles.subtitle, { color: theme.colors.textSubtle }]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actionsContainer}>
        {showThemeToggle && (
          <IconButton
            icon={isDark ? 'Sun' : 'Moon'}
            size={36}
            iconSize={17}
            onPress={toggleTheme}
            variant="outline"
            accessibilityLabel="Toggle dark mode"
          />
        )}

        {showAlerts && (
          <Pressable
            onPress={onPressAlerts}
            style={[
              styles.alertButton,
              {
                backgroundColor: theme.colors.surfaceSoft,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Icon name="Bell" size={17} color={theme.colors.textMuted} />
            {unreadAlertsCount > 0 && (
              <View
                style={[
                  styles.alertDot,
                  { backgroundColor: theme.colors.warning },
                ]}
              />
            )}
          </Pressable>
        )}

        <View
          style={[
            styles.initialsBox,
            {
              backgroundColor: theme.colors.brandSoft,
            },
          ]}
        >
          <Text style={[styles.initialsText, { color: theme.colors.brandPrimary }]}>
            {user ? user.initials : 'AK'}
          </Text>
        </View>

        {rightAction}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    minHeight: 64,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  titleColumn: {
    flex: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  alertDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    position: 'absolute',
    top: 7,
    right: 7,
  },
  initialsBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

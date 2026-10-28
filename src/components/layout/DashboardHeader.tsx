import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ViewStyle, StyleProp } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { avatarGradients } from '../../theme/gradients';
import { Icon } from '../ui/Icon';
import { IconButton } from '../ui/IconButton';

export type HeaderAvatarVariant = 'initials' | 'finance';

export interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  /** Module eyebrow — web header `text-[9px] uppercase tracking-[0.18em]`. */
  eyebrow?: string;
  eyebrowColor?: string;
  /** `finance` = emerald gradient tile with ₹ icon (web Finance header); `initials` = brandSoft tile. */
  avatarVariant?: HeaderAvatarVariant;
  onOpenDrawer?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  showThemeToggle?: boolean;
  showAlerts?: boolean;
  unreadAlertsCount?: number;
  onPressAlerts?: () => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  rightAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Workspace header — web `h-20` blurred topbar: eyebrow + H1 left,
 * search + theme toggle + bell + avatar tile right.
 */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  eyebrow,
  eyebrowColor,
  avatarVariant = 'initials',
  onOpenDrawer,
  showBack = false,
  onBack,
  showThemeToggle = true,
  showAlerts = false,
  unreadAlertsCount = 0,
  onPressAlerts,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  rightAction,
  style,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { isMd } = useBreakpoint();
  const navigation = useNavigation();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
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
            size={40}
            iconSize={20}
            onPress={handleBack}
            variant="ghost"
          />
        ) : onOpenDrawer ? (
          <IconButton
            icon="Menu"
            size={40}
            iconSize={19}
            onPress={onOpenDrawer}
            variant="ghost"
            accessibilityLabel="Open navigation menu"
          />
        ) : null}

        {isMd ? (
          <View style={styles.titleColumn}>
            {eyebrow ? (
              <Text
                style={[
                  theme.fontStyles.eyebrow,
                  styles.eyebrow,
                  { color: eyebrowColor ?? theme.colors.brandPrimary },
                ]}
                numberOfLines={1}
              >
                {eyebrow}
              </Text>
            ) : null}
            <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={[styles.subtitle, { color: theme.colors.textSubtle }]} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        ) : (
          // Phones: compact native-style bar — the workspace heading below
          // already shows eyebrow, title and description in full.
          <Text style={[styles.titleMobile, { color: theme.colors.text }]} numberOfLines={2}>
            {title}
          </Text>
        )}
      </View>

      <View style={styles.actionsContainer}>
        {searchPlaceholder && isMd ? (
          <View
            style={[
              styles.search,
              {
                backgroundColor: theme.colors.surfaceSoft,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Icon name="Search" size={15} color={theme.colors.textSubtle} />
            <TextInput
              value={searchValue}
              onChangeText={onSearchChange}
              placeholder={searchPlaceholder}
              placeholderTextColor={theme.colors.textGhost}
              style={[styles.searchInput, { color: theme.colors.text }]}
              returnKeyType="search"
            />
          </View>
        ) : null}

        {showThemeToggle && (
          <IconButton
            icon={isDark ? 'Sun' : 'Moon'}
            size={40}
            iconSize={17}
            onPress={toggleTheme}
            variant="outline"
            accessibilityLabel="Toggle dark mode"
          />
        )}

        {showAlerts && (
          <Pressable
            onPress={onPressAlerts}
            accessibilityLabel={unreadAlertsCount > 0 ? `${unreadAlertsCount} unread alerts` : 'Alerts'}
            style={({ pressed }) => [
              styles.alertButton,
              {
                backgroundColor: theme.colors.surfaceSoft,
                borderColor: theme.colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Icon name="Bell" size={17} color={theme.colors.textMuted} />
            {unreadAlertsCount > 0 && (
              <View style={[styles.alertDot, { backgroundColor: theme.colors.warning, borderColor: theme.colors.background }]} />
            )}
          </Pressable>
        )}

        {avatarVariant === 'finance' ? (
          <LinearGradient
            colors={avatarGradients.finance.colors}
            start={avatarGradients.finance.start}
            end={avatarGradients.finance.end}
            style={styles.avatarTile}
          >
            <Icon name="CircleDollarSign" size={17} color="#ffffff" strokeWidth={1.9} />
          </LinearGradient>
        ) : (
          <View style={[styles.avatarTile, { backgroundColor: theme.colors.brandSoft }]}>
            <Text style={[styles.initialsText, { color: theme.colors.brandPrimary }]}>
              {user ? user.initials : '—'}
            </Text>
          </View>
        )}

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
    borderBottomWidth: 1,
    minHeight: 80,
    gap: 12,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  titleColumn: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    fontSize: 9,
    marginBottom: 3,
  },
  title: {
    fontSize: 19,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  titleMobile: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
    flex: 1,
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
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
    width: 210,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    padding: 0,
  },
  alertButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 8,
    right: 8,
    borderWidth: 2,
  },
  avatarTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

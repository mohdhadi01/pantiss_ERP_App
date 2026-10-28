import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { Icon } from '../ui/Icon';
import { NavItem } from '../../types/navigation';

export interface AppDrawerContentProps {
  title: string;
  subtitle: string;
  items: NavItem[];
  currentRoute: string;
  onNavigate: (route: string) => void;
  accentColor?: string;
  onClose?: () => void;
}

export const AppDrawerContent: React.FC<AppDrawerContentProps> = ({
  title,
  subtitle,
  items,
  currentRoute,
  onNavigate,
  accentColor,
  onClose,
}) => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleSelect = (route: string) => {
    Haptics.selectionAsync().catch(() => {});
    onNavigate(route);
  };

  const handleSignOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (onClose) onClose();
    await logout();
    router.replace('/modules/core-operations');
  };

  const handleGoHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (onClose) onClose();
    router.replace('/');
  };

  const activeAccent = accentColor || theme.colors.brandPrimary;
  const isFinance = title.toLowerCase().includes('finance');
  const workspaceNote = isFinance
    ? 'Institutional finance · Demo'
    : 'People operations · Demo';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.moduleBg,
          borderRightColor: theme.colors.border,
        },
      ]}
    >
      {/* Brand Header matching DashboardLayout sidebar */}
      <View
        style={[
          styles.brandHeader,
          {
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <Pressable
          onPress={handleGoHome}
          style={styles.brandPressable}
          accessibilityLabel="Pantiss home"
        >
          <Image
            source={require('@/assets/images/pantiss-mark.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.brandText}>
            <Text style={[styles.brandTitle, { color: theme.colors.text }]}>
              Pantiss ERP
            </Text>
            <Text style={[styles.brandSubtitle, { color: theme.colors.textMuted }]}>
              {subtitle}
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Navigation Items */}
      <ScrollView
        style={styles.itemList}
        contentContainerStyle={styles.itemListContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back to Modules Shortcut matching web flow */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            if (onClose) onClose();
            router.push('/modules/core-operations');
          }}
          style={({ pressed }) => [
            styles.backLink,
            {
              backgroundColor: pressed ? theme.colors.surfaceSoft : 'transparent',
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Back to Core Operations workspace"
        >
          <Icon name="ArrowLeft" size={14} color={theme.colors.textSubtle} />
          <Text style={[styles.backLinkText, { color: theme.colors.textSubtle }]}>
            All Workspaces & Modules
          </Text>
        </Pressable>

        {/* Nav Section Label matching DashboardLayout */}
        <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>
          WORKSPACE
        </Text>

        {items.map((item) => {
          const isActive = currentRoute === item.route;
          return (
            <Pressable
              key={item.id}
              onPress={() => handleSelect(item.route)}
              style={({ pressed }) => [
                styles.navItem,
                {
                  backgroundColor: isActive
                    ? theme.colors.brandSoft
                    : pressed
                    ? theme.colors.surfaceSoft
                    : 'transparent',
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <View style={styles.itemLeft}>
                <Icon
                  name={item.iconName}
                  size={18}
                  color={isActive ? activeAccent : theme.colors.textMuted}
                />
                <Text
                  style={[
                    styles.navLabel,
                    {
                      color: isActive ? activeAccent : theme.colors.textMuted,
                      fontWeight: isActive ? '600' : '500',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </View>

              {item.badge !== undefined && (
                <View
                  style={[
                    styles.itemBadge,
                    {
                      backgroundColor: isActive
                        ? activeAccent
                        : theme.colors.surfaceMuted,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color: isActive ? '#ffffff' : theme.colors.textSubtle,
                      },
                    ]}
                  >
                    {item.badge}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* User Info Card matching DashboardLayout */}
      {user ? (
        <View
          style={[
            styles.userCard,
            {
              backgroundColor: theme.colors.surfaceSoft,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text
            style={[styles.userName, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {user.name}
          </Text>
          <Text
            style={[styles.userRole, { color: activeAccent }]}
            numberOfLines={1}
          >
            {user.roleLabel}
          </Text>
          <Text
            style={[styles.workspaceNote, { color: theme.colors.textMuted }]}
            numberOfLines={1}
          >
            {workspaceNote}
          </Text>
        </View>
      ) : null}

      {/* Sign Out Footer matching DashboardLayout */}
      <View
        style={[
          styles.footer,
          {
            borderTopColor: theme.colors.border,
          },
        ]}
      >
        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [
            styles.signOutButton,
            {
              backgroundColor: pressed
                ? theme.colors.surfaceSoft
                : 'transparent',
            },
          ]}
        >
          <Icon name="LogOut" size={17} color={theme.colors.textMuted} />
          <Text style={[styles.signOutText, { color: theme.colors.textMuted }]}>
            Sign out
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    borderRightWidth: 1,
  },
  brandHeader: {
    height: 72,
    borderBottomWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  brandPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  brandText: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  brandSubtitle: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  itemList: {
    flex: 1,
  },
  itemListContent: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 3,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  navLabel: {
    fontSize: 12,
    letterSpacing: -0.1,
  },
  itemBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  userCard: {
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 3,
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
  },
  userRole: {
    fontSize: 10,
    fontWeight: '600',
  },
  workspaceNote: {
    fontSize: 10,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  signOutText: {
    fontSize: 12,
    fontWeight: '500',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    marginBottom: 8,
  },
  backLinkText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

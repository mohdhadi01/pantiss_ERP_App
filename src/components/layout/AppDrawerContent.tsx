import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Image,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { Icon, IconSource } from '../ui/Icon';
import {
  financeNavItems,
} from '../../features/finance/constants';
import { hrNavItems } from '../../features/hr/constants';
import type { NavItem } from '../../types/navigation';
import type { DrawerSection } from '../../navigation/types';

/** Sidebar item id for each Finance stack screen (Dashboard stays active on area pages). */
const FINANCE_ID_BY_SCREEN: Record<string, string> = {
  FinanceDashboard: 'dashboard',
  AreaDashboard: 'dashboard',
  Budget: 'budget',
  Books: 'books',
  Banking: 'banking',
  VendorManagement: 'vendor-management',
  Procurement: 'procurement',
  FinanceSalary: 'salary',
  Reimbursement: 'reimbursement',
  Payments: 'payments',
  Taxation: 'taxation',
  AuditTrails: 'audit-trails',
  Projects: 'projects',
  Invoices: 'invoices',
  Investments: 'investments',
  Alerts: 'alerts',
};

/** Sidebar item id for each HR stack screen. */
const HR_ID_BY_SCREEN: Record<string, string> = {
  HrDashboard: 'dashboard',
  Recruitment: 'recruitment',
  EmployeeOnboarding: 'employee-onboarding',
  ProjectAssignment: 'project-assignment',
  JobDesignations: 'job-designations',
  HrSalary: 'salary',
  Attendance: 'attendance',
  LeaveManagement: 'leave-management',
  KbiMetrics: 'kbi-metrics',
  Appraisals: 'appraisals',
};

/** Sidebar item id → Finance stack screen name. */
const FINANCE_SCREEN_BY_ID: Record<string, string> = {
  dashboard: 'FinanceDashboard',
  budget: 'Budget',
  books: 'Books',
  banking: 'Banking',
  'vendor-management': 'VendorManagement',
  procurement: 'Procurement',
  salary: 'FinanceSalary',
  reimbursement: 'Reimbursement',
  payments: 'Payments',
  taxation: 'Taxation',
  'audit-trails': 'AuditTrails',
  projects: 'Projects',
  invoices: 'Invoices',
};

/** Sidebar item id → HR stack screen name. */
const HR_SCREEN_BY_ID: Record<string, string> = {
  dashboard: 'HrDashboard',
  recruitment: 'Recruitment',
  'employee-onboarding': 'EmployeeOnboarding',
  'project-assignment': 'ProjectAssignment',
  'job-designations': 'JobDesignations',
  salary: 'HrSalary',
  attendance: 'Attendance',
  'leave-management': 'LeaveManagement',
  'kbi-metrics': 'KbiMetrics',
  appraisals: 'Appraisals',
};

export interface AppDrawerContentProps extends DrawerContentComponentProps {
  /** Which module's menu to render ('none' = public workspace). */
  section: DrawerSection;
  /** Collapsed 80px rail — icons only (web collapse toggle). */
  collapsed?: boolean;
  /** Web sidebar edge chevron — collapse/expand the permanent sidebar. */
  onToggleCollapse?: () => void;
  onClose?: () => void;
}

const itemsForSection = (section: DrawerSection): NavItem[] => {
  if (section === 'finance') return financeNavItems;
  if (section === 'hr') return hrNavItems;
  return [];
};

const subtitleForSection = (section: DrawerSection): string => {
  if (section === 'finance') return 'Finance Division';
  if (section === 'hr') return 'Human Resources';
  return 'Pantiss ERP';
};

/**
 * Root drawer content — web sidebar pattern (brand header, "All Workspaces &
 * Modules" escape, per-module menu from the shared constants, user card and
 * sign-out). Rendered by the root Drawer navigator via RootNavigator.
 */
export const AppDrawerContent: React.FC<AppDrawerContentProps> = ({
  section,
  collapsed = false,
  onToggleCollapse,
  onClose,
  state,
  navigation,
}) => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();

  const items = itemsForSection(section);
  const subtitle = subtitleForSection(section);

  const activeItemId = React.useMemo(() => {
    const drawerRoute = state.routes[state.index];
    const child = drawerRoute?.state as { index: number; routes: readonly { name: string }[] } | undefined;
    const screenName = child ? child.routes[child.index]?.name : undefined;
    if (!screenName) return undefined;
    if (section === 'finance') return FINANCE_ID_BY_SCREEN[screenName];
    if (section === 'hr') return HR_ID_BY_SCREEN[screenName];
    return undefined;
  }, [section, state]);

  const handleSelect = (item: NavItem) => {
    Haptics.selectionAsync().catch(() => {});
    const screen =
      section === 'finance'
        ? FINANCE_SCREEN_BY_ID[item.id]
        : section === 'hr'
          ? HR_SCREEN_BY_ID[item.id]
          : undefined;
    if (!screen) return;
    if (onClose) onClose();
    navigation.navigate(section === 'finance' ? 'FinanceStack' : 'HrStack', { screen });
  };

  const handleGoLanding = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (onClose) onClose();
    navigation.navigate('PublicStack', { screen: 'Landing' });
  };

  const handleSignOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (onClose) onClose();
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'PublicStack', params: { screen: 'Landing' } }],
    });
  };

  const activeAccent = section === 'hr' ? theme.colors.brandPrimary : theme.colors.financeAccent;
  const activeItemBg = section === 'hr' ? theme.colors.brandSoft : theme.colors.financeAccentSoft;
  const isFinance = section === 'finance';
  const workspaceNote = isFinance ? undefined : 'People operations · Demo';

  if (collapsed) {
    return (
      <View style={[styles.container, styles.collapsedContainer, { backgroundColor: theme.colors.moduleBg, borderRightColor: theme.colors.border }]}>
        {onToggleCollapse ? (
          <Pressable
            onPress={onToggleCollapse}
            accessibilityLabel="Expand sidebar"
            style={({ pressed }) => [
              styles.collapseToggle,
              { backgroundColor: pressed ? theme.colors.surfaceSoft : 'transparent' },
            ]}
          >
            <Icon name="ChevronRight" size={15} color={theme.colors.textMuted} />
          </Pressable>
        ) : null}
        <Pressable onPress={handleGoLanding} style={styles.collapsedBrand} accessibilityLabel="Pantiss home">
          <Image
            source={require('@/assets/images/pantiss-mark.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Pressable>
        <ScrollView
          style={styles.itemList}
          contentContainerStyle={styles.collapsedList}
          showsVerticalScrollIndicator={false}
        >
          {items.map((item) => {
            const isActive = activeItemId === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => handleSelect(item)}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: isActive }}
                style={({ pressed }) => [
                  styles.collapsedItem,
                  {
                    backgroundColor: isActive ? activeItemBg : pressed ? theme.colors.surfaceSoft : 'transparent',
                  },
                ]}
              >
                <Icon
                  name={item.iconName as IconSource}
                  size={18}
                  color={isActive ? activeAccent : theme.colors.textMuted}
                  strokeWidth={1.8}
                />
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable
          onPress={handleSignOut}
          accessibilityLabel="Sign out"
          style={({ pressed }) => [
            styles.collapsedItem,
            { backgroundColor: pressed ? theme.colors.surfaceSoft : 'transparent', marginBottom: 12 },
          ]}
        >
          <Icon name="LogOut" size={18} color={theme.colors.textMuted} strokeWidth={1.8} />
        </Pressable>
      </View>
    );
  }

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
      {/* Brand header — web h-20 block: mark + "Pantiss ERP" + division */}
      <View style={[styles.brandHeader, { borderBottomColor: theme.colors.border }]}>
        <Pressable onPress={handleGoLanding} style={styles.brandPressable} accessibilityLabel="Pantiss home">
          <Image
            source={require('@/assets/images/pantiss-mark.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.brandText}>
            <Text style={[styles.brandTitle, { color: theme.colors.text }]}>Pantiss ERP</Text>
            <Text style={[styles.brandSubtitle, { color: theme.colors.textMuted }]} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
        </Pressable>
      </View>

      <ScrollView style={styles.itemList} contentContainerStyle={styles.itemListContent} showsVerticalScrollIndicator={false}>
        <Pressable
          onPress={handleGoLanding}
          style={({ pressed }) => [
            styles.backLink,
            { backgroundColor: pressed ? theme.colors.surfaceSoft : 'transparent' },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Back to Core Operations workspace"
        >
          <Icon name="ArrowLeft" size={14} color={theme.colors.textSubtle} />
          <Text style={[styles.backLinkText, { color: theme.colors.textSubtle }]}>All Workspaces & Modules</Text>
        </Pressable>

        {items.length > 0 ? (
          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>
            {isFinance ? 'Finance Workspace' : 'WORKSPACE'}
          </Text>
        ) : null}

        {items.map((item) => {
          const isActive = activeItemId === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => handleSelect(item)}
              style={({ pressed }) => [
                styles.navItem,
                {
                  backgroundColor: isActive ? activeItemBg : pressed ? theme.colors.surfaceSoft : 'transparent',
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <View style={styles.itemLeft}>
                <Icon
                  name={item.iconName as IconSource}
                  size={18}
                  color={isActive ? activeAccent : theme.colors.textMuted}
                  strokeWidth={1.8}
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

              {item.badge !== undefined ? (
                <View
                  style={[
                    styles.itemBadge,
                    { backgroundColor: isActive ? activeAccent : theme.colors.surfaceMuted },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: isActive ? '#ffffff' : theme.colors.textSubtle }]}>
                    {item.badge}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

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
          <Text style={[styles.userName, { color: theme.colors.text }]} numberOfLines={1}>
            {user.name}
          </Text>
          <Text style={[styles.userRole, { color: activeAccent }]} numberOfLines={1}>
            {user.roleLabel}
          </Text>
          <Text style={[styles.workspaceNote, { color: theme.colors.textMuted }]} numberOfLines={1}>
            {workspaceNote}
          </Text>
        </View>
      ) : null}

      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [
            styles.signOutButton,
            { backgroundColor: pressed ? theme.colors.surfaceSoft : 'transparent' },
          ]}
        >
          <Icon name="LogOut" size={17} color={theme.colors.textMuted} />
          <Text style={[styles.signOutText, { color: theme.colors.textMuted }]}>Sign out</Text>
        </Pressable>
        {onToggleCollapse ? (
          <Pressable
            onPress={onToggleCollapse}
            accessibilityLabel="Collapse sidebar"
            hitSlop={6}
            style={({ pressed }) => [
              styles.collapseToggle,
              { backgroundColor: pressed ? theme.colors.surfaceSoft : 'transparent' },
            ]}
          >
            <Icon name="ChevronLeft" size={15} color={theme.colors.textMuted} />
          </Pressable>
        ) : null}
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
  collapsedContainer: {
    alignItems: 'center',
  },
  collapsedBrand: {
    height: 80,
    justifyContent: 'center',
  },
  collapsedList: {
    paddingVertical: 12,
    gap: 6,
    alignItems: 'center',
  },
  collapsedItem: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandHeader: {
    height: 80,
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
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  brandText: {
    flex: 1,
    minWidth: 0,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '600',
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
    fontWeight: '600',
    letterSpacing: 1.62,
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
    minWidth: 0,
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
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  collapseToggle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
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

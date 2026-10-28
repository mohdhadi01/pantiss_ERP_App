import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  ScrollView,
  BackHandler,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Drawer } from 'react-native-drawer-layout';
import { useTheme } from '../../hooks/useTheme';
import { NavItem } from '../../types/navigation';
import { DashboardHeader } from './DashboardHeader';
import { AppDrawerContent } from './AppDrawerContent';
import { ScreenWrapper } from './ScreenWrapper';
import { Icon } from '../ui/Icon';

export interface ModuleShellProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeColor?: string;
  workspaceEyebrow?: string;
  headingTitle?: string;
  footnote?: string;
  currentRoute: string;
  navItems: NavItem[];
  accentColor?: string;
  showAlerts?: boolean;
  unreadAlertsCount?: number;
  onPressAlerts?: () => void;
  notice?: string;
  error?: string;
  onDismissNotice?: () => void;
  onDismissError?: () => void;
  scrollable?: boolean;
  children: React.ReactNode;
}

export const ModuleShell: React.FC<ModuleShellProps> = ({
  title,
  subtitle,
  badgeText,
  badgeColor,
  workspaceEyebrow,
  headingTitle,
  footnote,
  currentRoute,
  navItems,
  accentColor,
  showAlerts = false,
  unreadAlertsCount = 0,
  onPressAlerts,
  notice,
  error,
  onDismissNotice,
  onDismissError,
  scrollable = true,
  children,
}) => {
  const { theme } = useTheme();
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();

  // Breakpoint: permanent sidebar on desktop/tablet, native slide drawer on mobile
  const isPermanentSidebar = windowWidth >= 880;
  const DRAWER_WIDTH = Math.min(290, windowWidth * 0.82);

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Android hardware back button closes drawer if open
  useEffect(() => {
    if (!drawerOpen) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setDrawerOpen(false);
      return true;
    });
    return () => sub.remove();
  }, [drawerOpen]);

  const handleOpenDrawer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  const handleNavigate = (route: string) => {
    setDrawerOpen(false);
    if (route !== currentRoute) {
      router.push(route as any);
    }
  };

  const activeAccent = accentColor || theme.colors.brandPrimary;
  const isHR = currentRoute.includes('(hr)');
  const defaultEyebrow = isHR
    ? 'People & culture · FY 2026–27'
    : 'Finance & treasury · FY 2026–27';
  const defaultFootnote = isHR
    ? 'Demo environment · HR changes are saved in this device. Admin decisions are sample records. Live attendance, account activation and email delivery need the employee platform connection.'
    : 'Demo environment · Institutional banking accounts, ledger books, statutory filings and voucher audit trails are simulated.';

  return (
    <ScreenWrapper scrollable={false} contentContainerStyle={styles.rootContainer}>
      <Drawer
        open={isPermanentSidebar ? true : drawerOpen}
        onOpen={handleOpenDrawer}
        onClose={handleCloseDrawer}
        drawerPosition="left"
        drawerType={isPermanentSidebar ? 'permanent' : 'front'}
        swipeEnabled={!isPermanentSidebar}
        swipeEdgeWidth={60}
        drawerStyle={[
          styles.drawerStyle,
          {
            width: isPermanentSidebar ? 260 : DRAWER_WIDTH,
            backgroundColor: theme.colors.moduleBg,
            borderColor: theme.colors.border,
          },
        ]}
        overlayStyle={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        }}
        renderDrawerContent={() => (
          <AppDrawerContent
            title={badgeText || 'WORKSPACE'}
            subtitle={title}
            items={navItems}
            currentRoute={currentRoute}
            onNavigate={handleNavigate}
            accentColor={accentColor}
            onClose={isPermanentSidebar ? undefined : handleCloseDrawer}
          />
        )}
      >
        <View style={styles.mainColumn}>
          {/* Top Header */}
          <DashboardHeader
            title={title}
            subtitle={subtitle}
            badgeText={badgeText}
            badgeColor={badgeColor}
            onOpenDrawer={isPermanentSidebar ? undefined : handleOpenDrawer}
            showAlerts={showAlerts}
            unreadAlertsCount={unreadAlertsCount}
            onPressAlerts={onPressAlerts}
          />

          {/* Notice Banner */}
          {notice ? (
            <View
              style={[
                styles.banner,
                {
                  backgroundColor: theme.colors.brandSoft,
                  borderColor: theme.colors.brandRing,
                },
              ]}
            >
              <Icon name="CheckCircle2" size={16} color={theme.colors.brandPrimary} />
              <Text style={[styles.bannerText, { color: theme.colors.text }]}>
                {notice}
              </Text>
              {onDismissNotice && (
                <Pressable onPress={onDismissNotice} hitSlop={8}>
                  <Icon name="X" size={14} color={theme.colors.textSubtle} />
                </Pressable>
              )}
            </View>
          ) : null}

          {/* Error Banner */}
          {error ? (
            <View
              style={[
                styles.banner,
                {
                  backgroundColor: theme.colors.dangerSoft,
                  borderColor: theme.colors.dangerBorder,
                },
              ]}
            >
              <Icon name="AlertTriangle" size={16} color={theme.colors.danger} />
              <Text style={[styles.bannerText, { color: theme.colors.danger }]}>
                {error}
              </Text>
              {onDismissError && (
                <Pressable onPress={onDismissError} hitSlop={8}>
                  <Icon name="X" size={14} color={theme.colors.danger} />
                </Pressable>
              )}
            </View>
          ) : null}

          {/* Workspace Scrollable Content */}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* CXO / Workspace Dashboard Heading Banner */}
            <View style={styles.dashboardHeading}>
              <View style={styles.headingLeft}>
                <Text style={[styles.eyebrow, { color: activeAccent }]}>
                  {workspaceEyebrow || defaultEyebrow}
                </Text>
                <Text style={[styles.headingTitle, { color: theme.colors.text }]}>
                  {headingTitle || (title === 'HR Dashboard' ? 'Your people, at a glance.' : title)}
                </Text>
                {subtitle ? (
                  <Text style={[styles.headingSubtitle, { color: theme.colors.textMuted }]}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>
              <View
                style={[
                  styles.readonlyBadge,
                  { borderColor: theme.colors.borderStrong },
                ]}
              >
                <Text style={[styles.readonlyText, { color: theme.colors.textSubtle }]}>
                  Demo workspace
                </Text>
              </View>
            </View>

            {/* Child View */}
            {children}

            {/* Footnote */}
            <Text style={[styles.footnote, { color: theme.colors.textSubtle }]}>
              {footnote || defaultFootnote}
            </Text>
          </ScrollView>
        </View>
      </Drawer>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    padding: 0,
    flex: 1,
  },
  layoutRow: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
  },
  permanentSidebar: {
    width: 260,
    height: '100%',
    borderRightWidth: 1,
  },
  mainColumn: {
    flex: 1,
    height: '100%',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
    gap: 20,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  dashboardHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    paddingBottom: 4,
  },
  headingLeft: {
    flex: 1,
    gap: 6,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headingTitle: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  headingSubtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
  readonlyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
  },
  readonlyText: {
    fontSize: 10,
    fontWeight: '500',
  },
  footnote: {
    fontSize: 11,
    lineHeight: 18,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  bannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  drawerStyle: {
    borderRightWidth: 1,
    elevation: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { DashboardHeader } from './DashboardHeader';
import { ScreenWrapper } from './ScreenWrapper';
import { Icon } from '../ui/Icon';

export interface ModuleShellProps {
  title: string;
  subtitle?: string;
  sidebarSubtitle?: string;
  eyebrow?: string;
  eyebrowColor?: string;
  badgeText?: string;
  badgeColor?: string;
  avatarVariant?: 'initials' | 'finance';
  workspaceEyebrow?: string;
  headingTitle?: string;
  footnote?: string;
  currentRoute: string;
  onOpenDrawer?: () => void;
  accentColor?: string;
  showAlerts?: boolean;
  unreadAlertsCount?: number;
  onPressAlerts?: () => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  notice?: string;
  error?: string;
  onDismissNotice?: () => void;
  onDismissError?: () => void;
  children: React.ReactNode;
}

export const ModuleShell: React.FC<ModuleShellProps> = ({
  title,
  subtitle,
  eyebrow,
  eyebrowColor,
  badgeText,
  badgeColor,
  avatarVariant = 'initials',
  workspaceEyebrow,
  headingTitle,
  footnote,
  currentRoute,
  onOpenDrawer,
  accentColor,
  showAlerts = false,
  unreadAlertsCount = 0,
  onPressAlerts,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  notice,
  error,
  onDismissNotice,
  onDismissError,
  children,
}) => {
  const { theme } = useTheme();
  const { isLg } = useBreakpoint();

  const isPermanentSidebar = isLg;

  const handleOpenDrawer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onOpenDrawer?.();
  };

  const isHR = currentRoute.includes('(hr)');
  const moduleAccent = accentColor ?? (isHR ? theme.colors.brandPrimary : theme.colors.financeAccent);
  const defaultEyebrow = isHR ? 'Human Resources' : 'Finance Division · FY 2026–27';
  const defaultHeadingColor = isHR ? theme.colors.brandPrimary : theme.colors.financeAccent;
  const headerEyebrow = eyebrow ?? badgeText ?? defaultEyebrow;
  const headerEyebrowColor = eyebrowColor ?? badgeColor ?? moduleAccent;
  const defaultFootnote = isHR
    ? 'Demo environment · HR changes are saved in this device. Admin decisions are sample records. Live attendance, account activation and email delivery need the employee platform connection.'
    : 'Demo environment · Institutional banking accounts, ledger books, statutory filings and voucher audit trails are simulated.';

  return (
    <ScreenWrapper scrollable={false} contentContainerStyle={styles.rootContainer}>
      <View style={styles.mainColumn}>
        <DashboardHeader
          title={title}
          subtitle={subtitle}
          eyebrow={headerEyebrow}
          eyebrowColor={headerEyebrowColor}
          avatarVariant={avatarVariant}
          onOpenDrawer={isPermanentSidebar ? undefined : handleOpenDrawer}
          showAlerts={showAlerts}
          unreadAlertsCount={unreadAlertsCount}
          onPressAlerts={onPressAlerts}
          searchPlaceholder={searchPlaceholder}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
        />

        {notice ? (
          <View
            style={[
              styles.banner,
              {
                backgroundColor: theme.colors.successSoft,
                borderColor: theme.colors.successBorder,
              },
            ]}
          >
            <Icon name="CheckCircle2" size={16} color={theme.colors.successText} />
            <Text style={[styles.bannerText, { color: theme.colors.text }]}>{notice}</Text>
            {onDismissNotice ? (
              <Pressable onPress={onDismissNotice} hitSlop={8}>
                <Icon name="X" size={14} color={theme.colors.textSubtle} />
              </Pressable>
            ) : null}
          </View>
        ) : null}

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
            <Icon name="AlertTriangle" size={16} color={theme.colors.dangerText} />
            <Text style={[styles.bannerText, { color: theme.colors.dangerText }]}>{error}</Text>
            {onDismissError ? (
              <Pressable onPress={onDismissError} hitSlop={8}>
                <Icon name="X" size={14} color={theme.colors.dangerText} />
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.dashboardHeading}>
            <View style={styles.headingLeft}>
              <Text style={[theme.fontStyles.eyebrow, styles.headingEyebrow, { color: eyebrowColor ?? defaultHeadingColor }]}>
                {workspaceEyebrow || defaultEyebrow}
              </Text>
              <Text style={[styles.headingTitle, { color: theme.colors.text }]}>
                {headingTitle || (title.includes('Dashboard') ? 'Your people, at a glance.' : title)}
              </Text>
              {subtitle ? (
                <Text style={[styles.headingSubtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text>
              ) : null}
            </View>
            <View style={[styles.readonlyBadge, { borderColor: theme.colors.borderStrong }]}>
              <Text style={[styles.readonlyText, { color: theme.colors.textSubtle }]}>Demo workspace</Text>
            </View>
          </View>

          {children}

          <Text style={[styles.footnote, { color: theme.colors.textSubtle }]}>{footnote || defaultFootnote}</Text>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    padding: 0,
    flex: 1,
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
    maxWidth: 1600,
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
    minWidth: 0,
  },
  headingEyebrow: {
    fontSize: 9,
  },
  headingTitle: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -1.1,
    lineHeight: 30,
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
    borderTopColor: 'rgba(128, 144, 168, 0.14)',
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
});

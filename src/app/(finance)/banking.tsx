import React from 'react';
import { useRouter } from 'expo-router';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { financeNavItems, financeSectionTitles, financeSectionDescriptions } from '../../features/finance/constants';
import { useFinanceAlerts } from '../../features/finance/data/alertsStore';
import { BankingView } from '../../features/finance/components/BankingView';

export default function BankingViewScreen() {
  const router = useRouter();
  const alerts = useFinanceAlerts();

  return (
    <ModuleShell
      title={financeSectionTitles['banking']}
      subtitle={financeSectionDescriptions['banking']}
      currentRoute="/(finance)/banking"
      navItems={financeNavItems}
      avatarVariant="finance"
      searchPlaceholder="Search financial records"
      showAlerts
      unreadAlertsCount={alerts.unreadCount}
      onPressAlerts={() => router.push('/(finance)/alerts')}
    >
      <BankingView />
    </ModuleShell>
  );
}

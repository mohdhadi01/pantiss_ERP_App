import React from 'react';
import { useRouter } from 'expo-router';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { financeNavItems, financeSectionTitles, financeSectionDescriptions } from '../../features/finance/constants';
import { useFinanceAlerts } from '../../features/finance/data/alertsStore';
import { InvestmentsView } from '../../features/finance/components/InvestmentsView';

export default function InvestmentsViewScreen() {
  const router = useRouter();
  const alerts = useFinanceAlerts();

  return (
    <ModuleShell
      title={financeSectionTitles['investments']}
      subtitle={financeSectionDescriptions['investments']}
      currentRoute="/(finance)/investments"
      navItems={financeNavItems}
      avatarVariant="finance"
      searchPlaceholder="Search financial records"
      showAlerts
      unreadAlertsCount={alerts.unreadCount}
      onPressAlerts={() => router.push('/(finance)/alerts')}
    >
      <InvestmentsView />
    </ModuleShell>
  );
}

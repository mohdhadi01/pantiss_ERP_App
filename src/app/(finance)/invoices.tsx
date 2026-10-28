import React from 'react';
import { useRouter } from 'expo-router';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { financeNavItems, financeSectionTitles, financeSectionDescriptions } from '../../features/finance/constants';
import { useFinanceAlerts } from '../../features/finance/data/alertsStore';
import { InvoicesView } from '../../features/finance/components/InvoicesView';

export default function InvoicesViewScreen() {
  const router = useRouter();
  const alerts = useFinanceAlerts();

  return (
    <ModuleShell
      title={financeSectionTitles['invoices']}
      subtitle={financeSectionDescriptions['invoices']}
      currentRoute="/(finance)/invoices"
      navItems={financeNavItems}
      avatarVariant="finance"
      searchPlaceholder="Search financial records"
      showAlerts
      unreadAlertsCount={alerts.unreadCount}
      onPressAlerts={() => router.push('/(finance)/alerts')}
    >
      <InvoicesView />
    </ModuleShell>
  );
}

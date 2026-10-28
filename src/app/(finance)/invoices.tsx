import React from 'react';
import { useRouter } from 'expo-router';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { financeNavItems, financeSectionDescriptions } from '../../features/finance/constants';
import { InvoicesView } from '../../features/finance/components/InvoicesView';

export default function InvoicesScreen() {
  const router = useRouter();

  return (
    <ModuleShell
      title="Invoices & Claims"
      subtitle={financeSectionDescriptions.invoices}
      badgeText="FINANCE CONTROLLER"
      badgeColor="#10b981"
      currentRoute="/(finance)/invoices"
      navItems={financeNavItems}
      accentColor="#10b981"
      showAlerts
      unreadAlertsCount={3}
      onPressAlerts={() => router.push('/(finance)/alerts')}
    >
      <InvoicesView />
    </ModuleShell>
  );
}

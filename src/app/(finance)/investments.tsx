import React from 'react';
import { useRouter } from 'expo-router';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { financeNavItems, financeSectionDescriptions } from '../../features/finance/constants';
import { InvestmentsView } from '../../features/finance/components/InvestmentsView';

export default function InvestmentsScreen() {
  const router = useRouter();

  return (
    <ModuleShell
      title="Investments & Yields"
      subtitle={financeSectionDescriptions.investments}
      badgeText="FINANCE CONTROLLER"
      badgeColor="#10b981"
      currentRoute="/(finance)/investments"
      navItems={financeNavItems}
      accentColor="#10b981"
      showAlerts
      unreadAlertsCount={3}
      onPressAlerts={() => router.push('/(finance)/alerts')}
    >
      <InvestmentsView />
    </ModuleShell>
  );
}

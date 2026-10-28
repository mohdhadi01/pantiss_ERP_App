import React from 'react';
import { useRouter } from 'expo-router';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { financeNavItems, financeSectionDescriptions } from '../../features/finance/constants';
import { FinanceDashboard } from '../../features/finance/components/FinanceDashboard';

export default function FinanceDashboardScreen() {
  const router = useRouter();

  return (
    <ModuleShell
      title="Finance Portfolio"
      subtitle={financeSectionDescriptions.dashboard}
      badgeText="FINANCE CONTROLLER"
      badgeColor="#10b981"
      currentRoute="/(finance)/dashboard"
      navItems={financeNavItems}
      accentColor="#10b981"
      showAlerts
      unreadAlertsCount={3}
      onPressAlerts={() => router.push('/(finance)/alerts')}
    >
      <FinanceDashboard />
    </ModuleShell>
  );
}

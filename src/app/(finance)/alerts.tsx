import React from 'react';
import { useRouter } from 'expo-router';
import { ModuleShell } from '../../components/layout/ModuleShell';
import { financeNavItems, financeSectionDescriptions } from '../../features/finance/constants';
import { AlertsView } from '../../features/finance/components/AlertsView';

export default function AlertsScreen() {
  const router = useRouter();

  return (
    <ModuleShell
      title="Financial Alerts"
      subtitle={financeSectionDescriptions.alerts}
      badgeText="FINANCE CONTROLLER"
      badgeColor="#10b981"
      currentRoute="/(finance)/alerts"
      navItems={financeNavItems}
      accentColor="#10b981"
      showAlerts
      unreadAlertsCount={3}
      onPressAlerts={() => {}}
    >
      <AlertsView />
    </ModuleShell>
  );
}
